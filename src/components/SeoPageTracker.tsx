"use client";

import { useEffect } from "react";
import { track } from "@/lib/posthog";

export default function SeoPageTracker({
  tmdbId,
  slug,
  region,
  type,
}: {
  tmdbId: number;
  slug: string;
  region: string;
  type: "movie" | "tv";
}) {
  useEffect(() => {
    track("seo_page_view", {
      title_id: tmdbId,
      title_slug: slug,
      region,
      type,
      referrer: document.referrer,
      referring_domain: document.referrer
        ? new URL(document.referrer).hostname
        : "direct",
    });
  }, [tmdbId, slug, region, type]);

  return null;
}
