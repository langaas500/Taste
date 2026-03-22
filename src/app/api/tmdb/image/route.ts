import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy TMDB poster images through logflix.app domain.
 * Used in emails where TMDB blocks direct image loading.
 * GET /api/tmdb/image?path=/abc123.jpg&w=300
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  const w = req.nextUrl.searchParams.get("w") || "300";

  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
    const tmdbUrl = `https://image.tmdb.org/t/p/w${w}${path}`;
    const res = await fetch(tmdbUrl);

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
