import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { randomBytes } from "crypto";

const SCOPES = "user-read-recently-played user-read-currently-playing user-top-read";

export async function GET() {
  try {
    const user = await requireUser();
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://logflix.app/api/spotify/callback";

    if (!clientId) return NextResponse.json({ error: "Spotify not configured" }, { status: 503 });

    const state = randomBytes(16).toString("hex") + ":" + user.id;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: SCOPES,
      redirect_uri: redirectUri,
      state,
      show_dialog: "false",
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.redirect(new URL("/login", "https://logflix.app"));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
