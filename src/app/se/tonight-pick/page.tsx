import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tonight's Pick — Dagens filmrekommendation för par | Logflix",
  description: "Varje kväll väljer Logflix en film och en serie anpassad efter din och din partners smak. Premium-funktion för par som älskar film.",
  alternates: { languages: { nb: "https://logflix.app/no/tonight-pick", sv: "https://logflix.app/se/tonight-pick", da: "https://logflix.app/dk/tonight-pick", fi: "https://logflix.app/fi/tonight-pick", en: "https://logflix.app/en/tonight-pick" } },
  openGraph: { title: "Tonight's Pick — Dagens filmrekommendation för par | Logflix", description: "Varje kväll väljer Logflix en film och en serie anpassad efter din och din partners smak.", url: "https://logflix.app/se/tonight-pick" },
};

export default function TonightPickPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Tonight's Pick", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/se/tonight-pick", featureList: ["Daglig filmrekommendation", "Par-anpassad", "Tonight's Pick"], offers: { "@type": "Offer", price: "29", priceCurrency: "SEK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium-funktion</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Tonight&apos;s Pick</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Varje kväll väljer Logflix en film och en serie — anpassad efter din och din partners smak. Ingen scrollning, inga diskussioner. Bara tryck play.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Tonight&apos;s Pick använder AI för att analysera vad ni båda gillar och hittar den perfekta titeln för kvällen. Nytt pick varje dag, baserat på vad som finns på era streamingtjänster.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>Ingår i Logflix Premium för 29 kr/mån — din partner får det gratis.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Prova Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Prova Se Sammen gratis</a>
        </div>
      </div>
    </div>
  );
}
