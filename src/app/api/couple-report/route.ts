import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/couple-report
 *
 * Returns Taste Compatibility Score and match data for the
 * logged-in user's linked partner pair.
 */

export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

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

    // 2. Fetch partner profile
    const { data: partnerProfile } = await admin
      .from("profiles")
      .select("display_name, founding_member")
      .eq("id", partnerId)
      .single();

    const { data: myProfile } = await admin
      .from("profiles")
      .select("display_name, founding_member, is_premium")
      .eq("id", user.id)
      .single();

    // 3. Fetch swipe data (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();

    const [mySwipes, partnerSwipes] = await Promise.all([
      admin
        .from("wt_session_swipes")
        .select("tmdb_id, media_type, decision")
        .eq("user_id", user.id)
        .in("decision", ["like", "superlike"])
        .gte("created_at", ninetyDaysAgo)
        .limit(500),
      admin
        .from("wt_session_swipes")
        .select("tmdb_id, media_type, decision")
        .eq("user_id", partnerId)
        .in("decision", ["like", "superlike"])
        .gte("created_at", ninetyDaysAgo)
        .limit(500),
    ]);

    type SwipeRow = { tmdb_id: number; media_type: string; decision: string };
    const mySwipeRows = (mySwipes.data || []) as SwipeRow[];
    const partnerSwipeRows = (partnerSwipes.data || []) as SwipeRow[];
    const myTmdbIds: number[] = [...new Set(mySwipeRows.map((s) => s.tmdb_id))];
    const partnerTmdbIds: number[] = [...new Set(partnerSwipeRows.map((s) => s.tmdb_id))];
    const allTmdbIds: number[] = [...new Set([...myTmdbIds, ...partnerTmdbIds])];

    // 4. Batch fetch genres + year from titles_cache
    const { data: titles } = await admin
      .from("titles_cache")
      .select("tmdb_id, genres, year")
      .in("tmdb_id", allTmdbIds.slice(0, 500));

    const titleMap = new Map<number, { genres: { id: number; name: string }[]; year: number | null }>();
    for (const t of (titles || []) as { tmdb_id: number; genres: unknown; year: number | null }[]) {
      const genres = Array.isArray(t.genres)
        ? (t.genres as { id: number; name: string }[]).filter((g) => typeof g === "object" && "id" in g)
        : [];
      titleMap.set(t.tmdb_id, { genres, year: t.year });
    }

    // 5. Compute genre scores
    const myGenreCounts = countGenres(myTmdbIds, titleMap);
    const partnerGenreCounts = countGenres(partnerTmdbIds, titleMap);
    const genreOverlap = computeGenreOverlap(myGenreCounts, partnerGenreCounts);

    // 6. Compute era score
    const myEras = getEraDistribution(myTmdbIds, titleMap);
    const partnerEras = getEraDistribution(partnerTmdbIds, titleMap);
    const eraScore = computeEraOverlap(myEras, partnerEras);

    // 7. Fetch match data
    const { data: sessions } = await admin
      .from("wt_sessions")
      .select("match_tmdb_id, match_type, created_at")
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
      .eq("status", "matched")
      .not("match_tmdb_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const matchedSessions = (sessions || []) as { match_tmdb_id: number; match_type: string; created_at: string }[];

    // Total sessions (all statuses)
    const { count: totalSessions } = await admin
      .from("wt_sessions")
      .select("*", { count: "exact", head: true })
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`);

    const matchRate = totalSessions && totalSessions > 0
      ? Math.round((matchedSessions.length / totalSessions) * 100)
      : 50;

    // 8. Fetch top 5 match titles
    const matchTmdbIds = matchedSessions.slice(0, 5).map((s) => s.match_tmdb_id);
    const { data: matchTitles } = await admin
      .from("titles_cache")
      .select("tmdb_id, type, title, poster_path, slug, year")
      .in("tmdb_id", matchTmdbIds.length > 0 ? matchTmdbIds : [0]);

    const favoriteTitles = matchTmdbIds
      .map((id) => (matchTitles || []).find((t: { tmdb_id: number }) => t.tmdb_id === id))
      .filter(Boolean);

    // 9. Compute final compatibility score
    const compatibilityScore = Math.round(
      genreOverlap * 0.4 +
      matchRate * 0.4 +
      eraScore * 0.2,
    );

    // 10. Top genres + avoided genres
    const topGenres = getTopGenreNames(myGenreCounts, partnerGenreCounts, titleMap);
    const avoidedGenres = getAvoidedGenres(myTmdbIds, partnerTmdbIds, titleMap);

    // 11. Percentile (simplified: based on score)
    const percentile = Math.min(99, Math.max(1, Math.round(compatibilityScore * 0.95 + 5)));

    // 12. Tonight's pick
    const today = new Date().toISOString().slice(0, 10);
    const { data: pick } = await admin
      .from("couple_picks")
      .select("movie_title, movie_poster_path, movie_match_score, series_title, series_poster_path, series_match_score")
      .eq("link_id", link.id)
      .eq("generated_at", today)
      .single();

    return NextResponse.json({
      compatibility_score: compatibilityScore,
      genre_overlap: genreOverlap,
      tone_score: matchRate,
      era_score: eraScore,
      percentile,
      total_matches: matchedSessions.length,
      favorite_titles: favoriteTitles,
      top_genres: topGenres,
      avoided_genres: avoidedGenres,
      partner_name: partnerProfile?.display_name || "Partner",
      partner_founding: !!partnerProfile?.founding_member,
      my_name: myProfile?.display_name || "Du",
      my_founding: !!myProfile?.founding_member,
      is_premium: !!myProfile?.is_premium,
      tonight_pick: pick || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ── Helpers ─────────────────────────────────────────── */

type GenreCounts = Map<number, number>;
type TitleInfo = { genres: { id: number; name: string }[]; year: number | null };

function countGenres(tmdbIds: number[], titleMap: Map<number, TitleInfo>): GenreCounts {
  const counts = new Map<number, number>();
  for (const id of tmdbIds) {
    const info = titleMap.get(id);
    if (!info) continue;
    for (const g of info.genres) {
      counts.set(g.id, (counts.get(g.id) || 0) + 1);
    }
  }
  return counts;
}

function computeGenreOverlap(a: GenreCounts, b: GenreCounts): number {
  const topA = new Set([...a.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([id]) => id));
  const topB = new Set([...b.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([id]) => id));
  if (topA.size === 0 && topB.size === 0) return 50;
  const overlap = [...topA].filter((id) => topB.has(id)).length;
  const union = new Set([...topA, ...topB]).size;
  return Math.round((overlap / union) * 100);
}

function getEraDistribution(tmdbIds: number[], titleMap: Map<number, TitleInfo>): Map<string, number> {
  const eras = new Map<string, number>();
  for (const id of tmdbIds) {
    const info = titleMap.get(id);
    if (!info?.year) continue;
    const decade = `${Math.floor(info.year / 10) * 10}s`;
    eras.set(decade, (eras.get(decade) || 0) + 1);
  }
  return eras;
}

function computeEraOverlap(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 && b.size === 0) return 50;
  const allEras = new Set([...a.keys(), ...b.keys()]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (const era of allEras) {
    const va = a.get(era) || 0;
    const vb = b.get(era) || 0;
    dotProduct += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 50;
  const cosine = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  return Math.round(cosine * 100);
}

function getTopGenreNames(
  a: GenreCounts,
  b: GenreCounts,
  titleMap: Map<number, TitleInfo>,
): string[] {
  const combined = new Map<number, number>();
  for (const [id, count] of a) combined.set(id, (combined.get(id) || 0) + count);
  for (const [id, count] of b) combined.set(id, (combined.get(id) || 0) + count);

  // Build id→name map from titleMap
  const nameMap = new Map<number, string>();
  for (const info of titleMap.values()) {
    for (const g of info.genres) nameMap.set(g.id, g.name);
  }

  return [...combined.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 5)
    .map(([id]) => nameMap.get(id) || `Genre ${id}`);
}

function getAvoidedGenres(
  myIds: number[],
  partnerIds: number[],
  titleMap: Map<number, TitleInfo>,
): string[] {
  // Genres that appear in neither user's liked titles
  const allLiked = new Set([...myIds, ...partnerIds]);
  const likedGenres = new Set<number>();
  const allGenres = new Map<number, string>();

  for (const [, info] of titleMap) {
    for (const g of info.genres) allGenres.set(g.id, g.name);
  }
  for (const id of allLiked) {
    const info = titleMap.get(id);
    if (!info) continue;
    for (const g of info.genres) likedGenres.add(g.id);
  }

  return [...allGenres.entries()]
    .filter(([id]) => !likedGenres.has(id))
    .slice(0, 3)
    .map(([, name]) => name);
}
