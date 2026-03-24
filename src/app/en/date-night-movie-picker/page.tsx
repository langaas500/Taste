import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Date Night Movie Picker — Find the Perfect Film Together | Logflix",
  description:
    "Find the ideal date night movie in minutes. Swipe independently, match on what you both want, and spend the evening watching instead of deciding.",
  alternates: {
    canonical: "https://logflix.app/en/date-night-movie-picker",
    languages: {
      en: "https://logflix.app/en/date-night-movie-picker",
      "x-default": "https://logflix.app/en/date-night-movie-picker",
    },
  },
};

const faqItems = [
  {
    question: "What makes a good date night movie?",
    answer:
      "A good date night film keeps both people engaged without requiring too much mental effort to follow. Thrillers, well-made rom-coms, prestige dramas, and visually impressive films tend to work well. But the most important factor is that both people actually wanted to watch it — which is why matching first beats picking unilaterally.",
  },
  {
    question: "Can we filter to just romantic movies?",
    answer:
      "You can filter by streaming service, which will surface the library available to you. For genre preferences, both of you can simply pass on films that don't suit the mood. If you both swipe right on romantic dramas and pass on action, the match list will naturally skew toward what you're both in the mood for.",
  },
  {
    question: "What if I want to surprise my partner with the pick?",
    answer:
      "You can start a session, swipe through films, and then choose from the match list yourself before showing your partner. That way the selection came from films they already approved — it's just curated by you. A nice middle ground between surprise and mutual agreement.",
  },
  {
    question: "How do we pick between multiple matches?",
    answer:
      "If you both superlikes the same film, that's your obvious first choice. Otherwise, scan the match list together — it's usually fast to land on one when you're choosing from a short list of pre-approved options rather than the entire Netflix catalogue.",
  },
  {
    question: "Does it work for a first date or just established couples?",
    answer:
      "Both. For a first date, Watch Together is actually a great activity to do together — you swipe side by side and see what overlaps, which can spark conversation. For established couples, it's a practical tool to escape the scroll loop.",
  },
];

export default function DateNightMoviePickerPage() {
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
              { "@type": "ListItem", position: 3, name: "Date Night Movie Picker", item: "https://logflix.app/en/date-night-movie-picker" },
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
        h1="Date Night Movie Picker"
        heroSubtitle="Find the perfect film for your evening — without spoiling the mood with a long debate."
        ctaText="Find your date night movie — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/movies-for-date-night", label: "Movies for date night" },
          { href: "/en/movie-picker-for-two", label: "Movie picker for two" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Set the right tone for the evening
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Date night has an energy that&apos;s worth protecting. Spending forty minutes debating what to
            watch is a quiet drain on that energy — it doesn&apos;t ruin the evening, but it flattens it.
            The goal is to get to the film quickly and with both people genuinely excited about it, not
            just one person resigned to it.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Watch Together solves this in a way that actually respects both people&apos;s taste. You each
            swipe through the same films independently — no influence from each other — and the match list
            shows only films you mutually approved. That list is short, and choosing from it is easy.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Genres that tend to work for date night
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Romantic drama", examples: "The Notebook, Normal People" },
              { label: "Thriller", examples: "Gone Girl, Parasite" },
              { label: "Feel-good comedy", examples: "Crazy Rich Asians, About Time" },
              { label: "Prestige drama", examples: "Marriage Story, The Farewell" },
              { label: "Adventure", examples: "The Grand Budapest Hotel, La La Land" },
              { label: "True story", examples: "Fleabag, The Crown" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.4 }}>
                  {m.examples}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Make it part of the date
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Swiping through movies together can actually be fun on its own. Watching what the other person
            says yes to and no to — even without seeing it live — gives you a small window into their taste.
            The reveal moment when matches appear has a genuinely satisfying quality, especially if you both
            superlikes something unexpected. Use it as a starter activity before the film rather than a
            chore to get through.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
