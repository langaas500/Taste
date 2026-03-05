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

  const mainPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/together`, lastModified, changeFrequency: "weekly", priority: 0.9 },
  ];

  const seoPages: MetadataRoute.Sitemap = pairs.flatMap(([no, en]) => [
    {
      url: `${base}${no}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
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
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          nb: `${base}${no}`,
          en: `${base}${en}`,
          "x-default": `${base}${no}`,
        },
      },
    },
  ]);

  const utilityPages: MetadataRoute.Sitemap = [
    { url: `${base}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];

  return [...mainPages, ...seoPages, ...utilityPages];
}
