import { NextRequest, NextResponse } from "next/server";
import { captureBookingPayment } from "@/lib/payment-capture";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "");
    const bookingId = String(body.bookingId ?? "");

    if (!orderId || !bookingId) {
      return NextResponse.json({ error: "Missing payment verification payload." }, { status: 400 });
    }

    const result = await captureBookingPayment(orderId, bookingId);
    if (!result.ok) {
      const status = result.error.includes("not found") ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true, alreadyCaptured: result.alreadyCaptured });
  } catch (error) {
    console.error("verify booking payment error", error);
    return NextResponse.json({ error: "Unable to verify booking payment." }, { status: 500 });
  }
}
