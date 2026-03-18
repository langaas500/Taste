import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDiscover } from "@/lib/tmdb";

/**
 * GET /api/tonight-pick
 *
 * Returns today's curated movie + series pick for the logged-in
 * user's linked partner pair. Generates on-demand if no pick exists.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // Find accepted partner link (optional — solo users won't have one)
    const { data: link } = await admin
      .from("account_links")
      .select("id, inviter_id, invitee_id")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    const isSolo = !link;
    const linkId = link?.id ?? null;
    const partnerId = link ? (link.inviter_id === user.id ? link.invitee_id : link.inviter_id) : null;
    const today = new Date().toISOString().slice(0, 10);

    // Check for existing pick today (keyed by user_id)
    const { data: existing } = await admin
      .from("couple_picks")
      .select("*")
      .eq("user_id", user.id)
      .eq("generated_at", today)
      .single();

    if (existing) {
      return NextResponse.json({ ...formatPick(existing), solo: isSolo });
    }

    // Generate new pick
    const pick = await generatePick(admin, linkId, user.id, partnerId, today);
    return NextResponse.json({ ...pick, solo: isSolo });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/tonight-pick (reroll)
 *
 * Re-generates today's pick. Premium only. Increments reroll_count.
 */
export async function POST() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // Check premium
    const { data: profile } = await admin
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    if (!profile?.is_premium) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    // Find accepted partner link (optional — solo users won't have one)
    const { data: link } = await admin
      .from("account_links")
      .select("id, inviter_id, invitee_id")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    const isSolo = !link;
    const linkId = link?.id ?? null;
    const partnerId = link ? (link.inviter_id === user.id ? link.invitee_id : link.inviter_id) : null;
    const today = new Date().toISOString().slice(0, 10);

    // Get current reroll count
    const { data: current } = await admin
      .from("couple_picks")
      .select("reroll_count")
      .eq("user_id", user.id)
      .eq("generated_at", today)
      .single();

    const rerollCount = (current?.reroll_count ?? 0) + 1;

    // Delete existing and regenerate
    await admin
      .from("couple_picks")
      .delete()
      .eq("user_id", user.id)
      .eq("generated_at", today);

    const pick = await generatePick(admin, linkId, user.id, partnerId, today, rerollCount);
    return NextResponse.json({ ...pick, solo: isSolo });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ── Helpers ─────────────────────────────────────────── */

interface GenreCount {
  genre_id: number;
  count: number;
}

async function getUserTopGenres(
  admin: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
): Promise<GenreCount[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // Get liked/superliked tmdb_ids from swipes
  const { data: swipes } = await admin
    .from("wt_session_swipes")
    .select("tmdb_id, media_type")
    .eq("user_id", userId)
    .in("decision", ["like", "superlike"])
    .gte("created_at", thirtyDaysAgo)
    .limit(200);

  if (!swipes || swipes.length === 0) return [];

  // Batch fetch genres from titles_cache
  const tmdbIds = [...new Set(swipes.map((s: { tmdb_id: number }) => s.tmdb_id))];
  const { data: titles } = await admin
    .from("titles_cache")
    .select("tmdb_id, genres")
    .in("tmdb_id", tmdbIds.slice(0, 200));

  if (!titles) return [];

  // Count genre occurrences
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
    .map(([genre_id, count]) => ({ genre_id, count }))
    .sort((a, b) => b.count - a.count);
}

function computeOverlap(
  genresA: GenreCount[],
  genresB: GenreCount[],
): { genreIds: number[]; score: number } {
  const setA = new Set(genresA.slice(0, 10).map((g) => g.genre_id));
  const setB = new Set(genresB.slice(0, 10).map((g) => g.genre_id));

  const overlap: number[] = [];
  for (const id of setA) {
    if (setB.has(id)) overlap.push(id);
  }

  // Score: percentage of overlap out of union
  const union = new Set([...setA, ...setB]);
  const score = union.size > 0 ? Math.round((overlap.length / union.size) * 100) : 50;

  // Fall back to combined top genres if no overlap
  if (overlap.length === 0) {
    const fallback = genresA.length > 0
      ? genresA.slice(0, 3).map((g) => g.genre_id)
      : genresB.slice(0, 3).map((g) => g.genre_id);
    return { genreIds: fallback, score: 30 };
  }

  return { genreIds: overlap, score };
}

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
}

async function discoverTitle(
  type: "movie" | "tv",
  genreIds: number[],
  page: string = "1",
): Promise<{ tmdb_id: number; title: string; poster_path: string | null } | null> {
  try {
    const data = await tmdbDiscover(type, {
      with_genres: genreIds.join(","),
      "vote_average.gte": "7.0",
      "vote_count.gte": "100",
      sort_by: "popularity.desc",
      page,
    });

    const results = (data.results || []) as TmdbResult[];
    const eligible = results.filter((r) => r.vote_average >= 7.0 && r.poster_path);
    if (eligible.length === 0) return null;

    // Random pick from top 10
    const pick = eligible[Math.floor(Math.random() * Math.min(eligible.length, 10))];
    return {
      tmdb_id: pick.id,
      title: pick.title || pick.name || "Unknown",
      poster_path: pick.poster_path,
    };
  } catch {
    return null;
  }
}

async function generatePick(
  admin: ReturnType<typeof createSupabaseAdmin>,
  linkId: string | null,
  userId: string,
  partnerId: string | null,
  today: string,
  rerollCount: number = 0,
) {
  // Get genre preferences — solo uses only user's genres
  const genresA = await getUserTopGenres(admin, userId);
  const genresB = partnerId ? await getUserTopGenres(admin, partnerId) : [];

  const { genreIds, score } = partnerId
    ? computeOverlap(genresA, genresB)
    : { genreIds: genresA.slice(0, 5).map((g) => g.genre_id), score: 85 };

  // Use different TMDB pages for rerolls to get fresh results
  const page = String(1 + rerollCount);

  // Discover movie and series in parallel
  const [movie, series] = await Promise.all([
    discoverTitle("movie", genreIds, page),
    discoverTitle("tv", genreIds, page),
  ]);

  // Insert pick
  const row = {
    user_id: userId,
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
    reroll_count: rerollCount,
  };

  const { data: inserted, error } = await admin
    .from("couple_picks")
    .upsert(row, { onConflict: "user_id,generated_at" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return formatPick(inserted);
}

function formatPick(row: Record<string, unknown>) {
  return {
    movie: row.movie_tmdb_id
      ? {
          tmdb_id: row.movie_tmdb_id,
          type: row.movie_type,
          title: row.movie_title,
          poster_path: row.movie_poster_path,
          match_score: row.movie_match_score,
        }
      : null,
    series: row.series_tmdb_id
      ? {
          tmdb_id: row.series_tmdb_id,
          type: row.series_type,
          title: row.series_title,
          poster_path: row.series_poster_path,
          match_score: row.series_match_score,
        }
      : null,
    reroll_count: row.reroll_count,
    generated_at: row.generated_at,
  };
}
