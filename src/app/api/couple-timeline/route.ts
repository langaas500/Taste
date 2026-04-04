import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/couple-timeline
 *
 * Returns a chronological timeline of a couple's shared viewing history:
 * individual watches, Watch Together matches, and milestones.
 */

export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // 1. Find accepted partner link
    const { data: link } = await admin
      .from("account_links")
      .select("id, inviter_id, invitee_id, accepted_at")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    if (!link) {
      return NextResponse.json({ error: "No linked partner" }, { status: 404 });
    }

    const partnerId = link.inviter_id === user.id ? link.invitee_id : link.inviter_id;

    // 2. Fetch profiles + last 90 days of data in parallel
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();

    const [myProfileRes, partnerProfileRes, myTitlesRes, partnerTitlesRes, matchesRes] = await Promise.all([
      admin.from("profiles").select("display_name, is_premium").eq("id", user.id).single(),
      admin.from("profiles").select("display_name").eq("id", partnerId).single(),
      admin
        .from("user_titles")
        .select("tmdb_id, type, sentiment, rating, watched_at, updated_at")
        .eq("user_id", user.id)
        .eq("status", "watched")
        .gte("updated_at", ninetyDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(100),
      admin
        .from("user_titles")
        .select("tmdb_id, type, sentiment, rating, watched_at, updated_at")
        .eq("user_id", partnerId)
        .eq("status", "watched")
        .gte("updated_at", ninetyDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(100),
      admin
        .from("wt_sessions")
        .select("match_tmdb_id, match_type, updated_at")
        .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
        .eq("status", "matched")
        .gte("updated_at", ninetyDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);

    const myProfile = myProfileRes.data;
    const partnerProfile = partnerProfileRes.data;
    const myTitles = (myTitlesRes.data ?? []) as { tmdb_id: number; type: string; sentiment: string | null; rating: number | null; watched_at: string | null; updated_at: string | null }[];
    const partnerTitles = (partnerTitlesRes.data ?? []) as { tmdb_id: number; type: string; sentiment: string | null; rating: number | null; watched_at: string | null; updated_at: string | null }[];
    const wtMatches = (matchesRes.data ?? []) as { match_tmdb_id: number | null; match_type: string | null; updated_at: string | null }[];

    // 3. Fetch all title metadata
    const allIds = new Set([
      ...myTitles.map((t) => t.tmdb_id),
      ...partnerTitles.map((t) => t.tmdb_id),
      ...wtMatches.filter((m) => m.match_tmdb_id).map((m) => m.match_tmdb_id),
    ]);

    const { data: cacheRows } = await admin
      .from("titles_cache")
      .select("tmdb_id, type, title, poster_path")
      .in("tmdb_id", [...allIds]);
    type CacheRow = { tmdb_id: number; type: string; title: string; poster_path: string | null };
    const cache = new Map<string, CacheRow>((cacheRows ?? []).map((r: CacheRow) => [`${r.tmdb_id}:${r.type}`, r]));

    function resolve(id: number, type: string) {
      const c = cache.get(`${id}:${type}`) || cache.get(`${id}:movie`) || cache.get(`${id}:tv`);
      return c ? { title: c.title as string, poster_path: c.poster_path as string | null } : null;
    }

    // 4. Build timeline events
    interface TimelineEvent {
      date: string;
      type: "my_watch" | "partner_watch" | "both_watch" | "wt_match";
      tmdb_id: number;
      media_type: string;
      title: string;
      poster_path: string | null;
      mySentiment?: string | null;
      myRating?: number | null;
      partnerSentiment?: string | null;
      partnerRating?: number | null;
    }

    const events: TimelineEvent[] = [];

    // Track overlap
    const myWatchMap = new Map<string, (typeof myTitles)[0]>();
    for (const t of myTitles) myWatchMap.set(`${t.tmdb_id}:${t.type}`, t);
    const partnerWatchMap = new Map<string, (typeof partnerTitles)[0]>();
    for (const t of partnerTitles) partnerWatchMap.set(`${t.tmdb_id}:${t.type}`, t);

    const addedKeys = new Set<string>();

    // My watches
    for (const t of myTitles) {
      const key = `${t.tmdb_id}:${t.type}`;
      const r = resolve(t.tmdb_id, t.type);
      if (!r) continue;
      const partnerAlso = partnerWatchMap.get(key);
      addedKeys.add(key);
      events.push({
        date: (t.watched_at || t.updated_at || "").slice(0, 10),
        type: partnerAlso ? "both_watch" : "my_watch",
        tmdb_id: t.tmdb_id,
        media_type: t.type,
        title: r.title,
        poster_path: r.poster_path,
        mySentiment: t.sentiment,
        myRating: t.rating,
        partnerSentiment: partnerAlso?.sentiment || null,
        partnerRating: partnerAlso?.rating || null,
      });
    }

    // Partner-only watches
    for (const t of partnerTitles) {
      const key = `${t.tmdb_id}:${t.type}`;
      if (addedKeys.has(key)) continue;
      const r = resolve(t.tmdb_id, t.type);
      if (!r) continue;
      events.push({
        date: (t.watched_at || t.updated_at || "").slice(0, 10),
        type: "partner_watch",
        tmdb_id: t.tmdb_id,
        media_type: t.type,
        title: r.title,
        poster_path: r.poster_path,
        partnerSentiment: t.sentiment,
        partnerRating: t.rating,
      });
    }

    // WT matches
    for (const m of wtMatches) {
      if (!m.match_tmdb_id) continue;
      const r = resolve(m.match_tmdb_id, m.match_type || "movie");
      if (!r) continue;
      events.push({
        date: (m.updated_at || "").slice(0, 10),
        type: "wt_match",
        tmdb_id: m.match_tmdb_id,
        media_type: m.match_type || "movie",
        title: r.title,
        poster_path: r.poster_path,
      });
    }

    // Sort by date descending
    events.sort((a, b) => b.date.localeCompare(a.date));

    // Group by date
    const grouped: { date: string; events: TimelineEvent[] }[] = [];
    for (const ev of events) {
      const last = grouped[grouped.length - 1];
      if (last && last.date === ev.date) {
        last.events.push(ev);
      } else {
        grouped.push({ date: ev.date, events: [ev] });
      }
    }

    return NextResponse.json({
      myName: myProfile?.display_name || null,
      partnerName: partnerProfile?.display_name || null,
      isPremium: !!myProfile?.is_premium,
      linkedSince: link.accepted_at || null,
      timeline: grouped.slice(0, 30),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
