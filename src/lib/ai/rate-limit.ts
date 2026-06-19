// AI-POWERED
type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

export function checkAiRateLimit(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

export function getRateLimitKey(req: Request, patientId?: string): string {
  if (patientId?.trim()) return `patient:${patientId.trim()}`;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  return `ip:${forwarded || realIp || "unknown"}`;
}

export function enforceAiRateLimit(req: Request, patientId?: string) {
  const key = getRateLimitKey(req, patientId);
  const result = checkAiRateLimit(key);
  if (!result.ok) {
    return {
      blocked: true as const,
      retryAfter: result.retryAfter ?? 3600,
    };
  }
  return { blocked: false as const };
}
