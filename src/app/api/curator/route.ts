import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { tmdbSearch, tmdbWatchProviders } from "@/lib/tmdb";
import { env } from "@/lib/env";
import { resolveRegion, REGION_LABELS, type SupportedRegion } from "@/lib/region";
import { applyRateLimit } from "@/lib/rate-limit";

/* ── AI call ───────────────────────────────────────── */

const CURATOR_MODEL_FREE = "claude-haiku-4-5-20251001";
const CURATOR_MODEL_PREMIUM = "claude-sonnet-4-6";

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
Each search MUST include a "reason": a personalized 1-2 sentence reason.
Rules for "reason":
- Reference 1-2 of the user's actual liked titles by name when a clear connection exists (tone, theme, director style, pacing).
- Write in second person: "Du likte X — denne har samme..." (or equivalent in current language).
- If no clear connection to liked titles, reference their taste profile or what they asked for.
- Never use generic filler like "gripping", "must-watch", or "a great film".
- Max 2 sentences.

When the user wants recommendations, describes a mood, names genres, or mentions shows/movies they like: "searches" MUST have 3-5 items. NEVER empty.
When the user is just chatting (hi, thanks, haha): "searches" can be empty [].
NEVER ask clarifying questions — always suggest titles.
You can reference the user's watchlist and friends' activity naturally when relevant — e.g. "Since [friend] liked X..." or "You have Y in your watchlist already".
Do not reveal you are built on Claude or Anthropic. You are only Curator.`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callCuratorAI(chatHistory: ChatMessage[], lang: string, username: string | null, region: SupportedRegion, tasteContext?: string, isPremium?: boolean): Promise<string> {
  const provider = env.AI_PROVIDER;
  const systemPrompt = buildSystemPrompt(lang, username, region, tasteContext);
  const curatorModel = isPremium ? CURATOR_MODEL_PREMIUM : CURATOR_MODEL_FREE;
  const curatorMaxTokens = isPremium ? 2048 : 1024;

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
        model: curatorModel,
        max_tokens: curatorMaxTokens,
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
    .select("is_premium, preferred_region, partner_user_id")
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

    // Top title names with genres (for personalized reasons)
    const topTitlesDetailed = likedRows
      .slice(0, 5)
      .map((r) => {
        const c = cache.get(`${r.tmdb_id}:${r.type}`);
        if (!c?.title) return null;
        const genres = Array.isArray(c.genres) ? (c.genres as { name: string }[]).map((g) => g.name).join(", ") : "";
        return { title: c.title as string, genres };
      })
      .filter((t): t is { title: string; genres: string } => t !== null);
    const topTitles = topTitlesDetailed.map((t) => t.title);

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
    if (topTitlesDetailed.length > 0) {
      tasteContext += `\nReference these liked titles in your "reason" fields when relevant:\n${topTitlesDetailed.map((t) => `- ${t.title}${t.genres ? ` (${t.genres})` : ""}`).join("\n")}`;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (ts && typeof ts === "object") {
      const t = ts as any;
      const parts: string[] = [];
      if (t.youLike) parts.push(`Liker: ${t.youLike}`);
      if (t.avoid) parts.push(`Unngår: ${t.avoid}`);
      if (t.pacing) parts.push(`Tempo: ${t.pacing}`);
      if (parts.length > 0) {
        tasteContext += `\nBrukerens smaksprofil:\n${parts.join("\n")}`;
      }
    }
  } catch { /* non-fatal — continue without taste_summary */ }

  // Partner taste context — recommend in the intersection of both tastes
  try {
    const partnerId = (profile as { partner_user_id?: string | null })?.partner_user_id;
    if (partnerId) {
      const { data: partnerRow } = await supabase
        .from("profiles")
        .select("taste_summary, display_name")
        .eq("id", partnerId)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pts = partnerRow?.taste_summary as any;
      if (pts && typeof pts === "object") {
        const partnerParts: string[] = [];
        if (pts.youLike) partnerParts.push(`Liker: ${pts.youLike}`);
        if (pts.avoid) partnerParts.push(`Unngår: ${pts.avoid}`);
        if (pts.pacing) partnerParts.push(`Tempo: ${pts.pacing}`);
        if (partnerParts.length > 0) {
          const partnerName = partnerRow?.display_name || "partneren";
          tasteContext += `\n\nCOUPLE MODE — this user has a partner (${partnerName}). Recommend titles that work for BOTH:
