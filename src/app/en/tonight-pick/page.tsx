import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tonight's Pick — Daily Movie Recommendation for Couples | Logflix",
  description: "Every evening Logflix picks one movie and one series tailored to your and your partner's taste. A premium feature for couples who love film.",
  alternates: { languages: { nb: "https://logflix.app/no/tonight-pick", sv: "https://logflix.app/se/tonight-pick", da: "https://logflix.app/dk/tonight-pick", fi: "https://logflix.app/fi/tonight-pick", en: "https://logflix.app/en/tonight-pick" } },
  openGraph: { title: "Tonight's Pick — Daily Movie Recommendation for Couples | Logflix", description: "Every evening Logflix picks one movie and one series tailored to your and your partner's taste.", url: "https://logflix.app/en/tonight-pick" },
};

export default function TonightPickPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Tonight's Pick", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/tonight-pick", featureList: ["Daily movie recommendation", "Couple-tailored", "Tonight's Pick"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium Feature</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Tonight&apos;s Pick</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Every evening Logflix picks one movie and one series — tailored to your and your partner&apos;s taste. No scrolling, no arguments. Just press play.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Tonight&apos;s Pick uses AI to analyze what you both enjoy and finds the perfect title for the evening. A fresh pick every day, based on what&apos;s available on your streaming services.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>Included in Logflix Premium for 29 NOK/mo — your partner gets it free.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Try Watch Together free</a>
        </div>
      </div>
    </div>
  );
}
