import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingStatusUpdateEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/sms";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Only doctors can manage bookings." }, { status: 403 });
    }

    const payload = schema.parse(await req.json());

    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      include: {
        doctor: { include: { user: { select: { id: true, email: true, phone: true, name: true } } } },
        patient: { select: { id: true, email: true, phone: true, name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.doctor.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    let notificationStatus: "CONFIRMED" | "CANCELLED" | "RESCHEDULED" = "CONFIRMED";

    if (payload.action === "CONFIRM") {
      updateData.status = "UPCOMING";
      notificationStatus = "CONFIRMED";
      updateData.notes = [booking.notes, `Confirmed by doctor on ${new Date().toLocaleString("en-IN")}`]
        .filter(Boolean)
        .join("\n");
    } else if (payload.action === "CANCEL") {
      updateData.status = "CANCELLED";
      updateData.cancellationReason = reason || "Cancelled by doctor due to availability.";
      updateData.cancelledBy = session.user.id;
      notificationStatus = "CANCELLED";
    } else {
      const rescheduledAt = new Date(payload.rescheduledAt!);
      if (Number.isNaN(rescheduledAt.getTime())) {
        return NextResponse.json({ error: "Invalid rescheduled date/time." }, { status: 400 });
      }
      updateData.status = "UPCOMING";
      updateData.scheduledAt = rescheduledAt;
      updateData.endsAt = addMinutes(rescheduledAt, CONSULTATION_SLOT_MINUTES);
      updateData.cancellationReason = null;
      updateData.cancelledBy = null;
      notificationStatus = "RESCHEDULED";
      updateData.notes = [
        booking.notes,
        `Rescheduled by doctor to ${rescheduledAt.toLocaleString("en-IN")} on ${new Date().toLocaleString("en-IN")}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      select: { id: true, status: true, scheduledAt: true, consultType: true },
    });

    const doctorName = booking.doctor.displayName;
    const patientName = booking.patient.name || "Patient";
    const scheduleText = updated.scheduledAt.toLocaleString("en-IN");

    const patientEmailPromise = booking.patient.email
      ? sendBookingStatusUpdateEmail(booking.patient.email, {
          audience: "patient",
          status: notificationStatus,
          doctorName,
          patientName,
          scheduledAt: scheduleText,
          reason,
        })
      : Promise.resolve();
    const doctorEmailPromise = booking.doctor.user.email
      ? sendBookingStatusUpdateEmail(booking.doctor.user.email, {
          audience: "doctor",
          status: notificationStatus,
          doctorName,
          patientName,
          scheduledAt: scheduleText,
          reason,
        })
      : Promise.resolve();

    const patientWhatsappPromise = booking.patient.phone
      ? sendWhatsAppMessage(
          booking.patient.phone,
          [
            `Booking update: ${notificationStatus}`,
            `Doctor: ${doctorName}`,
            `Date/Time: ${scheduleText}`,
            reason ? `Note: ${reason}` : "",
            "- techDr Tele Health",
          ]
            .filter(Boolean)
            .join("\n")
        )
      : Promise.resolve(false);

    const doctorWhatsappPromise = booking.doctor.user.phone
      ? sendWhatsAppMessage(
          booking.doctor.user.phone,
          [
            `Booking update: ${notificationStatus}`,
            `Patient: ${patientName}`,
            `Date/Time: ${scheduleText}`,
            reason ? `Note: ${reason}` : "",
            "- techDr Tele Health",
          ]
            .filter(Boolean)
            .join("\n")
        )
      : Promise.resolve(false);

    await Promise.all([
      patientEmailPromise,
      doctorEmailPromise,
      patientWhatsappPromise,
      doctorWhatsappPromise,
    ]);

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }
    console.error("booking manage error", error);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }
}
