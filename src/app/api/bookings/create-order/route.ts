import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { auth } from "@/auth";
import { formatFamilyRelation } from "@/lib/family-members";
import { prisma } from "@/lib/prisma";
import { calculateDoctorPayout } from "@/lib/plans";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";
import { getSiteUrl } from "@/lib/site-config";
import { getClientIp } from "@/lib/request-ip";
import { isFirstConsultWithDoctor } from "@/lib/booking-consult-context";
import { resolveHealthPassBookingPricing } from "@/lib/patient-health-pass-db";
import { applySurgeToFee } from "@/lib/pricing";
import { resolveSurgePricingForDoctor } from "@/lib/pricing-server";
import { getConsultFeeForType, parseConsultType } from "@/lib/consult-fee";
import { applySecondOpinionSurcharge } from "@/lib/second-opinion";
import { validateSecondOpinionBooking } from "@/lib/second-opinion-server";
import type { ConsultType } from "@prisma/client";

function normalizePhone(raw: string) {
  if (!raw || raw.includes("@")) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 20) return "";
  return digits;
}

async function resolveSafePhone(input: {
  phone?: string;
  currentUserId?: string;
  currentEmail?: string;
}) {
  const original = (input.phone || "").trim();
  const normalized = normalizePhone(original);
  if (!normalized) {
    if (original) {
      console.warn("booking:create-order dropped invalid phone value", {
        phone: original,
        currentUserId: input.currentUserId || null,
        currentEmail: input.currentEmail || null,
      });
    }
    return null;
  }

  const phoneOwner = await prisma.user.findUnique({
    where: { phone: normalized },
    select: { id: true, email: true },
  });

  if (!phoneOwner) return normalized;
  if (input.currentUserId && phoneOwner.id === input.currentUserId) return normalized;
  if (input.currentEmail && phoneOwner.email === input.currentEmail) return normalized;
  console.warn("booking:create-order dropped phone due to unique collision", {
    phone: normalized,
    ownerUserId: phoneOwner.id,
    ownerEmail: phoneOwner.email,
    currentUserId: input.currentUserId || null,
    currentEmail: input.currentEmail || null,
  });
  return null;
}

