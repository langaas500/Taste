import type { Metadata } from "next";
import { headers } from "next/headers";
import LandingContent from "./LandingContent";

export const metadata: Metadata = {
  title: "Logflix — Find something to watch together",
  description: "Swipe separately. Only mutual likes become a match. Free, no account needed.",
  openGraph: {
    title: "Logflix — Find something to watch together",
    description: "Swipe separately. Only mutual likes become a match.",
    url: "https://logflix.app",
    siteName: "Logflix",
    images: [{
      url: "https://logflix.app/og-image.png",
      width: 1200,
      height: 630,
      alt: "Logflix — Watch Together",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logflix — Find something to watch together",
    description: "Swipe separately. Only mutual likes become a match.",
    images: ["https://logflix.app/og-image.png"],
  },
};

export default async function Home() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || "";
  const locale: "no" | "en" = country === "NO" ? "no" : "en";

  return <LandingContent locale={locale} />;
}
