const store = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return false;
  }

  if (existing.count >= maxRequests) return true;

  store.set(key, { count: existing.count + 1, resetAt: existing.resetAt });
  return false;
}
