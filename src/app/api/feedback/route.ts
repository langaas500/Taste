import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { tmdb_id, type, feedback } = await req.json();
    if (!tmdb_id || !type || !feedback) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("user_feedback")
      .upsert(
        { user_id: user.id, tmdb_id, type, feedback },
        { onConflict: "user_id,tmdb_id,type" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ feedback: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
