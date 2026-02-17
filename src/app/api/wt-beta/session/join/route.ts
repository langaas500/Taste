import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Join a session with a code
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Use admin client to bypass RLS (guest isn't part of session yet)
    const admin = createSupabaseAdmin();

    const { data: session, error: findError } = await admin
      .from("wt_sessions")
      .select("id, host_id, guest_id, titles, deck_seed, status")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (findError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id === user.id) {
      return NextResponse.json({ error: "Cannot join your own session" }, { status: 400 });
    }

    if (session.guest_id && session.guest_id !== user.id) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    if (session.status !== "waiting" && session.status !== "active") {
      return NextResponse.json({ error: "Session is no longer active" }, { status: 400 });
    }

    // Join the session
    const { error: updateError } = await admin
      .from("wt_sessions")
      .update({
        guest_id: user.id,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        titles: session.titles,
        deck_seed: session.deck_seed ?? null,
        status: "active",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
