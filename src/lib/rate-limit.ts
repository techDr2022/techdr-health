import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/request-ip";

export type RateLimiterKey = "ai" | "auth" | "booking" | "copilot" | "default";

type LimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

const LIMITER_CONFIG: Record<RateLimiterKey, { tokens: number; window: string; windowMs: number }> = {
  ai: { tokens: 10, window: "1 m", windowMs: 60_000 },
  auth: { tokens: 5, window: "15 m", windowMs: 15 * 60_000 },
  booking: { tokens: 20, window: "1 h", windowMs: 60 * 60_000 },
  copilot: { tokens: 30, window: "1 h", windowMs: 60 * 60_000 },
  default: { tokens: 60, window: "1 m", windowMs: 60_000 },
};

const redis =
  process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL.trim(),
        token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
      })
    : null;

function buildUpstashLimiter(key: RateLimiterKey) {
  if (!redis) return null;
  const config = LIMITER_CONFIG[key];
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      config.tokens,
      config.window as `${number} s` | `${number} m` | `${number} h` | `${number} d`
    ),
    prefix: `techdr:rl:${key}`,
    analytics: true,
  });
}

export const rateLimiters: Record<RateLimiterKey, Ratelimit | null> = {
  ai: buildUpstashLimiter("ai"),
  auth: buildUpstashLimiter("auth"),
  booking: buildUpstashLimiter("booking"),
  copilot: buildUpstashLimiter("copilot"),
  default: buildUpstashLimiter("default"),
};

class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private max: number,
    private windowMs: number
  ) {}

  async limit(identifier: string): Promise<LimitResult> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { success: true, remaining: this.max - 1, reset: resetAt };
    }

    if (entry.count >= this.max) {
      return { success: false, remaining: 0, reset: entry.resetAt };
    }

    entry.count += 1;
    return { success: true, remaining: this.max - entry.count, reset: entry.resetAt };
  }
}

const memoryLimiters: Record<RateLimiterKey, MemoryRateLimiter> = {
  ai: new MemoryRateLimiter(LIMITER_CONFIG.ai.tokens, LIMITER_CONFIG.ai.windowMs),
  auth: new MemoryRateLimiter(LIMITER_CONFIG.auth.tokens, LIMITER_CONFIG.auth.windowMs),
  booking: new MemoryRateLimiter(LIMITER_CONFIG.booking.tokens, LIMITER_CONFIG.booking.windowMs),
  copilot: new MemoryRateLimiter(LIMITER_CONFIG.copilot.tokens, LIMITER_CONFIG.copilot.windowMs),
  default: new MemoryRateLimiter(LIMITER_CONFIG.default.tokens, LIMITER_CONFIG.default.windowMs),
};

export function resolveRateLimiterKey(pathname: string): RateLimiterKey {
  if (
    pathname === "/api/ai/differential-dx" ||
    pathname === "/api/ai/drug-interactions" ||
    pathname === "/api/ai/clinical-guidelines"
  ) {
    return "copilot";
  }
  if (pathname.startsWith("/api/ai/") || /\/api\/health-records\/[^/]+\/analyse$/.test(pathname)) {
    return "ai";
  }
  if (pathname.startsWith("/api/auth/")) return "auth";
  if (
    pathname === "/api/bookings/create-order" ||
    pathname.startsWith("/api/bookings/manage")
  ) {
    return "booking";
  }
  return "default";
}

export function buildRateLimitIdentifier(req: NextRequest, userId?: string | null): string {
  const limiterKey = resolveRateLimiterKey(req.nextUrl.pathname);
  if (limiterKey === "auth") {
    return `ip:${getClientIp(req) ?? "unknown"}`;
  }
  if (userId?.trim()) {
    return `user:${userId.trim()}`;
  }
  return `ip:${getClientIp(req) ?? "unknown"}`;
}

export function buildRateLimitIdentifierFromRequest(
  req: Request,
  pathname: string,
  userId?: string | null
): string {
  const limiterKey = resolveRateLimiterKey(pathname);
  if (limiterKey === "auth") {
    return `ip:${getIpFromRequest(req)}`;
  }
  if (userId?.trim()) {
    return `user:${userId.trim()}`;
  }
  return `ip:${getIpFromRequest(req)}`;
}

function getIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 45);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 45);
  return "unknown";
}

async function runRateLimit(limiterKey: RateLimiterKey, identifier: string): Promise<LimitResult> {
  const upstash = rateLimiters[limiterKey];
  if (upstash) {
    const result = await upstash.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }
  return memoryLimiters[limiterKey].limit(`${limiterKey}:${identifier}`);
}

export function rateLimitExceededResponse(retryAfter: number, message = "Too many requests.") {
  return NextResponse.json(
    { error: message, retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfter)) },
    }
  );
}

export async function enforceRateLimit(args: {
  limiterKey: RateLimiterKey;
  identifier: string;
  pathname?: string;
}) {
  const result = await runRateLimit(args.limiterKey, args.identifier);
  if (result.success) {
    return { blocked: false as const, remaining: result.remaining };
  }

  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  console.warn("[rate-limit] blocked", {
    limiter: args.limiterKey,
    identifier: args.identifier,
    pathname: args.pathname,
    retryAfter,
  });

  return { blocked: true as const, retryAfter, remaining: 0 };
}

export async function checkApiRateLimit(req: NextRequest, userId?: string | null) {
  const pathname = req.nextUrl.pathname;
  const limiterKey = resolveRateLimiterKey(pathname);
  const identifier = buildRateLimitIdentifier(req, userId);
  const result = await enforceRateLimit({ limiterKey, identifier, pathname });

  if (result.blocked) {
    return rateLimitExceededResponse(result.retryAfter);
  }
  return null;
}

type RouteHandler = (req: NextRequest, context?: unknown) => Promise<Response> | Response;

export function withRateLimit(
  limiterKey: RateLimiterKey,
  handler: RouteHandler,
  options?: {
    resolveUserId?: (req: NextRequest) => Promise<string | null | undefined> | string | null | undefined;
  }
): RouteHandler {
  return async (req, context) => {
    const userId = options?.resolveUserId ? await options.resolveUserId(req) : null;
    const pathname = req.nextUrl.pathname;
    const identifier =
      limiterKey === "auth"
        ? `ip:${getClientIp(req) ?? "unknown"}`
        : userId?.trim()
          ? `user:${userId.trim()}`
          : `ip:${getClientIp(req) ?? "unknown"}`;

    const result = await enforceRateLimit({ limiterKey, identifier, pathname });
    if (result.blocked) {
      return rateLimitExceededResponse(result.retryAfter);
    }

    return handler(req, context);
  };
}

/** @deprecated Use checkApiRateLimit middleware or enforceRateLimit instead. */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const limiter = new MemoryRateLimiter(maxRequests, windowSeconds * 1000);
  const result = await limiter.limit(key);
  return !result.success;
}
