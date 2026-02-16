import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDetails, tmdbExternalIds, parseTitleFromTMDB } from "@/lib/tmdb";

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    // Protect with service role key as bearer token
    const auth = req.headers.get("authorization");
    const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!auth || auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdmin();

    // 1. Get all distinct (tmdb_id, type) from user_titles
    const { data: userTitles, error: utErr } = await admin
      .from("user_titles")
      .select("tmdb_id, type");

    if (utErr) {
      return NextResponse.json({ error: utErr.message }, { status: 500 });
    }

    // Deduplicate (same title can belong to multiple users)
    const uniqueMap = new Map<string, { tmdb_id: number; type: "movie" | "tv" }>();
    for (const row of userTitles ?? []) {
      const key = `${row.tmdb_id}-${row.type}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { tmdb_id: row.tmdb_id, type: row.type });
      }
    }
    const allTitles = Array.from(uniqueMap.values());

    // 2. Get all cached entries that already have poster_path
    const { data: cached, error: cacheErr } = await admin
      .from("titles_cache")
      .select("tmdb_id, type, poster_path");

    if (cacheErr) {
      return NextResponse.json({ error: cacheErr.message }, { status: 500 });
    }

    const cachedSet = new Set(
      (cached ?? [])
        .filter((c: { poster_path: string | null }) => c.poster_path !== null)
        .map((c: { tmdb_id: number; type: string }) => `${c.tmdb_id}-${c.type}`)
    );

    // 3. Filter to titles missing from cache or missing poster_path
    const missing = allTitles.filter((t) => !cachedSet.has(`${t.tmdb_id}-${t.type}`));

    if (missing.length === 0) {
      return NextResponse.json({ message: "All titles already cached", updated: 0 });
    }

    // 4. Fetch from TMDB in batches of 3, with 500ms delay between batches
    let updated = 0;
    const errors: { tmdb_id: number; type: string; error: string }[] = [];

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batch = missing.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async ({ tmdb_id, type }) => {
          const [details, externalIds] = await Promise.all([
            tmdbDetails(tmdb_id, type),
            tmdbExternalIds(tmdb_id, type),
          ]);
          const parsed = parseTitleFromTMDB(details, type);

          await admin.from("titles_cache").upsert(
            {
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
            },
            { onConflict: "tmdb_id,type" }
          );

          return { tmdb_id, type };
        })
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          updated++;
        } else {
          errors.push({
            tmdb_id: batch[j].tmdb_id,
            type: batch[j].type,
            error: result.reason?.message ?? String(result.reason),
          });
        }
      }

      // Rate limit: wait between batches (skip after last batch)
      if (i + BATCH_SIZE < missing.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    return NextResponse.json({
      message: `Backfill complete`,
      total_user_titles: allTitles.length,
      missing_before: missing.length,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
