export const PEAK_HOUR_MULTIPLIER = 1.25;
export const WEEKEND_MULTIPLIER = 1.15;
export const SCARCITY_MULTIPLIER = 1.3;
export const MAX_SURGE_MULTIPLIER = 1.5;
export const SCARCITY_DOCTOR_THRESHOLD = 3;

export type PricingMultiplierResult = {
  multiplier: number;
  reasons: string[];
  surgeEnabled: boolean;
};

export type IstSlotParts = {
  hour: number;
  minute: number;
  weekday: number;
};

export function getIstSlotParts(slotDateTime: Date): IstSlotParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = formatter.formatToParts(slotDateTime);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { hour, minute, weekday: weekdayMap[weekdayLabel] ?? 1 };
}

export function isPeakHourIst(parts: IstSlotParts): boolean {
  const minutes = parts.hour * 60 + parts.minute;
  const morningStart = 7 * 60;
  const morningEnd = 9 * 60;
  const eveningStart = 18 * 60;
  const eveningEnd = 21 * 60;
  return (minutes >= morningStart && minutes < morningEnd) || (minutes >= eveningStart && minutes < eveningEnd);
}

export function isWeekendIst(parts: IstSlotParts): boolean {
  return parts.weekday === 0 || parts.weekday === 6;
}

export function computePricingMultiplier(args: {
  slotDateTime: Date;
  specialtyDoctorCount: number;
  surgeEnabled?: boolean;
}): PricingMultiplierResult {
  if (args.surgeEnabled === false) {
    return { multiplier: 1, reasons: [], surgeEnabled: false };
  }

  const parts = getIstSlotParts(args.slotDateTime);
  let multiplier = 1;
  const reasons: string[] = [];

  if (isPeakHourIst(parts)) {
    multiplier *= PEAK_HOUR_MULTIPLIER;
    reasons.push("Peak hour (+25%)");
  }
  if (isWeekendIst(parts)) {
    multiplier *= WEEKEND_MULTIPLIER;
    reasons.push("Weekend (+15%)");
  }
  if (args.specialtyDoctorCount > 0 && args.specialtyDoctorCount < SCARCITY_DOCTOR_THRESHOLD) {
    multiplier *= SCARCITY_MULTIPLIER;
    reasons.push("High-demand specialty (+30%)");
  }

  multiplier = Math.min(multiplier, MAX_SURGE_MULTIPLIER);

  return {
    multiplier: Math.round(multiplier * 1000) / 1000,
    reasons,
    surgeEnabled: true,
  };
}

export function applySurgeToFee(baseFeeInr: number, multiplier: number): number {
  if (multiplier <= 1) return baseFeeInr;
  return Math.max(Math.round(baseFeeInr * multiplier), 1);
}

export function surgePercentLabel(multiplier: number): number {
  return Math.max(0, Math.round((multiplier - 1) * 100));
}

export function formatSurgeBadge(reasons: string[], multiplier: number): string | null {
  if (multiplier <= 1 || reasons.length === 0) return null;
  const pct = surgePercentLabel(multiplier);
  if (reasons.some((reason) => reason.startsWith("Peak hour"))) {
    return `Peak Hour Rate — ${pct}% surge applied`;
  }
  if (reasons.some((reason) => reason.startsWith("Weekend"))) {
    return `Weekend Rate — ${pct}% surge applied`;
  }
  if (reasons.some((reason) => reason.startsWith("High-demand"))) {
    return `High Demand — ${pct}% surge applied`;
  }
  return `Surge pricing — ${pct}% applied`;
}
