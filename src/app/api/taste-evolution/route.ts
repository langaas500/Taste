import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

interface GenreEntry { id: number; name: string }
interface CrewMember { name: string; job: string }
interface CastMember { name: string; order: number }
interface ProdCountry { iso_3166_1: string; name: string }

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const { data: titles } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, sentiment, rating, watched_at, created_at")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .order("created_at", { ascending: true });

    const rows = titles ?? [];
    if (rows.length < 5) {
      return NextResponse.json({ insufficient: true, count: rows.length });
    }

    // Fetch full cache data including tmdb_payload, mood_tags
    const tmdbIds = [...new Set(rows.map((r) => r.tmdb_id))];
    const { data: cacheRows } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, genres, year, mood_tags, tmdb_payload, poster_path")
      .in("tmdb_id", tmdbIds);

    interface CacheItem {
      title: string; genres: GenreEntry[]; year: number | null;
      moodTags: string[]; directors: string[]; cast: string[];
      countries: string[]; posterPath: string | null;
    }
    const cache = new Map<number, CacheItem>();
    for (const c of cacheRows ?? []) {
      const genres = Array.isArray(c.genres) ? (c.genres as GenreEntry[]).filter((g) => g.name) : [];
      const payload = c.tmdb_payload as Record<string, unknown> | null;
      const credits = payload?.credits as { crew?: CrewMember[]; cast?: CastMember[] } | undefined;
      const directors = (credits?.crew ?? []).filter((m) => m.job === "Director").map((m) => m.name);
      const castNames = (credits?.cast ?? []).sort((a, b) => a.order - b.order).slice(0, 5).map((m) => m.name);
      const countries = ((payload?.production_countries ?? []) as ProdCountry[]).map((c) => c.name);
      cache.set(c.tmdb_id, {
        title: c.title as string,
        genres,
        year: c.year as number | null,
        moodTags: Array.isArray(c.mood_tags) ? c.mood_tags as string[] : [],
        directors,
        cast: castNames,
        countries,
        posterPath: c.poster_path as string | null,
      });
    }

    // ── FASE 1: Core stats ──
    const allGenres: Record<string, number> = {};
    let movieCount = 0, tvCount = 0;
    let likedCount = 0, neutralCount = 0, dislikedCount = 0;
    let ratingSum = 0, ratingCount = 0;
    const decades: Record<string, number> = {};
    const posters: string[] = [];

    for (const r of rows) {
      const c = cache.get(r.tmdb_id);
      if (c) {
        for (const g of c.genres) allGenres[g.name] = (allGenres[g.name] || 0) + 1;
        if (c.year) {
          const dec = `${Math.floor(c.year / 10) * 10}s`;
          decades[dec] = (decades[dec] || 0) + 1;
        }
        if (c.posterPath && posters.length < 20) posters.push(c.posterPath);
      }
      if (r.type === "movie") movieCount++; else tvCount++;
      if (r.sentiment === "liked") likedCount++;
      else if (r.sentiment === "disliked") dislikedCount++;
      else neutralCount++;
      if (r.rating) { ratingSum += r.rating; ratingCount++; }
    }

    const genreBreakdown = Object.entries(allGenres)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / rows.length) * 100) }));

    const decadeBreakdown = Object.entries(decades)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([decade, count]) => ({ decade, count, pct: Math.round((count / rows.length) * 100) }));

    // Watching tempo
    const firstDate = new Date(rows[0].watched_at || rows[0].created_at);
    const monthsActive = Math.max(1, Math.ceil((Date.now() - firstDate.getTime()) / (30 * 86400000)));
    const titlesPerMonth = Math.round((rows.length / monthsActive) * 10) / 10;

    // ── FASE 2: Directors, actors, countries, mood ──
    const directorCount: Record<string, number> = {};
    const actorCount: Record<string, number> = {};
    const countrySet = new Set<string>();
    const moodCount: Record<string, number> = {};

    for (const r of rows) {
      const c = cache.get(r.tmdb_id);
      if (!c) continue;
      for (const d of c.directors) directorCount[d] = (directorCount[d] || 0) + 1;
      for (const a of c.cast) actorCount[a] = (actorCount[a] || 0) + 1;
      for (const co of c.countries) countrySet.add(co);
      for (const m of c.moodTags) moodCount[m] = (moodCount[m] || 0) + 1;
    }

    const topDirectors = Object.entries(directorCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topActors = Object.entries(actorCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);

    // ── FASE 3: Milestones ──
    const milestones: { icon: string; text: string }[] = [];
    const firstCached = cache.get(rows[0].tmdb_id);
    if (firstCached) {
      milestones.push({ icon: "🎬", text: `first:${firstCached.title}:${rows[0].watched_at || rows[0].created_at}` });
    }
    // Genre firsts
    const seenGenres = new Set<string>();
    for (const r of rows) {
      const c = cache.get(r.tmdb_id);
      if (!c) continue;
      for (const g of c.genres) {
        if (!seenGenres.has(g.name)) {
          seenGenres.add(g.name);
          if (["Horror", "Animation", "Documentary", "Western", "War", "Music"].includes(g.name)) {
            milestones.push({ icon: g.name === "Horror" ? "👻" : g.name === "Animation" ? "🎨" : g.name === "Documentary" ? "📹" : g.name === "Western" ? "🤠" : g.name === "War" ? "⚔️" : "🎵", text: `genre:${g.name}:${c.title}` });
          }
        }
      }
    }
    // Count milestones
    if (rows.length >= 10) milestones.push({ icon: "🔟", text: "count:10" });
    if (rows.length >= 25) milestones.push({ icon: "🏅", text: "count:25" });
    if (rows.length >= 50) milestones.push({ icon: "🏆", text: "count:50" });
    if (rows.length >= 100) milestones.push({ icon: "💯", text: "count:100" });
    // Streak
    const dateCounts = new Map<string, number>();
    for (const r of rows) {
      const d = (r.watched_at || r.created_at).slice(0, 10);
      dateCounts.set(d, (dateCounts.get(d) || 0) + 1);
    }
    const sortedDates = [...dateCounts.keys()].sort();
    let maxStreak = 1, currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]).getTime();
      const curr = new Date(sortedDates[i]).getTime();
      if (curr - prev === 86400000) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 1;
    }
    if (maxStreak >= 3) milestones.push({ icon: "🔥", text: `streak:${maxStreak}` });

    // Periods (keep existing logic)
    const MS_3M = 90 * 86400000, MS_6M = 180 * 86400000, MS_12M = 365 * 86400000;
    const buckets = [
      { label: "0-3m", rows: [] as typeof rows },
      { label: "3-6m", rows: [] as typeof rows },
      { label: "6-12m", rows: [] as typeof rows },
      { label: "12m+", rows: [] as typeof rows },
    ];
    const now = Date.now();
    for (const r of rows) {
      const ago = now - new Date(r.watched_at || r.created_at).getTime();
      if (ago <= MS_3M) buckets[0].rows.push(r);
      else if (ago <= MS_6M) buckets[1].rows.push(r);
      else if (ago <= MS_12M) buckets[2].rows.push(r);
      else buckets[3].rows.push(r);
    }
    const periods = buckets
      .filter((b) => b.rows.length > 0)
      .map((b) => {
        const gc: Record<string, number> = {};
        for (const r of b.rows) {
          const c = cache.get(r.tmdb_id);
          if (c) for (const g of c.genres) gc[g.name] = (gc[g.name] || 0) + 1;
        }
        return {
          label: b.label,
          titleCount: b.rows.length,
          topGenres: Object.entries(gc).sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([name, count]) => ({ name, count, pct: Math.round((count / b.rows.length) * 100) })),
        };
      });

    // AI insight
    let aiInsight: string | null = null;
    const { data: profile } = await supabase.from("profiles").select("is_premium, trial_ends_at").eq("id", user.id).single();
    const isPremium = profile?.is_premium || (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

    if (isPremium) {
      try {
        const summary = `${rows.length} titles. Genres: ${genreBreakdown.slice(0, 5).map((g) => `${g.name} ${g.pct}%`).join(", ")}. ${movieCount} movies, ${tvCount} series. Top directors: ${topDirectors.map((d) => d.name).join(", ")}. Moods: ${topMoods.join(", ")}. Countries: ${countrySet.size}. Rating avg: ${ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "N/A"}.`;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001", max_tokens: 150, temperature: 0.8,
            system: "You are a witty film critic writing about someone's taste. Write 2-3 sentences that are insightful, warm, and make the person feel good about their taste. Be specific — reference their actual genres, directors, or patterns. No generic praise.",
            messages: [{ role: "user", content: `Film profile: ${summary}` }],
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) { const d = await res.json(); aiInsight = d?.content?.[0]?.text ?? null; }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      insufficient: false,
      totalTitles: rows.length,
      movieCount, tvCount,
      likedCount, neutralCount, dislikedCount,
      avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
      titlesPerMonth,
      genreBreakdown,
      decadeBreakdown,
      topDirectors,
      topActors,
      countryCount: countrySet.size,
      topMoods,
      milestones: milestones.slice(0, 12),
      periods,
      posters,
      aiInsight,
      isPremium: !!isPremium,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
