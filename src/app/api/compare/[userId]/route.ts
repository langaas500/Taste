import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireUser();
    const { userId: friendId } = await params;
    const supabase = await createSupabaseServer();

    // Verify they are linked
    const { data: links } = await supabase
      .from("account_links")
      .select("id")
      .eq("status", "accepted")
      .or(`and(inviter_id.eq.${user.id},invitee_id.eq.${friendId}),and(inviter_id.eq.${friendId},invitee_id.eq.${user.id})`);

    if (!links || links.length === 0) {
      return NextResponse.json({ error: "Ikke koblet" }, { status: 403 });
    }

    // Get friend display name
    const { data: friendProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", friendId)
      .single();

    // Get both users' watched titles with sentiment
    const [{ data: myTitles }, { data: friendTitles }] = await Promise.all([
      supabase
        .from("user_titles")
        .select("tmdb_id, type, sentiment, favorite")
        .eq("user_id", user.id)
        .eq("status", "watched"),
      supabase
        .from("user_titles")
        .select("tmdb_id, type, sentiment, favorite")
        .eq("user_id", friendId)
        .eq("status", "watched"),
    ]);

    const mySet = new Map<string, { sentiment: string | null; favorite: boolean | null }>();
    for (const t of (myTitles || []) as { tmdb_id: number; type: string; sentiment: string | null; favorite: boolean | null }[]) {
      mySet.set(`${t.tmdb_id}:${t.type}`, { sentiment: t.sentiment, favorite: t.favorite });
    }

    const friendSet = new Map<string, { sentiment: string | null; favorite: boolean | null }>();
    for (const t of (friendTitles || []) as { tmdb_id: number; type: string; sentiment: string | null; favorite: boolean | null }[]) {
      friendSet.set(`${t.tmdb_id}:${t.type}`, { sentiment: t.sentiment, favorite: t.favorite });
    }

    // Find overlaps
    const bothWatched: { key: string; mySentiment: string | null; friendSentiment: string | null }[] = [];
    const onlyMe: string[] = [];
    const onlyFriend: string[] = [];

    for (const [key, val] of mySet) {
      if (friendSet.has(key)) {
        bothWatched.push({ key, mySentiment: val.sentiment, friendSentiment: friendSet.get(key)!.sentiment });
      } else {
        onlyMe.push(key);
      }
    }
    for (const key of friendSet.keys()) {
      if (!mySet.has(key)) onlyFriend.push(key);
    }

    // Calculate agreement
    let agree = 0;
    let disagree = 0;
    for (const b of bothWatched) {
      if (b.mySentiment && b.friendSentiment) {
        if (b.mySentiment === b.friendSentiment) agree++;
        else disagree++;
      }
    }
    const totalRated = agree + disagree;
    const matchPercent = totalRated > 0 ? Math.round((agree / totalRated) * 100) : null;

    // Enrich overlap titles with cache data
    const allKeys = [...bothWatched.map((b) => b.key), ...onlyMe.slice(0, 10), ...onlyFriend.slice(0, 10)];
    const tmdbIds = [...new Set(allKeys.map((k) => parseInt(k.split(":")[0])))];

    let cacheMap: Record<string, { title: string; poster_path: string | null; year: number | null }> = {};
    if (tmdbIds.length > 0) {
      const { data: cached } = await supabase
        .from("titles_cache")
        .select("tmdb_id, type, title, poster_path, year")
        .in("tmdb_id", tmdbIds);

      for (const c of (cached || []) as { tmdb_id: number; type: string; title: string; poster_path: string | null; year: number | null }[]) {
        cacheMap[`${c.tmdb_id}:${c.type}`] = { title: c.title, poster_path: c.poster_path, year: c.year };
      }
    }

    return NextResponse.json({
      friendName: friendProfile?.display_name || "Venn",
      matchPercent,
      stats: {
        myTotal: mySet.size,
        friendTotal: friendSet.size,
        bothWatched: bothWatched.length,
        agree,
        disagree,
      },
      sharedLiked: bothWatched
        .filter((b) => b.mySentiment === "liked" && b.friendSentiment === "liked")
        .slice(0, 12)
        .map((b) => ({ ...cacheMap[b.key], key: b.key })),
      onlyMe: onlyMe.slice(0, 10).map((k) => ({ ...cacheMap[k], key: k })),
      onlyFriend: onlyFriend.slice(0, 10).map((k) => ({ ...cacheMap[k], key: k })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
