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
      nb: "https://logflix.app/no/hva-skal-vi-se-i-kveld",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/what-should-we-watch-tonight",
    },
  },
};

const faqItems = [
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
  {
    question: "Can I filter by streaming service?",
    answer: "Yes. Before you start swiping you can select which streaming services you have — Netflix, HBO Max, Disney+, Viaplay, and more. Logflix only shows titles available on the services you pick, so every match is something you can actually watch tonight.",
  },
  {
    question: "Does it work for groups, not just couples?",
    answer: "Watch Together is designed for two people, but Logflix also has a Group Watch mode for 3 or more. Same swiping concept, with extra voting rounds so the whole group agrees on one title.",
  },
];

export default function WhatToWatchPage() {
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
              { "@type": "ListItem", position: 3, name: "What Should We Watch Tonight?", item: "https://logflix.app/en/what-should-we-watch-tonight" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Decide What to Watch Tonight in Under 3 Minutes",
            description: "Use the Logflix Watch Together feature to settle the nightly debate with your partner or friends.",
            totalTime: "PT3M",
            step: [
              { "@type": "HowToStep", position: 1, name: "Open Watch Together", text: "Go to logflix.app/together on your phone. No account or download needed." },
              { "@type": "HowToStep", position: 2, name: "Pick your streaming services", text: "Select the services you both have — Netflix, HBO Max, Disney+, etc. Only titles available on those services will appear." },
              { "@type": "HowToStep", position: 3, name: "Share the code", text: "Tap 'Start Duo' to create a session. Share the 6-letter code or QR code with your partner." },
              { "@type": "HowToStep", position: 4, name: "Swipe independently", text: "Both of you swipe through 25 titles — right for yes, left for no. Neither of you sees the other's picks." },
              { "@type": "HowToStep", position: 5, name: "See your match", text: "Logflix reveals the titles you both liked. Tap to start watching immediately on your preferred service." },
            ],
          }),
        }}
      />
      <SeoGuideLayout
        locale="en"
        h1="What Should We Watch Tonight?"
        heroSubtitle="Stop scrolling for an hour and watching nothing. Swipe and find something you both actually want to see."
        ctaText="Try Watch Together — free"
        trustLine="Free · Under 3 minutes · No app to download"
        relatedLinks={[
          { href: "/en/watch-together", label: "Watch Together — free couple movie picker" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/stop-arguing-about-what-to-watch", label: "Stop arguing about what to watch" },
          { href: "/en/movies-for-date-night", label: "Movies for date night" },
          { href: "/en/tv-shows-to-watch-together", label: "TV shows to watch together" },
          { href: "/en/movies-to-watch-with-friends", label: "Movies to watch with friends" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Last updated: March 2026
        </p>

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

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Why &quot;What Should We Watch?&quot; Is Harder Than It Sounds
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            It seems like a simple question. You sit down on the couch, open Netflix, and suddenly
            45 minutes have disappeared into an endless scroll. This isn&apos;t a character flaw — it&apos;s a
            well-documented psychological phenomenon called <strong style={{ color: "rgba(255,255,255,0.75)" }}>decision paralysis</strong>.
            When faced with hundreds of options and no clear way to compare them, our brains freeze.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Now multiply that by two people. You&apos;re not just battling your own indecision —
            you&apos;re navigating a social negotiation. Nobody wants to suggest something the other person
            secretly hates. So you both say &quot;I don&apos;t mind, you pick&quot; and the loop continues. Researchers
            call this <strong style={{ color: "rgba(255,255,255,0.75)" }}>pluralistic ignorance</strong>: both people
            assume the other has a strong preference, so neither voices their own.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Add streaming fragmentation to the mix — titles split across Netflix, HBO Max, Disney+,
            Viaplay, and more — and you&apos;re not even sure what&apos;s available where. The result?
            You spend more time choosing than watching, and often settle for something neither of
            you truly wanted.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Watch Together short-circuits this entire loop. Instead of negotiating out loud, both of you
            swipe independently on the same curated deck of titles. You never see what the other person
            picks, which removes the social pressure entirely. When your likes overlap, that&apos;s your
            match — and you&apos;re watching in under 3 minutes.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            How to Decide in Under 3 Minutes
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Here&apos;s exactly how Watch Together turns the nightly &quot;what should we watch&quot; debate
            into a 3-minute ritual:
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open Watch Together", desc: "Go to logflix.app/together on any phone or laptop. No account, no download." },
              { title: "Pick your streaming services", desc: "Select Netflix, HBO Max, Disney+, or whichever services you have. Only available titles will appear." },
              { title: "Share the code with your partner", desc: "Tap 'Start Duo' to get a 6-letter code or QR code. Your partner joins in seconds." },
              { title: "Swipe through 25 titles", desc: "Each of you swipes independently — right for interested, left for pass. Neither of you sees the other's choices." },
              { title: "See your match and press play", desc: "Logflix reveals the titles you both liked. Tap the match to open it directly in Netflix, HBO, or wherever it streams." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong>{" "}{step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            The entire process takes 2–3 minutes. Most couples find a match in Round 1.
            If you don&apos;t, a shorter second round narrows the field further, and Logflix
            picks the best compromise from what you both rated highest.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Tonight&apos;s Top Picks
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Not sure where to start? These are some of the most-matched titles on Logflix right now:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "The Bear", year: 2022, type: "Series", note: "Intense, fast-paced, and surprisingly emotional. Perfect when you both want something gripping." },
              { title: "Everything Everywhere All at Once", year: 2022, type: "Movie", note: "Wild, creative, and heartfelt. Works whether you're in the mood for action, comedy, or a good cry." },
              { title: "Shogun", year: 2024, type: "Series", note: "Epic storytelling with stunning visuals. Great for couples who love slow-burn drama." },
              { title: "Past Lives", year: 2023, type: "Movie", note: "Quiet and beautiful. Ideal for a thoughtful, romantic evening." },
              { title: "Fallout", year: 2024, type: "Series", note: "Fun post-apocalyptic adventure. Perfect popcorn entertainment for two." },
            ].map((pick) => (
              <div key={pick.title} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{pick.title}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{pick.year} · {pick.type}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  {pick.note}
                </p>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 10 }}>
            These are popular starting points — Watch Together serves a curated deck from thousands of titles
            based on your streaming services and mood preference.
          </p>
        </section>

        <p style={{
          color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32,
        }}>
          The problem isn&apos;t a lack of things to watch — it&apos;s too much choice and two people
          with different tastes. Watch Together solves this by letting you both swipe yes or no
          independently, then showing only the titles you matched on. No negotiating, no
          compromise, no one sacrificing their evening.
        </p>

        <FaqSection
          title="Frequently Asked Questions"
          items={faqItems}
        />
      </SeoGuideLayout>
    </>
  );
}
