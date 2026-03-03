import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getTraktAuthorizeUrl } from "@/lib/trakt";
import { randomBytes } from "crypto";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const user = await requireUser();
    const state = randomBytes(16).toString("hex") + ":" + user.id;
    const url = getTraktAuthorizeUrl(state);
    return NextResponse.redirect(url);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") {
      const base = env.TRAKT_REDIRECT_URI?.replace("/api/trakt/callback", "") || "";
      return NextResponse.redirect(new URL("/login", base));
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
