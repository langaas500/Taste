import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

// POST: Submit a swipe action
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
    const { data: session, error: fetchError } = await supabase
      .from("wt_sessions")
      .select("id, host_id, guest_id, host_swipes, guest_swipes, status, match_tmdb_id")
      .eq("id", session_id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== user.id && session.guest_id !== user.id) {
      return NextResponse.json({ error: "Not part of this session" }, { status: 403 });
    }

    if (session.match_tmdb_id) {
      return NextResponse.json({ error: "Session already matched", match: { tmdb_id: session.match_tmdb_id } }, { status: 200 });
    }

    const isHost = session.host_id === user.id;
    const key = `${tmdb_id}:${type}`;

    // Update swipes
    const mySwipes = isHost
      ? { ...(session.host_swipes as Record<string, string>), [key]: action }
      : session.host_swipes;
    const theirSwipes = !isHost
      ? { ...(session.guest_swipes as Record<string, string>), [key]: action }
      : session.guest_swipes;

    const hostSwipes = isHost ? mySwipes : session.host_swipes;
    const guestSwipes = !isHost ? theirSwipes : session.guest_swipes;

    // Check for match: both liked (or superliked) the same title
    let matchFound: { tmdb_id: number; type: string } | null = null;
    let doubleSuperMatch: { tmdb_id: number; type: string } | null = null;

    if (action === "like" || action === "superlike") {
      const partnerSwipes = isHost
        ? (session.guest_swipes as Record<string, string>)
        : (session.host_swipes as Record<string, string>);

      if (partnerSwipes[key] === "like" || partnerSwipes[key] === "superlike") {
        matchFound = { tmdb_id, type };
        // Double super: both superliked the same title
        if (action === "superlike" && partnerSwipes[key] === "superlike") {
          doubleSuperMatch = { tmdb_id, type };
        }
      }
    }

    const updateData: Record<string, unknown> = {
      host_swipes: hostSwipes,
      guest_swipes: guestSwipes,
      updated_at: new Date().toISOString(),
    };

    if (matchFound) {
      updateData.match_tmdb_id = matchFound.tmdb_id;
      updateData.match_type = matchFound.type;
      updateData.status = "matched";
    }

    const { error: updateError } = await supabase
      .from("wt_sessions")
      .update(updateData)
      .eq("id", session_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      match: matchFound,
      doubleSuperMatch,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
