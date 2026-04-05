import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "What to Watch Together Tonight — Decide in 3 Minutes | Logflix",
  description:
    "Both swipe independently. Only mutual likes become a match. No app, no login — just open the link and find something you both want to watch.",
  alternates: {
    canonical: "https://logflix.app/en/what-to-watch-together",
    languages: {
      en: "https://logflix.app/en/what-to-watch-together",
      "x-default": "https://logflix.app/en/what-to-watch-together",
    },
  },
};

const faqItems = [
  {
    question: "How does Watch Together actually work?",
    answer: "Both of you open the same session on your phones. You swipe through movies and shows independently — you never see what the other person picks. After both finish, Logflix reveals only the titles you both liked. That's your match.",
  },
  {
    question: "Do we both need accounts?",
    answer: "No. Neither of you needs an account. Just open logflix.app/together, tap Start, and share the code with your partner. They join in seconds.",
  },
  {
    question: "Can we filter by streaming service?",
    answer: "Yes. Before swiping you select the streaming services you have — Netflix, HBO Max, Disney+, Viaplay, and more. Only titles available on your selected services appear in the deck.",
  },
  {
    question: "What if we don't match on anything?",
    answer: "If Round 1 doesn't produce a match, a shorter Round 2 narrows the field. Logflix picks the title you both rated highest — so you always land on something.",
  },
];

export default function WhatToWatchTogetherPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2026-04-05",
            dateModified: "2026-04-05",
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
        h1="What to Watch Together Tonight"
        heroSubtitle="Stop scrolling endlessly. Swipe, match, and start watching in under 3 minutes."
        ctaText="Try Watch Together — free"
        trustLine="Free · No app · No login · Works on any phone"
        relatedLinks={[
          { href: "/en/cant-decide-what-to-watch", label: "Can't decide what to watch?" },
          { href: "/en/what-to-watch-with-girlfriend", label: "What to watch with your girlfriend" },
          { href: "/en/find-something-to-watch-fast", label: "Find something to watch — fast" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Last updated: April 2026
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The Real Problem Isn&apos;t What&apos;s On — It&apos;s Agreeing
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            There are thousands of movies and shows streaming right now. The problem was never a lack of options. It&apos;s that two people have different tastes, different moods, and no efficient way to find the overlap.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            The usual routine: one person suggests something, the other isn&apos;t sure, you both scroll for 30 minutes, and end up rewatching something safe. Sound familiar?
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "Too many choices across too many streaming services",
              "Neither person wants to pick something the other hates",
              "You end up defaulting to whatever's trending — not what you'd actually enjoy",
              "The longer you scroll, the less you want to watch anything",
              "One person always \"doesn't mind\" — which means nobody decides",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The Fastest Way to Decide
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Watch Together works like this: both of you swipe through the same set of movies and shows on your own phones. You never see what the other person picks. When your likes overlap — that&apos;s your match.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app to download, no account to create. Works on any browser." },
              { title: "Select your streaming services", desc: "Pick Netflix, Disney+, HBO Max, Viaplay — whatever you have. Only titles on your services will show up." },
              { title: "Share the code", desc: "Tap 'Start Duo' and send the 6-letter code or QR to your partner. They join in seconds." },
              { title: "Swipe independently", desc: "Each of you swipes through 25 titles. Right = interested, left = pass. Nobody sees the other's choices." },
              { title: "See your match", desc: "Logflix reveals titles you BOTH liked. Tap to start watching on the streaming service it's on." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            The whole thing takes 2–5 minutes. You only see what you both like — no compromising, no awkward negotiations.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Great Starting Points for Tonight
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Severance", year: 2022, type: "Series", note: "Mysterious, gripping, and endlessly discussable. Both of you will have theories." },
              { title: "The Menu", year: 2022, type: "Movie", note: "Dark comedy that's equal parts tense and funny. Best when you're both in a slightly weird mood." },
              { title: "Slow Horses", year: 2022, type: "Series", note: "Smart British spy drama. Perfect when you want something tight and well-written." },
              { title: "Glass Onion", year: 2022, type: "Movie", note: "Fun whodunit with sharp writing. Works for any mood — comedy, mystery, or just popcorn." },
              { title: "Beef", year: 2023, type: "Series", note: "Darkly funny road-rage drama that hooks you both from episode one." },
              { title: "The Holdovers", year: 2023, type: "Movie", note: "Warm, thoughtful, and surprising. Great for a quieter evening together." },
            ].map((pick) => (
              <div key={pick.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{pick.title}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{pick.year} · {pick.type}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{pick.note}</p>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 10 }}>
            Watch Together serves titles from your selected streaming services — these are just popular starting points.
          </p>
        </section>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          The problem isn&apos;t finding something good — it&apos;s finding something you <em>both</em> want. Watch Together removes the guesswork. You each swipe honestly, and the overlap speaks for itself.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
