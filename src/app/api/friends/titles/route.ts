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
      return NextResponse.json({ overlaps: {} });
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

    // 4. Get partner titles (RLS now allows this for linked users)
    const { data: partnerTitles } = await supabase
      .from("user_titles")
      .select("tmdb_id, type, status, user_id, last_season, last_episode")
      .in("user_id", partnerIds)
      .in("status", ["watched", "watchlist", "watching"]);

    // 5. Build overlap map: { "tmdb_id:type": [{ name, status, progress? }] }
    const overlaps: Record<string, { name: string; status: string; season?: number; episode?: number }[]> = {};

    for (const t of (partnerTitles || []) as { tmdb_id: number; type: string; status: string; user_id: string; last_season: number | null; last_episode: number | null }[]) {
      const key = `${t.tmdb_id}:${t.type}`;
      if (!overlaps[key]) overlaps[key] = [];
      overlaps[key].push({
        name: nameMap[t.user_id] || "Venn",
        status: t.status,
        ...(t.status === "watching" && t.last_season && t.last_episode
          ? { season: t.last_season, episode: t.last_episode }
          : {}),
      });
    }

    return NextResponse.json({ overlaps });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
