import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const [
      { data: profile },
      { data: userTitles },
      { data: exclusions },
      { data: feedback },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_titles").select("*").eq("user_id", user.id),
      supabase.from("user_exclusions").select("*").eq("user_id", user.id),
      supabase.from("user_feedback").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      titles: userTitles || [],
      exclusions: exclusions || [],
      feedback: feedback || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="watchledger-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
