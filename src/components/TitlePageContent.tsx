import Image from "next/image";
import Link from "next/link";
import type { WatchProviderData, WatchProvider } from "@/lib/types";

/* ── Types ────────────────────────────────────────────── */

export interface TitlePageProps {
  title: string;
  originalTitle: string | null;
  year: number | null;
  overview: string | null;
  tagline: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  genres: { id: number; name: string }[];
  voteAverage: number | null;
  type: "movie" | "tv";
  tmdbId: number;
  slug: string;
  region: string;
  providers: WatchProviderData | null;
  curatorHook: string | null;
  curatorBody: string | null;
  curatorVerdict: string | null;
  moodTags: string[] | null;
}

/* ── Constants ────────────────────────────────────────── */

const REGION_NAME: Record<string, string> = {
  no: "Norge",
  dk: "Danmark",
  fi: "Finland",
  se: "Sverige",
};

const REGION_HREFLANG: Record<string, string> = {
  no: "nb",
  dk: "da",
  fi: "fi",
  se: "sv",
};

const ALL_REGIONS = ["no", "dk", "fi", "se"] as const;

const TYPE_LABEL: Record<string, string> = {
  movie: "Film",
  tv: "Serie",
};

/* ── Helpers ──────────────────────────────────────────── */

function tmdbImg(path: string | null, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function buildNetflixAnswer(
  title: string,
  region: string,
  providers: WatchProviderData | null,
): string {
  const regionName = REGION_NAME[region] || region.toUpperCase();
  const flatrate = providers?.flatrate || [];

  const netflix = flatrate.find((p) =>
    p.provider_name.toLowerCase().includes("netflix"),
  );
  if (netflix) {
    return `Ja, ${title} er tilgjengelig på Netflix i ${regionName}.`;
  }

  if (flatrate.length > 0) {
    return `Nei, men du kan se ${title} på ${flatrate[0].provider_name} i ${regionName}.`;
  }

  const rent = providers?.rent || [];
  if (rent.length > 0) {
    return `${title} er ikke inkludert i noe abonnement i ${regionName}, men kan leies på ${rent[0].provider_name}.`;
  }

  return `Tilgjengelighet varierer. Sjekk logflix.app for oppdatert info.`;
}

function buildProviderAnswer(
  title: string,
  region: string,
  providers: WatchProviderData | null,
): string {
  const regionName = REGION_NAME[region] || region.toUpperCase();
  const flatrate = providers?.flatrate || [];

  if (flatrate.length > 0) {
    const names = flatrate.slice(0, 3).map((p) => p.provider_name).join(", ");
    return `Du kan strømme ${title} på ${names} i ${regionName}.`;
  }

  const rent = providers?.rent || [];
  if (rent.length > 0) {
    const names = rent.slice(0, 3).map((p) => p.provider_name).join(", ");
    return `${title} kan leies på ${names} i ${regionName}.`;
  }

  return `Vi har ikke funnet strømmetilbud for ${title} i ${regionName} akkurat nå. Sjekk logflix.app for oppdatert info.`;
}

function buildFaqSchema(props: TitlePageProps) {
  const { title, region, providers, curatorHook, curatorVerdict } = props;
  const regionName = REGION_NAME[region] || region.toUpperCase();

  const questions: { q: string; a: string }[] = [
    {
      q: `Hvor kan jeg se ${title} i ${regionName}?`,
      a: buildProviderAnswer(title, region, providers),
    },
    {
      q: `Er ${title} tilgjengelig på Netflix i ${regionName}?`,
      a: buildNetflixAnswer(title, region, providers),
    },
  ];

  if (curatorHook && curatorVerdict) {
    questions.push({
      q: `Er ${title} verdt å se?`,
      a: `${curatorHook} ${curatorVerdict}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/* ── Provider Card ────────────────────────────────────── */

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  const src = tmdbImg(provider.logo_path, "w92");
  if (!src) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <Image
        src={src}
        alt={provider.provider_name}
        width={28}
        height={28}
        className="rounded-md"
      />
      <span className="text-sm text-white/80">{provider.provider_name}</span>
    </div>
  );
}

function ProviderSection({
  label,
  providers,
}: {
  label: string;
  providers: WatchProvider[];
}) {
  if (providers.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <ProviderLogo key={p.provider_id} provider={p} />
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */

export default function TitlePageContent(props: TitlePageProps) {
  const {
    title,
    originalTitle,
    year,
    overview,
    tagline,
    posterPath,
    backdropPath,
    genres,
    voteAverage,
    type,
    slug,
    region,
    providers,
    curatorHook,
    curatorBody,
    curatorVerdict,
    moodTags,
  } = props;

  const regionName = REGION_NAME[region] || region.toUpperCase();
  const backdrop = tmdbImg(backdropPath, "w1280");
  const poster = tmdbImg(posterPath, "w500");
  const flatrate = providers?.flatrate || [];
  const rent = providers?.rent || [];
  const buy = providers?.buy || [];
  const hasCurator = curatorHook || curatorBody || curatorVerdict;

  return (
    <>
      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(props)) }}
      />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* Backdrop */}
          {backdrop && (
            <div className="absolute inset-0">
              <Image
                src={backdrop}
                alt=""
                fill
                className="object-cover opacity-30"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/80 to-transparent" />
            </div>
          )}

          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
            {/* Poster */}
            {poster && (
              <div className="flex-shrink-0">
                <Image
                  src={poster}
                  alt={`${title} poster`}
                  width={260}
                  height={390}
                  priority
                  className="rounded-xl shadow-2xl"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col justify-end">
              <h1 className="mb-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                {title}
                {year && (
                  <span className="ml-2 text-xl font-normal text-white/40">
                    ({year})
                  </span>
                )}
              </h1>

              {tagline && (
                <p className="mb-3 text-sm italic text-white/50">{tagline}</p>
              )}

              {originalTitle && originalTitle !== title && (
                <p className="mb-3 text-xs text-white/35">
                  Originaltittel: {originalTitle}
                </p>
              )}

              {/* Genres */}
              {genres.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/60"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              {voteAverage != null && voteAverage > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-400">
                    {voteAverage.toFixed(1)}
                  </span>
                  <svg className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-white/40">TMDB</span>
                </div>
              )}

              {/* Overview */}
              {overview && (
                <p className="max-w-xl text-sm leading-relaxed text-white/60">
                  {overview}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Streaming ────────────────────────────────── */}
        {(flatrate.length > 0 || rent.length > 0 || buy.length > 0) && (
          <section className="mb-8 rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
              Strømming i {regionName}
            </h2>
            <div className="space-y-4">
              <ProviderSection label="Inkludert i abonnement" providers={flatrate} />
              <ProviderSection label="Leie" providers={rent} />
              <ProviderSection label="Kjøp" providers={buy} />
            </div>
            {providers?.link && (
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Se alle alternativer &rarr;
              </a>
            )}
          </section>
        )}

        {/* ── Curator ──────────────────────────────────── */}
        {hasCurator && (
          <section className="mb-8 rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
              Logflix Curator
            </h2>
            {curatorHook && (
              <p className="mb-3 text-lg font-semibold text-white/90">
                {curatorHook}
              </p>
            )}
            {curatorBody && (
              <p className="mb-3 text-sm leading-relaxed text-white/60">
                {curatorBody}
              </p>
            )}
            {curatorVerdict && (
              <p className="inline-block rounded-lg border border-[rgba(229,9,20,0.2)] bg-[rgba(229,9,20,0.06)] px-3 py-1.5 text-sm font-medium text-[rgba(229,9,20,0.85)]">
                {curatorVerdict}
              </p>
            )}
          </section>
        )}

        {/* ── Mood Tags ────────────────────────────────── */}
        {moodTags && moodTags.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
              Stemning
            </h2>
            <div className="flex flex-wrap gap-2">
              {moodTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Andre land (Cross-region) ────────────────── */}
        <section className="mb-8 rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
            {title} i andre nordiske land
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.filter((r) => r !== region).map((r) => (
              <Link
                key={r}
                href={`/${r}/${type}/${slug}`}
                hrefLang={REGION_HREFLANG[r]}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white/60 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/80"
              >
                {REGION_NAME[r]}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Premium CTA ──────────────────────────────── */}
        <section
          className="rounded-2xl border border-[rgba(229,9,20,0.15)] p-6 text-center"
          style={{ background: "rgba(229,9,20,0.03)", backdropFilter: "blur(30px)" }}
        >
          <h2 className="mb-2 text-base font-semibold text-white/90">
            Logg og spor {title} i ditt bibliotek
          </h2>
          <p className="mb-4 text-sm text-white/50">
            Hold oversikt over hva du har sett, lag lister, og få personlige anbefalinger.
          </p>
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
