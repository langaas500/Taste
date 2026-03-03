import { NextRequest, NextResponse } from "next/server";
import { getWtUserId, getUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateGuestToken } from "@/lib/guest-token";

// POST: Join a group session by code
export const POST = withLogger("/api/group/session/join", async (req, { logger }) => {
  try {
    const limited = await applyRateLimit("join", getClientIp(req));
    if (limited) return limited;

    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    logger.setUserId(userId);

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
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

    const authUser = await getUser();
    const guestToken = !authUser ? generateGuestToken(userId, session.id) : undefined;
    return NextResponse.json({
      session,
      participants: participants || [],
      ...(guestToken && { guestToken }),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
