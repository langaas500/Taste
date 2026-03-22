import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { invite_code } = body;

    if (!invite_code?.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Find pending link by code
    const { data: link, error: findError } = await supabase
      .from("account_links")
      .select("*")
      .eq("invite_code", invite_code.trim().toUpperCase())
      .eq("status", "pending")
      .is("invitee_id", null)
      .single();

    if (findError || !link) {
      return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 404 });
    }

    // Can't link with yourself
    if (link.inviter_id === user.id) {
      return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });
    }

    // Accept the link
    const { data, error } = await supabase
      .from("account_links")
      .update({
        invitee_id: user.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", link.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Referral reward: grant 30-day trial to non-premium partner
    try {
      const admin = createSupabaseAdmin();
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Check inviter's premium status
      const { data: inviterProfile } = await admin
        .from("profiles")
        .select("is_premium")
        .eq("id", link.inviter_id)
        .single();

      // Check invitee's (current user) premium status
      const { data: inviteeProfile } = await admin
        .from("profiles")
        .select("is_premium, trial_ends_at")
        .eq("id", user.id)
        .single();

      // If inviter is premium → give invitee 30-day trial
      if (inviterProfile?.is_premium && inviteeProfile && !inviteeProfile.is_premium && !inviteeProfile.trial_ends_at) {
        await admin
          .from("profiles")
          .update({ trial_ends_at: thirtyDays })
          .eq("id", user.id);
      }

      // If invitee is premium → give inviter 30-day trial
      if (inviteeProfile?.is_premium) {
        const { data: inviterCheck } = await admin
          .from("profiles")
          .select("is_premium, trial_ends_at")
          .eq("id", link.inviter_id)
          .single();
        if (inviterCheck && !inviterCheck.is_premium && !inviterCheck.trial_ends_at) {
          await admin
            .from("profiles")
            .update({ trial_ends_at: thirtyDays })
            .eq("id", link.inviter_id);
        }
      }
    } catch {
      // Non-fatal — link is already accepted
    }

    return NextResponse.json({ link: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
