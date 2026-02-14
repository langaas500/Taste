import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { generateTasteSummary, type TasteInput } from "@/lib/ai";
import type { UserTitle, TitleCache } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Check cached summary
    const { data: profile } = await supabase
      .from("profiles")
      .select("taste_summary, taste_summary_updated_at")
      .eq("id", user.id)
      .single();

    if (profile?.taste_summary) {
      return NextResponse.json({ summary: profile.taste_summary, cached: true });
    }

    return NextResponse.json({ summary: null, cached: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();
    const admin = createSupabaseAdmin();

    // Get user titles
    const { data: userTitles } = await supabase
      .from("user_titles")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "watched");

    const titles = (userTitles || []) as UserTitle[];
    if (titles.length === 0) {
      return NextResponse.json({ error: "No watched titles to analyze" }, { status: 400 });
    }

    // Get cached info
    const tmdbIds = titles.map((t) => t.tmdb_id);
    const { data: cached } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", tmdbIds);

    const cacheMap = new Map<number, TitleCache>();
    for (const c of (cached || []) as TitleCache[]) {
      cacheMap.set(c.tmdb_id, c);
    }

    // Get feedback
    const { data: feedbackData } = await supabase
      .from("user_feedback")
      .select("*")
      .eq("user_id", user.id)
      .eq("feedback", "not_for_me");

    const notForMeTmdbIds = (feedbackData || []).map((f: { tmdb_id: number }) => f.tmdb_id);
    const { data: notForMeCache } = await admin
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", notForMeTmdbIds.length > 0 ? notForMeTmdbIds : [0]);

    // Build input
    const input: TasteInput = {
      liked: titles
        .filter((t) => t.sentiment === "liked")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      disliked: titles
        .filter((t) => t.sentiment === "disliked")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      neutral: titles
        .filter((t) => t.sentiment === "neutral")
        .map((t) => {
          const c = cacheMap.get(t.tmdb_id);
          return {
            title: c?.title || `TMDB:${t.tmdb_id}`,
            type: t.type,
            genres: ((c?.genres || []) as { id: number; name: string }[]).map((g) => g.name),
          };
        }),
      feedbackNotForMe: ((notForMeCache || []) as TitleCache[]).map((c) => ({
        title: c.title,
        type: c.type,
      })),
    };

    const summary = await generateTasteSummary(input);

    // Cache in profile
    await supabase
      .from("profiles")
      .update({
        taste_summary: { ...summary, updatedAt: new Date().toISOString() },
        taste_summary_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ summary, cached: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("Taste summary error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
