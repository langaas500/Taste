import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("profiles")
      .update({ email_digest: true })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
