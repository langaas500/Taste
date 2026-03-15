import { createSupabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 3600;

const BASE = "https://logflix.app";
const REGIONS = ["no", "dk", "fi", "se"] as const;
const TYPES = ["movie", "tv"] as const;
const PER_PAGE = 500;

export async function GET() {
  const admin = createSupabaseAdmin();
  const lastmod = new Date().toISOString();

  // Count titles per type (same titles across all regions)
  const counts: Record<string, number> = {};
  await Promise.all(
    TYPES.map(async (type) => {
      const { count } = await admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .eq("type", type)
        .not("slug", "is", null);
      counts[type] = Math.max(Math.ceil((count || 0) / PER_PAGE), 1);
    }),
  );

  const entries: string[] = [];

  // Guides sitemap
  entries.push(
    `  <sitemap>
    <loc>${BASE}/api/sitemap/guides</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  );

  // Title sitemaps — one entry per region × type × page
  for (const region of REGIONS) {
    for (const type of TYPES) {
      for (let p = 1; p <= counts[type]; p++) {
        entries.push(
          `  <sitemap>
    <loc>${BASE}/api/sitemap/titles?region=${region}&amp;type=${type}&amp;page=${p}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
        );
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}
