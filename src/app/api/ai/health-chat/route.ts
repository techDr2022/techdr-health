// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiRateLimitedResponse,
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { enforceAiRateLimit } from "@/lib/ai/rate-limit";
import { SPECIALTIES } from "@/data/specialties";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  patientId: z.string().optional(),
});

type HealthChatResponse = {
  reply: string;
  suggestBooking: boolean;
  suggestedSpecialty?: string;
};

const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name).join(", ");

const SYSTEM_PROMPT = `You are HealthGuide, a helpful medical navigation assistant for TechDrHealth.
You help patients understand their symptoms and decide whether they need a consultation.
You DO NOT diagnose. You DO triage urgency and recommend the right specialist.
Always end responses with a clear next step: book a consultation, go to ER, or monitor at home.
If the user's symptoms suggest emergency, always recommend calling emergency services immediately.
Keep responses concise (under 150 words). Be warm, clear, and reassuring.

Available specialties include: ${SPECIALTY_NAMES}

Return JSON: { "reply": string, "suggestBooking": boolean, "suggestedSpecialty": string | null }`;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { messages, patientId } = parsed.data;
    const rateLimit = enforceAiRateLimit(req, patientId);
    if (rateLimit.blocked) {
      return aiRateLimitedResponse(rateLimit.retryAfter);
    }

    const conversation = messages
      .map((message) => `${message.role === "user" ? "Patient" : "HealthGuide"}: ${message.content}`)
      .join("\n");

    let response: HealthChatResponse;
    try {
      response = await callClaudeJSON<HealthChatResponse>(
        SYSTEM_PROMPT,
        conversation,
        600
      );
    } catch {
      return aiUnavailableResponse();
    }

    return NextResponse.json({
      reply: response.reply || "I'm here to help you find the right care. Could you tell me more about your symptoms?",
      suggestBooking: Boolean(response.suggestBooking),
      suggestedSpecialty: response.suggestedSpecialty || undefined,
    });
  } catch (error) {
    return handleAiRouteError(error, "health-chat");
  }
}
