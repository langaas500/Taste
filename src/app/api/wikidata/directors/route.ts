import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { fetchDirectorData, SEED_DIRECTORS } from "@/lib/wikidata";
import { env } from "@/lib/env";

const ADMIN_EMAILS = env.ADMIN_EMAILS;
const DELAY_MS = 600;

/**
 * POST /api/wikidata/directors
 *
 * Admin-only: enrich a single director or seed all 100.
 * Body: { directorName: string } or { seed: true }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // Resolve email for admin check
    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

    // Seed mode: enrich all SEED_DIRECTORS
    if (body.seed === true) {
      // Check which are already enriched
      const { data: existing } = await admin
        .from("director_graph")
        .select("director_name");
      const existingNames = new Set((existing ?? []).map((r: { director_name: string }) => r.director_name));
      const toSeed = SEED_DIRECTORS.filter((n) => !existingNames.has(n));

      // Use streaming response for long-running seed
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          let enriched = 0;
          let failed = 0;

          for (const name of toSeed) {
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
                controller.enqueue(encoder.encode(`✓ ${name} (${data.movements.join(", ") || "no movement"}, ${data.nationality || "?"}, ${data.awards.length} awards)\n`));
              } else {
                failed++;
                controller.enqueue(encoder.encode(`✗ ${name} — not found\n`));
              }
            } catch (e) {
              failed++;
              controller.enqueue(encoder.encode(`✗ ${name} — error: ${e instanceof Error ? e.message : "unknown"}\n`));
            }
            await new Promise((r) => setTimeout(r, DELAY_MS));
          }

          controller.enqueue(encoder.encode(`\n--- Done: ${enriched} enriched, ${failed} failed, ${existingNames.size} already existed ---\n`));
          controller.close();
        },
      });

      return new NextResponse(readable, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
      });
    }

    // Single director mode
    const { directorName } = body;
    if (!directorName || typeof directorName !== "string") {
      return NextResponse.json({ error: "directorName required" }, { status: 400 });
    }

    const data = await fetchDirectorData(directorName);
    if (!data) {
      return NextResponse.json({ error: "Director not found on Wikidata", directorName }, { status: 404 });
    }

    await admin.from("director_graph").upsert({
      director_name: directorName,
      wikidata_id: data.wikidataId,
      movements: data.movements.length > 0 ? data.movements : null,
      awards: data.awards.length > 0 ? data.awards : null,
      nationality: data.nationality,
      influenced_by: data.influencedBy.length > 0 ? data.influencedBy : null,
      active_decades: data.activeDecades,
      enriched_at: new Date().toISOString(),
    }, { onConflict: "wikidata_id" });

    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
