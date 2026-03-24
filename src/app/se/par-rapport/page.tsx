import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parrapport — Se vad ni har sett tillsammans | Logflix",
  description: "Se alla filmer och serier ni har matchat på. Smakkompatibilitet, favoritgenrer och månatlig Wrapped för par.",
  alternates: { languages: { nb: "https://logflix.app/no/par-rapport", sv: "https://logflix.app/se/par-rapport", da: "https://logflix.app/dk/par-rapport", fi: "https://logflix.app/fi/par-rapport", en: "https://logflix.app/en/par-rapport" } },
  openGraph: { title: "Parrapport — Se vad ni har sett tillsammans | Logflix", description: "Se alla filmer och serier ni har matchat på. Smakkompatibilitet och favoritgenrer.", url: "https://logflix.app/se/par-rapport" },
};

export default function ParRapportPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Parrapport", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/se/par-rapport", featureList: ["Parrapport", "Smakkompatibilitet", "Couple Wrapped"], offers: { "@type": "Offer", price: "29", priceCurrency: "SEK", description: "Logflix Premium" } };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium-funktion</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Parrapport</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Se alla filmer och serier ni har matchat på i Se Sammen. Parrapporten visar smakkompatibilitet, favoritgenrer, och vad ni är överens — och oeniga — om.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Varje månad får ni en Couple Wrapped — en visuell sammanfattning av vad ni har sett tillsammans. Perfekt att dela med vänner eller på sociala medier.</p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>Ingår i Logflix Premium för 29 kr/mån — din partner får det gratis.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Prova Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Prova Se Sammen gratis</a>
        </div>
      </div>
    </div>
  );
}
