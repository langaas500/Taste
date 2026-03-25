import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const tmdb_id = typeof body.tmdb_id === "number" ? body.tmdb_id : null;
    const type = body.type === "tv" ? "tv" : "movie";
    const feedback = body.feedback === "liked" ? "liked" : body.feedback === "disliked" ? "disliked" : null;
    if (!tmdb_id || !feedback) {
      return NextResponse.json({ error: "tmdb_id and feedback required" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Upsert: update sentiment if exists, insert as watchlist if not
    const { error } = await supabase
      .from("user_titles")
      .upsert(
        { user_id: user.id, tmdb_id, type, status: "watchlist", sentiment: feedback },
        { onConflict: "user_id,tmdb_id,type" }
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
