import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection, MidPageCta } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Group Movie Picker — Find a Movie Everyone Agrees On | Logflix",
  description:
    "Swipe movies with friends and find a film everyone wants to watch. Free, no app needed. Works for 3+ people.",
  alternates: {
    canonical: "https://logflix.app/en/group-movie-picker",
    languages: {
      en: "https://logflix.app/en/group-movie-picker",
      "x-default": "https://logflix.app/en/group-movie-picker",
    },
  },
};

const faqItems = [
  {
    question: "How does the group movie picker work?",
    answer: "One person creates a session and shares the code with the group. Everyone swipes through the same pool of movies independently — no one sees each other's choices. Logflix finds the titles that got the most votes and reveals the group's top pick.",
  },
  {
    question: "How many people can join a group session?",
    answer: "Group mode supports 3 or more people. There's no strict upper limit — the more people, the harder it is to find a unanimous match, but Logflix's voting algorithm always finds the best compromise.",
  },
  {
    question: "Is the group movie picker free?",
    answer: "Yes. Group mode will be completely free, just like Watch Together for couples. No accounts, no app download, no hidden costs. Open the link and start swiping.",
  },
  {
    question: "When is group mode launching?",
    answer: "Group mode is coming soon. In the meantime, you can use Watch Together to match movies with one other person — it works the same way and is available right now.",
  },
];

export default function GroupMoviePickerPage() {
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
              { "@type": "ListItem", position: 3, name: "Group Movie Picker", item: "https://logflix.app/en/group-movie-picker" },
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
            datePublished: "2026-03-24",
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
      <SeoGuideLayout
        locale="en"
        h1="Group Movie Picker — No More Arguments"
        heroSubtitle="Find a movie everyone actually wants to watch. Swipe, vote, match."
        ctaText="Try Watch Together — free"
        trustLine="Free · No app needed · Works for 2+ people now"
        relatedLinks={[
          { href: "/en/watch-together", label: "Watch Together — how it works" },
          { href: "/en/movies-to-watch-with-friends", label: "Movies to watch with friends" },
          { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <div style={{
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            textAlign: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", letterSpacing: "0.04em" }}>
              COMING SOON
            </span>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
              Group mode is under development. Try Watch Together for 2 in the meantime.
            </p>
          </div>

          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            The problem with picking a movie in a group
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            You know the drill. Four friends, one TV, and thirty minutes of scrolling through Netflix
            while someone vetoes every suggestion. &quot;I&apos;ve seen that.&quot; &quot;Too long.&quot; &quot;Not in the mood.&quot;
            By the time you agree, half the group has lost interest.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            The issue isn&apos;t a lack of good movies — it&apos;s that everyone has different taste and nobody
            wants to be the one to pick the &quot;wrong&quot; movie. A group movie picker removes the politics.
            Everyone votes privately, and the algorithm finds the title with the highest overlap.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            How Logflix Group Watch will work
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "1", title: "Create a group session", desc: "One person starts the session and shares a code or link with the group." },
              { step: "2", title: "Everyone swipes independently", desc: "Each person swipes through movies on their own phone. No one sees anyone else's choices — no peer pressure." },
              { step: "3", title: "Multiple voting rounds", desc: "After the first round, Logflix narrows down to titles that got the most votes. A quick second round picks the winner." },
              { step: "4", title: "The group's match is revealed", desc: "Logflix shows the movie everyone agreed on — with streaming info so you can start watching immediately." },
            ].map((item) => (
              <div key={item.step} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ color: "#E50914", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                  Step {item.step}
                </div>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <MidPageCta
          title="Can't wait for group mode?"
          subtitle="Watch Together for 2 people works right now — same concept, same speed."
          ctaText="Try Watch Together now"
          ctaHref="/together"
        />

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why swipe-based voting beats discussion
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            When you ask a group &quot;what do you want to watch?&quot; you get silence, followed by one person
            suggesting something that gets shot down. The problem is that people are better at rejecting
            options than proposing them.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Swipe-based voting flips this. Instead of proposing titles, everyone reacts to the same curated
            pool. There&apos;s no social pressure — you swipe privately, and the algorithm handles the rest.
            Most groups find a match in under 3 minutes, compared to the 20-30 minute scroll-and-debate
            cycle.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Logflix filters by streaming service, so every suggestion is actually watchable. No more
            landing on a movie that&apos;s only available for rent or in a country you&apos;re not in.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Perfect for
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Friend groups", desc: "3-6 friends, one TV" },
              { label: "Family movie night", desc: "Parents + teens, no fights" },
              { label: "Flatmates", desc: "Shared living room, shared taste" },
              { label: "Watch parties", desc: "Virtual or in-person" },
            ].map((item) => (
              <div key={item.label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <FaqSection
          title="Frequently Asked Questions"
          items={faqItems}
        />
      </SeoGuideLayout>
    </>
  );
}
