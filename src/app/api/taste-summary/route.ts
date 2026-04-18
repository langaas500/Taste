import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { generateTasteSummary, regionToAILocale, localeToAILocale, type TasteInput } from "@/lib/ai";
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
    // TODO: compute dynamically from aggregate user data
    percentiles: { darker_than: 72, less_romance_than: 88, faster_tempo_than: 65 },
    // TODO: derive from AI summary or genre analysis
    tempo: "Medium",
    tone: ["Mørk", "Psykologisk"],
    themes: ["Makt", "Identitet"],
  };
}

/** Find recommendations from titles_cache that user hasn't watched, matching top genres */
async function buildRecommendations(
  userTmdbIds: Set<number>,
  dominantGenres: string[],
): Promise<{ tmdb_id: number; title: string; poster_path: string; match_score: number }[]> {
  if (dominantGenres.length === 0) return [];
  const admin = createSupabaseAdmin();

  // Fetch popular cached titles the user hasn't seen, with poster
  const { data: candidates } = await admin
    .from("titles_cache")
    .select("tmdb_id, title, poster_path, genres, vote_average")
    .not("poster_path", "is", null)
    .order("vote_average", { ascending: false })
    .limit(200);

  if (!candidates || candidates.length === 0) return [];

  // Score and filter
  const scored = (candidates as TitleCache[])
    .filter((c) => !userTmdbIds.has(c.tmdb_id) && c.poster_path)
    .map((c) => {
      const genres = (c.genres || []) as { id: number; name: string }[];
      const genreNames = genres.map((g) => g.name);
      const overlap = genreNames.filter((g) => dominantGenres.includes(g)).length;
      if (overlap === 0) return null;
      return {
        tmdb_id: c.tmdb_id,
        title: c.title,
        poster_path: c.poster_path!,
        match_score: Math.min(98, Math.round((overlap / dominantGenres.length) * 85 + (c.vote_average || 0) * 1.5)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.match_score - a!.match_score)
    .slice(0, 3) as { tmdb_id: number; title: string; poster_path: string; match_score: number }[];

  return scored;
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

    // Check cached summary
    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_summary, taste_summary_updated_at")
      .eq("id", user.id)
      .single();

    // Load titles + cache for enrichment
    const { titles, cacheMap } = await loadUserTitlesAndCache(supabase, user.id);
    const enrichment = buildEnrichment(titles, cacheMap);
    const userTmdbIds = new Set(titles.map((t) => t.tmdb_id));
    const recommendations = await buildRecommendations(userTmdbIds, enrichment.dominant_genres);

    const ts = profile?.taste_summary;
    if (ts && (ts.youLike || ts.avoid || ts.pacing)) {
      return NextResponse.json({ summary: ts, cached: true, ...enrichment, recommendations });
    }

    return NextResponse.json({ summary: null, cached: false, ...enrichment, recommendations });
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

    // Load locale/region
    const { data: prof } = await supabase
      .from("profiles")
      .select("preferred_region, preferred_locale")
      .eq("id", user.id)
      .single();
    const aiLocale = prof?.preferred_locale
      ? localeToAILocale(prof.preferred_locale)
      : regionToAILocale(prof?.preferred_region || "");

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

    const enrichment = buildEnrichment(titles, cacheMap);
    const userTmdbIds = new Set(titles.map((t) => t.tmdb_id));
    const recommendations = await buildRecommendations(userTmdbIds, enrichment.dominant_genres);
    return NextResponse.json({ summary, cached: false, ...enrichment, recommendations });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    logger.error("Taste summary error", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