async function getOrCreatePatient(input: {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  const id = (input.id || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();

  if (id && id !== "guest_patient") {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (existing) {
      const safePhone = await resolveSafePhone({
        phone,
        currentUserId: existing.id,
        currentEmail: existing.email,
      });
      if (name || phone) {
        return prisma.user.update({
          where: { id: existing.id },
          data: {
            ...(name ? { name } : {}),
            ...(safePhone ? { phone: safePhone } : {}),
          },
        });
      }
      return existing;
    }
  }

  if (email) {
    const safePhone = await resolveSafePhone({
      phone,
      currentEmail: email,
    });
    return prisma.user.upsert({
      where: { email },
      update: {
        ...(name ? { name } : {}),
        ...(safePhone ? { phone: safePhone } : {}),
      },
      create: {
        email,
        passwordHash: "",
        role: "PATIENT",
        name: name || "Patient",
        phone: safePhone,
        isVerified: false,
        authProvider: "email",
      },
    });
  }

  const guestEmail = "guest_patient@techdrhealth.local";
  return prisma.user.upsert({
    where: { email: guestEmail },
    update: {},
    create: {
      email: guestEmail,
      passwordHash: "",
      role: "PATIENT",
      name: "Guest Patient",
      isVerified: false,
      authProvider: "email",
    },
  });
}

function parseLabReportUrls(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => /^https?:\/\//i.test(item))
    .slice(0, 5);
}

function buildBookingNotes(input: {
  concern?: string;
  labReportUrls: string[];
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  accountHolderName?: string;
}) {
  const lines: string[] = [];
  if (input.beneficiaryName && input.beneficiaryRelation) {
    lines.push(
      `Consult for: ${input.beneficiaryName} (${formatFamilyRelation(input.beneficiaryRelation)})`
    );
    if (input.accountHolderName) {
      lines.push(`Booked by: ${input.accountHolderName}`);
    }
  }
  const concern = (input.concern || "").trim();
  if (concern) {
    lines.push(`Chief complaint: ${concern}`);
  }
  if (input.labReportUrls.length > 0) {
    lines.push("Lab reports:");
    for (const reportUrl of input.labReportUrls) {
      lines.push(`- ${reportUrl}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth();
    const doctorId = String(body.doctorId ?? "");
    const doctorSlug = String(body.doctorSlug ?? "");
    const scheduledAt = String(body.scheduledAt ?? "");
    const consultationType = parseConsultType(body.consultationType ?? body.consultType);
    const patientId =
      session?.user?.role === "PATIENT"
        ? session.user.id
        : String(body.patientId ?? "guest_patient");
    const patientName = String(body.patientName ?? "");
    const patientEmail = String(body.patientEmail ?? "");
    const patientPhone = String(body.patientPhone ?? "");
    const concern = String(body.concern ?? "");
    const labReportUrls = parseLabReportUrls(body.labReportUrls);
    const consentGiven = body.consentGiven === true;
    const familyMemberId = String(body.familyMemberId ?? "").trim();
    const secondOpinionForBookingId = String(body.secondOpinionForBookingId ?? "").trim();

    if ((!doctorId && !doctorSlug) || !scheduledAt) {
      return NextResponse.json(
        { error: "doctorId (or doctorSlug) and scheduledAt are required." },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: "Telemedicine consent is required before booking." },
        { status: 400 }
      );
    }

    let familyMember: { id: string; name: string; relation: string } | null = null;
    if (familyMemberId) {
      if (session?.user?.role !== "PATIENT") {
        return NextResponse.json(
          { error: "Sign in to book for a family member." },
          { status: 401 }
        );
      }
      familyMember = await prisma.familymember.findFirst({
        where: { id: familyMemberId, userid: session.user.id },
        select: { id: true, name: true, relation: true },
      });
      if (!familyMember) {
        return NextResponse.json({ error: "Family member not found." }, { status: 404 });
      }
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: doctorId ? { id: doctorId } : { slug: doctorSlug },
      include: { user: { select: { email: true } } },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const isSecondOpinion = Boolean(secondOpinionForBookingId);
    if (isSecondOpinion) {
      if (session?.user?.role !== "PATIENT") {
        return NextResponse.json(
          { error: "Sign in as a patient to request a second opinion." },
          { status: 401 }
        );
      }
      const validation = await validateSecondOpinionBooking({
        patientId: session.user.id,
        originalBookingId: secondOpinionForBookingId,
        newDoctorId: doctor.id,
      });
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const patient = await getOrCreatePatient({
      id: patientId,
      name: familyMember ? undefined : patientName,
      email: patientEmail || session?.user?.email || undefined,
      phone: patientPhone,
    });

    const scheduledDate = new Date(scheduledAt);
    const surge = await resolveSurgePricingForDoctor(doctor.id, scheduledDate);

    let baseConsultFee = applySurgeToFee(
      getConsultFeeForType(doctor.consultFee, consultationType as ConsultType),
      surge.multiplier
    );
    baseConsultFee = applySecondOpinionSurcharge(baseConsultFee, isSecondOpinion);

    const healthPassPricing = await resolveHealthPassBookingPricing({
      patientId: patient.id,
      consultFee: baseConsultFee,
      consultType: consultationType as ConsultType,
    });
    const discountedConsultFee = healthPassPricing.consultFee;
    const healthPassDiscountINR = baseConsultFee - discountedConsultFee;
    const fee = calculateDoctorPayout(discountedConsultFee);
    const firstConsult = await isFirstConsultWithDoctor(patient.id, doctor.id);
    const orderId = `bkg_${Date.now()}_${patient.id.slice(0, 8)}`;
    const consentTimestamp = new Date();
    const consentIp = getClientIp(req);
    const order = await createCashfreeOrder({
      orderId,
      amount: fee.totalPatientPays,
      customerId: patient.id,
      customerName: patient.name || "Patient",
      customerEmail: patient.email,
      customerPhone: patient.phone || patientPhone || "9999999999",
      returnUrl: `${getSiteUrl()}/book/payment`,
      notes: {
        doctorId: doctor.id,
        consultationType,
        platformFee: String(fee.platformFee),
        doctorPayout: String(fee.doctorPayout),
      },
    });

    const booking = await prisma.booking.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: scheduledDate,
        endsAt: addMinutes(scheduledDate, CONSULTATION_SLOT_MINUTES),
        consultType: consultationType as ConsultType,
        consultFee: discountedConsultFee,
        platformFeeINR: fee.platformFee,
        doctorPayoutINR: fee.doctorPayout,
        gstINR: fee.gstOnPlatformFee,
        totalPatientPays: fee.totalPatientPays,
        cashfreeOrderId: order.order_id,
        familymemberid: familyMember?.id ?? null,
        notes: buildBookingNotes({
          concern,
          labReportUrls,
          beneficiaryName: familyMember?.name,
          beneficiaryRelation: familyMember?.relation,
          accountHolderName: familyMember ? patient.name : undefined,
        }),
        consentgiven: true,
        consenttimestamp: consentTimestamp,
        consentip: consentIp,
        isfirstconsult: firstConsult,
        healthpassapplied: healthPassPricing.healthPassApplied,
        healthpassdiscountinr: healthPassDiscountINR,
        issecondopinion: isSecondOpinion,
        secondopinionforbookingid: isSecondOpinion ? secondOpinionForBookingId : null,
        surgemultiplier: surge.multiplier > 1 ? surge.multiplier : null,
      },
      select: { id: true, cashfreeOrderId: true, totalPatientPays: true },
    });

    return NextResponse.json({
      orderId: order.order_id,
      bookingId: booking.id,
      amount: order.order_amount,
      currency: order.order_currency,
      paymentSessionId: order.payment_session_id,
      cashfreeMode: getCashfreeMode(),
      totalPatientPays: fee.totalPatientPays,
      feeBreakdown: fee,
      healthPass: healthPassPricing.healthPassApplied
        ? {
            plan: healthPassPricing.healthPassPlan,
            discountPercent: healthPassPricing.discountPercent,
            savedINR: healthPassDiscountINR,
          }
        : null,
      isSecondOpinion,
      surge: surge.multiplier > 1 ? { multiplier: surge.multiplier, reasons: surge.reasons } : null,
    });
  } catch (error) {
    console.error("booking order error", error);
    const message = error instanceof Error ? error.message : "Unable to create booking order.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
