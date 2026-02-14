import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const tmdb_id = parseInt(req.nextUrl.searchParams.get("tmdb_id") || "");
    const type = req.nextUrl.searchParams.get("type");

    if (!tmdb_id || !type) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: items } = await supabase
      .from("custom_list_items")
      .select("list_id")
      .eq("tmdb_id", tmdb_id)
      .eq("type", type);

    return NextResponse.json({
      list_ids: (items || []).map((i: { list_id: string }) => i.list_id),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
