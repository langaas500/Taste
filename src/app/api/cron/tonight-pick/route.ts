import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDiscover } from "@/lib/tmdb";

/**
 * GET /api/cron/tonight-pick
 *
 * Daily cron (14:00 UTC): generates couple picks for all
 * accepted partner links with at least one premium user.
 * Processes up to 20 pairs per invocation.
 *
 * Auth: x-cron-secret header.
 */

const BATCH_SIZE = 20;

interface LinkRow {
  id: string;
  inviter_id: string;
  invitee_id: string;
}

interface ProfileRow {
  id: string;
  is_premium: boolean;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // Find accepted links where at least one user is premium
  const { data: links } = await admin
    .from("account_links")
    .select("id, inviter_id, invitee_id")
    .eq("status", "accepted")
    .limit(100);

  if (!links || links.length === 0) {
    return NextResponse.json({ generated: 0, skipped: 0 });
  }

  // Get all user IDs to batch-check premium status
  const typedLinks = links as LinkRow[];
  const userIds = [
    ...new Set(typedLinks.flatMap((l: LinkRow) => [l.inviter_id, l.invitee_id].filter(Boolean))),
  ];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, is_premium")
    .in("id", userIds);

  const typedProfiles = (profiles || []) as ProfileRow[];
  const premiumSet = new Set(
    typedProfiles.filter((p: ProfileRow) => p.is_premium).map((p: ProfileRow) => p.id),
  );

  // Filter to links with at least one premium user
  const eligibleLinks = typedLinks.filter(
    (l: LinkRow) => premiumSet.has(l.inviter_id) || (l.invitee_id && premiumSet.has(l.invitee_id)),
  );

  // Check which already have picks today (batch)
  const linkIds = eligibleLinks.map((l: LinkRow) => l.id);
  const { data: existingPicks } = await admin
    .from("couple_picks")
    .select("link_id")
    .in("link_id", linkIds)
    .eq("generated_at", today);

  const existingSet = new Set((existingPicks || []).map((p: { link_id: string }) => p.link_id));
  const needsPick = eligibleLinks.filter((l: LinkRow) => !existingSet.has(l.id));

  // Process batch
  const batch = needsPick.slice(0, BATCH_SIZE);
  let generated = 0;

  for (const link of batch) {
    try {
      await generatePickForLink(admin, link.id, link.inviter_id, link.invitee_id, today);
      generated++;
    } catch (e) {
      console.error(`[tonight-pick-cron] Failed for link ${link.id}:`, e instanceof Error ? e.message : e);
    }
  }

  return NextResponse.json({
    generated,
    skipped: eligibleLinks.length - batch.length,
    total_eligible: eligibleLinks.length,
  });
}

/* ── Helpers ─────────────────────────────────────────── */

async function getUserTopGenreIds(
  admin: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
): Promise<number[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: swipes } = await admin
    .from("wt_session_swipes")
    .select("tmdb_id")
    .eq("user_id", userId)
    .in("decision", ["like", "superlike"])
    .gte("created_at", thirtyDaysAgo)
    .limit(200);

  if (!swipes || swipes.length === 0) return [];

  const tmdbIds = [...new Set(swipes.map((s: { tmdb_id: number }) => s.tmdb_id))];
  const { data: titles } = await admin
    .from("titles_cache")
    .select("genres")
    .in("tmdb_id", tmdbIds.slice(0, 200));

  if (!titles) return [];

  const counts = new Map<number, number>();
  for (const t of titles) {
    const genres = t.genres as { id: number; name: string }[] | null;
    if (!Array.isArray(genres)) continue;
    for (const g of genres) {
      const id = typeof g === "number" ? g : g.id;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
}

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
}

async function generatePickForLink(
  admin: ReturnType<typeof createSupabaseAdmin>,
  linkId: string,
  inviterId: string,
  inviteeId: string,
  today: string,
) {
  const [genresA, genresB] = await Promise.all([
    getUserTopGenreIds(admin, inviterId),
    inviteeId ? getUserTopGenreIds(admin, inviteeId) : Promise.resolve([]),
  ]);

  // Compute overlap
  const setA = new Set(genresA);
  const setB = new Set(genresB);
  const overlap = genresA.filter((id) => setB.has(id));
  const union = new Set([...setA, ...setB]);
  const score = union.size > 0 ? Math.round((overlap.length / union.size) * 100) : 50;

  const genreIds = overlap.length > 0
    ? overlap
    : genresA.length > 0
      ? genresA.slice(0, 3)
      : genresB.slice(0, 3);

  // Discover movie + series
  let movie: { tmdb_id: number; title: string; poster_path: string | null } | null = null;
  let series: { tmdb_id: number; title: string; poster_path: string | null } | null = null;

  if (genreIds.length > 0) {
    const params = {
      with_genres: genreIds.join(","),
      "vote_average.gte": "7.0",
      "vote_count.gte": "100",
      sort_by: "popularity.desc",
    };

    const [movieData, seriesData] = await Promise.all([
      tmdbDiscover("movie", params).catch(() => ({ results: [] })),
      tmdbDiscover("tv", params).catch(() => ({ results: [] })),
    ]);

    const pickFrom = (results: TmdbResult[]) => {
      const eligible = results.filter((r) => r.vote_average >= 7.0 && r.poster_path);
      if (eligible.length === 0) return null;
      const pick = eligible[Math.floor(Math.random() * Math.min(eligible.length, 10))];
      return {
        tmdb_id: pick.id,
        title: pick.title || pick.name || "Unknown",
        poster_path: pick.poster_path,
      };
    };

    movie = pickFrom((movieData.results || []) as TmdbResult[]);
    series = pickFrom((seriesData.results || []) as TmdbResult[]);
  }

  await admin.from("couple_picks").upsert(
    {
      link_id: linkId,
      movie_tmdb_id: movie?.tmdb_id ?? null,
      movie_type: movie ? "movie" : null,
      movie_title: movie?.title ?? null,
      movie_poster_path: movie?.poster_path ?? null,
      movie_match_score: movie ? score : null,
      series_tmdb_id: series?.tmdb_id ?? null,
      series_type: series ? "tv" : null,
      series_title: series?.title ?? null,
      series_poster_path: series?.poster_path ?? null,
      series_match_score: series ? score : null,
      generated_at: today,
      reroll_count: 0,
    },
    { onConflict: "link_id,generated_at" },
  );
}
