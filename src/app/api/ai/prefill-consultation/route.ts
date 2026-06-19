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

const bodySchema = z.object({
  patientId: z.string().optional(),
  doctorSpecialty: z.string().min(1),
  labReportText: z.string().optional(),
  symptomHistory: z.string().optional(),
});

type PrefillResult = {
  chiefComplaint: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
  relevantHistory: string;
  questionsForDoctor: string[];
};

function extractChiefComplaint(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/Chief complaint:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

const SYSTEM_PROMPT = `You pre-fill a teleconsultation intake form for TechDrHealth based on patient history.
Generate structured, clinically useful pre-fill data for the doctor.
Use only information provided — do not invent symptoms or history.

Return JSON: {
  "chiefComplaint": string,
  "duration": string,
  "severity": "mild"|"moderate"|"severe",
  "relevantHistory": string,
  "questionsForDoctor": string[]
}`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { doctorSpecialty, labReportText, symptomHistory } = parsed.data;
    const patientId = parsed.data.patientId ?? session?.user?.id;
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 401 });
    }

    const rateLimit = enforceAiRateLimit(req, patientId);
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const recentBookings = await prisma.booking.findMany({
      where: { patientId },
      orderBy: { scheduledAt: "desc" },
      take: 3,
      select: {
        notes: true,
        diagnosis: true,
        scheduledAt: true,
        doctor: { select: { specialty: true, displayName: true } },
      },
    });

    const bookingContext = recentBookings
      .map((booking) => {
        const complaint = extractChiefComplaint(booking.notes);
        return [
          `Date: ${booking.scheduledAt.toISOString().slice(0, 10)}`,
          `Doctor specialty: ${booking.doctor.specialty}`,
          complaint ? `Chief complaint: ${complaint}` : null,
          booking.diagnosis ? `Diagnosis: ${booking.diagnosis}` : null,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const promptParts = [
      `Target doctor specialty: ${doctorSpecialty}`,
      bookingContext ? `Recent bookings:\n${bookingContext}` : "No prior bookings on file.",
      symptomHistory?.trim() ? `Symptom chat history:\n${symptomHistory.trim()}` : null,
      labReportText?.trim() ? `Lab report excerpt:\n${labReportText.trim().slice(0, 4000)}` : null,
    ].filter(Boolean);

    let result: PrefillResult;
    try {
      result = await callClaudeJSON<PrefillResult>(
        SYSTEM_PROMPT,
        promptParts.join("\n\n"),
        900
      );
    } catch {
      return aiUnavailableResponse();
    }

    const severity =
      result.severity === "mild" || result.severity === "moderate" || result.severity === "severe"
        ? result.severity
        : "moderate";

    return NextResponse.json({
      chiefComplaint: result.chiefComplaint || "",
      duration: result.duration || "",
      severity,
      relevantHistory: result.relevantHistory || "",
      questionsForDoctor: Array.isArray(result.questionsForDoctor)
        ? result.questionsForDoctor.filter((item) => typeof item === "string")
        : [],
    });
  } catch (error) {
    return handleAiRouteError(error, "prefill-consultation");
  }
}
