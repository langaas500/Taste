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

      const emails: string[] = [];
      for (const u of data.users) {
        const email = (u as { email?: string }).email;
        if (email) emails.push(email);
      }

      if (emails.length === 0) break;

      const results = await Promise.allSettled(
        emails.map((email) => sendWeeklyDigestEmail(email))
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
