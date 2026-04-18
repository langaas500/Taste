import { Redis } from "@upstash/redis";

// Shared Redis client for arbitrary key/value caching
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-memory fallback for local dev when Redis isn't configured
const mem = new Map<string, { val: unknown; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const v = await redis.get<T>(key);
      return v ?? null;
    } catch { return null; }
  }
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mem.delete(key);
    return null;
  }
  return entry.val as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch { /* non-fatal */ }
    return;
  }
  mem.set(key, { val: value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Simple stable hash for cache keying — 32-bit FNV-1a, hex output */
export function hashKey(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
