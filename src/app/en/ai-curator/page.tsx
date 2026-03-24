import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curator — Your Personal Movie Advisor | Logflix",
  description: "Chat with an AI that knows your film taste. Get personalized recommendations based on what you and your partner enjoy.",
  alternates: { languages: { nb: "https://logflix.app/no/ai-curator", sv: "https://logflix.app/se/ai-curator", da: "https://logflix.app/dk/ai-curator", fi: "https://logflix.app/fi/ai-curator", en: "https://logflix.app/en/ai-curator" } },
  openGraph: { title: "AI Curator — Your Personal Movie Advisor | Logflix", description: "Chat with an AI that knows your film taste. Get personalized recommendations.", url: "https://logflix.app/en/ai-curator" },
};

export default function AiCuratorPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix AI Curator", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/ai-curator", featureList: ["AI movie recommendation", "Taste profile", "Couple recommendations"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>AI-Powered</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>AI Curator</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator is your personal AI movie advisor. Ask a question — &quot;something dark and intense for two&quot; — and get tailored recommendations with streaming info for your region.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Curator knows your film taste. It knows what you enjoy, what you avoid, and what&apos;s available on Netflix, HBO Max, Disney+ and other services right now.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>5 free messages for everyone. Unlimited with Logflix Premium — 29 NOK/mo, your partner gets it free.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Watch Together free</a>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>See Premium benefits</a>
        </div>
      </div>
    </div>
  );
}
