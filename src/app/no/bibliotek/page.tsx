import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Filmbiblioteket ditt — Logg alt du ser | Logflix",
  description: "Logg filmer og serier, gi vurderinger, bygg watchlisten. Biblioteket ditt driver AI-anbefalinger og smaksprofilen din.",
  alternates: {
    canonical: `${BASE}/no/bibliotek`,
    languages: { nb: `${BASE}/no/bibliotek`, sv: `${BASE}/se/`, da: `${BASE}/dk/`, fi: `${BASE}/fi/`, en: `${BASE}/en/library`, "x-default": `${BASE}/en/library` },
  },
  openGraph: { title: "Filmbiblioteket ditt — Logg alt du ser | Logflix", description: "Logg filmer og serier, gi vurderinger, bygg watchlisten.", url: `${BASE}/no/bibliotek`, type: "article" },
};

const faqItems = [
  { question: "Hva kan jeg spore i biblioteket?", answer: "Alt. Filmer, TV-serier, dokumentarer — alt som finnes på TMDB (over 800 000 titler). Du kan markere titler som sett (med sentiment: likte, nøytral, mislikte), legge til i watchlist, eller spore episodeframgang for serier du ser på." },
  { question: "Hvordan forbedrer biblioteket anbefalingene?", answer: "Hver tittel du logger lærer AI-en om preferansene dine. Likte titler forsterker sjanger- og temasignaler. Mislikte titler hjelper AI-en å unngå lignende forslag. Jo mer du logger, desto mer personaliserte blir Se Sammen-dekkene, AI Curator-svarene og Tonight's Pick." },
  { question: "Kan jeg importere eksisterende seerhistorikk?", answer: "Ja. Logflix støtter Netflix CSV-import og Trakt.tv OAuth-synk. Importer hundrevis av titler på minutter i stedet for å logge manuelt. Gå til importsiden for å komme i gang." },
  { question: "Er biblioteket gratis?", answer: "Ja, helt gratis. Bibliotek, watchlist, logging, vurderinger og episodesporing er alt gratis uten begrensninger. Premium-funksjoner som AI Curator (ubegrenset), Smaksprofil (full) og Tonight's Pick er separate." },
];

export default function BibliotekPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: BASE }, { "@type": "ListItem", position: 2, name: "Bibliotek", item: `${BASE}/no/bibliotek` }] }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Bibliotek", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: `${BASE}/no/bibliotek`, featureList: ["Film- og serielogging", "Sentimentvurderinger", "Watchlist", "Episodesporing", "Netflix & Trakt-import"], offers: { "@type": "Offer", price: "0", priceCurrency: "NOK", description: "Gratis" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", datePublished: "2026-03-25", dateModified: "2026-03-25", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }) }} />

      <SeoGuideLayout locale="no" h1="Filmbiblioteket ditt" heroSubtitle="Logg hver film og serie du ser. Gi vurderinger, bygg watchlisten, og la AI-en lære smaken din over tid." ctaText="Opprett gratis konto" ctaHref="/login" trustLine="Gratis for alltid · 800 000+ titler · Netflix & Trakt-import"
        relatedLinks={[{ href: "/no/importer", label: "Importer historikken din" }, { href: "/no/taste-profile", label: "Smaksprofil" }, { href: "/together", label: "Start Se Sammen — gratis" }, { href: "/no/ai-curator", label: "AI Curator" }]}>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Mer enn en liste</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Logflix-biblioteket ditt er ikke bare en liste med titler. Hver film du logger, hver vurdering du gir, og hver serie du sporer mater inn i AI-en som driver hele Logflix-opplevelsen din. Det er fundamentet for smaksprofilen, Se Sammen-forslagene og AI Curator-samtalene dine.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Tenk på det som et levende arkiv over filmreisen din. Jo mer du legger til, desto smartere blir Logflix på hva du liker — og hva den bør unngå å foreslå.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Hva du kan spore</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "✅", title: "Sett", desc: "Marker titler som sett med et sentiment — likte, nøytral eller mislikte. Dette er primærsignalet som bygger smaksprofilen din." },
              { icon: "📋", title: "Watchlist", desc: "Lagre titler du vil se senere. Watchlisten er synlig for AI Curator, som kan foreslå det perfekte tidspunktet å se dem." },
              { icon: "📺", title: "Ser nå", desc: "Spor serier episode for episode. Se hvor du stoppet og få beskjed når nye sesonger dropper på strømmetjenestene dine." },
              { icon: "⭐", title: "Favoritter", desc: "Stjern favorittene dine. Disse veier ekstra tungt i smaksanalysen og hjelper AI-en å forstå topppreferansene dine." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px" }}>
                <span style={{ flexShrink: 0, fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center", padding: "24px 20px", marginBottom: 40, background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,42,42,0.15)", borderRadius: 14 }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Begynn å bygge biblioteket</p>
          <a href="/login" style={{ display: "inline-block", padding: "12px 32px", background: "#ff2a2a", color: "#ffffff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>Opprett gratis konto</a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>Gratis for alltid · Ingen begrensninger på logging</p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Filtrer, sorter, oppdag</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Biblioteket støtter filtrering etter sjanger, år, type (film vs serie) og sentiment. Sorter etter nylig lagt til, A-Å eller år. Det er designet for å vokse med deg — enten du har 10 titler eller 1000.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Hver tittel viser hvor den strømmes i regionen din (Netflix, HBO Max, Disney+, Viaplay og mer). Ingen grunn til å bytte mellom apper for å sjekke tilgjengelighet.</p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
