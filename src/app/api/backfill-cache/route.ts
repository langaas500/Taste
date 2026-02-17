import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDetails, tmdbExternalIds, parseTitleFromTMDB } from "@/lib/tmdb";

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 500;
const CHUNK_SIZE = 25;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    // Auth: keep exactly as-is
    const auth = req.headers.get("authorization");
    const secret = process.env.BACKFILL_SECRET;
    if (!secret || !auth || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination params from URL search params
    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get("limit") ?? "120", 10);
    const limit = Math.min(200, Math.max(1, isNaN(rawLimit) ? 120 : rawLimit));
    const rawCursor = parseInt(url.searchParams.get("cursor") ?? "0", 10);
    const cursor = Math.max(0, isNaN(rawCursor) ? 0 : rawCursor);
    const typeParam = url.searchParams.get("type") ?? "all";
    const typeFilter = typeParam === "movie" || typeParam === "tv" ? typeParam : null;

    const admin = createSupabaseAdmin();

    // 1. Page user_titles — bounded, no full-table scan
    let query = admin
      .from("user_titles")
      .select("tmdb_id, type")
      .range(cursor, cursor + limit - 1);
    if (typeFilter) {
      query = query.eq("type", typeFilter);
    }
    const { data: pageRows, error: utErr } = await query;

    if (utErr) {
      return NextResponse.json({ error: utErr.message }, { status: 500 });
    }

    if (!pageRows || pageRows.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, scanned: 0, missing_before: 0, next_cursor: null });
    }

    // 2. Deduplicate in memory by composite key
    const uniqueMap = new Map<string, { tmdb_id: number; type: "movie" | "tv" }>();
    for (const row of pageRows) {
      const key = `${row.tmdb_id}:${row.type}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { tmdb_id: row.tmdb_id, type: row.type as "movie" | "tv" });
      }
    }
    const candidates = Array.from(uniqueMap.values());
    const scanned = candidates.length;

    // 3. Batch check cache only for this page's tmdb_ids
    const uniqueIds = [...new Set(candidates.map((c) => c.tmdb_id))];
    const { data: cachedRows } = await admin
      .from("titles_cache")
      .select("tmdb_id, type, poster_path")
      .in("tmdb_id", uniqueIds);

    const cachedSet = new Set<string>();
    for (const c of cachedRows ?? []) {
      if (c.poster_path !== null) {
        cachedSet.add(`${c.tmdb_id}:${c.type}`);
      }
    }

    const missing = candidates.filter((t) => !cachedSet.has(`${t.tmdb_id}:${t.type}`));
    const missing_before = missing.length;
    const next_cursor = pageRows.length < limit ? null : cursor + limit;

    if (missing.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, scanned, missing_before: 0, next_cursor });
    }

    // 4. Fetch TMDB details in batches of 3 — collect rows, NO per-title DB writes
    const rowsToUpsert: Record<string, unknown>[] = [];
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
          return {
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
          };
        })
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          rowsToUpsert.push(result.value);
        } else if (errors.length < 20) {
          errors.push({
            tmdb_id: batch[j].tmdb_id,
            type: batch[j].type,
            error: result.reason?.message ?? String(result.reason),
          });
        }
      }

      if (i + BATCH_SIZE < missing.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // 5. Bulk upsert titles_cache in chunks of 25
    let updated = 0;
    for (let i = 0; i < rowsToUpsert.length; i += CHUNK_SIZE) {
      const { error: upsertErr } = await admin
        .from("titles_cache")
        .upsert(rowsToUpsert.slice(i, i + CHUNK_SIZE), { onConflict: "tmdb_id,type" });
      if (!upsertErr) {
        updated += Math.min(CHUNK_SIZE, rowsToUpsert.length - i);
      }
    }

    return NextResponse.json({
      ok: true,
      updated,
      scanned,
      missing_before,
      next_cursor,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
