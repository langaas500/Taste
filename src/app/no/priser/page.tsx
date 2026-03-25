import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Priser — Gratis for alltid + Premium for par | Logflix",
  description:
    "Logflix er gratis for alltid. Oppgrader til Logflix Par for Tonight's Pick, ubegrenset AI Curator, Par-rapport og mer. 29 kr/mnd.",
  alternates: {
    canonical: "https://logflix.app/no/priser",
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
    question: "Er Se Sammen gratis?",
    answer: "Ja, helt gratis — for alltid. Se Sammen fungerer uten konto, uten app-nedlasting og uten begrensninger. Du kan bruke det så mange ganger du vil med hvem som helst.",
  },
  {
    question: "Hva er inkludert i Logflix Par premium?",
    answer: "Logflix Par inkluderer Tonight's Pick (personlig AI-anbefaling hver kveld), ubegrenset AI Curator-chat, full Par-rapport med smaksanalyse, komplett Smaksprofil, par-streak og prioritert støtte. Alt annet — Se Sammen, Bibliotek, Søk, Import — forblir gratis.",
  },
  {
    question: "Må partneren min betale?",
    answer: "Nei. Når du abonnerer på Logflix Par, får partneren din full premium-tilgang gratis. Ett abonnement dekker dere begge.",
  },
  {
    question: "Kan jeg si opp når som helst?",
    answer: "Ja. Si opp når som helst fra profilinnstillingene. Det er ingen bindingstid, ingen avbestillingsgebyr og ingen låsningsperioder. Premium-funksjonene forblir aktive til slutten av faktureringsperioden.",
  },
];

const freeTier = [
  { feature: "Se Sammen", desc: "Ubegrensede økter, 2 personer" },
  { feature: "Bibliotek & Watchlist", desc: "Logg alt du har sett" },
  { feature: "Søk & Oppdagelse", desc: "800 000+ titler" },
  { feature: "Netflix & Trakt-import", desc: "Masseimporter seerhistorikk" },
  { feature: "Månedlig Wrapped", desc: "Delbar månedlig oppsummering" },
  { feature: "Strømmeinfo", desc: "Se hvor du kan se, per land" },
  { feature: "Venner & Sosialt", desc: "Aktivitetsstrøm, sammenlign smak" },
];

const premiumTier = [
  { feature: "Tonight's Pick", desc: "AI-drevet daglig anbefaling" },
  { feature: "Ubegrenset Curator", desc: "Chat-basert AI-filmrådgiver" },
  { feature: "Par-rapport", desc: "Smaksanalyse for deg og partneren din" },
  { feature: "Full Smaksprofil", desc: "Dyp AI-analyse av preferansene dine" },
  { feature: "Par-streak", desc: "Ukentlig streak med belønninger" },
  { feature: "Partneren får det gratis", desc: "Ett abonnement, to personer" },
  { feature: "Alt i Gratis", desc: "Alle gratisfunksjoner inkludert" },
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
              { "@type": "ListItem", position: 2, name: "Priser", item: "https://logflix.app/no/priser" },
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
            description: "Premium-abonnement for par — Tonight's Pick, ubegrenset AI Curator, Par-rapport, Smaksprofil og mer. Partneren din får det gratis.",
            brand: { "@type": "Brand", name: "Logflix" },
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "NOK",
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
              Enkle, transparente priser
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5, maxWidth: 380, margin: "0 auto 40px" }}>
              Logflix er gratis for alltid. Premium låser opp AI-drevne funksjoner for par.
            </p>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: "24px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em" }}>GRATIS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>0 kr</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>for alltid</div>
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
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>/mnd (~&euro;2,50)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {premiumTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/premium" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, textDecoration: "none" }}>
                  Oppgrader nå
                </Link>
              </div>
            </div>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Hva forblir gratis — alltid
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Se Sammen er kjernen i Logflix og vil alltid være gratis. Ingen konto nødvendig, ingen begrensninger
                på økter, ingen skjulte betalingsmurer. Det samme gjelder biblioteket, watchlisten, søk og
                importverktøy. Premium er for par som ønsker AI-drevne anbefalinger og dypere smaksinnsikt
                — ikke en sperre på funksjonene du allerede bruker.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Hvorfor Logflix Par?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Logflix Par er designet for par som ser på film og serier sammen jevnlig. Tonight&apos;s Pick gir deg
                en personlig AI-anbefaling hver kveld basert på begges smaksprofiler. AI Curator er en
                chat-basert filmrådgiver som vet hva du har sett og hva du liker. Og Par-rapporten viser
                hvordan smaken deres overlapper og hvor dere skiller dere — perfekt for å avgjøre
                &quot;du velger alltid&quot;-debatten.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Best av alt: partneren din får full premium-tilgang inkludert — ett abonnement dekker begge.
                Til 29 kr/mnd (ca. &euro;2,50) er det billigere enn en halv kaffe.
              </p>
            </section>

            <FaqSection
              title="Ofte stilte spørsmål"
              items={faqItems}
            />

            <nav style={{ marginBottom: 48 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Se også
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
                  { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
                  { href: "/together", label: "Åpne Se Sammen" },
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
                Klar til å finne noe å se?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Start med Se Sammen — gratis, ingen konto nødvendig.
              </p>
              <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block", textDecoration: "none" }}>
                Prøv Se Sammen — gratis
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
