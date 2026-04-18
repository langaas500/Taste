import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curator — Your Personal Movie Advisor | Logflix",
  description: "Chat with an AI that knows your film taste. Get personalized recommendations based on what you and your partner enjoy.",
  alternates: { canonical: "https://logflix.app/en/ai-curator", languages: { nb: "https://logflix.app/no/ai-curator", sv: "https://logflix.app/se/ai-curator", da: "https://logflix.app/dk/ai-curator", fi: "https://logflix.app/fi/ai-curator", en: "https://logflix.app/en/ai-curator", "x-default": "https://logflix.app/en/ai-curator" } },
  openGraph: { title: "AI Curator — Your Personal Movie Advisor | Logflix", description: "Chat with an AI that knows your film taste. Get personalized recommendations.", url: "https://logflix.app/en/ai-curator" },
};

const faqItems = [
  { question: "How does AI Curator know my taste?", answer: "Curator builds a taste profile from your library, your Watch Together swipes, and your ratings. The more you use Logflix, the better it understands what you enjoy and what you avoid." },
  { question: "Can I ask Curator anything?", answer: "You can ask for recommendations by mood, genre, actor, director, or vibe — 'something like Succession but funnier', 'a slow-burn thriller for date night', 'movies with Florence Pugh'. Curator understands natural language." },
  { question: "Does Curator filter by streaming service?", answer: "Yes. Curator only recommends titles available on the streaming services in your region. No suggestions you can't actually watch tonight." },
  { question: "Is AI Curator free?", answer: "Everyone gets 5 free messages. Unlimited conversations are included in Logflix Premium for 29 NOK/month, and your partner gets Premium free." },
  { question: "How is Curator different from Netflix recommendations?", answer: "Netflix only recommends titles on Netflix. Curator searches across all your streaming services — Netflix, HBO Max, Disney+, Viaplay, and more — and factors in your partner's taste too, not just your own." },
];

export default function AiCuratorPage() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix AI Curator", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: "https://logflix.app/en/ai-curator", featureList: ["AI movie recommendation", "Taste profile", "Couple recommendations"], offers: { "@type": "Offer", price: "29", priceCurrency: "NOK", description: "Logflix Premium" } };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" }, { "@type": "ListItem", position: 2, name: "Watch Together", item: "https://logflix.app/en/watch-together" }, { "@type": "ListItem", position: 3, name: "AI Curator", item: "https://logflix.app/en/ai-curator" }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  const sectionH2: React.CSSProperties = { fontSize: "1.25rem", fontWeight: 700, marginBottom: 12, color: "#fff" };
  const bodyText: React.CSSProperties = { fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 20 };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "80px 24px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff2a2a", marginBottom: 12 }}>AI-Powered</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>AI Curator</h1>

        <p style={bodyText}>Curator is your personal AI movie advisor. Ask a question — &quot;something dark and intense for two&quot; — and get tailored recommendations with streaming info for your region.</p>
        <p style={bodyText}>Curator knows your film taste. It knows what you enjoy, what you avoid, and what&apos;s available on Netflix, HBO Max, Disney+ and other services right now.</p>
        <p style={{ ...bodyText, marginBottom: 40 }}>5 free messages for everyone. Unlimited with Logflix Premium — 29 NOK/mo, your partner gets it free.</p>

        {/* How AI Curator Works */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>How AI Curator Works</h2>
          <p style={bodyText}>
            Curator isn&apos;t a generic recommendation engine. It builds a detailed taste profile
            from everything you do on Logflix — your library ratings, your Watch Together swipes,
            your watchlist, and even the titles you skip. Over time it learns your preferences
            for pacing, tone, genre balance, and visual style.
          </p>
          <p style={bodyText}>
            When you ask a question, Curator combines your taste profile with your partner&apos;s
            (if you&apos;re connected) and cross-references what&apos;s currently streaming in your country.
            The result is a short, opinionated list of titles — not 50 generic suggestions, but
            2–4 picks that genuinely fit what you described, with a personal reason for each one.
          </p>
          <p style={bodyText}>
            Every recommendation includes which streaming service has the title, so you never get
            excited about a suggestion only to discover it&apos;s not available where you live.
          </p>
        </section>

        {/* Example Conversations */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionH2}>Example Conversations</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Here are a few real prompts and what Curator might respond with:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                prompt: "Something like Fleabag but not a comedy",
                response: "Try Normal People (Hulu) — same raw emotional intimacy, but as a slow-burn drama. Or Conversations with Friends (HBO Max) — from the same author, quieter and more introspective.",
              },
              {
                prompt: "We want a thriller that won't bore my partner",
                response: "Severance (Apple TV+) — psychological tension that builds slowly but hooks both thriller fans and people who usually avoid the genre. Short episodes, easy to stop or binge.",
              },
              {
                prompt: "A movie we can watch with my parents visiting",
                response: "The Holdovers (2023) — warm, funny, and universally likeable without being bland. Streaming on Prime Video in your region.",
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>
                  &quot;{ex.prompt}&quot;
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                  {ex.response}
                </p>
              </div>
            ))}
          </div>
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
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "#ff2a2a", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Try Watch Together free</a>
          <a href="/together" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>See Premium benefits</a>
        </div>

        {/* Internal links */}
        <nav style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Related</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { href: "/en/watch-together", label: "Watch Together — free couple movie picker" },
              { href: "/en/tonight-pick", label: "Tonight's Pick — daily recommendation for couples" },
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
