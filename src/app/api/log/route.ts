import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { tmdb_id, type, status, sentiment, rating, note, watched_at } = body;

    if (!tmdb_id || !type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Upsert user title
    const { data, error } = await supabase
      .from("user_titles")
      .upsert(
        {
          user_id: user.id,
          tmdb_id,
          type,
          status,
          sentiment: sentiment || null,
          rating: rating || null,
          note: note || null,
          watched_at: watched_at || (status === "watched" ? new Date().toISOString() : null),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,tmdb_id,type" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache title in background (fire and forget)
    cacheTitleIfNeeded(tmdb_id, type).catch(() => {});

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
    const { tmdb_id, type } = await req.json();

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

