import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import {
  capturePaymentByOrderId,
  markBookingPaymentFailed,
} from "@/lib/payment-capture";

type CashfreeWebhookPayload = {
  type?: string;
  data?: {
    order?: { order_id?: string };
    payment?: { cf_payment_id?: string };
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

    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const result = await capturePaymentByOrderId(orderId);
      if (!result.ok) {
        console.warn("cashfree webhook capture skipped", { orderId, error: result.error });
      }
      return NextResponse.json({ ok: true, result });
    }

    if (eventType === "PAYMENT_FAILED_WEBHOOK") {
      await markBookingPaymentFailed(orderId);
      return NextResponse.json({ ok: true, failed: true });
    }

    return NextResponse.json({ ok: true, ignored: true, eventType });
  } catch (error) {
    console.error("cashfree webhook error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
