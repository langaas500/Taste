import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";
import { generateTasteSummary, type TasteInput } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { tmdb_id, type, status, sentiment, rating, note, watched_at, last_season, last_episode, favorite } = body;

    if (!tmdb_id || !type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    const upsertData: Record<string, unknown> = {
      user_id: user.id,
      tmdb_id,
      type,
      status,
      sentiment: sentiment || null,
      rating: rating || null,
      note: note || null,
      watched_at: watched_at || (status === "watched" ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    };

    if (last_season !== undefined) upsertData.last_season = last_season;
    if (last_episode !== undefined) upsertData.last_episode = last_episode;
    if (favorite !== undefined) upsertData.favorite = favorite;

    const { data, error } = await supabase
      .from("user_titles")
      .upsert(upsertData, { onConflict: "user_id,tmdb_id,type" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    cacheTitleIfNeeded(tmdb_id, type).catch(() => {});

    // Auto-generate taste_summary after 10th watched title (fire-and-forget)
    if (status === "watched") {
      (async () => {
        try {
          const admin = createSupabaseAdmin();
          const { count } = await admin
            .from("user_titles")
            .select("tmdb_id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "watched");
          if (count !== 10) return;

          const { data: profile } = await admin
            .from("profiles")
            .select("taste_summary")
            .eq("id", user.id)
            .single();
          if (profile?.taste_summary) return;

          // Fetch titles for taste input
          const { data: titles } = await admin
            .from("user_titles")
            .select("tmdb_id, type, sentiment")
            .eq("user_id", user.id)
            .eq("status", "watched");
          if (!titles || titles.length === 0) return;

          interface LogTitle { tmdb_id: number; type: string; sentiment: string }
          interface CacheEntry { tmdb_id: number; title: string; type: string; genres: unknown }
          const ids = titles.map((t: LogTitle) => t.tmdb_id);
          const { data: cached } = await admin
            .from("titles_cache")
            .select("tmdb_id, title, type, genres")
            .in("tmdb_id", ids);
          const cacheMap = new Map<string, CacheEntry>((cached || []).map((c: CacheEntry) => [`${c.tmdb_id}:${c.type}`, c]));

          const input: TasteInput = { liked: [], disliked: [], neutral: [], feedbackNotForMe: [] };
          for (const t of titles as LogTitle[]) {
            const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
            if (!c) continue;
            const entry = { title: c.title, type: c.type, genres: Array.isArray(c.genres) ? c.genres as string[] : [] };
            if (t.sentiment === "liked") input.liked.push(entry);
            else if (t.sentiment === "disliked") input.disliked.push(entry);
            else input.neutral.push(entry);
          }

          const summary = await generateTasteSummary(input);
          if (summary.error) return;

          await admin
            .from("profiles")
            .update({
              taste_summary: { ...summary, updatedAt: new Date().toISOString() },
              taste_summary_updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        } catch { /* non-fatal */ }
      })();
    }

    return NextResponse.json({ userTitle: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { tmdb_id, type, ...updates } = body;

    if (!tmdb_id || !type) {
      return NextResponse.json({ error: "Missing tmdb_id or type" }, { status: 400 });
    }

    const VALID_STATUS = new Set(["watched", "watching", "watchlist"]);
    const VALID_SENTIMENT = new Set(["liked", "neutral", "disliked"]);

    const allowed = ["last_season", "last_episode", "favorite", "status", "sentiment"];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (updates[key] !== undefined) patch[key] = updates[key];
    }

    if (patch.status !== undefined && !VALID_STATUS.has(patch.status as string)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    if (patch.sentiment !== undefined && patch.sentiment !== null && !VALID_SENTIMENT.has(patch.sentiment as string)) {
      return NextResponse.json({ error: "Invalid sentiment value" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("user_titles")
      .update(patch)
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdb_id)
      .eq("type", type)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ userTitle: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { tmdb_id, type } = body;

    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("user_titles")
      .delete()
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdb_id)
      .eq("type", type);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
