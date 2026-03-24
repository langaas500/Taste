import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOOD_GUIDES, REGIONS, REGION_HREFLANG, type Region } from "@/config/seo-guides";

export const revalidate = 86400;

const BASE = "https://logflix.app";

type Params = { region: string };

/* ── Category grouping ─────────────────────────────── */

const CATEGORIES: Record<string, { slugs: string[]; label: Record<Region, string> }> = {
  duo: {
    slugs: ["filmkveld-for-to", "perfekt-fredagskveld", "imponér-gjestene"],
    label: { no: "For to", se: "För två", dk: "For to", fi: "Kahdelle", en: "For Two" },
  },
  solo: {
    slugs: ["se-alene-i-morket", "sen-kveld-alene", "kort-og-konsist"],
    label: { no: "Alene", se: "Ensam", dk: "Alene", fi: "Yksin", en: "Solo" },
  },
  family: {
    slugs: ["bra-for-hele-familien", "familiekos", "barnefilm", "hyttekveld"],
    label: { no: "Familie & venner", se: "Familj & vänner", dk: "Familie & venner", fi: "Perhe & ystävät", en: "Family & Friends" },
  },
  mood: {
    slugs: [], // filled dynamically with the rest
    label: { no: "Stemning & sjanger", se: "Stämning & genre", dk: "Stemning & genre", fi: "Tunnelma & genre", en: "Mood & Genre" },
  },
};

const ASSIGNED = new Set(
  Object.values(CATEGORIES).flatMap((c) => c.slugs),
);

// Everything not explicitly assigned goes to "mood"
CATEGORIES.mood.slugs = MOOD_GUIDES.filter((g) => !ASSIGNED.has(g.slug)).map((g) => g.slug);

/* ── Localized strings ─────────────────────────────── */

const STRINGS: Record<Region, { title: string; description: string; h1: string; intro: string }> = {
  no: {
    title: "Filmguider – Finn den perfekte filmen | Logflix",
    description: "Utforsk kuraterte filmguider for enhver stemning. Fredagskveld, date night, familiekos og mer.",
    h1: "Filmguider",
    intro: "Kuraterte samlinger for enhver stemning. Velg en guide og finn din neste film eller serie.",
  },
  se: {
    title: "Filmguider – Hitta den perfekta filmen | Logflix",
    description: "Utforska kuraterade filmguider för varje stämning. Fredagskväll, date night, familjemys och mer.",
    h1: "Filmguider",
    intro: "Kuraterade samlingar för varje stämning. Välj en guide och hitta din nästa film eller serie.",
  },
  dk: {
    title: "Filmguider – Find den perfekte film | Logflix",
    description: "Udforsk kuraterede filmguider til enhver stemning. Fredagsaften, date night, familiehygge og mere.",
    h1: "Filmguider",
    intro: "Kuraterede samlinger til enhver stemning. Vælg en guide og find din næste film eller serie.",
  },
  fi: {
    title: "Elokuvaoppaat – Löydä täydellinen elokuva | Logflix",
    description: "Tutustu kuratoituihin elokuvaoppaisiin jokaiseen tunnelmaan. Perjantai-ilta, treffit, perheen yhteinen ilta ja paljon muuta.",
    h1: "Elokuvaoppaat",
    intro: "Kuratoituja kokoelmia jokaiseen tunnelmaan. Valitse opas ja löydä seuraava elokuvasi tai sarjasi.",
  },
  en: {
    title: "Movie Guides – Find the Perfect Movie | Logflix",
    description: "Explore curated movie guides for every mood. Friday night, date night, family time and more.",
    h1: "Movie Guides",
    intro: "Curated collections for every mood. Pick a guide and find your next movie or series.",
  },
};

/* ── Static params ─────────────────────────────────── */

export function generateStaticParams() {
  return REGIONS.map((region) => ({ region }));
}

/* ── Metadata ──────────────────────────────────────── */

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { region } = await params;
  if (!REGIONS.includes(region as Region)) return {};

  const r = region as Region;
  const s = STRINGS[r];
  const canonical = `${BASE}/${region}/guides`;

  const languages: Record<string, string> = {};
  for (const reg of REGIONS) {
    languages[REGION_HREFLANG[reg]] = `${BASE}/${reg}/guides`;
  }
  languages["x-default"] = `${BASE}/no/guides`;

  return {
    title: s.title,
    description: s.description,
    alternates: { canonical, languages },
    openGraph: {
      title: s.title,
      description: s.description,
      url: canonical,
      siteName: "Logflix",
      type: "website",
    },
  };
}

/* ── Page ──────────────────────────────────────────── */

export default async function GuidesHubPage({ params }: { params: Promise<Params> }) {
  const { region } = await params;
  if (!REGIONS.includes(region as Region)) notFound();

  const r = region as Region;
  const s = STRINGS[r];

  const categoryOrder = ["duo", "solo", "family", "mood"] as const;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0c",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Breadcrumbs */}
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 20px 0",
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          {r === "fi" ? "Etusivu" : "Hjem"}
        </Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.6)" }}>{s.h1}</span>
      </nav>

      {/* Header */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 20px 0",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
          }}
        >
          {s.h1}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: 0,
          }}
        >
          {s.intro}
        </p>
      </header>

      {/* Categories */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>
        {categoryOrder.map((catKey) => {
          const cat = CATEGORIES[catKey];
          const guides = cat.slugs
            .map((slug) => MOOD_GUIDES.find((g) => g.slug === slug))
            .filter((g) => g && g.locales[r]);

          if (guides.length === 0) return null;

          return (
            <section key={catKey} style={{ marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#ff2a2a",
                  marginBottom: 20,
                }}
              >
                {cat.label[r]}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {guides.map((guide) => {
                  if (!guide) return null;
                  const locale = guide.locales[r];
                  if (!locale) return null;
                  const excerpt =
                    locale.intro.length > 120
                      ? locale.intro.slice(0, 117) + "..."
                      : locale.intro;

                  return (
                    <Link
                      key={guide.slug}
                      href={`/${region}/guides/${guide.slug}`}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          backdropFilter: "blur(24px)",
                          WebkitBackdropFilter: "blur(24px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: "20px 22px",
                          transition: "border-color 0.2s ease, background 0.2s ease",
                          cursor: "pointer",
                          minHeight: 120,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                        // hover styles via CSS below
                        className="guide-card"
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: 17,
                              fontWeight: 600,
                              margin: "0 0 8px",
                              lineHeight: 1.3,
                            }}
                          >
                            {locale.h1}
                          </h3>
                          <p
                            style={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.5)",
                              lineHeight: 1.55,
                              margin: 0,
                            }}
                          >
                            {excerpt}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#ff2a2a",
                            fontWeight: 500,
                            marginTop: 14,
                            display: "inline-block",
                          }}
                        >
                          &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: r === "fi" ? "Etusivu" : "Hjem",
                item: BASE,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: s.h1,
                item: `${BASE}/${region}/guides`,
              },
            ],
          }),
        }}
      />

      {/* Hover styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .guide-card:hover {
              border-color: rgba(255,42,42,0.25) !important;
              background: rgba(255,255,255,0.06) !important;
            }
          `,
        }}
      />
    </div>
  );
}
