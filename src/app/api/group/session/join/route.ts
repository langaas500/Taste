import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// POST: Join a group session by code
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.toUpperCase().trim() : "";
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const display_name = typeof body.display_name === "string" ? body.display_name.trim() : null;
    const provider_ids = Array.isArray(body.provider_ids)
      ? (body.provider_ids as unknown[]).filter((x): x is number => typeof x === "number")
      : [];

    const admin = createSupabaseAdmin();

    // Look up session
    const { data: session, error: findError } = await admin
      .from("group_sessions")
      .select("*")
      .eq("code", code)
      .single();

    if (findError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "lobby") {
      return NextResponse.json({ error: "Session is no longer accepting participants" }, { status: 400 });
    }

    // Check if already a participant (idempotent)
    const { data: existing } = await admin
      .from("group_session_participants")
      .select("id")
      .eq("session_id", session.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await admin
        .from("group_session_participants")
        .insert({
          session_id: session.id,
          user_id: userId,
          display_name,
          provider_ids,
        });

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Return session + participants
    const { data: participants } = await admin
      .from("group_session_participants")
      .select("*")
      .eq("session_id", session.id);

    return NextResponse.json({ session, participants: participants || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
