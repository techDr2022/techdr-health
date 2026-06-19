"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export type ReviewApplicationState = {
  ok: boolean;
  message: string;
};

export async function approveApplication(
  _prev: ReviewApplicationState | null,
  formData: FormData
): Promise<ReviewApplicationState> {
  try {
    await ensureAdminAccess();
    const applicationId = String(formData.get("applicationId") ?? "").trim();
    if (!applicationId) {
      return { ok: false, message: "Missing application id." };
    }

    const application = await prisma.doctorProfile.findUnique({
      where: { id: applicationId },
      include: { user: true, subscription: true },
    });
    if (!application) {
      return { ok: false, message: "Application not found." };
    }

    await prisma.doctorProfile.update({
      where: { id: applicationId },
      data: {
        approvalStatus: "APPROVED",
        rejectionReason: null,
        isVisible: application.subscription?.status === "ACTIVE",
      },
    });

    revalidateDoctorPublicPages(application.specialty);

    try {
      await sendApprovalEmail(application.user.email, application.displayName);
    } catch (error) {
      console.error("approval email failed", error);
    }

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { ok: true, message: "Application approved successfully." };
  } catch (error) {
    console.error("approve application error", error);
    return { ok: false, message: "Unable to approve application." };
  }
}

export async function rejectApplication(
  _prev: ReviewApplicationState | null,
  formData: FormData
): Promise<ReviewApplicationState> {
  try {
    await ensureAdminAccess();
    const applicationId = String(formData.get("applicationId") ?? "").trim();
    const reason =
      String(formData.get("reason") ?? "").trim() ||
      "Application did not meet verification requirements.";

    if (!applicationId) {
      return { ok: false, message: "Missing application id." };
    }

    const application = await prisma.doctorProfile.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });
    if (!application) {
      return { ok: false, message: "Application not found." };
    }

    await prisma.doctorProfile.update({
      where: { id: applicationId },
      data: {
        approvalStatus: "REJECTED",
        rejectionReason: reason,
        isVisible: false,
      },
    });

    revalidateDoctorPublicPages(application.specialty);

    try {
      await sendRejectionEmail(application.user.email, application.displayName, reason);
    } catch (error) {
      console.error("rejection email failed", error);
    }

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { ok: true, message: "Application rejected." };
  } catch (error) {
    console.error("reject application error", error);
    return { ok: false, message: "Unable to reject application." };
  }
}
