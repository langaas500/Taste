import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Couple Report — See What You've Watched Together | Logflix",
  description: "See every movie and series you've matched on. Taste compatibility, favorite genres, and monthly Wrapped for couples.",
  alternates: { languages: { nb: "https://logflix.app/no/par-rapport", sv: "https://logflix.app/se/par-rapport", da: "https://logflix.app/dk/par-rapport", fi: "https://logflix.app/fi/par-rapport", en: "https://logflix.app/en/par-rapport" } },
  openGraph: { title: "Couple Report — See What You've Watched Together | Logflix", description: "See every movie and series you've matched on. Taste compatibility and favorite genres.", url: "https://logflix.app/en/par-rapport" },
};

export default function ParRapportPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Couple Report", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/par-rapport", featureList: ["Couple Report", "Taste compatibility", "Couple Wrapped"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium Feature</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Couple Report</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>See every movie and series you&apos;ve matched on in Watch Together. The Couple Report shows taste compatibility, favorite genres, and what you agree — and disagree — on.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Every month you get a Couple Wrapped — a visual summary of what you&apos;ve watched together. Perfect for sharing with friends or on social media.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>Included in Logflix Premium for 29 NOK/mo — your partner gets it free.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Try Watch Together free</a>
        </div>
      </div>
    </div>
  );
}
