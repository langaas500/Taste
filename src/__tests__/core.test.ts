import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── 1. Guest token round-trip ────────────────────────────────────────────────

describe("guest-token", () => {
  beforeEach(() => {
    vi.stubEnv("GUEST_TOKEN_SECRET", "test-secret-key-for-ci");
  });

  it("generateGuestToken → verifyGuestToken round-trip succeeds", async () => {
    const { generateGuestToken, verifyGuestToken } = await import(
      "@/lib/guest-token"
    );

    const guestId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const sessionId = "sess-001";

    const token = generateGuestToken(guestId, sessionId);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(4);

    const result = verifyGuestToken(token, sessionId);
    expect(result).not.toBeNull();
    expect(result!.guestId).toBe(guestId);
  });

  it("verifyGuestToken rejects wrong sessionId", async () => {
    const { generateGuestToken, verifyGuestToken } = await import(
      "@/lib/guest-token"
    );

    const guestId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const token = generateGuestToken(guestId, "sess-001");

    const result = verifyGuestToken(token, "sess-wrong");
    expect(result).toBeNull();
  });

  it("verifyGuestToken rejects tampered token", async () => {
    const { generateGuestToken, verifyGuestToken } = await import(
      "@/lib/guest-token"
    );

    const guestId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const token = generateGuestToken(guestId, "sess-001");

    // Tamper with signature
    const tampered = token.slice(0, -3) + "xxx";
    const result = verifyGuestToken(tampered, "sess-001");
    expect(result).toBeNull();
  });
});

// ─── 2. req.json() error handling returns 400 ─────────────────────────────────

describe("API error handling", () => {
  it("returns 400 on invalid JSON body", async () => {
    // Simulate the standard pattern used across all mutation routes:
    //   let body; try { body = await req.json(); } catch { return 400; }
    const { NextResponse } = await import("next/server");

    async function handleRequest(req: { json(): Promise<unknown> }) {
      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }
      return NextResponse.json({ ok: true, body });
    }

    const badReq = {
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    };

    const res = await handleRequest(badReq);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request body");
  });
});

// ─── 3. Session code generation ───────────────────────────────────────────────

describe("session code generation", () => {
  it("generateGroupCode produces valid 7-char codes from safe alphabet", async () => {
    const { generateGroupCode } = await import("@/lib/group-utils");
    const allowed = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    for (let i = 0; i < 50; i++) {
      const code = generateGroupCode();
      expect(code).toHaveLength(7);
      for (const ch of code) {
        expect(allowed).toContain(ch);
      }
    }
  });

  it("excludes ambiguous characters O, 0, I, 1, L", async () => {
    const { generateGroupCode } = await import("@/lib/group-utils");
    const ambiguous = ["O", "0", "I", "1", "L"];

    const codes = Array.from({ length: 200 }, () => generateGroupCode());
    const allChars = codes.join("");
    for (const ch of ambiguous) {
      expect(allChars).not.toContain(ch);
    }
  });

  it("generates unique codes across runs", async () => {
    const { generateGroupCode } = await import("@/lib/group-utils");

    const codes = new Set(Array.from({ length: 100 }, () => generateGroupCode()));
    // With 31^7 ≈ 27B possible codes, 100 samples should have near-zero collisions
    expect(codes.size).toBeGreaterThan(90);
  });
});

// ─── 4. Rate limiter returns 429 after threshold ──────────────────────────────

describe("rate-limit", () => {
  beforeEach(() => {
    // Ensure Upstash is NOT configured so in-memory fallback is used
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  it("returns 429 after exceeding tasteSummary limit (3/min)", async () => {
    // Re-import to pick up clean env
    const { applyRateLimit } = await import("@/lib/rate-limit");

    const id = `test-${Date.now()}-${Math.random()}`;

    // tasteSummary bucket: limit 3 per 60s
    for (let i = 0; i < 3; i++) {
      const res = await applyRateLimit("tasteSummary", id);
      expect(res).toBeNull(); // allowed
    }

    // 4th call should be blocked
    const blocked = await applyRateLimit("tasteSummary", id);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);

    const body = await blocked!.json();
    expect(body.error).toBe("Too many requests");
  });

  it("getClientIp extracts IP from x-forwarded-for", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");

    const req = {
      headers: {
        get: (name: string) =>
          name === "x-forwarded-for" ? "1.2.3.4, 5.6.7.8" : null,
      },
    };
    expect(getClientIp(req)).toBe("1.2.3.4");
  });
});

// ─── 5. Env validation throws on missing required var ─────────────────────────

describe("env validation (env.ts)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws on missing NEXT_PUBLIC_SUPABASE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    await expect(() => import("@/lib/env")).rejects.toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  });

  it("throws on missing TMDB_API_KEY", async () => {
    // Provide all other required vars so we isolate TMDB_API_KEY
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("TMDB_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-ai-key");

    await expect(() => import("@/lib/env")).rejects.toThrow(
      "Missing required environment variable: TMDB_API_KEY"
    );
  });

  it("throws when neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("TMDB_API_KEY", "test-tmdb-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(() => import("@/lib/env")).rejects.toThrow(
      "Missing AI API key"
    );
  });

  it("succeeds when all required vars are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("TMDB_API_KEY", "test-tmdb-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-ai-key");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_xxx");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_xxx");
    vi.stubEnv("STRIPE_FOUNDING_PRICE_ID", "price_test_founding");
    vi.stubEnv("STRIPE_STANDARD_PRICE_ID", "price_test_standard");

    const { env } = await import("@/lib/env");
    expect(env.TMDB_API_KEY).toBe("test-tmdb-key");
    expect(env.AI_PROVIDER).toBe("anthropic");
  });
});
