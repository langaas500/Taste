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
        heroSubtitle="You have 3 hours free. Don't spend 1 of them scrolling. Match on a movie in under 3 minutes."
        ctaText="Try Watch Together — free"
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
            Why Finding Something Takes So Long
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You have a free evening. The couch is ready. But 25 minutes later you&apos;re still scrolling through Netflix, opening and closing trailers, reading reviews on your phone. The evening is slipping away.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Every streaming service is designed to keep you browsing. Autoplay trailers, endless rows, &quot;because you watched&quot; carousels — they optimize for time on platform, not for helping you decide quickly.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "Streaming apps are designed to make you scroll, not decide",
              "Titles are scattered across 3-5 different services",
              "Trailers spoil too much and reviews give conflicting opinions",
              "When another person is waiting, the pressure makes it worse",
              "You end up choosing by exhaustion, not excitement",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Decide in 3 Minutes — Here&apos;s How
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Watch Together cuts through the noise. Two people, same deck of titles, independent swiping. You only see what you both liked. The entire process takes less time than watching one trailer.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "Browser-based. No app, no account, no setup." },
              { title: "Select your streaming services", desc: "Only titles on your selected services appear. No matches you can't actually watch." },
              { title: "Share the code", desc: "Partner joins via 6-letter code or QR. Takes seconds." },
              { title: "Swipe 25 titles", desc: "Each person swipes independently. Right = yes, left = no. Quick gut reactions, not research." },
              { title: "Match revealed", desc: "Mutual likes shown instantly. Tap to open on Netflix, HBO, Disney+, or wherever it streams." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Average time from opening to pressing play: under 5 minutes. Most couples match in Round 1.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Quick Picks That Never Disappoint
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            In a rush? These are universally crowd-pleasing titles that get picked fast on Watch Together:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Bullet Train", year: 2022, type: "Movie", note: "Pure fun. Fast, funny, and exactly the kind of movie you can commit to in 2 seconds." },
              { title: "Reacher", year: 2022, type: "Series", note: "Action comfort food. Low-commitment first episode that hooks both of you." },
              { title: "The Banshees of Inisherin", year: 2022, type: "Movie", note: "Darkly funny and beautiful. Surprisingly gripping for a movie about a friendship breakup." },
              { title: "Squid Game", year: 2021, type: "Series", note: "If you haven't seen it yet, this is the night. If you have, season 2 is out." },
              { title: "Top Gun: Maverick", year: 2022, type: "Movie", note: "The definition of 'just pick something and go.' Crowd-pleasing in the best way." },
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

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Your problem isn&apos;t finding content — streaming services have more than you&apos;ll ever watch. Your problem is deciding. Watch Together solves that in minutes, not hours.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
