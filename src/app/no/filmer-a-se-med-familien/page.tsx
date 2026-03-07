import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Filmer å se med familien – finn noe alle vil se | Logflix",
  description:
    "Lei av å ikke bli enige? Finn filmer hele familien vil se med Logflix sin swipe-matching. Gratis å bruke.",
  alternates: {
    canonical: "https://logflix.app/no/filmer-a-se-med-familien",
    languages: {
      nb: "https://logflix.app/no/filmer-a-se-med-familien",
      en: "https://logflix.app/en/movies-to-watch-with-the-family",
      "x-default": "https://logflix.app/no/filmer-a-se-med-familien",
    },
  },
};

const faqItems = [
  {
    question: "Hvilke filmer passer for hele familien?",
    answer:
      "Filmer med tydelig handling, godt tempo og lite vold eller skummelt innhold fungerer best. Animasjonsfilmer fra Pixar, Disney og DreamWorks er ofte trygge valg, men også familiekomedier og eventyrfilmer treffer bredt på tvers av alder.",
  },
  {
    question: "Hva gjør vi når barna og de voksne vil se helt forskjellige ting?",
    answer:
      "Bruk Se Sammen — alle sveiper gjennom filmer på hvert sitt skjerm, og appen viser kun titler der flere har sagt ja. Det fungerer overraskende godt fordi mange filmer treffer bredere enn man tror.",
  },
  {
    question: "Finnes det en aldersgrense-filter?",
    answer:
      "Logflix henter aldersgrenser fra TMDB, og du kan filtrere etter sjanger og type. Kombinert med Se Sammen sikrer det at kun filmer alle er komfortable med dukker opp som matcher.",
  },
  {
    question: "Er Se Sammen gratis for familier?",
    answer:
      "Ja. Helt gratis, ingen app å laste ned og ingen registrering påkrevd. Åpne logflix.app/together på mobilen, del koden med familien, og start sveipingen.",
  },
];

export default function FilmerMedFamilienPage() {
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
        h1="Filmer å se med familien"
        heroSubtitle="Finn en film hele familien faktisk vil se — uten endeløs diskusjon foran TV-en."
        relatedLinks={[
          { href: "/together", label: "🔥 Prøv Se Sammen – Finn matchen nå" },
          { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
          { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
          { href: "/no/serie-a-se-sammen", label: "Serie å se sammen" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Sjangre som fungerer for hele familien
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Komedie", examples: "Home Alone, Liar Liar" },
              { label: "Eventyr", examples: "Indiana Jones, Jumanji" },
              { label: "Animasjon", examples: "Coco, Inside Out, Shrek" },
              { label: "Familie", examples: "Paddington, Matilda" },
              { label: "Fantasy", examples: "Harry Potter, Narnia" },
              { label: "Action", examples: "The Incredibles, Spy Kids" },
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
          Familiefilmkveld høres koselig ut — helt til det er tid for å velge film. Barna
          vil se noe morsomt, tenåringen vil ha action, og de voksne orker ikke enda en
          animasjonsfilm. Resultatet er at alle scroller i hver sin retning, og kvelden
          forsvinner i diskusjon i stedet for foran skjermen. Logflix lar alle sveipe
          gjennom filmer på hvert sitt skjerm og viser kun det familien overlapper på.
          Ingen trenger å overbevise noen, og ingen føler at de ga etter. Det tar under
          tre minutter, fungerer rett i nettleseren, og krever verken app eller
          registrering.
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvorfor er det så vanskelig å velge film for hele familien?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            Når to personer skal bli enige er det utfordrende nok. Med en hel familie —
            kanskje fire, fem eller seks personer med ulik alder, ulike referanser og ulikt
            humør — blir det eksponentielt vanskeligere. En seksåring har helt andre
            forventninger enn en fjortenåring, som igjen har andre preferanser enn foreldrene.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            I tillegg spiller gruppedynamikken inn. Ofte er det én person som foreslår, og
            resten som reagerer. Den som foreslår føler press, og de som sier nei føler seg
            vanskelige. Resultatet er enten at den høyeste stemmen vinner, eller at alle
            gir opp og ser på telefonen i stedet.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            Se Sammen løser dette ved å fjerne hele forhandlingen. Hvert familiemedlem
            sveiper gjennom filmer på sin egen skjerm — uavhengig, uten å se hva andre
            velger. Appen finner automatisk titler der flere har sagt ja, og presenterer
            dem som matcher. Ingen diskusjon, ingen kompromiss.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0,
          }}>
            Det overraskende er hvor ofte familier finner overlapp de ikke visste de hadde.
            Mange filmer treffer bredere enn man tror — og når alle har sveipet ja
            uavhengig av hverandre, vet du at hele familien faktisk gleder seg til det
            dere skal se.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
