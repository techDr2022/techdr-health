import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";
import { requireMobileSession } from "@/lib/mobile-session";

const schema = z
  .object({
    bookingId: z.string().min(1),
    action: z.enum(["CONFIRM", "CANCEL", "RESCHEDULE"]),
    rescheduledAt: z.string().optional(),
    reason: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "RESCHEDULE" && !value.rescheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rescheduledAt is required for RESCHEDULE action.",
      });
    }
  });

export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = schema.parse(await req.json());

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Only doctors can manage bookings." }, { status: 403 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      select: { id: true, doctorId: true, status: true, notes: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (booking.status === "COMPLETED") {
      return NextResponse.json({ error: "Completed booking cannot be changed." }, { status: 400 });
    }

    const reason = payload.reason?.trim() || undefined;
    const updateData: {
      status?: "UPCOMING" | "CANCELLED";
      scheduledAt?: Date;
      endsAt?: Date;
      cancellationReason?: string | null;
      cancelledBy?: string | null;
      notes?: string;
    } = {};

    if (payload.action === "CONFIRM") {
      updateData.status = "UPCOMING";
      updateData.notes = [booking.notes, `Confirmed by doctor on ${new Date().toLocaleString("en-IN")}`]
        .filter(Boolean)
        .join("\n");
    } else if (payload.action === "CANCEL") {
      updateData.status = "CANCELLED";
      updateData.cancellationReason = reason || "Cancelled by doctor.";
      updateData.cancelledBy = session.userId;
    } else {
      const nextDate = new Date(payload.rescheduledAt!);
      if (Number.isNaN(nextDate.getTime())) {
        return NextResponse.json({ error: "Invalid rescheduled date/time." }, { status: 400 });
      }
      updateData.status = "UPCOMING";
      updateData.scheduledAt = nextDate;
      updateData.endsAt = addMinutes(nextDate, CONSULTATION_SLOT_MINUTES);
      updateData.cancellationReason = null;
      updateData.cancelledBy = null;
      updateData.notes = [
        booking.notes,
        `Rescheduled by doctor to ${nextDate.toLocaleString("en-IN")} on ${new Date().toLocaleString("en-IN")}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      select: {
        id: true,
        status: true,
        scheduledAt: true,
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body." }, { status: 400 });
    }
    console.error("mobile booking manage error", error);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }
}
