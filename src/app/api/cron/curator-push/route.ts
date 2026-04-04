import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { safeParseJson } from "@/lib/ai";
import { sendCuratorPushEmail } from "@/lib/email";

/**
 * GET /api/cron/curator-push
 *
 * Weekly cron (Friday 16:00 UTC = 18:00 CET):
 * Sends ONE personalized film recommendation per active user via email.
 * Uses Claude Haiku for cost control.
 *
 * Auth: CRON_SECRET header or Vercel cron auth.
 */

const BATCH_SIZE = 500;
const CURATOR_MODEL = "claude-haiku-4-5-20251001";
const DELAY_MS = 100; // delay between Claude calls to avoid rate limits

interface EligibleUser {
  id: string;
  display_name: string | null;
  preferred_locale: string | null;
  preferred_region: string | null;
  taste_summary: Record<string, string> | null;
}

interface CuratorPick {
  title: string;
  year?: number;
  reason: string;
  tmdb_id?: number;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Find active users with taste data who haven't opted out
  // Active = logged a title in last 30 days OR used Curator in last 14 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data: recentLoggers } = await admin
    .from("user_titles")
    .select("user_id")
    .gte("updated_at", thirtyDaysAgo)
    .limit(1000);

  const { data: recentCurators } = await admin
    .from("curator_conversations")
    .select("user_id")
    .gte("created_at", fourteenDaysAgo)
    .limit(500);

  const activeIds = [...new Set([
    ...(recentLoggers ?? []).map((r: { user_id: string }) => r.user_id),
    ...(recentCurators ?? []).map((r: { user_id: string }) => r.user_id),
  ])];

  if (activeIds.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_active_users" });
  }

  // Fetch profiles for active users (with taste_summary and curator_push_enabled)
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, preferred_locale, preferred_region, taste_summary, curator_push_enabled")
    .in("id", activeIds.slice(0, BATCH_SIZE))
    .not("taste_summary", "is", null);

  const eligible = (profiles ?? []).filter(
    (p: { curator_push_enabled?: boolean }) => p.curator_push_enabled !== false
  ) as EligibleUser[];

  if (eligible.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_eligible_users" });
  }

  // Resolve emails
  const emailMap = new Map<string, string>();
  for (const u of eligible) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(u.id);
      if (authUser?.user?.email) emailMap.set(u.id, authUser.user.email);
    } catch { /* skip */ }
  }

  // For each user: fetch liked titles, generate pick, send email
  let sent = 0;
  let failed = 0;

  for (const user of eligible) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    try {
      // Fetch top 5 liked titles
      const { data: likedRows } = await admin
        .from("user_titles")
        .select("tmdb_id, type")
        .eq("user_id", user.id)
        .eq("sentiment", "liked")
        .order("updated_at", { ascending: false })
        .limit(5);

      const likedIds = (likedRows ?? []).map((r: { tmdb_id: number }) => r.tmdb_id);
      let likedTitles: string[] = [];
      if (likedIds.length > 0) {
        const { data: cached } = await admin
          .from("titles_cache")
          .select("title")
          .in("tmdb_id", likedIds);
        likedTitles = (cached ?? []).map((r: { title: string }) => r.title);
      }

      // Fetch last Curator recommendation to avoid repeats
      const { data: lastConv } = await admin
        .from("curator_conversations")
        .select("recommended_tmdb_ids")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const lastRecIds = Array.isArray(lastConv?.recommended_tmdb_ids) ? lastConv.recommended_tmdb_ids : [];
      let lastRecTitles: string[] = [];
      if (lastRecIds.length > 0) {
        const { data: lastCached } = await admin
          .from("titles_cache")
          .select("title")
          .in("tmdb_id", lastRecIds.slice(0, 5));
        lastRecTitles = (lastCached ?? []).map((r: { title: string }) => r.title);
      }

      // Build taste summary string
      const ts = user.taste_summary;
      const tasteParts: string[] = [];
      if (ts?.youLike) tasteParts.push(`Likes: ${ts.youLike}`);
      if (ts?.avoid) tasteParts.push(`Avoids: ${ts.avoid}`);

      const regionName = {
        NO: "Norway", SE: "Sweden", DK: "Denmark", FI: "Finland",
        US: "United States", GB: "United Kingdom", DE: "Germany",
        FR: "France", ES: "Spain", IT: "Italy", CA: "Canada", AU: "Australia",
      }[user.preferred_region?.toUpperCase() ?? ""] ?? "Europe";

      // Generate recommendation with Claude Haiku
      const pick = await generatePick(
        likedTitles,
        tasteParts.join(". "),
        lastRecTitles,
        regionName,
      );

      if (!pick) { failed++; continue; }

      // Fetch poster from TMDB
      let posterUrl: string | undefined;
      if (pick.tmdb_id) {
        const { data: cached } = await admin
          .from("titles_cache")
          .select("poster_path")
          .eq("tmdb_id", pick.tmdb_id)
          .maybeSingle();
        if (cached?.poster_path) {
          posterUrl = `https://image.tmdb.org/t/p/w342${cached.poster_path}`;
        }
      }

      const locale = localeFromRegion(user.preferred_locale || user.preferred_region);
      await sendCuratorPushEmail(email, user.display_name ?? undefined, {
        title: pick.title,
        year: pick.year,
        reason: pick.reason,
        posterUrl,
      }, locale);

      sent++;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (e) {
      console.error(`[curator-push] Failed for ${user.id}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total_eligible: eligible.length });
}

/* ── Helpers ─────────────────────────────────────────── */

function localeFromRegion(region: string | null): string {
  const map: Record<string, string> = { no: "no", NO: "no", se: "se", SE: "se", dk: "dk", DK: "dk", fi: "fi", FI: "fi" };
  return map[region ?? ""] ?? "en";
}

async function generatePick(
  likedTitles: string[],
  tasteSummary: string,
  recentlyRecommended: string[],
  region: string,
): Promise<CuratorPick | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CURATOR_MODEL,
      max_tokens: 256,
      temperature: 0.8,
      system: "You are a film curator. Based on the user's taste, recommend ONE perfect film or series for this Friday evening. Be specific and personal. Max 3 sentences explaining why. Return only valid JSON: {\"title\":\"...\",\"year\":2024,\"reason\":\"...\"}",
      messages: [{
        role: "user",
        content: `User likes: ${likedTitles.join(", ") || "Unknown"}.
Taste: ${tasteSummary || "Unknown"}.
Recently recommended (avoid these): ${recentlyRecommended.join(", ") || "None"}.
Region: ${region}.
Recommend something new and surprising.`,
      }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) return null;

  const parsed = safeParseJson<CuratorPick>(text);
  if (!parsed.ok) return null;
  return parsed.data;
}
