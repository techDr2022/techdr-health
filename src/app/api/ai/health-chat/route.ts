// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import {
  buildHealthChatSystemPrompt,
  normalizeLanguage,
  SPECIALTY_NAMES,
} from "@/lib/i18n";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  patientId: z.string().optional(),
  language: z.enum(["en", "hi", "te"]).optional(),
});

type HealthChatResponse = {
  reply: string;
  suggestBooking: boolean;
  suggestedSpecialty?: string;
};

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { messages, language } = parsed.data;
    const lang = normalizeLanguage(language);

    const conversation = messages
      .map((message) => `${message.role === "user" ? "Patient" : "HealthGuide"}: ${message.content}`)
      .join("\n");

    const systemPrompt = buildHealthChatSystemPrompt(lang, SPECIALTY_NAMES);

    let response: HealthChatResponse;
    try {
      response = await callClaudeJSON<HealthChatResponse>(systemPrompt, conversation, 600);
    } catch {
      return aiUnavailableResponse();
    }

    return NextResponse.json({
      reply:
        response.reply ||
        (lang === "hi"
          ? "मैं आपकी सही देखभाल खोजने में मदद करने के लिए यहाँ हूँ। कृपया अपने लक्षण थोड़ा और बताएँ।"
          : lang === "te"
            ? "సరైన సంరక్షణ కనుగొనడంలో నేను సహాయం చేయడానికి ఇక్కడ ఉన్నాను. దయచేసి మీ లక్షణాలను కొంచెం వివరించండి."
            : "I'm here to help you find the right care. Could you tell me more about your symptoms?"),
      suggestBooking: Boolean(response.suggestBooking),
      suggestedSpecialty: response.suggestedSpecialty || undefined,
      language: lang,
    });
  } catch (error) {
    return handleAiRouteError(error, "health-chat");
  }
}
