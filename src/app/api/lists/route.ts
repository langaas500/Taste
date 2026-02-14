import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const { data: lists, error } = await supabase
      .from("custom_lists")
      .select("*, custom_list_items(count)")
      .eq("user_id", user.id)
      .order("position")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get first 4 poster thumbnails per list
    const listIds = (lists || []).map((l: { id: string }) => l.id);
    let itemsByList: Record<string, { tmdb_id: number; type: string }[]> = {};

    if (listIds.length > 0) {
      const { data: items } = await supabase
        .from("custom_list_items")
        .select("list_id, tmdb_id, type")
        .in("list_id", listIds)
        .order("position")
        .limit(4 * listIds.length);

      for (const item of (items || []) as { list_id: string; tmdb_id: number; type: string }[]) {
        if (!itemsByList[item.list_id]) itemsByList[item.list_id] = [];
        if (itemsByList[item.list_id].length < 4) {
          itemsByList[item.list_id].push(item);
        }
      }
    }

    // Get poster paths from cache
    const allTmdbKeys = Object.values(itemsByList).flat();
    let posterMap: Record<string, string | null> = {};

    if (allTmdbKeys.length > 0) {
      const tmdbIds = [...new Set(allTmdbKeys.map((k) => k.tmdb_id))];
      const { data: cache } = await supabase
        .from("titles_cache")
        .select("tmdb_id, type, poster_path")
        .in("tmdb_id", tmdbIds);

      for (const c of (cache || []) as { tmdb_id: number; type: string; poster_path: string | null }[]) {
        posterMap[`${c.tmdb_id}:${c.type}`] = c.poster_path;
      }
    }

    const enrichedLists = (lists || []).map((l: Record<string, unknown>) => {
      const items = itemsByList[(l as { id: string }).id] || [];
      return {
        ...l,
        item_count: (l.custom_list_items as { count: number }[])?.[0]?.count || 0,
        thumbnails: items.map((i) => posterMap[`${i.tmdb_id}:${i.type}`] || null),
      };
    });

    return NextResponse.json({ lists: enrichedLists });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("custom_lists")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ list: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
