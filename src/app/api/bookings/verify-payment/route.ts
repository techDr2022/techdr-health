import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.razorpay_order_id ?? "");
    const paymentId = String(body.razorpay_payment_id ?? "");
    const signature = String(body.razorpay_signature ?? "");
    const bookingId = String(body.bookingId ?? "");

    if (!orderId || !paymentId || !signature || !bookingId) {
      return NextResponse.json({ error: "Missing payment verification payload." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay secret is not configured." }, { status: 500 });
    }

    const generated = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    if (generated !== signature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const updateResult = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        razorpayOrderId: orderId,
      },
      data: {
        payStatus: "CAPTURED",
        razorpayPaymentId: paymentId,
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
