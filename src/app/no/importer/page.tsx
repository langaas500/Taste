import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Importer historikken din — Netflix CSV & Trakt | Logflix",
  description: "Importer Netflix- eller Trakt.tv-historikken din til Logflix. Bygg smaksprofilen din umiddelbart og få bedre anbefalinger.",
  alternates: {
    canonical: `${BASE}/no/importer`,
    languages: { nb: `${BASE}/no/importer`, sv: `${BASE}/se/`, da: `${BASE}/dk/`, fi: `${BASE}/fi/`, en: `${BASE}/en/import`, "x-default": `${BASE}/en/import` },
  },
  openGraph: { title: "Importer historikken din — Netflix CSV & Trakt | Logflix", description: "Importer Netflix- eller Trakt.tv-historikken din til Logflix.", url: `${BASE}/no/importer`, type: "article" },
};

const faqItems = [
  { question: "Hvordan eksporterer jeg Netflix-historikken min?", answer: "Gå til netflix.com/account, scroll ned til «Last ned din personlige informasjon», be om dataene dine og last ned CSV-filen. Deretter laster du den opp på Logflix sin importside. Hele prosessen tar ca. 2 minutter." },
  { question: "Fungerer import med andre strømmetjenester?", answer: "For øyeblikket støtter Logflix Netflix CSV-import og Trakt.tv OAuth-import. Trakt.tv synkroniserer med de fleste store tjenester inkludert Plex, Kodi og Apple TV. Flere direkte integrasjoner er planlagt." },
  { question: "Vil import overskrive det eksisterende biblioteket mitt?", answer: "Nei. Import legger kun til titler du ikke allerede har logget. Eksisterende vurderinger, sentimenter og watchlist-elementer bevares. Duplikater oppdages automatisk ved matching av TMDB-IDer." },
  { question: "Er dataene mine trygge?", answer: "Seerhistorikken din lagres sikkert i Logflix-kontoen din. Vi deler aldri individuelle seerdata. Importdata behandles server-side og kun matchede titler lagres i profilen din." },
];

export default function ImporterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: BASE }, { "@type": "ListItem", position: 2, name: "Importer", item: `${BASE}/no/importer` }] }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Import", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: `${BASE}/no/importer`, featureList: ["Netflix CSV-import", "Trakt.tv OAuth-synk", "Automatisk tittelmatching", "Bulk bibliotekbygging"], offers: { "@type": "Offer", price: "0", priceCurrency: "NOK", description: "Gratis" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", datePublished: "2026-03-25", dateModified: "2026-03-25", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }) }} />

      <SeoGuideLayout locale="no" h1="Importer seerhistorikken din" heroSubtitle="Hent Netflix- og Trakt.tv-historikken din inn i Logflix. Bygg smaksprofilen din umiddelbart — ingen manuell logging nødvendig." ctaText="Opprett gratis konto" ctaHref="/login" trustLine="Gratis · Netflix CSV & Trakt.tv · Tar 2 minutter"
        relatedLinks={[{ href: "/no/bibliotek", label: "Filmbiblioteket ditt" }, { href: "/no/taste-profile", label: "Smaksprofil" }, { href: "/together", label: "Start Se Sammen — gratis" }, { href: "/no/ai-curator", label: "AI Curator" }]}>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Hvorfor importere historikken?</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Logflix blir smartere jo mer den vet om smaken din. Å importere seerhistorikken gir AI-en hundrevis av datapunkter fra dag én — i stedet for å starte fra null. Smaksprofilen, AI Curator-anbefalingene og Se Sammen-forslagene forbedres umiddelbart.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Uten import måtte du logget titler manuelt før AI-en hadde nok data å jobbe med. Import hopper over det kaldstarts-problemet helt.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Netflix CSV-import</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Netflix lar deg laste ned hele seerhistorikken som en CSV-fil. Gå til Netflix-kontoinnstillingene, be om personlig data, og last ned filen når den er klar. Deretter laster du den opp på Logflix sin importside.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Logflix matcher hver tittel mot TMDBs database med over 800 000 filmer og serier. Matchede titler legges automatisk i biblioteket ditt med riktig metadata — plakat, år, sjanger og strømmetilgjengelighet.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Trakt.tv-synk</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Bruker du Trakt.tv for å spore seing på tvers av Plex, Kodi, Apple TV eller andre tjenester? Koble til kontoen din via OAuth. Logflix henter hele Trakt-historikken med ett klikk — inkludert vurderinger og watchlist.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Trakt-synk er en engangs-import. Trakt-vurderingene dine mappes til Logflix-sentimenter (likte, nøytral, mislikte) slik at AI-en umiddelbart forstår ikke bare hva du så, men hva du syntes om det.</p>
        </section>

        <div style={{ textAlign: "center", padding: "24px 20px", marginBottom: 40, background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,42,42,0.15)", borderRadius: 14 }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Klar til å importere?</p>
          <a href="/login" style={{ display: "inline-block", padding: "12px 32px", background: "#ff2a2a", color: "#ffffff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>Opprett gratis konto</a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>Gratis for alltid · Import er alltid gratis</p>
        </div>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
