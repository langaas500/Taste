import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export interface SpotifyMood {
  mood: string;
  tracks: string[];
  connected: boolean;
}

/** Refresh Spotify token if expired. Returns new access_token or null. */
async function refreshIfNeeded(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: string | null,
): Promise<string | null> {
  if (expiresAt && new Date(expiresAt) > new Date()) return accessToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const admin = createSupabaseAdmin();
    await admin
      .from("profiles")
      .update({
        spotify_access_token: data.access_token,
        spotify_token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        ...(data.refresh_token ? { spotify_refresh_token: data.refresh_token } : {}),
      })
      .eq("id", userId);

    return data.access_token;
  } catch {
    return null;
  }
}

function mapMood(features: { valence: number; energy: number; tempo: number; acousticness: number; instrumentalness: number }[]): string {
  if (features.length === 0) return "neutral";

  const avg = {
    valence: features.reduce((s, f) => s + f.valence, 0) / features.length,
    energy: features.reduce((s, f) => s + f.energy, 0) / features.length,
    tempo: features.reduce((s, f) => s + f.tempo, 0) / features.length,
    acousticness: features.reduce((s, f) => s + f.acousticness, 0) / features.length,
    instrumentalness: features.reduce((s, f) => s + f.instrumentalness, 0) / features.length,
  };

  if (avg.valence > 0.7 && avg.energy > 0.7) return "upbeat, feel-good";
  if (avg.valence < 0.3 && avg.energy < 0.4) return "melancholic, introspective";
  if (avg.energy > 0.8 && avg.valence < 0.5) return "intense, dark";
  if (avg.tempo > 140 && avg.energy > 0.7) return "high-energy, action";
  if (avg.acousticness > 0.7 && avg.valence > 0.5) return "warm, cozy";
  if (avg.instrumentalness > 0.5) return "atmospheric, ambient";
  return "neutral";
}

/** Get Spotify mood — exported for direct import in Curator */
export async function getSpotifyMood(userId: string): Promise<SpotifyMood | null> {
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("spotify_access_token, spotify_refresh_token, spotify_token_expires_at, spotify_connected")
    .eq("id", userId)
    .single();

  if (!profile?.spotify_connected || !profile.spotify_access_token || !profile.spotify_refresh_token) {
    return null;
  }

  const token = await refreshIfNeeded(
    userId,
    profile.spotify_access_token,
    profile.spotify_refresh_token,
    profile.spotify_token_expires_at,
  );
  if (!token) return null;

  // Fetch recently played
  const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(2000),
  });

  if (!recentRes.ok) return null;
  const recent = await recentRes.json();
  const items = recent?.items ?? [];
  if (items.length === 0) return null;

  const trackIds = items.map((i: { track: { id: string } }) => i.track.id).join(",");
  const trackNames = items.map((i: { track: { artists: { name: string }[]; name: string } }) =>
    `${i.track.artists[0]?.name ?? "Unknown"} — ${i.track.name}`
  );

  // Fetch audio features
  const featRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(2000),
  });

  if (!featRes.ok) return { mood: "neutral", tracks: trackNames, connected: true };
  const featData = await featRes.json();
  const features = (featData?.audio_features ?? []).filter(Boolean);

  return {
    mood: mapMood(features),
    tracks: trackNames.slice(0, 5),
    connected: true,
  };
}

// HTTP handler
export async function GET() {
  try {
    const user = await requireUser();
    const mood = await getSpotifyMood(user.id);
    if (!mood) return NextResponse.json({ connected: false });
    return NextResponse.json(mood);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
