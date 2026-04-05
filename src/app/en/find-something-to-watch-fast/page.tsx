import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Find Something to Watch Fast — 3 Minutes, No Scrolling | Logflix",
  description:
    "Stop wasting your evening scrolling. Watch Together lets two people swipe independently and match on a movie in under 3 minutes. Free, no app needed.",
  alternates: {
    canonical: "https://logflix.app/en/find-something-to-watch-fast",
    languages: {
      en: "https://logflix.app/en/find-something-to-watch-fast",
      "x-default": "https://logflix.app/en/find-something-to-watch-fast",
    },
  },
};

const faqItems = [
  {
    question: "How fast is it really?",
    answer: "Most couples match in under 3 minutes. You swipe through 25 titles in Round 1, and mutual likes are revealed instantly. If needed, a shorter Round 2 narrows it further.",
  },
  {
    question: "What if I'm watching alone?",
    answer: "Watch Together has a solo mode too. Swipe through titles on your own to build a personal watchlist, or start solo and invite someone to join mid-session.",
  },
  {
    question: "Does it work for groups?",
    answer: "Yes. Watch Together is designed for two people, but Logflix also has a Group Watch mode for 3 or more — same swiping concept with extra voting rounds so the whole group agrees.",
  },
];

export default function FindSomethingFastPage() {
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
        h1="Find Something to Watch — Fast"
        heroSubtitle="You finally have a free evening. Don't waste it scrolling."
        ctaText="Pick something before you start scrolling again"
        trustLine="Free · 3 minutes · No app · No login"
        relatedLinks={[
          { href: "/en/what-to-watch-together", label: "What to watch together tonight" },
          { href: "/en/cant-decide-what-to-watch", label: "Can't decide what to watch?" },
          { href: "/en/what-to-watch-with-girlfriend", label: "What to watch with your girlfriend" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Last updated: April 2026
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Your Evening Is Disappearing
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You open Netflix. Scroll a bit.
            <br />Open a trailer. Close it. Too much was spoiled.
            <br />Check reviews on your phone. Conflicting opinions.
            <br />Back to scrolling.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            25 minutes gone. You haven&apos;t watched anything.
            <br />The apps keep you scrolling. Not deciding.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "You scroll past good options waiting for a perfect one",
              "Titles are spread across 4 different apps",
              "Trailers spoil, reviews confuse, nothing helps you commit",
              "Someone else is waiting — now there's pressure too",
              "You pick something out of exhaustion, not excitement",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            3 Minutes. Done Before You Overthink It.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            You don&apos;t browse. You don&apos;t compare. You swipe — fast. Both of you. Separately. You only see what you both liked. Faster than watching one trailer.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app. No account. Just go." },
              { title: "Pick your services", desc: "You only see what you can actually watch tonight." },
              { title: "Send the code", desc: "6 letters. Your partner joins in seconds." },
              { title: "Swipe 25 titles", desc: "Right = yes, left = no. Gut reactions. No research." },
              { title: "Match", desc: "What you both liked. Tap to watch. Done." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Most couples match in Round 1. You&apos;re watching something before the popcorn gets cold.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Instant Yes — No Thinking Required
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Don&apos;t even want to swipe? Just pick one of these and press play:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Bullet Train", year: 2022, type: "Movie", note: "2-second decision. Fast, dumb fun. Nobody regrets this pick." },
              { title: "Reacher", year: 2022, type: "Series", note: "One episode to decide. You'll both be in by minute 10." },
              { title: "The Banshees of Inisherin", year: 2022, type: "Movie", note: "Looks quiet, hits hard. The kind of film you don't expect to love." },
              { title: "Squid Game", year: 2021, type: "Series", note: "Haven't seen it? Tonight. Already seen it? Season 2." },
              { title: "Top Gun: Maverick", year: 2022, type: "Movie", note: "Just press play. Zero risk. Maximum popcorn." },
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
        </section>

        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 8 }}>
          You don&apos;t need more options.
          <br />You need to decide faster.
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          3 minutes. Match. Play.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
