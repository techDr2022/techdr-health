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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, diagnosis, medicines, instructions, followUpDate } = (await req.json()) as {
      bookingId?: string;
      diagnosis?: string;
      medicines?: unknown;
      instructions?: string;
      followUpDate?: string;
    };

    if (!bookingId || !diagnosis || !Array.isArray(medicines)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { doctor: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.doctor.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;
    const prescription = await prisma.prescription.upsert({
      where: { bookingId },
      update: {
        diagnosis,
        medicines,
        instructions: instructions || null,
        followUpDate: parsedFollowUpDate,
        sentAt: new Date(),
      },
      create: {
        bookingId,
        patientId: booking.patientId,
        doctorId: booking.doctorId,
        diagnosis,
        medicines,
        instructions: instructions || null,
        followUpDate: parsedFollowUpDate,
        sentAt: new Date(),
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        diagnosis,
        prescription: medicines,
        followUpDate: parsedFollowUpDate,
      },
    });

    await pusher.trigger(`booking-${bookingId}`, "prescription-update", {
      diagnosis,
      medicines,
      instructions,
      followUpDate,
      sentAt: prescription.sentAt?.toISOString() ?? new Date().toISOString(),
    });

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    console.error("[video/prescription]", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}
