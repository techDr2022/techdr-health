// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import { findDoctorsBySpecialties } from "@/lib/ai/doctor-match";
import {
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import {
  buildSymptomCheckSystemPrompt,
  getSpecialtyDisplayNames,
  normalizeLanguage,
  SPECIALTY_NAMES,
} from "@/lib/i18n";

const bodySchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
  patientAge: z.number().int().min(0).max(120).optional(),
  patientGender: z.string().max(32).optional(),
  patientId: z.string().optional(),
  language: z.enum(["en", "hi", "te"]).optional(),
});

type SymptomAnalysis = {
  specialties: string[];
  localizedSpecialtyLabels?: string[];
  urgencyLevel: "emergency" | "urgent" | "routine";
  reasoning: string;
};

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

    const { symptoms, patientAge, patientGender, patientId, language } = parsed.data;
    const lang = normalizeLanguage(language);

    const contextParts = [`Symptoms: ${symptoms.trim()}`, `Preferred response language: ${lang}`];
    if (patientAge != null) contextParts.push(`Age: ${patientAge}`);
    if (patientGender?.trim()) contextParts.push(`Gender: ${patientGender.trim()}`);

    const systemPrompt = buildSymptomCheckSystemPrompt(lang, SPECIALTY_NAMES);

    let analysis: SymptomAnalysis;
    try {
      analysis = await callClaudeJSON<SymptomAnalysis>(
        systemPrompt,
        contextParts.join("\n"),
        800
      );
    } catch {
      return aiUnavailableResponse();
    }

    const specialties = Array.isArray(analysis.specialties)
      ? analysis.specialties.filter((item) => typeof item === "string")
      : [];
    const displaySpecialties = getSpecialtyDisplayNames(
      specialties,
      analysis.localizedSpecialtyLabels,
      lang
    );
    const urgencyLevel =
      analysis.urgencyLevel === "emergency" ||
      analysis.urgencyLevel === "urgent" ||
      analysis.urgencyLevel === "routine"
        ? analysis.urgencyLevel
        : "routine";

    const recommendedDoctors = await findDoctorsBySpecialties(specialties, 6);

    return NextResponse.json({
      specialties: displaySpecialties,
      urgencyLevel,
      reasoning:
        analysis.reasoning ||
        (lang === "hi"
          ? "आपके लक्षणों के आधार पर, हम एक विशेषज्ञ से परामर्श की सलाह देते हैं।"
          : lang === "te"
            ? "మీ లక్షణాల ఆధారంగా, నిపుణుడిని సంప్రదించాలని మేము సూచిస్తున్నాము."
            : "Based on your symptoms, we recommend consulting a specialist."),
      recommendedDoctors,
      language: lang,
    });
  } catch (error) {
    return handleAiRouteError(error, "symptom-check");
  }
}
