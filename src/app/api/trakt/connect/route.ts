import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getTraktAuthorizeUrl } from "@/lib/trakt";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const user = await requireUser();
    const state = randomBytes(16).toString("hex") + ":" + user.id;
    const url = getTraktAuthorizeUrl(state);
    return NextResponse.redirect(url);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.redirect(new URL("/login", process.env.TRAKT_REDIRECT_URI!.replace("/api/trakt/callback", "")));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
