import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbExternalIds } from "@/lib/tmdb";
import { getNetflixIdFromWikidata } from "@/lib/netflix-id";

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access
    const tmdbId = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type") as "movie" | "tv";
    if (!tmdbId || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const admin = createSupabaseAdmin();

    // 1. Check cache
    const { data: cached } = await admin
      .from("titles_cache")
      .select("netflix_id, netflix_id_checked, imdb_id")
      .eq("tmdb_id", tmdbId)
      .eq("type", type)
      .single();

    // Already have Netflix ID cached
    if (cached?.netflix_id) {
      return NextResponse.json({ netflix_id: cached.netflix_id });
    }

    // Already checked and found nothing
    if (cached?.netflix_id_checked) {
      return NextResponse.json({ netflix_id: null });
    }

    // 2. Get IMDB ID (from cache or TMDB)
    let imdbId = cached?.imdb_id as string | null;
    if (!imdbId) {
      const externalIds = await tmdbExternalIds(tmdbId, type);
      imdbId = externalIds?.imdb_id || null;
    }

    if (!imdbId) {
      // No IMDB ID — mark as checked, return null
      await admin
        .from("titles_cache")
        .update({ netflix_id_checked: true })
        .eq("tmdb_id", tmdbId)
        .eq("type", type);
      return NextResponse.json({ netflix_id: null });
    }

    // 3. Lookup Netflix ID from Wikidata
    const netflixId = await getNetflixIdFromWikidata(imdbId);

    // 4. Cache result (even null)
    await admin
      .from("titles_cache")
      .update({
        netflix_id: netflixId || null,
        netflix_id_checked: true,
        ...(cached?.imdb_id ? {} : { imdb_id: imdbId }),
      })
      .eq("tmdb_id", tmdbId)
      .eq("type", type);

    return NextResponse.json({ netflix_id: netflixId || null });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
