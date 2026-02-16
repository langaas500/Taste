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

/* ── mood → TMDB genre IDs mapping ─────────────────────── */

const MOOD_GENRES: Record<Mood, number[]> = {
  light:    [35, 10749, 10751, 16],       // Comedy, Romance, Family, Animation
  dark:     [18, 80, 9648, 10752],         // Drama, Crime, Mystery, War
  thriller: [53, 9648, 80],                // Thriller, Mystery, Crime
  action:   [28, 12, 878, 10759],          // Action, Adventure, Sci-Fi, Action&Adventure(TV)
  romance:  [10749, 18, 35],               // Romance, Drama, Comedy
  horror:   [27, 53, 9648],                // Horror, Thriller, Mystery
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

const MIN_YEAR = 1990;
const POOL_SIZE = 15;

const QUALITY = {
  minVoteMovie: 300,
  minVoteTv: 200,
  minRating: 6.5,
  minPopularity: 10,
} as const;

// Preferred mainstream languages
const MAINSTREAM_LANGS = new Set(["en", "no", "sv", "da"]);

// Preferred origin countries for TV
const MAINSTREAM_COUNTRIES = new Set(["US", "GB", "CA", "AU", "NO", "SE", "DK"]);

// Hard-blocked languages (Bollywood / Indian cinema)
const BLOCKED_LANGS = new Set(["hi", "ta", "te", "ml", "kn", "pa", "bn", "mr"]);

/* ── internal scored type with metadata ────────────────── */

type Scored = WTTitle & {
  score: number;
  lang: string;
  countries: string[];
  voteCount: number;
};

/* ── mainstream filter with fallback cascade ────────────── */

interface FilterOpts {
  minVoteMovie: number;
  minVoteTv: number;
  minRating: number;
  langFilter: boolean;
  countryFilter: boolean;
}

function applyFilters(pool: Scored[], opts: FilterOpts): Scored[] {
  return pool.filter((item) => {
    const minVotes = item.type === "movie" ? opts.minVoteMovie : opts.minVoteTv;
    if (item.voteCount < minVotes) return false;
    if ((item.vote_average || 0) < opts.minRating) return false;
    if (opts.langFilter && !MAINSTREAM_LANGS.has(item.lang)) return false;
    if (opts.countryFilter && item.type === "tv" && item.countries.length > 0) {
      if (!item.countries.some((c) => MAINSTREAM_COUNTRIES.has(c))) return false;
    }
    return true;
  });
}

/* ── main fetch function ───────────────────────────────── */

export async function fetchWTTitles(options: FetchWTOptions = {}): Promise<WTTitle[]> {
  const { mood, seedLiked = [], excludeIds = new Set(), likedGenreIds = [] } = options;

  const seen = new Set<string>();
  const moodGenreSet = new Set(mood ? MOOD_GENRES[mood] : []);
  const likedGenreSet = new Set(likedGenreIds);

  const pool: Scored[] = [];

  /* ── addItems: hard gates only (quality filtering is post-process) ── */
  const addItems = (
    items: Record<string, unknown>[],
    type: "movie" | "tv",
    reason: string,
    baseScore: number
  ) => {
    for (const item of items || []) {
      // Hard gate: blocked languages
      const lang = (item.original_language as string) || "";
      if (BLOCKED_LANGS.has(lang)) continue;

      // Hard gate: adult content
      if (item.adult === true) continue;

      const parsed = parseTitleFromTMDB(item, type);

      // Hard gate: must have poster
      if (!parsed.poster_path) continue;

      const key = `${parsed.tmdb_id}:${parsed.type}`;
      if (seen.has(key) || excludeIds.has(key)) continue;

      // Hard gate: year >= 1990
      if (parsed.year && parsed.year < MIN_YEAR) continue;

      // Hard gate: popularity >= 10 (if available)
      const popularity = (item.popularity as number) ?? null;
      if (popularity != null && popularity < QUALITY.minPopularity) continue;

      seen.add(key);

      const genreIds = Array.isArray(parsed.genres)
        ? (parsed.genres as (number | { id: number })[])
            .map((g) => (typeof g === "number" ? g : g.id))
            .filter(Boolean)
        : [];

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
      });
    }
  };

  // ── 1. Seed-based recommendations ─────────────────────
  if (seedLiked.length > 0) {
    const seeds = seedLiked.slice(0, 5);
    const recResults = await Promise.all(
      seeds.map(async (seed) => {
        try {
          const data = await tmdbSimilar(seed.tmdb_id, seed.type);
          return { results: data.results || [], type: seed.type, seedTitle: seed.title };
        } catch {
          return { results: [], type: seed.type, seedTitle: seed.title };
        }
      })
    );
    for (const { results, type, seedTitle } of recResults) {
      addItems(results, type, `Ligner på «${seedTitle}»`, 4);
    }
  }

  // ── 2. Mood-matched discover ──────────────────────────
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
      }),
      tmdbDiscover("tv", {
        with_genres: genreStr,
        sort_by: "popularity.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteTv),
        "first_air_date.gte": `${MIN_YEAR}-01-01`,
      }),
    ]);

    addItems(moodMovies.results, "movie", `${moodLabel}-stemning`, 3);
    addItems(moodTv.results, "tv", `${moodLabel}-stemning`, 3);
  }

  // ── 3. Trending wildcard ──────────────────────────────
  const [trendingMovies, trendingTv] = await Promise.all([
    tmdbTrending("movie", "week"),
    tmdbTrending("tv", "week"),
  ]);
  addItems(trendingMovies.results, "movie", "Populær akkurat nå", 0);
  addItems(trendingTv.results, "tv", "Populær akkurat nå", 0);

  // ── 4. Top-rated fallback if pool is thin ─────────────
  if (pool.length < POOL_SIZE * 2) {
    const [topMovies, topTv] = await Promise.all([
      tmdbDiscover("movie", {
        sort_by: "vote_count.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteMovie),
        "primary_release_date.gte": `${MIN_YEAR}-01-01`,
      }),
      tmdbDiscover("tv", {
        sort_by: "vote_count.desc",
        "vote_average.gte": String(QUALITY.minRating),
        "vote_count.gte": String(QUALITY.minVoteTv),
        "first_air_date.gte": `${MIN_YEAR}-01-01`,
      }),
    ]);
    addItems(topMovies.results, "movie", "Høyt rangert", 1);
    addItems(topTv.results, "tv", "Høyt rangert", 1);
  }

  // ── 5. Post-process: mainstream filter with fallback cascade ──

  const reducedVoteMovie = Math.round(QUALITY.minVoteMovie * 0.7);
  const reducedVoteTv = Math.round(QUALITY.minVoteTv * 0.7);

  // Tier 1: mainstream lang + origin country + full quality
  let filtered = applyFilters(pool, {
    minVoteMovie: QUALITY.minVoteMovie,
    minVoteTv: QUALITY.minVoteTv,
    minRating: QUALITY.minRating,
    langFilter: true,
    countryFilter: true,
  });

  // Tier 2: drop origin country filter
  if (filtered.length < POOL_SIZE) {
    filtered = applyFilters(pool, {
      minVoteMovie: QUALITY.minVoteMovie,
      minVoteTv: QUALITY.minVoteTv,
      minRating: QUALITY.minRating,
      langFilter: true,
      countryFilter: false,
    });
  }

  // Tier 3: lower vote thresholds by 30%
  if (filtered.length < POOL_SIZE) {
    filtered = applyFilters(pool, {
      minVoteMovie: reducedVoteMovie,
      minVoteTv: reducedVoteTv,
      minRating: QUALITY.minRating,
      langFilter: true,
      countryFilter: false,
    });
  }

  // Tier 4: allow any language, label non-mainstream as international
  if (filtered.length < POOL_SIZE) {
    const mainstreamIds = new Set(filtered.map((f) => f.tmdb_id));

    filtered = applyFilters(pool, {
      minVoteMovie: reducedVoteMovie,
      minVoteTv: reducedVoteTv,
      minRating: QUALITY.minRating,
      langFilter: false,
      countryFilter: false,
    });

    for (const item of filtered) {
      if (!mainstreamIds.has(item.tmdb_id) && !MAINSTREAM_LANGS.has(item.lang)) {
        item.reason = "Internasjonal anbefaling";
      }
    }
  }

  // ── 6. Sort by score, shuffle within score bands ──────
  filtered.sort((a, b) => b.score - a.score);

  let i = 0;
  while (i < filtered.length) {
    let j = i;
    while (j < filtered.length && filtered[j].score === filtered[i].score) j++;
    for (let k = j - 1; k > i; k--) {
      const r = i + Math.floor(Math.random() * (k - i + 1));
      [filtered[k], filtered[r]] = [filtered[r], filtered[k]];
    }
    i = j;
  }

  // Strip internal metadata, return clean WTTitle[]
  return filtered.slice(0, POOL_SIZE).map(
    ({ score: _, lang: _l, countries: _c, voteCount: _v, ...t }) => t
  );
}
