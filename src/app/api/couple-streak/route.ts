import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/couple-streak
 *
 * Returns weekly Watch Together streak data for the
 * logged-in user's linked partner pair.
 */

const REWARDS: { weeks: number; key: string }[] = [
  { weeks: 4, key: "helgevalg" },
  { weeks: 8, key: "skjulte-perler" },
  { weeks: 12, key: "klassikere" },
];

/** Monday 00:00 UTC of the week containing `date` */
function weekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    // 1. Find accepted partner link
    const { data: link } = await admin
      .from("account_links")
      .select("id, inviter_id, invitee_id")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    if (!link) {
      return NextResponse.json({ error: "No linked partner" }, { status: 404 });
    }

    const partnerId = link.inviter_id === user.id ? link.invitee_id : link.inviter_id;

    // 2. Fetch all matched sessions between this pair (bounded to 200)
    const { data: sessions } = await admin
      .from("wt_sessions")
      .select("created_at")
      .eq("status", "matched")
      .not("match_tmdb_id", "is", null)
      .or(
        `and(host_id.eq.${user.id},guest_id.eq.${partnerId}),and(host_id.eq.${partnerId},guest_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        last_session: null,
        streak_at_risk: false,
        unlocked_rewards: [],
      });
    }

    // 3. Collect unique weeks (Mon-Sun) with at least one match
    const matchWeeks = new Set<string>();
    for (const s of sessions) {
      matchWeeks.add(weekStart(new Date(s.created_at)));
    }

    // Sort weeks descending
    const sortedWeeks = [...matchWeeks].sort((a, b) => b.localeCompare(a));

    // 4. Compute current streak (consecutive weeks from most recent)
    const now = new Date();
    const currentWeek = weekStart(now);
    const lastWeek = weekStart(new Date(now.getTime() - 7 * 86400000));

    let currentStreak = 0;
    // Start from most recent matched week — it must be this week or last week
    if (sortedWeeks[0] === currentWeek || sortedWeeks[0] === lastWeek) {
      let checkWeek = sortedWeeks[0];
      for (const w of sortedWeeks) {
        if (w === checkWeek) {
          currentStreak++;
          // Move to previous week
          const d = new Date(checkWeek + "T00:00:00Z");
          d.setUTCDate(d.getUTCDate() - 7);
          checkWeek = d.toISOString().slice(0, 10);
        }
      }
    }

    // 5. Compute longest streak
    let longestStreak = 0;
    let streak = 1;
    for (let i = 0; i < sortedWeeks.length - 1; i++) {
      const curr = new Date(sortedWeeks[i] + "T00:00:00Z");
      const next = new Date(sortedWeeks[i + 1] + "T00:00:00Z");
      const diffDays = (curr.getTime() - next.getTime()) / 86400000;
      if (diffDays === 7) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak, currentStreak);

    // 6. Streak at risk: current streak > 0 but no session this week yet
    const streakAtRisk = currentStreak > 0 && !matchWeeks.has(currentWeek);

    // 7. Unlocked rewards
    const unlockedRewards = REWARDS
      .filter((r) => longestStreak >= r.weeks)
      .map((r) => r.key);

    return NextResponse.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_session: sessions[0].created_at,
      streak_at_risk: streakAtRisk,
      unlocked_rewards: unlockedRewards,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
