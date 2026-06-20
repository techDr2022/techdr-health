import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendDataDeletionRequestEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        datadeleterequested: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.datadeleterequested) {
      return NextResponse.json({
        success: true,
        message: "A data deletion request is already on file. We will respond within 30 days per DPDPA.",
      });
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        datadeleterequested: true,
        datadeleterequestedat: now,
      },
    });

    void sendDataDeletionRequestEmail({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      requestedAt: now.toISOString(),
    }).catch((error) => {
      console.error("data deletion admin email failed", error);
    });

    return NextResponse.json({
      success: true,
      message:
        "Your data deletion request has been recorded. We will process it within 30 days as required under the Digital Personal Data Protection Act, 2023.",
    });
  } catch (error) {
    console.error("request-deletion error", error);
    return NextResponse.json({ error: "Unable to submit deletion request." }, { status: 500 });
  }
}
