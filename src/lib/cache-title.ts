import { createSupabaseAdmin } from "./supabase-server";
import { tmdbDetails, tmdbExternalIds, parseTitleFromTMDB } from "./tmdb";

export async function cacheTitleIfNeeded(tmdbId: number, type: "movie" | "tv") {
  const admin = createSupabaseAdmin();
  const { data: existing } = await admin
    .from("titles_cache")
    .select("tmdb_id")
    .eq("tmdb_id", tmdbId)
    .eq("type", type)
    .single();

  if (existing) return;

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
}
