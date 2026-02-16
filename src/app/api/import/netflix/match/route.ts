import { NextRequest, NextResponse } from "next/server";
import { tmdbSearch } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const type = req.nextUrl.searchParams.get("type") as "movie" | "tv" | null;

  if (!query) {
    return NextResponse.json({ result: null });
  }

  try {
    const searchType = type === "movie" ? "movie" : type === "tv" ? "tv" : "multi";
    const results = await tmdbSearch(query, searchType);
    const first = results?.[0];

    if (!first) {
      return NextResponse.json({ result: null });
    }

    const isMovie = searchType === "movie" || first.media_type === "movie" || !!first.title;

    return NextResponse.json({
      result: {
        id: first.id,
        title: first.title || first.name,
        poster_path: first.poster_path,
        media_type: isMovie ? "movie" : "tv",
        year: (first.release_date || first.first_air_date || "").slice(0, 4),
      },
    });
  } catch {
    return NextResponse.json({ result: null }, { status: 500 });
  }
}
