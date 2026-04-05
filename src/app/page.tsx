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
    title: "Slutt å krangle om hva dere skal se — Logflix",
    description: "Logflix løser «hva skal vi se i kveld» — for par, venner og familier. Sveip, match og finn noe å se sammen på sekunder.",
  },
  sv: {
    title: "Sluta bråka om vad ni ska se — Logflix",
    description: "Logflix löser «vad ska vi se ikväll» — för par, vänner och familjer. Swipa, matcha och hitta något att se tillsammans på sekunder.",
  },
  da: {
    title: "Stop med at skændes om hvad I skal se — Logflix",
    description: "Logflix løser «hvad skal vi se i aften» — for par, venner og familier. Swipe, match og find noget at se sammen på sekunder.",
  },
  fi: {
    title: "Lopeta riitely siitä mitä katsotte — Logflix",
    description: "Logflix ratkaisee «mitä katsotaan tänään» — pareille, ystäville ja perheille. Swaippaa, matchaa ja löydä katsottavaa sekunneissa.",
  },
  en: {
    title: "Stop arguing about what to watch — Logflix",
    description: "Logflix solves what to watch tonight — for couples, friends and families worldwide. Swipe, match and enjoy.",
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

  return (
    <>
      <LandingContent locale={locale} />
      {/* SEO link cluster — server-rendered, always crawlable */}
      <nav style={{ maxWidth: 540, margin: "0 auto", padding: "0 24px 48px", textAlign: "center" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <li><a href="/en/what-to-watch-together" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>What to watch together</a></li>
          <li><a href="/en/cant-decide-what-to-watch" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Can&apos;t decide what to watch</a></li>
          <li><a href="/en/what-to-watch-with-girlfriend" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>What to watch with your girlfriend</a></li>
          <li><a href="/en/find-something-to-watch-fast" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Find something to watch fast</a></li>
          <li><a href="/no/filmer-a-se-med-kjaeresten" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Filmer å se med kjæresten</a></li>
        </ul>
      </nav>
    </>
  );
}
