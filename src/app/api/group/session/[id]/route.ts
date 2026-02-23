import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import type { GroupPoolItem, GroupVotesMap, GroupFinalVotesMap } from "@/types/group";
import type { Sentiment } from "@/lib/types";

// GET: Poll group session state
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;
    const admin = createSupabaseAdmin();

    // 1. Fetch session
    const { data: session, error } = await admin
      .from("group_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Fetch participants
    const { data: participants } = await admin
      .from("group_session_participants")
      .select("*")
      .eq("session_id", sessionId);

    // 3. Verify caller is a participant
    const isParticipant = (participants || []).some((p: { user_id: string }) => p.user_id === userId);
    if (!isParticipant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // 4. Extract my votes from JSONB
    const votes = (session.votes || {}) as GroupVotesMap;
    const my_votes = (votes[userId] || {}) as Record<string, Sentiment>;
    const my_vote_count = Object.keys(my_votes).length;

    // 5. Count votes per participant
    const votes_per_participant: Record<string, number> = {};
    for (const [uid, userVotes] of Object.entries(votes)) {
      votes_per_participant[uid] = Object.keys(userVotes).length;
    }

    // 6. Build pool (only during swiping)
    const pool: GroupPoolItem[] | null =
      session.status === "swiping" ? (session.pool as GroupPoolItem[]) : null;

    // 7. Build finalists (only during final_voting)
    let finalists: GroupPoolItem[] | null = null;
    if (session.status === "final_voting" && session.finalist_tmdb_ids?.length) {
      const poolItems = session.pool as GroupPoolItem[];
      finalists = (session.finalist_tmdb_ids as number[])
        .map((id: number) => poolItems.find((p) => p.tmdb_id === id))
        .filter((x): x is GroupPoolItem => !!x);
    }

    // 8. Build final pick (only when completed)
    let final_pick: GroupPoolItem | null = null;
    if (session.status === "completed" && session.final_pick_tmdb_id) {
      const poolItems = session.pool as GroupPoolItem[];
      final_pick = poolItems.find((p) => p.tmdb_id === session.final_pick_tmdb_id) || null;
    }

    // 9. Determine if caller is host
    const is_host = session.host_user_id === userId;

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        host_user_id: session.host_user_id,
        status: session.status,
        media_filter: session.media_filter,
        provider_region: session.provider_region,
        min_participants: session.min_participants,
        finalist_tmdb_ids: session.finalist_tmdb_ids,
        final_pick_tmdb_id: session.final_pick_tmdb_id,
        final_pick_media_type: session.final_pick_media_type,
        final_votes: session.final_votes,
        created_at: session.created_at,
        updated_at: session.updated_at,
      },
      participants: participants || [],
      my_votes,
      my_vote_count,
      votes_per_participant,
      pool,
      finalists,
      final_pick,
      is_host,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
