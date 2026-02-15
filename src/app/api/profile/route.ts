import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const allowed = ["display_name", "language", "exploration_slider", "content_filters"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
