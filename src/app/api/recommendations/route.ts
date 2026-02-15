import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDiscover, tmdbTrending, tmdbSimilar, parseTitleFromTMDB } from "@/lib/tmdb";
import { explainRecommendations, type TasteInput } from "@/lib/ai";
import type { UserTitle, TitleCache, Recommendation, ContentFilters } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();
    const admin = createSupabaseAdmin();

    // Get user data
    const [
      { data: userTitles },
      { data: exclusions },
      { data: feedback },
      { data: profile },
    ] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id),
      supabase.from("user_exclusions").select("*").eq("user_id", user.id),
      supabase.from("user_feedback").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    const titles = (userTitles || []) as UserTitle[];
    const excludedIds = new Set(
      [...(exclusions || []), ...titles].map((e) => `${e.tmdb_id}:${e.type}`)
    );
    const notForMeIds = new Set(
      (feedback || [])
        .filter((f: { feedback: string }) => f.feedback === "not_for_me")
        .map((f: { tmdb_id: number; type: string }) => `${f.tmdb_id}:${f.type}`)
    );

    const liked = titles.filter((t) => t.sentiment === "liked");
    const disliked = titles.filter((t) => t.sentiment === "disliked");
    const explorationSlider = profile?.exploration_slider ?? 50;

    // Get cached title info for liked titles
    const likedTmdbIds = liked.map((t) => t.tmdb_id);
    const { data: likedCache } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", likedTmdbIds.length > 0 ? likedTmdbIds : [0]);

    const likedCached = (likedCache || []) as TitleCache[];

    // Compute top genres from liked titles
    const genreCounts = new Map<number, number>();
    for (const tc of likedCached) {
      const genres = tc.genres as { id: number; name: string }[];
      for (const g of genres) {
        genreCounts.set(g.id, (genreCounts.get(g.id) || 0) + 1);
      }
    }
    const topGenreIds = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // Build candidate pool
    const candidates = new Map<string, Record<string, unknown>>();

    // 1. Discover by top genres
    const genreStr = topGenreIds.join(",");
    if (genreStr) {
      const [discoverMovies, discoverTv] = await Promise.all([
        tmdbDiscover("movie", { with_genres: genreStr, "vote_count.gte": "50" }),
        tmdbDiscover("tv", { with_genres: genreStr, "vote_count.gte": "50" }),
      ]);
      for (const item of [...(discoverMovies.results || []), ...(discoverTv.results || [])]) {
        const type = item.title ? "movie" : "tv";
        const key = `${item.id}:${type}`;
        if (!excludedIds.has(key)) candidates.set(key, { ...item, _type: type });
      }
    }

    // 2. Similar to top liked titles
    const topLiked = liked.slice(0, 3);
    for (const t of topLiked) {
      const similar = await tmdbSimilar(t.tmdb_id, t.type);
      for (const item of similar.results || []) {
        const key = `${item.id}:${t.type}`;
        if (!excludedIds.has(key)) candidates.set(key, { ...item, _type: t.type });
      }
    }

    // 3. Mix in trending based on exploration slider
    if (explorationSlider > 30) {
      const trending = await tmdbTrending("all", "week");
      for (const item of trending.results || []) {
        const type = item.media_type === "movie" ? "movie" : item.media_type === "tv" ? "tv" : null;
        if (!type) continue;
        const key = `${item.id}:${type}`;
        if (!excludedIds.has(key)) candidates.set(key, { ...item, _type: type });
      }
    }

    // Score candidates
    const dislikedGenres = new Set<number>();
    for (const tc of likedCached) {
      // This is for disliked - we need to get disliked cache too
    }
    const dislikedTmdbIds = disliked.map((t) => t.tmdb_id);
    const { data: dislikedCache } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", dislikedTmdbIds.length > 0 ? dislikedTmdbIds : [0]);
    for (const tc of (dislikedCache || []) as TitleCache[]) {
      const genres = tc.genres as { id: number; name: string }[];
      for (const g of genres) dislikedGenres.add(g.id);
    }

    // Content filters
    const contentFilters = (profile?.content_filters || {}) as ContentFilters;

    type ScoredCandidate = { item: Record<string, unknown>; score: number; type: "movie" | "tv" };
    const scored: ScoredCandidate[] = [];

    for (const [key, item] of candidates) {
      if (excludedIds.has(key) || notForMeIds.has(key)) continue;

      const type = item._type as "movie" | "tv";
      const genreIds = (item.genre_ids as number[]) || [];
      const originalLanguage = (item.original_language as string) || "";

      // Skip excluded languages
      if (contentFilters.excluded_languages?.includes(originalLanguage)) continue;

      // Skip excluded genres
      if (contentFilters.excluded_genres?.length) {
        if (genreIds.some((gid) => contentFilters.excluded_genres!.includes(gid))) continue;
      }

      let score = 0;

      // Boost preferred languages
      if (contentFilters.preferred_languages?.includes(originalLanguage)) {
        score += 8;
      }

      // Genre overlap with liked
      for (const gid of genreIds) {
        if (topGenreIds.includes(gid)) score += 10;
        if (dislikedGenres.has(gid)) score -= 5;
      }

      // TMDB quality signals
      const voteAvg = (item.vote_average as number) || 0;
      const voteCount = (item.vote_count as number) || 0;
      if (voteAvg >= 7) score += 5;
      if (voteAvg >= 8) score += 5;
      if (voteCount > 500) score += 3;
      if (voteCount > 2000) score += 2;

      // Exploration bonus: add randomness proportional to slider
      const explorationNoise = (explorationSlider / 100) * (Math.random() * 15 - 5);
      score += explorationNoise;

      // Popularity boost for moderate exploration
      const popularity = (item.popularity as number) || 0;
      if (explorationSlider > 50 && popularity > 50) score += 3;

      scored.push({ item, score, type });
    }

    // Sort and take top 20
    scored.sort((a, b) => b.score - a.score);
    const top20 = scored.slice(0, 20);

    // Cache titles and build response
    const results: {
      tmdb_id: number;
      type: "movie" | "tv";
      title: string;
      year: number | null;
      poster_path: string | null;
      overview: string;
      genres: string[];
    }[] = [];

    for (const { item, type } of top20) {
      const parsed = parseTitleFromTMDB(item, type);
      results.push({
        tmdb_id: parsed.tmdb_id,
        type: parsed.type,
        title: parsed.title,
        year: parsed.year,
        poster_path: parsed.poster_path,
        overview: parsed.overview || "",
        genres: ((item.genre_ids as number[]) || []).map(String),
      });

      // Cache
      admin.from("titles_cache").upsert({
        tmdb_id: parsed.tmdb_id,
        type: parsed.type,
        title: parsed.title,
        original_title: parsed.original_title,
        year: parsed.year,
        overview: parsed.overview,
        genres: parsed.genres,
        poster_path: parsed.poster_path,
        backdrop_path: parsed.backdrop_path,
        vote_average: parsed.vote_average,
        vote_count: parsed.vote_count,
        popularity: parsed.popularity,
        updated_at: new Date().toISOString(),
      }, { onConflict: "tmdb_id,type" }).then(() => {});
    }

    // Generate AI explanations
    let recommendations: Recommendation[];
    try {
      const tasteSummary = profile?.taste_summary || {
        youLike: liked.length > 0
          ? `User likes: ${likedCached.map((t) => t.title).join(", ")}`
          : "Exploring new content",
        avoid: disliked.length > 0
          ? `User dislikes some titles`
          : "No specific avoidances",
      };

      const explained = await explainRecommendations(
        { youLike: tasteSummary.youLike, avoid: tasteSummary.avoid },
        results.map((r) => ({
          title: r.title,
          type: r.type,
          year: r.year,
          overview: r.overview,
          genres: r.genres,
        }))
      );

      recommendations = results.map((r, i) => ({
        tmdb_id: r.tmdb_id,
        type: r.type,
        title: r.title,
        year: r.year,
        poster_path: r.poster_path,
        why: explained[i]?.why || "Based on your viewing history",
        tags: explained[i]?.tags || [],
      }));
    } catch {
      // Fallback without AI explanations
      recommendations = results.map((r) => ({
        tmdb_id: r.tmdb_id,
        type: r.type,
        title: r.title,
        year: r.year,
        poster_path: r.poster_path,
        why: "Based on your viewing history and preferences",
        tags: [],
      }));
    }

    return NextResponse.json({ recommendations });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("Recommendations error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
