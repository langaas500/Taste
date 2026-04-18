import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tonight's Pick — Daily Movie Recommendation for Couples | Logflix",
  description: "Every evening Logflix picks one movie and one series tailored to your and your partner's taste. A premium feature for couples who love film.",
  alternates: { canonical: "https://logflix.app/en/tonight-pick", languages: { nb: "https://logflix.app/no/tonight-pick", sv: "https://logflix.app/se/tonight-pick", da: "https://logflix.app/dk/tonight-pick", fi: "https://logflix.app/fi/tonight-pick", en: "https://logflix.app/en/tonight-pick", "x-default": "https://logflix.app/en/tonight-pick" } },
  openGraph: { title: "Tonight's Pick — Daily Movie Recommendation for Couples | Logflix", description: "Every evening Logflix picks one movie and one series tailored to your and your partner's taste.", url: "https://logflix.app/en/tonight-pick" },
};

const faqItems = [
  { question: "How does Tonight's Pick choose what to recommend?", answer: "Tonight's Pick analyzes both your and your partner's taste profiles — built from library ratings, Watch Together swipes, and viewing history. It also considers time of day, day of the week, and what's currently available on your streaming services." },
  { question: "Do I get a new pick every day?", answer: "Yes. Every evening Logflix generates a fresh recommendation — one movie and one series. If you've already seen one of them, it's automatically replaced with the next best match." },
  { question: "Can I use Tonight's Pick without a partner?", answer: "Yes. If you're not connected to a partner, Tonight's Pick uses your individual taste profile. When you connect with someone, it blends both profiles for shared recommendations." },
  { question: "Is Tonight's Pick free?", answer: "Tonight's Pick is included in Logflix Premium for 29 NOK/month. Your partner gets Premium free. Watch Together (the swiping feature) is always free for everyone." },
  { question: "What if I don't like the pick?", answer: "You can skip it and the algorithm learns from that signal. Over time, Tonight's Pick gets better at reading your mood and preferences. You can also open Watch Together for a full swiping session instead." },
];

export default function TonightPickPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Tonight's Pick", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/tonight-pick", featureList: ["Daily movie recommendation", "Couple-tailored", "Tonight's Pick"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" }, { "@type": "ListItem", position: 2, name: "Watch Together", item: "https://logflix.app/en/watch-together" }, { "@type": "ListItem", position: 3, name: "Tonight's Pick", item: "https://logflix.app/en/tonight-pick" }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  const sectionH2: React.CSSProperties = { fontSize: "1.25rem", fontWeight: 700, marginBottom: 12, color: "#fff" };
  const bodyText: React.CSSProperties = { fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium Feature</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Tonight&apos;s Pick</h1>

        <p style={bodyText}>Every evening Logflix picks one movie and one series — tailored to your and your partner&apos;s taste. No scrolling, no arguments. Just press play.</p>
        <p style={bodyText}>Tonight&apos;s Pick uses AI to analyze what you both enjoy and finds the perfect title for the evening. A fresh pick every day, based on what&apos;s available on your streaming services.</p>
        <p style={{ ...bodyText, marginBottom: 40 }}>Included in Logflix Premium for 29 NOK/mo — your partner gets it free.</p>

        {/* How Tonight's Pick Is Chosen */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>How Tonight&apos;s Pick Is Chosen</h2>
          <p style={bodyText}>
            Tonight&apos;s Pick isn&apos;t random. The algorithm weighs three main signals to find
            the single best title for your evening:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Your taste profile", desc: "Built from your library ratings, Watch Together swipes, and watchlist. It knows your preferred genres, pacing, tone, and which directors and actors you gravitate toward." },
              { label: "Your partner's taste", desc: "If you're connected, Tonight's Pick blends both profiles. It finds the overlap zone — titles that fit both of you, not just one." },
              { label: "Context signals", desc: "Time of day, day of the week, and what you've watched recently. A Friday evening pick will differ from a Tuesday — the algorithm favors lighter, longer content on weekends." },
            ].map((signal) => (
              <div key={signal.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{signal.label}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", margin: 0 }}>{signal.desc}</p>
              </div>
            ))}
          </div>
          <p style={bodyText}>
            The pick is filtered against your streaming services so it&apos;s always something you
            can actually watch. If you skip a pick, the algorithm learns from it and adjusts
            future recommendations.
          </p>
        </section>

        {/* Tonight's Pick vs. Scrolling Netflix */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>Tonight&apos;s Pick vs. Scrolling Netflix</h2>
          <p style={bodyText}>
            Netflix&apos;s home screen is designed to keep you browsing. More browsing means more
            engagement metrics for them — but it doesn&apos;t help you actually watch something.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { left: "Shows titles from one service", right: "Searches across all your services" },
              { left: "Optimizes for your clicks", right: "Optimizes for your enjoyment" },
              { left: "Ignores your partner's taste", right: "Blends both taste profiles" },
              { left: "Same rows, reshuffled daily", right: "One confident pick, fresh each evening" },
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  {row.left}
                </div>
                <div style={{ background: "rgba(255,42,42,0.06)", border: "1px solid rgba(255,42,42,0.12)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                  {row.right}
                </div>
              </React.Fragment>
            ))}
          </div>
          <p style={bodyText}>
            Tonight&apos;s Pick replaces 40 minutes of scrolling with a single, confident suggestion.
            You open the app, see what&apos;s been chosen for you, and press play. If it doesn&apos;t
            feel right, open Watch Together for a quick swiping session instead.
          </p>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqItems.map((item, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{item.question}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0 }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Try Watch Together free</a>
        </div>

        {/* Internal links */}
        <nav style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Related</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { href: "/en/watch-together", label: "Watch Together — free couple movie picker" },
              { href: "/en/ai-curator", label: "AI Curator — your personal movie advisor" },
              { href: "/en/couple-report", label: "Couple Report — your shared movie history" },
            ].map((link) => (
              <a key={link.href} href={link.href} style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                {link.label} →
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
