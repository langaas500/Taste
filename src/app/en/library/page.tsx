import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Your Movie Library — Track Everything You Watch | Logflix",
  description: "Log movies and series, rate them, build your watchlist. Your library powers AI recommendations and your Taste Profile.",
  alternates: {
    canonical: `${BASE}/en/library`,
    languages: { nb: `${BASE}/no/bibliotek`, sv: `${BASE}/se/`, da: `${BASE}/dk/`, fi: `${BASE}/fi/`, en: `${BASE}/en/library`, "x-default": `${BASE}/en/library` },
  },
  openGraph: { title: "Your Movie Library — Track Everything You Watch | Logflix", description: "Log movies and series, rate them, build your watchlist.", url: `${BASE}/en/library`, type: "article" },
};

const faqItems = [
  { question: "What can I track in my library?", answer: "Everything. Movies, TV series, documentaries — anything available on TMDB (over 800,000 titles). You can mark titles as watched (with a sentiment: liked, neutral, disliked), add to your watchlist, or track episode progress for series you're currently watching." },
  { question: "How does my library improve recommendations?", answer: "Every title you log teaches the AI about your preferences. Liked titles strengthen genre and theme signals. Disliked titles help the AI avoid similar suggestions. The more you log, the more personalized your Watch Together decks, AI Curator responses, and Tonight's Pick become." },
  { question: "Can I import my existing watch history?", answer: "Yes. Logflix supports Netflix CSV import and Trakt.tv OAuth sync. Import hundreds of titles in minutes instead of logging manually. Go to the import page to get started." },
  { question: "Is the library free?", answer: "Yes, completely. The library, watchlist, logging, ratings, and episode tracking are all free with no limits. Premium features like AI Curator (unlimited), Taste Profile (full), and Tonight's Pick are separate." },
];

export default function LibraryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: BASE }, { "@type": "ListItem", position: 2, name: "Library", item: `${BASE}/en/library` }] }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Library", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: `${BASE}/en/library`, featureList: ["Movie & series logging", "Sentiment ratings", "Watchlist", "Episode tracking", "Netflix & Trakt import"], offers: { "@type": "Offer", price: "0", priceCurrency: "NOK", description: "Free" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", datePublished: "2026-03-25", dateModified: "2026-03-25", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }) }} />

      <SeoGuideLayout locale="en" h1="Your Movie Library" heroSubtitle="Log every movie and series you watch. Rate them, build your watchlist, and let the AI learn your taste over time." ctaText="Create free account" ctaHref="/login?mode=signup" trustLine="Free forever · 800,000+ titles · Netflix & Trakt import"
        relatedLinks={[{ href: "/en/import", label: "Import your history" }, { href: "/en/taste-profile", label: "Taste Profile" }, { href: "/together", label: "Start Watch Together — free" }, { href: "/en/ai-curator", label: "AI Curator" }]}>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>More than a list</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Your Logflix library isn&rsquo;t just a list of titles. Every movie you log, every rating you give, and every series you track feeds into the AI that powers your entire Logflix experience. It&rsquo;s the foundation of your Taste Profile, your Watch Together suggestions, and your AI Curator conversations.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Think of it as a living record of your film journey. The more you add, the smarter Logflix gets about what you enjoy — and what to avoid suggesting.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>What you can track</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "✅", title: "Watched", desc: "Mark titles as watched with a sentiment — liked, neutral, or disliked. This is the primary signal that builds your taste profile." },
              { icon: "📋", title: "Watchlist", desc: "Save titles you want to watch later. Your watchlist is visible to the AI Curator, who can suggest the perfect time to watch them." },
              { icon: "📺", title: "Currently watching", desc: "Track series episode by episode. See where you left off and get notified when new seasons drop on your streaming services." },
              { icon: "⭐", title: "Favorites", desc: "Star your all-time favorites. These carry extra weight in taste analysis and help the AI understand your peak preferences." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px" }}>
                <span style={{ flexShrink: 0, fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center", padding: "24px 20px", marginBottom: 40, background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,42,42,0.15)", borderRadius: 14 }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Start building your library</p>
          <a href="/login?mode=signup" style={{ display: "inline-block", padding: "12px 32px", background: "#ff2a2a", color: "#ffffff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>Create free account →</a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>Free forever · No limits on logging</p>
          <a href="/login" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4, display: "inline-block", textDecoration: "none" }}>Already have an account? Log in</a>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Filter, sort, discover</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Your library supports filtering by genre, year, type (movie vs series), and sentiment. Sort by recently added, A-Z, or year. It&rsquo;s designed to grow with you — whether you have 10 titles or 1,000.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Every title shows where it&rsquo;s currently streaming in your region (Netflix, HBO Max, Disney+, Viaplay, and more). No more switching between apps to find availability.</p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
