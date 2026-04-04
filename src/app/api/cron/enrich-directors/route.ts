import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { fetchDirectorData } from "@/lib/wikidata";

/**
 * GET /api/cron/enrich-directors
 *
 * Daily cron (03:00 UTC): enriches up to 20 directors from titles_cache
 * that aren't yet in director_graph.
 *
 * Auth: CRON_SECRET header or Vercel cron auth.
 */

const BATCH_SIZE = 20;
const DELAY_MS = 500;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Find directors from titles_cache that aren't in director_graph yet
  // titles_cache stores crew in genres field or tmdb_payload
  const { data: titles } = await admin
    .from("titles_cache")
    .select("tmdb_id, tmdb_payload")
    .not("tmdb_payload", "is", null)
    .order("vote_average", { ascending: false })
    .limit(200);

  if (!titles || titles.length === 0) {
    return NextResponse.json({ enriched: 0, reason: "no_titles" });
  }

  // Extract unique director names from tmdb_payload.credits.crew
  const directorNames = new Set<string>();
  for (const t of titles) {
    const payload = t.tmdb_payload as Record<string, unknown> | null;
    if (!payload) continue;
    const credits = payload.credits as { crew?: { name: string; job: string }[] } | undefined;
    if (!credits?.crew) continue;
    for (const member of credits.crew) {
      if (member.job === "Director" && member.name) {
        directorNames.add(member.name);
      }
    }
  }

  if (directorNames.size === 0) {
    return NextResponse.json({ enriched: 0, reason: "no_directors_found" });
  }

  // Check which are already in director_graph
  const { data: existing } = await admin
    .from("director_graph")
    .select("director_name")
    .in("director_name", [...directorNames].slice(0, 100));

  const existingNames = new Set((existing ?? []).map((r: { director_name: string }) => r.director_name));
  const toEnrich = [...directorNames].filter((n) => !existingNames.has(n)).slice(0, BATCH_SIZE);

  let enriched = 0;
  let failed = 0;

  for (const name of toEnrich) {
    try {
      const data = await fetchDirectorData(name);
      if (data) {
        await admin.from("director_graph").upsert({
          director_name: name,
          wikidata_id: data.wikidataId,
          movements: data.movements.length > 0 ? data.movements : null,
          awards: data.awards.length > 0 ? data.awards : null,
          nationality: data.nationality,
          influenced_by: data.influencedBy.length > 0 ? data.influencedBy : null,
          active_decades: data.activeDecades,
          enriched_at: new Date().toISOString(),
        }, { onConflict: "wikidata_id" });
        enriched++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  return NextResponse.json({ enriched, failed, candidates: toEnrich.length, total_directors: directorNames.size });
}
