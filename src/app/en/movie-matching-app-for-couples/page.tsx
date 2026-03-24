import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movie Matching App for Couples — No Download Required | Logflix",
  description:
    "Skip the app store. Watch Together runs in your browser — open the link, swipe, match with your partner in minutes. No installation needed.",
  alternates: {
    canonical: "https://logflix.app/en/movie-matching-app-for-couples",
    languages: {
      en: "https://logflix.app/en/movie-matching-app-for-couples",
      nb: "https://logflix.app/no/",
      sv: "https://logflix.app/se/",
      da: "https://logflix.app/dk/",
      fi: "https://logflix.app/fi/",
      "x-default": "https://logflix.app/en/movie-matching-app-for-couples",
    },
  },
};

const faqItems = [
  {
    question: "Why doesn't Watch Together require an app download?",
    answer:
      "It's built as a Progressive Web App — your browser handles everything. No installation, no app store approval wait, no storage space used. You open the link and it works immediately on any modern phone or laptop.",
  },
  {
    question: "Does it work on iPhone and Android?",
    answer:
      "Yes, both. Safari on iPhone and Chrome on Android handle it equally well. Your partner can be on a completely different device and operating system — the session syncs through the server, not through a paired Bluetooth or local connection.",
  },
  {
    question: "Do we both need accounts?",
    answer:
      "No account required for either person. The session creator gets a link; the partner clicks it. That's the entire setup.",
  },
  {
    question: "How is this different from just searching Netflix together?",
    answer:
      "Netflix shows you a grid with no mechanism for two people to rate independently. You end up browsing reactively — clicking into things that look interesting and backing out. Watch Together gives you a structured, fast process with a concrete outcome: a list of films you actually both want to watch.",
  },
  {
    question: "Are there other apps like this?",
    answer:
      "A few, but most require both people to download an app and create accounts before you can start. Watch Together skips that entirely — which means you can use it on impulse, on any device, right now.",
  },
];

export default function MovieMatchingAppPage() {
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" }, { "@type": "ListItem", position: 2, name: "Watch Together", item: "https://logflix.app/en/watch-together" }, { "@type": "ListItem", position: 3, name: "Movie Matching App for Couples", item: "https://logflix.app/en/movie-matching-app-for-couples" }] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2025-01-01",
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
        h1="Movie Matching App for Couples"
        heroSubtitle="No download. No account. Open the link and start matching on movies right now."
        ctaText="Try it now — no download needed"
        trustLine="Free · No app · Under 3 minutes"
        relatedLinks={[
          { href: "/together", label: "Watch Together" },
          { href: "/en/couple-movie-picker", label: "Couple movie picker" },
          { href: "/en/swipe-movies-together", label: "Swipe movies together" },
          { href: "/en/tinder-for-movies", label: "Tinder for movies" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            The problem with app-store movie pickers
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Most &quot;movie picker apps&quot; have the same onboarding friction: download, create an account,
            verify email, add your partner, wait for them to do the same. By the time you&apos;re both set up,
            you&apos;ve spent more time than you would have just scrolling Netflix. And if you&apos;re visiting
            someone — or your partner is on a different platform — half those apps don&apos;t even work cross-device.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Watch Together skips all of that. It runs in the browser. Open logflix.app/together on your phone,
            share the session link, and your partner clicks it on theirs. You&apos;re both in the session in under
            30 seconds.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            What you get vs. a typical app
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Setup time", ours: "< 30 seconds", theirs: "5–10 minutes" },
              { label: "Download required", ours: "No", theirs: "Usually yes" },
              { label: "Account required", ours: "No", theirs: "Usually yes" },
              { label: "Cross-platform", ours: "Any device", theirs: "Often limited" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>
                  {row.label}
                </div>
                <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  Logflix: {row.ours}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  Others: {row.theirs}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
            Works wherever you are
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Because it&apos;s browser-based, Watch Together works whether you&apos;re sitting next to each other
            on the couch, in different rooms, or even in different cities planning a watch party. The session
            link works anywhere. No Wi-Fi pairing, no Bluetooth, no proximity requirement.
          </p>
        </section>

        <FaqSection title="Frequently Asked Questions" items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
