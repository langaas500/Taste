import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDiscover, tmdbTrending, tmdbSimilar, parseTitleFromTMDB } from "@/lib/tmdb";
import type { UserTitle, TitleCache, Recommendation, ContentFilters } from "@/lib/types";
import { getWatchProvidersCachedBatch } from "@/lib/watch-providers-cache";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();
    const admin = createSupabaseAdmin();

    const availability = req.nextUrl.searchParams.get("availability");
    const availabilityMode =
      availability === "streamable" || availability === "included"
        ? availability
        : "all";

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

    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

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
    const skipIds = new Set([...excludedIds, ...notForMeIds]);

    function addCandidate(item: Record<string, unknown>, type: "movie" | "tv") {
      const key = `${item.id}:${type}`;
      if (!skipIds.has(key)) candidates.set(key, { ...item, _type: type });
    }

    const MIN_YEAR = 1995;
    const BLOCKED_LANGS = new Set(["ja", "zh", "ko", "hi", "ta", "te", "ml", "kn", "pa", "bn", "mr"]);
    const BLOCKED_GENRES = new Set([16]); // Animation

    // 1. Discover by top genres — random pages for variety
    const genreStr = topGenreIds.join(",");
    if (genreStr) {
      const randomPage = String(Math.floor(Math.random() * 5) + 1);
      const [discoverMovies, discoverTv] = await Promise.all([
        tmdbDiscover("movie", { with_genres: genreStr, "vote_count.gte": "50", page: randomPage, "primary_release_date.gte": `${MIN_YEAR}-01-01` }),
        tmdbDiscover("tv", { with_genres: genreStr, "vote_count.gte": "50", page: randomPage, "first_air_date.gte": `${MIN_YEAR}-01-01` }),
      ]);
      for (const item of discoverMovies.results || []) addCandidate(item, "movie");
      for (const item of discoverTv.results || []) addCandidate(item, "tv");
    }

    // 2. Similar to random selection of liked titles (up to 5)
    const shuffledLiked = shuffle(liked).slice(0, 5);
    const similarPromises = shuffledLiked.map((t) => tmdbSimilar(t.tmdb_id, t.type).then((res) => ({ results: res.results, type: t.type })));
    const similarResults = await Promise.all(similarPromises);
    for (const { results, type } of similarResults) {
      for (const item of results || []) {
        addCandidate(item, type);
      }
    }

    // 3. Mix in trending based on exploration slider
    if (explorationSlider > 30) {
      const trending = await tmdbTrending("all", "week");
      for (const item of trending.results || []) {
        const type = item.media_type === "movie" ? "movie" : item.media_type === "tv" ? "tv" : null;
        if (!type) continue;
        addCandidate(item, type);
      }
    }

    // 4. If pool is still small, fetch an additional discover page with broader genres
    if (candidates.size < 40 && topGenreIds.length > 0) {
      const extraPage = String(Math.floor(Math.random() * 3) + 6);
      const singleGenre = topGenreIds[Math.floor(Math.random() * topGenreIds.length)];
      const [extraMovies, extraTv] = await Promise.all([
        tmdbDiscover("movie", { with_genres: String(singleGenre), "vote_count.gte": "20", page: extraPage, "primary_release_date.gte": `${MIN_YEAR}-01-01` }),
        tmdbDiscover("tv", { with_genres: String(singleGenre), "vote_count.gte": "20", page: extraPage, "first_air_date.gte": `${MIN_YEAR}-01-01` }),
      ]);
      for (const item of extraMovies.results || []) addCandidate(item, "movie");
      for (const item of extraTv.results || []) addCandidate(item, "tv");
    }

    // Quality + hard-block filter — before scoring
    const beforeQualityFilter = candidates.size;
    for (const [key, item] of candidates) {
      const voteAvg = (item.vote_average as number) || 0;
      const voteCount = (item.vote_count as number) || 0;
      const lang = (item.original_language as string) || "";
      const genreIds: number[] = Array.isArray(item.genre_ids) ? (item.genre_ids as number[]) : [];
      if (voteAvg < 6.0 || voteCount < 50) { candidates.delete(key); continue; }
      if (BLOCKED_LANGS.has(lang)) { candidates.delete(key); continue; }
      if (genreIds.some((g) => BLOCKED_GENRES.has(g))) { candidates.delete(key); continue; }
    }
    console.log(`[recommendations] quality filter: ${beforeQualityFilter} → ${candidates.size} (removed ${beforeQualityFilter - candidates.size})`);

    // Score candidates
    const dislikedGenres = new Set<number>();
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
      if (skipIds.has(key)) continue;

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

    // Sort candidates by score
    scored.sort((a, b) => b.score - a.score);

    // 70/30 TV/movie split — pick 14 best series + 6 best movies, fill shortfall from the other pool
    function pick7030(pool: ScoredCandidate[]): ScoredCandidate[] {
      const tv = pool.filter((s) => s.type === "tv");
      const movies = pool.filter((s) => s.type === "movie");
      const tvSlice = tv.slice(0, 14);
      const movieSlice = movies.slice(0, 6);
      const tvShortfall = 14 - tvSlice.length;
      const movieShortfall = 6 - movieSlice.length;
      const result = [
        ...tvSlice,
        ...(movieShortfall > 0 ? tv.slice(14, 14 + movieShortfall) : []),
        ...movieSlice,
        ...(tvShortfall > 0 ? movies.slice(6, 6 + tvShortfall) : []),
      ];
      return result.slice(0, 20);
    }

    // Apply availability filtering if requested (batch DB lookup, NO N+1)
    let top20: ScoredCandidate[];

    if (availabilityMode !== "all") {
      const INITIAL_POOL = 60;
      const EXPANDED_POOL = 120;
      const THIN_THRESHOLD = 12;

      function filterByAvailability(
        pool: ScoredCandidate[],
        providerMap: Map<string, { providers: Record<string, unknown> | null }>
      ): ScoredCandidate[] {
        return pool.filter((s) => {
          const key = `${s.item.id}:${s.type}`;
          const cached = providerMap.get(key);
          if (!cached?.providers) return false;

          const p = cached.providers as {
            flatrate?: unknown[];
            rent?: unknown[];
            buy?: unknown[];
          };

          if (availabilityMode === "included") {
            return (p.flatrate?.length || 0) > 0;
          }
          // streamable: any provider type in NO
          return (
            (p.flatrate?.length || 0) +
              (p.rent?.length || 0) +
              (p.buy?.length || 0) >
            0
          );
        });
      }

      // Pass 1: initial pool
      const pool1 = scored.slice(0, INITIAL_POOL);
      const batchItems1 = pool1.map((s) => ({
        tmdbId: s.item.id as number,
        type: s.type,
      }));
      const providerMap1 = await getWatchProvidersCachedBatch({
        items: batchItems1,
        country: "NO",
      });
      const filtered1 = filterByAvailability(pool1, providerMap1);

      // Pass 2: expand pool only for "included" when results are thin
      if (
        availabilityMode === "included" &&
        filtered1.length < THIN_THRESHOLD &&
        scored.length > INITIAL_POOL
      ) {
        const pool2 = scored.slice(0, EXPANDED_POOL);
        const batchItems2 = pool2.map((s) => ({
          tmdbId: s.item.id as number,
          type: s.type,
        }));
        const providerMap2 = await getWatchProvidersCachedBatch({
          items: batchItems2,
          country: "NO",
        });
        const filtered2 = filterByAvailability(pool2, providerMap2);
        top20 = pick7030(filtered2);
      } else {
        top20 = pick7030(filtered1);
      }
    } else {
      top20 = pick7030(scored);
    }

    // TMDB genre ID -> name mapping
    const GENRE_MAP: Record<number, string> = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
      10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
      10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
    };

    // Cache titles and build response
    const results: {
      tmdb_id: number;
      type: "movie" | "tv";
      title: string;
      year: number | null;
      poster_path: string | null;
      backdrop_path: string | null;
      vote_average: number;
      genreIds: number[];
    }[] = [];

    const cacheRows: {
      tmdb_id: number; type: string; title: string; original_title: string | null;
      year: number | null; overview: string | null; genres: unknown;
      poster_path: string | null; backdrop_path: string | null;
      vote_average: number | null; vote_count: number | null; popularity: number | null;
      updated_at: string;
    }[] = [];

    for (const { item, type } of top20) {
      const parsed = parseTitleFromTMDB(item, type);
      results.push({
        tmdb_id: parsed.tmdb_id,
        type: parsed.type,
        title: parsed.title,
        year: parsed.year,
        poster_path: parsed.poster_path,
        backdrop_path: parsed.backdrop_path,
        vote_average: parsed.vote_average || 0,
        genreIds: (item.genre_ids as number[]) || [],
      });

      cacheRows.push({
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
      });
    }

    // Bulk cache upsert (single DB call instead of N fire-and-forget)
    if (cacheRows.length > 0) {
      admin.from("titles_cache").upsert(cacheRows, { onConflict: "tmdb_id,type" })
        .then(() => {})
        .catch((err: unknown) => {
          console.error("titles_cache bulk upsert failed:", err instanceof Error ? err.message : err);
        });
    }

    // Generate deterministic "why" explanations
    const recommendations: Recommendation[] = results.map((r) => {
      // Find best liked title match by genre overlap
      let bestMatch: { title: string; overlap: number } | null = null;

      for (const likedTitle of likedCached) {
        const likedGenres = (likedTitle.genres as { id: number; name: string }[]) || [];
        const likedGenreIds = new Set(likedGenres.map((g) => g.id));
        const overlap = r.genreIds.filter((gid) => likedGenreIds.has(gid)).length;

        if (overlap > 0 && (!bestMatch || overlap > bestMatch.overlap)) {
          bestMatch = { title: likedTitle.title, overlap };
        }
      }

      const why = bestMatch ? `Fordi du likte ${bestMatch.title}` : "";
      const tags = r.genreIds.slice(0, 3).map((gid) => GENRE_MAP[gid] || "").filter(Boolean);

      return {
        tmdb_id: r.tmdb_id,
        type: r.type,
        title: r.title,
        year: r.year,
        poster_path: r.poster_path,
        backdrop_path: r.backdrop_path,
        vote_average: r.vote_average,
        why,
        tags,
      };
    });

    return NextResponse.json({ recommendations });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("Recommendations error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
