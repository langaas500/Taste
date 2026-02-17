import { tmdbTrending, tmdbDiscover, tmdbSimilar, parseTitleFromTMDB } from "@/lib/tmdb";

/* ── types ─────────────────────────────────────────────── */

export type Mood = "light" | "dark" | "thriller" | "action" | "romance" | "horror";

export interface WTTitle {
  tmdb_id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv";
  genre_ids: number[];
  overview: string;
  poster_path: string | null;
  vote_average: number | null;
  reason: string;
}

export interface FetchWTOptions {
  mood?: Mood;
  seedLiked?: { tmdb_id: number; type: "movie" | "tv"; title: string }[];
  excludeIds?: Set<string>;
  likedGenreIds?: number[];
}

export interface BuildWtDeckOptions extends FetchWTOptions {
  limit?: number;
  seed?: string;
  region?: string;
  providerIds?: number[];
  preference?: "series" | "movies" | "mix";
}

export interface WtDeckMeta {
  seed: string;
  mood: string | undefined;
}

export interface WtDeckResult {
  titles: WTTitle[];
  meta: WtDeckMeta;
}

/* ── mood → TMDB genre IDs mapping ─────────────────────── */

const MOOD_GENRES: Record<Mood, number[]> = {
  light:    [35, 10749, 10751],            // Comedy, Romance, Family (Animation removed)
  dark:     [18, 80, 9648, 10752],         // Drama, Crime, Mystery, War
  thriller: [53, 9648, 80],                // Thriller, Mystery, Crime
  action:   [28, 12, 878, 10759],          // Action, Adventure, Sci-Fi, Action&Adventure(TV)
  romance:  [10749, 18, 35],               // Romance, Drama, Comedy
  horror:   [27, 53, 9648],               // Horror, Thriller, Mystery
};

const MOOD_LABELS: Record<Mood, string> = {
  light:    "Lett & morsom",
  dark:     "Mørk & intens",
  thriller: "Smart thriller",
  action:   "Action & tempo",
  romance:  "Romantikk",
  horror:   "Skrekk",
};

/* ── quality + mainstream constants ────────────────────── */

const MIN_YEAR = 1995;
const DEFAULT_LIMIT = 60;
const FALLBACK_FETCH_THRESHOLD = 40;

const QUALITY = {
  minVoteMovie: 400,
  minVoteTv:    250,
  minRating:    6.5,
  minPopMovie:  25,
  minPopTv:     20,
} as const;

const MAINSTREAM_LANGS = new Set(["en", "no", "sv", "da"]);

// Hard-blocked languages — never allowed regardless of quality
const BLOCKED_LANGS = new Set(["hi", "ta", "te", "ml", "kn", "pa", "bn", "mr", "ja"]);

// Hard-blocked genres — Animation excluded entirely
const BLOCKED_GENRES = new Set([16]);

/* ── internal scored type ───────────────────────────────── */

type Scored = WTTitle & {
  score: number;
  lang: string;
  countries: string[];
  voteCount: number;
  popularity: number;
};

/* ── strict quality filter (no tiered relaxation) ──────── */

function applyFilters(pool: Scored[]): Scored[] {
  return pool.filter((item) => {
    const minVotes = item.type === "movie" ? QUALITY.minVoteMovie : QUALITY.minVoteTv;
    if (item.voteCount < minVotes) return false;
    if ((item.vote_average || 0) < QUALITY.minRating) return false;
    if (!MAINSTREAM_LANGS.has(item.lang)) return false;
    return true;
  });
}

/* ── main deck builder ─────────────────────────────────── */

