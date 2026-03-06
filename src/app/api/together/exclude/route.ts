import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

function parseBody(body: unknown): { tmdb_id: number; media_type: "movie" | "tv" } | null {
  if (!body || typeof body !== "object") return null;
  const { tmdb_id, media_type } = body as Record<string, unknown>;
  if (typeof tmdb_id !== "number" || !Number.isInteger(tmdb_id) || tmdb_id <= 0) return null;
  if (media_type !== "movie" && media_type !== "tv") return null;
  return { tmdb_id, media_type };
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = parseBody(await req.json());
    if (!parsed) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("together_title_exclusions")
      .upsert(
        { user_id: user.id, tmdb_id: parsed.tmdb_id, media_type: parsed.media_type },
        { onConflict: "user_id,tmdb_id,media_type" }
      );

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = parseBody(await req.json());
    if (!parsed) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("together_title_exclusions")
      .delete()
      .eq("user_id", user.id)
      .eq("tmdb_id", parsed.tmdb_id)
      .eq("media_type", parsed.media_type);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
