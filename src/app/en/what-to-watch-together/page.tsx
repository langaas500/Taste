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
        heroSubtitle="You both swipe. Only mutual likes match. Done in 3 minutes."
        ctaText="Stop scrolling. Start matching."
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
            You Know How This Goes
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You sit down to watch something together.
            <br />Twenty minutes later, you&apos;re still scrolling.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            One of you suggests something. The other says &ldquo;maybe.&rdquo;
            <br />You try another. &ldquo;I&apos;ve heard it&apos;s slow.&rdquo;
            <br />Back to scrolling. Now nobody wants to pick.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You end up rewatching something you&apos;ve both seen before. Again.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "One person suggests, the other vetoes — repeat until frustrated",
              "You scroll past 50 things and somehow want to watch none of them",
              "\"I don't mind\" means nobody decides",
              "You pick whatever's trending instead of what you'd actually enjoy",
              "The longer it takes, the less you want to watch anything at all",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            You Don&apos;t Browse Together. You Decide Separately.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Each of you swipes through movies and shows on your own phone. You never see what the other person picks. When your likes overlap — that&apos;s your match. No negotiation. No compromise.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app. No account. Just open it." },
              { title: "Pick your streaming services", desc: "Netflix, Disney+, HBO Max — whatever you have. You only see what you can actually watch." },
              { title: "Send the code", desc: "Your partner gets a 6-letter code. They join in seconds from any phone." },
              { title: "Swipe on your own", desc: "25 titles. Right = yes, left = no. Nobody sees what you pick." },
              { title: "See what you both liked", desc: "Only mutual likes appear. Tap to start watching." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Done in 3 minutes. You only see what you both want — nothing else.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Easy to Agree On
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Severance", year: 2022, type: "Series", note: "Works when you both want something weird and addictive. You'll pause to discuss theories." },
              { title: "The Menu", year: 2022, type: "Movie", note: "Safe pick for a slightly adventurous mood. Dark, funny, short. Nobody regrets this one." },
              { title: "Slow Horses", year: 2022, type: "Series", note: "Good when one of you wants action and the other wants something smart. This is both." },
              { title: "Glass Onion", year: 2022, type: "Movie", note: "The easiest yes on this list. Works for literally any mood. Popcorn territory." },
              { title: "Beef", year: 2023, type: "Series", note: "Hooks you both in 10 minutes. Good when you want something different without risking a bad pick." },
              { title: "The Holdovers", year: 2023, type: "Movie", note: "For a quieter night. Not boring — just warm. The kind of film you talk about after." },
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
            These are starting points. Watch Together pulls from your actual streaming services.
          </p>
        </section>

        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 8 }}>
          You don&apos;t need better recommendations.
          <br />You need a way to agree.
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          You each swipe honestly. The overlap speaks for itself.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
