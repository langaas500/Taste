// Server-only TMDB API utility

const BASE = "https://api.themoviedb.org/3";

/* ── In-memory cache (20 min TTL) ─────────────────────── */
const _tmdbCache = new Map<string, { data: unknown; ts: number }>();
const TMDB_CACHE_TTL = 20 * 60 * 1000;

const CACHEABLE_PATTERNS = [
  "/trending/",
  "/discover/",
  "/search/",
  "/watch/providers",
  "/similar",
  "/recommendations",
];

function isCacheable(url: string): boolean {
  return CACHEABLE_PATTERNS.some((p) => url.includes(p));
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch wrapper with TMDB_API_KEY validation, 20-min cache, and 429 retry/backoff. */
async function tmdbFetch(url: string): Promise<Response> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set");
  }

  // Return cached response for cacheable endpoints
  if (isCacheable(url)) {
    const cached = _tmdbCache.get(url);
    if (cached && Date.now() - cached.ts < TMDB_CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const opts = { headers: headers() };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, opts);
    if (res.status !== 429) {
      // Cache successful responses for cacheable endpoints
      if (res.ok && isCacheable(url)) {
        const clone = res.clone();
        clone.json().then((data) => {
          _tmdbCache.set(url, { data, ts: Date.now() });
        }).catch(() => {});
      }
      return res;
    }
    const retryAfter = parseInt(res.headers.get("Retry-After") || "1", 10);
    await sleep(Math.max(retryAfter, 1) * 1000);
  }
  throw new Error("TMDB rate limit exceeded after 3 retries");
}

export async function tmdbSearch(query: string, type: "movie" | "tv" | "multi" = "multi") {
  const endpoint = type === "multi" ? "search/multi" : `search/${type}`;
  const res = await tmdbFetch(
    `${BASE}/${endpoint}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
  );
  if (!res.ok) throw new Error(`TMDB search error: ${res.status}`);
  const data = await res.json();
  // Filter to only movies and tv
  return data.results.filter(
    (r: { media_type?: string }) =>
      type !== "multi" || r.media_type === "movie" || r.media_type === "tv"
  );
}

export async function tmdbDetails(tmdbId: number, type: "movie" | "tv", appendToResponse?: string) {
  const append = appendToResponse ? `&append_to_response=${appendToResponse}` : "";
  const res = await tmdbFetch(`${BASE}/${type}/${tmdbId}?language=en-US${append}`);
  if (!res.ok) throw new Error(`TMDB details error: ${res.status}`);
  return res.json();
}

export async function tmdbExternalIds(tmdbId: number, type: "movie" | "tv") {
  const res = await tmdbFetch(`${BASE}/${type}/${tmdbId}/external_ids`);
  if (!res.ok) return null;
  return res.json();
}

export async function tmdbDiscover(
  type: "movie" | "tv",
  params: Record<string, string> = {}
) {
  const qs = new URLSearchParams({
    language: "en-US",
    sort_by: "popularity.desc",
    page: "1",
    ...params,
  });
  const res = await tmdbFetch(`${BASE}/discover/${type}?${qs}`);
  if (!res.ok) throw new Error(`TMDB discover error: ${res.status}`);
  return res.json();
}

export async function tmdbTrending(type: "movie" | "tv" | "all" = "all", window: "day" | "week" = "week") {
  const res = await tmdbFetch(`${BASE}/trending/${type}/${window}?language=en-US`);
  if (!res.ok) throw new Error(`TMDB trending error: ${res.status}`);
  return res.json();
}

export async function tmdbSimilar(tmdbId: number, type: "movie" | "tv") {
  const res = await tmdbFetch(`${BASE}/${type}/${tmdbId}/similar?language=en-US&page=1`);
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function tmdbWatchProviders(tmdbId: number, type: "movie" | "tv") {
  const res = await tmdbFetch(`${BASE}/${type}/${tmdbId}/watch/providers`);
  if (!res.ok) return { results: {} };
  return res.json();
}

export async function tmdbSearchPerson(query: string, page = 1) {
  const res = await tmdbFetch(
    `${BASE}/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
  );
  if (!res.ok) throw new Error(`TMDB person search error: ${res.status}`);
  return res.json();
}

export async function tmdbPersonCredits(personId: number) {
  const res = await tmdbFetch(
    `${BASE}/person/${personId}/combined_credits?language=en-US`
  );
  if (!res.ok) throw new Error(`TMDB person credits error: ${res.status}`);
  return res.json();
}

export async function tmdbSearchKeywords(query: string) {
  const res = await tmdbFetch(
    `${BASE}/search/keyword?query=${encodeURIComponent(query)}&page=1`
  );
  if (!res.ok) throw new Error(`TMDB keyword search error: ${res.status}`);
  const data = await res.json();
  return data.results as { id: number; name: string }[];
}

export async function tmdbGenres(type: "movie" | "tv") {
  const res = await tmdbFetch(`${BASE}/genre/${type}/list?language=en-US`);
  if (!res.ok) throw new Error(`TMDB genres error: ${res.status}`);
  return res.json();
}

export async function tmdbProviderList(type: "movie" | "tv", region = "NO") {
  const res = await tmdbFetch(
    `${BASE}/watch/providers/${type}?language=en-US&watch_region=${region}`
  );
  if (!res.ok) throw new Error(`TMDB provider list error: ${res.status}`);
  return res.json();
}

export function tmdbImageUrl(path: string | null, size = "w342") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function parseTitleFromTMDB(item: Record<string, unknown>, type?: "movie" | "tv") {
  const mediaType = type || (item.media_type as string);
  const isMovie = mediaType === "movie";
  return {
    tmdb_id: item.id as number,
    type: (isMovie ? "movie" : "tv") as "movie" | "tv",
    title: (isMovie ? item.title : item.name) as string,
    original_title: (isMovie ? item.original_title : item.original_name) as string | null,
    year: extractYear(isMovie ? (item.release_date as string) : (item.first_air_date as string)),
    overview: (item.overview as string) || null,
    genres: item.genres || item.genre_ids || [],
    poster_path: (item.poster_path as string) || null,
    backdrop_path: (item.backdrop_path as string) || null,
    vote_average: (item.vote_average as number) || null,
    vote_count: (item.vote_count as number) || null,
    popularity: (item.popularity as number) || null,
  };
}

function extractYear(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const y = parseInt(dateStr.slice(0, 4), 10);
  return isNaN(y) ? null : y;
}
