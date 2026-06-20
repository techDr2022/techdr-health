// AI-POWERED
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { extractTextFromResumeFile } from "@/lib/doctor-resume-parse";
import { buildR2PublicUrl, getR2Client, getR2Config } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { SPECIALTIES } from "@/data/specialties";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type LabParameter = {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "low" | "high" | "critical";
};

type LabAnalysis = {
  summary: string;
  parameters: LabParameter[];
  flaggedCount: number;
  recommendedSpecialty: string;
  recommendedAction: "routine_consult" | "urgent_consult" | "emergency";
  disclaimer: string;
};

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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const patientId = String(formData.get("patientId") ?? "").trim() || undefined;
    const bookingId = String(formData.get("bookingId") ?? "").trim() || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF lab reports are supported." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const reportText = await extractTextFromResumeFile(buffer, file.type);
    if (reportText.length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Try a clearer scan." },
        { status: 400 }
      );
    }

    const objectKey = `lab-reports/ai/${Date.now()}-${randomUUID()}.pdf`;
    try {
      const r2Config = getR2Config();
      await getR2Client().send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: objectKey,
          Body: buffer,
          ContentType: file.type,
          CacheControl: "private, max-age=0, no-cache",
        })
      );
    } catch (uploadError) {
      console.error("[ai/analyse-lab-report] upload failed", uploadError);
    }

    let analysis: LabAnalysis;
    try {
      analysis = await callClaudeJSON<LabAnalysis>(
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

    const result = {
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
      fileUrl: buildR2PublicUrl(objectKey),
    };

    if (bookingId) {
      await prisma.booking
        .update({
          where: { id: bookingId },
          data: { labReportAnalysis: result },
        })
        .catch(() => undefined);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleAiRouteError(error, "analyse-lab-report");
  }
}
