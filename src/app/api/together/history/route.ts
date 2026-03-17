import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Check premium status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    const isPremium = !!profile?.is_premium;

    // Count total matches for gate display
    const { count: totalCount } = await supabase
      .from("wt_sessions")
      .select("id", { count: "exact", head: true })
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
      .eq("status", "matched")
      .not("match_tmdb_id", "is", null);

    // Fetch matched sessions (limited for free users)
    const { data: sessions } = await supabase
      .from("wt_sessions")
      .select("id, match_tmdb_id, match_type, created_at")
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
      .eq("status", "matched")
      .not("match_tmdb_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(isPremium ? 50 : 10);

    const rows = (sessions || []) as {
      id: string;
      match_tmdb_id: number;
      match_type: string;
      created_at: string;
    }[];

    if (rows.length === 0) {
      return NextResponse.json({
        matches: [],
        stats: { total_matches: 0, top_genre: null, last_match: null },
        is_premium: isPremium,
        total_count: totalCount ?? 0,
      });
    }

    // Batch fetch title info from titles_cache
    const tmdbIds = [...new Set(rows.map((r) => r.match_tmdb_id))];
    const { data: cached } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, poster_path, year, genres, slug")
      .in("tmdb_id", tmdbIds);

    const cacheMap = new Map(
      (cached || []).map((c) => [`${c.tmdb_id}:${c.type}`, c])
    );

    // Build matches with title info
    const matches = rows.map((r) => {
      const c = cacheMap.get(`${r.match_tmdb_id}:${r.match_type}`);
      return {
        session_id: r.id,
        tmdb_id: r.match_tmdb_id,
        type: r.match_type,
        title: c?.title || `TMDB:${r.match_tmdb_id}`,
        poster_path: c?.poster_path || null,
        year: c?.year || null,
        slug: c?.slug || null,
        created_at: r.created_at,
      };
    });

    // Compute top genre across all matches
    const genreCount: Record<string, number> = {};
    for (const r of rows) {
      const c = cacheMap.get(`${r.match_tmdb_id}:${r.match_type}`);
      const genres = c?.genres;
      if (Array.isArray(genres)) {
        for (const g of genres as { id: number; name: string }[]) {
          if (g.name) genreCount[g.name] = (genreCount[g.name] || 0) + 1;
        }
      }
    }
    const topGenre = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return NextResponse.json({
      matches,
      stats: {
        total_matches: totalCount ?? rows.length,
        top_genre: topGenre,
        last_match: matches[0] || null,
      },
      is_premium: isPremium,
      total_count: totalCount ?? rows.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
