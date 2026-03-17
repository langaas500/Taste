import { GENRE_MAP, TITLES_CACHE_KEY, GUEST_PROFILE_KEY, PROVIDER_URLS, PROVIDERS } from "./constants";
import type { WTTitle, TitlesCacheEntry, GuestProfile, Provider } from "./constants";
import type { Locale } from "../strings";

export function getGenreColor(genre_ids: number[]): string {
  for (const id of genre_ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id].color;
  }
  return "#2d2d5a";
}

export function getGenreName(genre_ids: number[], locale: Locale = "no"): string {
  for (const id of genre_ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id].name;
  }
  if (locale === "no" || locale === "dk") return "Film/Serie";
  if (locale === "se") return "Film/Serie";
  if (locale === "fi") return "Elokuva/Sarja";
  return "Movie/Series";
}

export function generateMockPartner(titles: WTTitle[]): { liked: number[] } {
  const ids = titles.map((t) => t.tmdb_id);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { liked: shuffled.slice(0, Math.ceil(shuffled.length * 0.35)) };
}

export function readTitlesCache(): WTTitle[] {
  try {
    const raw = localStorage.getItem(TITLES_CACHE_KEY);
    if (!raw) return [];
    const entry = JSON.parse(raw) as TitlesCacheEntry;
    if (!Array.isArray(entry.titles)) return [];
    if (Date.now() - (entry.ts || 0) > 24 * 60 * 60 * 1000) return [];
    return entry.titles;
  } catch {
    return [];
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function saveGuestLike(t: WTTitle) {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    const profile: GuestProfile = raw ? JSON.parse(raw) : { liked: [] };
    if (!profile.liked.some((l) => l.tmdb_id === t.tmdb_id)) {
      profile.liked.unshift({ tmdb_id: t.tmdb_id, type: t.type, title: t.title, genre_ids: t.genre_ids });
      if (profile.liked.length > 50) profile.liked = profile.liked.slice(0, 50);
    }
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* storage full */ }
}

export function buildGuestParams(): string {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return "";
    const profile: GuestProfile = JSON.parse(raw);
    if (!profile.liked || profile.liked.length === 0) return "";
    const seeds = profile.liked.slice(0, 5).map((l) => `${l.tmdb_id}:${l.type}`).join(",");
    const genreCount: Record<number, number> = {};
    for (const l of profile.liked) {
      for (const gid of l.genre_ids) {
        genreCount[gid] = (genreCount[gid] || 0) + 1;
      }
    }
    const genres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)
      .join(",");
    const params = new URLSearchParams();
    params.set("seed_liked", seeds);
    if (genres) params.set("liked_genres", genres);
    return params.toString();
  } catch {
    return "";
  }
}

export function getProviderUrl(providerName: string, title: string): string {
  const key = providerName.toLowerCase();
  const encoded = encodeURIComponent(title);
  for (const [k, template] of Object.entries(PROVIDER_URLS)) {
    if (key.includes(k)) return template.replace("{title}", encoded);
  }
  return `https://www.justwatch.com/search?q=${encoded}`;
}

export function getWatchInfo(
  title: string,
  tmdbId: number,
  type: "movie" | "tv",
  selectedProviders: number[],
  actualProviderIds?: number[],
): { url: string; providerName: string | null } {
  if (actualProviderIds && actualProviderIds.length > 0) {
    for (const id of selectedProviders) {
      if (actualProviderIds.includes(id)) {
        const provider = PROVIDERS.find((p: Provider) => p.id === id);
        if (provider) return { url: getProviderUrl(provider.name, title), providerName: provider.name };
      }
    }
    for (const id of actualProviderIds) {
      const provider = PROVIDERS.find((p: Provider) => p.id === id);
      if (provider) return { url: getProviderUrl(provider.name, title), providerName: provider.name };
    }
  }
  for (const id of selectedProviders) {
    const provider = PROVIDERS.find((p: Provider) => p.id === id);
    if (provider) return { url: getProviderUrl(provider.name, title), providerName: provider.name };
  }
  return { url: getProviderUrl("", title), providerName: null };
}

export async function fetchActualProviders(tmdbId: number, type: "movie" | "tv"): Promise<number[]> {
  try {
    const res = await fetch(`/api/tmdb/providers?tmdb_id=${tmdbId}&type=${type}`);
    if (!res.ok) return [];
    const data = await res.json();
    const providers = data.providers;
    if (!providers) return [];
    const flatrate = (providers.flatrate || []) as { provider_id: number }[];
    return flatrate.map((p) => p.provider_id);
  } catch {
    return [];
  }
}
