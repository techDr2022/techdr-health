export type HealthPassPlanId = "BASIC" | "PREMIUM";

export const HEALTH_PASS_PLANS = {
  BASIC: {
    id: "BASIC" as const,
    name: "Health Pass Basic",
    priceINR: 199,
    durationDays: 30,
    discountPercent: 10,
    videoConsultQuota: 2,
    tagline: "2 video consults · unlimited chat guidance",
    features: [
      "2 video consultations per month",
      "10% off all consultation fees",
      "Unlimited chat with care team",
      "Lab report AI insights",
      "Priority email support",
    ],
  },
  PREMIUM: {
    id: "PREMIUM" as const,
    name: "Health Pass Premium",
    priceINR: 499,
    durationDays: 30,
    discountPercent: 20,
    videoConsultQuota: null as number | null,
    tagline: "Unlimited video · priority queue · full AI suite",
    features: [
      "Unlimited video consultations",
      "20% off all consultation fees",
      "Priority booking queue",
      "Lab report AI analysis",
      "Symptom checker priority",
      "Family add-on ready",
    ],
  },
} as const;

export type ActiveHealthPass = {
  id: string;
  plan: HealthPassPlanId;
  status: string;
  startdate: Date;
  enddate: Date;
  videoconsultsused: number;
};

export function normalizeHealthPassPlan(input: string): HealthPassPlanId | null {
  const upper = input.trim().toUpperCase();
  if (upper === "BASIC" || upper === "PREMIUM") return upper;
  return null;
}

export function getHealthPassDiscountPercent(
  plan: HealthPassPlanId,
  consultType: "VIDEO" | "AUDIO" | "CHAT",
  videoConsultsUsed: number
): number {
  const config = HEALTH_PASS_PLANS[plan];
  if (plan === "BASIC" && consultType === "VIDEO" && videoConsultsUsed >= config.videoConsultQuota!) {
    return 0;
  }
  return config.discountPercent;
}

export function applyHealthPassDiscount(consultFee: number, discountPercent: number): number {
  if (discountPercent <= 0) return consultFee;
  return Math.max(Math.round(consultFee * (1 - discountPercent / 100)), 1);
}

export function isHealthPassActive(pass: { status: string; enddate: Date | null } | null): pass is ActiveHealthPass {
  if (!pass || pass.status !== "ACTIVE" || !pass.enddate) return false;
  return pass.enddate.getTime() > Date.now();
}

export function formatHealthPassPlanLabel(plan: HealthPassPlanId): string {
  return HEALTH_PASS_PLANS[plan].name;
}
