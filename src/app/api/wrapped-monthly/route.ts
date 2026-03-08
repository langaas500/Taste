import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { generateVibeTitle } from "@/lib/ai";

const MIN_TITLES = 3;

interface WatchedRow {
  tmdb_id: number;
  type: string;
  sentiment: string | null;
  favorite: boolean | null;
  rating: number | null;
  watched_at: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const monthParam = searchParams.get("month");
    const userIdParam = searchParams.get("u");

    // Determine which month
    const now = new Date();
    const month =
      monthParam && /^\d{4}-\d{2}$/.test(monthParam)
        ? monthParam
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Determine target user
    const currentUser = await getUser();
    const targetUserId = userIdParam || currentUser?.id;
    if (!targetUserId) {
      return NextResponse.json({ error: "No user specified" }, { status: 400 });
    }

    const isOwner = currentUser?.id === targetUserId;
    const supabase = createSupabaseAdmin();

    // Month boundaries
    const [yearStr, monthStr] = month.split("-");
    const startDate = new Date(
      Date.UTC(parseInt(yearStr), parseInt(monthStr) - 1, 1),
    );
    const endDate = new Date(
      Date.UTC(parseInt(yearStr), parseInt(monthStr), 1),
    );
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // ── 1. Watched titles this month ──
    const { data: watched } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, sentiment, favorite, rating, watched_at")
      .eq("user_id", targetUserId)
      .eq("status", "watched")
      .gte("watched_at", startISO)
      .lt("watched_at", endISO)
      .order("watched_at", { ascending: false })
      .limit(500);

    const titles = (watched || []) as WatchedRow[];

    // Profile for display_name + language (needed for both sufficient and insufficient)
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, language, preferred_region")
      .eq("id", targetUserId)
      .single();

    if (titles.length < MIN_TITLES) {
      return NextResponse.json({
        insufficient: true,
        count: titles.length,
        month,
        isOwner,
        displayName: profile?.display_name || null,
      });
    }

    // ── 2. Watchlist adds this month ──
    const { data: watchlistAdds } = await supabase
      .from("user_titles")
      .select("tmdb_id")
      .eq("user_id", targetUserId)
      .eq("status", "watchlist")
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .limit(500);

