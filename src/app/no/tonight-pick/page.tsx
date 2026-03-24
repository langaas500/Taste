import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tonight's Pick — Dagens filmanbefalning for par | Logflix",
  description: "Hver dag velger Logflix én film og én serie tilpasset smaken din og partneren din. Premium-feature for par som elsker film.",
  openGraph: {
    title: "Tonight's Pick — Dagens filmanbefalning for par | Logflix",
    description: "Hver dag velger Logflix én film og én serie tilpasset smaken din og partneren din.",
    url: "https://logflix.app/no/tonight-pick",
  },
};

export default function TonightPickPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Logflix Tonight's Pick",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    url: "https://logflix.app/no/tonight-pick",
    featureList: ["Daglig filmanbefalning", "Par-tilpasset", "Tonight's Pick"],
    offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium Feature</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>
          Tonight&apos;s Pick
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Hver kveld velger Logflix én film og én serie — tilpasset smaken din og partneren din. Ingen scrolling, ingen diskusjoner. Bare trykk play.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Tonight&apos;s Pick bruker AI til å analysere hva dere begge liker, og finner den perfekte tittelen for kvelden. Ny pick hver dag, basert på hva som er tilgjengelig på strømmetjenestene deres.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>
          Inkludert i Logflix Premium for 29 kr/mnd — partneren din får det gratis.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Prøv Logflix Premium
          </a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
            Prøv Se Sammen gratis
          </a>
        </div>
      </div>
    </div>
  );
}
