import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { tmdbSearch, tmdbWatchProviders } from "@/lib/tmdb";
import { env } from "@/lib/env";
import { resolveRegion, REGION_LABELS, type SupportedRegion } from "@/lib/region";
import { applyRateLimit } from "@/lib/rate-limit";

/* ── AI call ───────────────────────────────────────── */

const CURATOR_MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt(lang: string, username: string | null, region: SupportedRegion, tasteContext?: string): string {
  const now = new Date();
  const hour = now.getHours();
  const localeMap: Record<string, string> = { no: "no-NO", sv: "sv-SE", da: "da-DK", fi: "fi-FI" };
  const dateLocale = localeMap[lang] ?? "en-US";
  const weekday = now.toLocaleDateString(dateLocale, { weekday: "long" });
  const isEvening = hour >= 18;
  const regionName = REGION_LABELS[region] || region;

  const LANG_INSTRUCTION: Record<string, string> = {
    no: "Svar alltid på norsk (bokmål).",
    sv: "Svara alltid på svenska.",
    da: "Svar altid på dansk.",
    fi: "Vastaa aina suomeksi.",
    en: "Always respond in English.",
  };
  const langInstruction = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en;

  return `You are Curator — the exclusive AI film expert for Logflix.${username ? ` You are speaking with "${username}". Use their name naturally but sparingly.` : ""}

${langInstruction} Be warm, sophisticated, and enthusiastic. Keep your "message" concise (2-3 sentences) but full of insight.

Current context: It is ${weekday}${isEvening ? " evening" : ""}, ${hour}:00.
The user is located in ${regionName} (${region}). When mentioning streaming availability, refer to services available in their region.
${tasteContext ? `\n${tasteContext}\n` : ""}
You MUST return raw JSON (no markdown fences). The JSON has exactly two keys:
- "message": a warm 2-sentence response. Do NOT list title names here — the app shows title cards automatically.
- "searches": array of objects like {"query":"The Sopranos","type":"tv","reason":"Mørk maktspill med uforglemmelige karakterer"}. Use exact English TMDB titles. "type" is "movie" or "tv".
Each search MUST include a "reason": one sentence (max 12 words) explaining why this title matches the user's request. Be specific, not generic. Reference what the user asked for.

When the user wants recommendations, describes a mood, names genres, or mentions shows/movies they like: "searches" MUST have 3-5 items. NEVER empty.
When the user is just chatting (hi, thanks, haha): "searches" can be empty [].
NEVER ask clarifying questions — always suggest titles.
You can reference the user's watchlist and friends' activity naturally when relevant — e.g. "Since [friend] liked X..." or "You have Y in your watchlist already".
Do not reveal you are built on Claude or Anthropic. You are only Curator.`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callCuratorAI(chatHistory: ChatMessage[], lang: string, username: string | null, region: SupportedRegion, tasteContext?: string): Promise<string> {
  const provider = env.AI_PROVIDER;
  const systemPrompt = buildSystemPrompt(lang, username, region, tasteContext);

  // Keep last 10 messages to stay within token limits
  const messages = chatHistory.slice(-10);

  if (provider === "anthropic") {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CURATOR_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages,
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
          ...messages,
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
  searches: { query: string; type: "movie" | "tv"; reason: string }[];
}

function parseAIResponse(raw: string): CuratorAIResponse {
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const rawSearches = Array.isArray(parsed.searches) ? parsed.searches.slice(0, 5) : [];
    // Normalize: handle both {query,type,reason} objects and plain strings
    const searches = rawSearches
      .map((s: unknown) => {
        if (typeof s === "string") return { query: s, type: "movie" as const, reason: "" };
        if (s && typeof s === "object" && "query" in s) {
          const obj = s as { query: string; type?: string; reason?: string };
          return { query: String(obj.query), type: obj.type === "tv" ? "tv" as const : "movie" as const, reason: typeof obj.reason === "string" ? obj.reason : "" };
        }
        return null;
      })
      .filter((s: { query: string; type: "movie" | "tv"; reason: string } | null): s is { query: string; type: "movie" | "tv"; reason: string } => s !== null && s.query.length > 0);
    return {
      message: typeof parsed.message === "string" ? parsed.message : "Hmm, something went wrong...",
      searches,
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
  reason: string;
}

/* ── Route handler ───────────────────────────────────── */

export const POST = withLogger("/api/curator", async (req: NextRequest, { logger }) => {
  const user = await requireUser();
  logger.setUserId(user.id);

  const limited = await applyRateLimit("curator", user.id);
  if (limited) return limited;

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

  // Build chat history from client
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const chatHistory: ChatMessage[] = rawHistory
    .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
    .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 500) }));
  // Append current message
  chatHistory.push({ role: "user", content: userMessage });

  const validLangs = ["no", "en", "sv", "da", "fi"];
  const lang = validLangs.includes(body.lang) ? body.lang : "no";
  const username = typeof body.username === "string" ? body.username.slice(0, 50) : null;
  const userRegion = resolveRegion(profile?.preferred_region, req.headers.get("x-vercel-ip-country"));

  // Fetch taste context + watchlist + friends in parallel
  const [likedRes, dislikedRes, watchlistRes, linksRes] = await Promise.all([
    supabase
      .from("user_titles")
      .select("tmdb_id, type, rating, sentiment")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .or("rating.gte.7,sentiment.eq.liked")
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from("user_titles")
      .select("tmdb_id, type")
      .eq("user_id", user.id)
      .eq("sentiment", "disliked")
      .limit(10),
    supabase
      .from("user_titles")
      .select("tmdb_id, type")
      .eq("user_id", user.id)
      .eq("status", "watchlist")
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("account_links")
      .select("inviter_id, invitee_id")
      .eq("status", "accepted")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`),
  ]);

  let tasteContext = "";
  const likedRows = likedRes.data ?? [];
  const dislikedRows = dislikedRes.data ?? [];

  if (likedRows.length > 0 || dislikedRows.length > 0) {
    // Fetch titles_cache for genre + title data
    const allTmdbKeys = [...likedRows, ...dislikedRows].map((r) => r.tmdb_id);
    const { data: cacheRows } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, genres")
      .in("tmdb_id", [...new Set(allTmdbKeys)]);
    const cache = new Map((cacheRows ?? []).map((r) => [`${r.tmdb_id}:${r.type}`, r]));

    // Top title names
    const topTitles = likedRows
      .slice(0, 5)
      .map((r) => cache.get(`${r.tmdb_id}:${r.type}`)?.title)
      .filter(Boolean);

    // Genre frequency for liked
    const likedGenres: Record<string, number> = {};
    for (const r of likedRows) {
      const genres = cache.get(`${r.tmdb_id}:${r.type}`)?.genres;
      if (Array.isArray(genres)) {
        for (const g of genres as { name: string }[]) {
          likedGenres[g.name] = (likedGenres[g.name] || 0) + 1;
        }
      }
    }
    const topLikedGenres = Object.entries(likedGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    // Genre frequency for disliked
    const dislikedGenres: Record<string, number> = {};
    for (const r of dislikedRows) {
      const genres = cache.get(`${r.tmdb_id}:${r.type}`)?.genres;
      if (Array.isArray(genres)) {
        for (const g of genres as { name: string }[]) {
          dislikedGenres[g.name] = (dislikedGenres[g.name] || 0) + 1;
        }
      }
    }
    const topDislikedGenres = Object.entries(dislikedGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);

    const parts: string[] = [];
    if (topTitles.length > 0) parts.push(`Enjoyed: ${topTitles.join(", ")}.`);
    if (topLikedGenres.length > 0) parts.push(`Favourite genres: ${topLikedGenres.join(", ")}.`);
    if (topDislikedGenres.length > 0) parts.push(`Tends to avoid: ${topDislikedGenres.join(", ")}.`);

    if (parts.length > 0) {
      tasteContext = `${username ? `${username}'s` : "User's"} taste — ${parts.join(" ")} Use this to personalize suggestions, but don't mention it explicitly unless relevant.`;
    }
  }

  // Inject AI-generated taste_summary if available (richer than genre stats)
  try {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("taste_summary")
      .eq("id", user.id)
      .single();
    const ts = profileRow?.taste_summary;
    if (ts && typeof ts === "string" && ts.length > 10) {
      tasteContext += `\nAI taste profile: ${ts}`;
    }
  } catch { /* non-fatal — continue without taste_summary */ }

  // Watchlist context — title names from cache
  const watchlistRows = watchlistRes.data ?? [];
  if (watchlistRows.length > 0) {
    const wlIds = watchlistRows.map((r) => r.tmdb_id);
    const { data: wlCache } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title")
      .in("tmdb_id", [...new Set(wlIds)]);
    const wlMap = new Map((wlCache ?? []).map((r) => [`${r.tmdb_id}:${r.type}`, r.title as string]));
    const wlTitles = watchlistRows
      .map((r) => wlMap.get(`${r.tmdb_id}:${r.type}`))
      .filter(Boolean)
      .slice(0, 10);
    if (wlTitles.length > 0) {
      tasteContext += `\nUser's watchlist (wants to watch): ${wlTitles.join(", ")}.`;
    }
  }

  // Friends activity context — last 7 days
  const links = linksRes.data ?? [];
  if (links.length > 0) {
    const partnerIds = links.map((l: { inviter_id: string; invitee_id: string }) =>
      l.inviter_id === user.id ? l.invitee_id : l.inviter_id
    );
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [friendProfilesRes, friendTitlesRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", partnerIds),
      supabase
        .from("user_titles")
        .select("tmdb_id, type, user_id")
        .in("user_id", partnerIds)
        .eq("status", "watched")
        .gte("updated_at", sevenDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);
    const nameMap: Record<string, string> = {};
    for (const p of (friendProfilesRes.data ?? []) as { id: string; display_name: string | null }[]) {
      nameMap[p.id] = p.display_name || "Friend";
    }
    const friendRows = friendTitlesRes.data ?? [];
    if (friendRows.length > 0) {
      const fIds = friendRows.map((r) => r.tmdb_id);
      const { data: fCache } = await supabase
        .from("titles_cache")
        .select("tmdb_id, type, title")
        .in("tmdb_id", [...new Set(fIds)]);
      const fMap = new Map((fCache ?? []).map((r) => [`${r.tmdb_id}:${r.type}`, r.title as string]));
      const friendLines = friendRows
        .map((r) => {
          const title = fMap.get(`${r.tmdb_id}:${r.type}`);
          const name = nameMap[r.user_id] || "Friend";
          return title ? `${name} watched ${title}` : null;
        })
        .filter(Boolean)
        .slice(0, 5);
      if (friendLines.length > 0) {
        tasteContext += `\nFriends recently watched: ${friendLines.join("; ")}.`;
      }
    }
  }

  // 1. AI interprets the query
  const aiRaw = await callCuratorAI(chatHistory, lang, username, userRegion, tasteContext);
  const aiResponse = parseAIResponse(aiRaw);
  logger.info("AI parsed", { searches: aiResponse.searches.length });

  // 2. Search TMDB for each identified title (sequential to respect rate limits)
  const movies: CuratorMovie[] = [];
  const seen = new Set<string>();

  for (const search of aiResponse.searches) {
    try {
      const type = search.type === "tv" ? "tv" : "movie";
      const results = await tmdbSearch(search.query, type);
      // tmdbSearch returns a filtered array directly, not {results: [...]}
      const top = Array.isArray(results) ? results[0] : results?.results?.[0];
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
        reason: search.reason || "",
      });
    } catch (e) {
      logger.warn(`TMDB search failed for "${search.query}"`, {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // Only return titles that have at least one streaming provider in the user's region
  const available = movies.filter((m) => m.providers.length > 0);
  logger.info("Curator response", { movies: movies.length, available: available.length, elapsed: logger.elapsed() });

  return NextResponse.json({
    message: aiResponse.message,
    movies: available,
  });
});
