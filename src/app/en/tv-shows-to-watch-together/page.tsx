import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "TV Shows to Watch Together 2026 | Best Series for Couples & Friends — Logflix",
  description:
    "Find your next binge-worthy series together — without spending the whole evening deciding what to start.",
  alternates: {
    canonical: "https://logflix.app/en/tv-shows-to-watch-together",
    languages: {
      en: "https://logflix.app/en/tv-shows-to-watch-together",
      no: "https://logflix.app/no/serie-a-se-sammen",
      "x-default": "https://logflix.app/en/tv-shows-to-watch-together",
    },
  },
};

export default function TvShowsTogetherPage() {
  return (
    <SeoGuideLayout
      locale="en"
      h1="TV Shows to Watch Together"
      heroSubtitle="Find your next series to binge together — no debate, no one person deciding for everyone."
      ctaText="Try Watch Together — free"
      trustLine="Free · Under 3 minutes · No app to download"
      relatedLinks={[
        { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
        { href: "/en/movies-for-date-night", label: "Movies for date night" },
        { href: "/en/movies-to-watch-with-friends", label: "Movies to watch with friends" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Genres that work best together
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Drama", examples: "Succession, The Bear, Severance" },
            { label: "Comedy", examples: "Ted Lasso, Schitt's Creek" },
            { label: "Thriller", examples: "Ozark, Dark, Sharp Objects" },
            { label: "Sci-fi", examples: "Stranger Things, Black Mirror" },
            { label: "True crime", examples: "Making a Murderer, The Staircase" },
            { label: "Fantasy", examples: "House of the Dragon, The Witcher" },
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
        A great shared series is one of the best things a couple or friend group can have —
        something to look forward to, something to talk about, and no decision to make every
        night. The hard part is agreeing on what to start. Watch Together lets you both swipe
        through series independently and only shows what you matched on — so you start
        something you're both genuinely into.
      </p>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What are the best shows to watch together right now?",
            answer: "Top picks right now include The Bear (drama/comedy), Severance (thriller/sci-fi), The White Lotus (drama), and Nobody Wants This (romance/comedy). All have strong pacing, great characters, and plenty to discuss between episodes. Logflix always shows current availability across streaming services.",
          },
          {
            question: "How do we avoid watching ahead without each other?",
            answer: "The classic 'don't watch without me' rule. Most streaming services let you create separate profiles so your progress stays separate. Some services like Netflix also have a shared viewing profile for couples.",
          },
          {
            question: "What if we like completely different shows?",
            answer: "That's exactly what Watch Together is built for. You both swipe independently — neither sees what the other picks — and the app surfaces only series you both said yes to. Most couples find more overlap than they expected.",
          },
          {
            question: "How many episodes should we watch per night?",
            answer: "2–3 episodes is a solid rhythm for most. Enough for a satisfying evening without burning through the whole season. For 30-minute comedies you can comfortably watch 4–5. The main thing is stopping before it becomes a chore.",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
