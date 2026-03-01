import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Romantiske filmer Netflix Norge – Slipp bomvalg",
  description:
    "Finn romantiske filmer som passer for dere begge. Unngå bomvalg og bruk mindre tid på å lete.",
  alternates: {
    canonical: "https://logflix.app/no/romantiske-filmer-netflix-norge",
    languages: {
      no: "https://logflix.app/no/romantiske-filmer-netflix-norge",
      en: "https://logflix.app/en/movies-for-date-night",
      "x-default": "https://logflix.app/no/romantiske-filmer-netflix-norge",
    },
  },
};

export default function RomantiskeFilmerNetflixPage() {
  return (
    <SeoGuideLayout
      locale="no"
      h1="Romantiske filmer på Netflix Norge"
      heroSubtitle="Fra lett rom-com til gripende drama — finn den romantiske filmen dere begge faktisk vil se."
      relatedLinks={[
        { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
        { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
        { href: "/no/serie-a-se-sammen", label: "Serie å se sammen" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Typer romantiske filmer på Netflix
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Rom-com", examples: "Set It Up, Always Be My Maybe" },
            { label: "Romantisk drama", examples: "The Notebook, Blue Valentine" },
            { label: "Feel-good", examples: "To All the Boys, Holidate" },
            { label: "Ungdomsromantikk", examples: "The Half of It, Sierra Burgess" },
            { label: "Internasjonal", examples: "Love Per Square Foot, Dolly Kitty" },
            { label: "Romantisk thriller", examples: "Purple Hearts, Dangerous Lies" },
          ].map((m) => (
            <div key={m.label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.4 }}>
                {m.examples}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p style={{
        color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32,
      }}>
        Netflix Norge har hundrevis av romantiske filmer — problemet er å finne én dere begge
        har lyst til å se. Logflix lar dere sveipe gjennom titler uavhengig av hverandre og
        viser kun matcher. Du slipper å overbevise den andre, og ingen trenger å ofre seg.
      </p>

      <FaqSection items={[
        {
          question: "Hvilke romantiske filmer er best på Netflix Norge akkurat nå?",
          answer: "Netflix oppdaterer biblioteket månedlig. Populære titler akkurat nå inkluderer romantiske komedier som Set It Up og Always Be My Maybe, og dramaer som Purple Hearts. Logflix henter alltid oppdatert tilgjengelighet direkte fra Netflix.",
        },
        {
          question: "Hva er forskjellen på rom-com og romantisk drama?",
          answer: "Rom-com (romantisk komedie) er lett, morsom og ender alltid godt — perfekt for en avslappet kveld. Romantisk drama utforsker dypere følelser og kan ha et mer åpent eller trist utfall. Begge fungerer godt for datekveld, avhengig av stemningen.",
        },
        {
          question: "Hvordan finner vi en romantisk film vi begge liker?",
          answer: "Bruk Se Sammen — dere sveiper gjennom filmer på hvert deres skjerm og appen finner overlapp automatisk. Tar under 3 minutter og krever ingen registrering.",
        },
        {
          question: "Finnes det romantiske serier på Netflix også?",
          answer: "Ja. Netflix har mange populære romantiske serier som Bridgerton, Virgin River og Emily in Paris. Logflix inkluderer både filmer og serier i sveipe-modusen.",
        },
      ]} />
    </SeoGuideLayout>
  );
}
