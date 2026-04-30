import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Pusher from "pusher";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPrescriptionIssuedEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";
import { generatePrescriptionPdf } from "@/lib/generatePrescriptionPdf";
import { getR2Client, getR2Config } from "@/lib/r2";

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
      include: { doctor: true, patient: { select: { name: true, email: true } } },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.doctor.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        patientName: booking.patient.name || "Patient",
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
        patientName: booking.patient.name || "Patient",
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

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    console.error("[video/prescription]", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}
