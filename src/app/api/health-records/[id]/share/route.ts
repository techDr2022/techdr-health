import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.healthrecord.findUnique({
      where: { id: id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    if (record.userid !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as { doctorUserId?: string };
    const doctorUserId = String(body.doctorUserId ?? "").trim();
    if (!doctorUserId) {
      return NextResponse.json({ error: "doctorUserId is required." }, { status: 400 });
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { id: true, displayName: true, userId: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const hasConsulted = await prisma.booking.findFirst({
      where: {
        patientId: session.user.id,
        doctor: { userId: doctorUserId },
        payStatus: "CAPTURED",
      },
      select: { id: true },
    });

    if (!hasConsulted) {
      return NextResponse.json(
        { error: "You can only share records with doctors you have consulted." },
        { status: 400 }
      );
    }

    if (record.sharedwith.includes(doctorUserId)) {
      return NextResponse.json({
        sharedwith: record.sharedwith,
        message: "Already shared with this doctor.",
      });
    }

    const updated = await prisma.healthrecord.update({
      where: { id: record.id },
      data: { sharedwith: { push: doctorUserId } },
      select: { id: true, sharedwith: true },
    });

    return NextResponse.json({
      sharedwith: updated.sharedwith,
      doctor: { userId: doctor.userId, displayName: doctor.displayName },
    });
  } catch (error) {
    console.error("[health-records/share]", error);
    return NextResponse.json({ error: "Unable to share health record." }, { status: 500 });
  }
}
