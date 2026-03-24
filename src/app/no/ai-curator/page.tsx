import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curator — Din personlige filmrådgiver | Logflix",
  description: "Chat med en AI som kjenner filmsmaken din. Få personlige anbefalinger basert på hva du og partneren din liker.",
  openGraph: {
    title: "AI Curator — Din personlige filmrådgiver | Logflix",
    description: "Chat med en AI som kjenner filmsmaken din. Få personlige anbefalinger.",
    url: "https://logflix.app/no/ai-curator",
  },
};

export default function AiCuratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Logflix AI Curator",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    url: "https://logflix.app/no/ai-curator",
    featureList: ["AI filmanbefaling", "Smaksprofil", "Par-anbefalinger"],
    offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>AI-drevet</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>
          AI Curator
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Curator er din personlige AI-filmrådgiver. Still et spørsmål — &quot;noe mørkt og intenst for to&quot; — og få skreddersydde anbefalinger med strømmeinformasjon for Norge.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Curator kjenner filmsmaken din. Den vet hva du liker, hva du unngår, og hva som er tilgjengelig på Netflix, HBO Max, Disney+ og andre tjenester akkurat nå.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>
          5 gratis meldinger for alle. Ubegrenset med Logflix Premium — 29 kr/mnd, partneren din får det gratis.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Prøv Se Sammen gratis
          </a>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
            Se Premium-fordeler
          </a>
        </div>
      </div>
    </div>
  );
}
