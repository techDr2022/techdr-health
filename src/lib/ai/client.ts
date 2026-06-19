// AI-POWERED
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

export const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export function isAiConfigured(): boolean {
  return Boolean(anthropic);
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1000
): Promise<string> {
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}

export async function callClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1000
): Promise<T> {
  const raw = await callClaude(
    `${systemPrompt}\n\nRespond ONLY with valid JSON. No preamble, no markdown.`,
    userMessage,
    maxTokens
  );
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as T;
}
