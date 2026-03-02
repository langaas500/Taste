import type { MetadataRoute } from "next";

const base = "https://logflix.app";

const pairs: [string, string][] = [
  ["/no/film-a-se-med-kjaeresten", "/en/movie-to-watch-with-your-girlfriend"],
  ["/no/hva-skal-vi-se-i-kveld", "/en/what-should-we-watch-tonight"],
  ["/no/serie-a-se-sammen", "/en/tv-shows-to-watch-together"],
  ["/no/film-for-filmkveld-med-venner", "/en/movies-to-watch-with-friends"],
  ["/no/romantiske-filmer-netflix-norge", "/en/movies-for-date-night"],
  ["/no/filmer-a-se-med-familien", "/en/movies-to-watch-with-the-family"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...pairs.flatMap(([no, en]) => [
      {
        url: `${base}${no}`,
        lastModified,
        alternates: {
          languages: {
            nb: `${base}${no}`,
            en: `${base}${en}`,
            "x-default": `${base}${no}`,
          },
        },
      },
      {
        url: `${base}${en}`,
        lastModified,
        alternates: {
          languages: {
            nb: `${base}${no}`,
            en: `${base}${en}`,
            "x-default": `${base}${no}`,
          },
        },
      },
    ]),
    { url: `${base}/`, lastModified },
    { url: `${base}/together`, lastModified },
    { url: `${base}/privacy`, lastModified },
    { url: `${base}/contact`, lastModified },
    { url: `${base}/terms`, lastModified },
  ];
}
