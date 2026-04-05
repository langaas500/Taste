import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Filmer å se med kjæresten — finn noe dere begge vil se | Logflix",
  description:
    "Sveip filmer og serier hver for dere. Bare felles likes gir match. Gratis, ingen app, ferdig på 3 minutter.",
  alternates: {
    canonical: "https://logflix.app/no/filmer-a-se-med-kjaeresten",
    languages: {
      nb: "https://logflix.app/no/filmer-a-se-med-kjaeresten",
      en: "https://logflix.app/en/what-to-watch-with-girlfriend",
      "x-default": "https://logflix.app/en/what-to-watch-with-girlfriend",
    },
  },
};

const faqItems = [
  {
    question: "Hva om vi liker helt forskjellige ting?",
    answer: "Det er nettopp det Se Sammen løser. Dere sveiper uavhengig, og ingen ser hva den andre velger. De fleste par blir overrasket over hvor mye de overlapper — dere er nok mer enige enn dere tror.",
  },
  {
    question: "Trenger vi konto?",
    answer: "Nei. Ingen av dere trenger konto eller app. Åpne logflix.app/together, trykk Start, og del koden med kjæresten din. Ferdig.",
  },
  {
    question: "Kan vi filtrere på strømmetjeneste?",
    answer: "Ja. Før dere begynner å sveipe velger dere hvilke strømmetjenester dere har — Netflix, HBO Max, Disney+, Viaplay og flere. Bare titler som er tilgjengelige på de tjenestene dukker opp.",
  },
  {
    question: "Funker det for vennegjenger også?",
    answer: "Se Sammen er laget for to, men Logflix har også Gruppevalg for 3 eller flere — samme sveipekonsept med ekstra avstemningsrunder.",
  },
];

export default function FilmerMedKjaerestenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2026-04-05",
            dateModified: "2026-04-05",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
      <SeoGuideLayout
        locale="no"
        h1="Filmer å se med kjæresten"
        heroSubtitle="Slutt å krangle om hva dere skal se. Sveip hver for dere og finn noe dere begge faktisk vil se."
        ctaText="Prøv Se Sammen — gratis"
        trustLine="Gratis · 3 minutter · Ingen app · Ingen konto"
        relatedLinks={[
          { href: "/en/what-to-watch-together", label: "What to watch together (English)" },
          { href: "/together", label: "Start Se Sammen nå" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Sist oppdatert: April 2026
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Filmkveld-loopen alle kjenner
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Du spør hva hen vil se. &quot;Hva som helst.&quot; Du foreslår noe. &quot;Hmm, kanskje noe annet.&quot; Etter 30 minutter med scrolling ender dere opp med å se Friends for tredje gang. Filmkvelden er over før den begynte.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Problemet er ikke smaken deres. Det er prosessen. Å foreslå filmer ansikt til ansikt legger press på hvert forslag — ingen vil skyte ned den andres ide, så begge spiller det trygt.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "For mange valg spredt over Netflix, HBO Max, Disney+, Viaplay og TV 2 Play",
              "Å foreslå en film føles som en test du kan feile",
              "\"Hva som helst\" betyr egentlig \"velg noe jeg også liker, men jeg sier ikke hva\"",
              "Dere unngår egne favoritter fordi dere er usikre på om den andre liker det",
              "Dere defaulter til å se noe om igjen fordi det er det eneste trygge valget",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Sveip hver for dere — finn overlappen
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Se Sammen fjerner forhandlingen helt. Begge sveiper gjennom filmer og serier på egen telefon. Ingen ser hva den andre velger. Når likesene overlapper — det er matchen deres.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Åpne logflix.app/together", desc: "Ingen app, ingen konto. Funker i alle nettlesere." },
              { title: "Velg strømmetjenester", desc: "Huk av Netflix, Disney+, HBO Max, Viaplay — det dere har. Bare tilgjengelige titler vises." },
              { title: "Del koden", desc: "Kjæresten scanner QR-koden eller taster inn 6-bokstavskoden. Koblet på sekunder." },
              { title: "Sveip uavhengig", desc: "25 titler hver. Høyre = interessert, venstre = nei takk. Ingen ser den andres valg." },
              { title: "Se matchen", desc: "Bare titler dere BEGGE likte vises. Trykk for å åpne i Netflix, HBO eller hvor den strømmes." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Hele greia tar 2–5 minutter. Dere ser bare det dere begge vil se — ingen kompromiss, ingen diskusjon.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Par-favoritter som funker for begge
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Forbrytelse", year: 2024, type: "Serie", note: "Norsk thriller som holder dere begge våkne. Kort og intens." },
              { title: "Anatomie d'une chute", year: 2023, type: "Film", note: "Rettsdrama som trigger diskusjon etterpå. Perfekt filmkveld-valg." },
              { title: "The Bear", year: 2022, type: "Serie", note: "Intenst, kort episoder, og overraskende følelsesladet. Vanskelig å stoppe." },
              { title: "Past Lives", year: 2023, type: "Film", note: "Stille og vakker. Ideell for en romantisk kveld." },
              { title: "Shogun", year: 2024, type: "Serie", note: "Episk fortelling med fantastisk visuelt uttrykk. For par som liker slow-burn." },
              { title: "Saltburn", year: 2023, type: "Film", note: "Mørk, visuell og uforutsigbar. Dere vil snakke om den etterpå." },
            ].map((pick) => (
              <div key={pick.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{pick.title}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{pick.year} · {pick.type}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{pick.note}</p>
              </div>
            ))}
          </div>
        </section>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Den beste filmkvelden er når dere begge faktisk vil se det som er på skjermen. La Se Sammen finne overlappen — uten krangling, uten kompromiss.
        </p>

        <FaqSection title="Vanlige spørsmål" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
