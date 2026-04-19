import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Smakprofil — Upptäck din filmpersonlighet | Logflix",
  description:
    "Din smakprofil visar favoritgenrer, regissörer och hur din smak jämförs med din partners. Driven av din tittarhistorik.",
  alternates: {
    canonical: `${BASE}/se/taste-profile`,
    languages: {
      nb: `${BASE}/no/taste-profile`,
      sv: `${BASE}/se/taste-profile`,
      da: `${BASE}/dk/taste-profile`,
      fi: `${BASE}/fi/taste-profile`,
      en: `${BASE}/en/taste-profile`,
      "x-default": `${BASE}/en/taste-profile`,
    },
  },
  openGraph: {
    title: "Smakprofil — Upptäck din filmpersonlighet | Logflix",
    description:
      "Din smakprofil visar favoritgenrer, regissörer och hur din smak jämförs med din partners.",
    url: `${BASE}/se/taste-profile`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hur skapas min smakprofil?",
    answer:
      "Din smakprofil byggs automatiskt utifrån din tittarhistorik — varje film och serie du loggar, betygsätter eller sveper på i Se Tillsammans. Ju mer du loggar, desto mer exakt blir den. Logflix använder AI för att analysera mönster i dina tittarvanor och identifiera föredragna genrer, tempo, ton och återkommande regissörer eller skådespelare.",
  },
  {
    question: "Kan jag se hur min smak jämförs med min partners?",
    answer:
      "Ja. Om både du och din partner har Logflix-konton inkluderar smakprofilen en kompatibilitetspoäng. Den visar var era preferenser överlappar — gemensamma favoritgenrer, gemensamma blinda fläckar och områden där ni skiljer er åt. Det är särskilt användbart för att planera filmkvällar tillsammans.",
  },
  {
    question: "Är smakprofilen gratis?",
    answer:
      "Du får en suddig förhandsvisning av din smakprofil gratis. Den fullständiga profilen — inklusive genrefördelning, kompatibilitetspoäng och detaljerad AI-analys — ingår i Logflix Premium för 29 kr/mån. Din partner får premiumåtkomst gratis.",
  },
  {
    question: "Hur ofta uppdateras min smakprofil?",
    answer:
      "Din profil uppdateras varje gång du loggar en ny titel, betygsätter något eller genomför en Se Tillsammans-session. AI:n analyserar om dina mönster regelbundet för att hålla insikterna färska och korrekta.",
  },
];

export default function TasteProfilePage() {
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
              { "@type": "ListItem", position: 3, name: "Smakprofil", item: "https://logflix.app/se/taste-profile" },
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
            name: "Logflix Smakprofil",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/se/taste-profile`,
            featureList: [
              "AI-driven smakanalys",
              "Genrefördelning",
              "Parkompatibilitetspoäng",
              "Regissörs- och skådespelarpreferenser",
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
        h1="Din filmsmakprofil"
        heroSubtitle="Upptäck din filmpersonlighet. Se favoritgenrer, föredragen ton och hur din smak matchar din partners."
        ctaText="Skaffa Logflix Premium"
        trustLine="AI-driven · Uppdateras automatiskt · Partnerjämförelse inkluderad"
        relatedLinks={[
          { href: "/together", label: "Starta Se Tillsammans — gratis" },
          { href: "/se/watch-together", label: "Hur Se Tillsammans fungerar" },
          { href: "/se/wrapped", label: "Logflix Wrapped — ditt filmår" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Vad är en smakprofil?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Din smakprofil är en AI-genererad nedbrytning av dina film- och seriepreferenser.
            Den går bortom en enkel favoritlista — den kartlägger vilka genrer du dras till,
            vilken ton och tempo du föredrar, och vilka regissörer och skådespelare som
            ständigt dyker upp i din tittarhistorik.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tänk på det som ett personlighetstest, men för filmer. Istället för att svara på
            frågor tittar du bara på det du brukar titta på. Logflix gör analysen i bakgrunden,
            baserat på varje titel du loggar, varje svep i Se Tillsammans och varje betyg du ger.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Resultatet är tre avsnitt: &ldquo;Du gillar&rdquo; (genrer och teman du konsekvent
            uppskattar), &ldquo;Du undviker&rdquo; (mönster du tenderar att hoppa över) och
            &ldquo;Tempo &amp; Ton&rdquo; (om du lutar åt snabb action eller långsamma
            karaktärsstudier).
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Parkompatibilitet
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Om din partner också använder Logflix inkluderar smakprofilen en
            kompatibilitetsanalys. Du ser var era smaker överlappar — gemensam kärlek till
            thrillers, ömsesidigt ointresse för romantiska komedier, eller den genre där ni
            är helt oense.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Det här är inte bara en rolig statistik. Kompatibilitetsdatan matas direkt in i
            Se Tillsammans och AI-kuratorn, vilket gör rekommendationerna smartare för er
            båda. Ju mer ni tittar och loggar, desto bättre förstår Logflix vad som fungerar
            för just er pardynamik.
          </p>
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
            Upptäck din filmpersonlighet
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
            Så byggs den
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Din profil börjar byggas i samma ögonblick du loggar din första titel. Importera
            din Netflix-historik eller Trakt.tv-bibliotek för att snabbstarta med hundratals
            datapunkter. Varje svep i Se Tillsammans, varje betyg och varje tillägg i din
            bevakningslista bidrar till en mer exakt bild.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Logflix använder Claude AI för att identifiera mönster som går bortom enkel
            genreräkning. Den tittar på teman, regissörers filmografier, utgivningsperioder
            och till och med hur snabbt du bestämde dig i Se Tillsammans. En film du
            supergillade på 2 sekunder säger något annat än en du tvekade på i 15.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
