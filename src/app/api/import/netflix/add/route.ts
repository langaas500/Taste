import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    let added = 0;
    let skipped = 0;

    for (const item of items) {
      const { tmdb_id, type } = item;
      if (!tmdb_id || !type) {
        skipped++;
        continue;
      }

      // Check if already in library
      const { data: existing } = await supabase
        .from("user_titles")
        .select("id")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdb_id)
        .eq("type", type)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("user_titles").insert({
        user_id: user.id,
        tmdb_id,
        type,
        status: "watched",
        watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        added++;
        // Cache title metadata in background
        cacheTitleIfNeeded(tmdb_id, type).catch(() => {});
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ added, skipped });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
