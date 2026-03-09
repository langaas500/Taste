import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { MOOD_GUIDES, REGIONS, REGION_HREFLANG, type Region } from "@/config/seo-guides";

export const revalidate = 86400;

const BASE = "https://logflix.app";

type Params = { region: string; slug: string };

/* ── Static params ───────────────────────────────────── */

export function generateStaticParams() {
  return REGIONS.flatMap((region) =>
    MOOD_GUIDES.map((g) => ({ region, slug: g.slug })),
  );
}

/* ── Metadata ────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { region, slug } = await params;
  const guide = MOOD_GUIDES.find((g) => g.slug === slug);
  if (!guide || !REGIONS.includes(region as Region)) return {};

  const t = guide.locales[region as Region];
  const canonical = `${BASE}/${region}/guides/${slug}`;
  const languages: Record<string, string> = {};
  for (const r of REGIONS) {
    languages[REGION_HREFLANG[r]] = `${BASE}/${r}/guides/${slug}`;
  }
  languages["x-default"] = `${BASE}/no/guides/${slug}`;

  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages },
    openGraph: {
      title: t.title,
      description: t.description,
      url: canonical,
      type: "article",
    },
  };
}

/* ── Types ────────────────────────────────────────────── */

type CacheTitle = {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  slug: string;
  year: number | null;
  curator_hook: string | null;
  vote_average: number | null;
};

/* ── Page ─────────────────────────────────────────────── */

export default async function GuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { region, slug } = await params;
  const guide = MOOD_GUIDES.find((g) => g.slug === slug);
  if (!guide || !REGIONS.includes(region as Region)) notFound();

  const t = guide.locales[region as Region];
  const admin = createSupabaseAdmin();

  const { data } = await admin
    .from("titles_cache")
    .select("tmdb_id, type, title, year, poster_path, slug, curator_hook, vote_average")
    .overlaps("mood_tags", guide.mood_tags)
    .not("slug", "is", null)
    .gte("vote_average", 6.5)
    .order("vote_average", { ascending: false })
    .limit(18);

  const titles: CacheTitle[] = data || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: t.faq_question,
                acceptedAnswer: { "@type": "Answer", text: t.faq_answer },
              },
            ],
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
              { "@type": "ListItem", position: 1, name: t.breadcrumb_home, item: BASE },
              { "@type": "ListItem", position: 2, name: t.breadcrumb_guides, item: `${BASE}/${region}/guides` },
              { "@type": "ListItem", position: 3, name: t.h1 },
            ],
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/40">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-white/70">
                {t.breadcrumb_home}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href={`/${region}/guides`} className="transition-colors hover:text-white/70">
                {t.breadcrumb_guides}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-white/60">{t.h1}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {t.h1}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            {t.intro}
          </p>
        </header>

        <section className="mb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {titles.map((title) => (
              <Link
                key={title.tmdb_id}
                href={`/${region}/${title.type}/${title.slug}`}
                className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
              >
                {title.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${title.poster_path}`}
                    alt={title.title}
                    width={300}
                    height={450}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center bg-white/[0.04] text-xs text-white/20">
                    ?
                  </div>
                )}
                <div className="p-2.5">
                  <p className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                    {title.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {title.year && (
                      <span className="text-xs text-white/40">{title.year}</span>
                    )}
                    {title.vote_average != null && (
                      <span className="text-xs text-white/30">
                        ★ {title.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {title.curator_hook && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/35">
                      {title.curator_hook}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {titles.length === 0 && (
            <p className="text-sm text-white/40">{t.empty}</p>
          )}
        </section>

        <section
          className="mb-12 rounded-2xl border border-[rgba(229,9,20,0.2)] p-6 text-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}
        >
          <h2 className="mb-2 text-base font-semibold text-white/90">
            {t.cta_heading}
          </h2>
          <p className="mb-4 text-sm text-white/50">{t.cta_body}</p>
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
            {t.faq_heading}
          </h2>
          <div className="space-y-3">
            <details className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-white/90">
                {t.faq_question}
                <svg
                  className="h-4 w-4 flex-shrink-0 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-white/60">
                {t.faq_answer}
              </p>
            </details>
          </div>
        </section>

        <section
          className="rounded-2xl border border-[rgba(229,9,20,0.15)] p-6 text-center"
          style={{ background: "rgba(229,9,20,0.03)", backdropFilter: "blur(30px)" }}
        >
          <h2 className="mb-2 text-base font-semibold text-white/90">
            {t.bottom_heading}
          </h2>
          <p className="mb-4 text-sm text-white/50">{t.bottom_body}</p>
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
