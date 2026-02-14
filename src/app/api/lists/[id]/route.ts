import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: list, error } = await supabase
      .from("custom_lists")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !list) return NextResponse.json({ error: "List not found" }, { status: 404 });

    // Check ownership (RLS handles this but be explicit)
    if (list.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("custom_list_items")
      .select("*")
      .eq("list_id", id)
      .order("position")
      .order("added_at", { ascending: false });

    // Enrich with cache
    const tmdbIds = (items || []).map((i: { tmdb_id: number }) => i.tmdb_id);
    let cacheMap: Record<string, Record<string, unknown>> = {};

    if (tmdbIds.length > 0) {
      const { data: cache } = await supabase
        .from("titles_cache")
        .select("*")
        .in("tmdb_id", [...new Set(tmdbIds)]);

      for (const c of (cache || []) as { tmdb_id: number; type: string }[]) {
        cacheMap[`${c.tmdb_id}:${c.type}`] = c;
      }
    }

    const enrichedItems = (items || []).map((i: { tmdb_id: number; type: string }) => ({
      ...i,
      cache: cacheMap[`${i.tmdb_id}:${i.type}`] || undefined,
    }));

    return NextResponse.json({ list: { ...list, items: enrichedItems } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    const body = await req.json();
    const supabase = await createSupabaseServer();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;

    const { data, error } = await supabase
      .from("custom_lists")
      .update(updates)
      .eq("id", id)
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("custom_lists")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
