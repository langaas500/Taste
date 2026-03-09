import type { Metadata } from "next";
import { headers } from "next/headers";
import LandingContent from "./LandingContent";

const meta = {
  no: {
    title: "Logflix — Finn noe å se sammen",
    description: "Sveip på filmer og serier. Kun felles liker gir match.",
  },
  en: {
    title: "Logflix — Find something to watch together",
    description: "Swipe on movies and shows. Only mutual likes become a match.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const country = (h.get("x-vercel-ip-country") || "").toUpperCase();
  const locale: "no" | "en" = country === "NO" ? "no" : "en";
  const { title, description } = meta[locale];

  return {
    title,
    description,
    alternates: {
      canonical: "https://logflix.app",
    },
    openGraph: {
      title,
      description,
      url: "https://logflix.app",
      siteName: "Logflix",
      images: [
        {
          url: "https://logflix.app/og-v2.png",
          width: 1200,
          height: 630,
          alt: "Logflix — Watch Together",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://logflix.app/og-v2.png"],
    },
  };
}

export default async function Home() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || "";
  const locale: "no" | "en" = country === "NO" ? "no" : "en";

  return <LandingContent locale={locale} />;
}
