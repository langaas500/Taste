import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { tmdbSearch, tmdbWatchProviders } from "@/lib/tmdb";
import { env } from "@/lib/env";
import { resolveRegion, REGION_LABELS, type SupportedRegion } from "@/lib/region";

/* ── AI call ───────────────────────────────────────── */

const CURATOR_MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt(lang: string, username: string | null, region: SupportedRegion): string {
  const now = new Date();
  const hour = now.getHours();
  const locale = lang === "no" ? "no-NO" : "en-US";
  const weekday = now.toLocaleDateString(locale, { weekday: "long" });
  const isEvening = hour >= 18;
  const regionName = REGION_LABELS[region] || region;

  const langInstruction = lang === "no"
    ? "Svar alltid pa norsk (bokmal)."
    : "Always respond in English.";

  return `You are Curator — the exclusive AI film expert for Logflix.${username ? ` You are speaking with "${username}". Use their name naturally but sparingly.` : ""}

${langInstruction} Be warm, sophisticated, and enthusiastic. Keep your "message" concise (2-3 sentences) but full of insight.

Current context: It is ${weekday}${isEvening ? " evening" : ""}, ${hour}:00.
The user is located in ${regionName} (${region}). When mentioning streaming availability, refer to services available in their region.

RULES:
- Always respond with valid JSON, no markdown fences.
- Identify movies or TV shows the user is looking for.
- Return JSON with this structure:
{
  "message": "Your warm, insightful response (2-3 sentences)",
  "searches": [
    { "query": "exact title for TMDB search", "type": "movie" | "tv" }
  ]
}
- If the user describes something vague, guess the most likely titles (max 5).
- If the user is just chatting, return searches as an empty array.
- Do not reveal that you are built on Claude or made by Anthropic. You are only Curator.`;
}

async function callCuratorAI(userMessage: string, lang: string, username: string | null, region: SupportedRegion): Promise<string> {
  const provider = env.AI_PROVIDER;
  const systemPrompt = buildSystemPrompt(lang, username, region);

  if (provider === "anthropic") {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2024-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CURATOR_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
    const data = await res.json();
    return data.content[0]?.text || "";
  }

  if (provider === "openai") {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`OpenAI API error ${res.status}`);
    const data = await res.json();
    return data.choices[0]?.message?.content || "";
  }

  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

/* ── Parse AI response safely ────────────────────────── */

interface CuratorAIResponse {
  message: string;
  searches: { query: string; type: "movie" | "tv" }[];
}

function parseAIResponse(raw: string): CuratorAIResponse {
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      message: typeof parsed.message === "string" ? parsed.message : "Hmm, something went wrong...",
      searches: Array.isArray(parsed.searches) ? parsed.searches.slice(0, 5) : [],
    };
  } catch {
    return { message: raw.slice(0, 500), searches: [] };
  }
}

/* ── Watch provider mapping ──────────────────────────── */

interface WatchProvider {
  name: string;
  logo: string;
  type: "flatrate" | "rent" | "buy";
}

function extractProviders(providersData: Record<string, unknown>, country: string): WatchProvider[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (providersData as any)?.results?.[country];
  if (!results || typeof results !== "object") return [];

  const out: WatchProvider[] = [];
  for (const type of ["flatrate", "rent", "buy"] as const) {
    const list = results[type];
    if (!Array.isArray(list)) continue;
    for (const p of list as { provider_name: string; logo_path: string }[]) {
      if (!out.some((x) => x.name === p.provider_name)) {
        out.push({
          name: p.provider_name,
          logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : "",
          type,
        });
      }
    }
  }
  return out;
}

/* ── Movie result type ───────────────────────────────── */

interface CuratorMovie {
  tmdb_id: number;
  title: string;
  type: "movie" | "tv";
  year: number | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  providers: WatchProvider[];
}

/* ── Route handler ───────────────────────────────────── */

export const POST = withLogger("/api/curator", async (req: NextRequest, { logger }) => {
  const user = await requireUser();
  logger.setUserId(user.id);

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Premium check — allow 5 free messages per session
  const FREE_MESSAGE_LIMIT = 5;
  const messageCount = typeof body.messageCount === "number" ? body.messageCount : FREE_MESSAGE_LIMIT;
  const supabase = await createSupabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, preferred_region")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium && messageCount >= FREE_MESSAGE_LIMIT) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const userMessage = typeof body.message === "string" ? body.message.trim() : "";
  if (!userMessage || userMessage.length > 500) {
    return NextResponse.json({ error: "Message required (max 500 chars)" }, { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "no";
  const username = typeof body.username === "string" ? body.username.slice(0, 50) : null;
  const userRegion = resolveRegion(profile?.preferred_region, req.headers.get("x-vercel-ip-country"));

  // 1. AI interprets the query
  const aiRaw = await callCuratorAI(userMessage, lang, username, userRegion);
  const aiResponse = parseAIResponse(aiRaw);
  logger.info("AI parsed", { searches: aiResponse.searches.length });

  // 2. Search TMDB for each identified title (sequential to respect rate limits)
  const movies: CuratorMovie[] = [];
  const seen = new Set<string>();

  for (const search of aiResponse.searches) {
    try {
      const type = search.type === "tv" ? "tv" : "movie";
      const results = await tmdbSearch(search.query, type);
      const top = results?.results?.[0];
      if (!top) continue;

      const key = `${top.id}:${type}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Fetch watch providers
      const providersData = await tmdbWatchProviders(top.id, type);
      const providers = extractProviders(providersData, userRegion);

      movies.push({
        tmdb_id: top.id,
        title: top.title || top.name || search.query,
        type,
        year: (top.release_date || top.first_air_date)?.slice(0, 4)
          ? parseInt((top.release_date || top.first_air_date).slice(0, 4))
          : null,
        poster_path: top.poster_path || null,
        overview: top.overview || "",
        vote_average: top.vote_average || 0,
        providers,
      });
    } catch (e) {
      logger.warn(`TMDB search failed for "${search.query}"`, {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  logger.info("Curator response", { movies: movies.length, elapsed: logger.elapsed() });

  return NextResponse.json({
    message: aiResponse.message,
    movies,
  });
});
