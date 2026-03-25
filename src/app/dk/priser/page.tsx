import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Priser — Gratis for evigt + Premium til par | Logflix",
  description:
    "Logflix er gratis for evigt. Opgrader til Logflix Par for Tonight's Pick, ubegrænset AI Curator, Parrapport og mere. 29 DKK/md.",
  alternates: {
    canonical: "https://logflix.app/dk/priser",
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
    question: "Er Watch Together gratis?",
    answer: "Ja, helt gratis — for evigt. Watch Together fungerer uden konto, uden app-download og uden begrænsninger. Du kan bruge det så mange gange du vil med hvem som helst.",
  },
  {
    question: "Hvad er inkluderet i Logflix Par premium?",
    answer: "Logflix Par inkluderer Tonight's Pick (personlig AI-anbefaling hver aften), ubegrænset AI Curator-chat, fuld Parrapport med smagsanalyse, komplet Smagsprofil, par-streak og prioriteret support. Alt andet — Watch Together, Bibliotek, Søg, Import — forbliver gratis.",
  },
  {
    question: "Skal min partner betale?",
    answer: "Nej. Når du abonnerer på Logflix Par, får din partner fuld premium-adgang gratis. Ét abonnement dækker jer begge.",
  },
  {
    question: "Kan jeg opsige når som helst?",
    answer: "Ja. Opsig når som helst fra dine profilindstillinger. Der er ingen bindingsperiode, ingen opsigelsesgebyrer og ingen låseperioder. Dine premium-funktioner forbliver aktive til slutningen af din faktureringsperiode.",
  },
];

const freeTier = [
  { feature: "Watch Together", desc: "Ubegrænsede sessioner, 2 personer" },
  { feature: "Bibliotek & Watchlist", desc: "Hold styr på alt du har set" },
  { feature: "Søg & Opdag", desc: "800.000+ titler" },
  { feature: "Netflix & Trakt-import", desc: "Masseimporter seerhistorik" },
  { feature: "Månedlig Wrapped", desc: "Delbar månedlig opsummering" },
  { feature: "Streaminginfo", desc: "Se hvor du kan se, per land" },
  { feature: "Venner & Socialt", desc: "Aktivitetsstrøm, sammenlign smag" },
];

const premiumTier = [
  { feature: "Tonight's Pick", desc: "AI-drevet daglig anbefaling" },
  { feature: "Ubegrænset Curator", desc: "Chatbaseret AI-filmrådgiver" },
  { feature: "Parrapport", desc: "Smagsanalyse for dig og din partner" },
  { feature: "Fuld Smagsprofil", desc: "Dyb AI-analyse af dine præferencer" },
  { feature: "Par-streak", desc: "Ugentlig streak med belønninger" },
  { feature: "Partneren får det gratis", desc: "Ét abonnement, to personer" },
  { feature: "Alt i Gratis", desc: "Alle gratisfunktioner inkluderet" },
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
              { "@type": "ListItem", position: 2, name: "Priser", item: "https://logflix.app/dk/priser" },
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
            description: "Premium-abonnement for par — Tonight's Pick, ubegrænset AI Curator, Parrapport, Smagsprofil og mere. Din partner får det gratis.",
            brand: { "@type": "Brand", name: "Logflix" },
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "DKK",
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
              Enkle, gennemsigtige priser
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5, maxWidth: 380, margin: "0 auto 40px" }}>
              Logflix er gratis for evigt. Premium låser op for AI-drevne funktioner for par.
            </p>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: "24px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em" }}>GRATIS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>0 kr</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>for evigt</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {freeTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/together" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", textDecoration: "none" }}>
                  Kom i gang
                </Link>
              </div>

              <div style={{ background: "rgba(255,42,42,0.06)", border: "1.5px solid rgba(255,42,42,0.3)", borderRadius: 16, padding: "24px 18px", position: "relative" }}>
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#E50914", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>POPULÆR</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C842", marginBottom: 4, letterSpacing: "0.04em" }}>LOGFLIX PAR</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>29 kr</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>/md (~&euro;2,50)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {premiumTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/premium" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, textDecoration: "none" }}>
                  Opgrader nu
                </Link>
              </div>
            </div>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Hvad forbliver gratis — altid
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Watch Together er kernen i Logflix og vil altid være gratis. Ingen konto nødvendig, ingen
                begrænsninger på sessioner, ingen skjulte betalingsmure. Det samme gælder dit bibliotek,
                din watchlist, søg og importværktøjer. Premium er for par der ønsker AI-drevne anbefalinger
                og dybere smagsindsigt — ikke en spærring på de funktioner du allerede bruger.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Hvorfor Logflix Par?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Logflix Par er designet til par der ser film og serier sammen regelmæssigt. Tonight&apos;s Pick giver dig
                en personlig AI-anbefaling hver aften baseret på begges smagsprofiler. AI Curator er en
                chatbaseret filmrådgiver der ved hvad du har set og hvad du kan lide. Og Parrapporten viser
                hvordan jeres smag overlapper og hvor I adskiller jer — perfekt til at afgøre
                &quot;du vælger altid&quot;-debatten.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Bedst af alt: din partner får fuld premium-adgang inkluderet — ét abonnement dækker begge.
                Til 29 kr/md (ca. &euro;2,50) er det billigere end en halv kop kaffe.
              </p>
            </section>

            <FaqSection
              title="Ofte stillede spørgsmål"
              items={faqItems}
            />

            <nav style={{ marginBottom: 48 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Se også
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/together", label: "Åbn Watch Together" },
                  { href: "/en/watch-together", label: "Watch Together — sådan fungerer det" },
                  { href: "/en/solo-to-duo", label: "Solo to Duo — start alene, inviter senere" },
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
                Klar til at finde noget at se?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Start med Watch Together — gratis, ingen konto nødvendig.
              </p>
              <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block", textDecoration: "none" }}>
                Prøv Watch Together — gratis
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
