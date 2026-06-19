// AI-POWERED
import { BookingStatus } from "@prisma/client";
import { callClaudeJSON } from "@/lib/ai/client";
import { sendHealthNudgeEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";

type NudgeAiPayload = {
  subjectLine: string;
  message: string;
  healthTip: string;
  nudgeType: "follow_up" | "checkup_reminder" | "seasonal";
};

const NUDGE_THRESHOLDS_DAYS = [30, 60, 90] as const;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function extractChiefComplaint(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/Chief complaint:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

export async function sendHealthNudges() {
  const now = new Date();
  const cutoffRecent = new Date(now);
  cutoffRecent.setDate(cutoffRecent.getDate() - 30);

  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
      isActive: true,
      bookingsAsPatient: {
        some: {
          status: BookingStatus.COMPLETED,
          scheduledAt: { lt: cutoffRecent },
        },
        none: {
          scheduledAt: { gte: cutoffRecent },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      bookingsAsPatient: {
        where: { status: BookingStatus.COMPLETED },
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: {
          id: true,
          notes: true,
          diagnosis: true,
          scheduledAt: true,
          doctor: { select: { specialty: true, displayName: true } },
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  let skipped = 0;

  for (const patient of patients) {
    const lastBooking = patient.bookingsAsPatient[0];
    if (!lastBooking || !patient.email) {
      skipped += 1;
      continue;
    }

    const days = daysSince(lastBooking.scheduledAt);
    const threshold = NUDGE_THRESHOLDS_DAYS.find((value) => days >= value && days < value + 7);
    if (!threshold) {
      skipped += 1;
      continue;
    }

    const nudgeType =
      threshold === 30 ? "follow_up" : threshold === 60 ? "checkup_reminder" : "seasonal";

    const existing = await prisma.healthNudge.findFirst({
      where: {
        patientId: patient.id,
        nudgeType,
        sentAt: { gte: new Date(now.getTime() - threshold * 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const complaint = extractChiefComplaint(lastBooking.notes);
    const context = [
      `Patient name: ${patient.name}`,
      `Days since last visit: ${days}`,
      `Last specialty: ${lastBooking.doctor.specialty}`,
      complaint ? `Last complaint: ${complaint}` : null,
      lastBooking.diagnosis ? `Last diagnosis: ${lastBooking.diagnosis}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    let aiPayload: NudgeAiPayload;
    try {
      aiPayload = await callClaudeJSON<NudgeAiPayload>(
        `Generate a warm, personalised health re-engagement email for a telemedicine patient in India.
Return JSON: { "subjectLine": string, "message": string, "healthTip": string, "nudgeType": "follow_up"|"checkup_reminder"|"seasonal" }`,
        context,
        500
      );
    } catch {
      skipped += 1;
      continue;
    }

    const rebookUrl = `${getSiteUrl()}/book?specialty=${encodeURIComponent(
      lastBooking.doctor.specialty.toLowerCase().replace(/\s+/g, "-")
    )}`;

    const delivered = await sendHealthNudgeEmail(patient.email, {
      patientName: patient.name,
      subjectLine: aiPayload.subjectLine || "Time for a health check-in",
      message: aiPayload.message,
      healthTip: aiPayload.healthTip || "Regular follow-ups help catch issues early.",
      specialty: lastBooking.doctor.specialty,
      rebookUrl,
    });

    if (!delivered) {
      skipped += 1;
      continue;
    }

    await prisma.healthNudge.create({
      data: {
        patientId: patient.id,
        bookingId: lastBooking.id,
        nudgeType,
        message: aiPayload.message,
      },
    });

    sent += 1;
  }

  return { sent, skipped, processed: patients.length };
}
