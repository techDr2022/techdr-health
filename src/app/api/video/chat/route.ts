import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

type ChatMessage = {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  time: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookingId = req.nextUrl.searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { doctor: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const allowed = booking.patientId === session.user.id || booking.doctor.userId === session.user.id;
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const room = await prisma.consultationRoom.findUnique({ where: { bookingId } });
  const messages = (room?.chatLog as ChatMessage[] | null) ?? [];
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, message, sender } = (await req.json()) as {
    bookingId?: string;
    message?: string;
    sender?: "doctor" | "patient";
  };

  if (!bookingId || !message || !sender) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { doctor: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isDoctor = booking.doctor.userId === session.user.id;
  const isPatient = booking.patientId === session.user.id;
  if (!isDoctor && !isPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expectedSender = isDoctor ? "doctor" : "patient";
  if (sender !== expectedSender) {
    return NextResponse.json({ error: "Invalid sender role" }, { status: 400 });
  }

  const chatMessage: ChatMessage = {
    id: Date.now().toString(),
    sender,
    text: message,
    time: new Date().toISOString(),
  };

  const room = await prisma.consultationRoom.findUnique({ where: { bookingId } });
  if (room) {
    const currentLog = (room.chatLog as ChatMessage[] | null) ?? [];
    await prisma.consultationRoom.update({
      where: { id: room.id },
      data: { chatLog: [...currentLog, chatMessage] },
    });
  }

  await pusher.trigger(`chat-${bookingId}`, "message", chatMessage);
  return NextResponse.json({ success: true });
}
