export const revalidate = 3600;

const base = "https://logflix.app";

const pairs: [string, string][] = [
  ["/no/film-a-se-med-kjaeresten", "/en/movie-to-watch-with-your-girlfriend"],
  ["/no/hva-skal-vi-se-i-kveld", "/en/what-should-we-watch-tonight"],
  ["/no/serie-a-se-sammen", "/en/tv-shows-to-watch-together"],
  ["/no/film-for-filmkveld-med-venner", "/en/movies-to-watch-with-friends"],
  ["/no/romantiske-filmer-netflix-norge", "/en/movies-for-date-night"],
  ["/no/filmer-a-se-med-familien", "/en/movies-to-watch-with-the-family"],
];

export function GET() {
  const lastmod = new Date().toISOString();

  const urls = [
    entry(`${base}/`, lastmod, "weekly", "1", { nb: `${base}/`, en: `${base}/`, "x-default": `${base}/` }),
    entry(`${base}/together`, lastmod, "weekly", "0.9", { nb: `${base}/together`, en: `${base}/together`, "x-default": `${base}/together` }),
    ...pairs.flatMap(([no, en]) => [
      entry(`${base}${no}`, lastmod, "weekly", "0.85", { nb: `${base}${no}`, en: `${base}${en}`, "x-default": `${base}${no}` }),
      entry(`${base}${en}`, lastmod, "weekly", "0.85", { nb: `${base}${no}`, en: `${base}${en}`, "x-default": `${base}${no}` }),
    ]),
    entry(`${base}/privacy`, lastmod, "monthly", "0.3"),
    entry(`${base}/contact`, lastmod, "monthly", "0.3"),
    entry(`${base}/terms`, lastmod, "monthly", "0.3"),
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
