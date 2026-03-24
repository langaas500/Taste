import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Couple Streak — Track Your Movie Nights Together | Logflix",
  description:
    "Keep your couple streak alive. Match on a movie every week and unlock rewards. See how consistent you are as a movie couple.",
  alternates: {
    canonical: `${BASE}/en/couple-streak`,
    languages: {
      en: `${BASE}/en/couple-streak`,
      "x-default": `${BASE}/en/couple-streak`,
    },
  },
  openGraph: {
    title: "Couple Streak — Track Your Movie Nights Together | Logflix",
    description:
      "Keep your couple streak alive. Match on a movie every week and unlock rewards.",
    url: `${BASE}/en/couple-streak`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "How does the Couple Streak work?",
    answer:
      "Every time you and your partner match on a movie or series in Watch Together within a week, your streak increases by one. The streak counter resets if a full week passes without a match. It's designed to be easy to maintain — one match per week is all it takes.",
  },
  {
    question: "What rewards do you unlock?",
    answer:
      "At 4 weeks you unlock a curated 'Classics' guide collection. At 8 weeks you get 'Hidden Gems' — lesser-known titles matched to your couple's taste. At 12 weeks you unlock 'Weekend Pick' — a premium mood-based guide. More rewards are added over time.",
  },
  {
    question: "Does my streak freeze if I cancel premium?",
    answer:
      "Yes. If you cancel your Logflix Premium subscription, your streak is frozen — not lost. When you resubscribe, your streak picks up exactly where you left off. No progress is ever deleted.",
  },
  {
    question: "Do both partners need a Logflix account?",
    answer:
      "Only one partner needs a Logflix account to track the streak. The other can join Watch Together sessions as a guest using the 6-letter code. However, both having accounts gives you access to the full Couple Report and Taste Compatibility features.",
  },
];

export default function CoupleStreakPage() {
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
              { "@type": "ListItem", position: 3, name: "Couple Streak", item: "https://logflix.app/en/couple-streak" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Logflix Couple Streak",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/en/couple-streak`,
            featureList: [
              "Weekly match streak tracking",
              "Gamified rewards",
              "Curated guide unlocks",
              "Frozen streak on pause",
            ],
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "NOK",
              description: "Logflix Premium",
            },
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
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      <SeoGuideLayout
        locale="en"
        h1="Couple Streak — Keep the Movie Nights Going"
        heroSubtitle="Match on a movie every week. Build your streak. Unlock exclusive rewards."
        ctaText="Start Watch Together — free"
        trustLine="One match per week · Rewards at 4, 8 and 12 weeks · Streak freezes if you pause"
        relatedLinks={[
          { href: "/together", label: "Start Watch Together now" },
          { href: "/en/watch-together", label: "How Watch Together works" },
          { href: "/en/taste-profile", label: "Your Taste Profile" },
          { href: "/en/wrapped", label: "Logflix Wrapped — your movie year" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            What is the Couple Streak?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            The Couple Streak tracks how many consecutive weeks you and your partner have matched
            on a movie or series in Watch Together. One match per week is all it takes to keep the
            streak alive. Miss a week, and it resets to zero.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            It sounds simple — and it is. But that simplicity is the point. The streak gives you a
            small, recurring reason to sit down together and pick something to watch. No pressure
            to binge, no commitment beyond one title per week.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Your streak is visible on the Watch Together intro screen. When it&rsquo;s at risk
            (less than a day left in the week), you&rsquo;ll see a warning. It&rsquo;s a gentle
            nudge, not a notification bombardment.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Rewards that actually matter
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                weeks: "4",
                title: "Classics collection",
                desc: "A curated guide of must-see classic films matched to your couple's taste. Not just any classics — the ones you're most likely to enjoy based on your watch history.",
              },
              {
                weeks: "8",
                title: "Hidden Gems",
                desc: "Lesser-known titles with high ratings that match your shared preferences. The kind of movies you'd never find scrolling Netflix, but that you'll both love.",
              },
              {
                weeks: "12",
                title: "Weekend Pick",
                desc: "A premium mood-based guide collection. Think 'Perfect for a rainy Sunday' or 'Date night classics' — personalized for your couple's unique taste profile.",
              },
            ].map(({ weeks, title, desc }) => (
              <div
                key={weeks}
                style={{
                  display: "flex",
                  gap: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,42,42,0.12)",
                    color: "#ff2a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {weeks}w
                </span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            padding: "24px 20px",
            marginBottom: 40,
            background: "rgba(255,42,42,0.04)",
            border: "1px solid rgba(255,42,42,0.15)",
            borderRadius: 14,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Start building your streak tonight
          </p>
          <a
            href="/together"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#ff2a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Start Watch Together — free
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            No account needed to play · Streak tracking requires a free account
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why gamify movie night?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Most couples fall into a pattern: a burst of movie nights, then weeks of nothing.
            The streak mechanic creates a lightweight commitment that keeps the habit going without
            turning it into a chore. One match per week is low-effort enough to maintain even
            during busy periods.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            The rewards are designed to feed back into the experience. Unlocking a curated guide
            gives you new titles to explore together, which in turn makes the next Watch Together
            session more interesting. It&rsquo;s a virtuous cycle: watch together, unlock content,
            discover more, watch together again.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
