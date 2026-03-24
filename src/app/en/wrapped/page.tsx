import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Logflix Wrapped — Your Year in Movies as a Couple | Logflix",
  description:
    "See everything you watched together this year. Top genres, most-matched movies, compatibility score and more. Share your couple Wrapped.",
  alternates: {
    canonical: `${BASE}/en/wrapped`,
    languages: {
      en: `${BASE}/en/wrapped`,
      "x-default": `${BASE}/en/wrapped`,
    },
  },
  openGraph: {
    title: "Logflix Wrapped — Your Year in Movies as a Couple | Logflix",
    description:
      "See everything you watched together this year. Top genres, most-matched movies, compatibility score and more.",
    url: `${BASE}/en/wrapped`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "When is Logflix Wrapped available?",
    answer:
      "Logflix generates a monthly Wrapped report at the end of each month, and a full yearly Wrapped in December. Monthly reports are available as soon as the month ends. The yearly Wrapped covers January through December and includes your couple's full viewing journey.",
  },
  {
    question: "Can I share my Wrapped?",
    answer:
      "Yes. Every Wrapped report can be shared as a shareable image — similar to Spotify Wrapped. You can post it on Instagram Stories, send it in a group chat, or save it to your camera roll. The image includes your top stats without exposing private viewing data.",
  },
  {
    question: "Do both partners need accounts for Couple Wrapped?",
    answer:
      "The couple-specific stats (compatibility score, shared favorites, genre overlap) require both partners to have Logflix accounts. Individual Wrapped works with a single account. Guest swipes in Watch Together are tracked but attributed to the session, not a profile.",
  },
  {
    question: "Is Wrapped free?",
    answer:
      "Monthly Wrapped is available to all users with a free account. The full yearly Wrapped with couple-specific insights, detailed AI analysis, and shareable story cards is a premium feature included with Logflix Premium at 29 NOK/month.",
  },
];

export default function WrappedPage() {
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
              { "@type": "ListItem", position: 3, name: "Wrapped", item: "https://logflix.app/en/wrapped" },
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
            name: "Logflix Wrapped",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/en/wrapped`,
            featureList: [
              "Monthly viewing reports",
              "Yearly couple Wrapped",
              "Shareable story cards",
              "Taste compatibility score",
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
        h1="Logflix Wrapped — Your Couple&rsquo;s Movie Year"
        heroSubtitle="Everything you watched together in one beautiful report. Top genres, most-matched movies, compatibility score, and shareable story cards."
        ctaText="Get Logflix Premium"
        trustLine="Monthly + yearly reports · Shareable as images · Couple stats included"
        relatedLinks={[
          { href: "/together", label: "Start Watch Together — free" },
          { href: "/en/watch-together", label: "How Watch Together works" },
          { href: "/en/taste-profile", label: "Your Taste Profile" },
          { href: "/en/couple-streak", label: "Couple Streak — keep matching" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            What is Logflix Wrapped?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Logflix Wrapped is your viewing year in review. It takes everything you and your
            partner watched — every movie logged, every series finished, every Watch Together
            match — and turns it into a visual report you can browse and share.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Think Spotify Wrapped, but for movies. You&rsquo;ll see your top genres, the movies
            you matched on most quickly, your most-watched directors, and a Taste Compatibility
            Score that shows how aligned your preferences really are.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Monthly Wrapped drops at the end of every month with a quick summary. The full yearly
            Wrapped arrives in December with deeper insights, AI-generated commentary, and
            shareable story cards designed for Instagram and group chats.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            What&rsquo;s inside your Wrapped
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "🎬",
                title: "Total titles",
                desc: "How many movies and series you watched this month or year. Broken down by type, sentiment, and genre.",
              },
              {
                icon: "🏆",
                title: "Top matches",
                desc: "The movies you and your partner both liked fastest in Watch Together. Your quickest mutual decisions.",
              },
              {
                icon: "💑",
                title: "Compatibility",
                desc: "Your Taste Compatibility Score — genre overlap, shared favorites, and where you diverge.",
              },
              {
                icon: "📊",
                title: "Genre map",
                desc: "A visual breakdown of which genres dominated your viewing. See trends across months.",
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
            Start tracking your movie year
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
            Share your Wrapped
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Every Wrapped report generates shareable story cards — designed for Instagram Stories,
            WhatsApp, and group chats. The cards show your headline stats (total titles, top genre,
            compatibility score) in a visually striking format without exposing your full viewing
            history.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Sharing is optional, but it&rsquo;s a fun way to compare movie habits with friends.
            Couples often discover they watch far more — or far less — than they thought. The
            Wrapped format makes it easy to celebrate a year of movie nights together.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
