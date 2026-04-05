import { NextResponse } from "next/server";
import { tmdbTrending, tmdbDiscover } from "@/lib/tmdb";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

interface DiscoveryRow {
  key: string;
  label: string;
  results: unknown[];
}

/* ── Genre map: TMDB name → genre_id ────────────────── */
const GENRE_MAP: Record<string, { id: number; labelNo: string; labelEn: string; type: "movie" | "tv" }> = {
  Action: { id: 28, labelNo: "Action for deg", labelEn: "Action for you", type: "movie" },
  "Action & Adventure": { id: 10759, labelNo: "Action & Eventyr", labelEn: "Action & Adventure", type: "tv" },
  Comedy: { id: 35, labelNo: "Komedie du vil like", labelEn: "Comedy you'll like", type: "movie" },
  Crime: { id: 80, labelNo: "Krim du ikke har sett", labelEn: "Crime you haven't seen", type: "tv" },
  Drama: { id: 18, labelNo: "Drama som treffer", labelEn: "Drama that hits", type: "tv" },
  Horror: { id: 27, labelNo: "Skrekk for deg", labelEn: "Horror for you", type: "movie" },
  Romance: { id: 10749, labelNo: "Romantikk", labelEn: "Romance", type: "movie" },
  "Sci-Fi & Fantasy": { id: 10765, labelNo: "Sci-Fi & Fantasy", labelEn: "Sci-Fi & Fantasy", type: "tv" },
  "Science Fiction": { id: 878, labelNo: "Sci-Fi for deg", labelEn: "Sci-Fi for you", type: "movie" },
  Thriller: { id: 53, labelNo: "Thrillere", labelEn: "Thrillers", type: "movie" },
  Animation: { id: 16, labelNo: "Animasjon", labelEn: "Animation", type: "movie" },
  Documentary: { id: 99, labelNo: "Dokumentar", labelEn: "Documentary", type: "movie" },
  Mystery: { id: 9648, labelNo: "Mysterium", labelEn: "Mystery", type: "movie" },
};

export async function GET() {
  try {
    // Try to get personalized genres from user's library
    let personalGenres: { id: number; label: string; type: "movie" | "tv" }[] = [];

    try {
      const user = await getUser();
      if (user) {
        const supabase = await createSupabaseServer();
        // Get user's watched titles
        const { data: userTitles } = await supabase
          .from("user_titles")
          .select("tmdb_id, type")
          .eq("user_id", user.id)
          .in("status", ["watched", "watching"])
          .limit(200);

        if (userTitles && userTitles.length >= 5) {
          // Fetch genres from cache
          const keys = userTitles.map((t: { tmdb_id: number; type: string }) => t.tmdb_id);
          const { data: cached } = await supabase
            .from("titles_cache")
            .select("genres")
            .in("tmdb_id", keys)
            .not("genres", "is", null);

          if (cached && cached.length > 0) {
            // Count genre frequency
            const counts: Record<string, number> = {};
            for (const row of cached) {
              if (!row.genres) continue;
              for (const g of row.genres as { id: number; name: string }[]) {
                if (g.name) counts[g.name] = (counts[g.name] || 0) + 1;
              }
            }

            // Get top 3 genres that exist in our map
            personalGenres = Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .filter(([name]) => GENRE_MAP[name])
              .slice(0, 3)
              .map(([name]) => {
                const g = GENRE_MAP[name];
                return { id: g.id, label: g.labelNo, type: g.type };
              });
          }
        }
      }
    } catch {
      // Auth or DB error — fall through to generic rows
    }

    // Build TMDB calls
    const hasPersonal = personalGenres.length >= 2;

    const calls: Promise<{ results?: unknown[] }>[] = [
      tmdbTrending("all", "week"),
    ];

    if (hasPersonal) {
      // Personalized genre rows
      for (const g of personalGenres) {
        calls.push(
          tmdbDiscover(g.type, {
            with_genres: String(g.id),
            sort_by: "popularity.desc",
            "vote_count.gte": "50",
          })
        );
      }
    } else {
      // Generic fallback rows
      calls.push(
        tmdbDiscover("movie", { with_genres: "28", sort_by: "popularity.desc" }),
        tmdbDiscover("tv", { with_genres: "18", sort_by: "popularity.desc" }),
        tmdbDiscover("movie", { with_genres: "35", sort_by: "popularity.desc" }),
      );
    }

    // Always add "Popular now" at the end
    calls.push(tmdbDiscover("movie", { sort_by: "popularity.desc", "vote_count.gte": "300" }));

    // Lifestyle & Renovation row — keyword-based to catch reality/home shows
    // TMDB keyword IDs: 1376=renovation, 5765=home improvement, 156216=house flipping,
    // 6522=interior design, 15289=home makeover, 2685=cooking, 5009=garden
    const lifestyleKeywords = "1376,5765,156216,6522,15289,2685,5009";
    calls.push(
      tmdbDiscover("tv", {
        with_keywords: lifestyleKeywords,
        sort_by: "popularity.desc",
        "vote_count.gte": "10",
      })
    );

    const results = await Promise.all(calls);

    const rows: DiscoveryRow[] = [
      { key: "trending", label: "Nye på strømming", results: ((results[0] as { results?: unknown[] }).results || []).slice(0, 20) },
    ];

    if (hasPersonal) {
      personalGenres.forEach((g, i) => {
        rows.push({
          key: `personal-${i}`,
          label: g.label,
          results: ((results[1 + i] as { results?: unknown[] }).results || []).slice(0, 20),
        });
      });
    } else {
      rows.push(
        { key: "action", label: "Actionfylte favoritter", results: ((results[1] as { results?: unknown[] }).results || []).slice(0, 20) },
        { key: "drama", label: "Drama", results: ((results[2] as { results?: unknown[] }).results || []).slice(0, 20) },
        { key: "comedy", label: "Komedie", results: ((results[3] as { results?: unknown[] }).results || []).slice(0, 20) },
      );
    }

    // Lifestyle & Renovation row (second-to-last call result)
    const lifestyleResults = ((results[results.length - 2] as { results?: unknown[] }).results || []).slice(0, 20);
    if (lifestyleResults.length > 0) {
      rows.push({
        key: "lifestyle",
        label: "Livsstil & Oppussing",
        results: lifestyleResults,
      });
    }

    // Popular now (last call result)
    rows.push({
      key: "popular",
      label: "Populært nå",
      results: ((results[results.length - 1] as { results?: unknown[] }).results || []).slice(0, 20),
    });

    return NextResponse.json({ rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
