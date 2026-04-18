import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendFridayPickEmail } from "@/lib/email";

/**
 * GET /api/cron/friday-pick
 *
 * Friday cron (17:00 UTC): sends Tonight's Pick email to
 * both users in premium couples. Fetches or generates the
 * pick for today, then emails both partners.
 *
 * Batch: 20 pairs per invocation.
 * Auth: x-cron-secret header.
 */

const BATCH_SIZE = 20;

interface LinkRow {
  id: string;
  inviter_id: string;
  invitee_id: string;
}

interface ProfileRow {
  id: string;
  email?: string;
  display_name?: string;
}

interface PickRow {
  link_id: string;
  movie_title: string | null;
  movie_poster_path: string | null;
  series_title: string | null;
  series_poster_path: string | null;
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

  // 1. Find accepted links
  const { data: links } = await admin
    .from("account_links")
    .select("id, inviter_id, invitee_id")
    .eq("status", "accepted")
    .limit(200);

  if (!links || links.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const typedLinks = links as LinkRow[];

  // 2. Batch-fetch profiles for all users
  const userIds = [
    ...new Set(typedLinks.flatMap((l) => [l.inviter_id, l.invitee_id].filter(Boolean))),
  ];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  const profileMap = new Map<string, ProfileRow>();
  for (const p of (profiles || []) as ProfileRow[]) {
    profileMap.set(p.id, p);
  }

  const eligibleLinks = typedLinks;

  // 4. Fetch picks for today (or trigger generation via the tonight-pick API)
  const linkIds = eligibleLinks.map((l) => l.id);
  const { data: picks } = await admin
    .from("couple_picks")
    .select("link_id, movie_title, movie_poster_path, series_title, series_poster_path")
    .in("link_id", linkIds)
    .eq("generated_at", today);

  const pickMap = new Map<string, PickRow>();
  for (const p of (picks || []) as PickRow[]) {
    pickMap.set(p.link_id, p);
  }

  // 5. Send emails — batch limit
  const batch = eligibleLinks.slice(0, BATCH_SIZE);
  let sent = 0;
  let failed = 0;

  for (const link of batch) {
    const pick = pickMap.get(link.id);
    if (!pick || (!pick.movie_title && !pick.series_title)) continue;

    const inviter = profileMap.get(link.inviter_id);
    const invitee = link.invitee_id ? profileMap.get(link.invitee_id) : null;

    // Get emails from auth
    const emailPromises: Promise<void>[] = [];

    if (inviter) {
      const partnerName = invitee?.display_name || "Partner";
      emailPromises.push(sendEmailForUser(admin, link.inviter_id, partnerName, pick));
    }

    if (invitee && link.invitee_id) {
      const partnerName = inviter?.display_name || "Partner";
      emailPromises.push(sendEmailForUser(admin, link.invitee_id, partnerName, pick));
    }

    const results = await Promise.allSettled(emailPromises);
    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else failed++;
    }
  }

  return NextResponse.json({
    sent,
    failed,
    eligible: eligibleLinks.length,
    picks_found: pickMap.size,
  });
}

async function sendEmailForUser(
  admin: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  partnerName: string,
  pick: PickRow,
): Promise<void> {
  // Get email from auth
  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email;
  if (!email) return;

  // Detect locale (default to "no")
  const locale = "no";

  await sendFridayPickEmail(
    email,
    partnerName,
    pick.movie_title || "",
    pick.series_title || "",
    pick.movie_poster_path || "",
    pick.series_poster_path || "",
    locale,
  );
}
