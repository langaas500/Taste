import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Submit one final vote (pick one finalist) — atomic via RPC
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, tmdb_id } = await req.json();
    if (!session_id || tmdb_id == null) {
      return NextResponse.json({ error: "Missing session_id or tmdb_id" }, { status: 400 });
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

    // Atomic: set final_votes[userId] = tmdb_id
    // Only succeeds if status = 'final_voting' AND tmdb_id is in finalist_tmdb_ids
    const { data: applied, error: rpcError } = await admin.rpc("group_apply_final_vote", {
      p_session_id: session_id,
      p_user_id: userId,
      p_tmdb_id: tmdb_id,
    });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
    if (!applied) return NextResponse.json({ error: "Vote not applied (session not in final_voting or invalid finalist)" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
