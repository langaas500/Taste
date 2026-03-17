import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { generateTasteSummary, regionToAILocale, type TasteInput } from "@/lib/ai";
import type { UserTitle, TitleCache } from "@/lib/types";
import { withLogger } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";

export const GET = withLogger("/api/taste-summary", async (req, { logger }) => {
  try {
    const user = await requireUser();
    logger.setUserId(user.id);
    const supabase = await createSupabaseServer();

    // Check cached summary + premium status
    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_summary, taste_summary_updated_at, is_premium")
      .eq("id", user.id)
      .single();

    const isPremium = profile?.is_premium === true;

    const ts = profile?.taste_summary;
    if (ts && (ts.youLike || ts.avoid || ts.pacing)) {
      const summary = isPremium
        ? ts
        : { youLike: ts.youLike ?? null, avoid: null, pacing: null };
      return NextResponse.json({ summary, cached: true, is_premium: isPremium });
    }

    return NextResponse.json({ summary: null, cached: false, is_premium: isPremium });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});

export const POST = withLogger("/api/taste-summary", async (req, { logger }) => {
  try {
    const user = await requireUser();
    logger.setUserId(user.id);

    const limited = await applyRateLimit("tasteSummary", user.id);
    if (limited) return limited;

    const supabase = await createSupabaseServer();
    const admin = createSupabaseAdmin();

    // Check premium status + region for locale
    const { data: prof } = await supabase
      .from("profiles")
      .select("is_premium, preferred_region")
      .eq("id", user.id)
      .single();
    const isPremium = prof?.is_premium === true;
    const aiLocale = regionToAILocale(prof?.preferred_region || "");

    // Get user titles
    const { data: userTitles } = await supabase
      .from("user_titles")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "watched");

    const titles = (userTitles || []) as UserTitle[];
    if (titles.length === 0) {
      return NextResponse.json({ error: "No watched titles to analyze" }, { status: 400 });
    }

    // Get cached info
    const tmdbIds = titles.map((t) => t.tmdb_id);
    const { data: cached } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", tmdbIds);

    const cacheMap = new Map<number, TitleCache>();
    for (const c of (cached || []) as TitleCache[]) {
      cacheMap.set(c.tmdb_id, c);
    }

    // Get feedback
    const { data: feedbackData } = await supabase
      .from("user_feedback")
      .select("*")
      .eq("user_id", user.id)
      .eq("feedback", "not_for_me");

    const notForMeTmdbIds = (feedbackData || []).map((f: { tmdb_id: number }) => f.tmdb_id);
    const { data: notForMeCache } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", notForMeTmdbIds.length > 0 ? notForMeTmdbIds : [0]);

    // Build input
    const input: TasteInput = {
      liked: titles
        .filter((t) => t.sentiment === "liked")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      disliked: titles
        .filter((t) => t.sentiment === "disliked")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      neutral: titles
        .filter((t) => t.sentiment === "neutral")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      feedbackNotForMe: ((notForMeCache || []) as TitleCache[]).map((c) => ({
        title: c.title,
        type: c.type,
      })),
    };

    const summary = await generateTasteSummary(input, aiLocale);

    // Cache in profile
    await supabase
      .from("profiles")
      .update({
        taste_summary: { ...summary, updatedAt: new Date().toISOString() },
        taste_summary_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    const gatedSummary = isPremium
      ? summary
      : { youLike: summary.youLike ?? null, avoid: null, pacing: null };
    return NextResponse.json({ summary: gatedSummary, cached: false, is_premium: isPremium });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    logger.error("Taste summary error", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
