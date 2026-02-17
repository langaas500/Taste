import { NextRequest, NextResponse } from "next/server";
import { getWtUserId, getUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Submit a swipe action (atomic — writes to wt_session_swipes)
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Determine if caller is an authenticated user or a guest (no auth session)
    const authUser = await getUser();
    const isGuest = !authUser;

    const { session_id, tmdb_id, type, action } = await req.json();

    if (!session_id || !tmdb_id || !type || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["like", "nope", "meh", "superlike"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Verify user is part of this session and check current match state
    const { data: session, error: fetchError } = await admin
      .from("wt_sessions")
      .select("id, host_id, guest_id, status, match_tmdb_id")
      .eq("id", session_id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== userId && session.guest_id !== userId) {
      return NextResponse.json({ error: "Not part of this session" }, { status: 403 });
    }

    if (session.match_tmdb_id) {
      return NextResponse.json(
        { error: "Session already matched", match: { tmdb_id: session.match_tmdb_id } },
        { status: 200 }
      );
    }

    const isHost = session.host_id === userId;

    // Build swipe row — write to user_id for auth users, guest_id for guests
    const swipeRow = isGuest
      ? { session_id, guest_id: userId, user_id: null, tmdb_id, media_type: type, decision: action }
      : { session_id, user_id: userId, guest_id: null, tmdb_id, media_type: type, decision: action };

    // INSERT first; if duplicate (partial unique index hit = 23505) → UPDATE decision
    // Supabase upsert cannot target partial unique indexes, so we do this manually.
    const { error: insertError } = await admin.from("wt_session_swipes").insert(swipeRow);

    if (insertError) {
      if (insertError.code === "23505") {
        // Swipe already exists — update the decision
        const updateQ = admin
          .from("wt_session_swipes")
          .update({ decision: action })
          .eq("session_id", session_id)
          .eq("tmdb_id", tmdb_id)
          .eq("media_type", type);

        const { error: updErr } = isGuest
          ? await updateQ.eq("guest_id", userId)
          : await updateQ.eq("user_id", userId);

        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Check for match: query partner's swipe for this title
    let matchFound: { tmdb_id: number; type: string } | null = null;
    let doubleSuperMatch: { tmdb_id: number; type: string } | null = null;

    if (action === "like" || action === "superlike") {
      const partnerId = isHost ? session.guest_id : session.host_id;
      if (partnerId) {
        const { data: partnerSwipe } = await admin
          .from("wt_session_swipes")
          .select("decision")
          .eq("session_id", session_id)
          .eq("tmdb_id", tmdb_id)
          .eq("media_type", type)
          .or(`user_id.eq.${partnerId},guest_id.eq.${partnerId}`)
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
      await admin
        .from("wt_sessions")
        .update({
          match_tmdb_id: matchFound.tmdb_id,
          match_type: matchFound.type,
          status: "matched",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);
    } else {
      await admin
        .from("wt_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return NextResponse.json({ ok: true, match: matchFound, doubleSuperMatch });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