    // ── 3. Se Sammen matches this month ──
    const { count: wtMatches } = await supabase
      .from("wt_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "matched")
      .not("match_tmdb_id", "is", null)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .or(`host_id.eq.${targetUserId},guest_id.eq.${targetUserId}`);

    // ── 4. Cache data for genres, mood_tags, posters, year, popularity ──
    const tmdbIds = [...new Set(titles.map((t) => t.tmdb_id))];
    const { data: cached } = await supabase
      .from("titles_cache")
      .select(
        "tmdb_id, type, title, poster_path, year, genres, mood_tags, popularity, tmdb_payload",
      )
      .in("tmdb_id", tmdbIds);

    type CacheRow = {
      tmdb_id: number;
      type: string;
      title: string;
      poster_path: string | null;
      year: number | null;
      genres: { id: number; name: string }[] | null;
      mood_tags: string[] | null;
      popularity: number | null;
      tmdb_payload: Record<string, unknown> | null;
    };

    const cacheMap = new Map<string, CacheRow>();
    for (const c of (cached || []) as CacheRow[]) {
      cacheMap.set(`${c.tmdb_id}:${c.type}`, c);
    }

    // ── Compute stats ──

    const movies = titles.filter((t) => t.type === "movie");
    const tvShows = titles.filter((t) => t.type === "tv");
    const estimatedHours = Math.round(movies.length * 2 + tvShows.length * 7.5);

    // Genre counts
    const genreCounts = new Map<string, number>();
    for (const t of titles) {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      if (c?.genres) {
        for (const g of c.genres) {
          genreCounts.set(g.name, (genreCounts.get(g.name) || 0) + 1);
        }
      }
    }
    const topGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / titles.length) * 100),
      }));
    const uniqueGenres = genreCounts.size;

    // Top 3 titles (liked/favorited first, then by watched_at)
    const topTitles = titles
      .filter((t) => t.sentiment === "liked" || t.favorite)
      .slice(0, 3)
      .map((t) => {
        const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
        return {
          tmdb_id: t.tmdb_id,
          type: t.type,
          title: c?.title || null,
          poster_path: c?.poster_path || null,
          year: c?.year || null,
        };
      });

    // Mood tag breakdown
    const moodCounts = new Map<string, number>();
    for (const t of titles) {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      if (c?.mood_tags) {
        for (const tag of c.mood_tags) {
          moodCounts.set(tag, (moodCounts.get(tag) || 0) + 1);
        }
      }
    }
    const moodBreakdown = [...moodCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    // Nordic Noir score
    const nordicNoirCount = titles.filter((t) => {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      return c?.mood_tags?.some((tag) =>
        tag.toLowerCase().includes("nordic noir"),
      );
    }).length;
    const nordicNoirPercent = Math.round(
      (nordicNoirCount / titles.length) * 100,
    );

    // Nattuggle score (watched_at hour ~22:00–06:00 UTC ≈ midnight in Nordic TZ)
    const nightOwlCount = titles.filter((t) => {
      if (!t.watched_at) return false;
      const hour = new Date(t.watched_at).getUTCHours();
      return hour >= 22 || hour < 6;
    }).length;
    const nightOwlPercent = Math.round(
      (nightOwlCount / titles.length) * 100,
    );

    // Longest streak (consecutive days with activity)
    const activeDays = new Set<string>();
    for (const t of titles) {
      if (t.watched_at) {
        activeDays.add(t.watched_at.substring(0, 10));
      }
    }
    const sortedDays = [...activeDays].sort();
    let longestStreak = 0;
    let currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffMs = curr.getTime() - prev.getTime();
      if (diffMs === 86400000) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    if (sortedDays.length === 0) longestStreak = 0;

    // ── Personality stats ──

    // Tidskapselen (favorite decade)
    const decadeCounts = new Map<string, number>();
    for (const t of titles) {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      if (c?.year) {
        const decade = `${Math.floor(c.year / 10) * 10}`;
        decadeCounts.set(decade, (decadeCounts.get(decade) || 0) + 1);
      }
    }
    const favoriteDecadeEntry = [...decadeCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Globetrotter (production_countries from tmdb_payload)
    let nordicCount = 0;
    let hollywoodCount = 0;
    let otherCount = 0;
    const nordicCodes = new Set(["NO", "DK", "FI", "SE", "IS"]);
    for (const t of titles) {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      const countries =
        (c?.tmdb_payload?.production_countries as
          | { iso_3166_1: string }[]
          | undefined) || [];
      if (countries.length === 0) {
        otherCount++;
        continue;
      }
      const codes = countries.map((pc) => pc.iso_3166_1);
      if (codes.some((code) => nordicCodes.has(code))) nordicCount++;
      else if (codes.includes("US") || codes.includes("GB")) hollywoodCount++;
      else otherCount++;
    }
    const globetrotter = {
      nordic: Math.round((nordicCount / titles.length) * 100),
      hollywood: Math.round((hollywoodCount / titles.length) * 100),
      other: Math.round((otherCount / titles.length) * 100),
    };

    // Oppdagelsesreisende (hidden gems — popularity < 20)
    const hiddenGemCount = titles.filter((t) => {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      return c?.popularity != null && c.popularity < 20;
    }).length;

    // Vibe title (AI-generated, only for owner to avoid abuse)
    let vibeTitle: string | null = null;
    if (isOwner && titles.length >= MIN_TITLES) {
      const titleNames = titles.slice(0, 15).map((t) => {
        const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
        return c?.title || "Unknown";
      });
      const topGenreNames = topGenres.slice(0, 3).map((g) => g.name);
      const region = profile?.preferred_region || "no";
      try {
        vibeTitle = await generateVibeTitle(titleNames, topGenreNames, region);
      } catch {
        vibeTitle = null;
      }
    }

    return NextResponse.json({
      insufficient: false,
      month,
      isOwner,
      displayName: profile?.display_name || null,
      stats: {
        totalWatched: titles.length,
        movies: movies.length,
        tvShows: tvShows.length,
        estimatedHours,
        topGenres,
        uniqueGenres,
        topTitles,
        moodBreakdown,
        nordicNoirPercent,
        nightOwlPercent,
        wtMatches: wtMatches || 0,
        watchlistAdds: watchlistAdds?.length || 0,
        longestStreak,
        favoriteDecade: favoriteDecadeEntry
          ? { decade: favoriteDecadeEntry[0], count: favoriteDecadeEntry[1] }
          : null,
        globetrotter,
        hiddenGems: hiddenGemCount,
        vibeTitle,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
