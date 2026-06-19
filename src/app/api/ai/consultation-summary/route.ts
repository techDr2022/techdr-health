// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiRateLimitedResponse,
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { enforceAiRateLimit } from "@/lib/ai/rate-limit";
import { prisma } from "@/lib/prisma";
import { resolveConsultationAccess } from "@/lib/consultation-access";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  chiefComplaint: z.string().min(1),
  doctorNotes: z.string().optional(),
  specialty: z.string().min(1),
  joinToken: z.string().optional(),
});

type Medication = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type ConsultationSummary = {
  summary: string;
  diagnosis: string;
  medications: Medication[];
  followUpRecommendation: string;
  lifestyle: string[];
};

const SYSTEM_PROMPT = `You are a clinical documentation assistant for TechDrHealth doctors in India.
Generate a draft consultation summary and prescription template based on the chief complaint, doctor notes, and specialty.
This is a DRAFT for doctor review — be conservative, evidence-based, and note when in-person evaluation is needed.

Return JSON: {
  "summary": string,
  "diagnosis": string,
  "medications": [{ "name", "dosage", "duration", "instructions" }],
  "followUpRecommendation": string,
  "lifestyle": string[]
}`;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { bookingId, chiefComplaint, doctorNotes, specialty, joinToken } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { userId: true } },
        consultationRoom: { select: { chatLog: true, durationSeconds: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const session = await auth();
    const access = await resolveConsultationAccess(
      bookingId,
      booking,
      joinToken?.trim() || null
    );
    const isDoctor =
      access?.role === "doctor" ||
      (session?.user?.id === booking.doctor.userId && session.user.role === "DOCTOR");

    if (!isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = enforceAiRateLimit(req, session?.user?.id);
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const chatSnippet =
      booking.consultationRoom?.chatLog != null
        ? JSON.stringify(booking.consultationRoom.chatLog).slice(0, 2000)
        : "";

    const prompt = [
      `Specialty: ${specialty}`,
      `Chief complaint: ${chiefComplaint}`,
      doctorNotes?.trim() ? `Doctor notes: ${doctorNotes.trim()}` : null,
      chatSnippet ? `Consultation chat excerpt: ${chatSnippet}` : null,
      booking.consultationRoom?.durationSeconds
        ? `Consultation duration: ${booking.consultationRoom.durationSeconds} seconds`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    let draft: ConsultationSummary;
    try {
      draft = await callClaudeJSON<ConsultationSummary>(SYSTEM_PROMPT, prompt, 1200);
    } catch {
      return aiUnavailableResponse();
    }

    const medications = Array.isArray(draft.medications)
      ? draft.medications.filter((item) => item?.name)
      : [];

    const aiDraft = {
      summary: draft.summary || "",
      diagnosis: draft.diagnosis || "",
      medications,
      followUpRecommendation: draft.followUpRecommendation || "",
      lifestyle: Array.isArray(draft.lifestyle) ? draft.lifestyle : [],
    };

    await prisma.prescription.upsert({
      where: { bookingId },
      update: { aiDraft, aiUsed: true },
      create: {
        bookingId,
        patientId: booking.patientId,
        doctorId: booking.doctorId,
        diagnosis: aiDraft.diagnosis || "Pending review",
        medicines: medications,
        aiDraft,
        aiUsed: true,
      },
    });

    return NextResponse.json(aiDraft);
  } catch (error) {
    return handleAiRouteError(error, "consultation-summary");
  }
}
