import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { tmdbDiscover, tmdbGenres, tmdbProviderList } from "@/lib/tmdb";
import type { ContentFilters } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(); // allow guest access
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
      "without_genres", "with_original_language",
    ];
    for (const key of forwardParams) {
      const val = sp.get(key);
      if (val) params[key] = val;
    }

    // Apply user content filters if requested
    const applyFilters = sp.get("applyFilters") === "true";
    let contentFilters: ContentFilters = {};

    if (applyFilters && user) {
      const supabase = await createSupabaseServer();
      const { data: profile } = await supabase
        .from("profiles")
        .select("content_filters")
        .eq("id", user.id)
        .single();

      contentFilters = (profile?.content_filters || {}) as ContentFilters;

      // Merge excluded genres into TMDB params
      if (contentFilters.excluded_genres?.length && !params.without_genres) {
        params.without_genres = contentFilters.excluded_genres.join(",");
      }
    }

    const data = await tmdbDiscover(type, params);

    // Post-filter by excluded languages (TMDB doesn't support excluding multiple)
    let results = data.results;
    if (applyFilters && contentFilters.excluded_languages?.length) {
      results = results.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => !contentFilters.excluded_languages!.includes(item.original_language)
      );
    }

    return NextResponse.json({
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
