import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createParticipantToken, createRoomForBooking } from "@/lib/hms";

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
      include: { doctor: true, patient: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isDoctor = booking.doctor.userId === session.user.id;
    const isPatient = booking.patientId === session.user.id;
    if (!isDoctor && !isPatient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let room = await prisma.consultationRoom.findUnique({ where: { bookingId } });
    if (!room) {
      const hmsRoom = await createRoomForBooking(bookingId);

      room = await prisma.consultationRoom.create({
        data: {
          bookingId,
          twilioRoomName: hmsRoom.id,
          status: "WAITING",
        },
      });
    }

    const identity = isDoctor ? `doctor_${booking.doctorId}` : `patient_${booking.patientId}`;
    const roleName = isDoctor
      ? process.env.HMS_DOCTOR_ROLE || "host"
      : process.env.HMS_PATIENT_ROLE || "guest";
    const token = createParticipantToken({
      roomId: room.twilioRoomName,
      userId: identity,
      role: roleName,
    });

    if (isDoctor && room.status === "WAITING") {
      await prisma.consultationRoom.update({
        where: { id: room.id },
        data: { status: "ACTIVE", startedAt: new Date() },
      });
    }

    return NextResponse.json({
      token,
      roomId: room.twilioRoomName,
      identity,
      role: isDoctor ? "doctor" : "patient",
    });
  } catch (error) {
    console.error("[video/token]", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
