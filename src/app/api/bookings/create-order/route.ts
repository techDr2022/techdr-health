import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calculateDoctorPayout } from "@/lib/plans";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doctorId = String(body.doctorId ?? "");
    const doctorSlug = String(body.doctorSlug ?? "");
    const scheduledAt = String(body.scheduledAt ?? "");
    const consultationType = "VIDEO";
    const patientId = String(body.patientId ?? "guest_patient");
    const patientName = String(body.patientName ?? "");
    const patientEmail = String(body.patientEmail ?? "");
    const patientPhone = String(body.patientPhone ?? "");

    if ((!doctorId && !doctorSlug) || !scheduledAt) {
      return NextResponse.json(
        { error: "doctorId (or doctorSlug) and scheduledAt are required." },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: doctorId ? { id: doctorId } : { slug: doctorSlug },
      include: { user: { select: { email: true } } },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const fee = calculateDoctorPayout(doctor.consultFee);
    const patient = await getOrCreatePatient({
      id: patientId,
      name: patientName,
      email: patientEmail,
      phone: patientPhone,
    });
    const scheduledDate = new Date(scheduledAt);
    const orderId = `bkg_${Date.now()}_${patient.id.slice(0, 8)}`;
    const order = await createCashfreeOrder({
      orderId,
      amount: fee.totalPatientPays,
      customerId: patient.id,
      customerName: patient.name || "Patient",
      customerEmail: patient.email,
      customerPhone: patient.phone || patientPhone || "9999999999",
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/consult/payment`,
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
        consultType: "VIDEO",
        consultFee: doctor.consultFee,
        platformFeeINR: fee.platformFee,
        doctorPayoutINR: fee.doctorPayout,
        gstINR: fee.gstOnPlatformFee,
        totalPatientPays: fee.totalPatientPays,
        cashfreeOrderId: order.order_id,
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
