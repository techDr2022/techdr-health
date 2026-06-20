// AI-POWERED
import type { NextRequest } from "next/server";
import { enforceRateLimit, buildRateLimitIdentifierFromRequest } from "@/lib/rate-limit";

export function getRateLimitKey(req: Request, userId?: string): string {
  const pathname = new URL(req.url).pathname;
  return buildRateLimitIdentifierFromRequest(req, pathname, userId);
}

export async function enforceAiRateLimit(req: Request, userId?: string) {
  const pathname = new URL(req.url).pathname;
  const identifier = buildRateLimitIdentifierFromRequest(req, pathname, userId);
  const result = await enforceRateLimit({
    limiterKey: "ai",
    identifier,
    pathname,
  });

  if (result.blocked) {
    return {
      blocked: true as const,
      retryAfter: result.retryAfter,
    };
  }
  return { blocked: false as const };
}

export async function enforceAiRateLimitFromRequest(req: NextRequest, userId?: string | null) {
  const pathname = req.nextUrl.pathname;
  const limiterKey =
    pathname === "/api/ai/differential-dx" ||
    pathname === "/api/ai/drug-interactions" ||
    pathname === "/api/ai/clinical-guidelines"
      ? ("copilot" as const)
      : ("ai" as const);
  const identifier = userId?.trim()
    ? `user:${userId.trim()}`
    : `ip:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown"}`;

  const result = await enforceRateLimit({
    limiterKey,
    identifier,
    pathname,
  });

  if (result.blocked) {
    return {
      blocked: true as const,
      retryAfter: result.retryAfter,
    };
  }
  return { blocked: false as const };
}
