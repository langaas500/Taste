import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Par-streak — Hold filmkveldene i gang | Logflix",
  description:
    "Hold par-streaken i live. Match på en film hver uke og lås opp belønninger. Se hvor konsistente dere er som filmpar.",
  alternates: {
    canonical: `${BASE}/no/couple-streak`,
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
    title: "Par-streak — Hold filmkveldene i gang | Logflix",
    description:
      "Hold par-streaken i live. Match på en film hver uke og lås opp belønninger.",
    url: `${BASE}/no/couple-streak`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hvordan fungerer par-streaken?",
    answer:
      "Hver gang du og partneren din matcher på en film eller serie i Se Sammen innen en uke, øker streaken med én. Streak-telleren nullstilles hvis en hel uke passerer uten en match. Den er designet for å være enkel å vedlikeholde — én match per uke er alt som skal til.",
  },
  {
    question: "Hvilke belønninger låser du opp?",
    answer:
      "Ved 4 uker låser du opp en kuratert «Klassikere»-guidesamling. Ved 8 uker får du «Skjulte perler» — mindre kjente titler tilpasset parets smak. Ved 12 uker låser du opp «Helgevalg» — en premium stemningsbasert guide. Flere belønninger legges til over tid.",
  },
  {
    question: "Fryses streaken min hvis jeg avslutter premium?",
    answer:
      "Ja. Hvis du avslutter Logflix Premium-abonnementet, fryses streaken — den slettes ikke. Når du abonnerer igjen, fortsetter streaken nøyaktig der du slapp. Ingen fremgang går tapt.",
  },
  {
    question: "Trenger begge partnere en Logflix-konto?",
    answer:
      "Bare én partner trenger en Logflix-konto for å spore streaken. Den andre kan bli med i Se Sammen-økter som gjest via den 6-bokstavige koden. Men å ha begge kontoer gir tilgang til full par-rapport og smakskompatibilitetsfunksjoner.",
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
              { "@type": "ListItem", position: 2, name: "Se Sammen", item: "https://logflix.app/together" },
              { "@type": "ListItem", position: 3, name: "Par-streak", item: "https://logflix.app/no/couple-streak" },
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
            name: "Logflix Par-streak",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/no/couple-streak`,
            featureList: [
              "Ukentlig match-streak-sporing",
              "Gamifiserte belønninger",
              "Kuraterte guide-opplåsninger",
              "Frossen streak ved pause",
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
        h1="Par-streak — Hold filmkveldene i gang"
        heroSubtitle="Match på en film hver uke. Bygg streaken. Lås opp eksklusive belønninger."
        ctaText="Start Se Sammen — gratis"
        trustLine="Én match per uke · Belønninger ved 4, 8 og 12 uker · Streaken fryses hvis du pauser"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen nå" },
          { href: "/no/tonight-pick", label: "Kveldens valg" },
          { href: "/no/taste-profile", label: "Din smaksprofil" },
          { href: "/no/wrapped", label: "Logflix Wrapped — filmåret ditt" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hva er par-streaken?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Par-streaken sporer hvor mange uker på rad du og partneren din har matchet på en
            film eller serie i Se Sammen. Én match per uke er alt som skal til for å holde
            streaken i live. Går det en hel uke uten match, nullstilles den.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Det høres enkelt ut — og det er det. Men den enkelheten er poenget. Streaken gir
            dere en liten, tilbakevendende grunn til å sette dere ned sammen og velge noe å se.
            Ingen press om å binge, ingen forpliktelse utover én tittel per uke.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Streaken din er synlig på Se Sammen-startskjermen. Når den er i fare (mindre enn
            en dag igjen av uken), ser du en advarsel. Det er et forsiktig dytt, ikke et
            bombardement av varsler.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Belønninger som betyr noe
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                weeks: "4",
                title: "Klassikere",
                desc: "En kuratert guide med klassiske filmer tilpasset parets smak. Ikke hvilke som helst klassikere — de dere mest sannsynlig vil like basert på seerhistorikken.",
              },
              {
                weeks: "8",
                title: "Skjulte perler",
                desc: "Mindre kjente titler med høye vurderinger som matcher deres felles preferanser. Den typen filmer dere aldri finner ved å scrolle Netflix, men som dere begge vil elske.",
              },
              {
                weeks: "12",
                title: "Helgevalg",
                desc: "En premium stemningsbasert guidesamling. Tenk «Perfekt for en regntung søndag» eller «Klassikere for datekveld» — personalisert for parets unike smaksprofil.",
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
                  {weeks}u
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
            Start å bygge streaken i kveld
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
            Start Se Sammen — gratis
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            Ingen konto nødvendig · Streak-tracking krever gratis konto
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvorfor gamifisere filmkvelden?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            De fleste par faller inn i et mønster: et rush av filmkvelder, så uker med ingenting.
            Streak-mekanikken skaper en lett forpliktelse som holder vanen i gang uten at det
            blir et ork. Én match per uke er lavterskel nok til å vedlikeholde selv i travle
            perioder.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Belønningene er designet for å mate tilbake inn i opplevelsen. Å låse opp en
            kuratert guide gir dere nye titler å utforske sammen, som igjen gjør neste Se
            Sammen-økt mer interessant. Det er en god sirkel: se sammen, lås opp innhold,
            oppdag mer, se sammen igjen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
