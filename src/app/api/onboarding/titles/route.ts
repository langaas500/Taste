import { NextResponse } from "next/server";
import { tmdbTrending, tmdbDiscover } from "@/lib/tmdb";

export async function GET() {
  try {
    // Fetch a diverse mix of popular titles from TMDB
    const [trending, topMovies, topTv, actionMovies, comedyTv, dramaMovies, scifiMovies] =
      await Promise.all([
        tmdbTrending("all", "week"),
        tmdbDiscover("movie", { sort_by: "vote_count.desc", "vote_average.gte": "7.5", page: "1" }),
        tmdbDiscover("tv", { sort_by: "vote_count.desc", "vote_average.gte": "8", page: "1" }),
        tmdbDiscover("movie", { with_genres: "28", sort_by: "popularity.desc", page: "1" }),
        tmdbDiscover("tv", { with_genres: "35", sort_by: "popularity.desc", page: "1" }),
        tmdbDiscover("movie", { with_genres: "18", sort_by: "vote_count.desc", page: "1" }),
        tmdbDiscover("movie", { with_genres: "878", sort_by: "popularity.desc", page: "1" }),
      ]);

    // Merge and deduplicate
    const seen = new Set<string>();
    const titles: {
      tmdb_id: number;
      type: "movie" | "tv";
      title: string;
      poster_path: string | null;
      year: string;
    }[] = [];

    function addItems(
      items: Record<string, unknown>[],
      fallbackType?: "movie" | "tv"
    ) {
      for (const item of items) {
        const isMovie =
          fallbackType === "movie" ||
          item.media_type === "movie" ||
          (!!item.title && !item.name);
        const type: "movie" | "tv" = isMovie ? "movie" : "tv";
        const id = item.id as number;
        const key = `${id}:${type}`;

        if (seen.has(key)) continue;
        if (!item.poster_path) continue;

        seen.add(key);
        titles.push({
          tmdb_id: id,
          type,
          title: (isMovie ? item.title : item.name) as string,
          poster_path: item.poster_path as string,
          year: ((isMovie ? item.release_date : item.first_air_date) as string || "").slice(0, 4),
        });
      }
    }

    addItems(trending.results || []);
    addItems((topMovies.results || []).slice(0, 15), "movie");
    addItems((topTv.results || []).slice(0, 15), "tv");
    addItems((actionMovies.results || []).slice(0, 8), "movie");
    addItems((comedyTv.results || []).slice(0, 8), "tv");
    addItems((dramaMovies.results || []).slice(0, 8), "movie");
    addItems((scifiMovies.results || []).slice(0, 8), "movie");

    // Shuffle for variety
    for (let i = titles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [titles[i], titles[j]] = [titles[j], titles[i]];
    }

    return NextResponse.json({ titles: titles.slice(0, 80) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
