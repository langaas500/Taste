import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Film for filmkveld med venner (som alle gidder å se)",
  description:
    "Gjør filmkvelden enklere. Finn en film hele gjengen faktisk har lyst til å se – uten endeløs scrolling.",
  alternates: {
    canonical: "https://logflix.app/no/film-for-filmkveld-med-venner",
    languages: {
      no: "https://logflix.app/no/film-for-filmkveld-med-venner",
      en: "https://logflix.app/en/movies-to-watch-with-friends",
      "x-default": "https://logflix.app/no/film-for-filmkveld-med-venner",
    },
  },
};

export default function FilmkveldMedVennerPage() {
  return (
    <SeoGuideLayout
      locale="no"
      h1="Film for filmkveld med venner"
      heroSubtitle="Finn filmer hele gjengen faktisk vil se — uten at noen må ofre seg."
      relatedLinks={[
        { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
        { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
        { href: "/no/serie-a-se-sammen", label: "Serie å se sammen" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Sjangre som fungerer best i gruppe
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Komedie", examples: "The Hangover, Game Night" },
            { label: "Action", examples: "Top Gun, Mad Max" },
            { label: "Thriller", examples: "Knives Out, Gone Girl" },
            { label: "Sci-fi", examples: "Interstellar, Edge of Tomorrow" },
            { label: "Skrekk", examples: "Get Out, A Quiet Place" },
            { label: "Animasjon", examples: "Spider-Man: Into the Spider-Verse" },
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
        Filmkveld med venner strander ofte på én ting: ingen vil bestemme, alle har ulike preferanser,
        og til slutt ser dere noe halvdårlig fordi dere ga opp. Se Sammen løser dette ved at
        alle sveiper uavhengig — og kun viser filmer der flertallet overlapper.
      </p>

      <FaqSection items={[
        {
          question: "Hva gjør en film bra for gruppe?",
          answer: "Filmer som fungerer i gruppe har tydelig handling, godt tempo og helst humor eller spenning som engasjerer alle samtidig. Unngå tunge dramaer eller filmer som krever mye forkunnskaper.",
        },
        {
          question: "Hvordan unngår vi å bruke evig tid på å velge?",
          answer: "Med Se Sammen sveiper alle i gruppen gjennom filmer på egne telefoner. Appen viser kun filmer der flere har sveipet ja — ingen diskusjon, ingen kompromiss.",
        },
        {
          question: "Film eller serie for filmkveld?",
          answer: "Film er som regel bedre for sosiale kvelder — avsluttet på 2 timer, ingen cliffhanger og lettere å følge for alle. Serie fungerer best hvis dere allerede er i gang med noe sammen.",
        },
        {
          question: "Kan hele gruppen bruke Se Sammen samtidig?",
          answer: "Ja. Gruppen-modusen lar opptil 6 personer sveipe samtidig. Dere får en felles liste med matcher til slutt.",
        },
      ]} />
    </SeoGuideLayout>
  );
}
