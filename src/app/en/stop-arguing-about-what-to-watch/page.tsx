import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Stop Arguing About What to Watch — Fix It in 3 Minutes | Logflix",
  description:
    "The 45-minute scroll debate ends here. Both of you swipe independently, Logflix finds your match, and you're watching something you both chose in under 3 minutes.",
  alternates: {
    canonical: "https://logflix.app/en/stop-arguing-about-what-to-watch",
    languages: {
      en: "https://logflix.app/en/stop-arguing-about-what-to-watch",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/stop-arguing-about-what-to-watch",
    },
  },
};

const faqItems = [
  {
    question: "Why do couples argue so much about what to watch?",
    answer:
      "Choosing a film together involves mild but real social risk. Suggesting something and having your partner react lukewarmly feels like a small rejection. So people hedge, say 'whatever you want,' and then feel quietly disappointed when the pick isn't right. Watch Together sidesteps this by letting both people vote privately — no suggestions, no reactions, just matches.",
  },
  {
    question: "What if we have completely different tastes?",
    answer:
      "Tastes overlap more than people expect. Even a thriller fan and a rom-com fan usually agree on a good drama, a smart comedy, or something with high production value. Watch Together surfaces that overlap — you'll often be surprised by what you both said yes to.",
  },
  {
    question: "Can we use it every movie night or just once?",
    answer:
      "Every time. Sessions are disposable — create one, swipe, watch, done. The next movie night, start a fresh session. No history to manage, no preferences to update.",
  },
  {
    question: "What if one person always wants to watch something the other doesn't?",
    answer:
      "That's actually useful data. If you rarely match, it might mean you're filtering on different streaming services, or one person is being more selective than the other. Try broadening the service filter or having the more selective person use a superlike on their top picks.",
  },
  {
    question: "Does it actually work, or will we still argue?",
    answer:
      "The format removes the main source of friction — one person proposing and the other reacting. Once you have a match list, you're choosing from films you both already said yes to. That's a fundamentally easier conversation.",
  },
];

export default function StopArguingPage() {
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
              { "@type": "ListItem", position: 3, name: "Stop Arguing About What to Watch", item: "https://logflix.app/en/stop-arguing-about-what-to-watch" },
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
        h1="Stop Arguing About What to Watch"
        heroSubtitle="The 45-minute scroll ends here. Find something you both want in under 3 minutes."
        ctaText="End the scroll — try Watch Together"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/movie-picker-for-two", label: "Movie picker for two" },
          { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            You know how this goes
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            It&apos;s 8:30 pm. You&apos;ve got two hours. Someone opens Netflix. You scroll.
            Someone says &quot;what about this?&quot; The other says &quot;I don&apos;t know.&quot;
            You go back to scrolling. Forty minutes later you&apos;re watching something neither of you
            was excited about, and the evening feels a little deflated before it started.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            This is one of the most universal couple frustrations — not because you have bad taste, but
            because the decision process itself is broken. Browsing a streaming platform together is
            designed for individual discovery, not joint decisions. It creates a loop that&apos;s very
            hard to exit.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Why the argument keeps happening
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Proposal anxiety", detail: "Suggesting something feels like putting yourself out there" },
              { label: "Lukewarm reactions", detail: '"Maybe" is worse than a clear no' },
              { label: "Decision fatigue", detail: "30 minutes of options and nothing feels right anymore" },
              { label: "Veto power", detail: "One \"no\" can kill a suggestion without alternatives" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(229,9,20,0.08)",
                  border: "1px solid rgba(229,9,20,0.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ color: "#ff6b6b", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.4 }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            What actually fixes it
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Watch Together removes the broken process and replaces it with a structured one. You each
            swipe through a stack of movies on your own device. No proposals. No reactions to manage.
            No veto power. Just fast private voting.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            At the end, you both see only the movies you mutually approved. Choosing from that list is
            easy because everything on it already has both votes. The argument doesn&apos;t happen because
            the format never creates the conditions for it.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
