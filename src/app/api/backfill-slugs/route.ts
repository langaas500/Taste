import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { buildSlug } from "@/lib/slug";
import { env } from "@/lib/env";

/**
 * POST /api/backfill-slugs
 *
 * Generates slugs for top titles in titles_cache that have provider data
 * for NO, DK, FI, or SE. Protected by BACKFILL_SECRET.
 *
 * Query params:
 *   limit  — max titles to process per run (default 100, max 500)
 *   dryrun — if "true", return what would be updated without writing
 */

const NORDIC_COUNTRIES = ["NO", "DK", "FI", "SE"];

export async function POST(req: NextRequest) {
  // Auth: require BACKFILL_SECRET
  const secret = req.headers.get("x-backfill-secret");
  if (!secret || secret !== env.BACKFILL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "100", 10) || 100, 1), 500);
  const dryrun = sp.get("dryrun") === "true";

  const admin = createSupabaseAdmin();

  // 1. Find tmdb_ids that have provider data in any Nordic country
  const { data: providerRows, error: provErr } = await admin
    .from("watch_providers_cache")
    .select("tmdb_id, type")
    .in("country", NORDIC_COUNTRIES);

  if (provErr) {
    return NextResponse.json({ error: provErr.message }, { status: 500 });
  }

  // Dedupe provider tmdb_id:type pairs
  const providerKeys = new Set(
    (providerRows || []).map((r: { tmdb_id: number; type: string }) => `${r.tmdb_id}:${r.type}`),
  );

  if (providerKeys.size === 0) {
    return NextResponse.json({ status: "no_providers", message: "No Nordic provider data found" });
  }

  // 2. Find titles without slugs, sorted by popularity, that have Nordic providers
  const { data: titles, error: titlesErr } = await admin
    .from("titles_cache")
    .select("tmdb_id, type, title, popularity")
    .is("slug", null)
    .order("popularity", { ascending: false })
    .limit(limit * 2); // Overfetch since we filter by provider presence

  if (titlesErr) {
    return NextResponse.json({ error: titlesErr.message }, { status: 500 });
  }

  // 3. Filter to only titles with Nordic provider data
  const eligible = (titles || [])
    .filter((t: { tmdb_id: number; type: string }) => providerKeys.has(`${t.tmdb_id}:${t.type}`))
    .slice(0, limit);

  if (eligible.length === 0) {
    return NextResponse.json({ status: "done", message: "All eligible titles already have slugs", processed: 0 });
  }

  if (dryrun) {
    return NextResponse.json({
      status: "dryrun",
      would_process: eligible.length,
      sample: eligible.slice(0, 10).map((t: { tmdb_id: number; type: string; title: string }) => ({
        tmdb_id: t.tmdb_id,
        type: t.type,
        title: t.title,
        slug: buildSlug(t.title, t.tmdb_id),
      })),
    });
  }

  // 4. Generate slugs and bulk update in chunks of 50
  const CHUNK = 50;
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < eligible.length; i += CHUNK) {
    const chunk = eligible.slice(i, i + CHUNK);

    const updates = chunk.map((t: { tmdb_id: number; type: string; title: string }) => ({
      tmdb_id: t.tmdb_id,
      type: t.type,
      slug: buildSlug(t.title, t.tmdb_id),
    }));

    // Upsert each row individually to handle potential slug conflicts
    for (const upd of updates) {
      const { error } = await admin
        .from("titles_cache")
        .update({ slug: upd.slug })
        .eq("tmdb_id", upd.tmdb_id)
        .eq("type", upd.type);

      if (error) {
        console.error(`[backfill-slugs] Failed ${upd.tmdb_id}:${upd.type}: ${error.message}`);
        errors++;
      } else {
        processed++;
      }
    }
  }

  return NextResponse.json({
    status: "completed",
    processed,
    errors,
    total_eligible: eligible.length,
  });
}
