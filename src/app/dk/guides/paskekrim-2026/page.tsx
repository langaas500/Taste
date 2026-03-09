import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/* ── Metadata ────────────────────────────────────────── */

const BASE = "https://logflix.app";

const ALTERNATES = {
  "nb-NO": `${BASE}/no/guides/paskekrim-2026`,
  "sv-SE": `${BASE}/se/guides/paskkrim-2026`,
  "da-DK": `${BASE}/dk/guides/paskekrim-2026`,
  "fi-FI": `${BASE}/fi/guides/paasiainen-dekkari-2026`,
  "x-default": `${BASE}/no/guides/paskekrim-2026`,
};

export const metadata: Metadata = {
  title: "Påskekrimitid 2026 – De bedste serier at se i påsken | Logflix",
  description:
    "Find de bedste påskekrimi-serier for 2026. Se hvor du kan streame dem i Danmark på Netflix, HBO Max og Viaplay.",
  alternates: {
    canonical: ALTERNATES["da-DK"],
    languages: ALTERNATES,
  },
  openGraph: {
    title: "Påskekrimitid 2026 – De bedste serier at se i påsken | Logflix",
    description:
      "Find de bedste påskekrimi-serier for 2026. Se hvor du kan streame dem i Danmark på Netflix, HBO Max og Viaplay.",
    url: ALTERNATES["da-DK"],
    type: "article",
  },
};

/* ── FAQ data ────────────────────────────────────────── */

const faqItems = [
  {
    q: "Hvor kan jeg se påskekrimi i 2026?",
    a: "På Logflix finder du alle påskekrimi-serier tilgængelige i Danmark, med direkte links til Netflix, HBO Max, Viaplay og mere.",
  },
  {
    q: "Hvad er den bedste påskekrimi i 2026?",
    a: "Tjek vores opdaterede liste over de bedste påskekrimi-serier, kurateret med Logflix mood tags.",
  },
];

/* ── Types ────────────────────────────────────────────── */

type CacheTitle = {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  slug: string;
  year: number | null;
};

/* ── Page ─────────────────────────────────────────────── */

export default async function PaskekrimPage() {
  const admin = createSupabaseAdmin();

  const { data: top10 } = await admin
    .from("titles_cache")
    .select("tmdb_id, type, title, poster_path, slug, year")
    .or('mood_tags.ov.{"Påskekrim"},genres.cs.[{"name":"Crime"}],genres.cs.[{"name":"Mystery"}]')
    .not("slug", "is", null)
    .order("popularity", { ascending: false })
    .limit(10);

  const titles: CacheTitle[] = top10 || [];
  const excludeIds = titles.map((t) => t.tmdb_id);

  const { data: noirRows } = await admin
    .from("titles_cache")
    .select("tmdb_id, type, title, poster_path, slug, year")
    .overlaps("mood_tags", ["Nordic Noir"])
    .not("slug", "is", null)
    .not("tmdb_id", "in", `(${excludeIds.join(",")})`)
    .order("popularity", { ascending: false })
    .limit(6);

  const noirTitles: CacheTitle[] = noirRows || [];

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
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Hjem", item: BASE },
              { "@type": "ListItem", position: 2, name: "Guider", item: `${BASE}/dk/guides` },
              { "@type": "ListItem", position: 3, name: "Påskekrimi 2026" },
            ],
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/40">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-white/70 transition-colors">Hjem</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/dk/guides" className="hover:text-white/70 transition-colors">Guider</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-white/60">Påskekrimi 2026</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Påskekrim 2026: De 10 bedste serier at se i påsken
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            Intet ødelægger påskestemningen som at bruge to timer på at skændes om hvilken
            krimiserie man skal se. Med{" "}
            <Link href="/together" className="text-[#E50914] hover:underline">
              Se Sammen
            </Link>{" "}
            swiper I hver for jer og finder den krimiserie I begge vil se — på under 3 minutter.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Top 10 påskekrimi-serier 2026
          </h2>
          <div className="space-y-4">
            {titles.map((t, i) => (
              <Link
                key={t.tmdb_id}
                href={`/dk/${t.type}/${t.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(229,9,20,0.12)] text-sm font-bold text-[#E50914]">
                  {i + 1}
                </span>
                {t.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${t.poster_path}`}
                    alt={t.title}
                    width={46}
                    height={69}
                    className="rounded-md"
                  />
                ) : (
                  <div className="flex h-[69px] w-[46px] flex-shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[10px] text-white/20">
                    ?
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                    {t.title}
                  </p>
                  {t.year && <p className="text-xs text-white/40">{t.year}</p>}
                </div>
              </Link>
            ))}
            {titles.length === 0 && (
              <p className="text-sm text-white/40">
                Ingen påskekrimi-titler fundet endnu. Tjek tilbage tættere på påsken!
              </p>
            )}
          </div>
        </section>

        <section
          className="mb-12 rounded-2xl border border-[rgba(229,9,20,0.2)] p-6 text-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}
        >
          <h2 className="mb-2 text-base font-semibold text-white/90">
            Kan I ikke bestemme jer for påskekrimien?
          </h2>
          <p className="mb-4 text-sm text-white/50">
            Lad Se Sammen afgøre — swipe hver for jer og find krimiserien I begge vil se.
          </p>
          <Link
            href="/together"
            className="inline-block rounded-xl border border-[rgba(229,9,20,0.4)] px-6 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-[rgba(229,9,20,0.7)] hover:bg-[rgba(229,9,20,0.06)]"
            style={{ background: "rgba(229,9,20,0.08)" }}
          >
            Start Se Sammen →
          </Link>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Ofte stillede spørgsmål
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <details key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-white/90">
                  {item.q}
                  <svg className="h-4 w-4 flex-shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {noirTitles.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Flere krimitips
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {noirTitles.map((t) => (
                <Link
                  key={t.tmdb_id}
                  href={`/dk/${t.type}/${t.slug}`}
                  className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
                >
                  {t.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${t.poster_path}`}
                      alt={t.title}
                      width={300}
                      height={450}
                      className="w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full bg-white/[0.04] flex items-center justify-center text-white/20 text-xs">?</div>
                  )}
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-white/80 group-hover:text-white/95">{t.title}</p>
                    {t.year && <p className="text-[10px] text-white/40">{t.year}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section
          className="rounded-2xl border border-[rgba(229,9,20,0.15)] p-6 text-center"
          style={{ background: "rgba(229,9,20,0.03)", backdropFilter: "blur(30px)" }}
        >
          <h2 className="mb-2 text-base font-semibold text-white/90">Klar til påskekrimien?</h2>
          <p className="mb-4 text-sm text-white/50">Opret en gratis konto og begynd at logge dine favoritter.</p>
          <Link
            href="/login"
            className="inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#E50914" }}
          >
            Kom i gang — gratis
          </Link>
        </section>
      </div>
    </>
  );
}
