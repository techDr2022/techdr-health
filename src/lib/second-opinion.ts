import { calculateDoctorPayout } from "@/lib/plans";

export const SECOND_OPINION_SURCHARGE_PERCENT = 15;

export type SecondOpinionPrefill = {
  originalBookingId: string;
  originalDoctorName: string;
  originalDoctorSlug: string;
  originalSpecialty: string;
  originalDiagnosis: string | null;
  completedAt: string;
};

export function applySecondOpinionSurcharge(consultFeeInr: number, isSecondOpinion: boolean): number {
  if (!isSecondOpinion) return consultFeeInr;
  return Math.round(consultFeeInr * (1 + SECOND_OPINION_SURCHARGE_PERCENT / 100));
}

export function calculateBookingFees(consultFeeInr: number, isSecondOpinion = false) {
  const adjustedFee = applySecondOpinionSurcharge(consultFeeInr, isSecondOpinion);
  return calculateDoctorPayout(adjustedFee);
}

export function buildSecondOpinionConcern(prefill: SecondOpinionPrefill): string {
  const parts = [
    "Second opinion request",
    `Prior consult: Dr. ${prefill.originalDoctorName} (${prefill.originalSpecialty})`,
  ];
  if (prefill.originalDiagnosis?.trim()) {
    parts.push(`Prior diagnosis: ${prefill.originalDiagnosis.trim()}`);
  }
  parts.push("Please review shared records from the prior consultation.");
  return parts.join(". ");
}
