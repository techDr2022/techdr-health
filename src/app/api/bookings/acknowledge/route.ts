import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  sendBookingAcknowledgementToDoctorEmail,
  sendBookingAcknowledgementToPatientEmail,
} from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/sms";
import { buildGoogleCalendarLink } from "@/lib/calendar";

const schema = z.object({
  doctorSlug: z.string().min(1, "Doctor is required."),
  patientName: z.string().min(2, "Please enter your full name."),
  patientEmail: z.string().email("Please enter a valid email."),
  patientWhatsApp: z.string().min(10, "Please enter a valid WhatsApp number."),
  appointmentDate: z.string().min(1, "Please select appointment date."),
  timeSlot: z.string().min(1, "Please select a time slot."),
  concern: z.string().min(5, "Please describe your concern."),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());

    const doctor = await prisma.doctorProfile.findUnique({
      where: { slug: payload.doctorSlug },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const doctorName = doctor.displayName.replace(/^Dr\.?\s*/i, "") || doctor.displayName;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const details = {
      doctorName,
      patientName: payload.patientName,
      appointmentDate: payload.appointmentDate,
      timeSlot: payload.timeSlot,
      patientEmail: payload.patientEmail,
      patientWhatsApp: payload.patientWhatsApp,
      concern: payload.concern,
      calendarUrl: buildGoogleCalendarLink({
        title: `Consultation with Dr. ${doctorName}`,
        description: `Video consultation booking request.\nPatient: ${payload.patientName}\nDoctor: Dr. ${doctorName}`,
        date: payload.appointmentDate,
        timeSlot: payload.timeSlot,
      }) ?? undefined,
      manageBookingUrl: `${siteUrl}/dashboard/bookings`,
    };

    const patientEmailPromise = sendBookingAcknowledgementToPatientEmail(
      payload.patientEmail,
      details
    );
    const doctorEmailPromise = doctor.user.email
      ? sendBookingAcknowledgementToDoctorEmail(doctor.user.email, details)
      : Promise.resolve();

    const patientWhatsappMsg = [
      `Hi ${payload.patientName}, your booking request with Dr. ${doctor.displayName} is received.`,
      `Date: ${payload.appointmentDate}`,
      `Time: ${payload.timeSlot}`,
      "Consultation: Video",
      details.calendarUrl ? `Google Calendar: ${details.calendarUrl}` : "",
      "Our team will contact you shortly.",
      "- techDr Tele Health",
    ].filter(Boolean).join("\n");
    const doctorWhatsappMsg = [
      `New booking request for Dr. ${doctor.displayName}.`,
      `Patient: ${payload.patientName}`,
      `Date: ${payload.appointmentDate}`,
      `Time: ${payload.timeSlot}`,
      details.calendarUrl ? `Google Calendar: ${details.calendarUrl}` : "",
      `WhatsApp: ${payload.patientWhatsApp}`,
      `Email: ${payload.patientEmail}`,
      `Concern: ${payload.concern}`,
      "- techDr Tele Health",
    ].filter(Boolean).join("\n");

    const patientWhatsappPromise = sendWhatsAppMessage(
      payload.patientWhatsApp,
      patientWhatsappMsg
    );
    const doctorWhatsappPromise = doctor.user.phone
      ? sendWhatsAppMessage(doctor.user.phone, doctorWhatsappMsg)
      : Promise.resolve(false);

    const settledResults = await Promise.allSettled([
      patientWhatsappPromise,
      doctorWhatsappPromise,
      patientEmailPromise,
      doctorEmailPromise,
    ]);

    const patientWhatsappSent =
      settledResults[0].status === "fulfilled" && settledResults[0].value === true;
    const doctorWhatsappSent =
      settledResults[1].status === "fulfilled" && settledResults[1].value === true;
    const patientEmailSent =
      settledResults[2].status === "fulfilled" && settledResults[2].value === true;
    const doctorEmailSent = doctor.user.email
      ? settledResults[3].status === "fulfilled" && settledResults[3].value === true
      : false;

    if (settledResults[2].status === "rejected") {
      console.error("booking acknowledgement patient email failed", settledResults[2].reason);
    }
    if (settledResults[3].status === "rejected") {
      console.error("booking acknowledgement doctor email failed", settledResults[3].reason);
    }

    return NextResponse.json({
      success: true,
      notifications: {
        emailToPatient: patientEmailSent,
        emailToDoctor: doctorEmailSent,
        whatsappToPatient: patientWhatsappSent,
        whatsappToDoctor: doctorWhatsappSent,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    console.error("booking acknowledgement error", error);
    return NextResponse.json(
      { error: "Failed to send booking acknowledgement." },
      { status: 500 }
    );
  }
}
