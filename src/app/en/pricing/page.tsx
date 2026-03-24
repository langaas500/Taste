import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Logflix Pricing — Free Forever + Premium for Couples | Logflix",
  description:
    "Logflix is free forever. Upgrade to Logflix Par for Tonight's Pick, unlimited AI Curator, Couple Report and more. 29 NOK/month.",
  alternates: {
    canonical: "https://logflix.app/en/pricing",
    languages: {
      en: "https://logflix.app/en/pricing",
      "x-default": "https://logflix.app/en/pricing",
    },
  },
};

const faqItems = [
  {
    question: "Is Watch Together free?",
    answer: "Yes, completely free — forever. Watch Together works without accounts, without an app download, and without any limits. You can use it as many times as you want with anyone.",
  },
  {
    question: "What's included in Logflix Par premium?",
    answer: "Logflix Par includes Tonight's Pick (personalized AI recommendation each evening), unlimited AI Curator chat, full Couple Report with taste analysis, complete Taste Profile, couple streak tracking, and priority support. Everything else — Watch Together, Library, Search, Import — stays free.",
  },
  {
    question: "Does my partner need to pay?",
    answer: "No. When you subscribe to Logflix Par, your partner gets full premium access for free. One subscription covers both of you.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel anytime from your profile settings. There are no contracts, no cancellation fees, and no lock-in periods. Your premium features stay active until the end of your billing period.",
  },
];

const freeTier = [
  { feature: "Watch Together", desc: "Unlimited sessions, 2 people" },
  { feature: "Library & Watchlist", desc: "Track everything you've seen" },
  { feature: "Search & Discovery", desc: "800,000+ titles" },
  { feature: "Netflix & Trakt import", desc: "Bulk import watch history" },
  { feature: "Monthly Wrapped", desc: "Shareable monthly summary" },
  { feature: "Streaming info", desc: "See where to watch, per country" },
  { feature: "Friends & Social", desc: "Activity feed, compare taste" },
];

const premiumTier = [
  { feature: "Tonight's Pick", desc: "AI-powered daily recommendation" },
  { feature: "Unlimited Curator", desc: "Chat-based AI movie advisor" },
  { feature: "Couple Report", desc: "Taste analysis for you and your partner" },
  { feature: "Full Taste Profile", desc: "Deep AI analysis of your preferences" },
  { feature: "Couple Streak", desc: "Weekly streak with rewards" },
  { feature: "Partner gets it free", desc: "One subscription, two people" },
  { feature: "Everything in Free", desc: "All free features included" },
];

export default function PricingPage() {
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
              { "@type": "ListItem", position: 2, name: "Pricing", item: "https://logflix.app/en/pricing" },
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
            datePublished: "2026-03-24",
            dateModified: "2026-03-24",
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
            description: "Premium subscription for couples — Tonight's Pick, unlimited AI Curator, Couple Report, Taste Profile, and more. Your partner gets it free.",
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
        {/* Vignette */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Header */}
          <header style={{ display: "flex", justifyContent: "center", padding: "16px 24px" }}>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logflix"
                width={90}
                height={28}
                className="object-contain"
                style={{ height: 28, width: "auto" }}
                priority
              />
            </Link>
          </header>

          {/* Hero */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 0", textAlign: "center" }}>
            <h1 style={{
              color: "#ffffff", fontWeight: 800, lineHeight: 1.15, marginBottom: 12,
              fontSize: "clamp(2rem, 6vw, 3rem)",
            }}>
              Simple, Transparent Pricing
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5,
              maxWidth: 380, margin: "0 auto 40px",
            }}>
              Logflix is free forever. Premium unlocks AI-powered features for couples.
            </p>
          </div>

          {/* Pricing cards */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              {/* Free */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16, padding: "24px 18px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em" }}>
                  FREE
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
                  0 kr
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                  forever
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {freeTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/together"
                  className="button"
                  style={{
                    display: "block", width: "100%", textAlign: "center", marginTop: 24,
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#ffffff", textDecoration: "none",
                  }}
                >
                  Get started
                </Link>
              </div>

              {/* Premium */}
              <div style={{
                background: "rgba(255,42,42,0.06)",
                border: "1.5px solid rgba(255,42,42,0.3)",
                borderRadius: 16, padding: "24px 18px",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: "#E50914", color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em",
                }}>
                  POPULAR
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C842", marginBottom: 4, letterSpacing: "0.04em" }}>
                  LOGFLIX PAR
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
                  29 kr
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                  /month (~&euro;2.50)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {premiumTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/premium"
                  className="button"
                  style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, textDecoration: "none" }}
                >
                  Upgrade now
                </Link>
              </div>
            </div>

            {/* Comparison highlight */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                What stays free — always
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Watch Together is the core of Logflix and will always be free. No account needed, no limits
                on sessions, no hidden paywalls. The same goes for your library, watchlist, search, and
                import tools. Premium exists for couples who want AI-powered recommendations and deeper
                taste insights — not as a gate on the features you already use.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Why Logflix Par?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Logflix Par is designed for couples who watch together regularly. Tonight&apos;s Pick gives you
                a personalized AI recommendation every evening based on both your taste profiles. The AI
                Curator is a chat-based movie advisor that knows what you&apos;ve seen and what you like. And
                the Couple Report shows how your taste overlaps and where you differ — perfect for settling
                the &quot;you always pick&quot; debate.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Best of all, your partner gets full premium access included — one subscription covers both
                of you. At 29 NOK/month (about &euro;2.50), it&apos;s less than half a coffee.
              </p>
            </section>

            <FaqSection
              title="Frequently Asked Questions"
              items={faqItems}
            />

            {/* Related links */}
            <nav style={{ marginBottom: 48 }}>
              <p style={{
                color: "rgba(255,255,255,0.35)", fontSize: "0.75rem",
                marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                See also
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/en/watch-together", label: "Watch Together — how it works" },
                  { href: "/en/solo-to-duo", label: "Solo to Duo — start alone, invite later" },
                  { href: "/together", label: "Open Watch Together" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      color: "rgba(255,255,255,0.55)", fontSize: 14,
                      textDecoration: "none", padding: "10px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8, display: "block",
                    }}
                  >
                    {link.label} &rarr;
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Bottom CTA */}
          <section style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}>
            <div style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>
                Ready to find something to watch?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Start with Watch Together — free, no account needed.
              </p>
              <Link
                href="/together"
                className="button"
                style={{ width: "100%", maxWidth: 320, display: "inline-block", textDecoration: "none" }}
              >
                Try Watch Together — free
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
