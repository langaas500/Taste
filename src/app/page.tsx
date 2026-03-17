import type { Metadata } from "next";
import { headers } from "next/headers";
import LandingContent, { type Locale } from "./LandingContent";

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  NO: "no",
  SE: "sv",
  DK: "da",
  FI: "fi",
};

function resolveLocale(country: string): Locale {
  return COUNTRY_TO_LOCALE[country.toUpperCase()] || "en";
}

const meta = {
  no: {
    title: "Logflix — Finn noe å se sammen",
    description: "Sveip på filmer og serier. Kun felles liker gir match.",
  },
  sv: {
    title: "Logflix — Hitta något att se tillsammans",
    description: "Swipa på filmer och serier. Bara gemensamma likes blir en match.",
  },
  da: {
    title: "Logflix — Find noget at se sammen",
    description: "Swipe på film og serier. Kun fælles likes giver match.",
  },
  fi: {
    title: "Logflix — Löydä jotain katsottavaa yhdessä",
    description: "Swaippaa elokuvia ja sarjoja. Vain yhteisistä tykkäyksistä tulee match.",
  },
  en: {
    title: "Logflix — Find something to watch together",
    description: "Swipe on movies and shows. Only mutual likes become a match.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const country = (h.get("x-vercel-ip-country") || "").toUpperCase();
  const locale = resolveLocale(country);
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
  const locale = resolveLocale(country);

  return <LandingContent locale={locale} />;
}
