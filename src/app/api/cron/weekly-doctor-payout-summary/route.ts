import { NextResponse } from "next/server";
import { sendWeeklyDoctorPayoutSummary } from "@/lib/cron/sendWeeklyDoctorPayoutSummary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await sendWeeklyDoctorPayoutSummary();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("weekly doctor payout summary cron failed", error);
    return NextResponse.json(
      { error: "Unable to send weekly doctor payout summary." },
      { status: 500 }
    );
  }
}
