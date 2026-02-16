import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { fetchWTTitles } from "@/lib/wt-titles";
import type { Mood } from "@/lib/wt-titles";

const VALID_MOODS = new Set<Mood>(["light", "dark", "thriller", "action", "romance", "horror"]);

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    const moodParam = req.nextUrl.searchParams.get("mood");
    const mood = moodParam && VALID_MOODS.has(moodParam as Mood) ? (moodParam as Mood) : undefined;

    const excludeIds = new Set<string>();
    const seedLiked: { tmdb_id: number; type: "movie" | "tv"; title: string }[] = [];
    const genreCount: Record<number, number> = {};

    if (user) {
      const supabase = await createSupabaseServer();

      // Fetch user titles + exclusions + cached metadata for liked titles
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

      // Build exclude set
      userTitles?.forEach((t: { tmdb_id: number; type: string }) =>
        excludeIds.add(`${t.tmdb_id}:${t.type}`)
      );
      exclusions?.forEach((t: { tmdb_id: number; type: string }) =>
        excludeIds.add(`${t.tmdb_id}:${t.type}`)
      );

      // Extract liked titles for seed recommendations
      const likedTitles = (userTitles || []).filter(
        (t: { sentiment?: string; favorite?: boolean }) =>
          t.sentiment === "liked" || t.favorite
      );

      if (likedTitles.length > 0) {
        // Get cached metadata for liked titles (need title + genres)
        const likedIds = likedTitles.map((t: { tmdb_id: number }) => t.tmdb_id);
        const { data: cached } = await supabase
          .from("titles_cache")
          .select("tmdb_id, type, title, genres")
          .in("tmdb_id", likedIds.slice(0, 20));

        if (cached && cached.length > 0) {
          // Pick top 5 seeds (prefer favorites, then recent)
          const seeds = cached.slice(0, 5);
          for (const c of seeds) {
            seedLiked.push({
              tmdb_id: c.tmdb_id,
              type: c.type as "movie" | "tv",
              title: c.title,
            });
          }

          // Count genres across all liked titles for genre preference signal
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

    // Top liked genre IDs (sorted by frequency, top 5)
    const likedGenreIds = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    const titles = await fetchWTTitles({
      mood,
      seedLiked,
      excludeIds,
      likedGenreIds,
    });

    return NextResponse.json({ titles });
  } catch (error: unknown) {
    console.error("WT titles error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch titles" },
      { status: 500 }
    );
  }
}