export async function buildWtDeck(options: BuildWtDeckOptions = {}): Promise<WtDeckResult> {
  const {
    mood,
    seedLiked = [],
    excludeIds = new Set(),
    likedGenreIds = [],
    limit = DEFAULT_LIMIT,
    seed: inputSeed,
    region = "US",
    providerIds = [],
    preference = "series",
  } = options;

  // Provider filter params — appended to every discover call when set
  const providerParams: Record<string, string> = providerIds.length > 0
    ? { with_watch_providers: providerIds.join("|"), watch_region: region }
    : {};

  const seed = inputSeed ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const seen = new Set<string>();
  const moodGenreSet = new Set(mood ? MOOD_GENRES[mood] : []);
  const likedGenreSet = new Set(likedGenreIds);

  const pool: Scored[] = [];

  /* ── addItems: hard gates first, then score ── */
  const addItems = (
    items: Record<string, unknown>[],
    type: "movie" | "tv",
    reason: string,
    baseScore: number
  ) => {
    for (const item of items || []) {
      const lang = (item.original_language as string) || "";

      // Hard language blocks
      if (BLOCKED_LANGS.has(lang)) continue;
      if (item.adult === true) continue;

      const parsed = parseTitleFromTMDB(item, type);
      if (!parsed.poster_path) continue;

      const key = `${parsed.tmdb_id}:${parsed.type}`;
      if (seen.has(key) || excludeIds.has(key)) continue;

      if (parsed.year && parsed.year < MIN_YEAR) continue;

      // Per-type popularity floor
      const popularity = (item.popularity as number) ?? 0;
      const minPop = type === "movie" ? QUALITY.minPopMovie : QUALITY.minPopTv;
      if (popularity < minPop) continue;

      // Compute genre IDs early — needed for animation gate
      const genreIds = Array.isArray(parsed.genres)
        ? (parsed.genres as (number | { id: number })[])
            .map((g) => (typeof g === "number" ? g : g.id))
            .filter(Boolean)
        : [];

      // Hard animation block
      if (genreIds.some((g) => BLOCKED_GENRES.has(g))) continue;

      seen.add(key);

      let score = baseScore;
      if (moodGenreSet.size > 0) {
        score += genreIds.filter((g) => moodGenreSet.has(g)).length * 3;
      }
      if (likedGenreSet.size > 0) {
        score += genreIds.filter((g) => likedGenreSet.has(g)).length * 2;
      }

      pool.push({
        tmdb_id: parsed.tmdb_id,
        title: parsed.title,
        year: parsed.year,
        type: parsed.type,
        genre_ids: genreIds,
        overview: parsed.overview || "",
        poster_path: parsed.poster_path,
        vote_average: parsed.vote_average,
        reason,
        score,
        lang,
        countries: Array.isArray(item.origin_country)
          ? (item.origin_country as string[])
          : [],
        voteCount: (item.vote_count as number) || 0,
        popularity,
      });
    }
  };

  // ── 1. Seed-based recommendations — score +4 (skipped when provider filter active) ──
  if (seedLiked.length > 0 && providerIds.length === 0) {
    const seeds = seedLiked.slice(0, 5);
    const recResults = await Promise.all(
      seeds.map(async (s) => {
        try {
          const data = await tmdbSimilar(s.tmdb_id, s.type);
          return { results: data.results || [], type: s.type, seedTitle: s.title };
        } catch {
          return { results: [], type: s.type, seedTitle: s.title };
        }
      })
    );
    for (const { results, type, seedTitle } of recResults) {
      addItems(results, type, `Ligner på «${seedTitle}»`, 4);
    }
  }

  // ── 2. Mood-matched discover — score +3 ───────────────────────────
  if (mood) {
    const genreStr = MOOD_GENRES[mood].slice(0, 3).join("|");
    const moodLabel = MOOD_LABELS[mood];

    const [moodMovies, moodTv] = await Promise.all([
      tmdbDiscover("movie", {
        with_genres: genreStr,
        sort_by: "popularity.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteMovie),
        "primary_release_date.gte": `${MIN_YEAR}-01-01`,
        ...providerParams,
      }),
      tmdbDiscover("tv", {
        with_genres: genreStr,
        sort_by: "popularity.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteTv),
        "first_air_date.gte": `${MIN_YEAR}-01-01`,
        ...providerParams,
      }),
    ]);

    addItems(moodMovies.results, "movie", `${moodLabel}-stemning`, 3);
    addItems(moodTv.results, "tv", `${moodLabel}-stemning`, 3);
  }

  // ── 3. Trending this week — score +2 (skipped when provider filter active) ──
  if (providerIds.length === 0) {
    const [trendingMovies, trendingTv] = await Promise.all([
      tmdbTrending("movie", "week"),
      tmdbTrending("tv", "week"),
    ]);
    addItems(trendingMovies.results, "movie", "Populær akkurat nå", 2);
    addItems(trendingTv.results, "tv", "Populær akkurat nå", 2);
  }

  // ── 4. Popular discover — score +1 ────────────────────────────────
  const fetchPopularDiscover = async (page = 1) => {
    const [popMovies, popTv] = await Promise.all([
      tmdbDiscover("movie", {
        sort_by: "popularity.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteMovie),
        "primary_release_date.gte": `${MIN_YEAR}-01-01`,
        page: String(page),
        ...providerParams,
      }),
      tmdbDiscover("tv", {
        sort_by: "popularity.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteTv),
        "first_air_date.gte": `${MIN_YEAR}-01-01`,
        page: String(page),
        ...providerParams,
      }),
    ]);
    addItems(popMovies.results, "movie", "Populær akkurat nå", 1);
    addItems(popTv.results, "tv", "Populær akkurat nå", 1);
  };

  await fetchPopularDiscover(1);

  // ── 5. Thin pool: fetch more pages — never relax thresholds ───────
  if (pool.length < FALLBACK_FETCH_THRESHOLD) {
    await fetchPopularDiscover(2);
  }
  if (pool.length < FALLBACK_FETCH_THRESHOLD) {
    await fetchPopularDiscover(3);
  }

  // ── 6. Strict quality filter ──────────────────────────────────────
  const filtered = applyFilters(pool);

  // ── 7. Separate TV and Movie pools, apply preference weighting ───
  const tvPool = filtered.filter((i) => i.type === "tv");
  const moviePool = filtered.filter((i) => i.type === "movie");

  const sortPool = (p: Scored[]) =>
    p.sort((a, b) => b.score !== a.score ? b.score - a.score : b.popularity - a.popularity);
  sortPool(tvPool);
  sortPool(moviePool);

  // Target counts for each type
  let tvTarget: number, movieTarget: number;
  if (preference === "movies") {
    movieTarget = Math.ceil(limit * 0.70);
    tvTarget = limit - movieTarget;
  } else if (preference === "mix") {
    tvTarget = Math.ceil(limit * 0.50);
    movieTarget = limit - tvTarget;
  } else {
    // "series" — default
    tvTarget = Math.ceil(limit * 0.70);
    movieTarget = limit - tvTarget;
  }

  let tvSlice = tvPool.slice(0, tvTarget);
  let movieSlice = moviePool.slice(0, movieTarget);

  // Fill any shortfall from the other pool (quality filter already applied)
  const tvShortfall = tvTarget - tvSlice.length;
  if (tvShortfall > 0) {
    movieSlice = [...movieSlice, ...moviePool.slice(movieTarget, movieTarget + tvShortfall)];
  }
  const movieShortfall = movieTarget - movieSlice.length;
  if (movieShortfall > 0) {
    tvSlice = [...tvSlice, ...tvPool.slice(tvTarget, tvTarget + movieShortfall)];
  }

  // ── 8. Interleave major (dominant type) and minor into the deck ──
  const majorDeck = preference === "movies" ? movieSlice : tvSlice;
  const minorDeck = preference === "movies" ? tvSlice : movieSlice;
  const step = Math.max(1, Math.round(majorDeck.length / Math.max(1, minorDeck.length)));
  const merged: Scored[] = [];
  let mi = 0;
  for (let i = 0; i < majorDeck.length; i++) {
    merged.push(majorDeck[i]);
    if ((i + 1) % step === 0 && mi < minorDeck.length) merged.push(minorDeck[mi++]);
  }
  while (mi < minorDeck.length) merged.push(minorDeck[mi++]);

  // Strip internal metadata, return clean WTTitle[]
  const titles = merged.slice(0, limit).map(
    ({ score: _s, lang: _l, countries: _c, voteCount: _v, popularity: _p, ...t }) => t
  );

  return { titles, meta: { seed, mood } };
}

/* ── backward-compat wrapper ───────────────────────────── */

export async function fetchWTTitles(options: FetchWTOptions = {}): Promise<WTTitle[]> {
  const result = await buildWtDeck({ ...options, limit: DEFAULT_LIMIT });
  return result.titles;
}
