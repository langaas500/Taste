import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { safeParseJson } from "@/lib/ai";

interface GenreEntry { id: number; name: string }

interface PeriodData {
  label: string;
  titleCount: number;
  topGenres: { name: string; count: number; pct: number }[];
  avgRating: number | null;
}

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Fetch all watched titles with genres
    const { data: titles } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, sentiment, rating, watched_at, created_at")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .order("created_at", { ascending: true });

    const rows = titles ?? [];
    if (rows.length < 10) {
      return NextResponse.json({ insufficient: true, count: rows.length });
    }

    // Fetch genres from titles_cache
    const tmdbIds = [...new Set(rows.map((r) => r.tmdb_id))];
    const { data: cacheRows } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, genres")
      .in("tmdb_id", tmdbIds);

    const cacheMap = new Map<number, { title: string; genres: GenreEntry[] }>();
    for (const c of cacheRows ?? []) {
      const genres = Array.isArray(c.genres)
        ? (c.genres as GenreEntry[]).filter((g) => g.name)
        : [];
      cacheMap.set(c.tmdb_id, { title: c.title as string, genres });
    }

    // Split into periods
    const now = Date.now();
    const MS_3M = 90 * 86400000;
    const MS_6M = 180 * 86400000;
    const MS_12M = 365 * 86400000;

    const buckets: { label: string; rows: typeof rows }[] = [
      { label: "0-3m", rows: [] },
      { label: "3-6m", rows: [] },
      { label: "6-12m", rows: [] },
      { label: "12m+", rows: [] },
    ];

    for (const r of rows) {
      const ts = new Date(r.watched_at || r.created_at).getTime();
      const ago = now - ts;
      if (ago <= MS_3M) buckets[0].rows.push(r);
      else if (ago <= MS_6M) buckets[1].rows.push(r);
      else if (ago <= MS_12M) buckets[2].rows.push(r);
      else buckets[3].rows.push(r);
    }

    // Compute per period
    function computePeriod(label: string, periodRows: typeof rows): PeriodData {
      const genreCount: Record<string, number> = {};
      let ratingSum = 0;
      let ratingCount = 0;

      for (const r of periodRows) {
        const cached = cacheMap.get(r.tmdb_id);
        if (cached) {
          for (const g of cached.genres) {
            genreCount[g.name] = (genreCount[g.name] || 0) + 1;
          }
        }
        if (r.rating) { ratingSum += r.rating; ratingCount++; }
      }

      const total = periodRows.length;
      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

      return {
        label,
        titleCount: total,
        topGenres,
        avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
      };
    }

    const periods = buckets
      .map((b) => computePeriod(b.label, b.rows))
      .filter((p) => p.titleCount > 0);

    // Find first logged title
    const firstRow = rows[0];
    const firstCached = firstRow ? cacheMap.get(firstRow.tmdb_id) : null;
    const firstTitle = firstCached ? {
      title: firstCached.title,
      date: firstRow.watched_at || firstRow.created_at,
    } : null;

    // Biggest genre shift: compare newest period vs oldest period with data
    let biggestShift: { from: string; to: string } | null = null;
    if (periods.length >= 2) {
      const newest = periods[0];
      const oldest = periods[periods.length - 1];
      if (newest.topGenres[0] && oldest.topGenres[0] && newest.topGenres[0].name !== oldest.topGenres[0].name) {
        biggestShift = { from: oldest.topGenres[0].name, to: newest.topGenres[0].name };
      }
    }

    // AI insight for premium (check profile)
    let aiInsight: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, trial_ends_at")
      .eq("id", user.id)
      .single();

    const isPremium = profile?.is_premium ||
      (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

    if (isPremium && periods.length >= 2) {
      try {
        const evolutionSummary = periods.map((p) =>
          `${p.label}: ${p.titleCount} titles, top genres: ${p.topGenres.map((g) => `${g.name} (${g.pct}%)`).join(", ")}`
        ).join(". ");

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 128,
            temperature: 0.7,
            system: "You are a film taste analyst. Write exactly 1-2 sentences about how this user's taste has evolved. Be warm and insightful. Return only the text, no JSON.",
            messages: [{ role: "user", content: `Taste evolution: ${evolutionSummary}` }],
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          aiInsight = data?.content?.[0]?.text ?? null;
        }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      insufficient: false,
      totalTitles: rows.length,
      periods,
      firstTitle,
      biggestShift,
      aiInsight,
      isPremium: !!isPremium,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
