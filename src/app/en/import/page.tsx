import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Import Your Watch History — Netflix CSV & Trakt | Logflix",
  description: "Import your Netflix or Trakt.tv watch history into Logflix. Instantly build your taste profile and get better recommendations.",
  alternates: {
    canonical: `${BASE}/en/import`,
    languages: { nb: `${BASE}/no/importer`, sv: `${BASE}/se/`, da: `${BASE}/dk/`, fi: `${BASE}/fi/`, en: `${BASE}/en/import`, "x-default": `${BASE}/en/import` },
  },
  openGraph: { title: "Import Your Watch History — Netflix CSV & Trakt | Logflix", description: "Import your Netflix or Trakt.tv watch history into Logflix.", url: `${BASE}/en/import`, type: "article" },
};

const faqItems = [
  { question: "How do I export my Netflix history?", answer: "Go to netflix.com/account, scroll to 'Download your personal information', request your data, and download the CSV file. Then upload it on Logflix's import page. The entire process takes about 2 minutes." },
  { question: "Does import work with other streaming services?", answer: "Currently Logflix supports Netflix CSV import and Trakt.tv OAuth import. Trakt.tv syncs with most major services including Plex, Kodi, and Apple TV. More direct integrations are planned." },
  { question: "Will importing overwrite my existing library?", answer: "No. Import only adds titles you haven't already logged. Existing ratings, sentiments, and watchlist items are preserved. Duplicates are detected automatically by matching TMDB IDs." },
  { question: "Is my data safe?", answer: "Your watch history is stored securely in your Logflix account. We never share individual viewing data. Import data is processed server-side and only the matched titles are saved to your profile." },
];

export default function ImportPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: BASE }, { "@type": "ListItem", position: 2, name: "Import", item: `${BASE}/en/import` }] }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Logflix Import", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", url: `${BASE}/en/import`, featureList: ["Netflix CSV import", "Trakt.tv OAuth sync", "Automatic title matching", "Bulk library building"], offers: { "@type": "Offer", price: "0", priceCurrency: "NOK", description: "Free" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", datePublished: "2026-03-25", dateModified: "2026-03-25", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }) }} />

      <SeoGuideLayout locale="en" h1="Import Your Watch History" heroSubtitle="Bring your Netflix and Trakt.tv history into Logflix. Build your taste profile instantly — no manual logging required." ctaText="Create free account" ctaHref="/login?mode=signup" trustLine="Free · Netflix CSV & Trakt.tv · Takes 2 minutes"
        relatedLinks={[{ href: "/en/library", label: "Your Movie Library" }, { href: "/en/taste-profile", label: "Taste Profile" }, { href: "/together", label: "Start Watch Together — free" }, { href: "/en/ai-curator", label: "AI Curator" }]}>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Why import your history?</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Logflix gets smarter the more it knows about your taste. Importing your watch history gives the AI hundreds of data points from day one — instead of starting from scratch. Your Taste Profile, AI Curator recommendations, and Watch Together suggestions all improve immediately.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Without import, you&rsquo;d need to manually log dozens of titles before the AI has enough data to work with. Import skips that cold-start problem entirely.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Netflix CSV import</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Netflix lets you download your complete viewing history as a CSV file. Go to your Netflix account settings, request your personal data, and download the file when it&rsquo;s ready. Then upload it on the Logflix import page.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Logflix matches each title against TMDB&rsquo;s database of 800,000+ movies and series. Matched titles are automatically added to your library with the correct metadata — poster, year, genre, and streaming availability.</p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Trakt.tv sync</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>If you use Trakt.tv to track your viewing across Plex, Kodi, Apple TV, or other services, you can connect your account via OAuth. Logflix pulls your entire Trakt history in one click — including ratings and watchlist.</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>Trakt sync is a one-time import. Your Trakt ratings are mapped to Logflix sentiments (liked, neutral, disliked) so the AI immediately understands not just what you watched, but how you felt about it.</p>
        </section>

        <div style={{ textAlign: "center", padding: "24px 20px", marginBottom: 40, background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,42,42,0.15)", borderRadius: 14 }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ready to import?</p>
          <a href="/login?mode=signup" style={{ display: "inline-block", padding: "12px 32px", background: "#ff2a2a", color: "#ffffff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>Create free account →</a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>Free forever · Import is always free</p>
          <a href="/login" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4, display: "inline-block", textDecoration: "none" }}>Already have an account? Log in</a>
        </div>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
