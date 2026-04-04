import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Any participant triggers finalization — pick the winner (atomic)
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { session_id } = body;
    if (!session_id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const admin = createSupabaseAdmin();

    // Verify caller is a participant
    const { data: participant } = await admin
      .from("group_session_participants")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Get host_user_id for tiebreaker
    const { data: session } = await admin
      .from("group_sessions")
      .select("host_user_id")
      .eq("id", session_id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Atomic finalize: vote counting + winner selection + status update all in Postgres
    const { data, error } = await admin.rpc("group_finalize_winner_atomic", {
      p_session_id: session_id,
      p_host_user_id: session.host_user_id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (data?.error === "invalid_status") {
      return NextResponse.json({ error: "Session is not in final voting phase" }, { status: 400 });
    }

    if (data?.status === "already_completed") {
      return NextResponse.json({
        ok: true,
        status: "already_completed",
        winner: {
          tmdb_id: data.winner_tmdb_id,
          media_type: data.winner_media_type,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      winner: {
        tmdb_id: data.winner_tmdb_id,
        media_type: data.winner_media_type,
        title: data.winner_title || "",
        final_vote_count: data.final_vote_count,
        swipe_score: data.swipe_score,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
