import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    // Check current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, trial_ends_at")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (profile.is_premium) return NextResponse.json({ error: "Already premium" }, { status: 400 });
    if (profile.trial_ends_at) return NextResponse.json({ error: "Trial already used" }, { status: 400 });

    // Activate 7-day trial
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({ trial_ends_at: trialEndsAt })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, trial_ends_at: trialEndsAt });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
