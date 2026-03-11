import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { env } from "@/lib/env";

const ADMIN_EMAILS = env.ADMIN_EMAILS;

export async function POST() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Proxy call to the cron endpoint with BACKFILL_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/cron/generate-metadata`, {
      method: "POST",
      headers: {
        "x-backfill-secret": env.BACKFILL_SECRET || "",
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
