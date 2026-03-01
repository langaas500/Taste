import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movie to Watch With Your Girlfriend — Find One You'll Both Like",
  description:
    "Avoid the wrong vibe. Find a movie you'll both enjoy without guessing. Swipe independently and only see what you match on.",
  alternates: {
    canonical: "https://logflix.app/en/movie-to-watch-with-your-girlfriend",
    languages: {
      en: "https://logflix.app/en/movie-to-watch-with-your-girlfriend",
      no: "https://logflix.app/no/film-a-se-med-kjaeresten",
      "x-default": "https://logflix.app/en/movie-to-watch-with-your-girlfriend",
    },
  },
};

export default function MovieWithGirlfriendPage() {
  return (
    <SeoGuideLayout
      locale="en"
      h1="Movie to Watch with Your Girlfriend"
      heroSubtitle="Find a movie you both actually want to watch — without the negotiation."
      ctaText="Try Watch Together — free"
      trustLine="Free · Under 3 minutes · No app to download"
      relatedLinks={[
        { href: "/en/movies-for-date-night", label: "Movies for date night" },
        { href: "/en/tv-shows-to-watch-together", label: "TV shows to watch together" },
        { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Pick a mood first
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Rom-com", examples: "Crazy Rich Asians, The Proposal" },
            { label: "Romantic drama", examples: "The Notebook, About Time" },
            { label: "Feel-good", examples: "Hitch, Notting Hill" },
            { label: "Thriller", examples: "Gone Girl, The Girl on the Train" },
            { label: "Action", examples: "Mr. & Mrs. Smith, Killers" },
            { label: "Classic", examples: "When Harry Met Sally, Amélie" },
          ].map((m) => (
            <div key={m.label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.4 }}>
                {m.examples}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p style={{
        color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 32,
      }}>
        The hardest part of movie night isn't finding something good — it's finding something
        you both want to watch at the same time. One person wants a thriller, the other wants
        something light. Watch Together fixes this by letting you both swipe through titles
        independently. Only the movies you both liked show up as matches.
      </p>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What are the best romantic movies right now?",
            answer: "Popular picks right now include Anyone But You and The Idea of You on streaming, plus classics like Crazy Rich Asians and About Time that hold up every rewatch. The best movie is ultimately the one you're both actually excited to watch — which is exactly what Watch Together helps you find.",
          },
          {
            question: "How do we find a movie we both like?",
            answer: "Open Watch Together on both your phones, join the same session with a code, and swipe through movies independently. Neither of you sees what the other picks. Logflix reveals only your matches — the movies you both said yes to.",
          },
          {
            question: "What if she likes rom-coms and I don't?",
            answer: "You might overlap more than you think. Watch Together shows you titles across all genres — there are often thrillers, dramas, or comedies that land in the middle. And if she's genuinely into rom-coms, it's still faster to find one you don't mind than to scroll for 45 minutes.",
          },
          {
            question: "How long does it take?",
            answer: "Most couples find a match in 2–3 minutes. You swipe through around 20–30 titles each and Logflix shows your overlap instantly.",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
