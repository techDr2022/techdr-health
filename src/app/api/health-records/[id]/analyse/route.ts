import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { extractTextFromResumeFile } from "@/lib/doctor-resume-parse";
import { canAccessHealthRecord } from "@/lib/health-records";
import { prisma } from "@/lib/prisma";
import { getR2ObjectBuffer } from "@/lib/r2";
import { SPECIALTIES } from "@/data/specialties";
import { Healthrecordtype } from "@prisma/client";

const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name).join(", ");

const SYSTEM_PROMPT = `You are a lab report analysis assistant for TechDrHealth telemedicine platform.
Extract key lab values from the report text and flag abnormal results.

Rules:
- Extract as many parameters as clearly present in the report
- status must be one of: normal, low, high, critical
- recommendedAction: routine_consult, urgent_consult, or emergency
- recommendedSpecialty from: ${SPECIALTY_NAMES}
- Provide a patient-friendly summary (2-3 sentences)
- disclaimer must state this is informational only, not medical advice
- Do not invent values not present in the report

Return JSON: {
  "summary": string,
  "parameters": [{ "name", "value", "unit", "normalRange", "status" }],
  "flaggedCount": number,
  "recommendedSpecialty": string,
  "recommendedAction": "routine_consult"|"urgent_consult"|"emergency",
  "disclaimer": string
}`;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.healthrecord.findUnique({
      where: { id: id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    const allowed = canAccessHealthRecord({
      recordUserId: record.userid,
      viewerUserId: session.user.id,
      viewerRole: session.user.role ?? "PATIENT",
      sharedWith: record.sharedwith,
    });

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (record.type !== Healthrecordtype.LAB_REPORT || record.mimetype !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF lab reports can be analysed." },
        { status: 400 }
      );
    }

    const object = await getR2ObjectBuffer(record.r2key);
    if (!object) {
      return NextResponse.json({ error: "Unable to read file from storage." }, { status: 404 });
    }

    const reportText = await extractTextFromResumeFile(object.buffer, record.mimetype);
    if (reportText.length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Try a clearer scan." },
        { status: 400 }
      );
    }

    let analysis: {
      summary?: string;
      parameters?: Array<{
        name: string;
        value: string;
        unit: string;
        normalRange: string;
        status: "normal" | "low" | "high" | "critical";
      }>;
      flaggedCount?: number;
      recommendedSpecialty?: string;
      recommendedAction?: "routine_consult" | "urgent_consult" | "emergency";
      disclaimer?: string;
    };

    try {
      analysis = await callClaudeJSON(
        SYSTEM_PROMPT,
        `Analyse this lab report:\n\n${reportText.slice(0, 12000)}`,
        1500
      );
    } catch {
      return aiUnavailableResponse();
    }

    const parameters = Array.isArray(analysis.parameters)
      ? analysis.parameters.filter((item) => item?.name && item?.value)
      : [];
    const flaggedCount =
      typeof analysis.flaggedCount === "number"
        ? analysis.flaggedCount
        : parameters.filter((item) => item.status !== "normal").length;

    return NextResponse.json({
      recordId: record.id,
      summary: analysis.summary || "Lab report analysed. Review flagged values with a specialist.",
      parameters,
      flaggedCount,
      recommendedSpecialty: analysis.recommendedSpecialty || "General Medicine",
      recommendedAction:
        analysis.recommendedAction === "urgent_consult" ||
        analysis.recommendedAction === "emergency" ||
        analysis.recommendedAction === "routine_consult"
          ? analysis.recommendedAction
          : "routine_consult",
      disclaimer:
        analysis.disclaimer ||
        "This analysis is for informational purposes only and does not constitute medical advice.",
    });
  } catch (error) {
    return handleAiRouteError(error, "health-records/analyse");
  }
}
