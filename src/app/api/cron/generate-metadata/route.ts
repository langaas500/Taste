import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { safeParseJson } from "@/lib/ai";
import { env } from "@/lib/env";

/**
 * POST /api/cron/generate-metadata
 *
 * Cron job: generates curator_hook, curator_body, curator_verdict,
 * and mood_tags for titles that have slugs but no curator content.
 * Processes 20 titles per invocation.
 *
 * Protected by BACKFILL_SECRET. Uses backfill_status as a lock to
 * prevent duplicate Anthropic API calls if Vercel fires cron twice.
 */

const BATCH_SIZE = 20;

const MOOD_TAGS_WHITELIST = [
  // Stemning og tid
  "Perfekt for fredagskveld", "Se alene i mørket", "Filmkveld for to",
  "Krever full oppmerksomhet", "Lett og morsom", "Tung og tankevekkende",
  "Bra for hele familien", "Sen kveld alene", "Imponér gjestene",
  // Sesong
  "Påskekrim", "Hyttekveld", "Sommerkveld", "Reisefilm",
  "Halloweenkveld", "Grøssere", "Perfekt julefilm", "Familiekos",
  "Julekalender", "Barnefilm",
  // SEO og nisje
  "Basert på en sann historie", "Nordic Noir", "Kort og konsist",
  "Visuelt mesterverk", "Nostalgisk perle", "Skjult skatt",
] as const;

const SYSTEM_PROMPT = `You are a film expert writing for a Nordic streaming discovery app called Logflix.
Be warm, specific, and cinematic. Never use generic phrases like "must-see" or "masterpiece".
Write in Norwegian (Bokmål). Your tone is confident but conversational — like a friend who really knows film.
Return ONLY valid JSON, no markdown fences.`;

function buildUserPrompt(
  title: string,
  year: number | null,
  type: "movie" | "tv",
  genres: string[],
  overview: string | null,
): string {
  const typeLabel = type === "movie" ? "filmen" : "serien";
  const genreStr = genres.length > 0 ? genres.join(", ") : "ukjent sjanger";
  const overviewStr = overview ? overview.slice(0, 300) : "Ingen beskrivelse tilgjengelig.";

  return `For ${typeLabel} "${title}" (${year || "ukjent år"}, sjangre: ${genreStr}):

Kort beskrivelse: ${overviewStr}

Skriv følgende på norsk:
1. "curator_hook" — Én fengende setning (maks 20 ord) som fanger essensen. Ikke bruk tittelens navn.
2. "curator_body" — 2-3 setninger som beskriver stemning, tematikk og hvem den passer for. Vær spesifikk, ikke generisk.
3. "curator_verdict" — Én kort dom (maks 15 ord). Eksempel: "Perfekt for deg som savner gode thrillere fra 90-tallet."
4. "mood_tags" — Velg 3-5 tags fra DENNE listen (ikke lag egne):
   ${JSON.stringify(MOOD_TAGS_WHITELIST)}

Respond with a JSON object:
{
  "curator_hook": "...",
  "curator_body": "...",
  "curator_verdict": "...",
  "mood_tags": ["...", "...", "..."]
}`;
}

interface CuratorResult {
  curator_hook: string;
  curator_body: string;
  curator_verdict: string;
  mood_tags: string[];
}

function validateResult(raw: CuratorResult): CuratorResult | null {
  if (
    typeof raw.curator_hook !== "string" || !raw.curator_hook ||
    typeof raw.curator_body !== "string" || !raw.curator_body ||
    typeof raw.curator_verdict !== "string" || !raw.curator_verdict ||
    !Array.isArray(raw.mood_tags) || raw.mood_tags.length === 0
  ) {
    return null;
  }

  // Filter mood_tags to only whitelisted values
  const validTags = raw.mood_tags.filter((t) =>
    (MOOD_TAGS_WHITELIST as readonly string[]).includes(t),
  );

  if (validTags.length === 0) return null;

  return {
    curator_hook: raw.curator_hook.slice(0, 200),
    curator_body: raw.curator_body.slice(0, 1000),
    curator_verdict: raw.curator_verdict.slice(0, 200),
    mood_tags: validTags.slice(0, 5),
  };
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.content[0]?.text || "";
}

export async function POST(req: NextRequest) {
  // Auth
  const secret = req.headers.get("x-backfill-secret");
  if (!secret || secret !== env.BACKFILL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const batchSize = Math.min(Math.max(parseInt(sp.get("limit") || String(BATCH_SIZE), 10) || BATCH_SIZE, 1), 50);

  const admin = createSupabaseAdmin();

  // Lock check: prevent duplicate runs
  const { count } = await admin
    .from("titles_cache")
    .select("*", { count: "exact", head: true })
    .eq("backfill_status", "processing");

  if (count && count > 0) {
    return NextResponse.json(
      { status: "locked", message: "Already running", processing_count: count },
      { status: 409 },
    );
  }

  // Fetch titles: have slug but no curator content, status pending or failed
  const { data: titles, error: fetchErr } = await admin
    .from("titles_cache")
    .select("tmdb_id, type, title, year, genres, overview, backfill_status")
    .not("slug", "is", null)
    .is("curator_hook", null)
    .in("backfill_status", ["pending", "failed"])
    .order("popularity", { ascending: false })
    .limit(batchSize);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!titles || titles.length === 0) {
    return NextResponse.json({ status: "done", message: "No titles need processing", processed: 0 });
  }

  // Mark batch as processing (lock)
  const batchIds = titles.map((t: { tmdb_id: number; type: string }) => `${t.tmdb_id}:${t.type}`);
  for (const t of titles) {
    await admin
      .from("titles_cache")
      .update({ backfill_status: "processing" })
      .eq("tmdb_id", t.tmdb_id)
      .eq("type", t.type);
  }

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  // Process sequentially to respect Anthropic rate limits
  for (const t of titles) {
    const genreNames = Array.isArray(t.genres)
      ? t.genres
          .filter((g: unknown): g is { name: string } => typeof g === "object" && g !== null && "name" in g)
          .map((g: { name: string }) => g.name)
      : [];

    try {
      const response = await callAI(
        SYSTEM_PROMPT,
        buildUserPrompt(t.title, t.year, t.type, genreNames, t.overview),
      );

      const parsed = safeParseJson<CuratorResult>(response);
      if (!parsed.ok) {
        throw new Error(`Invalid JSON from AI: ${parsed.error}`);
      }

      const validated = validateResult(parsed.data);
      if (!validated) {
        throw new Error("AI output failed validation");
      }

      const { error: updateErr } = await admin
        .from("titles_cache")
        .update({
          curator_hook: validated.curator_hook,
          curator_body: validated.curator_body,
          curator_verdict: validated.curator_verdict,
          mood_tags: validated.mood_tags,
          backfill_status: "completed",
        })
        .eq("tmdb_id", t.tmdb_id)
        .eq("type", t.type);

      if (updateErr) throw new Error(updateErr.message);
      processed++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[generate-metadata] Failed ${t.tmdb_id}:${t.type} "${t.title}": ${msg}`);
      errors.push(`${t.title}: ${msg}`);
      failed++;

      // Mark as failed so it can be retried
      await admin
        .from("titles_cache")
        .update({ backfill_status: "failed" })
        .eq("tmdb_id", t.tmdb_id)
        .eq("type", t.type);
    }
  }

  return NextResponse.json({
    status: "completed",
    processed,
    failed,
    batch_size: titles.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
