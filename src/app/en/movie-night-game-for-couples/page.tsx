import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movie Night Game for Couples — Swipe, Match, Watch | Logflix",
  description:
    "Turn movie selection into a quick, fun game. Both swipe through films, see your matches, and pick a winner together. Free, no app needed.",
  alternates: {
    canonical: "https://logflix.app/en/movie-night-game-for-couples",
    languages: {
      en: "https://logflix.app/en/movie-night-game-for-couples",
      "x-default": "https://logflix.app/en/movie-night-game-for-couples",
    },
  },
};

const faqItems = [
  {
    question: "How does the game work?",
    answer:
      "Both of you get a stack of movie cards. Swipe right if you'd watch it, left to pass. You can't see each other's swipes. When the round ends, Watch Together shows your matches — films you both swiped right on. If you want to turn up the competitive side, compare how many you each swiped right on, or guess in advance how many you'll match on.",
  },
  {
    question: "What are superlikes for?",
    answer:
      "You each get 3 superlikes per round. Use one when you really want to watch something. In the match list, superliked films get highlighted — if you both superlikes the same movie, it's your obvious first pick. Strategically, a superlike signals strong preference, which can help break a tie in the final choice.",
  },
  {
    question: "Can we make it a multi-round tournament?",
    answer:
      "Yes. Run round one with 25 films. Then run round two with the top matches and rate them again, or simply discuss which of the matched films you'd most want to watch. Some couples treat the match list as the semi-finals and pick one final winner together.",
  },
  {
    question: "Can we play with a theme? Like only horror, or only 90s films?",
    answer:
      "You can filter by streaming service, which will naturally limit the pool. Within that, both of you can pass quickly on anything outside your chosen theme. If you want a strict genre session, use the genre info on the movie cards as a guide.",
  },
  {
    question: "Is this actually fun, or just a practical tool?",
    answer:
      "Genuinely both. Swiping quickly through movies and then comparing your match list has a satisfying reveal quality. Couples often end up laughing at unexpected matches or being surprised by what the other person said yes to. It's a 3-minute activity with a concrete, fun outcome.",
  },
];

export default function MovieNightGamePage() {
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
              { "@type": "ListItem", position: 3, name: "Movie Night Game for Couples", item: "https://logflix.app/en/movie-night-game-for-couples" },
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
        h1="Movie Night Game for Couples"
        heroSubtitle="Swipe. Match. Watch. Turn film selection into a 3-minute game you both win."
        ctaText="Start the game — free"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/swipe-movies-together", label: "Swipe movies together" },
          { href: "/en/tinder-for-movies", label: "Tinder for movies" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Why gamification actually helps here
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Picking a movie together is technically a decision problem. But decision problems get easier
            when they have clear rules, a time limit, and a defined outcome. Watch Together gives you all
            three: a structured swipe format, rounds that finish in 2–3 minutes, and a match list that
            marks the end state.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            The game framing also shifts the energy. Instead of &quot;we need to pick something,&quot; it becomes
            &quot;let&apos;s play a quick round and see what we both said yes to.&quot; That&apos;s more fun. And
            the reveal moment — when matches appear and you discover what you both chose — has a genuine
            quality that a browser scroll never delivers.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            How to play
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Round 1", detail: "25 films, ~2 minutes. Both swipe independently." },
              { label: "Superlikes", detail: "3 per person per round. Use them for your strongest preferences." },
              { label: "The reveal", detail: "Matches appear when both of you finish." },
              { label: "Pick a winner", detail: "Choose from your match list — or do Round 2." },
              { label: "Round 2", detail: "15 films, ~1 minute. Narrows it down further." },
              { label: "Watch", detail: "Stream directly from the match card." },
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
                <div style={{ color: "#E50914", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
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
            The competitive variant
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Before you start, each person predicts how many films you&apos;ll match on. Closest prediction
            wins — loser picks the snacks. Or: whoever uses a superlike on the most matched films gets to
            pick from the match list unilaterally. Small stakes, big energy. The match reveal is genuinely
            more fun when something light is riding on it.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
