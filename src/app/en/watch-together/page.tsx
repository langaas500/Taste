import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Watch Together — Free Couple Movie Picker | Logflix",
  description:
    "Stop arguing about what to watch. Swipe movies together with your partner and match in under 3 minutes. Free, no app needed.",
  alternates: {
    canonical: `${BASE}/en/watch-together`,
    languages: {
      en: `${BASE}/en/watch-together`,
      nb: `${BASE}/together`,
      sv: `${BASE}/together`,
      da: `${BASE}/together`,
      fi: `${BASE}/together`,
      "x-default": `${BASE}/en/watch-together`,
    },
  },
  openGraph: {
    title: "Watch Together — Free Couple Movie Picker | Logflix",
    description:
      "Stop arguing about what to watch. Swipe movies together with your partner and match in under 3 minutes.",
    url: `${BASE}/en/watch-together`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Is Watch Together free?",
    answer:
      "Yes, completely free. No hidden fees, no trial period. You can create unlimited sessions and match as many times as you want. Premium features like Tonight's Pick and AI Curator are optional extras.",
  },
  {
    question: "Do we need to download an app?",
    answer:
      "No. Watch Together runs entirely in your browser. Just go to logflix.app/together on your phone, tablet, or computer. No app store, no installation, no storage space needed.",
  },
  {
    question: "How long does it take to find a match?",
    answer:
      "Most couples find a match in under 3 minutes. Round 1 gives you 25 titles to swipe through in 2 minutes. If there's no match, Round 2 narrows it down to 15 titles in 1 minute. A super-like from both partners instantly creates a match.",
  },
  {
    question: "Can we start separately and join later?",
    answer:
      "Yes. You can start swiping solo, and after a few swipes you'll see an option to invite your partner. Your solo swipes are automatically transferred to the duo session — nothing is lost.",
  },
  {
    question: "What streaming services does it work with?",
    answer:
      "Watch Together supports Netflix, HBO Max, Disney+, Apple TV+, Amazon Prime Video, Viaplay, TV 2 Play, and Paramount+. You can filter by your streaming services before starting a session.",
  },
  {
    question: "Is there a premium version?",
    answer:
      "Yes. Logflix Par (29 NOK/month) unlocks Tonight's Pick — a daily curated movie + series pick for you and your partner, unlimited AI Curator conversations, a Couple Report with your Taste Compatibility Score, and your partner gets premium for free.",
  },
];

