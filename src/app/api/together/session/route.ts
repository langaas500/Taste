import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { buildWtDeck } from "@/lib/wt-titles";
import type { Mood } from "@/lib/wt-titles";

const VALID_MOODS = new Set<Mood>(["light", "dark", "thriller", "action", "romance", "horror"]);

function generateCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST: Create a new WT session
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdmin();

    // Parse mood from body
    let mood: Mood | undefined;
    try {
      const body = await req.json();
      if (body.mood && VALID_MOODS.has(body.mood)) mood = body.mood;
    } catch {
      /* no body or invalid JSON — mood stays undefined */
    }

    // Get user exclusions + liked history for title pool
    const [{ data: userTitles }, { data: exclusions }] = await Promise.all([
      admin.from("user_titles").select("tmdb_id, type, sentiment, favorite").eq("user_id", userId),
      admin.from("user_exclusions").select("tmdb_id, type").eq("user_id", userId),
    ]);

    const excludeIds = new Set<string>();
    userTitles?.forEach((t: { tmdb_id: number; type: string }) =>
      excludeIds.add(`${t.tmdb_id}:${t.type}`)
    );
    exclusions?.forEach((t: { tmdb_id: number; type: string }) =>
      excludeIds.add(`${t.tmdb_id}:${t.type}`)
    );

    // Extract seeds and genre frequencies from liked titles
    const seedLiked: { tmdb_id: number; type: "movie" | "tv"; title: string }[] = [];
    const genreCount: Record<number, number> = {};
    const likedTitles = (userTitles || []).filter(
      (t: { sentiment?: string; favorite?: boolean }) =>
        t.sentiment === "liked" || t.favorite
    );

    if (likedTitles.length > 0) {
      const likedIds = likedTitles.map((t: { tmdb_id: number }) => t.tmdb_id);
      const { data: cached } = await admin
        .from("titles_cache")
        .select("tmdb_id, type, title, genres")
        .in("tmdb_id", likedIds.slice(0, 20));

      if (cached && cached.length > 0) {
        for (const c of cached.slice(0, 5)) {
          seedLiked.push({ tmdb_id: c.tmdb_id, type: c.type as "movie" | "tv", title: c.title });
        }
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

    const likedGenreIds = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    // Generate deterministic deck seed for this session
    const deck_seed = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { titles } = await buildWtDeck({
      mood,
      seedLiked,
      excludeIds,
      likedGenreIds,
      limit: 60,
      seed: deck_seed,
    });

    if (titles.length === 0) {
      return NextResponse.json({ error: "Could not fetch titles" }, { status: 500 });
    }

    // Generate unique code (retry on collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await admin
        .from("wt_sessions")
        .select("id")
        .eq("code", code)
        .eq("status", "waiting")
        .maybeSingle();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const { data: session, error } = await admin
      .from("wt_sessions")
      .insert({
        code,
        host_id: userId,
        titles,
        deck_seed,
        status: "waiting",
      })
      .select("id, code, status")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ session: { ...session, titles, deck_seed } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET: Poll session state
export async function GET(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionId = req.nextUrl.searchParams.get("id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const { data: session, error } = await admin
      .from("wt_sessions")
      .select("id, code, host_id, guest_id, match_tmdb_id, match_type, status, updated_at")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== userId && session.guest_id !== userId) {
      return NextResponse.json({ error: "Not part of this session" }, { status: 403 });
    }

    // Read swipes from the atomic wt_session_swipes table
    // guest_id is set for unauthenticated players, user_id for authenticated ones
    const { data: swipeRows } = await admin
      .from("wt_session_swipes")
      .select("user_id, guest_id, tmdb_id, media_type, decision")
      .eq("session_id", sessionId);

    const mySwipes: Record<string, string> = {};
    const partnerSwipes: Record<string, string> = {};
    for (const s of swipeRows || []) {
      const key = `${s.tmdb_id}:${s.media_type}`;
      const swipeOwner = s.user_id ?? s.guest_id;
      if (swipeOwner === userId) {
        mySwipes[key] = s.decision;
      } else {
        partnerSwipes[key] = s.decision;
      }
    }

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        status: session.status,
        partner_joined: !!session.guest_id,
        my_swipes: mySwipes,
        partner_swipes: partnerSwipes,
        match_tmdb_id: session.match_tmdb_id,
        match_type: session.match_type,
        updated_at: session.updated_at,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
