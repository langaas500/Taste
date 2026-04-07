import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { env } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.email) return NextResponse.json({ error: "No email on account" }, { status: 400 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { password } = body;
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Verify password by attempting sign-in
    const tmp = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error: signInError } = await tmp.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (signInError) return NextResponse.json({ error: "wrong_password" }, { status: 403 });

    // Delete auth user — cascades to profiles, user_titles, etc.
    const admin = createSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
