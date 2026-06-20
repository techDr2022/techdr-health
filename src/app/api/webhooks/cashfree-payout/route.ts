import { NextRequest, NextResponse } from "next/server";
import { applyCashfreePayoutWebhook } from "@/lib/doctor-payouts";

export const dynamic = "force-dynamic";

type PayoutWebhookPayload = {
  type?: string;
  data?: {
    transfer?: {
      transferId?: string;
      referenceId?: string;
      status?: string;
    };
  };
  transferId?: string;
  referenceId?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CASHFREE_PAYOUT_WEBHOOK_SECRET?.trim();
    if (secret) {
      const provided = req.headers.get("x-payout-webhook-secret");
      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = (await req.json()) as PayoutWebhookPayload;
    const transferId =
      payload.transferId ||
      payload.data?.transfer?.transferId ||
      payload.data?.transfer?.referenceId ||
      "";
    const status =
      payload.status || payload.data?.transfer?.status || payload.type || "";
    const referenceId = payload.referenceId || payload.data?.transfer?.referenceId;

    if (!transferId || !status) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const result = await applyCashfreePayoutWebhook({
      transferId,
      status,
      referenceId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("cashfree payout webhook error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
