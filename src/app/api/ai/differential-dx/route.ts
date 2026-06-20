// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import { requireDoctorCopilotAccess } from "@/lib/ai/copilot-access";
import { logCopilotCall } from "@/lib/ai/copilot-audit";
import { COPILOT_DISCLAIMER } from "@/lib/ai/copilot-shared";
import { aiRateLimitedResponse, aiUnavailableResponse, handleAiRouteError } from "@/lib/ai/errors";
import { enforceRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  symptoms: z.string().min(5, "Describe symptoms for differential diagnosis."),
  patientAge: z.number().int().min(0).max(120).optional(),
  patientGender: z.string().max(32).optional(),
  bookingId: z.string().optional(),
});

type DifferentialItem = {
  name: string;
  icd10: string;
  confidence: "high" | "medium" | "low";
  redFlags: string[];
};

type DifferentialResponse = {
  differentials: DifferentialItem[];
};

const SYSTEM_PROMPT = `You are a clinical decision support assistant for licensed Indian physicians on TechDrHealth.
Given patient demographics and reported symptoms, suggest up to 5 differential diagnoses.
Use ICD-10 codes where applicable. Flag red flags requiring urgent in-person care.
This is decision support only — the treating physician makes the final diagnosis.

Return JSON: {
  "differentials": [
    { "name": string, "icd10": string, "confidence": "high"|"medium"|"low", "redFlags": string[] }
  ]
}`;

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

    const access = await requireDoctorCopilotAccess(parsed.data.bookingId);
    if ("error" in access) return access.error;

    const rateLimit = await enforceRateLimit({
      limiterKey: "copilot",
      identifier: `user:${access.context.doctorUserId}`,
      pathname: "/api/ai/differential-dx",
    });
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const { symptoms, patientAge, patientGender } = parsed.data;
    const contextParts = [`Symptoms: ${symptoms.trim()}`];
    if (patientAge != null) contextParts.push(`Age: ${patientAge}`);
    if (patientGender?.trim()) contextParts.push(`Gender: ${patientGender.trim()}`);

    let result: DifferentialResponse;
    try {
      result = await callClaudeJSON<DifferentialResponse>(SYSTEM_PROMPT, contextParts.join("\n"), 1200);
    } catch {
      return aiUnavailableResponse();
    }

    await logCopilotCall({
      doctorUserId: access.context.doctorUserId,
      bookingId: access.context.bookingId,
      endpoint: "differential-dx",
      inputSummary: contextParts.join(" · "),
    });

    return NextResponse.json({
      differentials: (result.differentials ?? []).slice(0, 5),
      disclaimer: COPILOT_DISCLAIMER,
    });
  } catch (error) {
    return handleAiRouteError(error, "differential-dx");
  }
}
