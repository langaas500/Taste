import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getWatchProvidersCached } from "@/lib/watch-providers-cache";

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access
    const tmdbId = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type") as "movie" | "tv";
    if (!tmdbId || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    // Try to detect country from headers
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.nextUrl.searchParams.get("country") ||
      "NO";

    const result = await getWatchProvidersCached({ tmdbId, type, country });

    return NextResponse.json({
      country,
      providers: result.providers,
      all_countries: result.allCountries,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
