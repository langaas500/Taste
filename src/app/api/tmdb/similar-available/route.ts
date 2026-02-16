import { NextRequest, NextResponse } from "next/server";
import { tmdbSimilar } from "@/lib/tmdb";
import { getWatchProvidersCachedBatch } from "@/lib/watch-providers-cache";

interface SimilarAvailableResult {
  tmdb_id: number;
  type: "movie" | "tv";
  title: string;
  year: number | null;
  poster_path: string | null;
  vote_average: number | null;
  providers: {
    flatrate?: { provider_id: number; provider_name: string; logo_path: string | null }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string | null }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string | null }[];
  };
}

export async function GET(req: NextRequest) {
  try {
    const tmdbId = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type") as "movie" | "tv";
    if (!tmdbId || !type)
      return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.nextUrl.searchParams.get("country") ||
      "NO";

    // 1. Get similar titles from TMDB (1 API call)
    const similarData = await tmdbSimilar(tmdbId, type);
    const candidates = (similarData.results || []).slice(0, 20);

    if (candidates.length === 0)
      return NextResponse.json({ results: [], country });

    // 2. Batch-check providers via cache (1 DB query + minimal TMDB calls)
    const batchItems = candidates.map((c: { id: number }) => ({
      tmdbId: c.id,
      type,
    }));

    const providerMap = await getWatchProvidersCachedBatch({
      items: batchItems,
      country,
    });

    // 3. Filter to those available in the target country
    const available: SimilarAvailableResult[] = [];

    for (let i = 0; i < candidates.length && available.length < 12; i++) {
      const c = candidates[i];
      const key = `${c.id}:${type}`;
      const cached = providerMap.get(key);

      if (!cached?.providers) continue;

      const p = cached.providers as {
        flatrate?: { provider_id: number; provider_name: string; logo_path: string | null }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string | null }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string | null }[];
      };

      const hasStream = p.flatrate?.length || p.rent?.length || p.buy?.length;
      if (!hasStream) continue;

      const isMovie = type === "movie";
      const dateStr = isMovie ? c.release_date : c.first_air_date;
      const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;

      available.push({
        tmdb_id: c.id,
        type,
        title: isMovie ? c.title : c.name,
        year: isNaN(year as number) ? null : year,
        poster_path: c.poster_path || null,
        vote_average: c.vote_average || null,
        providers: {
          flatrate: p.flatrate?.slice(0, 4) || undefined,
          rent: p.rent?.slice(0, 3) || undefined,
          buy: p.buy?.slice(0, 3) || undefined,
        },
      });
    }

    return NextResponse.json({ results: available, country });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
