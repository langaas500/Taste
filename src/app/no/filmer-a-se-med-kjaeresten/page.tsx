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
        heroSubtitle={`"Du velger." Så du gjør det. "Hmm, kanskje noe annet." Kjent?`}
        ctaText="Slutt å gjette. Finn noe på 3 minutter."
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
            &laquo;Hva skal vi se?&raquo;
            <br />&laquo;Hva som helst.&raquo;
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Så du foreslår noe. Pause.
            <br />&laquo;Kanskje noe annet.&raquo;
            <br />Du prøver igjen. Samme reaksjon.
            <br />Til slutt ser dere Friends. Igjen.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Det er ikke smaken.
            <br />Det er prosessen. Å foreslå ansikt til ansikt gjør hvert valg til en test.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "Du foreslår noe — den andre nøler. Nå føler du deg avvist.",
              "Den andre foreslår noe — du sier kanskje. Nå slutter de å prøve.",
              "\"Hva som helst\" betyr \"velg noe jeg liker, men jeg sier ikke hva\"",
              "Dere holder tilbake favorittene fordi avslag stikker",
              "Dere ser noe om igjen fordi det er tryggere enn å feile",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Dere foreslår ikke. Dere forhandler ikke. Dere matcher.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Begge sveiper på egen telefon. Ingen ser hva den andre velger. Når likesene overlapper — det er det dere ser. Ingen forslag. Ingen veto. Ingen &laquo;er du sikker?&raquo;
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Åpne logflix.app/together", desc: "Ingen app. Ingen konto. Bare åpne." },
              { title: "Velg tjenester", desc: "Netflix, HBO, Disney+, Viaplay — det dere har. Dere ser bare det som faktisk er tilgjengelig." },
              { title: "Send koden", desc: "6 bokstaver. Kjæresten er koblet på sekunder." },
              { title: "Sveip privat", desc: "25 titler. Høyre = ja, venstre = nei. Ingen ser hva du velger." },
              { title: "Se overlappen", desc: "Bare det dere BEGGE likte. Trykk for å se." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            3 minutter. Dere ser bare det dere begge vil ha.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Lav risiko — dere sier ja til disse
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Forbrytelse", year: 2024, type: "Serie", note: "Norsk, kort, intens. Enkelt ja fra begge. Dere ser den ferdig i kveld." },
              { title: "Anatomie d'une chute", year: 2023, type: "Film", note: "Dere kommer til å diskutere etterpå. Det er hele poenget." },
              { title: "The Bear", year: 2022, type: "Serie", note: "20 minutter per episode. Lav terskel å starte, umulig å stoppe." },
              { title: "Past Lives", year: 2023, type: "Film", note: "For en rolig kveld. Ikke kjedelig — bare stille på den gode måten." },
              { title: "Shogun", year: 2024, type: "Serie", note: "Trygt valg som ikke føles trygt. Visuelt, stort, og dere vil fortsette." },
              { title: "Saltburn", year: 2023, type: "Film", note: "Litt uforutsigbar, litt mørk. Dere snakker om den etterpå — garantert." },
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

        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 8 }}>
          Den beste filmen er ikke den du velger.
          <br />Det er den dere begge sier ja til.
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Slutt å foreslå. Slutt å gjette. Bare match.
        </p>

        <FaqSection title="Vanlige spørsmål" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
