import { NextRequest, NextResponse } from "next/server";
import { getWtUserId, getUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateGuestToken } from "@/lib/guest-token";

// POST: Join a session with a code
export const POST = withLogger("/api/together/session/join", async (req, { logger }) => {
  try {
    const limited = await applyRateLimit("join", getClientIp(req));
    if (limited) return limited;

    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    logger.setUserId(userId);

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { code } = body;

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

    if (session.host_id === userId) {
      return NextResponse.json({ error: "Cannot join your own session" }, { status: 400 });
    }

    if (session.status !== "waiting" && session.status !== "active") {
      return NextResponse.json({ error: "Session is no longer active" }, { status: 400 });
    }

    // Already the guest → allow rejoin without re-updating
    if (session.guest_id === userId) {
      const authUser = await getUser();
      const guestToken = !authUser ? generateGuestToken(userId, session.id) : undefined;
      return NextResponse.json({
        session: {
          id: session.id,
          titles: session.titles,
          deck_seed: session.deck_seed ?? null,
          status: session.status,
        },
        ...(guestToken && { guestToken }),
      });
    }

    if (session.guest_id) {
      return NextResponse.json({ error: "Session full" }, { status: 409 });
    }

    // Join the session — atomic: only succeeds if guest_id is still null
    const { data: updated, error: updateError } = await admin
      .from("wt_sessions")
      .update({
        guest_id: userId,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .is("guest_id", null)
      .select("id")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Session full" }, { status: 409 });
    }

    const authUser = await getUser();
    const guestToken = !authUser ? generateGuestToken(userId, session.id) : undefined;
    return NextResponse.json({
      session: {
        id: session.id,
        titles: session.titles,
        deck_seed: session.deck_seed ?? null,
        status: "active",
      },
      ...(guestToken && { guestToken }),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
