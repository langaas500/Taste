import type { Metadata } from "next";

const defaultTitle = "Watch Together — Find something to watch together | Logflix";
const defaultDescription =
  "Swipe apart, match on what you both want to watch. Free tool that solves «what should we watch tonight?» in under 3 minutes.";

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

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  alternates: { canonical: "https://logflix.app/together" },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "https://logflix.app/together",
    siteName: "Logflix",
    type: "website",
    images: [{ url: "/og-together.png?v=3", width: 1200, height: 630, alt: "Watch Together on Logflix – Swipe apart, match together" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-together.png?v=3"],
  },
};

const togetherJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Watch Together",
  alternateName: "Se Sammen",
  url: "https://logflix.app/together",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NOK",
  },
  description:
    "Free tool for couples and friends who want to find something to watch together. Both swipe on movies and shows — only mutual likes become a match.",
  featureList: [
    "Swipe matching",
    "Streaming service filters",
    "No account required",
    "No app download needed",
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
    name: "How to find a movie to watch together",
    description:
      "Use Watch Together on Logflix to match with your partner in under 3 minutes.",
    totalTime: "PT3M",
    step: [
      {
        "@type": "HowToStep",
        name: "Create a session",
        text: "Go to logflix.app/together and tap 'Start with partner'. Share the code with your partner.",
      },
      {
        "@type": "HowToStep",
        name: "Swipe independently",
        text: "Both of you swipe through movies and shows independently. Neither sees what the other picks.",
      },
      {
        "@type": "HowToStep",
        name: "See the match",
        text: "When you both like the same title, it's a match. Start watching.",
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
