import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendDailyPickEmail } from "@/lib/email";

/**
 * GET /api/cron/daily-pick-email
 *
 * Daily cron (17:00 UTC = 18:00 CET): sends Tonight's Pick email
 * to all users with email_digest = true AND active premium/trial.
 *
 * Batch: max 100 per invocation (Vercel timeout).
 * Auth: CRON_SECRET header or Vercel cron auth.
 */

const BATCH_SIZE = 100;

interface EligibleUser {
  id: string;
  preferred_region: string | null;
}

interface PickRow {
  user_id: string;
  movie_tmdb_id: number | null;
  movie_title: string | null;
  movie_poster_path: string | null;
  movie_match_score: number | null;
  series_tmdb_id: number | null;
  series_title: string | null;
  series_poster_path: string | null;
  series_match_score: number | null;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Find eligible users: email_digest = true
  const { data: users } = await admin
    .from("profiles")
    .select("id, preferred_region")
    .eq("email_digest", true)
    .limit(BATCH_SIZE);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: "no_eligible_users" });
  }

  const eligible: EligibleUser[] = users as EligibleUser[];

  // 2. Batch-fetch today's picks for all eligible users
  const userIds = eligible.map((u) => u.id);
  const { data: picks } = await admin
    .from("couple_picks")
    .select("user_id, movie_tmdb_id, movie_title, movie_poster_path, movie_match_score, series_tmdb_id, series_title, series_poster_path, series_match_score")
    .in("user_id", userIds)
    .eq("generated_at", today);

  const pickMap = new Map<string, PickRow>();
  for (const p of (picks || []) as PickRow[]) {
    pickMap.set(p.user_id, p);
  }

  // 3. Get emails from auth in batch
  const emailMap = new Map<string, string>();
  for (const userId of userIds) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      if (authUser?.user?.email) emailMap.set(userId, authUser.user.email);
    } catch { /* skip */ }
  }

  // 4. Send emails in parallel
  const regionToLocale: Record<string, string> = { NO: "no", SE: "se", DK: "dk", FI: "fi" };

  const promises = eligible.map(async (user) => {
    const email = emailMap.get(user.id);
    if (!email) return "skipped";

    const pick = pickMap.get(user.id);
    if (!pick || (!pick.movie_title && !pick.series_title)) return "no_pick";

    const locale = regionToLocale[user.preferred_region || ""] || "no";

    await sendDailyPickEmail(
      email,
      locale,
      pick.movie_title ? { title: pick.movie_title, poster_path: pick.movie_poster_path, match_score: pick.movie_match_score } : null,
      pick.series_title ? { title: pick.series_title, poster_path: pick.series_poster_path, match_score: pick.series_match_score } : null,
    );
    return "sent";
  });

  const results = await Promise.allSettled(promises);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value === "sent") sent++;
      else skipped++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    sent,
    failed,
    skipped,
    eligible: eligible.length,
    total_digest_users: users.length,
  });
}
