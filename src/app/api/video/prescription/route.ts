import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Pusher from "pusher";
import { prisma } from "@/lib/prisma";
import { resolveConsultationAccess } from "@/lib/consultation-access";
import { sendPrescriptionIssuedEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";
import { generatePrescriptionPdf } from "@/lib/generatePrescriptionPdf";
import { getR2Client, getR2Config } from "@/lib/r2";
import {
  getDisallowedMedicines,
  validateMedicinesForConsult,
} from "@/lib/drug-restrictions";
import { isFirstConsultWithDoctor } from "@/lib/booking-consult-context";
import { getBookingBeneficiaryName } from "@/lib/family-members";
import { notifyPrescriptionReady } from "@/lib/push-notifications";

function getPusherClient() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, diagnosis, medicines, instructions, followUpDate, joinToken } =
      (await req.json()) as {
      bookingId?: string;
      diagnosis?: string;
      medicines?: unknown;
      instructions?: string;
      followUpDate?: string;
      joinToken?: string;
    };

    if (!bookingId || !diagnosis || !Array.isArray(medicines)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: true,
        patient: { select: { name: true, email: true } },
        familymember: { select: { name: true } },
      },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const access = await resolveConsultationAccess(
      bookingId,
      booking,
      joinToken?.trim() || null
    );
    if (!access || access.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medicineList = medicines as Array<{ name: string; dosage?: string; duration?: string }>;
    const firstConsult = await isFirstConsultWithDoctor(
      booking.patientId,
      booking.doctorId,
      booking.id
    );

    const drugChecks = validateMedicinesForConsult(
      medicineList,
      booking.consultType,
      firstConsult
    );
    const violations = getDisallowedMedicines(drugChecks);
    if (violations.length > 0) {
      return NextResponse.json(
        {
          error:
            "One or more medicines cannot be prescribed via telemedicine under TPG 2020 rules.",
          violations,
        },
        { status: 422 }
      );
    }

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;
    const consultationDate = booking.scheduledAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const followUpDateText = parsedFollowUpDate
      ? parsedFollowUpDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : null;

    const beneficiaryName = getBookingBeneficiaryName(booking);

    let pdfObjectKey: string | null = null;
    try {
      const pdfBlob = await generatePrescriptionPdf({
        prescription: {
          diagnosis,
          medicines: medicines as Array<{ name: string; dosage: string; duration: string; instructions?: string }>,
          instructions: instructions || undefined,
          followUpDate: followUpDateText || undefined,
        },
        doctorName: booking.doctor.displayName,
        patientName: beneficiaryName,
        specialty: booking.doctor.specialty,
        date: consultationDate,
      });
      const pdfBytes = Buffer.from(await pdfBlob.arrayBuffer());
      const key = `prescriptions/${bookingId}-${Date.now()}.pdf`;
      const r2Config = getR2Config();
      await getR2Client().send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
          Body: pdfBytes,
          ContentType: "application/pdf",
          CacheControl: "private, max-age=0, no-cache",
        })
      );
      pdfObjectKey = key;
    } catch (pdfError) {
      console.error("[video/prescription] pdf generation/upload failed", pdfError);
    }

    const prescription = await prisma.prescription.upsert({
      where: { bookingId },
      update: {
        diagnosis,
        medicines,
        instructions: instructions || null,
        followUpDate: parsedFollowUpDate,
        pdfUrl: pdfObjectKey,
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
        pdfUrl: pdfObjectKey,
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

    const prescriptionViewUrl = `${getSiteUrl()}/dashboard/patient/prescription/${bookingId}`;
    const prescriptionDownloadUrl = `${getSiteUrl()}/api/prescription/${bookingId}/pdf`;

    if (booking.patient.email) {
      await sendPrescriptionIssuedEmail(booking.patient.email, {
        patientName: beneficiaryName,
        doctorName: booking.doctor.displayName,
        specialty: booking.doctor.specialty,
        consultationDate,
        diagnosis,
        medicines: medicines as Array<{
          name: string;
          dosage: string;
          duration: string;
          instructions?: string;
        }>,
        instructions: instructions || null,
        followUpDate: followUpDateText,
        viewPrescriptionUrl: prescriptionViewUrl,
        downloadPrescriptionUrl: pdfObjectKey ? prescriptionDownloadUrl : undefined,
      });
    }

    const pusher = getPusherClient();
    if (pusher) {
      await pusher.trigger(`booking-${bookingId}`, "prescription-update", {
        diagnosis,
        medicines,
        instructions,
        followUpDate,
        sentAt: prescription.sentAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    notifyPrescriptionReady({
      patientUserId: booking.patientId,
      doctorName: booking.doctor.displayName,
      bookingId: booking.id,
    });

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    console.error("[video/prescription]", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}
