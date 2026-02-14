import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const { data: links, error } = await supabase
      .from("account_links")
      .select("*")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with partner display names
    const partnerIds = (links || []).map((l: { inviter_id: string; invitee_id: string | null }) =>
      l.inviter_id === user.id ? l.invitee_id : l.inviter_id
    ).filter(Boolean);

    let nameMap: Record<string, string | null> = {};
    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", partnerIds as string[]);

      for (const p of (profiles || []) as { id: string; display_name: string | null }[]) {
        nameMap[p.id] = p.display_name;
      }
    }

    const enriched = (links || []).map((l: { inviter_id: string; invitee_id: string | null }) => ({
      ...l,
      partner_name: l.inviter_id === user.id
        ? (l.invitee_id ? nameMap[l.invitee_id] || null : null)
        : nameMap[l.inviter_id] || null,
    }));

    return NextResponse.json({ links: enriched });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const invite_code = generateInviteCode();

    const { data, error } = await supabase
      .from("account_links")
      .insert({
        inviter_id: user.id,
        invite_code,
        status: "pending",
      })
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

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { link_id, shared_list_ids } = await req.json();
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("account_links")
      .update({ shared_list_ids })
      .eq("id", link_id)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const { link_id } = await req.json();
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("account_links")
      .delete()
      .eq("id", link_id)
      .eq("inviter_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
