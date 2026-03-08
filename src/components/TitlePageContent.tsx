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

const REGION_UNAVAILABLE_TEXT: Record<string, string> = {
  no: "Ikke tilgjengelig på strømmetjenester i Norge ennå.",
  dk: "Ikke tilgængelig på streamingtjenester i Danmark endnu.",
  fi: "Ei saatavilla suoratoistopalveluissa Suomessa vielä.",
  se: "Inte tillgänglig på streamingtjänster i Sverige ännu.",
};

const REGION_HREFLANG: Record<string, string> = {
  no: "nb",
  dk: "da",
  fi: "fi",
  se: "sv",
};

const ALL_REGIONS = ["no", "dk", "fi", "se"] as const;

export const REGION_TEXT = {
  no: {
    streaming: "Strømming i",
    included: "Inkludert i abonnement",
    rent: "Leie",
    buy: "Kjøp",
    seeAll: "Se alle alternativer",
    otherCountries: "i andre nordiske land",
    originaltitle: "Originaltittel",
    mood: "Stemning",
    ctaTitle: (title: string) => `Logg og spor ${title} i ditt bibliotek`,
    ctaBody: "Hold oversikt over hva du har sett, lag lister, og få personlige anbefalinger.",
    ctaButton: "Kom i gang — gratis",
    metaTitle: (title: string, region: string) => `${title} – Strømming i ${region} | Logflix`,
    metaDesc: (title: string, region: string) => `Se hvor du kan strømme ${title} i ${region}.`,
    metaDescFallback: (title: string, region: string) => `Se hvor du kan strømme ${title} i ${region}. Finn strømmetjenester, anbefalinger og mer på Logflix.`,
    faqQ1: (title: string) => `Hvor kan jeg se ${title}?`,
    faqQ2: (title: string, region: string) => `Er ${title} tilgjengelig på Netflix i ${region}?`,
    faqQ3: (title: string) => `Er ${title} verdt å se?`,
    faqQ4: "Hvordan finner jeg en film begge vil se?",
    faqA4: "Med Logflix Se Sammen kan du koble deg med en venn eller partner. Dere sveiper hver for dere, og Logflix finner filmen dere begge vil se — ingen diskusjon, bare match.",
    netflixYes: (title: string, region: string) => `Ja, ${title} er tilgjengelig på Netflix i ${region}.`,
    netflixNo: (title: string, provider: string, region: string) => `Nei, men du kan se ${title} på ${provider} i ${region}.`,
    netflixRent: (title: string, provider: string) => `${title} er ikke inkludert i abonnement, men kan leies på ${provider}.`,
    netflixNone: "Tilgjengelighet varierer. Sjekk logflix.app for oppdatert info.",
    providerStream: (title: string, provider: string) => `Du kan strømme ${title} på ${provider}.`,
    providerRent: (title: string, provider: string) => `${title} kan leies på ${provider}.`,
    providerNone: (title: string) => `Vi har ikke funnet strømmetilbud for ${title} ennå.`,
    siteDescription: "Finn noe å se sammen. Sveip hver for dere, match på det begge vil se.",
    home: "Hjem",
    movies: "Filmer",
    series: "Serier",
  },
  dk: {
    streaming: "Streaming i",
    included: "Inkluderet i abonnement",
    rent: "Leje",
    buy: "Køb",
    seeAll: "Se alle alternativer",
    otherCountries: "i andre nordiske lande",
    originaltitle: "Originaltitel",
    mood: "Stemning",
    ctaTitle: (title: string) => `Log og følg ${title} i dit bibliotek`,
    ctaBody: "Hold styr på hvad du har set, lav lister og få personlige anbefalinger.",
    ctaButton: "Kom i gang — gratis",
    metaTitle: (title: string, region: string) => `${title} – Streaming i ${region} | Logflix`,
    metaDesc: (title: string, region: string) => `Se hvor du kan streame ${title} i ${region}.`,
    metaDescFallback: (title: string, region: string) => `Se hvor du kan streame ${title} i ${region}. Find streamingtjenester, anbefalinger og mere på Logflix.`,
    faqQ1: (title: string) => `Hvor kan jeg se ${title}?`,
    faqQ2: (title: string, region: string) => `Er ${title} tilgængelig på Netflix i ${region}?`,
    faqQ3: (title: string) => `Er ${title} værd at se?`,
    faqQ4: "Hvordan finder jeg en film vi begge vil se?",
    faqA4: "Med Logflix Se Sammen kan du forbinde dig med en ven eller partner. I swiper hver for jer, og Logflix finder den film I begge vil se — ingen diskussion, bare match.",
    netflixYes: (title: string, region: string) => `Ja, ${title} er tilgængelig på Netflix i ${region}.`,
    netflixNo: (title: string, provider: string, region: string) => `Nej, men du kan se ${title} på ${provider} i ${region}.`,
    netflixRent: (title: string, provider: string) => `${title} er ikke inkluderet i abonnement, men kan lejes på ${provider}.`,
    netflixNone: "Tilgængelighed varierer. Tjek logflix.app for opdateret info.",
    providerStream: (title: string, provider: string) => `Du kan streame ${title} på ${provider}.`,
    providerRent: (title: string, provider: string) => `${title} kan lejes på ${provider}.`,
    providerNone: (title: string) => `Vi har ikke fundet streamingtilbud for ${title} endnu.`,
    siteDescription: "Find noget at se sammen. Swipe hver for sig, match på det I begge vil se.",
    home: "Hjem",
    movies: "Film",
    series: "Serier",
  },
  fi: {
    streaming: "Suoratoisto maassa",
    included: "Sisältyy tilaukseen",
    rent: "Vuokraa",
    buy: "Osta",
    seeAll: "Näytä kaikki vaihtoehdot",
    otherCountries: "muissa Pohjoismaissa",
    originaltitle: "Alkuperäinen nimi",
    mood: "Tunnelma",
    ctaTitle: (title: string) => `Kirjaa ja seuraa ${title} kirjastossasi`,
    ctaBody: "Pidä kirjaa katsomistasi, luo listoja ja saa henkilökohtaisia suosituksia.",
    ctaButton: "Aloita — ilmaiseksi",
    metaTitle: (title: string, region: string) => `${title} – Suoratoisto maassa ${region} | Logflix`,
    metaDesc: (title: string, region: string) => `Katso mistä voit katsoa ${title} maassa ${region}.`,
    metaDescFallback: (title: string, region: string) => `Katso mistä voit katsoa ${title} maassa ${region}. Löydä suoratoistopalvelut ja suositukset Logflixistä.`,
    faqQ1: (title: string) => `Mistä voin katsoa ${title}?`,
    faqQ2: (title: string, region: string) => `Onko ${title} saatavilla Netflixissä maassa ${region}?`,
    faqQ3: (title: string) => `Onko ${title} katsomisen arvoinen?`,
    faqQ4: "Miten löydän elokuvan josta molemmat pitävät?",
    faqA4: "Logflix Se Sammen -toiminnolla voit yhdistää tilisi ystävän tai kumppanin kanssa. Selaat erikseen ja Logflix löytää elokuvan josta molemmat pitävät — ei väittelyä, vain täsmäys.",
    netflixYes: (title: string, region: string) => `Kyllä, ${title} on saatavilla Netflixissä maassa ${region}.`,
    netflixNo: (title: string, provider: string, region: string) => `Ei, mutta voit katsoa ${title} palvelussa ${provider} maassa ${region}.`,
    netflixRent: (title: string, provider: string) => `${title} ei sisälly tilaukseen, mutta sen voi vuokrata palvelusta ${provider}.`,
    netflixNone: "Saatavuus vaihtelee. Tarkista logflix.app ajantasaisen tiedon saamiseksi.",
    providerStream: (title: string, provider: string) => `Voit katsoa ${title} palvelussa ${provider}.`,
    providerRent: (title: string, provider: string) => `${title} on vuokrattavissa palvelusta ${provider}.`,
    providerNone: (title: string) => `Emme ole löytäneet suoratoistopalveluita kohteelle ${title} vielä.`,
    siteDescription: "Löydä jotain katsottavaa yhdessä. Selaa erikseen, löydä yhteinen valinta.",
    home: "Koti",
    movies: "Elokuvat",
    series: "Sarjat",
  },
  se: {
    streaming: "Streaming i",
    included: "Ingår i prenumeration",
    rent: "Hyr",
    buy: "Köp",
    seeAll: "Se alla alternativ",
    otherCountries: "i andra nordiska länder",
    originaltitle: "Originaltitel",
    mood: "Stämning",
    ctaTitle: (title: string) => `Logga och följ ${title} i ditt bibliotek`,
    ctaBody: "Håll koll på vad du har sett, skapa listor och få personliga rekommendationer.",
    ctaButton: "Kom igång — gratis",
    metaTitle: (title: string, region: string) => `${title} – Streaming i ${region} | Logflix`,
    metaDesc: (title: string, region: string) => `Se var du kan streama ${title} i ${region}.`,
    metaDescFallback: (title: string, region: string) => `Se var du kan streama ${title} i ${region}. Hitta streamingtjänster, rekommendationer och mer på Logflix.`,
    faqQ1: (title: string) => `Var kan jag se ${title}?`,
    faqQ2: (title: string, region: string) => `Är ${title} tillgänglig på Netflix i ${region}?`,
    faqQ3: (title: string) => `Är ${title} värd att se?`,
    faqQ4: "Hur hittar vi en film vi båda vill se?",
    faqA4: "Med Logflix Se Sammen kan du koppla ihop dig med en vän eller partner. Ni swipear var för sig och Logflix hittar filmen ni båda vill se — ingen diskussion, bara match.",
    netflixYes: (title: string, region: string) => `Ja, ${title} är tillgänglig på Netflix i ${region}.`,
    netflixNo: (title: string, provider: string, region: string) => `Nej, men du kan se ${title} på ${provider} i ${region}.`,
    netflixRent: (title: string, provider: string) => `${title} ingår inte i prenumeration men kan hyras på ${provider}.`,
    netflixNone: "Tillgänglighet varierar. Kolla logflix.app för uppdaterad info.",
    providerStream: (title: string, provider: string) => `Du kan streama ${title} på ${provider}.`,
    providerRent: (title: string, provider: string) => `${title} kan hyras på ${provider}.`,
    providerNone: (title: string) => `Vi har inte hittat streamingtjänster för ${title} än.`,
    siteDescription: "Hitta något att se tillsammans. Swipa var för sig, matcha på det ni båda vill se.",
    home: "Hem",
    movies: "Filmer",
    series: "Serier",
  },
};

