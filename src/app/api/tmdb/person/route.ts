import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { tmdbSearchPerson, tmdbPersonCredits } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access
    const sp = req.nextUrl.searchParams;
    const action = sp.get("action") || "search";

    if (action === "credits") {
      const personId = parseInt(sp.get("id") || "");
      if (!personId) return NextResponse.json({ error: "Missing person id" }, { status: 400 });
      const data = await tmdbPersonCredits(personId);
      const cast = (data.cast || [])
        .filter((c: { media_type: string }) => c.media_type === "movie" || c.media_type === "tv")
        .sort((a: { popularity: number }, b: { popularity: number }) => b.popularity - a.popularity);
      return NextResponse.json({ cast });
    }

    // Search person
    const q = sp.get("q");
    if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });
    const data = await tmdbSearchPerson(q);
    return NextResponse.json({ results: data.results });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
