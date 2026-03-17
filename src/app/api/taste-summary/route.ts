import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { generateTasteSummary, regionToAILocale, type TasteInput } from "@/lib/ai";
import type { UserTitle, TitleCache } from "@/lib/types";
import { withLogger } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";

/* ── helpers for enrichment data ──────────────────────── */

function computeConfidence(titleCount: number): number {
  if (titleCount < 10) return Math.round(40 + (titleCount / 10) * 20);
  if (titleCount <= 20) return Math.round(60 + ((titleCount - 10) / 10) * 20);
  return Math.min(95, Math.round(80 + ((titleCount - 20) / 30) * 15));
}

function computeDominantGenres(titles: UserTitle[], cacheMap: Map<number, TitleCache>): string[] {
  const counts: Record<string, number> = {};
  for (const t of titles) {
    const c = cacheMap.get(t.tmdb_id);
    const genres = (c?.genres || []) as { id: number; name: string }[];
    for (const g of genres) {
      if (g.name) counts[g.name] = (counts[g.name] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

function computeMatchScore(titleGenres: string[], topGenres: string[]): number {
  if (!topGenres.length || !titleGenres.length) return 50;
  const overlap = titleGenres.filter((g) => topGenres.includes(g)).length;
  return Math.min(100, Math.round((overlap / Math.min(titleGenres.length, topGenres.length)) * 100));
}

function buildEnrichment(titles: UserTitle[], cacheMap: Map<number, TitleCache>) {
  const titleCount = titles.length;
  const dominantGenres = computeDominantGenres(titles, cacheMap);

  // Like examples: top 3 liked titles by genre overlap
  const likedTitles = titles.filter((t) => t.sentiment === "liked");
  const likeExamples = likedTitles
    .map((t) => {
      const c = cacheMap.get(t.tmdb_id);
      if (!c) return null;
      const genres = (c.genres || []) as { id: number; name: string }[];
      const genreNames = genres.map((g) => g.name);
      return {
        tmdb_id: c.tmdb_id,
        title: c.title,
        genre: genreNames[0] || "",
        poster_path: c.poster_path || "",
        match_score: computeMatchScore(genreNames, dominantGenres),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.match_score - a!.match_score)
    .slice(0, 3) as { tmdb_id: number; title: string; genre: string; poster_path: string; match_score: number }[];

  // Avoid examples: top 2 disliked titles
  const dislikedTitles = titles.filter((t) => t.sentiment === "disliked");
  const avoidExamples = dislikedTitles
    .map((t) => {
      const c = cacheMap.get(t.tmdb_id);
      if (!c) return null;
      const genres = (c.genres || []) as { id: number; name: string }[];
      return {
        tmdb_id: c.tmdb_id,
        title: c.title,
        genre: genres[0]?.name || "",
        poster_path: c.poster_path || "",
      };
    })
    .filter(Boolean)
    .slice(0, 2) as { tmdb_id: number; title: string; genre: string; poster_path: string }[];

  return {
    confidence_score: computeConfidence(titleCount),
    title_count: titleCount,
    dominant_genres: dominantGenres,
    like_examples: likeExamples,
    avoid_examples: avoidExamples,
    // TODO: generate real recommendations from TMDB similar titles
    recommendations: [],
    // TODO: compute dynamically from aggregate user data
    percentiles: { darker_than: 72, less_romance_than: 88, faster_tempo_than: 65 },
    // TODO: derive from AI summary or genre analysis
    tempo: "Medium",
    tone: ["Mørk", "Psykologisk"],
    themes: ["Makt", "Identitet"],
  };
}

async function loadUserTitlesAndCache(supabase: ReturnType<typeof createSupabaseAdmin>, userId: string) {
  const { data: userTitles } = await supabase
    .from("user_titles")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "watched");

  const titles = (userTitles || []) as UserTitle[];
  if (titles.length === 0) return { titles, cacheMap: new Map<number, TitleCache>() };

  const tmdbIds = [...new Set(titles.map((t) => t.tmdb_id))];
  const admin = createSupabaseAdmin();
  const { data: cached } = await admin
    .from("titles_cache")
    .select("*")
    .in("tmdb_id", tmdbIds);

  const cacheMap = new Map<number, TitleCache>();
  for (const c of (cached || []) as TitleCache[]) {
    cacheMap.set(c.tmdb_id, c);
  }
  return { titles, cacheMap };
}

/* ── GET ──────────────────────────────────────────────── */

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

    // Load titles + cache for enrichment
    const { titles, cacheMap } = await loadUserTitlesAndCache(supabase, user.id);
    const enrichment = buildEnrichment(titles, cacheMap);

    const ts = profile?.taste_summary;
    if (ts && (ts.youLike || ts.avoid || ts.pacing)) {
      const summary = isPremium
        ? ts
        : { youLike: ts.youLike ?? null, avoid: null, pacing: null };
      return NextResponse.json({ summary, cached: true, is_premium: isPremium, ...enrichment });
    }

    return NextResponse.json({ summary: null, cached: false, is_premium: isPremium, ...enrichment });
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
    const enrichment = buildEnrichment(titles, cacheMap);
    return NextResponse.json({ summary: gatedSummary, cached: false, is_premium: isPremium, ...enrichment });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    logger.error("Taste summary error", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
