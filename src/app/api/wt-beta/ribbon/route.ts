import { NextRequest, NextResponse } from "next/server";
import { tmdbTrending, tmdbDiscover } from "@/lib/tmdb";

/* ── quality constants (mirrors wt-titles.ts — never lowered) ── */

const MIN_YEAR = 1990;
const BLOCKED_LANGS = new Set(["hi", "ta", "te", "ml", "kn", "pa", "bn", "mr", "ja"]);
const MAINSTREAM_LANGS = new Set(["en", "no", "sv", "da"]);
const BLOCKED_GENRES = new Set([16]); // animation

function qualityOk(item: Record<string, unknown>, type: "movie" | "tv"): boolean {
  const lang = (item.original_language as string) || "";
  if (BLOCKED_LANGS.has(lang)) return false;
  if (!MAINSTREAM_LANGS.has(lang)) return false;
  if (item.adult === true) return false;

  const genreIds: number[] = Array.isArray(item.genre_ids) ? (item.genre_ids as number[]) : [];
  if (genreIds.some((g) => BLOCKED_GENRES.has(g))) return false;

  const dateStr = (type === "movie" ? item.release_date : item.first_air_date) as string | undefined;
  if (dateStr) {
    const y = parseInt(dateStr.split("-")[0], 10);
    if (!isNaN(y) && y < MIN_YEAR) return false;
  }

  const minVotes = type === "movie" ? 400 : 250;
  if (((item.vote_count as number) || 0) < minVotes) return false;
  if (((item.vote_average as number) || 0) < 6.5) return false;
  if (!item.poster_path) return false;

  return true;
}

export async function GET(req: NextRequest) {
  try {
    const region = (req.headers.get("x-vercel-ip-country") || "US").toUpperCase();

    // Fetch TV + Movie trending separately (not a single mixed call)
    const [tvTrend, movieTrend] = await Promise.all([
      tmdbTrending("tv", "week"),
      tmdbTrending("movie", "week"),
    ]);

    let tvItems = ((tvTrend.results || []) as Record<string, unknown>[]).filter((i) =>
      qualityOk(i, "tv")
    );
    let movieItems = ((movieTrend.results || []) as Record<string, unknown>[]).filter((i) =>
      qualityOk(i, "movie")
    );

    // If trending pool is too thin after filtering, supplement with popular discover
    // (thresholds NOT lowered — same quality gates)
    if (tvItems.length < 10) {
      const extra = await tmdbDiscover("tv", {
        sort_by: "popularity.desc",
        "vote_average.gte": "6.5",
        "vote_count.gte": "250",
        "first_air_date.gte": `${MIN_YEAR}-01-01`,
      });
      const extraOk = ((extra.results || []) as Record<string, unknown>[]).filter((i) =>
        qualityOk(i, "tv")
      );
      tvItems = [...tvItems, ...extraOk].slice(0, 12);
    }

    if (movieItems.length < 5) {
      const extra = await tmdbDiscover("movie", {
        sort_by: "popularity.desc",
        "vote_average.gte": "6.5",
        "vote_count.gte": "400",
        "primary_release_date.gte": `${MIN_YEAR}-01-01`,
      });
      const extraOk = ((extra.results || []) as Record<string, unknown>[]).filter((i) =>
        qualityOk(i, "movie")
      );
      movieItems = [...movieItems, ...extraOk].slice(0, 6);
    }

    // 70 % TV / 30 % Movie — target 14 posters (10 TV + 4 Movie)
    const TV_TARGET = 10;
    const MOVIE_TARGET = 4;

    const tvPosters = tvItems.slice(0, TV_TARGET).map((i) => i.poster_path as string);
    const moviePosters = movieItems.slice(0, MOVIE_TARGET).map((i) => i.poster_path as string);

    // Interleave: insert 1 movie roughly every 3 TV items
    const posters: string[] = [];
    const mq = [...moviePosters];
    for (let i = 0; i < tvPosters.length; i++) {
      posters.push(tvPosters[i]);
      if ((i + 1) % 3 === 0 && mq.length > 0) posters.push(mq.shift()!);
    }
    posters.push(...mq);

    return NextResponse.json({ posters, region });
  } catch {
    return NextResponse.json({ posters: [], region: "US" });
  }
}
