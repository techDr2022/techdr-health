import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  canApproveDoctorProfile,
  shouldDoctorBeListedAfterApproval,
} from "@/lib/nmc-verification";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [{ prisma }, { sendApprovalEmail, sendRejectionEmail }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/email"),
    ]);

    const body = await req.json();
    const action = String(body.action ?? "").toUpperCase();
    const reason = body.reason ? String(body.reason) : null;

    const application = await prisma.doctorProfile.findUnique({
      where: { id: id },
      include: { user: true, subscription: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      const approvalCheck = canApproveDoctorProfile({
        nmcverified: application.nmcverified,
        medRegNumber: application.medRegNumber,
      });
      if (!approvalCheck.ok) {
        return NextResponse.json({ error: approvalCheck.error }, { status: 400 });
      }

      const isVisible = shouldDoctorBeListedAfterApproval({
        approvalStatus: "APPROVED",
        nmcverified: application.nmcverified,
        subscriptionStatus: application.subscription?.status,
      });

      await prisma.doctorProfile.update({
        where: { id: id },
        data: {
          approvalStatus: "APPROVED",
          rejectionReason: null,
          isVisible,
        },
      });

      const { revalidateDoctorPublicPages } = await import("@/lib/revalidate-doctors");
      revalidateDoctorPublicPages(application.specialty, application.slug);

      await sendApprovalEmail(application.user.email, application.displayName);

      return NextResponse.json({ ok: true, status: "APPROVED" });
    }

    if (action === "REJECT") {
      await prisma.doctorProfile.update({
        where: { id: id },
        data: {
          approvalStatus: "REJECTED",
          rejectionReason: reason || "Application did not meet verification requirements.",
          isVisible: false,
        },
      });
      await sendRejectionEmail(
        application.user.email,
        application.displayName,
        reason || "Application did not meet verification requirements."
      );
      const { revalidateDoctorPublicPages } = await import("@/lib/revalidate-doctors");
      revalidateDoctorPublicPages(application.specialty, application.slug);
      return NextResponse.json({ ok: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("review application error", error);
    return NextResponse.json(
      { error: "Unable to review application." },
      { status: 500 }
    );
  }
}
