import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = (await req.json()) as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: true,
        patient: { select: { phone: true, name: true } },
      },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isDoctor = booking.doctor.userId === session.user.id;
    const isPatient = booking.patientId === session.user.id;
    if (!isDoctor && !isPatient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const room = await prisma.consultationRoom.findUnique({ where: { bookingId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const endedAt = new Date();
    const durationSeconds = room.startedAt
      ? Math.floor((endedAt.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    await prisma.$transaction([
      prisma.consultationRoom.update({
        where: { id: room.id },
        data: { status: "ENDED", endedAt, durationSeconds },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      }),
    ]);

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const feedbackLink = `${appUrl}/dashboard/patient/review/${booking.id}`;

    if (booking.patient.phone) {
      await sendWhatsAppMessage(
        booking.patient.phone,
        [
          `Hi ${booking.patient.name || "there"}, thanks for consulting with Dr. ${booking.doctor.displayName}.`,
          "Please share your feedback in the app:",
          feedbackLink,
          "- techDr Tele Health",
        ].join("\n")
      );
    }

    return NextResponse.json({ success: true, durationSeconds });
  } catch (error) {
    console.error("[video/end]", error);
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 });
  }
}
