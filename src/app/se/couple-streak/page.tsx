import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Parstreak — Håll filmkvällarna igång | Logflix",
  description:
    "Håll parstreaken vid liv. Matcha på en film varje vecka och lås upp belöningar.",
  alternates: {
    canonical: `${BASE}/se/couple-streak`,
    languages: {
      nb: `${BASE}/no/couple-streak`,
      sv: `${BASE}/se/couple-streak`,
      da: `${BASE}/dk/couple-streak`,
      fi: `${BASE}/fi/couple-streak`,
      en: `${BASE}/en/couple-streak`,
      "x-default": `${BASE}/en/couple-streak`,
    },
  },
  openGraph: {
    title: "Parstreak — Håll filmkvällarna igång | Logflix",
    description:
      "Håll parstreaken vid liv. Matcha på en film varje vecka och lås upp belöningar.",
    url: `${BASE}/se/couple-streak`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hur fungerar parstreaken?",
    answer:
      "Varje gång du och din partner matchar på en film eller serie i Se Tillsammans inom en vecka ökar din streak med ett. Räknaren nollställs om en hel vecka går utan match. Den är designad för att vara enkel att hålla igång — en match per vecka är allt som krävs.",
  },
  {
    question: "Vilka belöningar låser man upp?",
    answer:
      "Vid 4 veckor låser du upp en kurerad 'Klassiker'-guidesamling. Vid 8 veckor får du 'Dolda skatter' — mindre kända titlar matchade mot ert pars smak. Vid 12 veckor låser du upp 'Helgval' — en premium stämningsbaserad guide. Fler belöningar tillkommer löpande.",
  },
  {
    question: "Fryser min streak om jag avslutar premium?",
    answer:
      "Ja. Om du avslutar din Logflix Premium-prenumeration fryses din streak — den försvinner inte. När du prenumererar igen fortsätter streaken exakt där du slutade. Inga framsteg raderas någonsin.",
  },
  {
    question: "Behöver båda partners ett Logflix-konto?",
    answer:
      "Bara en partner behöver ett Logflix-konto för att följa streaken. Den andra kan delta i Se Tillsammans-sessioner som gäst med den sexsiffriga koden. Men om båda har konton får ni tillgång till hela parrapporten och smakkompatibilitetsfunktionerna.",
  },
];

export default function CoupleStreakPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" },
              { "@type": "ListItem", position: 2, name: "Se Tillsammans", item: "https://logflix.app/se/watch-together" },
              { "@type": "ListItem", position: 3, name: "Parstreak", item: "https://logflix.app/se/couple-streak" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Logflix Parstreak",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/se/couple-streak`,
            featureList: [
              "Veckovis matchstreakspårning",
              "Spelifierade belöningar",
              "Kurerade guideupplåsningar",
              "Frusen streak vid paus",
            ],
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "NOK",
              description: "Logflix Premium",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2026-03-25",
            dateModified: "2026-03-25",
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
        h1="Parstreak — Håll filmkvällarna igång"
        heroSubtitle="Matcha på en film varje vecka. Bygg din streak. Lås upp exklusiva belöningar."
        ctaText="Starta Se Tillsammans — gratis"
        trustLine="En match per vecka · Belöningar vid 4, 8 och 12 veckor · Streaken fryser vid paus"
        relatedLinks={[
          { href: "/together", label: "Starta Se Tillsammans nu" },
          { href: "/se/watch-together", label: "Hur Se Tillsammans fungerar" },
          { href: "/se/taste-profile", label: "Din smakprofil" },
          { href: "/se/wrapped", label: "Logflix Wrapped — ditt filmår" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Vad är parstreaken?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Parstreaken spårar hur många veckor i rad du och din partner har matchat på en
            film eller serie i Se Tillsammans. En match per vecka är allt som krävs för att
            hålla streaken vid liv. Missar ni en vecka nollställs den.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Det låter enkelt — och det är det. Men just enkelheten är poängen. Streaken ger
            er en liten, återkommande anledning att sätta er ner tillsammans och välja något
            att titta på. Ingen press att binga, inget åtagande utöver en titel per vecka.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Din streak visas på Se Tillsammans-startskärmen. När den är i riskzonen (mindre
            än en dag kvar av veckan) ser du en varning. Det är en mild påminnelse, inte en
            notifikationsstorm.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Belöningar som faktiskt betyder något
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                weeks: "4",
                title: "Klassiker",
                desc: "En kurerad guide med klassiska filmer matchade mot ert pars smak. Inte vilka klassiker som helst — de ni mest sannolikt kommer att gilla baserat på er tittarhistorik.",
              },
              {
                weeks: "8",
                title: "Dolda skatter",
                desc: "Mindre kända titlar med höga betyg som matchar era gemensamma preferenser. Den typen av filmer ni aldrig skulle hitta genom att scrolla Netflix, men som ni båda kommer att älska.",
              },
              {
                weeks: "12",
                title: "Helgval",
                desc: "En premium stämningsbaserad guidesamling. Tänk 'Perfekt för en regnig söndag' eller 'Klassisk dejtkväll' — personanpassad för just ert pars unika smakprofil.",
              },
            ].map(({ weeks, title, desc }) => (
              <div
                key={weeks}
                style={{
                  display: "flex",
                  gap: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,42,42,0.12)",
                    color: "#ff2a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {weeks}v
                </span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            padding: "24px 20px",
            marginBottom: 40,
            background: "rgba(255,42,42,0.04)",
            border: "1px solid rgba(255,42,42,0.15)",
            borderRadius: 14,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Börja bygga din streak ikväll
          </p>
          <a
            href="/together"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#ff2a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Starta Se Tillsammans — gratis
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            Inget konto krävs för att spela · Streakspårning kräver ett gratis konto
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Varför spelifiera filmkvällen?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            De flesta par faller in i ett mönster: en period av filmkvällar, sedan veckor av
            ingenting. Streakmekaniken skapar ett lättviktigt åtagande som håller vanan igång
            utan att det blir ett tvång. En match per vecka är tillräckligt lågtröskel för att
            klara även under stressiga perioder.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Belöningarna är designade för att mata tillbaka in i upplevelsen. Att låsa upp en
            kurerad guide ger er nya titlar att utforska tillsammans, vilket i sin tur gör
            nästa Se Tillsammans-session mer intressant. Det är en positiv spiral: titta
            tillsammans, lås upp innehåll, upptäck mer, titta tillsammans igen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
