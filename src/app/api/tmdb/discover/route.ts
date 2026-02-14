import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { tmdbDiscover, tmdbGenres, tmdbProviderList } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const sp = req.nextUrl.searchParams;
    const action = sp.get("action") || "discover";

    if (action === "genres") {
      const type = (sp.get("type") as "movie" | "tv") || "movie";
      const data = await tmdbGenres(type);
      return NextResponse.json({ genres: data.genres });
    }

    if (action === "providers") {
      const type = (sp.get("type") as "movie" | "tv") || "movie";
      const region = sp.get("region") || "NO";
      const data = await tmdbProviderList(type, region);
      return NextResponse.json({ providers: data.results });
    }

    // Discover
    const type = (sp.get("type") as "movie" | "tv") || "movie";
    const params: Record<string, string> = {};

    const forwardParams = [
      "with_genres", "with_watch_providers", "watch_region",
      "primary_release_date.gte", "primary_release_date.lte",
      "first_air_date.gte", "first_air_date.lte",
      "sort_by", "page", "with_cast", "vote_count.gte",
    ];
    for (const key of forwardParams) {
      const val = sp.get(key);
      if (val) params[key] = val;
    }

    const data = await tmdbDiscover(type, params);
    return NextResponse.json({
      results: data.results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
