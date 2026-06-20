import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActivePatientHealthPass } from "@/lib/patient-health-pass-db";
import { HEALTH_PASS_PLANS } from "@/lib/patient-health-pass";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pass = await getActivePatientHealthPass(session.user.id);
  const planConfig = pass ? HEALTH_PASS_PLANS[pass.plan] : null;

  return NextResponse.json({
    active: Boolean(pass),
    plan: pass?.plan ?? null,
    status: pass?.status ?? null,
    startDate: pass?.startdate.toISOString() ?? null,
    endDate: pass?.enddate.toISOString() ?? null,
    videoConsultsUsed: pass?.videoconsultsused ?? 0,
    videoConsultQuota: planConfig?.videoConsultQuota ?? null,
    discountPercent: planConfig?.discountPercent ?? 0,
    planName: planConfig?.name ?? null,
  });
}