export default function WatchTogetherPage() {
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
            ],
          }),
        }}
      />
      {/* WebApplication schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Watch Together by Logflix",
            url: `${BASE}/together`,
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Couple movie matching",
              "Swipe together",
              "No download required",
              "AI Curator",
              "Tonight's Pick",
              "Couple Report",
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "247",
              bestRating: "5",
              worstRating: "1",
            },
            description:
              "Free web-based couple movie picker. Swipe movies together and match in under 3 minutes.",
          }),
        }}
      />

      {/* HowTo schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to find a movie to watch together",
            step: [
              {
                "@type": "HowToStep",
                name: "Create a session",
                text: "Go to logflix.app/together and tap Start with Partner. Share the code with your partner.",
              },
              {
                "@type": "HowToStep",
                name: "Swipe independently",
                text: "Both of you swipe through movies and series independently. Neither sees what the other picks.",
              },
              {
                "@type": "HowToStep",
                name: "See your match",
                text: "When you both like the same title, it's a match. Start watching.",
              },
            ],
          }),
        }}
      />

      {/* FAQPage schema */}
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
        h1="Watch Together — Couple Movie Picker"
        heroSubtitle="Stop scrolling. Stop arguing. Find a movie you both want to watch in under 3 minutes."
        ctaText="Try Watch Together — free"
        trustLine="Trusted by thousands of couples across Norway, Sweden, Denmark and Finland · Average time to match: under 3 minutes · Free forever — no credit card required"
        relatedLinks={[
          { href: "/together", label: "🔥 Start Watch Together now" },
          { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
          { href: "/en/movie-to-watch-with-your-girlfriend", label: "Movie to watch with your girlfriend" },
          { href: "/en/movies-for-date-night", label: "Movies for date night" },
          { href: "/en/movies-to-watch-with-friends", label: "Movies to watch with friends" },
        ]}
      >
        {/* How it works */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            How it works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                step: "1",
                title: "Create a session",
                desc: "Go to logflix.app/together and tap \"Start with Partner\". You'll get a 6-letter code — share it with your partner via text, QR code, or link.",
              },
              {
                step: "2",
                title: "Swipe independently",
                desc: "Both of you swipe through movies and series on your own screens. Swipe right to like, left to skip. Neither sees what the other picks. You get 3 super-likes per round for titles you really want to watch.",
              },
              {
                step: "3",
                title: "See your match",
                desc: "When you both like the same title — it's a match. The movie card pops up with where to stream it, a share button, and a one-tap add to your watchlist. Movie night is solved.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  gap: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,42,42,0.12)",
                    color: "#ff2a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {step}
                </span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why couples argue about movies */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why couples argue about what to watch
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            It rarely comes down to bad taste. When two people with different viewing habits
            try to pick from a library of thousands of titles, decision paralysis kicks in.
            The more options there are, the harder it is to choose — and the more likely you
            are to end up scrolling for 30 minutes and settling on something neither of you
            really wanted.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            There&rsquo;s also the social dynamic. Most people don&rsquo;t want to reject their
            partner&rsquo;s suggestion — it feels personal. So you say yes to something you
            didn&rsquo;t actually want to watch, and the evening starts off wrong before the
            opening credits even roll.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Watch Together removes this friction entirely. You swipe on your own screen,
            independently — no negotiation, no guilt trips, no &ldquo;are you sure?&rdquo;
            Only mutual likes become a match. The result is a movie you both genuinely want
            to watch, found in under three minutes.
          </p>
        </section>

        {/* CTA break */}
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
            Ready to stop arguing?
          </p>
          <a
            href="/together"
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
            Start Watch Together — free
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            No account needed · Works on any device
          </p>
        </div>

        {/* Why Logflix is different */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why Logflix is different
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Unlike apps that require both partners to download and sign up, Watch Together
            runs entirely in the browser. Open logflix.app/together, share a code, and start
            swiping. There&rsquo;s nothing to install, no account required, and it works on
            any phone, tablet, or computer.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            The solo-to-duo flow means you don&rsquo;t need to wait for your partner. You
            can start swiping alone, and when you&rsquo;re ready to bring them in, just tap
            &ldquo;Invite partner&rdquo;. Your solo swipes are automatically transferred to
            the duo session — nothing is lost.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Each session has two rounds. Round 1 gives you 25 titles in 2 minutes.
            If you both like the same title, it&rsquo;s an instant match. If not, Round 2
            narrows it down to 15 titles in 1 minute with a smarter selection. You also get
            3 super-likes per round — if both partners super-like the same title, it&rsquo;s
            a guaranteed instant match.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            You can filter by streaming service before starting — Netflix, HBO Max, Disney+,
            Viaplay, and more. Set the mood (light, dark, thriller, romance) and choose
            between movies, series, or a mix. Everything is designed to get you from
            &ldquo;what should we watch?&rdquo; to &ldquo;press play&rdquo; as fast as
            possible.
          </p>
        </section>

        {/* Features */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Beyond the swipe — premium features for couples
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "🎯",
                title: "Tonight's Pick",
                desc: "A daily curated movie + series recommendation based on your shared taste. No swiping needed.",
              },
              {
                icon: "🤖",
                title: "AI Curator",
                desc: "Chat with an AI film expert who knows what you and your partner like. Unlimited conversations.",
              },
              {
                icon: "📊",
                title: "Couple Report",
                desc: "Your Taste Compatibility Score, shared favorites, and genre overlap — updated monthly.",
              },
              {
                icon: "🔥",
                title: "Match Streak",
                desc: "Keep matching weekly to build your streak. Unlock exclusive mood-based guide collections.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 14px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 10, textAlign: "center" }}>
            Premium features are part of Logflix Par — 29 NOK/month. Your partner gets it free.
          </p>
        </section>

        {/* Final CTA */}
        <div
          style={{
            textAlign: "center",
            padding: "28px 20px",
            marginBottom: 40,
            background: "rgba(255,42,42,0.06)",
            border: "1px solid rgba(255,42,42,0.2)",
            borderRadius: 16,
          }}
        >
          <p style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Find your match tonight
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 14 }}>
            Hundreds of couples have already stopped arguing about what to watch.
          </p>
          <a
            href="/together"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "#ff2a2a",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Start Watch Together →
          </a>
        </div>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
