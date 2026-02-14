import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { exchangeTraktCode } from "@/lib/trakt";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
    }

    // Validate state contains user id
    if (!state?.includes(user.id)) {
      return NextResponse.redirect(new URL("/settings?error=invalid_state", req.url));
    }

    const tokenData = await exchangeTraktCode(code);

    const admin = createSupabaseAdmin();
    await admin.from("trakt_tokens").upsert({
      user_id: user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      scope: tokenData.scope || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.redirect(new URL("/settings?trakt=connected", req.url));
  } catch (e: unknown) {
    console.error("Trakt callback error:", e);
    return NextResponse.redirect(new URL("/settings?error=trakt_auth_failed", req.url));
  }
}
