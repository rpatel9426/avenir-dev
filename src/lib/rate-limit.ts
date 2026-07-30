/**
 * A tiny in-memory fixed-window rate limiter.
 *
 * Good enough for the MVP: it caps how often a single client can hit the
 * (paid) coaching endpoint, protecting against a runaway loop or abuse driving
 * up token cost. It lives in process memory, so it resets on cold starts and
 * isn't shared across serverless instances — for production, swap the body for
 * Upstash Redis (`@upstash/ratelimit`). The call sites don't change.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key        stable identifier for the caller (user id or IP)
 * @param limit      max requests allowed per window
 * @param windowMs   window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client identifier from request headers (proxy-aware). */
export function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}
