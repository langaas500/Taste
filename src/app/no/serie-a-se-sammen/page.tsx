import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Serie å se sammen – Slipp å krangle",
  description:
    "Finn en serie dere begge gleder dere til å se. Sveip separat og få kun treff dere er enige om.",
  alternates: {
    canonical: "https://logflix.app/no/serie-a-se-sammen",
    languages: {
      no: "https://logflix.app/no/serie-a-se-sammen",
      en: "https://logflix.app/en/tv-shows-to-watch-together",
      "x-default": "https://logflix.app/no/serie-a-se-sammen",
    },
  },
};

export default function SerieASeSammenPage() {
  return (
    <SeoGuideLayout
      locale="no"
      h1="Serie å se sammen"
      heroSubtitle="Finn neste serie å binge sammen — uten diskusjon, uten kompromiss."
      relatedLinks={[
        { href: "/no/hva-skal-vi-se-i-kveld", label: "Hva skal vi se i kveld?" },
        { href: "/no/film-a-se-med-kjaeresten", label: "Film å se med kjæresten" },
        { href: "/no/romantiske-filmer-netflix-norge", label: "Romantiske filmer på Netflix Norge" },
      ]}
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Sjangre som fungerer best å se sammen
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Drama", examples: "Succession, The Bear, Severance" },
            { label: "Komedie", examples: "Ted Lasso, Schitt's Creek" },
            { label: "Thriller", examples: "Ozark, Dark, Sharp Objects" },
            { label: "Sci-fi", examples: "Stranger Things, Black Mirror" },
            { label: "True crime", examples: "Making a Murderer, The Staircase" },
            { label: "Fantasy", examples: "House of the Dragon, The Witcher" },
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
        En god felles serie er en av de beste tingene et par eller en vennegjeng kan ha —
        noe å se frem til, noe å diskutere, og ingen trenger å bestemme hva dere skal se
        hver kveld. Problemet er å komme i gang. Logflix lar dere sveipe gjennom serier
        uavhengig og finner automatisk det dere overlapper på.
      </p>

      <FaqSection items={[
        {
          question: "Hva er de beste seriene å se sammen akkurat nå?",
          answer: "Populære valg akkurat nå er The Bear (drama/komedie), Severance (thriller/sci-fi) og The White Lotus (drama). Felles for dem er godt tempo, sterke karakterer og mye å diskutere etterpå. Logflix henter alltid oppdatert tilgjengelighet på norske strømmetjenester.",
        },
        {
          question: "Hvordan unngår vi å se forskjellige episoder?",
          answer: "Den klassiske 'ikke se uten meg'-avtalen. De fleste strømmetjenester lar deg lage separate profiler slik at fremgangen holdes atskilt. Noen tjenester som Netflix har også en delt profil-funksjon for par.",
        },
        {
          question: "Hva gjør vi hvis vi ikke liker de samme seriene?",
          answer: "Det er akkurat det Se Sammen er laget for. Dere sveiper uavhengig av hverandre — ingen ser hva den andre velger — og appen viser kun serier der begge har sagt ja. Overraskende mange par finner overlapp de ikke visste de hadde.",
        },
        {
          question: "Hvor mange episoder bør vi se om gangen?",
          answer: "2-3 episoder er en god rytme for de fleste. Det gir nok innhold til en god kveld uten at dere blir lei eller mister spenningen. For kortere serier med 30-minutters episoder kan dere fint se 4-5.",
        },
      ]} />
    </SeoGuideLayout>
  );
}
