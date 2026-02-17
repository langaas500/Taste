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

/** Simple concurrency limiter — no external deps. */
async function withConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;
  const iter = items[Symbol.iterator]();
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (let next = iter.next(); !next.done; next = iter.next()) {
      await fn(next.value);
    }
  });
  await Promise.all(workers);
}

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
        expires_at: new Date(Date.now() + (typeof refreshed.expires_in === "number" && refreshed.expires_in > 0 ? refreshed.expires_in : 7776000) * 1000).toISOString(),
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

    const now = new Date().toISOString();

    // ── Build all rows to upsert ──────────────────────────────────────────────
    const watchedRows: {
      user_id: string; tmdb_id: number; type: string; status: "watched";
      sentiment: string | null; rating: number | null; watched_at: string | null; updated_at: string;
    }[] = [];

    for (const item of [...watchedMovies, ...watchedShows]) {
      const media = item.movie || item.show;
      if (!media?.ids?.tmdb) continue;
      const tmdbId = media.ids.tmdb;
      const type = item.movie ? "movie" : "tv";
      const ratingInfo = ratingsMap.get(`${tmdbId}:${type}`);
      watchedRows.push({
        user_id: user.id,
        tmdb_id: tmdbId,
        type,
        status: "watched",
        sentiment: ratingInfo?.sentiment || null,
        rating: ratingInfo?.rating || null,
        watched_at: item.last_watched_at || null,
        updated_at: now,
      });
    }

    const watchlistRows: {
      user_id: string; tmdb_id: number; type: string; status: "watchlist"; updated_at: string;
    }[] = [];

    for (const item of [...watchlistMovies, ...watchlistShows]) {
      const media = item.movie || item.show;
      if (!media?.ids?.tmdb) continue;
      const tmdbId = media.ids.tmdb;
      const type = item.movie ? "movie" : "tv";
      watchlistRows.push({
        user_id: user.id,
        tmdb_id: tmdbId,
        type,
        status: "watchlist",
        updated_at: now,
      });
    }

    // ── Bulk upsert user_titles in chunks of 100 ─────────────────────────────
    const allRows = [...watchedRows, ...watchlistRows];
    const CHUNK = 100;
    for (let i = 0; i < allRows.length; i += CHUNK) {
      await supabase
        .from("user_titles")
        .upsert(allRows.slice(i, i + CHUNK), { onConflict: "user_id,tmdb_id,type" });
    }

    const imported = allRows.length;

    // ── Cache enrichment: up to 100 titles, skipping already-cached ──────────
    const toEnrich: { tmdb_id: number; type: "movie" | "tv" }[] = [];
    const seenKeys = new Set<string>();
    for (const row of allRows) {
      const key = `${row.tmdb_id}:${row.type}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        toEnrich.push({ tmdb_id: row.tmdb_id, type: row.type as "movie" | "tv" });
      }
    }

    const enrichList = toEnrich.slice(0, 100);

    // Single batch query to find which are already cached
    const { data: alreadyCached } = await admin
      .from("titles_cache")
      .select("tmdb_id, type")
      .in("tmdb_id", enrichList.map((e) => e.tmdb_id));

    const cachedSet = new Set<string>();
    for (const c of alreadyCached || []) {
      cachedSet.add(`${c.tmdb_id}:${c.type}`);
    }

    const missing = enrichList.filter((e) => !cachedSet.has(`${e.tmdb_id}:${e.type}`));

    // Fetch missing titles from TMDB with concurrency=6 — collect rows, no per-title DB writes
    const cacheRowsToUpsert: Record<string, unknown>[] = [];
    await withConcurrency(missing, 6, async ({ tmdb_id, type }) => {
      try {
        const [details, externalIds] = await Promise.all([
          tmdbDetails(tmdb_id, type),
          tmdbExternalIds(tmdb_id, type),
        ]);
        const parsed = parseTitleFromTMDB(details, type);
        cacheRowsToUpsert.push({
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
        });
      } catch {
        // Skip individual failures — don't abort the whole sync
      }
    });

    // Bulk upsert titles_cache in chunks of 25
    const CACHE_CHUNK = 25;
    for (let i = 0; i < cacheRowsToUpsert.length; i += CACHE_CHUNK) {
      await admin
        .from("titles_cache")
        .upsert(cacheRowsToUpsert.slice(i, i + CACHE_CHUNK), { onConflict: "tmdb_id,type" });
    }
    const cached = cacheRowsToUpsert.length;

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
