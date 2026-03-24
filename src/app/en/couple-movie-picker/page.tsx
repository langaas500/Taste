import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Couple Movie Picker — Find a Movie You Both Want to Watch | Logflix",
  description:
    "The couple movie picker that actually works. Both of you swipe independently, and Logflix shows only the films you matched on. No negotiating.",
  alternates: {
    canonical: "https://logflix.app/en/couple-movie-picker",
    languages: {
      en: "https://logflix.app/en/couple-movie-picker",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/couple-movie-picker",
    },
  },
};

const faqItems = [
  {
    question: "How does the couple movie picker work?",
    answer:
      "Both of you open Watch Together on your phones, join the same session with a shared link or QR code, and swipe through movies independently. You don't see each other's choices. When you both swipe right on the same film, it appears as a match. It takes about 2–3 minutes.",
  },
  {
    question: "Do we both need to be in the same room?",
    answer:
      "No. You can swipe from different rooms, different cities, or even different countries. Share the session link over text or WhatsApp and each swipe from wherever you are. The match appears for both of you instantly.",
  },
  {
    question: "What if we don't match on anything?",
    answer:
      "That rarely happens, but if it does, you can start a new round with a different filter — try a different streaming service or broaden the genre. Most couples find at least 3–5 matches in their first session.",
  },
  {
    question: "Can we filter by streaming service?",
    answer:
      "Yes. You can narrow results to Netflix, HBO Max, Disney+, Prime Video, or any other major platform so every movie shown is actually available where you watch.",
  },
  {
    question: "Is this free?",
    answer:
      "Completely free. No account required, no app to download. Just open the link and start swiping.",
  },
];

export default function CoupleMoviePickerPage() {
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
              { "@type": "ListItem", position: 2, name: "Watch Together", item: "https://logflix.app/en/watch-together" },
              { "@type": "ListItem", position: 3, name: "Couple Movie Picker", item: "https://logflix.app/en/couple-movie-picker" },
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
            datePublished: "2025-01-01",
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
      <SeoGuideLayout
        locale="en"
        h1="Couple Movie Picker"
        heroSubtitle="Both of you swipe. Only your matches show up. Decision made."
        ctaText="Try the couple movie picker — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/date-night-movie-picker", label: "Date night movie picker" },
          { href: "/en/movie-picker-for-two", label: "Movie picker for two" },
          { href: "/en/stop-arguing-about-what-to-watch", label: "Stop arguing about what to watch" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Why couples struggle to pick a movie
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            The problem isn&apos;t a shortage of good films. It&apos;s that choosing one together involves
            a quiet negotiation that nobody wins. You suggest something, your partner says &quot;maybe,&quot; you
            scroll for another twenty minutes, and suddenly it&apos;s too late to start anything worth watching.
            A couple movie picker short-circuits all of that. Instead of proposing films one at a time and
            waiting for a reaction, both of you rate the same pool of titles independently. The result is
            a list of films you genuinely agreed on — without either person feeling like they gave in.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            How to use it tonight
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { step: "1", label: "Open Watch Together", detail: "No account needed" },
              { step: "2", label: "Share the session link", detail: "Send it over text" },
              { step: "3", label: "Swipe independently", detail: "Your partner can't see your picks" },
              { step: "4", label: "See your matches", detail: "Films you both said yes to" },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ color: "#E50914", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  Step {s.step}
                </div>
                <div style={{ color: "#ffffff", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                  {s.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            What makes it different from just browsing together
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            When you browse together, the person holding the remote has outsized influence. You tend to land
            on whatever catches attention first rather than what you&apos;d actually enjoy most. Swiping
            independently removes that bias. Both opinions carry equal weight, and the match list is a genuine
            intersection of your tastes — not a compromise someone settled for.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
