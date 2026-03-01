import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movies for Date Night | Find One You Both Want to Watch — Logflix",
  description:
    "Planning a date night? Stop debating and start watching. Swipe through movies together and find your match in under 3 minutes.",
  alternates: {
    canonical: "https://logflix.app/en/movies-for-date-night",
    languages: {
      en: "https://logflix.app/en/movies-for-date-night",
      no: "https://logflix.app/no/romantiske-filmer-netflix-norge",
      "x-default": "https://logflix.app/en/movies-for-date-night",
    },
  },
};

export default function MoviesForDateNightPage() {
  return (
    <SeoGuideLayout
      locale="en"
      h1="Movies for Date Night"
      heroSubtitle="Find a movie you're both actually excited to watch — not just one person's compromise."
      ctaText="Try Watch Together — free"
      trustLine="Free · Under 3 minutes · No app to download"
      relatedLinks={[
        { href: "/en/movie-to-watch-with-your-girlfriend", label: "Movie to watch with your girlfriend" },
        { href: "/en/tv-shows-to-watch-together", label: "TV shows to watch together" },
        { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Best genres for date night
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Rom-com", examples: "Crazy Rich Asians, The Proposal" },
            { label: "Romantic drama", examples: "About Time, La La Land" },
            { label: "Action romance", examples: "Mr. & Mrs. Smith, True Lies" },
            { label: "Thriller", examples: "Gone Girl, Knives Out" },
            { label: "Feel-good", examples: "Notting Hill, Hitch" },
            { label: "Classic", examples: "Casablanca, Roman Holiday" },
          ].map((m) => (
            <div key={m.label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "12px 14px",
            }}>
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

      <p style={{
        color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32,
      }}>
        A great date night movie isn't necessarily the most romantic one — it's the one
        you're both genuinely excited about. Spending 30 minutes picking something kills
        the mood faster than a bad movie does. Watch Together lets you both swipe through
        options independently and shows only the titles you matched on. Takes 3 minutes,
        works every time.
      </p>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What makes a good date night movie?",
            answer: "A good date night movie has strong pacing, emotional moments worth sharing, and ideally something to talk about afterward. Rom-coms are a safe bet, but thrillers and dramas with romantic subplots often work just as well — especially if you both genuinely want to watch it.",
          },
          {
            question: "New release or a classic?",
            answer: "Both work. New releases give you something fresh to discover together. Classics have the advantage of being proven — you know it's good going in. If one of you hasn't seen a beloved classic the other loves, that's often the best date night pick of all.",
          },
          {
            question: "How do we avoid ending up with something neither of us really wanted?",
            answer: "That's the Watch Together problem. Both of you swipe independently — no influencing each other — and only mutual matches surface. You skip the negotiation entirely and go straight to something you're both actually into.",
          },
          {
            question: "How long should a date night movie be?",
            answer: "90–110 minutes is the sweet spot for most couples. Long enough to feel like an event, short enough to leave time for conversation after. Avoid anything over 2.5 hours on a weeknight unless it's a special occasion.",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
