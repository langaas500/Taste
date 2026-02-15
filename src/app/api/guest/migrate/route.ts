import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";

const ALLOWED_ACTIONS = new Set(["liked", "disliked", "neutral", "watchlist", "watched"]);
const ALLOWED_TYPES = new Set(["movie", "tv"]);
const MAX_ACTIONS = 100;

interface GuestEntry {
  tmdb_id: number;
  type: "movie" | "tv";
  action: string;
  ts: number;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { actions } = body;

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ ok: true, migrated: 0 });
    }

    // Validate + cap
    const valid: GuestEntry[] = [];
    for (const a of actions.slice(0, MAX_ACTIONS)) {
      if (
        typeof a.tmdb_id === "number" &&
        ALLOWED_TYPES.has(a.type) &&
        ALLOWED_ACTIONS.has(a.action) &&
        typeof a.ts === "number"
      ) {
        valid.push(a);
      }
    }

    if (valid.length === 0) {
      return NextResponse.json({ ok: true, migrated: 0 });
    }

    // Dedupe: latest ts per (tmdb_id, type)
    const deduped = new Map<string, GuestEntry>();
    for (const entry of valid) {
      const key = `${entry.tmdb_id}:${entry.type}`;
      const existing = deduped.get(key);
      if (!existing || entry.ts > existing.ts) {
        deduped.set(key, entry);
      }
    }

    const supabase = await createSupabaseServer();
    let migrated = 0;

    for (const entry of deduped.values()) {
      const status = entry.action === "watchlist" ? "watchlist" : "watched";
      const sentiment = ["liked", "disliked", "neutral"].includes(entry.action)
        ? entry.action
        : null;

      const { error } = await supabase
        .from("user_titles")
        .upsert(
          {
            user_id: user.id,
            tmdb_id: entry.tmdb_id,
            type: entry.type,
            status,
            sentiment,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,tmdb_id,type" }
        );

      if (!error) {
        migrated++;
        // Cache title metadata in background
        cacheTitleIfNeeded(entry.tmdb_id, entry.type).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true, migrated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
