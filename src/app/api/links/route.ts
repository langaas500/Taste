import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

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
    const partnerIds = (links || [])
      .map((l: { inviter_id: string; invitee_id: string | null }) =>
        l.inviter_id === user.id ? l.invitee_id : l.inviter_id
      )
      .filter(Boolean);

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
      partner_name:
        l.inviter_id === user.id
          ? l.invitee_id
            ? nameMap[l.invitee_id] || null
            : null
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
    const body = await req.json().catch(() => ({}));
    const { link_id, shared_list_ids } = body as {
      link_id?: string;
      shared_list_ids?: unknown;
    };

    if (!link_id) {
      return NextResponse.json({ error: "Missing link_id" }, { status: 400 });
    }

    // Allow clearing lists by sending [] (or null/undefined -> treat as [])
    const listIdsRaw = shared_list_ids == null ? [] : shared_list_ids;

    if (!Array.isArray(listIdsRaw)) {
      return NextResponse.json({ error: "shared_list_ids must be an array" }, { status: 400 });
    }

    // Normalize + dedupe (preserve original order as much as possible)
    const seen = new Set<string>();
    const listIds: string[] = [];
    for (const v of listIdsRaw) {
      if (typeof v !== "string") {
        return NextResponse.json({ error: "shared_list_ids must be string IDs" }, { status: 400 });
      }
      const id = v.trim();
      if (!id) continue;
      if (!seen.has(id)) {
        seen.add(id);
        listIds.push(id);
      }
    }

    const supabase = await createSupabaseServer();

    // 1) Fetch link (and ensure requester is participant)
    const { data: link, error: linkErr } = await supabase
      .from("account_links")
      .select("id, inviter_id, invitee_id")
      .eq("id", link_id)
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .single();

    if (linkErr || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const allowedOwnerIds = [link.inviter_id, link.invitee_id].filter(Boolean) as string[];

    // 2) Validate that every listId belongs to inviter or invitee
    // Use admin client to bypass RLS — partner-owned lists are hidden under anon key
    const admin = createSupabaseAdmin();
    if (listIds.length > 0) {
      const { data: lists, error: listsErr } = await admin
        .from("custom_lists")
        .select("id, user_id")
        .in("id", listIds);

      if (listsErr) {
        return NextResponse.json({ error: listsErr.message }, { status: 500 });
      }

      const found = (lists || []) as { id: string; user_id: string }[];

      // If any list IDs are missing -> invalid input
      if (found.length !== listIds.length) {
        return NextResponse.json({ error: "One or more list IDs are invalid" }, { status: 400 });
      }

      // If any list does not belong to either participant -> forbidden
      for (const l of found) {
        if (!allowedOwnerIds.includes(l.user_id)) {
          return NextResponse.json({ error: "List does not belong to link participants" }, { status: 403 });
        }
      }
    }

    // 3) Update link
    const { data, error } = await supabase
      .from("account_links")
      .update({ shared_list_ids: listIds })
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
