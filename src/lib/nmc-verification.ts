/** NMC (National Medical Commission) registration verification helpers — TPG compliance. */

export const NMC_APPROVAL_ERROR = "NMC registration must be verified before approving.";

const PLACEHOLDER_PREFIXES = ["PENDING-", "ADMIN-"] as const;

export function isPlaceholderMedRegNumber(medRegNumber: string): boolean {
  const value = medRegNumber.trim().toUpperCase();
  if (!value) return true;
  return PLACEHOLDER_PREFIXES.some((prefix) => value.startsWith(prefix));
}

/** Basic format check — state code + numeric registration (flexible for Indian NMC formats). */
export function isValidNmcRegNumberFormat(medRegNumber: string): boolean {
  const normalized = medRegNumber.trim();
  if (normalized.length < 4 || normalized.length > 30) return false;
  if (isPlaceholderMedRegNumber(normalized)) return false;
  return /^[A-Za-z0-9/-]+$/.test(normalized);
}

export function buildNmcRegistrySearchUrl(medRegNumber: string): string {
  const query = encodeURIComponent(medRegNumber.trim());
  return `https://www.nmc.org.in/information-desk/indian-medical-register`;
}

export type DoctorApprovalInput = {
  nmcverified: boolean;
  medRegNumber: string;
};

export function canApproveDoctorProfile(input: DoctorApprovalInput): {
  ok: boolean;
  error?: string;
} {
  if (isPlaceholderMedRegNumber(input.medRegNumber)) {
    return {
      ok: false,
      error: "A valid NMC registration number must be entered before approval.",
    };
  }
  if (!isValidNmcRegNumberFormat(input.medRegNumber)) {
    return {
      ok: false,
      error: "NMC registration number format is invalid.",
    };
  }
  if (!input.nmcverified) {
    return { ok: false, error: NMC_APPROVAL_ERROR };
  }
  return { ok: true };
}

export function shouldDoctorBeListedAfterApproval(input: {
  approvalStatus: string;
  nmcverified: boolean;
  subscriptionStatus?: string | null;
}): boolean {
  if (input.approvalStatus !== "APPROVED") return false;
  if (!input.nmcverified) return false;
  return input.subscriptionStatus === "ACTIVE";
}
