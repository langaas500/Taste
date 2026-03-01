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
      { source: "/film-a-se-med-kjaeresten", destination: "/no/film-a-se-med-kjaeresten", statusCode: 301 },
      { source: "/hva-skal-vi-se-i-kveld", destination: "/no/hva-skal-vi-se-i-kveld", statusCode: 301 },
      { source: "/serie-a-se-sammen", destination: "/no/serie-a-se-sammen", statusCode: 301 },
      { source: "/film-for-filmkveld-med-venner", destination: "/no/film-for-filmkveld-med-venner", statusCode: 301 },
      { source: "/romantiske-filmer-netflix-norge", destination: "/no/romantiske-filmer-netflix-norge", statusCode: 301 },
      // English SEO pages → /en/ prefix
      { source: "/movies-for-date-night", destination: "/en/movies-for-date-night", statusCode: 301 },
      { source: "/what-should-we-watch-tonight", destination: "/en/what-should-we-watch-tonight", statusCode: 301 },
      { source: "/movie-to-watch-with-your-girlfriend", destination: "/en/movie-to-watch-with-your-girlfriend", statusCode: 301 },
      { source: "/movies-to-watch-with-friends", destination: "/en/movies-to-watch-with-friends", statusCode: 301 },
      { source: "/tv-shows-to-watch-together", destination: "/en/tv-shows-to-watch-together", statusCode: 301 },
    ];
  },
};

export default nextConfig;
