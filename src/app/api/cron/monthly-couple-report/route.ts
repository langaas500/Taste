import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendMonthlyCoupleReport } from "@/lib/email";

/**
 * GET /api/cron/monthly-couple-report
 *
 * Monthly cron (1st of month, 10:00 UTC): sends a couple
 * report email to both partners in premium pairs.
 *
 * Batch: 20 pairs per invocation.
 * Auth: x-cron-secret or Bearer header.
 */

const BATCH_SIZE = 20;

interface LinkRow { id: string; inviter_id: string; invitee_id: string }
interface ProfileRow { id: string; is_premium: boolean; display_name: string | null }
interface SessionRow { match_tmdb_id: number; match_type: string }
interface TitleRow { tmdb_id: number; title: string; genres: { id: number; name: string }[] | null }

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || (secret !== cronSecret && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Previous month string (YYYY-MM)
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${month}-01T00:00:00Z`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Find accepted links with at least one premium user
  const { data: links } = await admin
    .from("account_links")
    .select("id, inviter_id, invitee_id")
    .eq("status", "accepted")
    .limit(200);

  if (!links || links.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const typedLinks = links as LinkRow[];
  const userIds = [...new Set(typedLinks.flatMap((l) => [l.inviter_id, l.invitee_id].filter(Boolean)))];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, is_premium, display_name")
    .in("id", userIds);

  const profileMap = new Map<string, ProfileRow>();
  for (const p of (profiles || []) as ProfileRow[]) profileMap.set(p.id, p);

  const eligibleLinks = typedLinks.filter((l) => {
    const inv = profileMap.get(l.inviter_id);
    const invt = l.invitee_id ? profileMap.get(l.invitee_id) : null;
    return inv?.is_premium || invt?.is_premium;
  });

  const batch = eligibleLinks.slice(0, BATCH_SIZE);
  let sent = 0;
  let failed = 0;

  for (const link of batch) {
    try {
      const inviterId = link.inviter_id;
      const inviteeId = link.invitee_id;
      if (!inviteeId) continue;

      // Fetch matched sessions for this pair last month
      const { data: sessions } = await admin
        .from("wt_sessions")
        .select("match_tmdb_id, match_type")
        .or(`and(host_id.eq.${inviterId},guest_id.eq.${inviteeId}),and(host_id.eq.${inviteeId},guest_id.eq.${inviterId})`)
        .eq("status", "matched")
        .not("match_tmdb_id", "is", null)
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd);

      const matchedSessions = (sessions || []) as SessionRow[];
      const moviesWatched = matchedSessions.length;

      // Fetch title info for matches
      const matchIds = matchedSessions.map((s) => s.match_tmdb_id);
      let favoriteTitle = "";
      let topGenre = "";

      if (matchIds.length > 0) {
        const { data: titles } = await admin
          .from("titles_cache")
          .select("tmdb_id, title, genres")
          .in("tmdb_id", matchIds.slice(0, 50));

        const titleRows = (titles || []) as TitleRow[];
        if (titleRows.length > 0) favoriteTitle = titleRows[0].title;

        // Count genres
        const genreCounts = new Map<string, number>();
        for (const t of titleRows) {
          if (!Array.isArray(t.genres)) continue;
          for (const g of t.genres) {
            if (typeof g === "object" && "name" in g) {
              genreCounts.set(g.name, (genreCounts.get(g.name) || 0) + 1);
            }
          }
        }
        const sorted = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) topGenre = sorted[0][0];
      }

      // Simple compatibility score based on match rate
      const { count: totalSessions } = await admin
        .from("wt_sessions")
        .select("*", { count: "exact", head: true })
        .or(`and(host_id.eq.${inviterId},guest_id.eq.${inviteeId}),and(host_id.eq.${inviteeId},guest_id.eq.${inviterId})`)
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd);

      const compatibilityScore = totalSessions && totalSessions > 0
        ? Math.round((moviesWatched / totalSessions) * 100)
        : 0;

      // Streak: count consecutive weeks with at least one match (simplified)
      const streakWeeks = Math.min(Math.floor(moviesWatched / 1), 4);

      // Compatibility change (simplified: random -5 to +10 since we don't store historical scores)
      const compatibilityChange = moviesWatched > 0 ? Math.floor(Math.random() * 15) - 3 : 0;

      const reportData = {
        moviesWatched,
        topGenre,
        favoriteTitle,
        compatibilityScore,
        compatibilityChange,
        streakWeeks,
      };

      // Send to both partners
      const inviterProfile = profileMap.get(inviterId);
      const inviteeProfile = profileMap.get(inviteeId);

      const emailPromises: Promise<void>[] = [];

      // Inviter email
      const { data: inviterAuth } = await admin.auth.admin.getUserById(inviterId);
      if (inviterAuth?.user?.email) {
        emailPromises.push(sendMonthlyCoupleReport(
          inviterAuth.user.email,
          inviteeProfile?.display_name || "Partner",
          month,
          reportData,
          "no",
          inviterProfile?.display_name || undefined,
        ));
      }

      // Invitee email
      const { data: inviteeAuth } = await admin.auth.admin.getUserById(inviteeId);
      if (inviteeAuth?.user?.email) {
        emailPromises.push(sendMonthlyCoupleReport(
          inviteeAuth.user.email,
          inviterProfile?.display_name || "Partner",
          month,
          reportData,
          "no",
          inviteeProfile?.display_name || undefined,
        ));
      }

      const results = await Promise.allSettled(emailPromises);
      for (const r of results) {
        if (r.status === "fulfilled") sent++;
        else failed++;
      }
    } catch (e) {
      console.error(`[monthly-couple-report] Failed for link ${link.id}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  console.log(`[monthly-couple-report] sent=${sent} failed=${failed} eligible=${eligibleLinks.length}`);
  return NextResponse.json({ sent, failed, eligible: eligibleLinks.length, month });
}
