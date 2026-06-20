import { NextResponse } from "next/server";
import { sendConsultationReminders } from "@/lib/cron/consultationReminders";

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
    const result = await sendConsultationReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("consultation reminders cron failed", error);
    return NextResponse.json({ error: "Unable to send consultation reminders." }, { status: 500 });
  }
}
