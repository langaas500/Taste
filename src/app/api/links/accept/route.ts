import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { invite_code } = await req.json();

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
    return NextResponse.json({ link: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
