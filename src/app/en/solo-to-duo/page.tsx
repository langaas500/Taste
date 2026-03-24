import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection, MidPageCta } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Start Alone, Watch Together — Invite Your Partner Anytime | Logflix",
  description:
    "Start swiping solo and invite your partner mid-session. Your swipes carry over automatically. No restart needed.",
  alternates: {
    canonical: "https://logflix.app/en/solo-to-duo",
    languages: {
      en: "https://logflix.app/en/solo-to-duo",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/solo-to-duo",
    },
  },
};

const faqItems = [
  {
    question: "Do I lose my swipes when I invite my partner?",
    answer: "No. Every swipe you made in solo mode is automatically replayed into the paired session. Your partner starts fresh, but your progress carries over completely. No restart, no repeated swiping.",
  },
  {
    question: "Can my partner join from a different location?",
    answer: "Yes. Your partner just needs the invite link or session code. They can be in another room, at work, or on the bus — as long as they have a phone or browser, they can join your session.",
  },
  {
    question: "What happens after my partner joins?",
    answer: "Your partner starts swiping through the same pool of titles. Logflix compares both of your choices and reveals mutual matches — movies or shows you both said yes to.",
  },
  {
    question: "Do we need to create accounts?",
    answer: "No. Watch Together works without any account or app download. Just open the link on your phone and start swiping. Creating an account lets you save matches to your library, but it's completely optional.",
  },
];

const howToSteps = [
  {
    name: "Start swiping solo",
    text: "Open Watch Together and choose Solo mode. Swipe right on titles you'd watch, left on ones you wouldn't. Take your time — there's no pressure to wait for your partner.",
  },
  {
    name: "Invite your partner",
    text: "After a few swipes, an invite button appears. Tap it to generate a session code and share it with your partner via text, link, or QR code.",
  },
  {
    name: "Get your match",
    text: "Your solo swipes transfer automatically into the paired session. Your partner swipes through the same titles. Logflix reveals the movies you both liked — your match for tonight.",
  },
];

export default function SoloToDuoPage() {
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
              { "@type": "ListItem", position: 3, name: "Solo to Duo", item: "https://logflix.app/en/solo-to-duo" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to use Solo-to-Duo in Watch Together",
            description: "Start swiping movies alone and seamlessly invite your partner to join mid-session.",
            step: howToSteps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          }),
        }}
      />
      <SeoGuideLayout
        locale="en"
        h1="Start Alone. Invite Your Partner Anytime."
        heroSubtitle="Don't wait — start swiping now and bring your partner in when they're ready."
        ctaText="Try Watch Together — free"
        trustLine="Free · No app needed · Swipes carry over"
        relatedLinks={[
          { href: "/en/watch-together", label: "Watch Together — how it works" },
          { href: "/en/movie-to-watch-with-your-girlfriend", label: "Movie to watch with your girlfriend" },
          { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why solo-to-duo?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Movie night doesn&apos;t always start at the same time for both of you. Maybe your partner is
            finishing dinner, putting the kids to bed, or still on the train home. With most movie-picking
            tools, you&apos;d have to wait. With Logflix, you don&apos;t.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Solo-to-duo lets you start swiping through movies and TV shows on your own. When your partner
            is ready, you send them an invite link. They join the same session — and your swipes are already
            there. No restart. No wasted effort. The session picks up right where you left off, now with
            two people.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            How it works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {howToSteps.map((step, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ color: "#E50914", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                  Step {i + 1}
                </div>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  {step.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6 }}>
                  {step.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        <MidPageCta
          title="Ready to start swiping?"
          subtitle="You can always invite your partner later — your swipes are saved."
          ctaText="Open Watch Together"
          ctaHref="/together"
        />

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            No other app does this
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Most movie-matching tools require both people to be ready before you can start. That means
            someone always has to wait. Logflix is the only platform where you can start alone and
            seamlessly transition to a paired session without losing any progress.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            This works because Logflix stores your swipes locally and replays them into the paired session
            the moment your partner joins. From their perspective, it&apos;s a normal Watch Together session.
            From yours, you got a head start.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            When to use solo-to-duo
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Partner is busy", desc: "Start now, invite later" },
              { label: "Different rooms", desc: "Browse from the couch" },
              { label: "Commuting home", desc: "Swipe on the train" },
              { label: "Can't decide yet", desc: "Explore solo first" },
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