export type RegionTextKey = keyof typeof REGION_TEXT;

/* ── Helpers ──────────────────────────────────────────── */

function tmdbImg(path: string | null, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function resolveT(region: string) {
  return REGION_TEXT[region as RegionTextKey] ?? REGION_TEXT.no;
}

function buildNetflixAnswer(
  title: string,
  region: string,
  providers: WatchProviderData | null,
): string {
  const t = resolveT(region);
  const regionName = REGION_NAME[region] || region.toUpperCase();
  const flatrate = providers?.flatrate || [];

  const netflix = flatrate.find((p) =>
    p.provider_name.toLowerCase().includes("netflix"),
  );
  if (netflix) {
    return t.netflixYes(title, regionName);
  }

  if (flatrate.length > 0) {
    return t.netflixNo(title, flatrate[0].provider_name, regionName);
  }

  const rent = providers?.rent || [];
  if (rent.length > 0) {
    return t.netflixRent(title, rent[0].provider_name);
  }

  return t.netflixNone;
}

function buildProviderAnswer(
  title: string,
  region: string,
  providers: WatchProviderData | null,
): string {
  const t = resolveT(region);
  const flatrate = providers?.flatrate || [];

  if (flatrate.length > 0) {
    const names = flatrate.slice(0, 3).map((p) => p.provider_name).join(", ");
    return t.providerStream(title, names);
  }

  const rent = providers?.rent || [];
  if (rent.length > 0) {
    const names = rent.slice(0, 3).map((p) => p.provider_name).join(", ");
    return t.providerRent(title, names);
  }

  return t.providerNone(title);
}

function buildFaqSchema(props: TitlePageProps) {
  const { title, region, providers, curatorHook, curatorVerdict } = props;
  const t = resolveT(region);
  const regionName = REGION_NAME[region] || region.toUpperCase();

  const questions: { q: string; a: string }[] = [
    {
      q: t.faqQ1(title),
      a: buildProviderAnswer(title, region, providers),
    },
    {
      q: t.faqQ2(title, regionName),
      a: buildNetflixAnswer(title, region, providers),
    },
  ];

  if (curatorHook && curatorVerdict) {
    questions.push({
      q: t.faqQ3(title),
      a: `${curatorHook} ${curatorVerdict}`,
    });
  }

  questions.push({
    q: t.faqQ4,
    a: t.faqA4,
  });

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
  const t = REGION_TEXT[region as RegionTextKey] ?? REGION_TEXT.no;
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

      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t.home, item: "https://logflix.app" },
              { "@type": "ListItem", position: 2, name: type === "movie" ? t.movies : t.series, item: "https://logflix.app/search" },
              { "@type": "ListItem", position: 3, name: title },
            ],
          }),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-white/40">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-white/70 transition-colors">{t.home}</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/search" className="hover:text-white/70 transition-colors">{type === "movie" ? t.movies : t.series}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-white/60 truncate max-w-[200px]">{title}</li>
          </ol>
        </nav>

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
                  {t.originaltitle}: {originalTitle}
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
        <section className="mb-8 rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(30px)" }}>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">
            {t.streaming} {regionName}
          </h2>
          {flatrate.length > 0 || rent.length > 0 || buy.length > 0 ? (
            <>
              <div className="space-y-4">
                <ProviderSection label={t.included} providers={flatrate} />
                <ProviderSection label={t.rent} providers={rent} />
                <ProviderSection label={t.buy} providers={buy} />
              </div>
              {providers?.link && (
                <a
                  href={providers.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  {t.seeAll} &rarr;
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-white/40">
              {REGION_UNAVAILABLE_TEXT[region] ?? "Not available on streaming services yet."}
            </p>
          )}
        </section>

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
              {t.mood}
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
            {title} {t.otherCountries}
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
            {t.ctaTitle(title)}
          </h2>
          <p className="mb-4 text-sm text-white/50">
            {t.ctaBody}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#E50914" }}
          >
            {t.ctaButton}
          </Link>
        </section>
      </div>
    </>
  );
}
