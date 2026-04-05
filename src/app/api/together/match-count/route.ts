import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  try {
    const admin = createSupabaseAdmin();
    const { count } = await admin
      .from("wt_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "matched");
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
