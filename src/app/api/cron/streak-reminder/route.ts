import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendStreakReminderEmail } from "@/lib/email";

/**
 * GET /api/cron/streak-reminder
 *
 * Daily cron (16:00 UTC = 18:00 CET):
 * Sends streak reminder to users who have a 2+ day streak
 * but haven't logged anything today.
 *
 * Auth: CRON_SECRET header or Vercel cron auth.
 */

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // Find users who logged yesterday but NOT today (streak at risk)
  // Step 1: users who logged yesterday
  const { data: loggedYesterday } = await admin
    .from("user_titles")
    .select("user_id")
    .eq("status", "watched")
    .gte("updated_at", `${yesterday}T00:00:00`)
    .lt("updated_at", `${today}T00:00:00`)
    .limit(1000);

  if (!loggedYesterday || loggedYesterday.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_users_logged_yesterday" });
  }

  const yesterdayUserIds = [...new Set(loggedYesterday.map((r: { user_id: string }) => r.user_id))];

  // Step 2: filter out users who already logged today
  const { data: loggedToday } = await admin
    .from("user_titles")
    .select("user_id")
    .eq("status", "watched")
    .gte("updated_at", `${today}T00:00:00`)
    .in("user_id", yesterdayUserIds.slice(0, 500))
    .limit(1000);

  const todayUserIds = new Set((loggedToday ?? []).map((r: { user_id: string }) => r.user_id));
  const atRiskUserIds = yesterdayUserIds.filter((id) => !todayUserIds.has(id));

  if (atRiskUserIds.length === 0) {
    return NextResponse.json({ sent: 0, reason: "all_users_logged_today" });
  }

  // Step 3: calculate streak for at-risk users (need 2+ days)
  const { data: recentLogs } = await admin
    .from("user_titles")
    .select("user_id, updated_at")
    .eq("status", "watched")
    .gte("updated_at", thirtyDaysAgo)
    .in("user_id", atRiskUserIds.slice(0, 500))
    .order("updated_at", { ascending: false })
    .limit(5000);

  // Group by user → calculate streak
  const userDates = new Map<string, Set<string>>();
  for (const r of recentLogs ?? []) {
    const uid = r.user_id as string;
    if (!userDates.has(uid)) userDates.set(uid, new Set());
    userDates.get(uid)!.add((r.updated_at as string).slice(0, 10));
  }

  const usersWithStreak: { userId: string; streak: number }[] = [];
  for (const [userId, dates] of userDates) {
    // Count consecutive days ending yesterday
    let streak = 0;
    let checkDate = new Date(`${yesterday}T12:00:00Z`);
    while (dates.has(checkDate.toISOString().slice(0, 10))) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
    if (streak >= 2) {
      usersWithStreak.push({ userId, streak });
    }
  }

  if (usersWithStreak.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_streaks_at_risk" });
  }

  // Step 4: fetch profiles + emails and send
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, preferred_locale")
    .in("id", usersWithStreak.map((u) => u.userId));

  type ProfileRow = { id: string; display_name: string | null; preferred_locale: string | null };
  const profileMap = new Map<string, ProfileRow>((profiles ?? []).map((p: ProfileRow) => [p.id, p]));

  let sent = 0;
  for (const { userId, streak } of usersWithStreak) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      const email = authUser?.user?.email;
      if (!email) continue;

      const profile = profileMap.get(userId);
      await sendStreakReminderEmail(
        email,
        profile?.display_name ?? undefined,
        streak,
        profile?.preferred_locale,
      );
      sent++;
    } catch { /* skip individual failures */ }
  }

  return NextResponse.json({ sent, at_risk: usersWithStreak.length });
}
