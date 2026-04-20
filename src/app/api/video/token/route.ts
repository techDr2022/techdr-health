import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

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
      const roomName = `room_${bookingId}`;
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const webhookBase = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;

      const twilioRoom = await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: "group",
        recordParticipantsOnConnect: true,
        statusCallback: webhookBase ? `${webhookBase}/api/video/webhook` : undefined,
      });

      room = await prisma.consultationRoom.create({
        data: {
          bookingId,
          twilioRoomSid: twilioRoom.sid,
          twilioRoomName: roomName,
          status: "WAITING",
        },
      });
    }

    const identity = isDoctor ? `doctor_${booking.doctorId}` : `patient_${booking.patientId}`;
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY_SID!,
      process.env.TWILIO_API_KEY_SECRET!,
      { identity, ttl: 3600 }
    );
    token.addGrant(new VideoGrant({ room: room.twilioRoomName }));

    if (isDoctor && room.status === "WAITING") {
      await prisma.consultationRoom.update({
        where: { id: room.id },
        data: { status: "ACTIVE", startedAt: new Date() },
      });
    }

    return NextResponse.json({
      token: token.toJwt(),
      roomName: room.twilioRoomName,
      identity,
      role: isDoctor ? "doctor" : "patient",
    });
  } catch (error) {
    console.error("[video/token]", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
