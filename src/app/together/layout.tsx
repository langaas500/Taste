import type { Metadata } from "next";

const defaultTitle = "Se Sammen — Finn noe å se sammen | Logflix";
const defaultDescription =
  "Sveip hver for dere, match på det begge vil se. Gratis verktøy som løser «hva skal vi se i kveld?» på under 3 minutter.";

const challengeTexts: Record<string, string> = {
  no: "Klarer dere å finne kveldens film på under 3 min?",
  en: "Can you find tonight's movie in under 3 min?",
  se: "Klarar ni hitta kvällens film på under 3 min?",
  dk: "Kan I finde aftenens film på under 3 min?",
  fi: "Löydättekö illan elokuvan alle 3 minuutissa?",
};

const matchTitleTexts: Record<string, (t: string) => string> = {
  no: (t) => `Vi matchet på ${t}! 🎬`,
  en: (t) => `We matched on ${t}! 🎬`,
  se: (t) => `Vi matchade på ${t}! 🎬`,
  dk: (t) => `Vi matchede på ${t}! 🎬`,
  fi: (t) => `Matchasimme: ${t}! 🎬`,
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const isMatch = params?.ref === "match";
  const title = typeof params?.title === "string" ? params.title : "";
  const poster = typeof params?.poster === "string" ? params.poster : "";
  const locale = typeof params?.locale === "string" ? params.locale : "no";

  if (isMatch && title) {
    const ogImage = `https://logflix.app/api/og/match?title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&locale=${locale}`;
    const matchTitle = (matchTitleTexts[locale] || matchTitleTexts.no)(title);
    const challenge = challengeTexts[locale] || challengeTexts.no;

    return {
      title: matchTitle,
      description: challenge,
      alternates: { canonical: "https://logflix.app/together" },
      openGraph: {
        title: matchTitle,
        description: challenge,
        url: "https://logflix.app/together",
        siteName: "Logflix",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: matchTitle,
        description: challenge,
        images: [ogImage],
      },
    };
  }

  return {
    title: defaultTitle,
    description: defaultDescription,
    alternates: { canonical: "https://logflix.app/together" },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: "https://logflix.app/together",
      siteName: "Logflix",
      type: "website",
      images: ["/og-v2.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: ["/og-v2.png"],
    },
  };
}

const togetherJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Se Sammen",
  alternateName: "Watch Together",
  url: "https://logflix.app/together",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NOK",
  },
  description:
    "Gratis verktøy for par og venner som vil finne noe å se sammen. Begge sveiper på filmer og serier — kun felles liker gir match.",
  featureList: [
    "Swipe matching",
    "Streaming filters",
    "No account required",
    "Couple movie finder",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "247",
    bestRating: "5",
    worstRating: "1",
  },
  inLanguage: ["nb", "en"],
  isPartOf: {
    "@type": "WebSite",
    name: "Logflix",
    url: "https://logflix.app",
  },
};

export default function TogetherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Hvordan finne en film å se sammen",
    description:
      "Bruk Se Sammen på Logflix for å matche med partneren din på under 3 minutter.",
    step: [
      {
        "@type": "HowToStep",
        name: "Opprett en sesjon",
        text: "Gå til logflix.app/together og trykk 'Start med partner'. Del koden med partneren din.",
      },
      {
        "@type": "HowToStep",
        name: "Sveip hver for dere",
        text: "Dere sveiper uavhengig gjennom filmer og serier. Ingen ser hva den andre velger.",
      },
      {
        "@type": "HowToStep",
        name: "Se matchen",
        text: "Når dere begge liker samme tittel blir det en match. Start filmkvelden.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(togetherJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      {children}
    </>
  );
}
