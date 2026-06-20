import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { activatePatientHealthPassPayment } from "@/lib/payment-capture";

type CashfreeWebhookPayload = {
  type?: string;
  data?: {
    order?: { order_id?: string };
  };
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") ?? "";
    const timestamp = req.headers.get("x-webhook-timestamp") ?? "";

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing webhook signature headers." }, { status: 400 });
    }

    if (!verifyCashfreeWebhookSignature({ rawBody, signature, timestamp })) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as CashfreeWebhookPayload;
    const eventType = payload.type ?? "";
    const orderId = payload.data?.order?.order_id ?? "";

    if (!orderId || !orderId.startsWith("psub_")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const result = await activatePatientHealthPassPayment(orderId);
      if (!result.ok) {
        console.warn("health pass webhook capture skipped", { orderId, error: result.error });
      }
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ ok: true, ignored: true, eventType });
  } catch (error) {
    console.error("cashfree patient sub webhook error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
