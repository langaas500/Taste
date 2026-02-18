import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

const TMDB_BASE = "https://api.themoviedb.org/3";
const headers = {
  Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(req: NextRequest) {
  await getUser(); // allow guest access
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({});

  const items = ids.split(",").map((s) => {
    const [id, type] = s.split(":");
    return { id, type };
  });

  const results: Record<string, string | null> = {};
  await Promise.allSettled(
    items.map(async ({ id, type }) => {
      const res = await fetch(`${TMDB_BASE}/${type}/${id}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      results[`${id}:${type}`] = data.poster_path || null;
    })
  );

  return NextResponse.json(results);
}
