import { MOOD_GUIDES, REGIONS, REGION_HREFLANG } from "@/config/seo-guides";

export const revalidate = 3600;
export const dynamic = "force-static";

const base = "https://logflix.app";

const pairs: [string, string][] = [
  ["/no/film-a-se-med-kjaeresten", "/en/movie-to-watch-with-your-girlfriend"],
  ["/no/hva-skal-vi-se-i-kveld", "/en/what-should-we-watch-tonight"],
  ["/no/serie-a-se-sammen", "/en/tv-shows-to-watch-together"],
  ["/no/film-for-filmkveld-med-venner", "/en/movies-to-watch-with-friends"],
  ["/no/romantiske-filmer-netflix-norge", "/en/movies-for-date-night"],
  ["/no/filmer-a-se-med-familien", "/en/movies-to-watch-with-the-family"],
];

/* ── English-only keyword pages (no Norwegian counterpart) ── */
const enOnlyPages: string[] = [
  "/en/couple-movie-picker",
  "/en/tinder-for-movies",
  "/en/swipe-movies-together",
  "/en/movie-matching-app-for-couples",
  "/en/stop-arguing-about-what-to-watch",
  "/en/movie-picker-for-two",
  "/en/date-night-movie-picker",
  "/en/movie-night-game-for-couples",
  "/en/solo-to-duo",
  "/en/group-movie-picker",
];

/* ── Legacy påskekrim entries (separate slug per region) ── */
const paskekrim: Record<string, string> = {
  "nb-NO": "/no/guides/paskekrim-2026",
  "sv-SE": "/se/guides/paskkrim-2026",
  "da-DK": "/dk/guides/paskekrim-2026",
  "fi-FI": "/fi/guides/paasiainen-dekkari-2026",
};

