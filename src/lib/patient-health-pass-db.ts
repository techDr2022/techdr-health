import { prisma } from "@/lib/prisma";
import {
  applyHealthPassDiscount,
  getHealthPassDiscountPercent,
  isHealthPassActive,
  type ActiveHealthPass,
  type HealthPassPlanId,
} from "@/lib/patient-health-pass";

export async function expireStalePatientSubscriptions(userId?: string) {
  await prisma.patientsubscription.updateMany({
    where: {
      status: "ACTIVE",
      enddate: { lt: new Date() },
      ...(userId ? { userid: userId } : {}),
    },
    data: { status: "EXPIRED" },
  });
}

export async function getActivePatientHealthPass(userId: string): Promise<ActiveHealthPass | null> {
  await expireStalePatientSubscriptions(userId);

  const pass = await prisma.patientsubscription.findUnique({
    where: { userid: userId },
  });

  if (!isHealthPassActive(pass)) return null;

  return {
    id: pass.id,
    plan: pass.plan as HealthPassPlanId,
    status: pass.status,
    startdate: pass.startdate!,
    enddate: pass.enddate!,
    videoconsultsused: pass.videoconsultsused,
  };
}

export async function resolveHealthPassBookingPricing(input: {
  patientId: string;
  consultFee: number;
  consultType: "VIDEO" | "AUDIO" | "CHAT";
}) {
  const pass = await getActivePatientHealthPass(input.patientId);
  if (!pass) {
    return {
      consultFee: input.consultFee,
      discountPercent: 0,
      healthPassApplied: false,
      healthPassPlan: null as HealthPassPlanId | null,
    };
  }

  const discountPercent = getHealthPassDiscountPercent(
    pass.plan,
    input.consultType,
    pass.videoconsultsused
  );
  const consultFee = applyHealthPassDiscount(input.consultFee, discountPercent);

  return {
    consultFee,
    discountPercent,
    healthPassApplied: discountPercent > 0,
    healthPassPlan: pass.plan,
  };
}

export async function incrementHealthPassVideoUsage(userId: string) {
  const pass = await prisma.patientsubscription.findUnique({
    where: { userid: userId },
    select: { id: true, status: true, enddate: true, plan: true },
  });
  if (!pass || pass.status !== "ACTIVE" || !pass.enddate || pass.enddate.getTime() <= Date.now()) {
    return;
  }
  if (pass.plan !== "BASIC") return;

  await prisma.patientsubscription.update({
    where: { id: pass.id },
    data: { videoconsultsused: { increment: 1 } },
  });
}
