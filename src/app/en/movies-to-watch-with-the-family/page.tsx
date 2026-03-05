import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movies to Watch with the Family – Find Something Everyone Enjoys | Logflix",
  description:
    "Tired of endless debates? Find movies the whole family will enjoy with Logflix swipe-matching. Free to use.",
  alternates: {
    canonical: "https://logflix.app/en/movies-to-watch-with-the-family",
    languages: {
      en: "https://logflix.app/en/movies-to-watch-with-the-family",
      nb: "https://logflix.app/no/filmer-a-se-med-familien",
      "x-default": "https://logflix.app/no/filmer-a-se-med-familien",
    },
  },
};

const faqItems = [
  {
    question: "What movies work for the whole family?",
    answer:
      "Movies with a clear storyline, good pacing, and minimal violence or scary content work best. Animated films from Pixar, Disney, and DreamWorks are usually safe picks, but family comedies and adventure films also hit broadly across ages.",
  },
  {
    question: "What do we do when kids and adults want completely different things?",
    answer:
      "Use Watch Together — everyone swipes through movies on their own screen, and the app only shows titles where multiple people said yes. It works surprisingly well because many movies appeal more broadly than you'd think.",
  },
  {
    question: "Is there an age rating filter?",
    answer:
      "Logflix pulls age ratings from TMDB, and you can filter by genre and type. Combined with Watch Together, this ensures only movies everyone is comfortable with show up as matches.",
  },
  {
    question: "Is Watch Together free for families?",
    answer:
      "Yes. Completely free, no app to download, and no sign-up required. Open logflix.app/together on your phone, share the code with your family, and start swiping.",
  },
];

export default function MoviesWithFamilyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
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
        h1="Movies to Watch with the Family"
        heroSubtitle="Find a movie the whole family actually wants to watch — without endless debate in front of the TV."
        ctaText="Try Watch Together — free"
        trustLine="Free · Under 3 minutes · No app to download"
        relatedLinks={[
          { href: "/en/movie-to-watch-with-your-girlfriend", label: "Movie to Watch with Your Girlfriend" },
          { href: "/en/what-should-we-watch-tonight", label: "What Should We Watch Tonight?" },
          { href: "/en/tv-shows-to-watch-together", label: "TV Shows to Watch Together" },
        ]}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Genres that work for the whole family
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Comedy", examples: "Home Alone, Liar Liar" },
              { label: "Adventure", examples: "Indiana Jones, Jumanji" },
              { label: "Animation", examples: "Coco, Inside Out, Shrek" },
              { label: "Family", examples: "Paddington, Matilda" },
              { label: "Fantasy", examples: "Harry Potter, Narnia" },
              { label: "Action", examples: "The Incredibles, Spy Kids" },
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
          Family movie night sounds cozy — until it&apos;s time to pick. The kids want
          something funny, the teenager wants action, and the adults can&apos;t face another
          animated film. The result is everyone scrolling in different directions while the
          evening slips away in discussion instead of in front of the screen. Logflix lets
          everyone swipe through movies on their own screen and only shows what the family
          overlaps on. No one has to convince anyone, and no one feels like they gave in.
          It takes under three minutes, works right in the browser, and requires no app or
          sign-up.
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Why is it so hard to pick a movie for the whole family?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            When two people need to agree it&apos;s hard enough. With a whole family —
            maybe four, five, or six people of different ages, different references, and
            different moods — it becomes exponentially harder. A six-year-old has
            completely different expectations than a fourteen-year-old, who in turn has
            different preferences than the parents.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            On top of that, group dynamics play a role. Usually one person suggests and
            the rest react. The suggester feels pressure, and those who say no feel
            difficult. The result is either the loudest voice wins, or everyone gives up
            and looks at their phones instead.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          }}>
            Watch Together solves this by removing the entire negotiation. Each family
            member swipes through movies on their own screen — independently, without
            seeing what others pick. The app automatically finds titles where multiple
            people said yes and presents them as matches. No discussion, no compromise.
          </p>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0,
          }}>
            The surprising part is how often families find overlap they didn&apos;t know
            they had. Many movies appeal more broadly than you&apos;d think — and when
            everyone has swiped yes independently, you know the whole family is actually
            looking forward to what you&apos;re about to watch.
          </p>
        </section>

        <FaqSection
          title="Frequently Asked Questions"
          items={faqItems}
        />
      </SeoGuideLayout>
    </>
  );
}
