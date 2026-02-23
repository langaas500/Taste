import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import type { GroupVotesMap } from "@/types/group";

const FINALIST_COUNT = 3;

// POST: Host triggers finalist computation after swiping phase
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const admin = createSupabaseAdmin();

    // Read session (for host check + votes)
    const { data: session, error } = await admin
      .from("group_sessions")
      .select("id, host_user_id, status, votes")
      .eq("id", session_id)
      .single();

    if (error || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.host_user_id !== userId) {
      return NextResponse.json({ error: "Only the host can compute finalists" }, { status: 403 });
    }
    if (session.status !== "swiping") {
      // Already computed — return idempotent success
      return NextResponse.json({ ok: true, status: "already_computed" });
    }

    // Count "liked" votes per item across all participants
    const votes = session.votes as GroupVotesMap;
    const likeCount: Record<string, number> = {};

    for (const userVotes of Object.values(votes)) {
      for (const [key, vote] of Object.entries(userVotes)) {
        if (vote === "liked") {
          likeCount[key] = (likeCount[key] || 0) + 1;
        }
      }
    }

    // Sort by like count desc, take top 3
    const sorted = Object.entries(likeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, FINALIST_COUNT);

    // If fewer than 3 liked, fill with neutral-count items
    if (sorted.length < FINALIST_COUNT) {
      const neutralCount: Record<string, number> = {};
      const alreadyFinalist = new Set(sorted.map(([key]) => key));
      for (const userVotes of Object.values(votes)) {
        for (const [key, vote] of Object.entries(userVotes)) {
          if (alreadyFinalist.has(key)) continue;
          if (vote === "neutral") {
            neutralCount[key] = (neutralCount[key] || 0) + 1;
          }
        }
      }
      const neutralSorted = Object.entries(neutralCount)
        .sort(([, a], [, b]) => b - a);
      for (const entry of neutralSorted) {
        if (sorted.length >= FINALIST_COUNT) break;
        sorted.push(entry);
      }
    }

    const finalistTmdbIds = sorted.map(([key]) => Number(key.split(":")[0]));

    // Atomic CAS: swiping → final_voting
    // If another request already transitioned, this returns 0 rows (no-op).
    const { data: updated, error: rpcError } = await admin.rpc("group_set_finalists", {
      p_session_id: session_id,
      p_finalist_ids: finalistTmdbIds,
    });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    if (!updated || updated.length === 0) {
      // CAS failed — another request already computed finalists
      return NextResponse.json({ ok: true, status: "already_computed" });
    }

    return NextResponse.json({ ok: true, finalist_tmdb_ids: finalistTmdbIds });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
