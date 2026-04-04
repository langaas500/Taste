import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { env } from "@/lib/env";

const ADMIN_EMAILS = env.ADMIN_EMAILS;

async function verifyAdmin() {
  const user = await requireUser();
  const admin = createSupabaseAdmin();
  const { data: authUser } = await admin.auth.admin.getUserById(user.id);
  if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
    throw new Error("Forbidden");
  }
  return admin;
}

// POST: set is_premium = true
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    const { id } = await params;

    const { error } = await admin
      .from("profiles")
      .update({ is_premium: true, premium_since: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, is_premium: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === "Forbidden") return NextResponse.json({ error: msg }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: set is_premium = false
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin();
    const { id } = await params;

    const { error } = await admin
      .from("profiles")
      .update({ is_premium: false })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, is_premium: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === "Forbidden") return NextResponse.json({ error: msg }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
