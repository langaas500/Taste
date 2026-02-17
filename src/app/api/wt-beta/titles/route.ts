import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { buildWtDeck } from "@/lib/wt-titles";
import type { Mood } from "@/lib/wt-titles";

const VALID_MOODS = new Set<Mood>(["light", "dark", "thriller", "action", "romance", "horror"]);

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    const moodParam = req.nextUrl.searchParams.get("mood");
    const mood = moodParam && VALID_MOODS.has(moodParam as Mood) ? (moodParam as Mood) : undefined;

    // Region detection — Vercel header, fallback US
    const region = (req.headers.get("x-vercel-ip-country") || "US").toUpperCase();

    // Provider filter — comma-separated TMDB provider IDs from client
    const providersParam = req.nextUrl.searchParams.get("providers");
    const providerIds = providersParam
      ? providersParam.split(",").map(Number).filter(Boolean)
      : [];

    // Content preference — deck weighting
    const prefParam = req.nextUrl.searchParams.get("preference");
    const preference: "series" | "movies" | "mix" =
      prefParam === "movies" || prefParam === "mix" ? prefParam : "series";

    const excludeIds = new Set<string>();
    const seedLiked: { tmdb_id: number; type: "movie" | "tv"; title: string }[] = [];
    const genreCount: Record<number, number> = {};

    if (user) {
      const supabase = await createSupabaseServer();

      const [{ data: userTitles }, { data: exclusions }] = await Promise.all([
        supabase
          .from("user_titles")
          .select("tmdb_id, type, sentiment, favorite")
          .eq("user_id", user.id),
        supabase
          .from("user_exclusions")
          .select("tmdb_id, type")
          .eq("user_id", user.id),
      ]);

      userTitles?.forEach((t: { tmdb_id: number; type: string }) =>
        excludeIds.add(`${t.tmdb_id}:${t.type}`)
      );
      exclusions?.forEach((t: { tmdb_id: number; type: string }) =>
        excludeIds.add(`${t.tmdb_id}:${t.type}`)
      );

      const likedTitles = (userTitles || []).filter(
        (t: { sentiment?: string; favorite?: boolean }) =>
          t.sentiment === "liked" || t.favorite
      );

      if (likedTitles.length > 0) {
        const likedIds = likedTitles.map((t: { tmdb_id: number }) => t.tmdb_id);
        const { data: cached } = await supabase
          .from("titles_cache")
          .select("tmdb_id, type, title, genres")
          .in("tmdb_id", likedIds.slice(0, 20));

        if (cached && cached.length > 0) {
          const seeds = cached.slice(0, 5);
          for (const c of seeds) {
            seedLiked.push({
              tmdb_id: c.tmdb_id,
              type: c.type as "movie" | "tv",
              title: c.title,
            });
          }

          for (const c of cached) {
            const genres = c.genres as { id: number }[] | number[] | null;
            if (Array.isArray(genres)) {
              for (const g of genres) {
                const gid = typeof g === "number" ? g : g.id;
                if (gid) genreCount[gid] = (genreCount[gid] || 0) + 1;
              }
            }
          }
        }
      }
    }

    // Guest: seed recommendations from localStorage-stored likes passed as URL params
    if (!user) {
      const seedLikedParam = req.nextUrl.searchParams.get("seed_liked");
      const likedGenresParam = req.nextUrl.searchParams.get("liked_genres");

      if (seedLikedParam) {
        for (const entry of seedLikedParam.split(",").slice(0, 5)) {
          const parts = entry.split(":");
          const tmdb_id = Number(parts[0]);
          const type = parts[1];
          if (tmdb_id && (type === "movie" || type === "tv")) {
            seedLiked.push({ tmdb_id, type: type as "movie" | "tv", title: "" });
          }
        }
      }

      if (likedGenresParam) {
        for (const gid of likedGenresParam.split(",").slice(0, 5)) {
          const id = Number(gid);
          if (id) genreCount[id] = (genreCount[id] || 0) + 1;
        }
      }
    }

    const likedGenreIds = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    const { titles } = await buildWtDeck({
      mood,
      seedLiked,
      excludeIds,
      likedGenreIds,
      limit: 60,
      region,
      providerIds,
      preference,
    });

    return NextResponse.json({ titles, region });
  } catch (error: unknown) {
    console.error("WT titles error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch titles" },
      { status: 500 }
    );
  }
}
