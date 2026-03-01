import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movies to Watch With Friends — Find One Everyone Agrees On",
  description:
    "Group movie night shouldn't feel like a negotiation. Quickly find a film your whole group agrees on — without endless scrolling.",
  alternates: {
    canonical: "https://logflix.app/en/movies-to-watch-with-friends",
    languages: {
      en: "https://logflix.app/en/movies-to-watch-with-friends",
      no: "https://logflix.app/no/film-for-filmkveld-med-venner",
      "x-default": "https://logflix.app/en/movies-to-watch-with-friends",
    },
  },
};

export default function MoviesWithFriendsPage() {
  return (
    <SeoGuideLayout
      locale="en"
      h1="Movies to Watch with Friends"
      heroSubtitle="Find a movie the whole group is actually excited about — not just the loudest person's pick."
      ctaText="Try Watch Together — free"
      trustLine="Free · Under 3 minutes · No app to download"
      relatedLinks={[
        { href: "/en/what-should-we-watch-tonight", label: "What should we watch tonight?" },
        { href: "/en/movies-for-date-night", label: "Movies for date night" },
        { href: "/en/tv-shows-to-watch-together", label: "TV shows to watch together" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Genres that work best for groups
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Comedy", examples: "The Hangover, Game Night" },
            { label: "Action", examples: "Top Gun, Mad Max: Fury Road" },
            { label: "Thriller", examples: "Knives Out, Gone Girl" },
            { label: "Sci-fi", examples: "Interstellar, Edge of Tomorrow" },
            { label: "Horror", examples: "Get Out, A Quiet Place" },
            { label: "Animation", examples: "Spider-Man: Into the Spider-Verse" },
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
        Group movie nights die in the selection phase. Someone suggests something,
        someone else isn't feeling it, and 45 minutes later you're watching whatever
        the most decisive person picked. Watch Together's group mode lets everyone
        swipe independently on their own phone — and only surfaces movies where
        the group actually overlaps. Up to 6 people, takes 3 minutes.
      </p>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What makes a movie work for a large group?",
            answer: "Movies that work in groups have strong pacing, clear storytelling, and either humor or tension that hits everyone at the same time. Avoid slow burns and anything that requires a lot of prior knowledge. Comedies, action movies, and thrillers with twists are almost always safe bets.",
          },
          {
            question: "How do we pick something without spending forever on it?",
            answer: "Use Watch Together's group mode. Everyone joins the same session and swipes through movies independently. Logflix shows only the titles where multiple people said yes — no debate, no one person dominating the choice.",
          },
          {
            question: "Movie or show for a group night?",
            answer: "Movie. A film wraps up in 2 hours, there's no cliffhanger, and everyone leaves satisfied. Shows work if you're already watching something together, but starting a new series with a group rarely ends well — someone's always seen ahead.",
          },
          {
            question: "How many people can use Watch Together at once?",
            answer: "Up to 6 people can join the same Watch Together session. Everyone swipes on their own phone and the app finds your group's overlapping picks automatically.",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
