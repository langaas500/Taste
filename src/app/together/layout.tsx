import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Se Sammen — Finn noe å se sammen | Logflix",
  description:
    "Sveip hver for dere, match på det begge vil se. Gratis verktøy som løser «hva skal vi se i kveld?» på under 3 minutter.",
  alternates: {
    canonical: "https://logflix.app/together",
  },
  openGraph: {
    title: "Se Sammen — Finn noe å se sammen | Logflix",
    description:
      "Sveip hver for dere, match på det begge vil se. Gratis verktøy som løser «hva skal vi se i kveld?» på under 3 minutter.",
    url: "https://logflix.app/together",
    siteName: "Logflix",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Se Sammen — Finn noe å se sammen | Logflix",
    description:
      "Sveip hver for dere, match på det begge vil se. Gratis verktøy som løser «hva skal vi se i kveld?» på under 3 minutter.",
    images: ["/og-image.png"],
  },
};

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(togetherJsonLd) }}
      />
      {children}
    </>
  );
}
