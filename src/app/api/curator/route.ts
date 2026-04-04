import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { tmdbSearch, tmdbWatchProviders } from "@/lib/tmdb";
import { env } from "@/lib/env";
import { resolveRegion, REGION_LABELS, type SupportedRegion } from "@/lib/region";
import { applyRateLimit } from "@/lib/rate-limit";

/* ── AI call ───────────────────────────────────────── */

const CURATOR_MODEL_FREE = "claude-haiku-4-5-20251001";
const CURATOR_MODEL_PREMIUM = "claude-sonnet-4-6";

/* ── Localized labels ─────────────────────────────── */

type NormalizedLang = "no" | "en" | "sv" | "da" | "fi";

const tasteLabels: Record<NormalizedLang, { likes: string; avoid: string; pacing: string; profile: string }> = {
  en: { likes: "Likes", avoid: "Avoids", pacing: "Pacing", profile: "User's taste profile:" },
  no: { likes: "Liker", avoid: "Unngår", pacing: "Tempo", profile: "Brukerens smaksprofil:" },
  sv: { likes: "Gillar", avoid: "Undviker", pacing: "Tempo", profile: "Användarens smakprofil:" },
  da: { likes: "Kan lide", avoid: "Undgår", pacing: "Tempo", profile: "Brugerens smagsprofil:" },
  fi: { likes: "Pitää", avoid: "Välttää", pacing: "Tahti", profile: "Käyttäjän makuprofiili:" },
};

const feedbackLabels: Record<NormalizedLang, { liked: string; disliked: string }> = {
  en: { liked: " (liked it)", disliked: " (didn't like it)" },
  no: { liked: " (likte den)", disliked: " (likte ikke)" },
  sv: { liked: " (gillade den)", disliked: " (gillade inte)" },
  da: { liked: " (kunne lide den)", disliked: " (kunne ikke lide)" },
  fi: { liked: " (piti siitä)", disliked: " (ei pitänyt)" },
};

const timeStrings: Record<NormalizedLang, { friday: string; weekendDay: string; weekendMorning: string; weekend: string; weeknight: string; late: string; morning: string; default: string }> = {
  en: {
    friday: "It's Friday evening — perfect movie night. Be enthusiastic and celebratory in tone.",
    weekendDay: "It's weekend daytime — suggest something relaxed or a series to binge.",
    weekendMorning: "It's a weekend morning — cozy, relaxed recommendations work well.",
    weekend: "It's the weekend — the user has time for longer films or series.",
    weeknight: "It's a weekday evening — suggest something not too long or demanding.",
    late: "It's late night — user might be tired. Suggest something light and engaging.",
    morning: "It's early morning — light entertainment or documentaries.",
    default: "Regular weekday — tailor recommendations to the user's taste.",
  },
  no: {
    friday: "Det er fredagskveld — perfekt for en filmkveld. Vær entusiastisk og festlig i tonen.",
    weekendDay: "Det er helg og dag — foreslå gjerne noe avslappet eller en serie å binge.",
    weekendMorning: "Det er helgeformiddag — rolige, koselige anbefalinger passer godt.",
    weekend: "Det er helg — brukeren har tid til lengre filmer eller serier.",
    weeknight: "Det er en vanlig ukekveld — foreslå noe som ikke er for langt eller krevende.",
    late: "Det er natt — brukeren er kanskje søvnig. Foreslå noe lett og engasjerende.",
    morning: "Det er tidlig morgen — lett underholdning eller dokumentar kan passe.",
    default: "Vanlig hverdag — tilpass anbefalinger til brukerens smak.",
  },
  sv: {
    friday: "Det är fredagskväll — perfekt för filmkväll. Var entusiastisk i tonen.",
    weekendDay: "Det är helg och dag — föreslå något avslappnat eller en serie att binga.",
    weekendMorning: "Det är helgförmiddag — mysiga rekommendationer passar bra.",
    weekend: "Det är helg — användaren har tid för längre filmer eller serier.",
    weeknight: "Det är en vanlig vardagskväll — föreslå något som inte är för långt.",
    late: "Det är natt — användaren kanske är trött. Föreslå något lätt och engagerande.",
    morning: "Det är tidig morgon — lätt underhållning.",
    default: "Vanlig vardag — anpassa rekommendationer till smaken.",
  },
  da: {
    friday: "Det er fredag aften — perfekt til filmaften. Vær entusiastisk i tonen.",
    weekendDay: "Det er weekend og dag — foreslå noget afslappet eller en serie at binge.",
    weekendMorning: "Det er weekendformiddag — hyggelige anbefalinger passer godt.",
    weekend: "Det er weekend — brugeren har tid til længere film.",
    weeknight: "Det er en almindelig hverdagsaften — foreslå noget der ikke er for langt.",
    late: "Det er nat — brugeren er måske træt. Foreslå noget let og engagerende.",
    morning: "Det er tidlig morgen — let underholdning.",
    default: "Almindelig hverdag — tilpas anbefalinger til smagen.",
  },
  fi: {
    friday: "On perjantai-ilta — täydellinen elokuvailta. Ole innostunut sävyssä.",
    weekendDay: "On viikonloppu ja päivä — ehdota jotain rentoa tai sarjaa bingettäväksi.",
    weekendMorning: "On viikonloppuaamu — rauhalliset suositukset sopivat hyvin.",
    weekend: "On viikonloppu — käyttäjällä on aikaa pidemmille elokuville.",
    weeknight: "On tavallinen arki-ilta — ehdota jotain joka ei ole liian pitkä.",
    late: "On yö — käyttäjä saattaa olla väsynyt. Ehdota jotain kevyttä ja mukaansatempaavaa.",
    morning: "On aikainen aamu — kevyttä viihdettä.",
    default: "Tavallinen arkipäivä — räätälöi suositukset maun mukaan.",
  },
};

