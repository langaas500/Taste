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
        heroSubtitle={`"You pick." So you do. She says no. You try again. She says maybe. You rewatch The Office.`}
        ctaText="Stop guessing. Start matching."
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
            &ldquo;What do you want to watch?&rdquo;
            <br />&ldquo;I don&apos;t know. You pick.&rdquo;
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            So you pick something. She pauses.
            <br />&ldquo;Hmm. Maybe something else.&rdquo;
            <br />You try again. Same reaction.
            <br />Eventually someone pulls out their phone and the other falls asleep to a rerun.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            It&apos;s not your taste. It&apos;s not hers.
            <br />It&apos;s the process. Suggesting face-to-face makes every pick feel like a test.
          </p>
          <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
            {[
              "\"You pick\" means \"pick something I'll like, but I won't tell you what that is\"",
              "Every suggestion feels like a risk",
              "You hold back your real picks because rejection stings",
              "She holds back hers for the same reason",
              "You rewatch something safe because it's easier than failing",
            ].map((item) => (
              <li key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            You Don&apos;t Suggest. You Don&apos;t Negotiate. You Match.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Both of you swipe on your own phones. You don&apos;t see her choices. She doesn&apos;t see yours. When your likes overlap — that&apos;s what you watch. No suggesting. No vetoing. No &ldquo;are you sure?&rdquo;
          </p>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 16 }}>
            {[
              { title: "Open logflix.app/together", desc: "No app. No account. Just open it." },
              { title: "Pick your services", desc: "Netflix, Disney+, HBO — whatever you have. You only see what's actually watchable." },
              { title: "Send the code", desc: "6 letters. QR or text. Joined in seconds." },
              { title: "Swipe privately", desc: "25 titles. Right = yes, left = no. Nobody sees the other's picks." },
              { title: "See what you both liked", desc: "Only the overlap. Pick one. Press play." },
            ].map((step, i) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>{step.title}.</strong> {step.desc}
              </li>
            ))}
          </ol>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            3 minutes. You&apos;ll match on 2–4 titles. Pick one. Done.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Date Night Picks That Work for Both of You
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "About Time", year: 2013, type: "Movie", note: "Romantic but not embarrassing. Works for both of you without either one compromising." },
              { title: "Normal People", year: 2020, type: "Series", note: "Short episodes. You'll say 'one more' three times. Easy to start, hard to stop." },
              { title: "Everything Everywhere All at Once", year: 2022, type: "Movie", note: "Action, comedy, love story — all at once. The rare film that crosses every taste." },
              { title: "Fleabag", year: 2016, type: "Series", note: "Funny, sharp, and 25 minutes per episode. Low risk, high reward. Season 2 is perfect." },
              { title: "La La Land", year: 2016, type: "Movie", note: "Safe pick that doesn't feel safe. Works even if neither of you likes musicals." },
              { title: "The Bear", year: 2022, type: "Series", note: "20-minute episodes, high energy. You'll both be hooked before the credits of episode one." },
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
          The best movie isn&apos;t the one you pick.
          <br />It&apos;s the one you both agree on.
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Stop suggesting. Stop guessing. Just match.
        </p>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
