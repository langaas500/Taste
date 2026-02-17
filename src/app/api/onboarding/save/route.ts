import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cacheTitleIfNeeded } from "@/lib/cache-title";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { titles, streaming_services } = await req.json();
    const supabase = await createSupabaseServer();

    // Save rated titles
    if (Array.isArray(titles) && titles.length > 0) {
      const now = new Date().toISOString();
      const rows = titles
        .filter(
          (item): item is { tmdb_id: number; type: string; sentiment: string } =>
            !!(item.tmdb_id && item.type && item.sentiment)
        )
        .map((item) => ({
          user_id: user.id,
          tmdb_id: item.tmdb_id,
          type: item.type,
          status: "watched",
          sentiment: item.sentiment,
          watched_at: now,
          updated_at: now,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("user_titles")
          .upsert(rows, { onConflict: "user_id,tmdb_id,type" });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Cache in background
        for (const row of rows) {
          cacheTitleIfNeeded(row.tmdb_id, row.type).catch(() => {});
        }
      }
    }

    // Save streaming services and mark onboarding completed
    const profileUpdate: Record<string, unknown> = { onboarding_completed: true };
    if (Array.isArray(streaming_services)) {
      profileUpdate.streaming_services = streaming_services;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);

    if (profileError) {
      // Non-fatal: onboarding titles are already saved — log and continue
      console.error("onboarding profile update failed:", profileError.message);
    }

    // Trigger taste summary generation in background
    fetch(new URL("/api/taste-summary", req.url).toString(), {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") || "" },
    }).catch(() => {});

    return NextResponse.json({ ok: true, saved: titles?.length || 0 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
