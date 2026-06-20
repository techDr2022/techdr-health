import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
        phone: true,
        role: true,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        marketingconsent: true,
        marketingconsentat: true,
        datadeleterequested: true,
        datadeleterequestedat: true,
        createdAt: true,
        updatedAt: true,
        bookingsAsPatient: {
          orderBy: { scheduledAt: "desc" },
          select: {
            id: true,
            scheduledAt: true,
            consultType: true,
            status: true,
            payStatus: true,
            totalPatientPays: true,
            notes: true,
            diagnosis: true,
            createdAt: true,
            doctor: { select: { displayName: true, specialty: true } },
            prescriptionRecord: {
              select: {
                diagnosis: true,
                medicines: true,
                instructions: true,
                createdAt: true,
              },
            },
            review: {
              select: { rating: true, comment: true, createdAt: true },
            },
          },
        },
        healthNudges: {
          orderBy: { sentAt: "desc" },
          take: 50,
          select: {
            nudgeType: true,
            sentAt: true,
            opened: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        marketingConsent: user.marketingconsent,
        marketingConsentAt: user.marketingconsentat?.toISOString() ?? null,
        dataDeleteRequested: user.datadeleterequested,
        dataDeleteRequestedAt: user.datadeleterequestedat?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      bookings: user.bookingsAsPatient.map((booking) => ({
        id: booking.id,
        doctorName: booking.doctor.displayName,
        specialty: booking.doctor.specialty,
        scheduledAt: booking.scheduledAt.toISOString(),
        consultType: booking.consultType,
        status: booking.status,
        payStatus: booking.payStatus,
        totalPatientPays: booking.totalPatientPays,
        notes: booking.notes,
        diagnosis: booking.diagnosis,
        prescription: booking.prescriptionRecord,
        review: booking.review,
        createdAt: booking.createdAt.toISOString(),
      })),
      healthNudges: user.healthNudges.map((nudge) => ({
        nudgeType: nudge.nudgeType,
        sentAt: nudge.sentAt.toISOString(),
        opened: nudge.opened,
      })),
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="techdrhealth-data-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    console.error("data-export error", error);
    return NextResponse.json({ error: "Unable to export data." }, { status: 500 });
  }
}
