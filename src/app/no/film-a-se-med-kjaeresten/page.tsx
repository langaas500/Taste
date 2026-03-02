import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Film å se med kjæresten – Finn en dere begge liker",
  description:
    "Unngå klein stemning og bomvalg. Finn en film dere begge har lyst til å se – uten å gjette eller krangle.",
  alternates: {
    canonical: "https://logflix.app/no/film-a-se-med-kjaeresten",
    languages: {
      no: "https://logflix.app/no/film-a-se-med-kjaeresten",
      en: "https://logflix.app/en/movie-to-watch-with-your-girlfriend",
      "x-default": "https://logflix.app/no/film-a-se-med-kjaeresten",
    },
  },
};

const faqItems = [
  {
    question: "Hva er en bra film å se med kjæresten?",
    answer:
      "Det beste er en film dere begge faktisk har lyst til å se. Start med stemningen: lett og morsomt, feel-good, drama eller thriller. Hvis dere ofte blir uenige, bruk Se Sammen — dere matcher kun på titler dere begge liker.",
  },
  {
    question: "Hva hvis vi liker helt forskjellige sjangre?",
    answer:
      "Da er matching hele poenget. Dere sveiper hver for dere gjennom filmer og serier, og kun det dere begge liker blir en match. Ingen kompromiss, ingen diskusjon.",
  },
  {
    question: "Hvor lang tid tar det å finne en film?",
    answer:
      "Sett en grense. Hvis dere fortsatt scroller etter et par minutter, blir dere sjelden mer enige. Med Se Sammen finner de fleste par en match på 2–3 minutter.",
  },
  {
    question: "Er Se Sammen gratis?",
    answer:
      "Ja. Helt gratis. Ingen app å laste ned og ingen registrering påkrevd. Åpne logflix.app/together på mobilen, del koden, og start sveipingen.",
  },
];

export default function FilmMedKjaerestenPage() {
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
        h1="Film å se med kjæresten"
        heroSubtitle="Slutt å scrolle i evigheter. Sveip hver for dere og finn en film dere begge liker — på under 3 minutter."
        relatedLinks={[
          { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
          { href: "/no/serie-a-se-sammen", label: "Serie å se sammen" },
          { href: "/no/romantiske-filmer-netflix-norge", label: "Romantiske filmer på Netflix Norge" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
            Stemninger
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6,
            marginBottom: 16, textAlign: "center",
          }}>
            Start med stemningen, ikke katalogen. Når dere har ulik smak, er det mye
            lettere å lande på en vibe først — så matcher dere raskere.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { mood: "😂 Komedie", desc: "Lett og trygg når dere vil le" },
              { mood: "✨ Feel-good", desc: "Varm, koselig, null stress" },
              { mood: "😢 Drama", desc: "Mer følelser, mer ettertanke" },
              { mood: "😱 Thriller", desc: "Spenning dere faktisk prater om" },
              { mood: "🎬 Klassiker", desc: "Tidløse valg som sjelden skuffer" },
              { mood: "🔥 Spenning", desc: "Tempo og plot, ikke småprat" },
            ].map(({ mood, desc }) => (
              <div key={mood} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {mood}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.4 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <p style={{
          color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32,
        }}>
          &ldquo;Hva skal vi se?&rdquo; høres enkelt ut, men blir ofte en hel prosess. Den ene
          vil ha noe lett, den andre vil ha spenning. Én er for trøtt til å følge
          med, den andre vil ikke kaste bort kvelden på noe halvhjertet. Se Sammen
          løser det: dere sveiper hver for dere — og kun titler dere begge liker
          blir en match.
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvorfor er det så vanskelig å bli enige?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            Det handler sjelden om dårlig smak — og nesten aldri om at den ene har «feil»
            preferanser. Når to personer med ulike filmvaner skal velge fra et bibliotek med
            tusenvis av titler, oppstår det som kalles beslutningsparalyse. Jo flere
            alternativer, desto vanskeligere er det å bestemme seg. Resultatet er at dere
            ender opp med å scrolle i evigheter, og til slutt velger noe halvhjertet — eller
            dropper filmkvelden helt.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            I tillegg kommer den sosiale dynamikken. De fleste vil ikke avvise partnerens
            forslag, fordi det føles avvisende. Dermed sier man ja til noe man egentlig ikke
            hadde lyst til å se, og stemningen starter skjevt allerede før åpningsscenen.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            Logflix fjerner denne friksjonen helt. Med Se Sammen sveiper dere gjennom filmer
            og serier på hvert deres skjerm — uavhengig og uten å se hva den andre velger.
            Kun titler der begge har sagt ja blir en match. Det betyr at ingen trenger å
            forhandle, og ingen trenger å «ofre seg».
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0,
          }}>
            Fordi matchene er basert på genuin interesse fra begge, starter filmkvelden med
            noe dere faktisk har lyst til å se sammen. Det tar under tre minutter, og krever
            verken app eller registrering.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
