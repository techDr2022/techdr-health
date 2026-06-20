import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        patientId: session.user.id,
        payStatus: "CAPTURED",
      },
      include: {
        doctor: {
          select: { userId: true, displayName: true, specialty: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const seen = new Set<string>();
    const doctors = bookings
      .map((booking) => booking.doctor)
      .filter((doctor) => {
        if (seen.has(doctor.userId)) return false;
        seen.add(doctor.userId);
        return true;
      });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("[health-records/share-targets]", error);
    return NextResponse.json({ error: "Unable to load doctors." }, { status: 500 });
  }
}
