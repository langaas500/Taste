/* ── constants & types for Watch Together ──────────────── */

export const RED = "#ff2a2a";
export const TITLES_CACHE_KEY = "wt_titles_v3";
export const GUEST_PROFILE_KEY = "wt_guest_profile_v1";
export const ROUND1_LIMIT = 25;
export const ROUND2_LIMIT = 15;
export const ROUND1_DURATION = 120;
export const ROUND2_DURATION = 60;
export const SUPERLIKES_PER_ROUND = 3;

/* ── poster ribbon — static curated palette ─────────────── */

export const RIBBON_COLORS: [string, string][] = [
  ["#8b1a1a", "#4a0a0a"], // crimson       — action/thriller
  ["#1a1a8b", "#0a0a4a"], // navy          — sci-fi/drama
  ["#1a6b25", "#0a3d14"], // forest green  — adventure/nature
  ["#6b1a8b", "#3d0a4a"], // violet        — fantasy/horror
  ["#8b5a1a", "#4a300a"], // amber         — period/western
  ["#1a8b6b", "#0a4a3d"], // teal          — crime/mystery
  ["#8b3a1a", "#4a1e0a"], // sienna        — thriller
  ["#1a3a8b", "#0a1e4a"], // midnight blue — drama
  ["#4a8b1a", "#274a0a"], // olive         — war/history
  ["#8b1a4a", "#4a0a27"], // rose          — romance
  ["#1a8b8b", "#0a4a4a"], // cyan          — sci-fi
  ["#5a3a8b", "#2d1e4a"], // indigo        — mystery
];

/* ── streaming providers ───────────────────────────────── */

export const VIAPLAY_REGIONS = new Set(["NO", "SE", "DK", "FI", "IS"]);

export interface Provider { id: number; name: string; }
export const NORDIC_ONLY_PROVIDERS = new Set([76, 439]); // Viaplay, TV 2 Play
export const US_ONLY_PROVIDERS = new Set([15, 386]);     // Hulu, Peacock

export const PROVIDERS: Provider[] = [
  { id: 8,    name: "Netflix" },
  { id: 9,    name: "Prime Video" },
  { id: 337,  name: "Disney+" },
  { id: 1899, name: "Max" },
  { id: 350,  name: "Apple TV+" },
  { id: 531,  name: "Paramount+" },
  { id: 15,   name: "Hulu" },
  { id: 386,  name: "Peacock" },
  { id: 76,   name: "Viaplay" },
  { id: 439,  name: "TV 2 Play" },
];

export const PROVIDER_URLS: Record<string, string> = {
  netflix:      "https://www.netflix.com/search?q={title}",
  disney:       "https://www.disneyplus.com/search/{title}",
  amazon:       "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title}",
  prime:        "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title}",
  viaplay:      "https://viaplay.com/no/search?query={title}",
  max:          "https://www.max.com/search?q={title}",
  hbo:          "https://www.max.com/search?q={title}",
  apple:        "https://tv.apple.com/search?term={title}",
  paramount:    "https://www.paramountplus.com/search/{title}",
  tv2:          "https://tv2play.no/search?q={title}",
};

/* ── genre map ─────────────────────────────────────────── */

export const GENRE_MAP: Record<number, { name: string; color: string }> = {
  28: { name: "Action", color: "#5a1a1a" },
  12: { name: "Eventyr", color: "#2d5a27" },
  16: { name: "Animasjon", color: "#4a2d5a" },
  35: { name: "Komedie", color: "#5a4a2d" },
  80: { name: "Krim", color: "#1a1a2d" },
  99: { name: "Dokumentar", color: "#3d3d1a" },
  18: { name: "Drama", color: "#2d2d5a" },
  10751: { name: "Familie", color: "#5a2d4a" },
  14: { name: "Fantasy", color: "#1a3d5a" },
  36: { name: "Historie", color: "#3d2d1a" },
  27: { name: "Skrekk", color: "#3d1a1a" },
  10402: { name: "Musikk", color: "#5a1a4a" },
  9648: { name: "Mysterium", color: "#1a2d4a" },
  10749: { name: "Romantikk", color: "#5a2d4a" },
  878: { name: "Sci-Fi", color: "#1a4a5a" },
  53: { name: "Thriller", color: "#2d1a3d" },
  10752: { name: "Krig", color: "#3d1a3d" },
  37: { name: "Western", color: "#5a4a1a" },
  10759: { name: "Action", color: "#5a1a1a" },
  10762: { name: "Barn", color: "#5a2d4a" },
  10763: { name: "Nyheter", color: "#3d3d1a" },
  10764: { name: "Reality", color: "#5a4a2d" },
  10765: { name: "Sci-Fi", color: "#1a4a5a" },
  10766: { name: "Såpe", color: "#5a2d4a" },
  10767: { name: "Prat", color: "#2d5a27" },
  10768: { name: "Krig", color: "#1a1a2d" },
};

/* ── types ─────────────────────────────────────────────── */

export interface WTTitle {
  tmdb_id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv";
  genre_ids: number[];
  overview: string;
  poster_path: string | null;
  vote_average: number | null;
  reason?: string;
}

export interface TitlesCacheEntry {
  titles: WTTitle[];
  mood: string;
  ts: number;
}

export interface GuestProfile {
  liked: { tmdb_id: number; type: "movie" | "tv"; title: string; genre_ids: number[] }[];
}

export type Screen = "intro" | "providers" | "together" | "waiting" | "join";
export type SwipeAction = "like" | "nope" | "meh"; // meh kept for API compat, not used in UI
export type Mode = "solo" | "paired";
export type RoundPhase = "swiping" | "results" | "no-match" | "winner" | "double-super";
export type RitualState = "idle" | "arming" | "countdown" | "done";

export interface RoundMatch {
  title: WTTitle;
  decisionTime: number; // ms — ranking signal only, never shown to user
}

export interface QueuedSwipe {
  clientSwipeId: string;
  sessionId: string;
  tmdbId: number;
  type: "movie" | "tv";
  action: "like" | "nope" | "superlike";
  round: number;
  createdAt: number;
  attempt: number;
  nextRetryAt: number;
  status: "pending" | "inflight" | "ack" | "stuck";
}
