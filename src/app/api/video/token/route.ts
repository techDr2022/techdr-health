import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createParticipantToken, createRoomForBooking } from "@/lib/hms";
import {
  isJoinableBookingStatus,
  resolveConsultationAccess,
} from "@/lib/consultation-access";
import { notifyDoctorJoinedRoom } from "@/lib/push-notifications";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, joinToken } = (await req.json()) as {
      bookingId?: string;
      joinToken?: string;
    };
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

    const access = await resolveConsultationAccess(
      bookingId,
      booking,
      joinToken?.trim() || null
    );
    if (!access) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isJoinableBookingStatus(booking.status)) {
      return NextResponse.json({ error: "This consultation is no longer active." }, { status: 400 });
    }

    const isDoctor = access.role === "doctor";

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
      await prisma.$transaction([
        prisma.consultationRoom.update({
          where: { id: room.id },
          data: { status: "ACTIVE", startedAt: new Date() },
        }),
        ...(booking.status === "UPCOMING"
          ? [
              prisma.booking.update({
                where: { id: bookingId },
                data: { status: "ONGOING" },
              }),
            ]
          : []),
      ]);

      notifyDoctorJoinedRoom({
        patientUserId: booking.patientId,
        doctorName: booking.doctor.displayName,
        bookingId: booking.id,
      });
    }

    return NextResponse.json({
      token,
      roomId: room.twilioRoomName,
      identity,
      role: access.role,
    });
  } catch (error) {
    console.error("[video/token]", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
