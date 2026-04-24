import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCashfreeOrder } from "@/lib/cashfree";

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

    const updateResult = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        cashfreeOrderId: orderId,
      },
      data: {
        payStatus: "CAPTURED",
        cashfreePaymentId: order.order_id,
      },
    });

    if (!updateResult.count) {
      return NextResponse.json({ error: "Booking not found for this payment." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("verify booking payment error", error);
    return NextResponse.json({ error: "Unable to verify booking payment." }, { status: 500 });
  }
}
