import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "What to Watch With Your Girlfriend (Without the Argument) | Logflix",
  description:
    "She says 'you pick' but rejects everything. Sound familiar? Swipe movies independently and match on what you both actually want — in 3 minutes. Free, no app.",
  alternates: {
    canonical: "https://logflix.app/en/what-to-watch-with-girlfriend",
    languages: {
      en: "https://logflix.app/en/what-to-watch-with-girlfriend",
      "x-default": "https://logflix.app/en/what-to-watch-with-girlfriend",
    },
  },
};

const faqItems = [
  {
    question: "What if we have completely different taste?",
    answer: "That's exactly where Watch Together shines. You'd be surprised how much hidden overlap you have. Since both of you swipe privately, there's no social pressure to pretend — and the matches are genuinely things you both want to see.",
  },
  {
    question: "Does it work for date night?",
    answer: "It's built for it. Select a mood filter like 'romance' or 'light & fun', pick your streaming services, and let Watch Together find something you'll both enjoy. Takes 3 minutes instead of 30.",
  },
  {
    question: "Can I filter by what's on Netflix or Disney+?",
    answer: "Yes. Before swiping, select the streaming services you both have. Only titles available on those services appear — so every match is watchable tonight.",
  },
];

export default function WatchWithGirlfriendPage() {
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
        h1="What to Watch With Your Girlfriend"
        heroSubtitle="She says 'whatever you want.' But it's never whatever you want. Find something you both actually agree on."
        ctaText="Try Watch Together — free"
        trustLine="Free · No app · Done in 3 minutes"
        relatedLinks={[
          { href: "/en/what-to-watch-together", label: "What to watch together tonight" },
          { href: "/en/cant-decide-what-to-watch", label: "Can't decide what to watch?" },
          { href: "/en/find-something-to-watch-fast", label: "Find something to watch — fast" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Last updated: April 2026
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The Couple Movie Night Loop
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You know the script. She asks what you want to watch. You suggest something. She pauses. &quot;Hmm, maybe something else.&quot; You suggest another. Same reaction. Eventually one of you pulls out their phone and the other falls asleep to The Office. Again.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            The problem isn&apos;t your taste or hers. It&apos;s the process. Suggesting movies face-to-face puts social pressure on every pick. Neither of you wants to shoot down the other&apos;s idea, so you both play it safe — and end up watching nothing new.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "\"You pick\" actually means \"pick something I'll also like, but I won't tell you what\"",
              "Suggesting a movie feels like a test you might fail",
              "You avoid your favorites because you're not sure she'll like them",
              "She avoids hers for the same reason",
              "You default to rewatching because it's the only safe choice",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Remove the Pressure: Swipe Independently
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Watch Together changes the dynamic. Instead of negotiating, both of you swipe through movies and shows on your own phones. You don&apos;t see her choices, she doesn&apos;t see yours. When your likes overlap — that&apos;s your match. No judgment, no rejection, no debate.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app needed. Works in any browser on any device." },
              { title: "Pick your streaming services", desc: "Select Netflix, Disney+, HBO Max — whatever you both have. Only titles on those services show up." },
              { title: "Share the session code", desc: "She scans the QR code or types the 6-letter code. Joined in seconds." },
              { title: "Both swipe privately", desc: "25 titles each. Swipe right = interested, left = nah. Nobody sees the other's picks." },
              { title: "See your matches", desc: "Only titles you BOTH liked are revealed. Pick one and press play." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Takes 2–5 minutes total. Usually you&apos;ll match on 2–4 titles. Pick one and the decision is made — without a single &quot;I don&apos;t know, what do you think?&quot;
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Date Night Picks That Work for Both of You
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "About Time", year: 2013, type: "Movie", note: "Romantic without being cheesy. He'll like the time-travel angle, she'll love the emotional core." },
              { title: "Normal People", year: 2020, type: "Series", note: "Intimate and beautifully made. Short episodes mean you can 'just watch one more.'" },
              { title: "Everything Everywhere All at Once", year: 2022, type: "Movie", note: "Action, comedy, and a love story. Crosses every taste boundary." },
              { title: "Fleabag", year: 2016, type: "Series", note: "Sharp, funny, and deeply human. Season 2 is one of the best things on TV." },
              { title: "La La Land", year: 2016, type: "Movie", note: "Musical for people who don't like musicals. Gorgeous and bittersweet." },
              { title: "The Bear", year: 2022, type: "Series", note: "High-energy, short episodes. You'll both be hooked by the end of episode one." },
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
          The best date night movie is one you both genuinely want to watch — not one person&apos;s compromise. Let Watch Together find the overlap and skip the awkward negotiation.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
