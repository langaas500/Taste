import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curator — Din personliga filmrådgivare | Logflix",
  description: "Chatta med en AI som känner din filmsmak. Få personliga rekommendationer baserade på vad du och din partner gillar.",
  alternates: { languages: { nb: "https://logflix.app/no/ai-curator", sv: "https://logflix.app/se/ai-curator", da: "https://logflix.app/dk/ai-curator", fi: "https://logflix.app/fi/ai-curator", en: "https://logflix.app/en/ai-curator" } },
  openGraph: { title: "AI Curator — Din personliga filmrådgivare | Logflix", description: "Chatta med en AI som känner din filmsmak. Få personliga rekommendationer.", url: "https://logflix.app/se/ai-curator" },
};

export default function AiCuratorPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix AI Curator", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/se/ai-curator", featureList: ["AI-filmrekommendation", "Smakprofil", "Par-rekommendationer"], offers: { "@type": "Offer", price: "29", priceCurrency: "SEK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>AI-driven</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>AI Curator</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator är din personliga AI-filmrådgivare. Ställ en fråga — &quot;något mörkt och intensivt för två&quot; — och få skräddarsydda rekommendationer med streaminginformation för Sverige.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator känner din filmsmak. Den vet vad du gillar, vad du undviker, och vad som finns på Netflix, HBO Max, Disney+ och andra tjänster just nu.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>5 gratis meddelanden för alla. Obegränsat med Logflix Premium — 29 kr/mån, din partner får det gratis.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Prova Se Sammen gratis</a>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Se Premium-fördelar</a>
        </div>
      </div>
    </div>
  );
}
