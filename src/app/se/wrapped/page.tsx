import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Logflix Wrapped — Årets filmer som par | Logflix",
  description:
    "Se allt ni sett tillsammans detta år. Toppgenrer, mest matchade filmer, kompatibilitetspoäng och mer.",
  alternates: {
    canonical: `${BASE}/se/wrapped`,
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
    title: "Logflix Wrapped — Årets filmer som par | Logflix",
    description:
      "Se allt ni sett tillsammans detta år. Toppgenrer, mest matchade filmer, kompatibilitetspoäng och mer.",
    url: `${BASE}/se/wrapped`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "När blir Logflix Wrapped tillgängligt?",
    answer:
      "Logflix genererar en månadsvis Wrapped-rapport i slutet av varje månad, och en fullständig årsrapport i december. Månadsrapporter finns tillgängliga så snart månaden är slut. Årets Wrapped täcker januari till december och inkluderar hela ert pars tittarresa.",
  },
  {
    question: "Kan jag dela min Wrapped?",
    answer:
      "Ja. Varje Wrapped-rapport kan delas som en delbar bild — liknande Spotify Wrapped. Du kan posta den på Instagram Stories, skicka den i en gruppchatt eller spara den till kamerarullen. Bilden visar din toppstatistik utan att avslöja privat tittardata.",
  },
  {
    question: "Behöver båda partners konton för par-Wrapped?",
    answer:
      "De parspecifika statistikerna (kompatibilitetspoäng, gemensamma favoriter, genreöverlapp) kräver att båda partners har Logflix-konton. Individuell Wrapped fungerar med ett enskilt konto. Gästsvep i Se Tillsammans spåras men kopplas till sessionen, inte en profil.",
  },
  {
    question: "Är Wrapped gratis?",
    answer:
      "Månadsvis Wrapped är tillgängligt för alla användare med ett gratis konto. Den fullständiga årsrapporten med parspecifika insikter, detaljerad AI-analys och delbara storykort är en premiumfunktion som ingår i Logflix Premium för 29 kr/mån.",
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
              { "@type": "ListItem", position: 2, name: "Se Tillsammans", item: "https://logflix.app/se/watch-together" },
              { "@type": "ListItem", position: 3, name: "Wrapped", item: "https://logflix.app/se/wrapped" },
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
            url: `${BASE}/se/wrapped`,
            featureList: [
              "Månatliga tittarrapporter",
              "Årlig par-Wrapped",
              "Delbara storykort",
              "Smakkompatibilitetspoäng",
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
        h1="Logflix Wrapped — Ert filmår som par"
        heroSubtitle="Allt ni sett tillsammans i en vacker rapport. Toppgenrer, mest matchade filmer, kompatibilitetspoäng och delbara kort."
        ctaText="Skaffa Logflix Premium"
        trustLine="Månads- + årsrapporter · Delbara som bilder · Parstatistik inkluderad"
        relatedLinks={[
          { href: "/together", label: "Starta Se Tillsammans — gratis" },
          { href: "/se/watch-together", label: "Hur Se Tillsammans fungerar" },
          { href: "/se/taste-profile", label: "Din smakprofil" },
          { href: "/se/couple-streak", label: "Parstreak — håll igång matchningen" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Vad är Logflix Wrapped?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Logflix Wrapped är ditt tittarår i sammandrag. Den tar allt du och din partner
            tittat på — varje loggad film, varje avslutad serie, varje Se Tillsammans-match
            — och förvandlar det till en visuell rapport du kan bläddra i och dela.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tänk Spotify Wrapped, men för filmer. Du ser era toppgenrer, filmerna ni matchade
            på snabbast, era mest tittade regissörer och en smakkompatibilitetspoäng som visar
            hur samstämmiga era preferenser verkligen är.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Månadsvis Wrapped släpps i slutet av varje månad med en snabb sammanfattning. Den
            fullständiga årsrapporten kommer i december med djupare insikter, AI-genererade
            kommentarer och delbara storykort designade för Instagram och gruppchattar.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Vad innehåller din Wrapped
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "🎬",
                title: "Totalt antal titlar",
                desc: "Hur många filmer och serier ni tittat på denna månad eller detta år. Uppdelat på typ, sentiment och genre.",
              },
              {
                icon: "🏆",
                title: "Toppmatcher",
                desc: "Filmerna du och din partner båda gillade snabbast i Se Tillsammans. Era snabbaste gemensamma beslut.",
              },
              {
                icon: "💑",
                title: "Kompatibilitet",
                desc: "Er smakkompatibilitetspoäng — genreöverlapp, gemensamma favoriter och var ni skiljer er åt.",
              },
              {
                icon: "📊",
                title: "Genrekarta",
                desc: "En visuell nedbrytning av vilka genrer som dominerade ert tittande. Se trender över månaderna.",
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
            Börja spåra ditt filmår
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
            Skaffa Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 kr/mån · Din partner får det gratis
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Dela din Wrapped
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Varje Wrapped-rapport genererar delbara storykort — designade för Instagram
            Stories, WhatsApp och gruppchattar. Korten visar din huvudstatistik (totalt antal
            titlar, toppgenre, kompatibilitetspoäng) i ett visuellt slående format utan att
            avslöja hela din tittarhistorik.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Att dela är valfritt, men det är ett kul sätt att jämföra filmvanor med vänner.
            Par upptäcker ofta att de tittar mycket mer — eller mycket mindre — än de trodde.
            Wrapped-formatet gör det enkelt att fira ett år av filmkvällar tillsammans.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
