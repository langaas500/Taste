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
        heroSubtitle="You're not bad at choosing. There's just too much to choose from — and two of you trying to agree makes it worse."
        ctaText="Try Watch Together — free"
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
            Why You&apos;re Stuck (It&apos;s Not Your Fault)
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            You sit down ready to watch something. Thirty minutes later, you&apos;re still scrolling. The couch is comfortable, the snacks are ready, but the screen shows a grid of thumbnails you can&apos;t commit to.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            This is decision paralysis. Psychologists have studied it for decades. The more options you have, the harder it is to choose — and the less satisfied you are with whatever you pick.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "Netflix, Disney+, HBO Max, and more — each with thousands of titles",
              "Every suggestion feels risky when someone else has to watch it too",
              "\"I don't care, you pick\" is the most common phrase on movie night",
              "You scroll past good options because you're looking for the perfect one",
              "By the time you choose, the mood is gone",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The Fix: Let Both of You Swipe Independently
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Watch Together removes the negotiation entirely. Both of you swipe through the same deck of movies and shows on your own phones. You never see what the other person picks. When your likes overlap, that&apos;s your match — and the decision is made.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No download, no account. Works on any phone or laptop." },
              { title: "Select streaming services", desc: "Pick the ones you have. Only titles available on those services appear — no false promises." },
              { title: "Share the session code", desc: "Your partner joins with a 6-letter code or QR scan. Takes seconds." },
              { title: "Swipe through 25 titles", desc: "Right = interested, left = pass. Independent, private, no pressure." },
              { title: "See what you both liked", desc: "Only mutual likes are revealed. Tap to open on Netflix, HBO, Disney+, or wherever it streams." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Done in 2–5 minutes. No scrolling, no arguing, no settling.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Titles That Solve the Deadlock
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            These are crowd-pleasers that work across different tastes. If you&apos;re reading this, you&apos;ll probably match on at least two of these:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Nobody", year: 2021, type: "Movie", note: "Tightly paced action-comedy. Short, satisfying, and hard to say no to." },
              { title: "Shrinking", year: 2023, type: "Series", note: "Funny and heartfelt. Low-commitment first episode hooks both of you." },
              { title: "Knives Out", year: 2019, type: "Movie", note: "Whodunit with charm. Works whether you want mystery, comedy, or drama." },
              { title: "The White Lotus", year: 2021, type: "Series", note: "Sharp social satire that's impossible to stop once you start." },
              { title: "Parasite", year: 2019, type: "Movie", note: "Genre-bending thriller. If you haven't seen it, tonight's the night." },
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
          You don&apos;t need better content — you need a better way to agree. Watch Together makes the decision for you, based on what you both honestly want to see.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