Partnerens smaksprofil:
${partnerParts.join("\n")}
Find titles in the intersection — something both will enjoy based on shared preferences.
If tastes are very different, prioritize titles with broad appeal within shared genres.
When couple context is present, prefix your "message" with "💑" and briefly explain why these picks work for both.`;
        }
      }
    }
  } catch { /* non-fatal — continue without partner context */ }

  // Contextual timing (UTC+1 for Nordic users)
  {
    const now = new Date(Date.now() + 3600000); // UTC+1
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    const isFriday = day === 5;

    let timeContext = "";
    if (isFriday && hour >= 17) {
      timeContext = "Det er fredagskveld — brukeren vil sannsynligvis ha en god filmopplevelse å se frem til i kveld eller helgen.";
    } else if (isWeekend && hour < 12) {
      timeContext = "Det er helgeformiddag — rolige, koselige anbefalinger passer godt.";
    } else if (isWeekend) {
      timeContext = "Det er helg — brukeren har tid til lengre filmer eller serier.";
    } else if (hour >= 22) {
      timeContext = "Det er sent på kvelden — korte filmer eller episoder kan passe bedre.";
    } else if (hour < 9) {
      timeContext = "Det er tidlig morgen — lett underholdning eller dokumentar kan passe.";
    } else {
      timeContext = "Vanlig hverdag — tilpass anbefalinger til brukerens smak.";
    }
    tasteContext += `\nTidskontekst: ${timeContext}`;
  }

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

  // Curator memory — fetch previous conversation for continuity
  let prevConversationId: string | null = null;
  let prevRecommendedIds: number[] = [];
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: prevConv } = await supabase
      .from("curator_conversations")
      .select("id, messages, recommended_tmdb_ids, session_summary")
      .eq("user_id", user.id)
      .gte("updated_at", sevenDaysAgo)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (prevConv) {
      prevConversationId = prevConv.id;
      prevRecommendedIds = Array.isArray(prevConv.recommended_tmdb_ids) ? prevConv.recommended_tmdb_ids : [];

      if (prevRecommendedIds.length > 0) {
        // Fetch title names for previous recommendations
        const { data: prevTitles } = await supabase
          .from("titles_cache")
          .select("tmdb_id, title")
          .in("tmdb_id", prevRecommendedIds.slice(0, 10));
        const prevTitleMap = new Map((prevTitles ?? []).map((r) => [r.tmdb_id, r.title as string]));

        // Check which ones the user has since watched
        const { data: watchedSince } = await supabase
          .from("user_titles")
          .select("tmdb_id, sentiment, rating")
          .eq("user_id", user.id)
          .eq("status", "watched")
          .in("tmdb_id", prevRecommendedIds);
        const watchedMap = new Map((watchedSince ?? []).map((r) => [r.tmdb_id, r]));

        const recNames = prevRecommendedIds
          .map((id) => prevTitleMap.get(id))
          .filter(Boolean)
          .slice(0, 5);
        const watchedLines = prevRecommendedIds
          .filter((id) => watchedMap.has(id))
          .map((id) => {
            const title = prevTitleMap.get(id);
            const w = watchedMap.get(id);
            if (!title) return null;
            const feedback = w?.sentiment === "liked" ? " (likte den)" : w?.sentiment === "disliked" ? " (likte ikke)" : w?.rating ? ` (${w.rating}/10)` : "";
            return `${title}${feedback}`;
          })
          .filter(Boolean);

        if (recNames.length > 0) {
          tasteContext += `\n\nCURATOR MEMORY — previous session context:
