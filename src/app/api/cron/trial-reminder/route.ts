import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendTrialReminderEmail } from "@/lib/email";

/**
 * GET /api/cron/trial-reminder
 *
 * Daily cron (09:00 UTC): sends trial reminder emails.
 * - 2 days left: "Your trial ends in 2 days"
 * - Last day: "Last day of your Logflix trial"
 *
 * Skips users who are already is_premium (paid).
 * Auth: CRON_SECRET header or Vercel cron auth.
 */

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const now = new Date();

  // 2 days left: trial_ends_at between now+1d and now+2d
  const in1d = new Date(now.getTime() + 1 * 86400000).toISOString();
  const in2d = new Date(now.getTime() + 2 * 86400000).toISOString();
  // Last day: trial_ends_at between now and now+1d
  const nowIso = now.toISOString();

  const [{ data: day2Users }, { data: day1Users }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, preferred_locale")
      .eq("is_premium", false)
      .gte("trial_ends_at", in1d)
      .lt("trial_ends_at", in2d)
      .limit(100),
    admin
      .from("profiles")
      .select("id, preferred_locale")
      .eq("is_premium", false)
      .gte("trial_ends_at", nowIso)
      .lt("trial_ends_at", in1d)
      .limit(100),
  ]);

  let sent = 0;

  // Resolve emails and send
  for (const batch of [
    { users: day2Users || [], daysLeft: 2 as const },
    { users: day1Users || [], daysLeft: 1 as const },
  ]) {
    for (const user of batch.users) {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(user.id);
        const email = authUser?.user?.email;
        if (!email) continue;
        await sendTrialReminderEmail(email, batch.daysLeft, user.preferred_locale);
        sent++;
      } catch {
        // Skip individual failures
      }
    }
  }

  return NextResponse.json({ sent, day2: (day2Users || []).length, day1: (day1Users || []).length });
}
