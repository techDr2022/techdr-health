import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCashfreeOrder } from "@/lib/cashfree";
import { sendBookingStatusUpdateEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "");
    const bookingId = String(body.bookingId ?? "");

    if (!orderId || !bookingId) {
      return NextResponse.json({ error: "Missing payment verification payload." }, { status: 400 });
    }

    const order = await fetchCashfreeOrder(orderId);
    if (order.order_status !== "PAID") {
      return NextResponse.json({ error: "Payment is not completed yet." }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        cashfreeOrderId: orderId,
      },
      include: {
        patient: { select: { email: true, name: true } },
        doctor: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found for this payment." }, { status: 404 });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        payStatus: "CAPTURED",
        cashfreePaymentId: order.order_id,
      },
    });

    const siteUrl = getSiteUrl();
    const joinUrl = `${siteUrl}/consultation/${booking.id}/waiting`;
    const scheduleText = booking.scheduledAt.toLocaleString("en-IN");
    const doctorName = booking.doctor.displayName;
    const patientName = booking.patient.name || "Patient";

    const patientEmailPromise = booking.patient.email
      ? sendBookingStatusUpdateEmail(booking.patient.email, {
          audience: "patient",
          status: "CONFIRMED",
          doctorName,
          patientName,
          scheduledAt: scheduleText,
          joinUrl,
        })
      : Promise.resolve();

    const doctorEmailPromise = booking.doctor.user.email
      ? sendBookingStatusUpdateEmail(booking.doctor.user.email, {
          audience: "doctor",
          status: "CONFIRMED",
          doctorName,
          patientName,
          scheduledAt: scheduleText,
          joinUrl,
        })
      : Promise.resolve();

    await Promise.allSettled([patientEmailPromise, doctorEmailPromise]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("verify booking payment error", error);
    return NextResponse.json({ error: "Unable to verify booking payment." }, { status: 500 });
  }
}
