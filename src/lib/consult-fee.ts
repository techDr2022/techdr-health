import type { ConsultType } from "@prisma/client";

export const CONSULT_TYPE_MULTIPLIERS: Record<ConsultType, number> = {
  VIDEO: 1,
  AUDIO: 0.85,
  CHAT: 0.6,
};

export const CONSULT_TYPE_LABELS: Record<ConsultType, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  CHAT: "Chat",
};

export function getConsultFeeForType(baseFee: number, consultType: ConsultType): number {
  const multiplier = CONSULT_TYPE_MULTIPLIERS[consultType] ?? 1;
  return Math.max(Math.round(baseFee * multiplier), 1);
}

export function parseConsultType(value: unknown): ConsultType {
  const upper = String(value ?? "VIDEO").toUpperCase();
  if (upper === "AUDIO" || upper === "CHAT" || upper === "VIDEO") return upper;
  return "VIDEO";
}
