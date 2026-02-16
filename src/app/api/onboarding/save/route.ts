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
      for (const item of titles) {
        const { tmdb_id, type, sentiment } = item;
        if (!tmdb_id || !type || !sentiment) continue;

        await supabase.from("user_titles").upsert(
          {
            user_id: user.id,
            tmdb_id,
            type,
            status: "watched",
            sentiment,
            watched_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,tmdb_id,type" }
        );

        // Cache in background
        cacheTitleIfNeeded(tmdb_id, type).catch(() => {});
      }
    }

    // Save streaming services to profile
    if (Array.isArray(streaming_services)) {
      await supabase
        .from("profiles")
        .update({ streaming_services, onboarding_completed: true })
        .eq("id", user.id);
    } else {
      // Just mark onboarding completed
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
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
