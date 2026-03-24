import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movie Picker for Two — Find Tonight's Film Together | Logflix",
  description:
    "A simple movie picker built for two people. Swipe, match, and have a film chosen together in under 3 minutes. Free, no sign-up required.",
  alternates: {
    canonical: "https://logflix.app/en/movie-picker-for-two",
    languages: {
      en: "https://logflix.app/en/movie-picker-for-two",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/movie-picker-for-two",
    },
  },
};

const faqItems = [
  {
    question: "How is this different from just asking each other what to watch?",
    answer:
      "When you ask each other directly, the first suggestion anchors the conversation and everything after is evaluated against it. Watch Together shows both of you the same pool of films independently, so you each form an honest opinion without being influenced by what the other person wants. The match is a genuine intersection, not a negotiated compromise.",
  },
  {
    question: "Can we use it for TV shows too, not just movies?",
    answer:
      "Yes. Watch Together includes both films and TV series. You can filter by type if one of you wants a movie night and the other is open to starting a new series.",
  },
  {
    question: "What if we're trying to find something to watch together but we're not in the same place?",
    answer:
      "That works perfectly. Share the session link over WhatsApp, iMessage, or any messaging app. Your partner opens it on their phone wherever they are, and you both swipe from your own locations. The results are the same.",
  },
  {
    question: "What genres and moods can we filter by?",
    answer:
      "You can filter by streaming service before you start. The films shown reflect what's available on that platform in your region. Genre filtering within the session comes from the titles themselves — you'll see a mix that represents what's available right now.",
  },
  {
    question: "Is there a limit to how many sessions we can run?",
    answer:
      "No limit. Run a new session every movie night. They're fast to create and there's no data to manage between sessions.",
  },
];

export default function MoviePickerForTwoPage() {
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
              { "@type": "ListItem", position: 3, name: "Movie Picker for Two", item: "https://logflix.app/en/movie-picker-for-two" },
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
        h1="Movie Picker for Two"
        heroSubtitle="Simple, fast, and fair. Find tonight&apos;s film without the back-and-forth."
        ctaText="Pick a movie for two — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/date-night-movie-picker", label: "Date night movie picker" },
          { href: "/en/movie-to-watch-with-your-girlfriend", label: "Movie to watch with your girlfriend" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Built for exactly two opinions
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Group movie decisions are hard. But two-person decisions have their own specific difficulty:
            there&apos;s no tiebreaker. When you&apos;re picking a film for two, either you agree or you
            don&apos;t — and if you don&apos;t, someone has to concede.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Watch Together is designed specifically for this dynamic. Both people vote on the same
            list privately, and the result is a set of films that already has both votes. There&apos;s
            no concession — you&apos;re choosing from a list where both answers were &quot;yes.&quot;
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            What to watch tonight — by mood
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Something easy", examples: "Light comedy, feel-good drama" },
              { label: "Something gripping", examples: "Thriller, crime, mystery" },
              { label: "Something beautiful", examples: "Visually stunning, epic" },
              { label: "Something funny", examples: "Comedy, mockumentary" },
              { label: "Something emotional", examples: "Drama, true story" },
              { label: "Something short", examples: "Under 90 min, anthology" },
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
            No account, no friction
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            The best movie picker for two is one that you&apos;ll actually use — not one that requires
            a signup, a profile, and syncing preferences across devices. Watch Together takes 30 seconds
            to set up and works on any phone. Open it, share the link, and both start swiping. The match
            appears automatically when you both finish.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
