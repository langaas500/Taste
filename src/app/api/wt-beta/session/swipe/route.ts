import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

// POST: Submit a swipe action (atomic — writes to wt_session_swipes)
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { session_id, tmdb_id, type, action } = await req.json();

    if (!session_id || !tmdb_id || !type || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["like", "nope", "meh", "superlike"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Verify user is part of this session and check current match state
    const { data: session, error: fetchError } = await supabase
      .from("wt_sessions")
      .select("id, host_id, guest_id, status, match_tmdb_id")
      .eq("id", session_id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== user.id && session.guest_id !== user.id) {
      return NextResponse.json({ error: "Not part of this session" }, { status: 403 });
    }

    if (session.match_tmdb_id) {
      return NextResponse.json(
        { error: "Session already matched", match: { tmdb_id: session.match_tmdb_id } },
        { status: 200 }
      );
    }

    const isHost = session.host_id === user.id;

    // Atomically upsert the swipe — UNIQUE constraint prevents duplicates
    const { error: swipeError } = await supabase
      .from("wt_session_swipes")
      .upsert(
        {
          session_id,
          user_id: user.id,
          tmdb_id,
          media_type: type,
          decision: action,
        },
        { onConflict: "session_id,user_id,tmdb_id,media_type" }
      );

    if (swipeError) {
      return NextResponse.json({ error: swipeError.message }, { status: 500 });
    }

    // Check for match: query partner's swipe for this title
    let matchFound: { tmdb_id: number; type: string } | null = null;
    let doubleSuperMatch: { tmdb_id: number; type: string } | null = null;

    if (action === "like" || action === "superlike") {
      const partnerId = isHost ? session.guest_id : session.host_id;
      if (partnerId) {
        const { data: partnerSwipe } = await supabase
          .from("wt_session_swipes")
          .select("decision")
          .eq("session_id", session_id)
          .eq("user_id", partnerId)
          .eq("tmdb_id", tmdb_id)
          .eq("media_type", type)
          .maybeSingle();

        if (
          partnerSwipe &&
          (partnerSwipe.decision === "like" || partnerSwipe.decision === "superlike")
        ) {
          matchFound = { tmdb_id, type };
          if (action === "superlike" && partnerSwipe.decision === "superlike") {
            doubleSuperMatch = { tmdb_id, type };
          }
        }
      }
    }

    // Update session: set match or just bump updated_at for partner polling
    if (matchFound) {
      await supabase
        .from("wt_sessions")
        .update({
          match_tmdb_id: matchFound.tmdb_id,
          match_type: matchFound.type,
          status: "matched",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);
    } else {
      await supabase
        .from("wt_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return NextResponse.json({ ok: true, match: matchFound, doubleSuperMatch });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
