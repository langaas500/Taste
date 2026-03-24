import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Swipe Movies Together — Free Couples Movie Picker | Logflix",
  description:
    "Swipe through movies together without spoiling the surprise. Both of you pick independently — Logflix reveals only what you both chose.",
  alternates: {
    canonical: "https://logflix.app/en/swipe-movies-together",
    languages: {
      en: "https://logflix.app/en/swipe-movies-together",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/swipe-movies-together",
    },
  },
};

const faqItems = [
  {
    question: "How does swiping work exactly?",
    answer:
      "You and your partner each open the session on your own device. You see movie cards one at a time — swipe right (or tap the checkmark) to say yes, swipe left (or tap X) to pass. Your partner does the same on their screen. After you both finish, Watch Together cross-references your swipes and shows every film you both approved.",
  },
  {
    question: "What if we're on different devices or different rooms?",
    answer:
      "That's the normal use case. One person creates the session and shares the link. The other opens it on their phone, tablet, or laptop. You swipe completely independently — no need to be next to each other.",
  },
  {
    question: "Are the movies filtered to what's actually on my streaming service?",
    answer:
      "Yes. Before you start, you choose which platform (or all platforms). Every card in your stack is a film currently available there. No clicking play and finding out it moved to another service.",
  },
  {
    question: "Can I start swiping and invite someone later?",
    answer:
      "Yes. You can swipe solo first — useful if you have strong opinions and want to pre-filter — then share the link when your partner is ready. Your solo swipes carry over automatically into the shared session.",
  },
  {
    question: "How long does a full session take?",
    answer:
      "First round: about 2 minutes for 25 titles. Most couples have several clear matches by the end of round one. If you want more options, a second round with 15 titles takes under a minute.",
  },
];

export default function SwipeMoviesTogetherPage() {
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
              { "@type": "ListItem", position: 3, name: "Swipe Movies Together", item: "https://logflix.app/en/swipe-movies-together" },
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
        h1="Swipe Movies Together"
        heroSubtitle="Swipe independently. Match instantly. No debate required."
        ctaText="Start swiping together — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/tinder-for-movies", label: "Tinder for movies" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/movie-night-game-for-couples", label: "Movie night game for couples" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The mechanics, step by step
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { step: "1", label: "Create session", detail: "Takes 5 seconds, no account" },
              { step: "2", label: "Share link", detail: "Copy → send over text or WhatsApp" },
              { step: "3", label: "Both swipe", detail: "On your own devices, simultaneously" },
              { step: "4", label: "Matches appear", detail: "Only films you both approved" },
              { step: "5", label: "Pick one", detail: "Or do a second round if you want more" },
              { step: "6", label: "Watch", detail: "Stream directly from the match card" },
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
                <div style={{ color: "#E50914", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
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
            Why the swipe format beats scrolling together
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            When you browse a streaming service as a couple, one of two things happens: either one person
            takes control of the remote and drives while the other watches passively, or you both make
            suggestions and the conversation loops without resolution. Swiping independently sidesteps both
            failure modes.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Because you each react to the same set of films privately, there&apos;s no social pressure to
            approve something your partner suggested. You vote on pure instinct. That produces cleaner data —
            and a match list you can actually trust reflects what both people want.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Superlikes for strong preferences
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Each person gets 3 superlikes per round. Use one when you really want to watch something.
            Superliked films show up with a special marker in your match list — so if you both superlikes
            the same movie, you know that&apos;s the one to start with.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
