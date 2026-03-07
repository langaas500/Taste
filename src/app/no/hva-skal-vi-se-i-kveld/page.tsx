import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Hva skal vi se i kveld? Finn noe dere begge liker",
  description:
    "Lei av å scrolle i evigheter? Sveip hver for dere og se kun det dere faktisk matcher på. Bestem dere på under 3 minutter.",
  alternates: {
    canonical: "https://logflix.app/no/hva-skal-vi-se-i-kveld",
    languages: {
      nb: "https://logflix.app/no/hva-skal-vi-se-i-kveld",
      en: "https://logflix.app/en/what-should-we-watch-tonight",
      "x-default": "https://logflix.app/no/hva-skal-vi-se-i-kveld",
    },
  },
};

const faqItems = [
  {
    question: "Hvorfor tar det alltid så lang tid å velge?",
    answer: "For mange valg fører til beslutningsparalyse. Når begge skal enes om én film blant tusenvis, ender man lett opp med å bla i 40 minutter og så se ingenting. Se Sammen begrenser valgene til det dere faktisk overlapper på.",
  },
  {
    question: "Hva hvis vi liker helt ulike sjangre?",
    answer: "Det er akkurat der Se Sammen er sterkest. Dere sveiper uavhengig av hverandre — ingen ser hva den andre velger — og appen finner skjult overlapp dere kanskje ikke visste eksisterte.",
  },
  {
    question: "Hvilke strømmetjenester støttes?",
    answer: "Logflix viser innhold tilgjengelig på Netflix, HBO Max, Disney+, Apple TV+, Viaplay og flere. Du ser alltid hvilken tjeneste filmen er på før dere bestemmer dere.",
  },
  {
    question: "Koster det noe?",
    answer: "Se Sammen er helt gratis. Ingen registrering, ingen app å laste ned — bare åpne lenken og start.",
  },
];

export default function HvaSkalViSePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <SeoGuideLayout
        locale="no"
        h1="Hva skal vi se i kveld?"
        heroSubtitle="Lei av å bruke halve kvelden på å velge? Sveip og finn en film dere begge liker — på under 3 minutter."
        relatedLinks={[
          { href: "/together", label: "🔥 Prøv Se Sammen – Finn matchen nå" },
          { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
          { href: "/no/serie-a-se-sammen", label: "Serie å se sammen" },
          { href: "/no/film-for-filmkveld-med-venner", label: "Film for filmkveld med venner" },
          { href: "/no/filmer-a-se-med-familien", label: "Finn noe hele familien vil se" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hva passer kvelden?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Avslappende", examples: "Schitt's Creek, Ted Lasso" },
              { label: "Spenning", examples: "Succession, The Bear" },
              { label: "Romantisk", examples: "Normal People, About Time" },
              { label: "Action", examples: "John Wick, Top Gun" },
              { label: "Skummelt", examples: "The Haunting of Hill House" },
              { label: "Dokumentar", examples: "Making a Murderer, Free Solo" },
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
          Det største problemet med filmkvelden er ikke mangel på innhold — det er for mye.
          Se Sammen løser det ved å la dere begge sveipe ja eller nei, og kun vise matcher.
          Ingen diskusjon, ingen kompromiss — bare det dere faktisk begge vil se.
        </p>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
