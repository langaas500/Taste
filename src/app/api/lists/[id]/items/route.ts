import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    const { tmdb_id, type } = await req.json();

    if (!tmdb_id || !type) {
      return NextResponse.json({ error: "Missing tmdb_id or type" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("custom_list_items")
      .upsert(
        { list_id: id, tmdb_id, type },
        { onConflict: "list_id,tmdb_id,type" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache title in background
    cacheTitleIfNeeded(tmdb_id, type).catch(() => {});

    return NextResponse.json({ item: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    const { tmdb_id, type } = await req.json();

    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("custom_list_items")
      .delete()
      .eq("list_id", id)
      .eq("tmdb_id", tmdb_id)
      .eq("type", type);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
