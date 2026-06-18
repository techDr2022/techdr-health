import { NextRequest, NextResponse } from "next/server";
import { activateSubscriptionPayment } from "@/lib/payment-capture";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "");
    const doctorId = String(body.applicationId ?? body.doctorId ?? "");

    if (!orderId || !doctorId) {
      return NextResponse.json(
        { error: "Missing payment verification payload." },
        { status: 400 }
      );
    }

    const result = await activateSubscriptionPayment(orderId, doctorId);
    if (!result.ok) {
      const status = result.error.includes("not found") ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true, alreadyActive: result.alreadyActive });
  } catch (error) {
    console.error("verify payment error", error);
    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}
