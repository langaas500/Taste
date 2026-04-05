import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Can't Decide What to Watch? Here's the Fix | Logflix",
  description:
    "Decision paralysis is real. Stop scrolling for 40 minutes and use Watch Together — both swipe, only mutual likes match. Done in 3 minutes. Free, no app.",
  alternates: {
    canonical: "https://logflix.app/en/cant-decide-what-to-watch",
    languages: {
      en: "https://logflix.app/en/cant-decide-what-to-watch",
      "x-default": "https://logflix.app/en/cant-decide-what-to-watch",
    },
  },
};

const faqItems = [
  {
    question: "Why is it so hard to decide what to watch?",
    answer: "It's called the paradox of choice. Netflix alone has over 17,000 titles. When you have too many options and no way to compare them, your brain freezes. Add a second person and you're also navigating social dynamics — nobody wants to suggest something the other hates.",
  },
  {
    question: "How is Watch Together different from just picking a genre?",
    answer: "Picking a genre still leaves hundreds of titles to sift through. Watch Together shows you a curated deck filtered to your streaming services, and both of you swipe independently. You only see the overlap — no scrolling, no debating.",
  },
  {
    question: "Do I need to download an app?",
    answer: "No. Watch Together runs in your browser. Open logflix.app/together on your phone, share the code, and start swiping. Nothing to install.",
  },
];

export default function CantDecidePage() {
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
        h1="Can't Decide What to Watch?"
        heroSubtitle="Snacks ready. Couch ready. 30 minutes later — still scrolling."
        ctaText="Find something in 3 minutes"
        trustLine="Free · 3 minutes · No app · No login"
        relatedLinks={[
          { href: "/en/what-to-watch-together", label: "What to watch together tonight" },
          { href: "/en/find-something-to-watch-fast", label: "Find something to watch — fast" },
          { href: "/en/what-to-watch-with-girlfriend", label: "What to watch with your girlfriend" },
        ]}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          Last updated: April 2026
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            This Is What Actually Happens
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You open Netflix. Scroll for a bit.
            <br />&ldquo;What about this one?&rdquo;
            <br />&ldquo;Hmm. Maybe.&rdquo;
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You try HBO. Then Disney+. Then back to Netflix.
            <br />Twenty minutes gone. Nobody has picked anything.
            <br />One of you says &ldquo;I don&apos;t care, you pick.&rdquo;
            <br />Now the other person doesn&apos;t want to pick either.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "You suggest something — they're not sure. Now you feel rejected.",
              "They suggest something — you say maybe. Now they stop trying.",
              "You scroll past 40 titles and somehow none of them feel right",
              "You pick whatever's on the front page just to stop the arguing",
              "By the time you press play, neither of you is excited anymore",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            You Don&apos;t Decide Together. You Decide Separately.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Each of you swipes on your own phone. You never see what the other picks. When your likes overlap — that&apos;s your match. No negotiation. No compromise. No &ldquo;are you sure?&rdquo;
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app. No account. Just open it." },
              { title: "Pick your streaming services", desc: "You only see titles you can actually watch tonight." },
              { title: "Send the code", desc: "6 letters. Your partner joins from any phone in seconds." },
              { title: "Swipe 25 titles", desc: "Right = yes, left = no. Private. Nobody sees your choices." },
              { title: "See the overlap", desc: "Only what you BOTH liked. Tap to watch." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            3 minutes. You only see what you both want.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Low-Risk Picks You&apos;ll Both Say Yes To
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            When you can&apos;t agree, start here. These work across different tastes:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Nobody", year: 2021, type: "Movie", note: "90 minutes, no slow start. The kind of film nobody says no to." },
              { title: "Shrinking", year: 2023, type: "Series", note: "Low commitment — one episode and you're both in. Funny without trying too hard." },
              { title: "Knives Out", year: 2019, type: "Movie", note: "Works for any mood. Mystery, comedy, drama — it's all three at once." },
              { title: "The White Lotus", year: 2021, type: "Series", note: "Easy to start, impossible to stop. Good when you want something sharp but not heavy." },
              { title: "Parasite", year: 2019, type: "Movie", note: "If one of you hasn't seen it — tonight. If you both have — you'll still watch it again." },
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
          The problem isn&apos;t what&apos;s on.
          <br />It&apos;s that two people can&apos;t agree.
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Stop browsing together. Start deciding separately.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
