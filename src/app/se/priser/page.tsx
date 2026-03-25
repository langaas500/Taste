import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Priser — Gratis för alltid + Premium för par | Logflix",
  description:
    "Logflix är gratis för alltid. Uppgradera till Logflix Par för Tonight's Pick, obegränsad AI Curator, Parrapport och mer. 29 SEK/mån.",
  alternates: {
    canonical: "https://logflix.app/se/priser",
    languages: {
      nb: "https://logflix.app/no/priser",
      sv: "https://logflix.app/se/priser",
      da: "https://logflix.app/dk/priser",
      fi: "https://logflix.app/fi/hinnat",
      en: "https://logflix.app/en/pricing",
      "x-default": "https://logflix.app/en/pricing",
    },
  },
};

const faqItems = [
  {
    question: "Är Watch Together gratis?",
    answer: "Ja, helt gratis — för alltid. Watch Together fungerar utan konto, utan app-nedladdning och utan begränsningar. Du kan använda det hur många gånger du vill med vem som helst.",
  },
  {
    question: "Vad ingår i Logflix Par premium?",
    answer: "Logflix Par inkluderar Tonight's Pick (personlig AI-rekommendation varje kväll), obegränsad AI Curator-chatt, full Parrapport med smakanalys, komplett Smakprofil, par-streak och prioriterad support. Allt annat — Watch Together, Bibliotek, Sök, Import — förblir gratis.",
  },
  {
    question: "Behöver min partner betala?",
    answer: "Nej. När du prenumererar på Logflix Par får din partner full premium-åtkomst gratis. En prenumeration täcker er båda.",
  },
  {
    question: "Kan jag avsluta när som helst?",
    answer: "Ja. Avsluta när som helst från dina profilinställningar. Det finns inga bindningstider, inga avbokningsavgifter och inga låsningsperioder. Dina premium-funktioner förblir aktiva till slutet av din faktureringsperiod.",
  },
];

const freeTier = [
  { feature: "Watch Together", desc: "Obegränsade sessioner, 2 personer" },
  { feature: "Bibliotek & Watchlist", desc: "Spåra allt du har sett" },
  { feature: "Sök & Upptäck", desc: "800 000+ titlar" },
  { feature: "Netflix & Trakt-import", desc: "Massimportera tittarhistorik" },
  { feature: "Månadsrapport", desc: "Delbar månadssammanfattning" },
  { feature: "Streaminginfo", desc: "Se var du kan titta, per land" },
  { feature: "Vänner & Socialt", desc: "Aktivitetsflöde, jämför smak" },
];

const premiumTier = [
  { feature: "Tonight's Pick", desc: "AI-driven daglig rekommendation" },
  { feature: "Obegränsad Curator", desc: "Chattbaserad AI-filmrådgivare" },
  { feature: "Parrapport", desc: "Smakanalys för dig och din partner" },
  { feature: "Full Smakprofil", desc: "Djup AI-analys av dina preferenser" },
  { feature: "Par-streak", desc: "Veckostreak med belöningar" },
  { feature: "Partnern får det gratis", desc: "En prenumeration, två personer" },
  { feature: "Allt i Gratis", desc: "Alla gratisfunktioner inkluderade" },
];

export default function PriserPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" },
              { "@type": "ListItem", position: 2, name: "Priser", item: "https://logflix.app/se/priser" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2026-03-25",
            dateModified: "2026-03-25",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Logflix Par",
            description: "Premium-prenumeration för par — Tonight's Pick, obegränsad AI Curator, Parrapport, Smakprofil och mer. Din partner får det gratis.",
            brand: { "@type": "Brand", name: "Logflix" },
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "SEK",
              priceValidUntil: "2027-12-31",
              availability: "https://schema.org/InStock",
              url: "https://logflix.app/premium",
            },
          }),
        }}
      />
      <div style={{ background: "#0a0a0f", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <header style={{ display: "flex", justifyContent: "center", padding: "16px 24px" }}>
            <Link href="/">
              <Image src="/logo.png" alt="Logflix" width={90} height={28} className="object-contain" style={{ height: 28, width: "auto" }} priority />
            </Link>
          </header>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 0", textAlign: "center" }}>
            <h1 style={{ color: "#ffffff", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, fontSize: "clamp(2rem, 6vw, 3rem)" }}>
              Enkla, transparenta priser
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5, maxWidth: 380, margin: "0 auto 40px" }}>
              Logflix är gratis för alltid. Premium låser upp AI-drivna funktioner för par.
            </p>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: "24px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em" }}>GRATIS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>0 kr</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>för alltid</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {freeTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/together" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", textDecoration: "none" }}>
                  Kom igång
                </Link>
              </div>

              <div style={{ background: "rgba(255,42,42,0.06)", border: "1.5px solid rgba(255,42,42,0.3)", borderRadius: 16, padding: "24px 18px", position: "relative" }}>
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#E50914", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>POPULÄR</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C842", marginBottom: 4, letterSpacing: "0.04em" }}>LOGFLIX PAR</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>29 kr</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>/mån (~&euro;2,50)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {premiumTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/premium" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, textDecoration: "none" }}>
                  Uppgradera nu
                </Link>
              </div>
            </div>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Vad förblir gratis — alltid
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Watch Together är kärnan i Logflix och kommer alltid vara gratis. Inget konto behövs, inga
                begränsningar på sessioner, inga dolda betalväggar. Samma sak gäller ditt bibliotek, din
                watchlist, sök och importverktyg. Premium finns för par som vill ha AI-drivna rekommendationer
                och djupare smakinsikter — inte som en spärr på funktionerna du redan använder.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Varför Logflix Par?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Logflix Par är designat för par som tittar tillsammans regelbundet. Tonight&apos;s Pick ger dig
                en personlig AI-rekommendation varje kväll baserat på bådas smakprofiler. AI Curator är en
                chattbaserad filmrådgivare som vet vad du har sett och vad du gillar. Och Parrapporten visar
                hur er smak överlappar och var ni skiljer er — perfekt för att avgöra &quot;du väljer alltid&quot;-debatten.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Bäst av allt: din partner får full premium-åtkomst inkluderad — en prenumeration täcker båda.
                Till 29 kr/mån (ca. &euro;2,50) är det billigare än ett halvt kaffe.
              </p>
            </section>

            <FaqSection
              title="Vanliga frågor"
              items={faqItems}
            />

            <nav style={{ marginBottom: 48 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Se även
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/together", label: "Öppna Watch Together" },
                  { href: "/en/watch-together", label: "Watch Together — hur det fungerar" },
                  { href: "/en/solo-to-duo", label: "Solo to Duo — börja ensam, bjud in senare" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, display: "block" }}>
                    {link.label} &rarr;
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>
                Redo att hitta något att titta på?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Börja med Watch Together — gratis, inget konto behövs.
              </p>
              <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block", textDecoration: "none" }}>
                Prova Watch Together — gratis
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
