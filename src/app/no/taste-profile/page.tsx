import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Smaksprofil — Oppdag din filmpersonlighet | Logflix",
  description:
    "Din smaksprofil viser favorittsjangre, regissører og hvordan smaken din sammenlignes med partnerens. Drevet av seerhistorikken din.",
  alternates: {
    canonical: `${BASE}/no/taste-profile`,
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
    title: "Smaksprofil — Oppdag din filmpersonlighet | Logflix",
    description:
      "Din smaksprofil viser favorittsjangre, regissører og hvordan smaken din sammenlignes med partnerens.",
    url: `${BASE}/no/taste-profile`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hvordan genereres smaksprofilen min?",
    answer:
      "Smaksprofilen bygges automatisk fra seerhistorikken din — hver film og serie du logger, vurderer eller sveiper på i Se Sammen. Jo mer du logger, jo mer nøyaktig blir den. Logflix bruker AI til å analysere mønstre i seervanene dine, og identifiserer foretrukne sjangre, tempo, tone og til og med regissører eller skuespillere som går igjen.",
  },
  {
    question: "Kan jeg se hvordan smaken min sammenlignes med partnerens?",
    answer:
      "Ja. Hvis både du og partneren din har Logflix-kontoer, inkluderer smaksprofilen en smakskompatibilitetsscore. Den viser hvor preferansene deres overlapper — felles favorittsjangre, felles blindsoner og områder der dere skiller dere. Dette er spesielt nyttig for å planlegge filmkvelder sammen.",
  },
  {
    question: "Er smaksprofilen gratis?",
    answer:
      "Du får en uskarp forhåndsvisning av smaksprofilen gratis. Den fullstendige profilen — inkludert sjangeroversikt, kompatibilitetsscore og detaljert AI-analyse — er tilgjengelig med Logflix Premium til 29 kr/mnd. Partneren din får premium-tilgang gratis.",
  },
  {
    question: "Hvor ofte oppdateres smaksprofilen?",
    answer:
      "Profilen oppdateres hver gang du logger en ny tittel, vurderer noe eller fullfører en Se Sammen-økt. AI-en re-analyserer mønstrene dine jevnlig for å holde innsiktene ferske og nøyaktige.",
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
              { "@type": "ListItem", position: 2, name: "Se Sammen", item: "https://logflix.app/together" },
              { "@type": "ListItem", position: 3, name: "Smaksprofil", item: "https://logflix.app/no/taste-profile" },
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
            name: "Logflix Smaksprofil",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/no/taste-profile`,
            featureList: [
              "AI-drevet smaksanalyse",
              "Sjangeroversikt",
              "Kompatibilitetsscore for par",
              "Regissør- og skuespillerpreferanser",
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
        h1="Din filmsmaksprofil"
        heroSubtitle="Oppdag filmpersonligheten din. Se favorittsjangre, foretrukket tone og hvordan smaken din matcher partnerens."
        ctaText="Prøv Logflix Premium"
        trustLine="AI-drevet · Oppdateres automatisk · Partnersammenligning inkludert"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen — gratis" },
          { href: "/no/wrapped", label: "Logflix Wrapped — filmåret ditt" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hva er en smaksprofil?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Smaksprofilen din er en AI-generert oversikt over film- og seriepreferansene dine.
            Den går langt utover en enkel liste med favoritter — den kartlegger sjangrene du
            trekkes mot, tonen og tempoet du foretrekker, og regissørene og skuespillerne som
            stadig dukker opp i seerhistorikken din.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tenk på det som en personlighetstest, men for filmer. I stedet for å svare på
            spørsmål, ser du bare det du vanligvis ser. Logflix gjør analysen i bakgrunnen,
            basert på hver tittel du logger, hvert sveip i Se Sammen og hver vurdering du gir.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Resultatet er tre seksjoner: &laquo;Du liker&raquo; (sjangre og temaer du
            konsekvent liker), &laquo;Du unngår&raquo; (mønstre du pleier å hoppe over), og
            &laquo;Tempo &amp; Tone&raquo; (om du heller mot actionfylt tempo eller rolige
            karakterstudier).
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Kompatibilitet som par
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Hvis partneren din også bruker Logflix, inkluderer smaksprofilen en
            kompatibilitetsoversikt. Du ser hvor smakene deres overlapper — felles kjærlighet
            for thrillere, gjensidig likegyldighet for romantiske komedier, eller den ene
            sjangeren der dere er helt uenige.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Dette er ikke bare en morsom statistikk. Kompatibilitetsdataene brukes direkte i
            Se Sammen og AI-kuratoren, slik at anbefalingene blir smartere for dere begge. Jo
            mer dere ser og logger, jo bedre forstår Logflix hva som fungerer for akkurat
            deres pardynamikk.
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
            Oppdag filmpersonligheten din
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
            Prøv Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 kr/mnd · Partneren din får det gratis
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Slik bygges profilen
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Profilen begynner å bygges i det øyeblikket du logger din første tittel. Importer
            Netflix-historikken eller Trakt.tv-biblioteket ditt for å kickstarte den med hundrevis
            av datapunkter. Hvert Se Sammen-sveip, hver vurdering og hvert tillegg til
            watchlisten bidrar til et mer nøyaktig bilde.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Logflix bruker Claude AI til å identifisere mønstre som går utover enkel
            sjangeroptelling. Den ser på temaer, regissørfilmografier, utgivelsesperioder og
            til og med hvor raskt du bestemte deg for en tittel i Se Sammen. En film du
            superlikte på 2 sekunder sier noe annet enn en du nølte med i 15.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