function buildSystemPrompt(lang: NormalizedLang, username: string | null, region: SupportedRegion, tasteContext?: string): string {
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
- "searches": array of objects like {"query":"The Sopranos","type":"tv","reason":"A dark power play with unforgettable characters"}. Use exact English TMDB titles. "type" is "movie" or "tv".
Each search MUST include a "reason": a personalized 1-2 sentence reason in the user's language.
Rules for "reason":
- Reference 1-2 of the user's actual liked titles by name when a clear connection exists (tone, theme, director style, pacing).
- Write in second person addressing the user directly (e.g. "You liked X — this has the same..." or equivalent in the user's language).
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

/** Stream Anthropic SSE and yield text deltas */
async function* readAnthropicSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") return;
        try {
          const evt = JSON.parse(json);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            yield evt.delta.text;
          }
        } catch { /* skip malformed lines */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function callCuratorAIStreaming(
  chatHistory: ChatMessage[], lang: NormalizedLang, username: string | null,
  region: SupportedRegion, tasteContext?: string, isPremium?: boolean,
): Promise<string> {
  const provider = env.AI_PROVIDER;
  const systemPrompt = buildSystemPrompt(lang, username, region, tasteContext);
  const curatorModel = isPremium ? CURATOR_MODEL_PREMIUM : CURATOR_MODEL_FREE;
  const curatorMaxTokens = isPremium ? 2048 : 1024;
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
        stream: true,
        system: systemPrompt,
        messages,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
    if (!res.body) throw new Error("No response body");
    let full = "";
    for await (const chunk of readAnthropicSSE(res.body)) {
      full += chunk;
    }
    return full;
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
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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

/* ── ENDRING 7: Dynamic follow-up pills ──────────────── */

const genericPills: Record<NormalizedLang, string[]> = {
  no: ["Noe lysere", "Noe mørkere", "Kort film", "Lang serie", "Skjult perle", "Nytt i år"],
  en: ["Something lighter", "Something darker", "Short film", "Long series", "Hidden gem", "New this year"],
  sv: ["Något lättare", "Något mörkare", "Kort film", "Lång serie", "Gömd pärla", "Nytt i år"],
  da: ["Noget lettere", "Noget mørkere", "Kort film", "Lang serie", "Skjult perle", "Nyt i år"],
  fi: ["Jotain kevyempää", "Jotain synkempää", "Lyhyt elokuva", "Pitkä sarja", "Piilotettu helmi", "Uutta tänä vuonna"],
};

const moviePills: Record<NormalizedLang, string[]> = {
  no: ["Lignende stemning", "Kortere versjon", "Samme sjanger"],
  en: ["Similar vibe", "Shorter version", "Same genre"],
  sv: ["Liknande stämning", "Kortare version", "Samma genre"],
  da: ["Lignende stemning", "Kortere version", "Samme genre"],
  fi: ["Samanlainen tunnelma", "Lyhyempi versio", "Sama genre"],
};

const tvPills: Record<NormalizedLang, string[]> = {
  no: ["Lignende univers", "Kortere episoder", "Mer av samme sjanger"],
  en: ["Similar universe", "Shorter episodes", "More of this genre"],
  sv: ["Liknande universum", "Kortare avsnitt", "Mer av samma genre"],
  da: ["Lignende univers", "Kortere episoder", "Mere af samme genre"],
  fi: ["Samanlainen maailma", "Lyhyemmät jaksot", "Lisää samaa genreä"],
};

const couplePills: Record<NormalizedLang, string[]> = {
  no: ["Noe vi begge vil like", "Mer action", "Noe lysere"],
  en: ["Something we'll both enjoy", "More action", "Something lighter"],
  sv: ["Något vi båda gillar", "Mer action", "Något lättare"],
  da: ["Noget vi begge vil lide", "Mere action", "Noget lettere"],
  fi: ["Jotain mitä molemmat pitävät", "Lisää actionia", "Jotain kevyempää"],
};

function generateFollowUpPills(lang: NormalizedLang, movies: CuratorMovie[], hasCoupleContext: boolean): string[] {
  const pills: string[] = [];
  const l = lang;

  if (hasCoupleContext) {
    pills.push(...couplePills[l]);
  } else if (movies.length > 0) {
    const lastType = movies[movies.length - 1].type;
    pills.push(...(lastType === "tv" ? tvPills[l] : moviePills[l]));
  }

  // Fill remaining with generic pills (shuffle)
  const generic = [...genericPills[l]].sort(() => Math.random() - 0.5);
  for (const p of generic) {
    if (pills.length >= 4) break;
    if (!pills.includes(p)) pills.push(p);
  }

  return pills.slice(0, 4);
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

  // Bug 7 fix: single profile query includes taste_summary
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, preferred_region, partner_user_id, taste_summary, exploration_slider, streaming_services")
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

  // Bug 1 fix: accept "dk"/"se" from frontend, normalize to "da"/"sv", default to "en"
  const validLangs = ["no", "en", "sv", "da", "fi", "dk", "se"];
  const requestedLang = typeof body.lang === "string" ? body.lang : "";
  const rawLang = validLangs.includes(requestedLang) ? requestedLang : "en";
  const normalizedLang: NormalizedLang = rawLang === "dk" ? "da" : rawLang === "se" ? "sv" : rawLang as NormalizedLang;

  const username = typeof body.username === "string" ? body.username.slice(0, 50) : null;
  const userRegion = resolveRegion(profile?.preferred_region, req.headers.get("x-vercel-ip-country"));

  const partnerId = (profile as { partner_user_id?: string | null })?.partner_user_id;

  // Fetch taste context + watchlist + friends + favorites + superlikes + exclusions + mood tags + couple matches in parallel
  const [likedRes, dislikedRes, watchlistRes, linksRes, favoritesRes, superlikesRes, exclusionsRes, moodTagsRes, coupleMatchesRes, coupleDisagreesRes] = await Promise.all([
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
    // ENDRING 1: Favorite titles (strongest signal)
    supabase
      .from("user_titles")
      .select("tmdb_id, type")
      .eq("user_id", user.id)
      .eq("favorite", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    // ENDRING 4: Se Sammen superlike titles
    supabase
      .from("wt_session_swipes")
      .select("tmdb_id, media_type")
      .eq("user_id", user.id)
      .eq("decision", "superlike")
      .order("created_at", { ascending: false })
      .limit(15),
    // ENDRING 5: User exclusions
    supabase
      .from("user_exclusions")
      .select("tmdb_id, type")
      .eq("user_id", user.id)
      .limit(50),
    // ENDRING 8: Mood tags from liked titles
    supabase
      .from("user_titles")
      .select("tmdb_id")
      .eq("user_id", user.id)
      .eq("sentiment", "liked")
      .order("updated_at", { ascending: false })
      .limit(10),
    // ENDRING 9: Couple match history
    partnerId
      ? createSupabaseAdmin()
          .from("wt_sessions")
          .select("match_tmdb_id")
          .not("match_tmdb_id", "is", null)
          .or(`and(host_id.eq.${user.id},guest_id.eq.${partnerId}),and(host_id.eq.${partnerId},guest_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null }),
    // ENDRING 9b: Couple disagreements
    partnerId
      ? createSupabaseAdmin()
          .from("wt_session_swipes")
          .select("tmdb_id, media_type, decision, user_id")
          .or(`user_id.eq.${user.id},user_id.eq.${partnerId}`)
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: null }),
  ]);

  let tasteContext = "";
  const likedRows = likedRes.data ?? [];
  const dislikedRows = dislikedRes.data ?? [];
  const favoriteRows = favoritesRes.data ?? [];
  const superlikeRows = superlikesRes.data ?? [];
  const exclusionRows = exclusionsRes.data ?? [];

  // Fetch titles_cache for all relevant IDs in one query
  const allTmdbIds = new Set([
    ...likedRows.map((r) => r.tmdb_id),
    ...dislikedRows.map((r) => r.tmdb_id),
    ...favoriteRows.map((r) => r.tmdb_id),
    ...superlikeRows.map((r) => r.tmdb_id),
    ...exclusionRows.map((r) => r.tmdb_id),
  ]);

  let cache = new Map<string, { tmdb_id: number; type: string; title: string; genres: unknown }>();
  if (allTmdbIds.size > 0) {
    const { data: cacheRows } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, genres")
      .in("tmdb_id", [...allTmdbIds]);
    cache = new Map((cacheRows ?? []).map((r) => [`${r.tmdb_id}:${r.type}`, r]));
  }

  // Helper: resolve title from cache (try both movie and tv keys)
  function resolveTitle(tmdbId: number, type?: string): string | null {
    if (type) {
      const c = cache.get(`${tmdbId}:${type}`);
      if (c?.title) return c.title as string;
    }
    const m = cache.get(`${tmdbId}:movie`);
    if (m?.title) return m.title as string;
    const t = cache.get(`${tmdbId}:tv`);
    if (t?.title) return t.title as string;
    return null;
  }

  function resolveGenres(tmdbId: number, type: string): string {
    const c = cache.get(`${tmdbId}:${type}`);
    return Array.isArray(c?.genres) ? (c.genres as { name: string }[]).map((g) => g.name).join(", ") : "";
  }

  if (likedRows.length > 0 || dislikedRows.length > 0) {
    // ENDRING 3: Tiered rating formatting
    const loved = likedRows.filter((r) => r.rating === 10);
    const liked = likedRows.filter((r) => r.rating && r.rating >= 7 && r.rating < 10);
    const enjoyedNoRating = likedRows.filter((r) => !r.rating && r.sentiment === "liked");

    const topTitlesDetailed = likedRows
      .slice(0, 5)
      .map((r) => {
        const title = resolveTitle(r.tmdb_id, r.type);
        if (!title) return null;
        const genres = resolveGenres(r.tmdb_id, r.type);
        return { title, genres };
      })
      .filter((t): t is { title: string; genres: string } => t !== null);

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
    // Tiered ratings
    const lovedTitles = loved.map((r) => resolveTitle(r.tmdb_id, r.type)).filter(Boolean);
    const likedTitles = liked.map((r) => { const t = resolveTitle(r.tmdb_id, r.type); return t ? `${t} (${r.rating}/10)` : null; }).filter(Boolean);
    const enjoyedTitles = enjoyedNoRating.map((r) => resolveTitle(r.tmdb_id, r.type)).filter(Boolean);
    if (lovedTitles.length > 0) parts.push(`Loved (10/10): ${lovedTitles.join(", ")}.`);
    if (likedTitles.length > 0) parts.push(`Liked: ${likedTitles.join(", ")}.`);
    if (enjoyedTitles.length > 0) parts.push(`Enjoyed: ${enjoyedTitles.join(", ")}.`);
    if (topLikedGenres.length > 0) parts.push(`Favourite genres: ${topLikedGenres.join(", ")}.`);
    if (topDislikedGenres.length > 0) parts.push(`Tends to avoid: ${topDislikedGenres.join(", ")}.`);

    if (parts.length > 0) {
      tasteContext = `${username ? `${username}'s` : "User's"} taste — ${parts.join(" ")} Use this to personalize suggestions, but don't mention it explicitly unless relevant.`;
    }
    if (topTitlesDetailed.length > 0) {
      tasteContext += `\nReference these liked titles in your "reason" fields when relevant:\n${topTitlesDetailed.map((t) => `- ${t.title}${t.genres ? ` (${t.genres})` : ""}`).join("\n")}`;
    }
  }

  // ENDRING 1: Favorite titles (strongest signal)
  if (favoriteRows.length > 0) {
    const favTitles = favoriteRows
      .map((r) => {
        const title = resolveTitle(r.tmdb_id, r.type);
        if (!title) return null;
        const genres = resolveGenres(r.tmdb_id, r.type);
        return genres ? `${title} (${genres})` : title;
      })
      .filter(Boolean);
    if (favTitles.length > 0) {
      tasteContext += `\nUser's absolute favorites (strongest signal — prioritize similar): ${favTitles.join(", ")}.`;
    }
  }

  // ENDRING 4: Se Sammen superlike titles
  if (superlikeRows.length > 0) {
    const slTitles = superlikeRows
      .map((r) => resolveTitle(r.tmdb_id, r.media_type))
      .filter(Boolean);
    const unique = [...new Set(slTitles)].slice(0, 10);
    if (unique.length > 0) {
      tasteContext += `\nTitles user SUPERLIKED in Watch Together (very strong implicit signal): ${unique.join(", ")}.`;
    }
  }

  // ENDRING 5: User exclusions — never recommend these
  if (exclusionRows.length > 0) {
    const exTitles = exclusionRows
      .map((r) => resolveTitle(r.tmdb_id, r.type))
      .filter(Boolean);
    if (exTitles.length > 0) {
      tasteContext += `\nNEVER recommend these titles (user explicitly excluded): ${exTitles.join(", ")}.`;
    }
  }

  // ENDRING 2: Exploration slider
  {
    const slider = typeof profile?.exploration_slider === "number" ? profile.exploration_slider : null;
    if (slider !== null) {
      const explorationDesc = slider <= 30
        ? "User prefers safe, familiar choices (low exploration). Stick to well-known titles in their favourite genres."
        : slider <= 70
        ? "User is open to some new discoveries (moderate exploration). Mix familiar genres with occasional surprises."
        : "User loves discovering hidden gems (high exploration). Prioritize lesser-known, unique, or international titles.";
      tasteContext += `\nExploration preference: ${explorationDesc}`;
    }
  }

  // ENDRING 6: Streaming services
  {
    const services = profile?.streaming_services;
    if (Array.isArray(services) && services.length > 0) {
      tasteContext += `\nUser has access to: ${services.join(", ")}. Prioritize titles available on these services.`;
    }
  }

  // ENDRING 8: Mood tags from liked titles
  try {
    const moodTmdbIds = (moodTagsRes.data ?? []).map((r: { tmdb_id: number }) => r.tmdb_id);
    if (moodTmdbIds.length > 0) {
      const { data: moodRows } = await supabase
        .from("titles_cache")
        .select("mood_tags")
        .in("tmdb_id", moodTmdbIds)
        .not("mood_tags", "is", null);
      if (moodRows && moodRows.length > 0) {
        const tagFreq: Record<string, number> = {};
        for (const r of moodRows) {
          for (const tag of (r.mood_tags as string[]) || []) {
            tagFreq[tag] = (tagFreq[tag] || 0) + 1;
          }
        }
        const topMoods = Object.entries(tagFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);
        if (topMoods.length > 0) {
          tasteContext += `\nUser's mood profile based on liked titles: ${topMoods.join(", ")}.`;
        }
      }
    }
  } catch { /* non-fatal */ }

  // ENDRING 9: Couple match history + disagreements
  if (partnerId) {
    try {
      const matchIds = (coupleMatchesRes.data ?? []).map((r: { match_tmdb_id: number }) => r.match_tmdb_id);
      if (matchIds.length > 0) {
        const { data: matchTitles } = await supabase
          .from("titles_cache")
          .select("tmdb_id, title")
          .in("tmdb_id", matchIds);
        const matchNames = (matchTitles ?? []).map((r: { title: string }) => r.title).slice(0, 10);
        if (matchNames.length > 0) {
          tasteContext += `\nCouple has matched on: ${matchNames.join(", ")} — these work for both.`;
        }
      }

      // Disagreements: find titles where one liked and the other noped
      const disagreeRows = coupleDisagreesRes.data ?? [];
      if (disagreeRows.length > 0) {
        const swipesByTitle = new Map<number, { likes: Set<string>; nopes: Set<string> }>();
        for (const r of disagreeRows as { tmdb_id: number; user_id: string; decision: string }[]) {
          if (!swipesByTitle.has(r.tmdb_id)) swipesByTitle.set(r.tmdb_id, { likes: new Set(), nopes: new Set() });
          const entry = swipesByTitle.get(r.tmdb_id)!;
          if (r.decision === "like" || r.decision === "superlike") entry.likes.add(r.user_id);
          else if (r.decision === "nope") entry.nopes.add(r.user_id);
        }
        const disagreedIds = [...swipesByTitle.entries()]
          .filter(([, v]) => v.likes.size > 0 && v.nopes.size > 0)
          .slice(0, 5)
          .map(([id]) => id);
        if (disagreedIds.length > 0) {
          const { data: disagTitles } = await supabase
            .from("titles_cache")
            .select("tmdb_id, title")
            .in("tmdb_id", disagreedIds);
          const disagNames = (disagTitles ?? []).map((r: { title: string }) => r.title);
          if (disagNames.length > 0) {
            tasteContext += `\nTitles they disagreed on: ${disagNames.join(", ")} — avoid unless there's a strong reason.`;
          }
        }
      }
    } catch { /* non-fatal */ }
  }

  // Bug 5 fix: localized taste summary labels + Bug 7: use profile.taste_summary directly
  const tl = tasteLabels[normalizedLang] ?? tasteLabels.en;
  try {
    const ts = profile?.taste_summary;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (ts && typeof ts === "object") {
      const t = ts as any;
      const parts: string[] = [];
      if (t.youLike) parts.push(`${tl.likes}: ${t.youLike}`);
      if (t.avoid) parts.push(`${tl.avoid}: ${t.avoid}`);
      if (t.pacing) parts.push(`${tl.pacing}: ${t.pacing}`);
      if (parts.length > 0) {
        tasteContext += `\n${tl.profile}\n${parts.join("\n")}`;
      }
    }
  } catch { /* non-fatal — continue without taste_summary */ }

  // Partner taste context — recommend in the intersection of both tastes
  try {
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
        if (pts.youLike) partnerParts.push(`${tl.likes}: ${pts.youLike}`);
        if (pts.avoid) partnerParts.push(`${tl.avoid}: ${pts.avoid}`);
        if (pts.pacing) partnerParts.push(`${tl.pacing}: ${pts.pacing}`);
        if (partnerParts.length > 0) {
          const partnerName = partnerRow?.display_name || "partner";
          tasteContext += `\n\nCOUPLE MODE — this user has a partner (${partnerName}). Recommend titles that work for BOTH:
Partner's taste profile:
${partnerParts.join("\n")}
Find titles in the intersection — something both will enjoy based on shared preferences.
If tastes are very different, prioritize titles with broad appeal within shared genres.
When couple context is present, prefix your "message" with "💑" and briefly explain why these picks work for both.`;
        }
      }
    }
  } catch { /* non-fatal — continue without partner context */ }

  // Bug 4 fix: localized time context
  {
    const now = new Date(Date.now() + 3600000); // UTC+1
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    const isFriday = day === 5;
    const ts = timeStrings[normalizedLang] ?? timeStrings.en;

    let timeContext = "";
    if (isFriday && hour >= 16) {
      timeContext = ts.friday;
    } else if (isWeekend && hour >= 10 && hour < 17) {
      timeContext = ts.weekendDay;
    } else if (isWeekend && hour < 10) {
      timeContext = ts.weekendMorning;
    } else if (isWeekend) {
      timeContext = ts.weekend;
    } else if (hour >= 23 || hour < 4) {
      timeContext = ts.late;
    } else if (hour >= 18 && hour < 23) {
      timeContext = ts.weeknight;
    } else if (hour < 9) {
      timeContext = ts.morning;
    } else {
      timeContext = ts.default;
    }
    tasteContext += `\nTime context: ${timeContext}`;
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
  // Bug 6 fix: localized feedback labels
  const fl = feedbackLabels[normalizedLang] ?? feedbackLabels.en;
  let prevConversationId: string | null = null;
  let prevRecommendedIds: number[] = [];
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    // Bug 2 fix: use .maybeSingle() instead of .single()
    const { data: prevConv } = await supabase
      .from("curator_conversations")
      .select("id, messages, recommended_tmdb_ids, session_summary")
      .eq("user_id", user.id)
      .gte("updated_at", sevenDaysAgo)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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
            const feedback = w?.sentiment === "liked" ? fl.liked : w?.sentiment === "disliked" ? fl.disliked : w?.rating ? ` (${w.rating}/10)` : "";
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

  // Bug 3 fix: mood signals for all 5 languages
  const moodSignals: Record<string, string> = {
    // Norwegian
    "sliten": "User is tired — recommend light, accessible entertainment. Not demanding drama.",
    "trøtt": "User is tired — short episodes or feel-good film work best.",
    "lei": "User is bored — something engaging and energetic.",
    "trist": "User is sad — warm, uplifting film. Avoid heavy dramas.",
    "date night": "It's date night — romantic or exciting film for two.",
    "date": "It's date night — romantic or exciting film for two.",
    "kan ikke sove": "User can't sleep — calm, not too intense.",
    "trenger latter": "User wants to laugh — comedy or light entertainment.",
    "vil gråte": "User wants an emotional film — drama or romance.",
    "skummelt": "User wants something scary — horror or thriller.",
    // English
    "tired": "User is tired — light, easy entertainment. Short runtime preferred.",
    "bored": "User is bored — something engaging and energetic.",
    "sad": "User is sad — warm, uplifting film. Avoid heavy dramas.",
    "can't sleep": "User can't sleep — calm, not too intense.",
    "need to laugh": "User wants to laugh — comedy or light entertainment.",
    "want to cry": "User wants an emotional film — drama or romance.",
    "scary": "User wants something scary — horror or thriller.",
    // Swedish
    "trött": "User is tired — recommend light entertainment.",
    "uttråkad": "User is bored — something engaging and energetic.",
    "ledsen": "User is sad — warm, uplifting film.",
    "kan inte sova": "User can't sleep — calm film.",
    "vill skratta": "User wants to laugh — comedy.",
    // Danish
    "træt": "User is tired — light entertainment.",
    "kedelig": "User is bored — something engaging.",
    "vil grine": "User wants to cry — emotional drama or romance.",
    // Finnish
    "väsynyt": "User is tired — light entertainment.",
    "tylsä": "User is bored — something engaging.",
    "surullinen": "User is sad — warm, uplifting film.",
    "ei voi nukkua": "User can't sleep — calm film.",
    "haluaa nauraa": "User wants to laugh — comedy.",
  };
  const userMessageLower = userMessage.toLowerCase();
  for (const [signal, context] of Object.entries(moodSignals)) {
    if (userMessageLower.includes(signal)) {
      tasteContext += `\nMood context: ${context}`;
      break;
    }
  }

  // 1. AI interprets the query (streaming for faster time-to-completion)
  const aiRaw = await callCuratorAIStreaming(chatHistory, normalizedLang, username, userRegion, tasteContext, !!profile?.is_premium);
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

  // 3. Stream response: send message text immediately, then movie cards after TMDB lookups
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send message text immediately — user sees this within ~1s
        controller.enqueue(encoder.encode(aiResponse.message));

        // Now do TMDB lookups (the slow part — 1-2s)
        const movies: CuratorMovie[] = [];
        const seen = new Set<string>();

        for (const search of aiResponse.searches) {
          try {
            const type = search.type === "tv" ? "tv" : "movie";
            const results = await tmdbSearch(search.query, type);
            const top = Array.isArray(results) ? results[0] : results?.results?.[0];
            if (!top) continue;

            const key = `${top.id}:${type}`;
            if (seen.has(key)) continue;
            if (watchedIds.has(top.id)) continue;
            seen.add(key);

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

        const available = movies.filter((m) => m.providers.length > 0);
        logger.info("Curator response", { movies: movies.length, available: available.length, elapsed: logger.elapsed() });

        // Send movie cards after delimiter
        controller.enqueue(encoder.encode(`\n[CARDS]${JSON.stringify(available)}`));

        // ENDRING 7: Dynamic follow-up pills based on last recommendation
        const pills = generateFollowUpPills(normalizedLang, available, !!partnerId);
        controller.enqueue(encoder.encode(`\n[PILLS]${JSON.stringify(pills)}`));

        // Fire-and-forget: persist conversation
        const newRecommendedIds = available.map((m) => m.tmdb_id);
        const now = new Date().toISOString();
        const userMsg = { role: "user", content: userMessage, timestamp: now };
        const assistantMsg = { role: "assistant", content: aiResponse.message, tmdb_ids: newRecommendedIds, timestamp: now };

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          try {
            if (prevConversationId) {
              const { data: existing } = await supabase
                .from("curator_conversations")
                .select("messages, recommended_tmdb_ids")
                .eq("id", prevConversationId)
                .single();

              const existingMsgs = Array.isArray(existing?.messages) ? existing.messages : [];
              const updatedMsgs = [...existingMsgs, userMsg, assistantMsg].slice(-20);
              const mergedIds = [...new Set([...prevRecommendedIds, ...newRecommendedIds])];

              await supabase
                .from("curator_conversations")
                .update({ messages: updatedMsgs, recommended_tmdb_ids: mergedIds, updated_at: now })
                .eq("id", prevConversationId);
            } else {
              await supabase
                .from("curator_conversations")
                .insert({ user_id: user.id, messages: [userMsg, assistantMsg], recommended_tmdb_ids: newRecommendedIds });
            }
          } catch { /* non-fatal */ }
        })();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error";
        controller.enqueue(encoder.encode(`\n[ERROR]${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
