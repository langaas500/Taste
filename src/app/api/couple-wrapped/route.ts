import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/couple-wrapped?month=2026-04
 *
 * Returns monthly wrapped data for a couple: shared watches,
 * overlap analysis, individual stats side-by-side.
 */

const MIN_TITLES = 3;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // Parse month param
    const monthParam = req.nextUrl.searchParams.get("month");
    const now = new Date();
    const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [yearStr, monthStr] = month.split("-");
    const startDate = `${yearStr}-${monthStr}-01`;
    const endMonth = parseInt(monthStr) === 12
      ? `${parseInt(yearStr) + 1}-01-01`
      : `${yearStr}-${String(parseInt(monthStr) + 1).padStart(2, "0")}-01`;

    // 1. Find accepted partner link
    const { data: link } = await admin
      .from("account_links")
      .select("id, inviter_id, invitee_id")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    if (!link) {
      return NextResponse.json({ error: "No linked partner" }, { status: 404 });
    }

    const partnerId = link.inviter_id === user.id ? link.invitee_id : link.inviter_id;

    // 2. Fetch profiles + both users' watched titles this month in parallel
    const [myProfileRes, partnerProfileRes, myTitlesRes, partnerTitlesRes, matchesRes] = await Promise.all([
      admin.from("profiles").select("display_name").eq("id", user.id).single(),
      admin.from("profiles").select("display_name").eq("id", partnerId).single(),
      admin
        .from("user_titles")
        .select("tmdb_id, type, sentiment, rating, watched_at")
        .eq("user_id", user.id)
        .eq("status", "watched")
        .gte("watched_at", startDate)
        .lt("watched_at", endMonth)
        .order("watched_at", { ascending: false }),
      admin
        .from("user_titles")
        .select("tmdb_id, type, sentiment, rating, watched_at")
        .eq("user_id", partnerId)
        .eq("status", "watched")
        .gte("watched_at", startDate)
        .lt("watched_at", endMonth)
        .order("watched_at", { ascending: false }),
      // Watch Together matches this month
      admin
        .from("wt_sessions")
        .select("match_tmdb_id, match_type, updated_at")
        .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
        .eq("status", "matched")
        .gte("updated_at", startDate)
        .lt("updated_at", endMonth),
    ]);

    const myProfile = myProfileRes.data;
    const partnerProfile = partnerProfileRes.data;
    type WatchedRow = { tmdb_id: number; type: string; sentiment: string | null; rating: number | null; watched_at: string | null };
    const myTitles = (myTitlesRes.data ?? []) as WatchedRow[];
    const partnerTitles = (partnerTitlesRes.data ?? []) as WatchedRow[];
    const matches = (matchesRes.data ?? []) as { match_tmdb_id: number | null; match_type: string | null; updated_at: string | null }[];

    const totalBoth = myTitles.length + partnerTitles.length;
    if (totalBoth < MIN_TITLES) {
      return NextResponse.json({
        insufficient: true,
        count: totalBoth,
        myName: myProfile?.display_name || null,
        partnerName: partnerProfile?.display_name || null,
      });
    }

    // 3. Find overlap — titles both watched this month
    const mySet = new Set(myTitles.map((t) => `${t.tmdb_id}:${t.type}`));
    const partnerSet = new Set(partnerTitles.map((t) => `${t.tmdb_id}:${t.type}`));
    const overlapKeys = [...mySet].filter((k) => partnerSet.has(k));

    // 4. Fetch cache for all titles
    const allIds = new Set([...myTitles.map((t) => t.tmdb_id), ...partnerTitles.map((t) => t.tmdb_id)]);
    const { data: cacheRows } = await admin
      .from("titles_cache")
      .select("tmdb_id, type, title, genres, poster_path")
      .in("tmdb_id", [...allIds]);
    type CacheRow = { tmdb_id: number; type: string; title: string; genres: unknown; poster_path: string | null };
    const cache = new Map<string, CacheRow>((cacheRows ?? []).map((r: CacheRow) => [`${r.tmdb_id}:${r.type}`, r]));

    // 5. Build overlap details
    const overlapTitles = overlapKeys.map((key) => {
      const c = cache.get(key);
      if (!c) return null;
      const myEntry = myTitles.find((t) => `${t.tmdb_id}:${t.type}` === key);
      const partnerEntry = partnerTitles.find((t) => `${t.tmdb_id}:${t.type}` === key);
      return {
        tmdb_id: c.tmdb_id,
        type: c.type,
        title: c.title,
        poster_path: c.poster_path,
        mySentiment: myEntry?.sentiment || null,
        myRating: myEntry?.rating || null,
        partnerSentiment: partnerEntry?.sentiment || null,
        partnerRating: partnerEntry?.rating || null,
      };
    }).filter(Boolean);

    // 6. Genre analysis
    function topGenres(titles: { tmdb_id: number; type: string }[]): string[] {
      const freq: Record<string, number> = {};
      for (const t of titles) {
        const c = cache.get(`${t.tmdb_id}:${t.type}`);
        if (!c || !Array.isArray(c.genres)) continue;
        for (const g of c.genres as { name: string }[]) {
          freq[g.name] = (freq[g.name] || 0) + 1;
        }
      }
      return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
    }

    const myGenres = topGenres(myTitles);
    const partnerGenres = topGenres(partnerTitles);
    const sharedGenres = myGenres.filter((g) => partnerGenres.includes(g));

    // 7. Agreement score on overlapping titles
    let agreed = 0;
    let disagreed = 0;
    for (const t of overlapTitles) {
      if (!t) continue;
      const mySent = t.mySentiment;
      const pSent = t.partnerSentiment;
      if (mySent && pSent) {
        if (mySent === pSent) agreed++;
        else if ((mySent === "liked" && pSent === "disliked") || (mySent === "disliked" && pSent === "liked")) disagreed++;
      }
    }
    const agreementScore = agreed + disagreed > 0 ? Math.round((agreed / (agreed + disagreed)) * 100) : null;

    // 8. Stats
    const myMovies = myTitles.filter((t) => t.type === "movie").length;
    const mySeries = myTitles.filter((t) => t.type === "tv").length;
    const partnerMovies = partnerTitles.filter((t) => t.type === "movie").length;
    const partnerSeries = partnerTitles.filter((t) => t.type === "tv").length;

    return NextResponse.json({
      month,
      myName: myProfile?.display_name || null,
      partnerName: partnerProfile?.display_name || null,
      my: {
        total: myTitles.length,
        movies: myMovies,
        series: mySeries,
        topGenres: myGenres,
        hours: myMovies * 2 + mySeries * 8,
      },
      partner: {
        total: partnerTitles.length,
        movies: partnerMovies,
        series: partnerSeries,
        topGenres: partnerGenres,
        hours: partnerMovies * 2 + partnerSeries * 8,
      },
      overlap: {
        count: overlapTitles.length,
        titles: overlapTitles.slice(0, 10),
        agreementScore,
        sharedGenres,
      },
      wtMatches: matches.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
