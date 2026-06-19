// AI-POWERED
import { NextResponse } from "next/server";
import { sendHealthNudges } from "@/lib/cron/healthNudges";

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
    const result = await sendHealthNudges();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("health nudges cron failed", error);
    return NextResponse.json({ error: "Unable to process health nudges." }, { status: 500 });
  }
}
