// AI-POWERED
import { NextResponse } from "next/server";

export function aiUnavailableResponse(message = "AI temporarily unavailable") {
  return NextResponse.json({ error: message, fallback: true }, { status: 503 });
}

export function aiRateLimitedResponse(retryAfter: number) {
  return NextResponse.json(
    {
      error: "Too many AI requests. Please try again later.",
      fallback: true,
      retryAfter,
    },
    { status: 429 }
  );
}

export function handleAiRouteError(error: unknown, context: string) {
  console.error(`[ai/${context}]`, error);
  return aiUnavailableResponse();
}
