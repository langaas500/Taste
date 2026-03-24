import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Couple Report — See Your Shared Movie History | Logflix",
  description: "See every movie and series you've matched on. Taste compatibility, favorite genres, and monthly Wrapped for couples.",
  alternates: {
    canonical: "https://logflix.app/en/couple-report",
    languages: { nb: "https://logflix.app/no/par-rapport", sv: "https://logflix.app/se/par-rapport", da: "https://logflix.app/dk/par-rapport", fi: "https://logflix.app/fi/par-rapport", en: "https://logflix.app/en/couple-report", "x-default": "https://logflix.app/en/couple-report" },
  },
  openGraph: { title: "Couple Report — See Your Shared Movie History | Logflix", description: "See every movie and series you've matched on. Taste compatibility and favorite genres.", url: "https://logflix.app/en/couple-report" },
};

const faqItems = [
  { question: "What is the Couple Report?", answer: "The Couple Report is a living dashboard of your shared movie history. It tracks every title you and your partner have matched on in Watch Together, analyzes your taste overlap, and generates a compatibility score." },
  { question: "How is the compatibility score calculated?", answer: "The score is based on how often you and your partner agree during Watch Together sessions — mutual likes, genre overlap, and how quickly you both swipe right on the same titles. A high score means you naturally gravitate toward the same films." },
  { question: "What is Couple Wrapped?", answer: "Couple Wrapped is a monthly visual summary of your shared watching. It highlights your top genres, most-matched titles, biggest surprise agrees, and how your compatibility has changed over time. It's designed to be shared on social media." },
  { question: "Do both partners need Premium?", answer: "No. One Premium subscription covers both of you. When you subscribe, your connected partner automatically gets full access to the Couple Report, Tonight's Pick, AI Curator, and all other Premium features." },
  { question: "Can I see the report without a partner?", answer: "The Couple Report requires at least 3 Watch Together sessions with the same partner. If you play solo, your swipes still feed your taste profile — but the report is specifically about shared taste between two people." },
];

export default function CoupleReportPage() {
  const schema = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Couple Report", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/couple-report", featureList: ["Couple Report", "Taste compatibility", "Couple Wrapped"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" }, { "@type": "ListItem", position: 2, name: "Watch Together", item: "https://logflix.app/en/watch-together" }, { "@type": "ListItem", position: 3, name: "Couple Report", item: "https://logflix.app/en/couple-report" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ];

  const sectionH2: React.CSSProperties = { fontSize: "1.25rem", fontWeight: 700, marginBottom: 12, color: "#fff" };
  const bodyText: React.CSSProperties = { fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>Premium Feature</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>Couple Report</h1>

        <p style={bodyText}>See every movie and series you&apos;ve matched on in Watch Together. The Couple Report shows taste compatibility, favorite genres, and what you agree — and disagree — on.</p>
        <p style={bodyText}>Every month you get a Couple Wrapped — a visual summary of what you&apos;ve watched together. Perfect for sharing with friends or on social media.</p>
        <p style={{ ...bodyText, marginBottom: 40 }}>Included in Logflix Premium for 29 NOK/mo — your partner gets it free.</p>

        {/* What's in Your Couple Report */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>What&apos;s in Your Couple Report</h2>
          <p style={bodyText}>
            The Couple Report is more than a list of movies. It&apos;s a detailed breakdown of how
            your taste compares to your partner&apos;s — and where the magic overlap happens.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Match History", desc: "Every title you've both swiped right on, organized by date. See which sessions produced the most matches and which titles you agreed on fastest." },
              { label: "Genre Overlap Map", desc: "A visual breakdown of which genres you both love, which only one of you enjoys, and which neither of you picks. Discover hidden overlap you didn't know existed." },
              { label: "Compatibility Score", desc: "A single number (0–100) that represents how aligned your movie taste is. Updated after every Watch Together session." },
              { label: "Surprise Agrees", desc: "Titles where the algorithm didn't expect you to match — but you did. These often become your favorite shared discoveries." },
              { label: "Couple Wrapped (Monthly)", desc: "A shareable visual summary: top genres, total matches, fastest agree, most-swiped actors, and how your compatibility has trended over time." },
            ].map((item) => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compatibility Score Explained */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>Compatibility Score Explained</h2>
          <p style={bodyText}>
            Your compatibility score is a weighted calculation based on three factors:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Match rate (50%)", desc: "The percentage of titles where you both swipe right in the same session. A couple who agrees on 8 out of 25 titles has a high match rate." },
              { label: "Genre alignment (30%)", desc: "How much your preferred genres overlap. If you both lean toward thriller and drama, this component scores high — even if you disagree on individual titles." },
              { label: "Decision speed (20%)", desc: "How quickly you both swipe right on the same title. Fast mutual likes suggest genuine shared enthusiasm, not just 'it looks okay' overlap." },
            ].map((factor) => (
              <div key={factor.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{factor.label}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", margin: 0 }}>{factor.desc}</p>
              </div>
            ))}
          </div>
          <p style={bodyText}>
            The score updates after every Watch Together session. Most couples start around 45–55
            and climb as they discover more shared taste. Scores above 75 are rare and mean you&apos;re
            genuinely aligned on what makes a great movie night.
          </p>
          <p style={bodyText}>
            The score isn&apos;t a judgment — a lower number just means you have more diverse taste,
            which often leads to the best surprise discoveries. The Couple Report highlights these
            &quot;surprise agrees&quot; specifically because they tend to become your favorite shared memories.
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
          <a href="/premium" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Logflix Premium</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Try Watch Together free</a>
        </div>

        {/* Internal links */}
        <nav style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Related</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { href: "/en/watch-together", label: "Watch Together — free couple movie picker" },
              { href: "/en/tonight-pick", label: "Tonight's Pick — daily recommendation for couples" },
              { href: "/en/ai-curator", label: "AI Curator — your personal movie advisor" },
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
