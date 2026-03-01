import type { MetadataRoute } from "next";

const base = "https://logflix.app";

const pairs: [string, string][] = [
  ["/no/film-a-se-med-kjaeresten", "/en/movie-to-watch-with-your-girlfriend"],
  ["/no/hva-skal-vi-se-i-kveld", "/en/what-should-we-watch-tonight"],
  ["/no/serie-a-se-sammen", "/en/tv-shows-to-watch-together"],
  ["/no/film-for-filmkveld-med-venner", "/en/movies-to-watch-with-friends"],
  ["/no/romantiske-filmer-netflix-norge", "/en/movies-for-date-night"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-03-01");

  return pairs.flatMap(([no, en]) => [
    {
      url: `${base}${no}`,
      lastModified,
      alternates: {
        languages: {
          no: `${base}${no}`,
          en: `${base}${en}`,
        },
      },
    },
    {
      url: `${base}${en}`,
      lastModified,
      alternates: {
        languages: {
          no: `${base}${no}`,
          en: `${base}${en}`,
        },
      },
    },
  ]);
}
