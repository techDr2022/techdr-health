import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const event = body.get("StatusCallbackEvent") as string | null;
    const roomSid = body.get("RoomSid") as string | null;
    const recordingSid = body.get("RecordingSid") as string | null;

    if (event === "recording-completed" && roomSid && recordingSid) {
      const recordingUrl = `https://video.twilio.com/v1/Recordings/${recordingSid}/Media`;
      await prisma.consultationRoom.updateMany({
        where: { twilioRoomSid: roomSid },
        data: {
          recordingSid,
          recordingUrl,
          recordingStatus: "completed",
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[video/webhook]", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
