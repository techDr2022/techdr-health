import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can submit feedback." }, { status: 403 });
    }

    const payload = schema.parse(await req.json());
    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      select: { id: true, patientId: true, doctorId: true, status: true },
    });

    if (!booking || booking.patientId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Feedback can be submitted only after consultation completion." },
        { status: 400 }
      );
    }

    const review = await prisma.review.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        doctorId: booking.doctorId,
        rating: payload.rating,
        comment: payload.comment?.trim() || null,
      },
      update: {
        rating: payload.rating,
        comment: payload.comment?.trim() || null,
      },
      select: { id: true, rating: true, comment: true },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }
    console.error("booking feedback error", error);
    return NextResponse.json({ error: "Unable to submit feedback." }, { status: 500 });
  }
}
