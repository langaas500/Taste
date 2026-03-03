import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { withLogger } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withLogger("/api/email-capture", async (req, { logger }) => {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const tmdb_id = typeof body.tmdb_id === "number" ? body.tmdb_id : null;
    const title = typeof body.title === "string" ? body.title : null;
    const type = body.type === "movie" || body.type === "tv" ? body.type : null;

    const admin = createSupabaseAdmin();

    // Deduplicate — skip if email already captured
    const { data: existing } = await admin
      .from("email_captures")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      const { error } = await admin.from("email_captures").insert({
        email,
        tmdb_id,
        title,
        type,
      });

      if (error) {
        logger.error("email_captures insert failed", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    logger.error("email-capture error", e);
    return NextResponse.json({ ok: true });
  }
});
