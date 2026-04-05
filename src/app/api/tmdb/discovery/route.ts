import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tmdbTrending, tmdbDiscover } from "@/lib/tmdb";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

interface DiscoveryRow {
  key: string;
  label: string;
  results: unknown[];
}

type Loc = "no" | "en" | "dk" | "se" | "fi";

/* ── Genre map: TMDB name → genre_id ────────────────── */
const GENRE_MAP: Record<string, { id: number; labels: Record<Loc, string>; type: "movie" | "tv" }> = {
  Action:              { id: 28,    labels: { no: "Action for deg", en: "Action for you", dk: "Action for dig", se: "Action för dig", fi: "Toimintaa sinulle" }, type: "movie" },
  "Action & Adventure":{ id: 10759, labels: { no: "Action & Eventyr", en: "Action & Adventure", dk: "Action & Eventyr", se: "Action & Äventyr", fi: "Toiminta & Seikkailu" }, type: "tv" },
  Comedy:              { id: 35,    labels: { no: "Komedie du vil like", en: "Comedy you'll like", dk: "Komedie du vil like", se: "Komedi du gillar", fi: "Komediaa sinulle" }, type: "movie" },
  Crime:               { id: 80,    labels: { no: "Krim du ikke har sett", en: "Crime you haven't seen", dk: "Krimi du ikke har set", se: "Krim du inte sett", fi: "Rikoselokuvia sinulle" }, type: "tv" },
  Drama:               { id: 18,    labels: { no: "Drama som treffer", en: "Drama that hits", dk: "Drama der rammer", se: "Drama som träffar", fi: "Koskettavaa draamaa" }, type: "tv" },
  Horror:              { id: 27,    labels: { no: "Skrekk for deg", en: "Horror for you", dk: "Gyser for dig", se: "Skräck för dig", fi: "Kauhua sinulle" }, type: "movie" },
  Romance:             { id: 10749, labels: { no: "Romantikk", en: "Romance", dk: "Romantik", se: "Romantik", fi: "Romantiikkaa" }, type: "movie" },
  "Sci-Fi & Fantasy":  { id: 10765, labels: { no: "Sci-Fi & Fantasy", en: "Sci-Fi & Fantasy", dk: "Sci-Fi & Fantasy", se: "Sci-Fi & Fantasy", fi: "Sci-Fi & Fantasia" }, type: "tv" },
  "Science Fiction":   { id: 878,   labels: { no: "Sci-Fi for deg", en: "Sci-Fi for you", dk: "Sci-Fi for dig", se: "Sci-Fi för dig", fi: "Scifiä sinulle" }, type: "movie" },
  Thriller:            { id: 53,    labels: { no: "Thrillere", en: "Thrillers", dk: "Thrillere", se: "Thrillers", fi: "Jännäreitä" }, type: "movie" },
  Animation:           { id: 16,    labels: { no: "Animasjon", en: "Animation", dk: "Animation", se: "Animation", fi: "Animaatiota" }, type: "movie" },
  Documentary:         { id: 99,    labels: { no: "Dokumentar", en: "Documentary", dk: "Dokumentar", se: "Dokumentär", fi: "Dokumentteja" }, type: "movie" },
  Mystery:             { id: 9648,  labels: { no: "Mysterium", en: "Mystery", dk: "Mysterium", se: "Mysterium", fi: "Mysteerejä" }, type: "movie" },
};

const ROW_LABELS: Record<string, Record<Loc, string>> = {
  trending:  { no: "Nye på strømming", en: "New on streaming", dk: "Nyt på streaming", se: "Nytt på streaming", fi: "Uutta suoratoistossa" },
  action:    { no: "Actionfylte favoritter", en: "Action-packed favorites", dk: "Actionfyldte favoritter", se: "Actionfyllda favoriter", fi: "Toimintasuosikkeja" },
  drama:     { no: "Drama", en: "Drama", dk: "Drama", se: "Drama", fi: "Draamaa" },
  comedy:    { no: "Komedie", en: "Comedy", dk: "Komedie", se: "Komedi", fi: "Komediaa" },
  lifestyle: { no: "Livsstil & Oppussing", en: "Lifestyle & Renovation", dk: "Livsstil & Renovering", se: "Livsstil & Renovering", fi: "Elämäntapa & Remontti" },
  popular:   { no: "Populært nå", en: "Popular now", dk: "Populært nu", se: "Populärt nu", fi: "Suosittua nyt" },
};

export async function GET() {
  try {
    const c = await cookies();
    const loc = (c.get("x-locale")?.value || "en") as Loc;
    const l = (["no", "en", "dk", "se", "fi"].includes(loc) ? loc : "en") as Loc;

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
                return { id: g.id, label: g.labels[l], type: g.type };
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
      { key: "trending", label: ROW_LABELS.trending[l], results: ((results[0] as { results?: unknown[] }).results || []).slice(0, 20) },
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
        { key: "action", label: ROW_LABELS.action[l], results: ((results[1] as { results?: unknown[] }).results || []).slice(0, 20) },
        { key: "drama", label: ROW_LABELS.drama[l], results: ((results[2] as { results?: unknown[] }).results || []).slice(0, 20) },
        { key: "comedy", label: ROW_LABELS.comedy[l], results: ((results[3] as { results?: unknown[] }).results || []).slice(0, 20) },
      );
    }

    // Lifestyle & Renovation row (second-to-last call result)
    const lifestyleResults = ((results[results.length - 2] as { results?: unknown[] }).results || []).slice(0, 20);
    if (lifestyleResults.length > 0) {
      rows.push({
        key: "lifestyle",
        label: ROW_LABELS.lifestyle[l],
        results: lifestyleResults,
      });
    }

    // Popular now (last call result)
    rows.push({
      key: "popular",
      label: ROW_LABELS.popular[l],
      results: ((results[results.length - 1] as { results?: unknown[] }).results || []).slice(0, 20),
    });

    return NextResponse.json({ rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
