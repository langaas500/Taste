import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    if (error) return NextResponse.redirect(new URL("/settings?error=spotify_denied", req.url));
    if (!code) return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
    if (!state?.includes(user.id)) return NextResponse.redirect(new URL("/settings?error=invalid_state", req.url));

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://logflix.app/api/spotify/callback";

    if (!clientId || !clientSecret) return NextResponse.redirect(new URL("/settings?error=spotify_not_configured", req.url));

    // Exchange code for tokens
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error("[spotify-callback] Token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(new URL("/settings?error=spotify_token_failed", req.url));
    }

    const tokens = await tokenRes.json();

    const admin = createSupabaseAdmin();
    await admin
      .from("profiles")
      .update({
        spotify_access_token: tokens.access_token,
        spotify_refresh_token: tokens.refresh_token,
        spotify_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        spotify_connected: true,
      })
      .eq("id", user.id);

    return NextResponse.redirect(new URL("/settings?spotify=connected", req.url));
  } catch (e: unknown) {
    console.error("[spotify-callback]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(new URL("/settings?error=spotify_auth_failed", req.url));
  }
}

// DELETE: Disconnect Spotify
export async function DELETE() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdmin();
    await admin
      .from("profiles")
      .update({
        spotify_access_token: null,
        spotify_refresh_token: null,
        spotify_token_expires_at: null,
        spotify_connected: false,
      })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
