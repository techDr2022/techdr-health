export const FAMILY_RELATIONS = ["spouse", "child", "parent", "sibling", "other"] as const;
export const FAMILY_GENDERS = ["male", "female", "other"] as const;

export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];
export type FamilyGender = (typeof FAMILY_GENDERS)[number];

export type FamilyMemberRecord = {
  id: string;
  name: string;
  relation: string;
  dob: string;
  gender: string;
  createdAt: string;
};

export function formatFamilyRelation(relation: string) {
  return relation.charAt(0).toUpperCase() + relation.slice(1);
}

export function getBookingBeneficiaryName(booking: {
  patient: { name: string | null };
  familymember?: { name: string } | null;
}) {
  return booking.familymember?.name?.trim() || booking.patient.name?.trim() || "Patient";
}

export function getBookingBeneficiaryLabel(booking: {
  patient: { name: string | null };
  familymember?: { name: string; relation: string } | null;
}) {
  if (!booking.familymember) {
    return getBookingBeneficiaryName(booking);
  }
  return `${booking.familymember.name} (${formatFamilyRelation(booking.familymember.relation)})`;
}

export const bookingBeneficiaryInclude = {
  patient: { select: { name: true, email: true, phone: true } },
  familymember: { select: { name: true, relation: true, gender: true, dob: true } },
} as const;
