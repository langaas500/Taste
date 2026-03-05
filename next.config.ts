import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/api/sitemap" },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
  disableLogger: true,
});
