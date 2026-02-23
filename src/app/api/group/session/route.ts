import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { generateGroupCode } from "@/lib/group-utils";

// POST: Create a new group session
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      /* no body — defaults used */
    }

    const display_name = typeof body.display_name === "string" ? body.display_name.trim() : null;
    const media_filter =
      body.media_filter === "movie" || body.media_filter === "tv" ? body.media_filter : "both";
    const provider_ids = Array.isArray(body.provider_ids)
      ? (body.provider_ids as unknown[]).filter((x): x is number => typeof x === "number")
      : [];
    const provider_region =
      typeof body.provider_region === "string" && body.provider_region.length > 0
        ? body.provider_region
        : "US";

    const admin = createSupabaseAdmin();

    // Generate unique 5-char code (retry on collision)
    let code = generateGroupCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await admin
        .from("group_sessions")
        .select("id")
        .eq("code", code)
        .in("status", ["lobby", "swiping", "final_voting"])
        .maybeSingle();
      if (!existing) break;
      code = generateGroupCode();
      attempts++;
    }

    // Insert session
    const { data: session, error } = await admin
      .from("group_sessions")
      .insert({
        code,
        host_user_id: userId,
        status: "lobby",
        media_filter,
        provider_region,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add host as first participant
    await admin.from("group_session_participants").insert({
      session_id: session.id,
      user_id: userId,
      display_name,
      provider_ids,
    });

    return NextResponse.json({ session, code });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
