// Server-only TMDB API utility

const BASE = "https://api.themoviedb.org/3";

function headers() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function tmdbSearch(query: string, type: "movie" | "tv" | "multi" = "multi") {
  const endpoint = type === "multi" ? "search/multi" : `search/${type}`;
  const res = await fetch(
    `${BASE}/${endpoint}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    { headers: headers() }
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
  const res = await fetch(`${BASE}/${type}/${tmdbId}?language=en-US${append}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`TMDB details error: ${res.status}`);
  return res.json();
}

export async function tmdbExternalIds(tmdbId: number, type: "movie" | "tv") {
  const res = await fetch(`${BASE}/${type}/${tmdbId}/external_ids`, {
    headers: headers(),
  });
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
  const res = await fetch(`${BASE}/discover/${type}?${qs}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`TMDB discover error: ${res.status}`);
  return res.json();
}

export async function tmdbTrending(type: "movie" | "tv" | "all" = "all", window: "day" | "week" = "week") {
  const res = await fetch(`${BASE}/trending/${type}/${window}?language=en-US`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`TMDB trending error: ${res.status}`);
  return res.json();
}

export async function tmdbSimilar(tmdbId: number, type: "movie" | "tv") {
  const res = await fetch(`${BASE}/${type}/${tmdbId}/similar?language=en-US&page=1`, {
    headers: headers(),
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function tmdbWatchProviders(tmdbId: number, type: "movie" | "tv") {
  const res = await fetch(`${BASE}/${type}/${tmdbId}/watch/providers`, {
    headers: headers(),
  });
  if (!res.ok) return { results: {} };
  return res.json();
}

export async function tmdbSearchPerson(query: string, page = 1) {
  const res = await fetch(
    `${BASE}/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB person search error: ${res.status}`);
  return res.json();
}

export async function tmdbPersonCredits(personId: number) {
  const res = await fetch(
    `${BASE}/person/${personId}/combined_credits?language=en-US`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB person credits error: ${res.status}`);
  return res.json();
}

export async function tmdbGenres(type: "movie" | "tv") {
  const res = await fetch(
    `${BASE}/genre/${type}/list?language=en-US`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB genres error: ${res.status}`);
  return res.json();
}

export async function tmdbProviderList(type: "movie" | "tv", region = "NO") {
  const res = await fetch(
    `${BASE}/watch/providers/${type}?language=en-US&watch_region=${region}`,
    { headers: headers() }
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
