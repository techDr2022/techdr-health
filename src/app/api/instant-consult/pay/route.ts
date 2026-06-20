import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { getSiteUrl } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { bookingId?: string };
    const bookingId = String(body.bookingId ?? "").trim();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { patient: true },
    });

    if (!booking || booking.patientId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (!booking.isinstantconsult) {
      return NextResponse.json({ error: "Not an instant consult booking." }, { status: 400 });
    }
    if (booking.payStatus === "CAPTURED") {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        waitingRoomUrl: `/consultation/${booking.id}/waiting`,
      });
    }

    const orderId = booking.cashfreeOrderId || `bkg_${Date.now()}_${booking.patientId.slice(0, 8)}`;
    const order = await createCashfreeOrder({
      orderId,
      amount: booking.totalPatientPays,
      customerId: booking.patientId,
      customerName: booking.patient.name || "Patient",
      customerEmail: booking.patient.email,
      customerPhone: booking.patient.phone || "9999999999",
      returnUrl: `${getSiteUrl()}/instant-consult?paid=${booking.id}`,
      notes: {
        bookingId: booking.id,
        instantConsult: "true",
      },
    });

    if (!booking.cashfreeOrderId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { cashfreeOrderId: order.order_id },
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      cashfreeMode: getCashfreeMode(),
      waitingRoomUrl: `/consultation/${booking.id}/waiting`,
    });
  } catch (error) {
    console.error("instant-consult pay error", error);
    return NextResponse.json({ error: "Unable to start payment." }, { status: 500 });
  }
}
