import { NextResponse } from "next/server";
import { tmdbTrending, tmdbDiscover } from "@/lib/tmdb";

interface DiscoveryRow {
  key: string;
  label: string;
  results: unknown[];
}

export async function GET() {
  try {
    const [trending, action, drama, comedy, horror, reality] = await Promise.all([
      tmdbTrending("all", "week"),
      tmdbDiscover("movie", { with_genres: "28", sort_by: "popularity.desc" }),
      tmdbDiscover("tv", { with_genres: "18", sort_by: "popularity.desc" }),
      tmdbDiscover("movie", { with_genres: "35", sort_by: "popularity.desc" }),
      tmdbDiscover("movie", { with_genres: "27", sort_by: "vote_average.desc", "vote_count.gte": "500" }),
      tmdbDiscover("tv", { with_genres: "10764", sort_by: "popularity.desc" }),
    ]);

    const rows: DiscoveryRow[] = [
      { key: "trending", label: "Nye på strømming", results: (trending.results || []).slice(0, 20) },
      { key: "action", label: "Actionfylte favoritter", results: (action.results || []).slice(0, 20) },
      { key: "drama", label: "Drama", results: (drama.results || []).slice(0, 20) },
      { key: "comedy", label: "Komedie", results: (comedy.results || []).slice(0, 20) },
      { key: "horror", label: "Skrekk", results: (horror.results || []).slice(0, 20) },
      { key: "reality", label: "Reality TV", results: (reality.results || []).slice(0, 20) },
    ];

    return NextResponse.json({ rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
