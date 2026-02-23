import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Submit a swipe vote for a pool item
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { session_id, tmdb_id, media_type, vote } = body;

    if (!session_id || tmdb_id == null || !media_type || !vote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["liked", "neutral", "disliked"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }
    if (!["movie", "tv"].includes(media_type)) {
      return NextResponse.json({ error: "Invalid media_type" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Verify user is a participant
    const { data: participant } = await admin
      .from("group_session_participants")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Atomic JSONB upsert via RPC
    const key = `${tmdb_id}:${media_type}`;
    const { error: rpcError } = await admin.rpc("group_apply_vote", {
      p_session_id: session_id,
      p_user_id: userId,
      p_key: key,
      p_vote: vote,
    });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    // Read back vote count for this user
    const { data: session } = await admin
      .from("group_sessions")
      .select("votes")
      .eq("id", session_id)
      .single();

    const myVotes = session?.votes?.[userId] as Record<string, string> | undefined;
    const myVoteCount = myVotes ? Object.keys(myVotes).length : 0;

    return NextResponse.json({ ok: true, my_vote_count: myVoteCount });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
