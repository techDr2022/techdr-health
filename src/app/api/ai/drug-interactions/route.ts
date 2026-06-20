// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import { requireDoctorCopilotAccess } from "@/lib/ai/copilot-access";
import { logCopilotCall } from "@/lib/ai/copilot-audit";
import { COPILOT_DISCLAIMER } from "@/lib/ai/copilot-shared";
import { aiRateLimitedResponse, aiUnavailableResponse, handleAiRouteError } from "@/lib/ai/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SCHEDULE_X, validateDrugForConsult } from "@/lib/drug-restrictions";

const bodySchema = z.object({
  drugs: z.string().min(2, "Enter at least one drug name."),
  bookingId: z.string().optional(),
});

type InteractionSeverity = "MILD" | "MODERATE" | "SEVERE";

type InteractionItem = {
  drugs: string[];
  severity: InteractionSeverity;
  description: string;
  scheduleXFlag?: boolean;
};

type DrugInteractionResponse = {
  interactions: InteractionItem[];
};

const SYSTEM_PROMPT = `You are a pharmacology assistant for licensed Indian physicians on TechDrHealth.
Check drug-drug interactions for the listed medicines. Consider common clinically significant interactions.
Severity: MILD (monitor), MODERATE (adjust dose/monitor closely), SEVERE (avoid combination).
Flag narcotics, benzodiazepines, and psychotropics with extra caution.

Return JSON: {
  "interactions": [
    { "drugs": string[], "severity": "MILD"|"MODERATE"|"SEVERE", "description": string }
  ]
}`;

function parseDrugList(raw: string): string[] {
  return [...new Set(raw.split(/[,;\n]+/).map((d) => d.trim()).filter(Boolean))];
}

function normalizeScheduleX(raw: string): string {
  return raw.trim().toLowerCase();
}

function findScheduleXMatch(drug: string): string | null {
  const normalized = normalizeScheduleX(drug);
  for (const keyword of SCHEDULE_X) {
    if (normalized.includes(keyword)) return keyword;
  }
  return null;
}

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
      pathname: "/api/ai/drug-interactions",
    });
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const drugs = parseDrugList(parsed.data.drugs);
    if (drugs.length === 0) {
      return NextResponse.json({ error: "Enter at least one drug name." }, { status: 400 });
    }

    const scheduleXWarnings = drugs
      .map((drug) => {
        const match = findScheduleXMatch(drug);
        if (!match) return null;
        const validation = validateDrugForConsult(drug, "VIDEO", false);
        return {
          drug,
          schedule: "X" as const,
          reason: validation.reason ?? `Schedule X drug (${match}) — not permitted via telemedicine (TPG 2020).`,
        };
      })
      .filter(Boolean);

    let aiInteractions: InteractionItem[] = [];
    if (drugs.length >= 2) {
      try {
        const result = await callClaudeJSON<DrugInteractionResponse>(
          SYSTEM_PROMPT,
          `Drugs: ${drugs.join(", ")}`,
          1200
        );
        aiInteractions = result.interactions ?? [];
      } catch {
        return aiUnavailableResponse();
      }
    }

    const scheduleXInteractions: InteractionItem[] = scheduleXWarnings.map((warning) => ({
      drugs: [warning!.drug],
      severity: "SEVERE" as const,
      description: warning!.reason,
      scheduleXFlag: true,
    }));

    const merged = [...scheduleXInteractions];
    for (const item of aiInteractions) {
      const hasScheduleDrug = item.drugs.some((drug) => findScheduleXMatch(drug));
      merged.push({
        ...item,
        severity: hasScheduleDrug ? "SEVERE" : item.severity,
        scheduleXFlag: hasScheduleDrug || item.scheduleXFlag,
      });
    }

    await logCopilotCall({
      doctorUserId: access.context.doctorUserId,
      bookingId: access.context.bookingId,
      endpoint: "drug-interactions",
      inputSummary: drugs.join(", "),
    });

    return NextResponse.json({
      interactions: merged,
      scheduleXWarnings,
      disclaimer: COPILOT_DISCLAIMER,
    });
  } catch (error) {
    return handleAiRouteError(error, "drug-interactions");
  }
}
