// import { createSupabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 3600;
export const dynamic = "force-static";

const BASE = "https://logflix.app";

// ── Focused SEO cluster (April 2026) ──────────────────────
// Previous sitemap exposed thousands of title/guide pages that Google
// never indexed. We're now focusing on a small, high-quality cluster
// to build topical authority before scaling back up.
//
// To restore old sitemaps: uncomment the original code below and remove
// the focused URL list.

const FOCUSED_URLS = [
  "/",
  "/together",
  "/en/what-to-watch-together",
  "/en/cant-decide-what-to-watch",
  "/en/what-to-watch-with-girlfriend",
  "/en/find-something-to-watch-fast",
  "/no/filmer-a-se-med-kjaeresten",
];

export async function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);

  const entries = FOCUSED_URLS.map(
    (url) => `  <url>
    <loc>${BASE}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === "/" ? "1.0" : url === "/together" ? "0.9" : "0.8"}</priority>
  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}

/* ── ORIGINAL SITEMAP CODE (preserved for rollback) ─────────
import { createSupabaseAdmin } from "@/lib/supabase-server";

const REGIONS = ["no", "dk", "fi", "se"] as const;
const TYPES = ["movie", "tv"] as const;
const PER_PAGE = 500;

export async function GET() {
  const admin = createSupabaseAdmin();
  const lastmod = new Date().toISOString();

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

  entries.push(
    `  <sitemap>
    <loc>${BASE}/api/sitemap/guides</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  );

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
── END ORIGINAL ──────────────────────────────────────────── */
