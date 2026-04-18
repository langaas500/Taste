import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Logflix Wrapped — Årets film som par | Logflix",
  description:
    "Se alt, I så sammen i år. Topgenrer, mest matchede film, kompatibilitetsscore og mere. Del jeres par-Wrapped.",
  alternates: {
    canonical: `${BASE}/dk/wrapped`,
    languages: {
      nb: `${BASE}/no/wrapped`,
      sv: `${BASE}/se/wrapped`,
      da: `${BASE}/dk/wrapped`,
      fi: `${BASE}/fi/wrapped`,
      en: `${BASE}/en/wrapped`,
      "x-default": `${BASE}/en/wrapped`,
    },
  },
  openGraph: {
    title: "Logflix Wrapped — Årets film som par | Logflix",
    description:
      "Se alt, I så sammen i år. Topgenrer, mest matchede film, kompatibilitetsscore og mere.",
    url: `${BASE}/dk/wrapped`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hvornår er Logflix Wrapped tilgængelig?",
    answer:
      "Logflix genererer en månedlig Wrapped-rapport ved udgangen af hver måned og en fuld årlig Wrapped i december. Månedlige rapporter er tilgængelige, så snart måneden er slut. Den årlige Wrapped dækker januar til december og inkluderer jeres pars fulde seerrejse.",
  },
  {
    question: "Kan jeg dele min Wrapped?",
    answer:
      "Ja. Hver Wrapped-rapport kan deles som et delbart billede — ligesom Spotify Wrapped. Du kan poste det på Instagram Stories, sende det i en gruppechat eller gemme det i din kamerarulle. Billedet inkluderer dine topstatistikker uden at afsløre private seerdata.",
  },
  {
    question: "Skal begge partnere have konti for par-Wrapped?",
    answer:
      "De parspecifikke statistikker (kompatibilitetsscore, fælles favoritter, genreoverlap) kræver, at begge partnere har Logflix-konti. Individuel Wrapped fungerer med en enkelt konto. Gæsteswipes i Se Sammen trackes, men tilskrives sessionen, ikke en profil.",
  },
  {
    question: "Er Wrapped gratis?",
    answer:
      "Månedlig Wrapped er tilgængelig for alle brugere med en gratis konto. Den fulde årlige Wrapped med parspecifikke indsigter, detaljeret AI-analyse og delbare story-kort er en premiumfunktion inkluderet med Logflix Premium til 29 NOK/måned.",
  },
];

export default function WrappedPage() {
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
              { "@type": "ListItem", position: 3, name: "Wrapped", item: "https://logflix.app/dk/wrapped" },
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
            name: "Logflix Wrapped",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/dk/wrapped`,
            featureList: [
              "Månedlige seerrapporter",
              "Årlig par-Wrapped",
              "Delbare story-kort",
              "Smagskompatibilitetsscore",
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
        h1="Logflix Wrapped — Jeres filmår som par"
        heroSubtitle="Alt, I så sammen, i én smuk rapport. Topgenrer, mest matchede film, kompatibilitetsscore og delbare story-kort."
        ctaText="Få Logflix Premium"
        trustLine="Månedlige + årlige rapporter · Delbare som billeder · Parstatistikker inkluderet"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen — gratis" },
          { href: "/dk/watch-together", label: "Sådan fungerer Se Sammen" },
          { href: "/dk/taste-profile", label: "Din smagsprofil" },
          { href: "/dk/couple-streak", label: "Par-streak — bliv ved med at matche" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvad er Logflix Wrapped?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Logflix Wrapped er jeres seerår i overblik. Den tager alt, du og din partner
            har set — hver logget film, hver afsluttet serie, hvert Se Sammen-match —
            og omdanner det til en visuel rapport, I kan gennemse og dele.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tænk Spotify Wrapped, men for film. I&rsquo;ll se jeres topgenrer, de film,
            I matchede hurtigst på, jeres mest sete instruktører og en smagskompatibilitetsscore,
            der viser, hvor godt jeres præferencer egentlig stemmer overens.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Månedlig Wrapped dropper ved udgangen af hver måned med en hurtig opsummering. Den
            fulde årlige Wrapped ankommer i december med dybere indsigter, AI-genereret
            kommentar og delbare story-kort designet til Instagram og gruppechats.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvad er der i din Wrapped
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "🎬",
                title: "Antal titler",
                desc: "Hvor mange film og serier I så denne måned eller dette år. Opdelt efter type, sentiment og genre.",
              },
              {
                icon: "🏆",
                title: "Top-matches",
                desc: "De film, du og din partner begge likede hurtigst i Se Sammen. Jeres hurtigste gensidige beslutninger.",
              },
              {
                icon: "💑",
                title: "Kompatibilitet",
                desc: "Jeres smagskompatibilitetsscore — genreoverlap, fælles favoritter og hvor I adskiller jer.",
              },
              {
                icon: "📊",
                title: "Genrekort",
                desc: "En visuel opdeling af, hvilke genrer der dominerede jeres sening. Se tendenser på tværs af måneder.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 14px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>
                  {desc}
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
            Begynd at tracke jeres filmår
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
            Få Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 NOK/måned · Din partner får det gratis
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Del din Wrapped
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Hver Wrapped-rapport genererer delbare story-kort — designet til Instagram Stories,
            WhatsApp og gruppechats. Kortene viser jeres overskriftsstatistikker (antal titler,
            topgenre, kompatibilitetsscore) i et visuelt slående format uden at afsløre jeres
            fulde seerhistorik.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Deling er valgfrit, men det er en sjov måde at sammenligne filmvaner med venner.
            Par opdager ofte, at de ser langt mere — eller langt mindre — end de troede. Wrapped-
            formatet gør det nemt at fejre et år med filmaftener sammen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
