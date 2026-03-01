import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
  async redirects() {
    return [
      // Norwegian SEO pages → /no/ prefix
      { source: "/film-a-se-med-kjaeresten", destination: "/no/film-a-se-med-kjaeresten", permanent: true },
      { source: "/hva-skal-vi-se-i-kveld", destination: "/no/hva-skal-vi-se-i-kveld", permanent: true },
      { source: "/serie-a-se-sammen", destination: "/no/serie-a-se-sammen", permanent: true },
      { source: "/film-for-filmkveld-med-venner", destination: "/no/film-for-filmkveld-med-venner", permanent: true },
      { source: "/romantiske-filmer-netflix-norge", destination: "/no/romantiske-filmer-netflix-norge", permanent: true },
      // English SEO pages → /en/ prefix
      { source: "/movies-for-date-night", destination: "/en/movies-for-date-night", permanent: true },
      { source: "/what-should-we-watch-tonight", destination: "/en/what-should-we-watch-tonight", permanent: true },
      { source: "/movie-to-watch-with-your-girlfriend", destination: "/en/movie-to-watch-with-your-girlfriend", permanent: true },
      { source: "/movies-to-watch-with-friends", destination: "/en/movies-to-watch-with-friends", permanent: true },
      { source: "/tv-shows-to-watch-together", destination: "/en/tv-shows-to-watch-together", permanent: true },
    ];
  },
};

export default nextConfig;
