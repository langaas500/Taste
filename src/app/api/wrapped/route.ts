import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Get all watched titles from last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: titles } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, sentiment, favorite, watched_at, updated_at")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .gte("updated_at", oneYearAgo.toISOString())
      .order("updated_at", { ascending: false });

    if (!titles || titles.length < 10) {
      return NextResponse.json({ insufficient: true, count: titles?.length || 0 });
    }

    // Count movies and TV shows
    const movies = titles.filter((t: { type: string }) => t.type === "movie");
    const tvShows = titles.filter((t: { type: string }) => t.type === "tv");

    // Estimate hours: movie ~2h, tv show ~10 episodes * 45min = 7.5h
    const estimatedHours = Math.round(movies.length * 2 + tvShows.length * 7.5);

    // Sentiment distribution
    const sentimentCounts = { liked: 0, neutral: 0, disliked: 0, unrated: 0 };
    for (const t of titles as { sentiment: string | null }[]) {
      if (t.sentiment === "liked") sentimentCounts.liked++;
      else if (t.sentiment === "disliked") sentimentCounts.disliked++;
      else if (t.sentiment === "neutral") sentimentCounts.neutral++;
      else sentimentCounts.unrated++;
    }

    // Get cache for genre and poster data
    const tmdbIds = [...new Set(titles.map((t: { tmdb_id: number }) => t.tmdb_id))];
    const { data: cached } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, poster_path, year, genres")
      .in("tmdb_id", tmdbIds);

    const cacheMap: Record<string, { title: string; poster_path: string | null; year: number | null; genres: { id: number; name: string }[] }> = {};
    for (const c of (cached || []) as { tmdb_id: number; type: string; title: string; poster_path: string | null; year: number | null; genres: { id: number; name: string }[] | null }[]) {
      cacheMap[`${c.tmdb_id}:${c.type}`] = {
        title: c.title,
        poster_path: c.poster_path,
        year: c.year,
        genres: c.genres || [],
      };
    }

    // Top genres
    const genreCounts: Record<string, number> = {};
    for (const t of titles as { tmdb_id: number; type: string }[]) {
      const cache = cacheMap[`${t.tmdb_id}:${t.type}`];
      if (cache?.genres) {
        for (const g of cache.genres) {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        }
      }
    }
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / titles.length) * 100) }));

    // Top titles (liked + favorite first)
    const topTitles = titles
      .filter((t: { sentiment: string | null; favorite: boolean | null }) => t.sentiment === "liked" || t.favorite)
      .slice(0, 5)
      .map((t: { tmdb_id: number; type: string; favorite: boolean | null }) => {
        const cache = cacheMap[`${t.tmdb_id}:${t.type}`];
        return {
          tmdb_id: t.tmdb_id,
          type: t.type,
          title: cache?.title || null,
          poster_path: cache?.poster_path || null,
          year: cache?.year || null,
          favorite: t.favorite,
        };
      });

    // Most active month
    const monthCounts: Record<string, number> = {};
    for (const t of titles as { updated_at: string }[]) {
      const month = t.updated_at.substring(0, 7); // "2025-03"
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
    const mostActiveMonth = Object.entries(monthCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Get taste summary
    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_summary")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      insufficient: false,
      stats: {
        totalWatched: titles.length,
        movies: movies.length,
        tvShows: tvShows.length,
        estimatedHours,
        sentimentCounts,
        topGenres,
        topTitles,
        mostActiveMonth: mostActiveMonth
          ? { month: mostActiveMonth[0], count: mostActiveMonth[1] }
          : null,
        tasteSummary: profile?.taste_summary || null,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
