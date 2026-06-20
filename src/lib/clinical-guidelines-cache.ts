import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL.trim(),
        token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
      })
    : null;

const TTL_SECONDS = 24 * 60 * 60;
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

function cacheKey(condition: string) {
  return `techdr:guidelines:${condition.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

export async function getCachedGuidelines(condition: string): Promise<string | null> {
  const key = cacheKey(condition);
  if (redis) {
    const value = await redis.get<string>(key);
    return value ?? null;
  }

  const entry = memoryCache.get(key);
  if (!entry || Date.now() >= entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function setCachedGuidelines(condition: string, payload: string) {
  const key = cacheKey(condition);
  if (redis) {
    await redis.set(key, payload, { ex: TTL_SECONDS });
    return;
  }
  memoryCache.set(key, { value: payload, expiresAt: Date.now() + TTL_SECONDS * 1000 });
}
