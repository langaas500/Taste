import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Get all accepted links where user is involved
    const { data: links } = await supabase
      .from("account_links")
      .select("*")
      .eq("status", "accepted")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`);

    if (!links || links.length === 0) {
      return NextResponse.json({ sharedLists: [] });
    }

    // Collect list IDs shared with this user (where the OTHER person shared)
    const sharedListIds: string[] = [];
    const listOwnerMap: Record<string, string> = {};

    for (const link of links) {
      const partnerId = link.inviter_id === user.id ? link.invitee_id : link.inviter_id;
      for (const listId of (link.shared_list_ids || [])) {
        sharedListIds.push(listId);
        listOwnerMap[listId] = partnerId;
      }
    }

    if (sharedListIds.length === 0) {
      return NextResponse.json({ sharedLists: [] });
    }

    // Fetch the shared lists (RLS allows reading via linked policy)
    const { data: lists } = await supabase
      .from("custom_lists")
      .select("*")
      .in("id", sharedListIds);

    // Only keep lists owned by the partner (not our own lists)
    const partnerLists = (lists || []).filter(
      (l: { user_id: string }) => l.user_id !== user.id
    );

    if (partnerLists.length === 0) {
      return NextResponse.json({ sharedLists: [] });
    }

    // Fetch items for these lists
    const listIds = partnerLists.map((l: { id: string }) => l.id);
    const { data: items } = await supabase
      .from("custom_list_items")
      .select("*")
      .in("list_id", listIds)
      .order("position");

    // Fetch cache for items
    const tmdbIds = [...new Set((items || []).map((i: { tmdb_id: number }) => i.tmdb_id))];
    let cacheMap: Record<string, Record<string, unknown>> = {};

    if (tmdbIds.length > 0) {
      const { data: cache } = await supabase
        .from("titles_cache")
        .select("*")
        .in("tmdb_id", tmdbIds);

      for (const c of (cache || []) as { tmdb_id: number; type: string }[]) {
        cacheMap[`${c.tmdb_id}:${c.type}`] = c;
      }
    }

    // Get owner names
    const ownerIds = [...new Set(partnerLists.map((l: { user_id: string }) => l.user_id))];
    let nameMap: Record<string, string | null> = {};

    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", ownerIds);

      for (const p of (profiles || []) as { id: string; display_name: string | null }[]) {
        nameMap[p.id] = p.display_name;
      }
    }

    // Build response
    const sharedLists = partnerLists.map((list: { id: string; user_id: string }) => {
      const listItems = (items || [])
        .filter((i: { list_id: string }) => i.list_id === list.id)
        .map((i: { tmdb_id: number; type: string }) => ({
          ...i,
          cache: cacheMap[`${i.tmdb_id}:${i.type}`] || undefined,
        }));

      return {
        list,
        items: listItems,
        owner_name: nameMap[list.user_id] || null,
      };
    });

    return NextResponse.json({ sharedLists });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
