import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Tinder for Movies — Swipe and Match on Films Together | Logflix",
  description:
    "Like Tinder, but for choosing a movie with your partner. Swipe right on films you want to watch, get matched on the ones you both picked.",
  alternates: {
    canonical: "https://logflix.app/en/tinder-for-movies",
    languages: {
      en: "https://logflix.app/en/tinder-for-movies",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/tinder-for-movies",
    },
  },
};

const faqItems = [
  {
    question: "Is this literally Tinder but for movies?",
    answer:
      "Pretty much. You and your partner each get a stack of movie cards to swipe through — right if you want to watch it, left to pass. The mechanic is identical to what you know from Tinder. The key difference: you're matching on films you both want to watch tonight, not on people.",
  },
  {
    question: "Can my partner see what I swiped?",
    answer:
      "No. That's the whole point. You each swipe your own stack in private. Logflix only reveals a movie if both of you swiped right on it. No awkward moments where you rejected your partner's suggestion.",
  },
  {
    question: "How many movies do we swipe through?",
    answer:
      "Around 20–30 in the first round, which takes roughly 2–3 minutes. The titles are pulled from what's actually available on your chosen streaming service, so nothing in the stack is unavailable where you live.",
  },
  {
    question: "What streaming services are supported?",
    answer:
      "Netflix, HBO Max, Disney+, Prime Video, Apple TV+, Viaplay, and several others depending on your region. You pick one (or any) before you start swiping.",
  },
  {
    question: "Do we both need the app?",
    answer:
      "There's no app to download. Watch Together runs entirely in the browser. Open the link on any phone or laptop and you're ready to swipe.",
  },
];

export default function TinderForMoviesPage() {
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
              { "@type": "ListItem", position: 3, name: "Tinder for Movies", item: "https://logflix.app/en/tinder-for-movies" },
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
        h1="Tinder for Movies"
        heroSubtitle="Swipe right on films you want to watch. Match with your partner. Watch."
        ctaText="Start swiping — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/swipe-movies-together", label: "Swipe movies together" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/movie-matching-app-for-couples", label: "Movie matching app for couples" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The swipe mechanic you already know
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Tinder cracked something nobody else had figured out: decisions are easier when you react
            quickly to one option at a time rather than comparing a grid of twenty. The same principle
            works brilliantly for movies. Instead of staring at a Netflix homepage wondering where to
            start, you get one card at a time. React instinctively. Keep going. The swipe stack moves fast
            and the decision feels effortless.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Watch Together brings that mechanic to movie night. Both you and your partner swipe through
            the same pool of films independently. The algorithm compares your swipes and surfaces only
            your mutual yeses — the movies where you both said &quot;yes, I&apos;d watch that.&quot;
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            What you see when you match
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Movie poster", detail: "High-res art from TMDB" },
              { label: "Genre & runtime", detail: "Know what you're committing to" },
              { label: "Where to watch", detail: "Streaming platform shown instantly" },
              { label: "Match confidence", detail: "Superlike = strong signal" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Why it works when everything else fails
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Picking a film by committee is painful because proposals feel like they carry social weight.
            Suggesting something and having your partner visibly not respond the way you hoped is mildly
            deflating. The swipe format removes this friction entirely. You each react in private, nobody
            knows whose suggestion it was, and the match list is neutral ground. It&apos;s the same reason
            Tinder became ubiquitous for dating — removing the social cost of rejection makes the whole
            process faster and more enjoyable for everyone.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
