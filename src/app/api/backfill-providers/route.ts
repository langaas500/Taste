import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbWatchProviders, parseTitleFromTMDB } from "@/lib/tmdb";
import { buildSlug } from "@/lib/slug";
import { env } from "@/lib/env";

/**
 * POST /api/backfill-providers?type=movie&fromPage=1&toPage=5
 *
 * Fetches popular titles from TMDB page range, then fetches
 * watch providers for NO, DK, FI, SE and caches everything.
 *
 * Params:
 *   type     — "movie" | "tv" (required)
 *   fromPage — start page (default 1, min 1)
 *   toPage   — end page (default 5, max 25)
 *   dryrun   — "true" to preview without writing
 *
 * Auth: x-backfill-secret header
 */

const NORDIC_COUNTRIES = ["NO", "DK", "FI", "SE"] as const;
const TMDB_BASE = "https://api.themoviedb.org/3";
const DELAY_MS = 50;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbPopularPage(type: "movie" | "tv", page: number): Promise<{ results: Record<string, unknown>[] }> {
  const res = await fetch(
    `${TMDB_BASE}/${type}/popular?language=en-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
    await sleep(Math.max(retryAfter, 1) * 1000);
    return tmdbPopularPage(type, page);
  }
  if (!res.ok) throw new Error(`TMDB popular error: ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  // Auth
  const secret = req.headers.get("x-backfill-secret");
  if (!secret || secret !== env.BACKFILL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") as "movie" | "tv" | null;
  if (!type || !["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Missing or invalid 'type' param (movie|tv)" }, { status: 400 });
  }

  const fromPage = Math.max(parseInt(sp.get("fromPage") || "1", 10) || 1, 1);
  const toPage = Math.min(parseInt(sp.get("toPage") || "5", 10) || 5, 25);
  const dryrun = sp.get("dryrun") === "true";

  if (fromPage > toPage) {
    return NextResponse.json({ error: "fromPage must be <= toPage" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // 1. Fetch popular titles from TMDB pages
  const allTitles: Record<string, unknown>[] = [];
  for (let page = fromPage; page <= toPage; page++) {
    const data = await tmdbPopularPage(type, page);
    allTitles.push(...(data.results || []));
    if (page < toPage) await sleep(DELAY_MS);
  }

  if (allTitles.length === 0) {
    return NextResponse.json({ status: "empty", message: "No titles found from TMDB" });
  }

  // 2. Check which titles already have provider data for ALL 4 Nordic countries
  const tmdbIds = allTitles.map((t) => t.id as number);

  const { data: existingProviders } = await admin
    .from("watch_providers_cache")
    .select("tmdb_id, country")
    .eq("type", type)
    .in("tmdb_id", tmdbIds)
    .in("country", [...NORDIC_COUNTRIES]);

  // Build set of "tmdbId:country" that already exist
  const existingSet = new Set(
    (existingProviders || []).map((r: { tmdb_id: number; country: string }) => `${r.tmdb_id}:${r.country}`),
  );

  // Filter to titles missing at least one Nordic country
  const titlesToProcess = allTitles.filter((t) => {
    const id = t.id as number;
    return NORDIC_COUNTRIES.some((c) => !existingSet.has(`${id}:${c}`));
  });

  if (dryrun) {
    return NextResponse.json({
      status: "dryrun",
      type,
      pages: `${fromPage}-${toPage}`,
      total_from_tmdb: allTitles.length,
      already_cached: allTitles.length - titlesToProcess.length,
      would_process: titlesToProcess.length,
      sample: titlesToProcess.slice(0, 10).map((t) => ({
        tmdb_id: t.id,
        title: type === "movie" ? t.title : t.name,
      })),
    });
  }

  // 3. Process each title: fetch providers + upsert title + upsert providers
  let titlesUpserted = 0;
  let providersCached = 0;
  let errors = 0;

  // Batch titles_cache upserts
  const titleRows = allTitles.map((raw) => {
    const parsed = parseTitleFromTMDB(raw, type);
    const slug = buildSlug(parsed.title, parsed.tmdb_id);
    return {
      ...parsed,
      slug,
      tmdb_payload: raw,
      updated_at: new Date().toISOString(),
    };
  });

  // Upsert titles in chunks of 50
  const CHUNK = 50;
  for (let i = 0; i < titleRows.length; i += CHUNK) {
    const chunk = titleRows.slice(i, i + CHUNK);
    const { error } = await admin
      .from("titles_cache")
      .upsert(chunk, { onConflict: "tmdb_id,type" });

    if (error) {
      console.error(`[backfill-providers] titles_cache chunk error: ${error.message}`);
      errors++;
    } else {
      titlesUpserted += chunk.length;
    }
  }

  // 4. Fetch watch providers for titles that need them
  const providerRows: { tmdb_id: number; type: string; country: string; providers: unknown; cached_at: string }[] = [];

  for (const title of titlesToProcess) {
    const tmdbId = title.id as number;

    try {
      const res = await tmdbWatchProviders(tmdbId, type);
      const results = res.results || {};

      for (const country of NORDIC_COUNTRIES) {
        if (existingSet.has(`${tmdbId}:${country}`)) continue;
        const regionData = results[country];
        if (!regionData) continue;

        providerRows.push({
          tmdb_id: tmdbId,
          type,
          country,
          providers: regionData,
          cached_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error(`[backfill-providers] Provider fetch failed for ${tmdbId}: ${e instanceof Error ? e.message : "Error"}`);
      errors++;
    }

    await sleep(DELAY_MS);
  }

  // Upsert provider rows in chunks of 50
  for (let i = 0; i < providerRows.length; i += CHUNK) {
    const chunk = providerRows.slice(i, i + CHUNK);
    const { error } = await admin
      .from("watch_providers_cache")
      .upsert(chunk, { onConflict: "tmdb_id,type,country" });

    if (error) {
      console.error(`[backfill-providers] providers chunk error: ${error.message}`);
      errors++;
    } else {
      providersCached += chunk.length;
    }
  }

  return NextResponse.json({
    status: "completed",
    type,
    pages: `${fromPage}-${toPage}`,
    titles_from_tmdb: allTitles.length,
    titles_upserted: titlesUpserted,
    titles_needing_providers: titlesToProcess.length,
    providers_cached: providersCached,
    errors,
  });
}
