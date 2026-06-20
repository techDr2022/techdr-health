// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import { requireDoctorCopilotAccess } from "@/lib/ai/copilot-access";
import { logCopilotCall } from "@/lib/ai/copilot-audit";
import { COPILOT_DISCLAIMER } from "@/lib/ai/copilot-shared";
import { aiRateLimitedResponse, aiUnavailableResponse, handleAiRouteError } from "@/lib/ai/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getCachedGuidelines, setCachedGuidelines } from "@/lib/clinical-guidelines-cache";

const bodySchema = z.object({
  condition: z.string().min(2, "Enter a condition or diagnosis."),
  bookingId: z.string().optional(),
});

type GuidelineCard = {
  title: string;
  summary: string;
  keyPoints: string[];
  referralCriteria: string[];
  source: string;
};

type GuidelinesResponse = {
  cards: GuidelineCard[];
};

const SYSTEM_PROMPT = `You are a clinical guidelines reference assistant for Indian physicians on TechDrHealth.
Provide concise quick-reference cards aligned with NMC/WHO/ICMR-style practice where applicable.
Do not invent specific guideline document numbers — cite general sources (NMC, WHO, ICMR).
Keep each card practical for a teleconsultation context.

Return JSON: {
  "cards": [
    {
      "title": string,
      "summary": string,
      "keyPoints": string[],
      "referralCriteria": string[],
      "source": string
    }
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
      pathname: "/api/ai/clinical-guidelines",
    });
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const condition = parsed.data.condition.trim();
    const cached = await getCachedGuidelines(condition);
    if (cached) {
      return NextResponse.json({
        ...JSON.parse(cached),
        cached: true,
        disclaimer: COPILOT_DISCLAIMER,
      });
    }

    let result: GuidelinesResponse;
    try {
      result = await callClaudeJSON<GuidelinesResponse>(
        SYSTEM_PROMPT,
        `Condition: ${condition}`,
        1400
      );
    } catch {
      return aiUnavailableResponse();
    }

    const payload = {
      cards: (result.cards ?? []).slice(0, 4),
      cached: false,
    };
    await setCachedGuidelines(condition, JSON.stringify(payload));

    await logCopilotCall({
      doctorUserId: access.context.doctorUserId,
      bookingId: access.context.bookingId,
      endpoint: "clinical-guidelines",
      inputSummary: condition,
    });

    return NextResponse.json({
      ...payload,
      disclaimer: COPILOT_DISCLAIMER,
    });
  } catch (error) {
    return handleAiRouteError(error, "clinical-guidelines");
  }
}
