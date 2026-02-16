import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // 1. Get all accepted links
    const { data: links } = await supabase
      .from("account_links")
      .select("inviter_id, invitee_id")
      .eq("status", "accepted")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`);

    if (!links || links.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    // 2. Collect partner IDs
    const partnerIds = links.map((l: { inviter_id: string; invitee_id: string }) =>
      l.inviter_id === user.id ? l.invitee_id : l.inviter_id
    );

    // 3. Get partner display names
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", partnerIds);

    const nameMap: Record<string, string> = {};
    for (const p of (profiles || []) as { id: string; display_name: string | null }[]) {
      nameMap[p.id] = p.display_name || "Venn";
    }

    // 4. Get recent partner activity (last 20 titles, sorted by updated_at)
    const { data: recentTitles } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, status, sentiment, user_id, updated_at, favorite")
      .in("user_id", partnerIds)
      .in("status", ["watched", "watchlist", "watching"])
      .order("updated_at", { ascending: false })
      .limit(20);

    if (!recentTitles || recentTitles.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    // 5. Enrich with title cache data
    const tmdbKeys = recentTitles.map((t: { tmdb_id: number; type: string }) => `${t.tmdb_id}:${t.type}`);
    const tmdbIds = [...new Set(recentTitles.map((t: { tmdb_id: number }) => t.tmdb_id))];

    const { data: cached } = await supabase
      .from("titles_cache")
      .select("tmdb_id, type, title, poster_path, year")
      .in("tmdb_id", tmdbIds);

    const cacheMap: Record<string, { title: string; poster_path: string | null; year: number | null }> = {};
    for (const c of (cached || []) as { tmdb_id: number; type: string; title: string; poster_path: string | null; year: number | null }[]) {
      cacheMap[`${c.tmdb_id}:${c.type}`] = { title: c.title, poster_path: c.poster_path, year: c.year };
    }

    // 6. Build activity items
    const activities = recentTitles.map((t: { tmdb_id: number; type: string; status: string; sentiment: string | null; user_id: string; updated_at: string; favorite: boolean | null }) => {
      const key = `${t.tmdb_id}:${t.type}`;
      const cache = cacheMap[key];
      return {
        user_name: nameMap[t.user_id] || "Venn",
        user_id: t.user_id,
        action: t.status,
        sentiment: t.sentiment,
        favorite: t.favorite,
        tmdb_id: t.tmdb_id,
        type: t.type,
        title: cache?.title || null,
        poster_path: cache?.poster_path || null,
        year: cache?.year || null,
        updated_at: t.updated_at,
      };
    });

    return NextResponse.json({ activities });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
