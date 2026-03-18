import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { sendWeeklyDigestEmail } from "@/lib/email";

const BATCH_SIZE = 50;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Pre-fetch couple match data for the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const coupleDataMap = new Map<string, { matches: number; lastMatch: string }>();

  try {
    // Get all premium users with linked partners
    const { data: links } = await admin
      .from("account_links")
      .select("user_id, partner_id");

    if (links && links.length > 0) {
      // Collect all user pairs
      const pairs = new Set<string>();
      for (const link of links) {
        const key = [link.user_id, link.partner_id].sort().join(":");
        pairs.add(key);
      }

      for (const pairKey of pairs) {
        const [userA, userB] = pairKey.split(":");
        const { data: sessions } = await admin
          .from("wt_sessions")
          .select("match_tmdb_id, created_at")
          .or(`and(host_id.eq.${userA},partner_id.eq.${userB}),and(host_id.eq.${userB},partner_id.eq.${userA})`)
          .not("match_tmdb_id", "is", null)
          .gte("created_at", weekAgo)
          .order("created_at", { ascending: false });

        if (sessions && sessions.length > 0) {
          // Get title name for last match
          let lastMatchTitle = "";
          const lastTmdbId = sessions[0].match_tmdb_id;
          if (lastTmdbId) {
            const { data: cached } = await admin
              .from("titles_cache")
              .select("title")
              .eq("tmdb_id", lastTmdbId)
              .limit(1)
              .maybeSingle();
            if (cached?.title) lastMatchTitle = cached.title;
          }

          const entry = { matches: sessions.length, lastMatch: lastMatchTitle };
          coupleDataMap.set(userA, entry);
          coupleDataMap.set(userB, entry);
        }
      }
    }
  } catch (e) {
    console.error("weekly-digest: failed to fetch couple data", e);
  }

  let sent = 0;
  let failed = 0;
  let page = 1;

  try {
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: BATCH_SIZE,
      });

      if (error) {
        console.error("weekly-digest: failed to fetch users", error.message);
        break;
      }

      const users: Array<{ email: string; id: string }> = [];
      for (const u of data.users) {
        const email = (u as { email?: string }).email;
        const id = (u as { id: string }).id;
        if (email) users.push({ email, id });
      }

      if (users.length === 0) break;

      const results = await Promise.allSettled(
        users.map((u) => {
          const couple = coupleDataMap.get(u.id);
          return sendWeeklyDigestEmail(u.email, undefined, couple ? {
            coupleMatches: couple.matches,
            coupleLastMatch: couple.lastMatch || undefined,
          } : undefined);
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") sent++;
        else failed++;
      }

      if (data.users.length < BATCH_SIZE) break;
      page++;
    }
  } catch (e) {
    console.error("weekly-digest: unexpected error", e);
  }

  console.log(`weekly-digest: sent=${sent} failed=${failed}`);
  return NextResponse.json({ sent, failed });
}
