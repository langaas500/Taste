// Server-only Trakt API utility

const TRAKT_BASE = "https://api.trakt.tv";

function traktHeaders(accessToken?: string) {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": process.env.TRAKT_CLIENT_ID!,
  };
  if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
  return h;
}

export function getTraktAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TRAKT_CLIENT_ID!,
    redirect_uri: process.env.TRAKT_REDIRECT_URI!,
    state,
  });
  return `${TRAKT_BASE}/oauth/authorize?${params}`;
}

export async function exchangeTraktCode(code: string) {
  const res = await fetch(`${TRAKT_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.TRAKT_CLIENT_ID,
      client_secret: process.env.TRAKT_CLIENT_SECRET,
      redirect_uri: process.env.TRAKT_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Trakt token exchange error: ${res.status}`);
  return res.json();
}

export async function refreshTraktToken(refreshToken: string) {
  const res = await fetch(`${TRAKT_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: process.env.TRAKT_CLIENT_ID,
      client_secret: process.env.TRAKT_CLIENT_SECRET,
      redirect_uri: process.env.TRAKT_REDIRECT_URI,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Trakt refresh error: ${res.status}`);
  return res.json();
}

export interface TraktWatchedItem {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  movie?: { title: string; year: number; ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
  show?: { title: string; year: number; ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
}

export async function getTraktWatched(accessToken: string, type: "movies" | "shows"): Promise<TraktWatchedItem[]> {
  const res = await fetch(`${TRAKT_BASE}/sync/watched/${type}`, {
    headers: traktHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`Trakt watched error: ${res.status}`);
  return res.json();
}

export interface TraktRatingItem {
  rated_at: string;
  rating: number;
  type: string;
  movie?: { title: string; year: number; ids: { trakt: number; tmdb: number } };
  show?: { title: string; year: number; ids: { trakt: number; tmdb: number } };
}

export async function getTraktRatings(accessToken: string, type: "movies" | "shows"): Promise<TraktRatingItem[]> {
  const res = await fetch(`${TRAKT_BASE}/sync/ratings/${type}`, {
    headers: traktHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`Trakt ratings error: ${res.status}`);
  return res.json();
}

export interface TraktWatchlistItem {
  rank: number;
  listed_at: string;
  type: string;
  movie?: { title: string; year: number; ids: { trakt: number; tmdb: number } };
  show?: { title: string; year: number; ids: { trakt: number; tmdb: number } };
}

export async function getTraktWatchlist(accessToken: string, type: "movies" | "shows"): Promise<TraktWatchlistItem[]> {
  const res = await fetch(`${TRAKT_BASE}/sync/watchlist/${type}`, {
    headers: traktHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`Trakt watchlist error: ${res.status}`);
  return res.json();
}

export function ratingToSentiment(rating: number): "liked" | "disliked" | "neutral" {
  if (rating >= 7) return "liked";
  if (rating <= 4) return "disliked";
  return "neutral";
}
