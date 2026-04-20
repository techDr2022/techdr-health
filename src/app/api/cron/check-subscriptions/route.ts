import { NextResponse } from "next/server";
import { checkExpiringSubscriptions } from "@/lib/cron/checkSubscriptions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkExpiringSubscriptions();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("check subscriptions cron failed", error);
    return NextResponse.json(
      { error: "Unable to process subscriptions." },
      { status: 500 }
    );
  }
}
