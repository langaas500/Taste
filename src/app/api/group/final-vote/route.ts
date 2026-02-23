import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Submit one final vote (pick one finalist)
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, tmdb_id } = await req.json();
    if (!session_id || tmdb_id == null) {
      return NextResponse.json({ error: "Missing session_id or tmdb_id" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    const { data: session, error } = await admin
      .from("group_sessions")
      .select("id, status, finalist_tmdb_ids, final_votes")
      .eq("id", session_id)
      .single();

    if (error || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.status !== "final_voting") {
      return NextResponse.json({ error: "Session is not in final voting phase" }, { status: 400 });
    }

    // Verify tmdb_id is a finalist
    const finalists = session.finalist_tmdb_ids as number[];
    if (!finalists.includes(tmdb_id)) {
      return NextResponse.json({ error: "Not a finalist" }, { status: 400 });
    }

    // Verify user is a participant
    const { data: participant } = await admin
      .from("group_session_participants")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Set final_votes[userId] = tmdb_id string
    // Each user sets only their own key, so read-modify-write is safe here.
    const fv = (session.final_votes || {}) as Record<string, string>;
    fv[userId] = String(tmdb_id);

    const { error: updateError } = await admin
      .from("group_sessions")
      .update({ final_votes: fv, updated_at: new Date().toISOString() })
      .eq("id", session_id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
