import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import {
  getTraktWatched,
  getTraktRatings,
  getTraktWatchlist,
  refreshTraktToken,
  ratingToSentiment,
} from "@/lib/trakt";
import { tmdbDetails, tmdbExternalIds, parseTitleFromTMDB } from "@/lib/tmdb";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "merge"; // merge | overwrite

    const admin = createSupabaseAdmin();

    // Get trakt token
    const { data: tokenRow } = await admin
      .from("trakt_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!tokenRow) {
      return NextResponse.json({ error: "Trakt not connected" }, { status: 400 });
    }

    let accessToken = tokenRow.access_token;

    // Refresh if expired
    if (new Date(tokenRow.expires_at) < new Date()) {
      const refreshed = await refreshTraktToken(tokenRow.refresh_token);
      accessToken = refreshed.access_token;
      await admin.from("trakt_tokens").update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }

    // Fetch all data from Trakt in parallel
    const [watchedMovies, watchedShows, ratingMovies, ratingShows, watchlistMovies, watchlistShows] =
      await Promise.all([
        getTraktWatched(accessToken, "movies"),
        getTraktWatched(accessToken, "shows"),
        getTraktRatings(accessToken, "movies"),
        getTraktRatings(accessToken, "shows"),
        getTraktWatchlist(accessToken, "movies"),
        getTraktWatchlist(accessToken, "shows"),
      ]);

    // Build ratings map for quick lookup
    const ratingsMap = new Map<string, { rating: number; sentiment: string }>();
    for (const r of [...ratingMovies, ...ratingShows]) {
      const item = r.movie || r.show;
      if (!item) continue;
      const tmdbId = item.ids.tmdb;
      const type = r.movie ? "movie" : "tv";
      ratingsMap.set(`${tmdbId}:${type}`, {
        rating: r.rating,
        sentiment: ratingToSentiment(r.rating),
      });
    }

    const supabase = await createSupabaseServer();

    if (mode === "overwrite") {
      await supabase.from("user_titles").delete().eq("user_id", user.id);
    }

    let imported = 0;
    let cached = 0;

    // Process watched
    for (const item of [...watchedMovies, ...watchedShows]) {
      const media = item.movie || item.show;
      if (!media?.ids?.tmdb) continue;
      const tmdbId = media.ids.tmdb;
      const type = item.movie ? "movie" : "tv";
      const key = `${tmdbId}:${type}`;
      const ratingInfo = ratingsMap.get(key);

      await supabase.from("user_titles").upsert({
        user_id: user.id,
        tmdb_id: tmdbId,
        type,
        status: "watched",
        sentiment: ratingInfo?.sentiment || null,
        rating: ratingInfo?.rating || null,
        watched_at: item.last_watched_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tmdb_id,type" });
      imported++;

      // Cache title
      cached += await cacheTitleFromTMDB(admin, tmdbId, type as "movie" | "tv");
    }

    // Process watchlist
    for (const item of [...watchlistMovies, ...watchlistShows]) {
      const media = item.movie || item.show;
      if (!media?.ids?.tmdb) continue;
      const tmdbId = media.ids.tmdb;
      const type = item.movie ? "movie" : "tv";

      await supabase.from("user_titles").upsert({
        user_id: user.id,
        tmdb_id: tmdbId,
        type,
        status: "watchlist",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tmdb_id,type" });
      imported++;

      cached += await cacheTitleFromTMDB(admin, tmdbId, type as "movie" | "tv");
    }

    return NextResponse.json({
      ok: true,
      imported,
      cached,
      watched: watchedMovies.length + watchedShows.length,
      watchlist: watchlistMovies.length + watchlistShows.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("Trakt sync error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function cacheTitleFromTMDB(
  admin: ReturnType<typeof createSupabaseAdmin>,
  tmdbId: number,
  type: "movie" | "tv"
): Promise<number> {
  const { data: existing } = await admin
    .from("titles_cache")
    .select("tmdb_id")
    .eq("tmdb_id", tmdbId)
    .eq("type", type)
    .single();

  if (existing) return 0;

  try {
    const [details, externalIds] = await Promise.all([
      tmdbDetails(tmdbId, type),
      tmdbExternalIds(tmdbId, type),
    ]);
    const parsed = parseTitleFromTMDB(details, type);

    await admin.from("titles_cache").upsert({
      tmdb_id: parsed.tmdb_id,
      type: parsed.type,
      imdb_id: externalIds?.imdb_id || null,
      title: parsed.title,
      original_title: parsed.original_title,
      year: parsed.year,
      overview: parsed.overview,
      genres: details.genres || [],
      poster_path: parsed.poster_path,
      backdrop_path: parsed.backdrop_path,
      vote_average: parsed.vote_average,
      vote_count: parsed.vote_count,
      popularity: parsed.popularity,
      tmdb_payload: details,
      updated_at: new Date().toISOString(),
    }, { onConflict: "tmdb_id,type" });
    return 1;
  } catch {
    return 0;
  }
}
