import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { env } from "@/lib/env";

const ADMIN_EMAILS = env.ADMIN_EMAILS;

export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalRes,
      matchedRes,
      activeRes,
      recentSessionsRes,
      topMatchesRes,
    ] = await Promise.all([
      // Total sessions
      admin.from("wt_sessions").select("*", { count: "exact", head: true }),

      // Matched sessions
      admin.from("wt_sessions").select("*", { count: "exact", head: true }).eq("status", "matched"),

      // Active right now
      admin.from("wt_sessions").select("*", { count: "exact", head: true }).in("status", ["waiting", "active"]),

      // Sessions last 7 days (for per-day breakdown)
      admin.from("wt_sessions").select("created_at, status").gte("created_at", sevenDaysAgo).order("created_at", { ascending: true }),

      // Top 10 most matched titles
      admin.from("wt_sessions").select("match_tmdb_id, match_type").not("match_tmdb_id", "is", null).order("created_at", { ascending: false }).limit(500),
    ]);

    // Per-day breakdown for last 7 days
    const perDay: Record<string, { total: number; matched: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      perDay[d.toISOString().slice(0, 10)] = { total: 0, matched: 0 };
    }
    for (const row of (recentSessionsRes.data || []) as { created_at: string; status: string }[]) {
      const day = row.created_at.slice(0, 10);
      if (day in perDay) {
        perDay[day].total++;
        if (row.status === "matched") perDay[day].matched++;
      }
    }

    // Top 10 most matched titles
    const matchCounts: Record<string, { tmdb_id: number; type: string; count: number }> = {};
    for (const row of (topMatchesRes.data || []) as { match_tmdb_id: number; match_type: string }[]) {
      const key = `${row.match_tmdb_id}:${row.match_type}`;
      if (!matchCounts[key]) matchCounts[key] = { tmdb_id: row.match_tmdb_id, type: row.match_type, count: 0 };
      matchCounts[key].count++;
    }
    const topMatches = Object.values(matchCounts).sort((a, b) => b.count - a.count).slice(0, 10);

    // Enrich top matches with title names
    if (topMatches.length > 0) {
      const tmdbIds = topMatches.map((m) => m.tmdb_id);
      const { data: titleRows } = await admin.from("titles_cache").select("tmdb_id, type, title").in("tmdb_id", tmdbIds);
      const titleMap = new Map<string, string>();
      for (const r of (titleRows || []) as { tmdb_id: number; type: string; title: string }[]) {
        titleMap.set(`${r.tmdb_id}:${r.type}`, r.title);
      }
      for (const m of topMatches) {
        (m as Record<string, unknown>).title = titleMap.get(`${m.tmdb_id}:${m.type}`) || `TMDB:${m.tmdb_id}`;
      }
    }

    const total = totalRes.count || 0;
    const matched = matchedRes.count || 0;

    return NextResponse.json({
      total,
      matched,
      match_rate: total > 0 ? Math.round((matched / total) * 1000) / 10 : 0,
      active_now: activeRes.count || 0,
      per_day: perDay,
      top_matches: topMatches,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
