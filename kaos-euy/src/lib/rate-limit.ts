export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

const BUCKETS = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = BUCKETS.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    BUCKETS.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfterMs = Math.max(0, existing.resetAt - now);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfter: Math.ceil(retryAfterMs / 1000),
    };
  }

  existing.count += 1;
  BUCKETS.set(key, existing);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfter: Math.ceil((existing.resetAt - now) / 1000),
  };
}
