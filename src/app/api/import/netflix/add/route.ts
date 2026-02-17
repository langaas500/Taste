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

    // Filter to valid items only
    const validItems = items.filter(
      (item): item is { tmdb_id: number; type: string } => !!(item.tmdb_id && item.type)
    );
    const skippedInvalid = items.length - validItems.length;

    if (validItems.length === 0) {
      return NextResponse.json({ added: 0, skipped: items.length });
    }

    const supabase = await createSupabaseServer();
    const incomingIds = validItems.map((i) => i.tmdb_id);

    // Single query to find all existing user_titles matching these tmdb_ids
    const { data: existingRows } = await supabase
      .from("user_titles")
      .select("tmdb_id, type")
      .eq("user_id", user.id)
      .in("tmdb_id", incomingIds);

    const existingSet = new Set<string>();
    for (const row of existingRows || []) {
      existingSet.add(`${row.tmdb_id}:${row.type}`);
    }

    const now = new Date().toISOString();
    const newRows = validItems
      .filter((item) => !existingSet.has(`${item.tmdb_id}:${item.type}`))
      .map((item) => ({
        user_id: user.id,
        tmdb_id: item.tmdb_id,
        type: item.type,
        status: "watched",
        watched_at: now,
        updated_at: now,
      }));

    const skipped = skippedInvalid + (validItems.length - newRows.length);

    if (newRows.length > 0) {
      // Bulk upsert in chunks of 100
      const CHUNK = 100;
      for (let i = 0; i < newRows.length; i += CHUNK) {
        await supabase
          .from("user_titles")
          .upsert(newRows.slice(i, i + CHUNK), { onConflict: "user_id,tmdb_id,type" });
      }
      // Cache title metadata in background
      for (const row of newRows) {
        cacheTitleIfNeeded(row.tmdb_id, row.type).catch(() => {});
      }
    }

    return NextResponse.json({ added: newRows.length, skipped });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
