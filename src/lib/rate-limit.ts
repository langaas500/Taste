import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Upstash Redis (used when env vars are configured) ---
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Pre-configured Upstash limiters (created once, reused across requests)
const upstashLimiters = redis
  ? {
      join: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:join" }),
      recommendations: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:recs" }),
      tasteSummary: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "60 s"), prefix: "rl:taste" }),
      tmdb: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "rl:tmdb" }),
      curator: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:curator" }),
    }
  : null;

// --- In-memory fallback (fixed window, resets on cold start) ---
const memStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup — prevent unbounded growth
if (typeof globalThis !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of memStore) {
      if (now > val.resetAt) memStore.delete(key);
    }
  }, 300_000); // every 5 min
  // Prevent timer from keeping Node alive
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}

function memoryCheck(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfterSec: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);
    return { success: false, retryAfterSec };
  }

  entry.count++;
  return { success: true, retryAfterSec: 0 };
}

// --- Public API ---

export type RateLimitBucket = "join" | "recommendations" | "tasteSummary" | "tmdb" | "curator";

const BUCKET_CONFIG: Record<RateLimitBucket, { limit: number; windowMs: number }> = {
  join: { limit: 10, windowMs: 60_000 },
  recommendations: { limit: 5, windowMs: 60_000 },
  tasteSummary: { limit: 3, windowMs: 60_000 },
  tmdb: { limit: 30, windowMs: 60_000 },
  curator: { limit: 10, windowMs: 60_000 },
};

/**
 * Apply rate limiting for the given bucket and identifier.
 * Returns a 429 NextResponse if the limit is exceeded, or null if allowed.
 *
 * Usage:
 *   const limited = await applyRateLimit("join", ip);
 *   if (limited) return limited;
 */
export async function applyRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<NextResponse | null> {
  // Upstash path
  if (upstashLimiters) {
    const limiter = upstashLimiters[bucket];
    const result = await limiter.limit(identifier);
    if (!result.success) {
      const retryAfter = Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1);
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
    return null;
  }

  // In-memory fallback
  const cfg = BUCKET_CONFIG[bucket];
  const result = memoryCheck(`${bucket}:${identifier}`, cfg.limit, cfg.windowMs);
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
    );
  }
  return null;
}

/**
 * Extract client IP from a NextRequest (works on Vercel and local dev).
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
