import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { tmdb_id, type, reason } = await req.json();
    if (!tmdb_id || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("user_exclusions")
      .upsert(
        { user_id: user.id, tmdb_id, type, reason: reason || null },
        { onConflict: "user_id,tmdb_id,type" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ exclusion: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const { tmdb_id, type } = await req.json();

    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("user_exclusions")
      .delete()
      .eq("user_id", user.id)
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
