import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { tmdbSearch } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const q = req.nextUrl.searchParams.get("q");
    const type = (req.nextUrl.searchParams.get("type") as "movie" | "tv" | "multi") || "multi";
    if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const results = await tmdbSearch(q, type);
    return NextResponse.json({ results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
