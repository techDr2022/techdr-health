import { NextResponse } from "next/server";
import { sendWeeklyDoctorPayoutSummary } from "@/lib/cron/sendWeeklyDoctorPayoutSummary";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const provided = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await sendWeeklyDoctorPayoutSummary();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("weekly doctor payout summary cron failed", error);
    return NextResponse.json(
      { error: "Unable to process weekly doctor payouts." },
      { status: 500 }
    );
  }
}
