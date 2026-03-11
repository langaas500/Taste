import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/sitemap/titles?region=no&type=movie&page=1
 *
 * Paginated title sitemap for SEO title pages.
 * Each page contains up to 500 URLs with hreflang alternates
 * for all four Nordic regions (no, dk, fi, se).
 *
 * Without params, returns a sitemap index pointing to all sub-sitemaps.
 */

export const revalidate = 3600; // 1h ISR

const BASE = "https://logflix.app";
const REGIONS = ["no", "dk", "fi", "se"] as const;
const TYPES = ["movie", "tv"] as const;
const PER_PAGE = 500;

const REGION_HREFLANG: Record<string, string> = {
  no: "nb-NO", dk: "da-DK", fi: "fi-FI", se: "sv-SE",
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const region = sp.get("region");
  const type = sp.get("type");
  const page = parseInt(sp.get("page") || "1", 10);

  // No params → return sitemap index
  if (!region || !type) {
    return sitemapIndex();
  }

  // Validate params
  if (!(REGIONS as readonly string[]).includes(region)) {
    return new Response("Invalid region", { status: 400 });
  }
  if (!(TYPES as readonly string[]).includes(type)) {
    return new Response("Invalid type", { status: 400 });
  }

  return titleSitemap(region, type as "movie" | "tv", page);
}

/* ── Sitemap Index ────────────────────────────────────── */

async function sitemapIndex() {
  const admin = createSupabaseAdmin();
  const entries: string[] = [];

  for (const region of REGIONS) {
    for (const type of TYPES) {
      const { count } = await admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .eq("type", type)
        .not("slug", "is", null);

      const totalPages = Math.ceil((count || 0) / PER_PAGE);

      for (let p = 1; p <= Math.max(totalPages, 1); p++) {
        entries.push(
          `  <sitemap>
    <loc>${BASE}/api/sitemap/titles?region=${region}&amp;type=${type}&amp;page=${p}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
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
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

/* ── Individual Title Sitemap ─────────────────────────── */

async function titleSitemap(region: string, type: "movie" | "tv", page: number) {
  const admin = createSupabaseAdmin();
  const offset = (page - 1) * PER_PAGE;

  const { data: titles } = await admin
    .from("titles_cache")
    .select("slug, updated_at")
    .eq("type", type)
    .not("slug", "is", null)
    .order("popularity", { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  if (!titles || titles.length === 0) {
    // Empty sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  const urls = titles.map((t: { slug: string; updated_at: string }) => {
    const loc = `${BASE}/${region}/${type}/${t.slug}`;
    const lastmod = t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString();

    const alternates = REGIONS.map(
      (r) =>
        `    <xhtml:link rel="alternate" hreflang="${REGION_HREFLANG[r]}" href="${BASE}/${r}/${type}/${t.slug}" />`,
    ).join("\n");

    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/no/${type}/${t.slug}" />`;

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${alternates}
${xDefault}
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