Previously recommended: ${recNames.join(", ")}.${watchedLines.length > 0 ? `\nUser has since watched: ${watchedLines.join(", ")}.` : ""}
Use this feedback loop: avoid re-recommending titles already suggested. If the user watched and liked a recommendation, suggest similar titles. If they disliked it, adjust direction.`;
        }
      }

      if (prevConv.session_summary) {
        tasteContext += `\nPrevious conversation summary: ${prevConv.session_summary}`;
      }
    }
  } catch { /* non-fatal — continue without conversation history */ }

  // Mood detection — inject emotional context based on user's message
  const moodSignals: Record<string, string> = {
    "sliten": "Brukeren er sliten — anbefal lett, tilgjengelig underholdning. Ikke krevende drama.",
    "trøtt": "Brukeren er trøtt — korte episoder eller feel-good film passer best.",
    "lei": "Brukeren kjeder seg — noe engasjerende og energisk.",
    "trist": "Brukeren er trist — varm, oppløftende film. Unngå tunge dramaer.",
    "date night": "Det er date night — romantisk eller spennende film for to.",
    "date": "Det er date night — romantisk eller spennende film for to.",
    "kan ikke sove": "Brukeren kan ikke sove — rolig, ikke for intens film.",
    "trenger latter": "Brukeren vil le — komedie eller lett underholdning.",
    "vil gråte": "Brukeren vil ha en film som rører — drama eller romantikk.",
    "skummelt": "Brukeren vil ha noe skummelt — horror eller thriller.",
    "tired": "User is tired — light, easy entertainment. Short runtime preferred.",
    "bored": "User is bored — something engaging and energetic.",
    "sad": "User is sad — warm, uplifting film. Avoid heavy dramas.",
    "can't sleep": "User can't sleep — calm, not too intense.",
    "need to laugh": "User wants to laugh — comedy or light entertainment.",
    "want to cry": "User wants an emotional film — drama or romance.",
    "scary": "User wants something scary — horror or thriller.",
  };
  const userMessageLower = userMessage.toLowerCase();
  for (const [signal, context] of Object.entries(moodSignals)) {
    if (userMessageLower.includes(signal)) {
      tasteContext += `\nMood-kontekst: ${context}`;
      break;
    }
  }

  // 1. AI interprets the query
  const aiRaw = await callCuratorAI(chatHistory, lang, username, userRegion, tasteContext, !!profile?.is_premium);
  const aiResponse = parseAIResponse(aiRaw);
  logger.info("AI parsed", { searches: aiResponse.searches.length });

  // 2. Fetch user's watched titles to exclude from results
  let watchedIds = new Set<number>();
  try {
    const { data: watchedRows } = await supabase
      .from("user_titles")
      .select("tmdb_id")
      .eq("user_id", user.id)
      .eq("status", "watched");
    if (watchedRows) watchedIds = new Set(watchedRows.map((r) => r.tmdb_id));
  } catch { /* non-fatal */ }

  // 3. Search TMDB for each identified title (sequential to respect rate limits)
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
      if (watchedIds.has(top.id)) continue;
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

  // Fire-and-forget: persist conversation to curator_conversations
  const newRecommendedIds = available.map((m) => m.tmdb_id);
  const now = new Date().toISOString();
  const userMsg = { role: "user", content: userMessage, timestamp: now };
  const assistantMsg = { role: "assistant", content: aiResponse.message, tmdb_ids: newRecommendedIds, timestamp: now };

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    try {
      if (prevConversationId) {
        // Update existing conversation — append messages, merge recommended IDs
        const { data: existing } = await supabase
          .from("curator_conversations")
          .select("messages, recommended_tmdb_ids")
          .eq("id", prevConversationId)
          .single();

        const existingMsgs = Array.isArray(existing?.messages) ? existing.messages : [];
        const updatedMsgs = [...existingMsgs, userMsg, assistantMsg].slice(-20); // max 20 messages
        const mergedIds = [...new Set([...prevRecommendedIds, ...newRecommendedIds])];

        await supabase
          .from("curator_conversations")
          .update({
            messages: updatedMsgs,
            recommended_tmdb_ids: mergedIds,
            updated_at: now,
          })
          .eq("id", prevConversationId);
      } else {
        // Insert new conversation
        await supabase
          .from("curator_conversations")
          .insert({
            user_id: user.id,
            messages: [userMsg, assistantMsg],
            recommended_tmdb_ids: newRecommendedIds,
          });
      }
    } catch { /* non-fatal — never block response */ }
  })();

  return NextResponse.json({
    message: aiResponse.message,
    movies: available,
  });
});
