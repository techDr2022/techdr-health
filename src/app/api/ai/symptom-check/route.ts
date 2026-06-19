// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { SPECIALTIES } from "@/data/specialties";
import { callClaudeJSON } from "@/lib/ai/client";
import { findDoctorsBySpecialties } from "@/lib/ai/doctor-match";
import {
  aiRateLimitedResponse,
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { enforceAiRateLimit } from "@/lib/ai/rate-limit";

const bodySchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
  patientAge: z.number().int().min(0).max(120).optional(),
  patientGender: z.string().max(32).optional(),
  patientId: z.string().optional(),
});

type SymptomAnalysis = {
  specialties: string[];
  urgencyLevel: "emergency" | "urgent" | "routine";
  reasoning: string;
};

const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name).join(", ");

const SYSTEM_PROMPT = `You are a medical triage assistant for TechDrHealth, a telemedicine platform in India.
Given patient symptoms, identify the most relevant medical specialties and urgency level.

Rules:
- Map symptoms to 1-3 specialties from this list when possible: ${SPECIALTY_NAMES}
- urgencyLevel must be one of: emergency, urgent, routine
- emergency: life-threatening (chest pain with radiation, stroke signs, severe breathing difficulty, heavy bleeding, loss of consciousness)
- urgent: needs consultation within 24-48 hours (persistent fever, worsening pain, significant functional impact)
- routine: can wait for scheduled teleconsultation
- Provide clear, patient-friendly reasoning in 2-3 sentences
- You do NOT diagnose — you suggest which specialist to consult
- Return JSON: { "specialties": string[], "urgencyLevel": "emergency"|"urgent"|"routine", "reasoning": string }`;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { symptoms, patientAge, patientGender, patientId } = parsed.data;
    const rateLimit = enforceAiRateLimit(req, patientId);
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const contextParts = [`Symptoms: ${symptoms.trim()}`];
    if (patientAge != null) contextParts.push(`Age: ${patientAge}`);
    if (patientGender?.trim()) contextParts.push(`Gender: ${patientGender.trim()}`);

    let analysis: SymptomAnalysis;
    try {
      analysis = await callClaudeJSON<SymptomAnalysis>(
        SYSTEM_PROMPT,
        contextParts.join("\n"),
        800
      );
    } catch {
      return aiUnavailableResponse();
    }

    const specialties = Array.isArray(analysis.specialties)
      ? analysis.specialties.filter((item) => typeof item === "string")
      : [];
    const urgencyLevel =
      analysis.urgencyLevel === "emergency" ||
      analysis.urgencyLevel === "urgent" ||
      analysis.urgencyLevel === "routine"
        ? analysis.urgencyLevel
        : "routine";

    const recommendedDoctors = await findDoctorsBySpecialties(specialties, 6);

    return NextResponse.json({
      specialties,
      urgencyLevel,
      reasoning: analysis.reasoning || "Based on your symptoms, we recommend consulting a specialist.",
      recommendedDoctors,
    });
  } catch (error) {
    return handleAiRouteError(error, "symptom-check");
  }
}
