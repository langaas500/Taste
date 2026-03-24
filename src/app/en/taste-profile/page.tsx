import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Taste Profile — Discover Your Movie Personality | Logflix",
  description:
    "Your Taste Profile shows your favorite genres, directors, and how your taste compares to your partner's. Powered by your watch history.",
  alternates: {
    canonical: `${BASE}/en/taste-profile`,
    languages: {
      en: `${BASE}/en/taste-profile`,
      "x-default": `${BASE}/en/taste-profile`,
    },
  },
  openGraph: {
    title: "Taste Profile — Discover Your Movie Personality | Logflix",
    description:
      "Your Taste Profile shows your favorite genres, directors, and how your taste compares to your partner's.",
    url: `${BASE}/en/taste-profile`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "How is my Taste Profile generated?",
    answer:
      "Your Taste Profile is built automatically from your watch history — every movie and series you log, rate, or swipe on in Watch Together. The more you log, the more accurate it becomes. Logflix uses AI to analyze patterns in your viewing habits, identifying your preferred genres, pacing, tone, and even recurring directors or actors.",
  },
  {
    question: "Can I see how my taste compares to my partner's?",
    answer:
      "Yes. If both you and your partner have Logflix accounts, the Taste Profile includes a Taste Compatibility Score. It shows where your preferences overlap — shared favorite genres, mutual blind spots, and areas where you diverge. This is especially useful for planning movie nights together.",
  },
  {
    question: "Is Taste Profile free?",
    answer:
      "You get a blurred preview of your Taste Profile for free. The full profile — including genre breakdown, compatibility score, and detailed AI analysis — is available with Logflix Premium at 29 NOK/month. Your partner gets premium access for free.",
  },
  {
    question: "How often does my Taste Profile update?",
    answer:
      "Your profile updates every time you log a new title, rate something, or complete a Watch Together session. The AI re-analyzes your patterns periodically to keep the insights fresh and accurate.",
  },
];

export default function TasteProfilePage() {
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
              { "@type": "ListItem", position: 3, name: "Taste Profile", item: "https://logflix.app/en/taste-profile" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Logflix Taste Profile",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/en/taste-profile`,
            featureList: [
              "AI taste analysis",
              "Genre breakdown",
              "Couple compatibility score",
              "Director and actor preferences",
            ],
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "NOK",
              description: "Logflix Premium",
            },
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
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      <SeoGuideLayout
        locale="en"
        h1="Your Movie Taste Profile"
        heroSubtitle="Discover your movie personality. See your favorite genres, preferred tone, and how your taste compares to your partner's."
        ctaText="Get Logflix Premium"
        trustLine="AI-powered · Updated automatically · Partner comparison included"
        relatedLinks={[
          { href: "/together", label: "Start Watch Together — free" },
          { href: "/en/watch-together", label: "How Watch Together works" },
          { href: "/en/couple-streak", label: "Couple Streak — keep matching" },
          { href: "/en/wrapped", label: "Logflix Wrapped — your movie year" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            What is a Taste Profile?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Your Taste Profile is an AI-generated breakdown of your movie and series preferences.
            It goes beyond a simple list of favorites — it maps out the genres you gravitate
            toward, the tone and pacing you prefer, and the directors and actors that keep showing
            up in your watch history.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Think of it as a personality test, but for movies. Instead of answering questions, you
            just watch what you normally watch. Logflix does the analysis in the background, using
            every title you log, every swipe in Watch Together, and every rating you give.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            The result is three sections: &ldquo;You like&rdquo; (genres and themes you
            consistently enjoy), &ldquo;You avoid&rdquo; (patterns you tend to skip), and
            &ldquo;Tempo &amp; Tone&rdquo; (whether you lean toward fast-paced action or
            slow-burn character studies).
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Couple compatibility
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            If your partner also uses Logflix, the Taste Profile includes a compatibility
            breakdown. You&rsquo;ll see where your tastes overlap — shared love for thrillers,
            mutual disinterest in rom-coms, or the one genre where you completely disagree.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            This is not just a fun stat. The compatibility data feeds directly into Watch Together
            and the AI Curator, making recommendations smarter for both of you. The more you
            watch and log, the better Logflix understands what works for your specific couple
            dynamic.
          </p>
        </section>

        <div
          style={{
            textAlign: "center",
            padding: "24px 20px",
            marginBottom: 40,
            background: "rgba(255,42,42,0.04)",
            border: "1px solid rgba(255,42,42,0.15)",
            borderRadius: 14,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Discover your movie personality
          </p>
          <a
            href="/premium"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#ff2a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Get Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 NOK/month · Your partner gets it free
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            How it&rsquo;s built
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Your profile starts building the moment you log your first title. Import your Netflix
            history or Trakt.tv library to jumpstart it with hundreds of data points. Every Watch
            Together swipe, every rating, and every watchlist addition contributes to a more
            accurate picture.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Logflix uses Claude AI to identify patterns that go beyond simple genre counting. It
            looks at themes, director filmographies, release eras, and even how quickly you
            decided on a title in Watch Together. A movie you super-liked in 2 seconds says
            something different from one you hesitated on for 15.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
