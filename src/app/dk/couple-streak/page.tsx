import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Par-streak — Hold filmaftenerne i gang | Logflix",
  description:
    "Hold jeres par-streak i live. Match på en film hver uge og lås op for belønninger. Se, hvor konsistente I er som filmpar.",
  alternates: {
    canonical: `${BASE}/dk/couple-streak`,
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
    title: "Par-streak — Hold filmaftenerne i gang | Logflix",
    description:
      "Hold jeres par-streak i live. Match på en film hver uge og lås op for belønninger.",
    url: `${BASE}/dk/couple-streak`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hvordan fungerer par-streaken?",
    answer:
      "Hver gang du og din partner matcher på en film eller serie i Se Sammen inden for en uge, stiger jeres streak med én. Streak-tælleren nulstilles, hvis en hel uge går uden et match. Den er designet til at være nem at vedligeholde — ét match om ugen er alt, der kræves.",
  },
  {
    question: "Hvilke belønninger låser man op?",
    answer:
      "Ved 4 uger låser du op for en kurateret 'Klassikere'-guidesamling. Ved 8 uger får du 'Skjulte skatte' — mindre kendte titler matchet til jeres parsmag. Ved 12 uger låser du op for 'Weekendvalg' — en premium stemningsbaseret guide. Flere belønninger tilføjes løbende.",
  },
  {
    question: "Fryser min streak, hvis jeg opsiger premium?",
    answer:
      "Ja. Hvis du opsiger dit Logflix Premium-abonnement, fryses din streak — den slettes ikke. Når du genabonnerer, fortsætter din streak præcis, hvor du slap. Ingen fremskridt slettes nogensinde.",
  },
  {
    question: "Skal begge partnere have en Logflix-konto?",
    answer:
      "Kun én partner behøver en Logflix-konto for at tracke streaken. Den anden kan deltage i Se Sammen-sessioner som gæst med den 6-cifrede kode. Men begge parter med konti giver adgang til den fulde parrapport og smagskompatibilitetsfunktioner.",
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
              { "@type": "ListItem", position: 2, name: "Se Sammen", item: "https://logflix.app/dk/watch-together" },
              { "@type": "ListItem", position: 3, name: "Par-streak", item: "https://logflix.app/dk/couple-streak" },
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
            url: `${BASE}/dk/couple-streak`,
            featureList: [
              "Ugentlig match-streak tracking",
              "Gamificerede belønninger",
              "Kuraterede guide-oplåsninger",
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
        h1="Par-streak — Hold filmaftenerne i gang"
        heroSubtitle="Match på en film hver uge. Byg jeres streak. Lås op for eksklusive belønninger."
        ctaText="Start Se Sammen — gratis"
        trustLine="Ét match om ugen · Belønninger ved 4, 8 og 12 uger · Streaken fryser, hvis I holder pause"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen nu" },
          { href: "/dk/watch-together", label: "Sådan fungerer Se Sammen" },
          { href: "/dk/taste-profile", label: "Din smagsprofil" },
          { href: "/dk/wrapped", label: "Logflix Wrapped — jeres filmår" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvad er par-streaken?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Par-streaken tracker, hvor mange uger i træk du og din partner har matchet
            på en film eller serie i Se Sammen. Ét match om ugen er alt, der kræves for at holde
            streaken i live. Spring en uge over, og den nulstilles.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Det lyder simpelt — og det er det. Men den enkelhed er pointen. Streaken giver jer en
            lille, tilbagevendende grund til at sætte jer ned sammen og vælge noget at se. Intet
            pres for at binge, ingen forpligtelse ud over én titel om ugen.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Jeres streak er synlig på Se Sammen-startskærmen. Når den er i fare
            (mindre end en dag tilbage af ugen), ser I en advarsel. Det er et mildt puf,
            ikke en notifikationsbombardement.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Belønninger, der rent faktisk betyder noget
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                weeks: "4",
                title: "Klassikere",
                desc: "En kurateret guide med must-see klassiske film matchet til jeres parsmag. Ikke bare tilfældige klassikere — dem, I med størst sandsynlighed vil nyde baseret på jeres seerhistorik.",
              },
              {
                weeks: "8",
                title: "Skjulte skatte",
                desc: "Mindre kendte titler med høje bedømmelser, der matcher jeres fælles præferencer. Den slags film, I aldrig ville finde ved at scrolle Netflix, men som I begge vil elske.",
              },
              {
                weeks: "12",
                title: "Weekendvalg",
                desc: "En premium stemningsbaseret guidesamling. Tænk 'Perfekt til en regnvejrssøndag' eller 'Date night-klassikere' — personaliseret til jeres pars unikke smagsprofil.",
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
            Begynd at bygge jeres streak i aften
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
            Ingen konto nødvendig for at spille · Streak-tracking kræver en gratis konto
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvorfor gamificere filmaftenen?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            De fleste par falder i et mønster: et udbrud af filmaftener, derefter uger med ingenting.
            Streak-mekanikken skaber en let forpligtelse, der holder vanen i gang, uden at det
            bliver en pligt. Ét match om ugen er nemt nok at vedligeholde, selv i travle perioder.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Belønningerne er designet til at føde tilbage i oplevelsen. At låse op for en kurateret
            guide giver jer nye titler at udforske sammen, hvilket gør den næste Se Sammen-session
            mere interessant. Det er en positiv spiral: se sammen, lås op for indhold,
            opdag mere, se sammen igen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
