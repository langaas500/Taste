import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curator — Henkilökohtainen elokuvaneuvojasi | Logflix",
  description: "Keskustele tekoälyn kanssa joka tuntee elokuvamakusi. Saa henkilökohtaisia suosituksia sinun ja kumppanisi maun perusteella.",
  alternates: { languages: { nb: "https://logflix.app/no/ai-curator", sv: "https://logflix.app/se/ai-curator", da: "https://logflix.app/dk/ai-curator", fi: "https://logflix.app/fi/ai-curator", en: "https://logflix.app/en/ai-curator" } },
  openGraph: { title: "AI Curator — Henkilökohtainen elokuvaneuvojasi | Logflix", description: "Keskustele tekoälyn kanssa joka tuntee elokuvamakusi.", url: "https://logflix.app/fi/ai-curator" },
};

export default function AiCuratorPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix AI Curator", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/fi/ai-curator", featureList: ["AI-elokuvasuositus", "Makuprofiili", "Parisuositukset"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Tekoälyllä toimiva</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>AI Curator</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator on henkilökohtainen tekoäly-elokuvaneuvojasi. Kysy — &quot;jotain synkkää ja intensiivistä kahdelle&quot; — ja saa räätälöityjä suosituksia suoratoistopalveluineen Suomessa.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator tuntee elokuvamakusi. Se tietää mistä pidät, mitä vältät, ja mitä on saatavilla Netflixissä, HBO Maxissa, Disney+:ssa ja muissa palveluissa juuri nyt.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>5 ilmaista viestiä kaikille. Rajaton Logflix Premiumilla — 29 kr/kk, kumppanisi saa sen ilmaiseksi.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Kokeile Se Sammen ilmaiseksi</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Katso Premium-edut</a>
        </div>
      </div>
    </div>
  );
}
