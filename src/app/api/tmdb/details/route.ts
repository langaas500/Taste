import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { tmdbDetails, tmdbExternalIds, parseTitleFromTMDB } from "@/lib/tmdb";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access
    const tmdbId = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type") as "movie" | "tv";
    if (!tmdbId || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const [details, externalIds] = await Promise.all([
      tmdbDetails(tmdbId, type, "videos,credits"),
      tmdbExternalIds(tmdbId, type),
    ]);

    const parsed = parseTitleFromTMDB(details, type);

    // Cache in DB
    const admin = createSupabaseAdmin();
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

    return NextResponse.json({ ...parsed, imdb_id: externalIds?.imdb_id || null, details });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
