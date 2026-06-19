import { ApprovalStatus } from "@prisma/client";

type VisibilityInput = {
  approvalStatus: ApprovalStatus | string;
  isVisible: boolean;
  subscription?: { status: string } | null;
};

/** Approved doctors with an active subscription should appear in public listings. */
export function shouldDoctorBePubliclyListed(input: VisibilityInput) {
  if (input.approvalStatus !== ApprovalStatus.APPROVED) return false;
  if (input.isVisible) return true;
  return input.subscription?.status === "ACTIVE";
}

export function resolveDoctorVisibilityUpdate(input: VisibilityInput) {
  return shouldDoctorBePubliclyListed(input);
}
