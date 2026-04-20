import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calculateDoctorPayout } from "@/lib/plans";
import { getRazorpayClient } from "@/lib/razorpay";
import { sendBookingConfirmedEmail } from "@/lib/email";

async function getOrCreateGuestPatient(id: string) {
  if (id && id !== "guest_patient") {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (existing) return existing;
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
    const scheduledAt = String(body.scheduledAt ?? "");
    const consultationType = "VIDEO";
    const patientId = String(body.patientId ?? "guest_patient");

    if (!doctorId || !scheduledAt) {
      return NextResponse.json(
        { error: "doctorId and scheduledAt are required." },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: { select: { email: true } } },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const fee = calculateDoctorPayout(doctor.consultFee);
    const razorpay = getRazorpayClient();
    const patient = await getOrCreateGuestPatient(patientId);
    const scheduledDate = new Date(scheduledAt);

    const order = await razorpay.orders.create({
      amount: fee.totalPatientPays * 100,
      currency: "INR",
      notes: {
        doctorId,
        consultationType,
        platformFee: String(fee.platformFee),
        doctorPayout: String(fee.doctorPayout),
      },
    });

    const booking = await prisma.booking.create({
      data: {
        patientId: patient.id,
        doctorId,
        scheduledAt: scheduledDate,
        endsAt: addMinutes(scheduledDate, doctor.consultDuration),
        consultType: "VIDEO",
        consultFee: doctor.consultFee,
        platformFeeINR: fee.platformFee,
        doctorPayoutINR: fee.doctorPayout,
        gstINR: fee.gstOnPlatformFee,
        totalPatientPays: fee.totalPatientPays,
        razorpayOrderId: order.id,
      },
      select: { id: true, razorpayOrderId: true, totalPatientPays: true },
    });

    if (doctor.user.email) {
      await sendBookingConfirmedEmail(doctor.user.email, {
        patientId,
        scheduledAt: scheduledDate,
        consultationType,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      bookingId: booking.id,
      amount: fee.totalPatientPays,
      feeBreakdown: fee,
    });
  } catch (error) {
    console.error("booking order error", error);
    return NextResponse.json(
      { error: "Unable to create booking order." },
      { status: 500 }
    );
  }
}
