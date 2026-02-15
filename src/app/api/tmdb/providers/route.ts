import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { tmdbWatchProviders } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access
    const tmdbId = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type") as "movie" | "tv";
    if (!tmdbId || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const data = await tmdbWatchProviders(tmdbId, type);

    // Try to detect country from headers
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.nextUrl.searchParams.get("country") ||
      "NO";

    const countryData = data.results?.[country] || null;

    return NextResponse.json({
      country,
      providers: countryData,
      all_countries: Object.keys(data.results || {}),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
