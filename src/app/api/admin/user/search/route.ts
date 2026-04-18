import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { env } from "@/lib/env";

const ADMIN_EMAILS = env.ADMIN_EMAILS;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();

    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search by email in auth.users
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 50 });
    const emailMatches = (authUsers?.users || []).filter(
      (u: { email?: string }) => u.email && u.email.toLowerCase().includes(q.toLowerCase()),
    );

    // Search by display_name in profiles
    const { data: nameMatches } = await admin
      .from("profiles")
      .select("id, display_name, created_at")
      .ilike("display_name", `%${q}%`)
      .limit(20);

    // Merge results by user ID
    const resultMap = new Map<string, Record<string, unknown>>();

    for (const u of emailMatches) {
      resultMap.set(u.id, { id: u.id, email: u.email });
    }
    for (const p of (nameMatches || [])) {
      const existing = resultMap.get(p.id) || { id: p.id };
      resultMap.set(p.id, { ...existing, ...p });
    }

    // Enrich all with profile data + title count
    const ids = [...resultMap.keys()];
    if (ids.length === 0) return NextResponse.json({ users: [] });

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name, created_at")
      .in("id", ids);

    const profileMap = new Map<string, Record<string, unknown>>();
    for (const p of (profiles || []) as Record<string, unknown>[]) {
      profileMap.set(p.id as string, p);
    }

    // Title counts in bulk
    const { data: titleCounts } = await admin
      .from("user_titles")
      .select("user_id")
      .in("user_id", ids);

    const countMap = new Map<string, number>();
    for (const row of (titleCounts || []) as { user_id: string }[]) {
      countMap.set(row.user_id, (countMap.get(row.user_id) || 0) + 1);
    }

    // Build email map from auth users
    const emailMap = new Map<string, string>();
    for (const u of emailMatches) {
      emailMap.set(u.id, u.email || "");
    }
    // Also fetch emails for profile-only matches
    const missingEmailIds = ids.filter((id) => !emailMap.has(id));
    if (missingEmailIds.length > 0) {
      for (const id of missingEmailIds.slice(0, 20)) {
        const { data: au } = await admin.auth.admin.getUserById(id);
        if (au?.user?.email) emailMap.set(id, au.user.email);
      }
    }

    const users = ids.map((id) => {
      const profile = profileMap.get(id) || {};
      return {
        id,
        email: emailMap.get(id) || null,
        display_name: (profile as Record<string, unknown>).display_name || null,
        created_at: (profile as Record<string, unknown>).created_at || null,
        title_count: countMap.get(id) || 0,
      };
    });

    return NextResponse.json({ users });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
