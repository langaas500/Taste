import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import type { GroupPoolItem, GroupVotesMap, GroupFinalVotesMap } from "@/types/group";

// POST: Any participant triggers finalization — pick the winner
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const admin = createSupabaseAdmin();

    const { data: session, error } = await admin
      .from("group_sessions")
      .select("id, host_user_id, status, pool, votes, final_votes, finalist_tmdb_ids, final_pick_tmdb_id, final_pick_media_type")
      .eq("id", session_id)
      .single();

    if (error || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Verify caller is a participant
    const { data: participant } = await admin
      .from("group_session_participants")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // If already completed, return existing winner (idempotent)
    if (session.status === "completed") {
      const poolItems = session.pool as GroupPoolItem[];
      const existingPick = poolItems.find((p) => p.tmdb_id === session.final_pick_tmdb_id);
      return NextResponse.json({
        ok: true,
        status: "already_completed",
        winner: existingPick ? {
          tmdb_id: existingPick.tmdb_id,
          media_type: existingPick.media_type,
          title: existingPick.title,
        } : null,
      });
    }

    if (session.status !== "final_voting") {
      return NextResponse.json({ error: "Session is not in final voting phase" }, { status: 400 });
    }

    const finalVotes = session.final_votes as GroupFinalVotesMap;
    const votes = session.votes as GroupVotesMap;
    const pool = session.pool as GroupPoolItem[];
    const finalistIds = session.finalist_tmdb_ids as number[];

    // Count votes per finalist tmdb_id
    const voteCount: Record<string, number> = {};
    for (const tmdbIdStr of Object.values(finalVotes)) {
      voteCount[tmdbIdStr] = (voteCount[tmdbIdStr] || 0) + 1;
    }

    // Sort finalists by: 1) most final votes, 2) swipe-score (liked count), 3) host pick
    const hostUserId = session.host_user_id;
    const finalistScores = finalistIds.map((tmdbId) => {
      const tmdbStr = String(tmdbId);
      const finalVoteCount = voteCount[tmdbStr] || 0;

      // Swipe-score: count "liked" across all participants
      let swipeScore = 0;
      for (const userVotes of Object.values(votes)) {
        for (const [key, vote] of Object.entries(userVotes)) {
          if (Number(key.split(":")[0]) === tmdbId && vote === "liked") {
            swipeScore++;
          }
        }
      }

      // Host tie-break
      const hostPick = finalVotes[hostUserId] === tmdbStr ? 1 : 0;

      return { tmdbId, finalVoteCount, swipeScore, hostPick };
    });

    finalistScores.sort((a, b) => {
      if (b.finalVoteCount !== a.finalVoteCount) return b.finalVoteCount - a.finalVoteCount;
      if (b.swipeScore !== a.swipeScore) return b.swipeScore - a.swipeScore;
      return b.hostPick - a.hostPick;
    });

    const winner = finalistScores[0];
    if (!winner) return NextResponse.json({ error: "No finalists found" }, { status: 500 });

    // Find winner's media_type from pool
    const winnerItem = pool.find((p) => p.tmdb_id === winner.tmdbId);
    const winnerMediaType = winnerItem?.media_type || "movie";

    // Atomic CAS: final_voting → completed
    const { data: updated, error: rpcError } = await admin.rpc("group_finalize_winner", {
      p_session_id: session_id,
      p_tmdb_id: winner.tmdbId,
      p_media_type: winnerMediaType,
    });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    if (!updated || updated.length === 0) {
      // CAS failed — another request already finalized
      return NextResponse.json({ ok: true, status: "already_completed" });
    }

    return NextResponse.json({
      ok: true,
      winner: {
        tmdb_id: winner.tmdbId,
        media_type: winnerMediaType,
        title: winnerItem?.title || "",
        final_vote_count: winner.finalVoteCount,
        swipe_score: winner.swipeScore,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
