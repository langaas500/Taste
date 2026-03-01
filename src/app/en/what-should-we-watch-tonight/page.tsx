import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "What Should We Watch Tonight? (Decide in Under 3 Minutes)",
  description:
    "Tired of scrolling for 40 minutes? Swipe separately and instantly see what you both agree on. No arguing. No awkward picks. Decide what to watch tonight in under 3 minutes.",
  alternates: {
    canonical: "https://logflix.app/en/what-should-we-watch-tonight",
    languages: {
      en: "https://logflix.app/en/what-should-we-watch-tonight",
      no: "https://logflix.app/no/hva-skal-vi-se-i-kveld",
      "x-default": "https://logflix.app/en/what-should-we-watch-tonight",
    },
  },
};

export default function WhatToWatchPage() {
  return (
    <SeoGuideLayout
      locale="en"
      h1="What Should We Watch Tonight?"
      heroSubtitle="Stop scrolling for an hour and watching nothing. Swipe and find something you both actually want to see."
      ctaText="Try Watch Together — free"
      trustLine="Free · Under 3 minutes · No app to download"
      relatedLinks={[
        { href: "/en/movies-for-date-night", label: "Movies for date night" },
        { href: "/en/tv-shows-to-watch-together", label: "TV shows to watch together" },
        { href: "/en/movies-to-watch-with-friends", label: "Movies to watch with friends" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          What kind of night is it?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Relaxed", examples: "Ted Lasso, Schitt's Creek" },
            { label: "Thrilling", examples: "Succession, Ozark" },
            { label: "Romantic", examples: "About Time, Normal People" },
            { label: "Action", examples: "Top Gun, John Wick" },
            { label: "Scary", examples: "The Haunting of Hill House" },
            { label: "Documentary", examples: "Free Solo, Making a Murderer" },
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
        The problem isn't a lack of things to watch — it's too much choice and two people
        with different tastes. Watch Together solves this by letting you both swipe yes or no
        independently, then showing only the titles you matched on. No negotiating, no
        compromise, no one sacrificing their evening.
      </p>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "Why does it always take so long to decide?",
            answer: "Too many choices leads to decision paralysis. When two people need to agree on one title from thousands, you easily end up browsing for 40 minutes and watching nothing. Watch Together limits the options to only what you actually overlap on.",
          },
          {
            question: "How does Watch Together work?",
            answer: "Both of you open the same session on your phones and swipe through movies and shows independently. Neither of you sees what the other picks. Logflix then reveals only the titles you both liked — those are your matches.",
          },
          {
            question: "What if we like completely different genres?",
            answer: "That's exactly where Watch Together is strongest. Most couples are surprised by how much hidden overlap they have. You often agree more than you think — you just never had a way to find it without a long debate.",
          },
          {
            question: "Is it really free?",
            answer: "Yes. Watch Together is completely free, forever. No account needed, no app to download. Just open logflix.app/together on your phone and share the code.",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