export function GET() {
  const lastmod = new Date().toISOString();

  /* ── MOOD_GUIDES → sitemap entries ── */
  const guideUrls = MOOD_GUIDES.flatMap((guide) => {
    const available = REGIONS.filter((r) => guide.locales[r]);
    if (available.length === 0) return [];
    const alternates: Record<string, string> = {
      "x-default": `${base}/${available[0]}/guides/${guide.slug}`,
    };
    for (const r of available) {
      alternates[REGION_HREFLANG[r]] = `${base}/${r}/guides/${guide.slug}`;
    }
    return available.map((r) =>
      entry(`${base}/${r}/guides/${guide.slug}`, lastmod, "weekly", "0.7", alternates),
    );
  });

  /* ── Guide hub pages (one per region) ── */
  const hubAlternates: Record<string, string> = {
    "x-default": `${base}/no/guides`,
  };
  for (const r of REGIONS) {
    hubAlternates[REGION_HREFLANG[r]] = `${base}/${r}/guides`;
  }
  const hubUrls = REGIONS.map((r) =>
    entry(`${base}/${r}/guides`, lastmod, "weekly", "0.9", hubAlternates),
  );

  const urls = [
    entry(`${base}/`, lastmod, "weekly", "1", { nb: `${base}/`, en: `${base}/`, "x-default": `${base}/` }),
    entry(`${base}/together`, lastmod, "weekly", "1", { nb: `${base}/together`, en: `${base}/en/watch-together`, "x-default": `${base}/together` }),
    ...hubUrls,
    ...pairs.flatMap(([no, en]) => [
      entry(`${base}${no}`, lastmod, "weekly", "0.85", { nb: `${base}${no}`, en: `${base}${en}`, "x-default": `${base}${en}` }),
      entry(`${base}${en}`, lastmod, "weekly", "0.85", { nb: `${base}${no}`, en: `${base}${en}`, "x-default": `${base}${en}` }),
    ]),
    ...["no", "se", "dk", "fi", "en"].flatMap((r) => [
      entry(`${base}/${r}/tonight-pick`, lastmod, "monthly", "0.7", { nb: `${base}/no/tonight-pick`, sv: `${base}/se/tonight-pick`, da: `${base}/dk/tonight-pick`, fi: `${base}/fi/tonight-pick`, en: `${base}/en/tonight-pick`, "x-default": `${base}/en/tonight-pick` }),
      entry(`${base}/${r}/ai-curator`, lastmod, "monthly", "0.7", { nb: `${base}/no/ai-curator`, sv: `${base}/se/ai-curator`, da: `${base}/dk/ai-curator`, fi: `${base}/fi/ai-curator`, en: `${base}/en/ai-curator`, "x-default": `${base}/en/ai-curator` }),
      entry(`${base}/${r === "en" ? "en/couple-report" : `${r}/par-rapport`}`, lastmod, "monthly", "0.7", { nb: `${base}/no/par-rapport`, sv: `${base}/se/par-rapport`, da: `${base}/dk/par-rapport`, fi: `${base}/fi/par-rapport`, en: `${base}/en/couple-report`, "x-default": `${base}/en/couple-report` }),
    ]),
    ...["no", "se", "dk", "fi", "en"].flatMap((r) => [
      entry(`${base}/${r}/taste-profile`, lastmod, "monthly", "0.7", { nb: `${base}/no/taste-profile`, sv: `${base}/se/taste-profile`, da: `${base}/dk/taste-profile`, fi: `${base}/fi/taste-profile`, en: `${base}/en/taste-profile`, "x-default": `${base}/en/taste-profile` }),
      entry(`${base}/${r}/couple-streak`, lastmod, "monthly", "0.7", { nb: `${base}/no/couple-streak`, sv: `${base}/se/couple-streak`, da: `${base}/dk/couple-streak`, fi: `${base}/fi/couple-streak`, en: `${base}/en/couple-streak`, "x-default": `${base}/en/couple-streak` }),
      entry(`${base}/${r}/wrapped`, lastmod, "monthly", "0.7", { nb: `${base}/no/wrapped`, sv: `${base}/se/wrapped`, da: `${base}/dk/wrapped`, fi: `${base}/fi/wrapped`, en: `${base}/en/wrapped`, "x-default": `${base}/en/wrapped` }),
    ]),
    entry(`${base}/en/import`, lastmod, "monthly", "0.7", { nb: `${base}/no/importer`, en: `${base}/en/import`, "x-default": `${base}/en/import` }),
    entry(`${base}/no/importer`, lastmod, "monthly", "0.7", { nb: `${base}/no/importer`, en: `${base}/en/import`, "x-default": `${base}/en/import` }),
    entry(`${base}/en/library`, lastmod, "monthly", "0.7", { nb: `${base}/no/bibliotek`, en: `${base}/en/library`, "x-default": `${base}/en/library` }),
    entry(`${base}/no/bibliotek`, lastmod, "monthly", "0.7", { nb: `${base}/no/bibliotek`, en: `${base}/en/library`, "x-default": `${base}/en/library` }),
    entry(`${base}/en/watch-together`, lastmod, "weekly", "0.9", { en: `${base}/en/watch-together`, nb: `${base}/together`, sv: `${base}/se/`, da: `${base}/dk/`, fi: `${base}/fi/`, "x-default": `${base}/en/watch-together` }),
    ...enOnlyPages.map((path) =>
      entry(`${base}${path}`, lastmod, "weekly", "0.85", { en: `${base}${path}`, nb: `${base}/no/`, sv: `${base}/se/`, da: `${base}/dk/`, fi: `${base}/fi/`, "x-default": `${base}${path}` }),
    ),
    ...["no/priser", "se/priser", "dk/priser", "fi/hinnat", "en/pricing"].map((p) =>
      entry(`${base}/${p}`, lastmod, "monthly", "0.7", { nb: `${base}/no/priser`, sv: `${base}/se/priser`, da: `${base}/dk/priser`, fi: `${base}/fi/hinnat`, en: `${base}/en/pricing`, "x-default": `${base}/en/pricing` }),
    ),
    entry(`${base}/en/taste-profile`, lastmod, "monthly", "0.7", { en: `${base}/en/taste-profile`, "x-default": `${base}/en/taste-profile` }),
    entry(`${base}/en/couple-streak`, lastmod, "monthly", "0.7", { en: `${base}/en/couple-streak`, "x-default": `${base}/en/couple-streak` }),
    entry(`${base}/en/wrapped`, lastmod, "monthly", "0.7", { en: `${base}/en/wrapped`, "x-default": `${base}/en/wrapped` }),
    entry(`${base}/privacy`, lastmod, "monthly", "0.3"),
    entry(`${base}/contact`, lastmod, "monthly", "0.3"),
    entry(`${base}/terms`, lastmod, "monthly", "0.3"),
    ...Object.values(paskekrim).map((path) =>
      entry(`${base}${path}`, "2026-03-09T00:00:00.000Z", "weekly", "0.8", {
        ...Object.fromEntries(Object.entries(paskekrim).map(([lang, p]) => [lang, `${base}${p}`])),
        "x-default": `${base}${paskekrim["nb-NO"]}`,
      }),
    ),
    ...guideUrls,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}

function entry(
  url: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  alternates?: Record<string, string>,
): string {
  const lines = [
    `  <url>`,
    `    <loc>${url}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
  ];
  if (alternates) {
    for (const [lang, href] of Object.entries(alternates)) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`);
    }
  }
  lines.push(`  </url>`);
  return lines.join("\n");
}
