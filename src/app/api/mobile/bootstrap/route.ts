import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileSession } from "@/lib/mobile-session";

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const bookings = await prisma.booking.findMany({
      where:
        user.role === "DOCTOR" && user.doctorProfile
          ? { doctorId: user.doctorProfile.id }
          : { patientId: user.id },
      orderBy: [{ scheduledAt: "desc" }],
      take: 20,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, slug: true, displayName: true, specialty: true, userId: true } },
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      doctorProfile: user.doctorProfile,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        payStatus: booking.payStatus,
        scheduledAt: booking.scheduledAt,
        totalPatientPays: booking.totalPatientPays,
        patient: booking.patient,
        doctor: booking.doctor,
      })),
    });
  } catch (error) {
    console.error("mobile bootstrap error", error);
    return NextResponse.json({ error: "Unable to load mobile dashboard." }, { status: 500 });
  }
}
