import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { safeParseJson } from "@/lib/ai";
import { sendCuratorWeeklyEmail } from "@/lib/email";

/**
 * GET /api/cron/curator-weekly
 *
 * Weekly cron (Friday 15:00 UTC → 16:00 CET):
 * Generates 3 personalized Curator recommendations per premium user
 * and sends them via email.
 *
 * Auth: x-cron-secret or Bearer CRON_SECRET.
 */

const BATCH_SIZE = 30;
const CURATOR_MODEL = "claude-haiku-4-5-20251001";

interface EligibleUser {
  id: string;
  taste_summary: string;
  preferred_region: string | null;
  display_name: string | null;
}

interface CuratorRec {
  title: string;
  year?: number;
  type?: string;
  reason: string;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // 1. Find eligible premium users with taste_summary and email_digest
  const { data: users } = await admin
    .from("profiles")
    .select("id, taste_summary, preferred_region, display_name")
    .eq("is_premium", true)
    .eq("email_digest", true)
    .not("taste_summary", "is", null)
    .limit(BATCH_SIZE);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_eligible_users" });
  }

  const eligible = users as EligibleUser[];

  // 2. Get emails from auth
  const emailMap = new Map<string, string>();
  for (const u of eligible) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(u.id);
      if (authUser?.user?.email) emailMap.set(u.id, authUser.user.email);
    } catch { /* skip */ }
  }

  // 3. Generate + send for each user
  let sent = 0;
  let failed = 0;

  for (const user of eligible) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    try {
      const recs = await generateCuratorRecs(user.taste_summary, user.preferred_region);
      if (recs.length === 0) continue;

      await sendCuratorWeeklyEmail(email, user.display_name ?? undefined, {
        recommendations: recs,
        locale: regionToLocale(user.preferred_region),
      });
      sent++;
    } catch (e) {
      console.error(`[curator-weekly] Failed for ${user.id}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total_eligible: eligible.length });
}

/* ── Helpers ─────────────────────────────────────────── */

function regionToLocale(region: string | null): string {
  const map: Record<string, string> = { NO: "no", SE: "se", DK: "dk", FI: "fi", US: "en", GB: "en" };
  return map[region?.toUpperCase() ?? ""] ?? "no";
}

async function generateCuratorRecs(
  tasteSummary: string,
  region: string | null,
): Promise<CuratorRec[]> {
  const regionName = region
    ? { NO: "Norway", SE: "Sweden", DK: "Denmark", FI: "Finland", US: "United States" }[region.toUpperCase()] ?? "Scandinavia"
    : "Scandinavia";

  const prompt = `Based on this user's taste profile, recommend exactly 3 movies or TV shows they would love this weekend. Focus on titles available on streaming services in ${regionName}.

User taste: ${tasteSummary}

Return raw JSON array with exactly 3 objects:
[{"title":"Exact TMDB title","year":2024,"type":"movie","reason":"One sentence why they'll love it"}]

Rules:
- Use exact English TMDB titles
- "reason" must reference something from their taste profile
- Mix movies and TV shows
- Prefer recent titles (2020+) but include one classic if relevant
- Keep reasons under 15 words`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CURATOR_MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const raw = data?.content?.[0]?.text ?? "";
  const parsed = safeParseJson<CuratorRec[]>(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((r) => r.title && r.reason).slice(0, 3);
}
