import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [{ prisma }, { sendApprovalEmail, sendRejectionEmail }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/email"),
    ]);

    const body = await req.json();
    const action = String(body.action ?? "").toUpperCase();
    const reason = body.reason ? String(body.reason) : null;

    const application = await prisma.doctorProfile.findUnique({
      where: { id: params.id },
      include: { user: true, subscription: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      await prisma.doctorProfile.update({
        where: { id: params.id },
        data: {
          approvalStatus: "APPROVED",
          rejectionReason: null,
          isVisible: application.subscription?.status === "ACTIVE",
        },
      });

      await sendApprovalEmail(application.user.email, application.displayName);

      return NextResponse.json({ ok: true, status: "APPROVED" });
    }

    if (action === "REJECT") {
      await prisma.doctorProfile.update({
        where: { id: params.id },
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
