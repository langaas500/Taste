import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDetails, tmdbWatchProviders } from "@/lib/tmdb";
import { parseTitleFromTMDB } from "@/lib/tmdb";
import { buildSlug, parseSlug } from "@/lib/slug";
import TitlePageContent, { REGION_TEXT, type RegionTextKey } from "@/components/TitlePageContent";
import type { WatchProviderData } from "@/lib/types";

export const revalidate = 86400; // 24h ISR

/* ── Region config ────────────────────────────────────── */

const VALID_REGIONS = ["no", "dk", "fi", "se"] as const;

const REGION_NAME: Record<string, string> = {
  no: "Norge", dk: "Danmark", fi: "Finland", se: "Sverige",
};

const REGION_HREFLANG: Record<string, string> = {
  no: "nb", dk: "da", fi: "fi", se: "sv",
};

const REGION_COUNTRY: Record<string, string> = {
  no: "NO", dk: "DK", fi: "FI", se: "SE",
};

type Params = { region: string; slug: string };

/* ── Data fetching ────────────────────────────────────── */

async function fetchTitleData(slug: string) {
  const tmdbId = parseSlug(slug);
  if (!tmdbId) return null;

  const admin = createSupabaseAdmin();

  // Try DB first
  const { data: cached } = await admin
    .from("titles_cache")
    .select("*")
    .eq("tmdb_id", tmdbId)
    .eq("type", "tv")
    .single();

  if (cached) return cached;

  // Fallback: fetch from TMDB and cache
  try {
    const raw = await tmdbDetails(tmdbId, "tv", "credits");
    const parsed = parseTitleFromTMDB(raw, "tv");
    const newSlug = buildSlug(parsed.title, tmdbId);

    await admin.from("titles_cache").upsert(
      {
        ...parsed,
        tmdb_payload: raw,
        slug: newSlug,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tmdb_id,type" },
    );

    return { ...parsed, slug: newSlug, tmdb_payload: raw, curator_hook: null, curator_body: null, curator_verdict: null, mood_tags: null };
  } catch {
    return null;
  }
}

async function fetchProviders(tmdbId: number, country: string): Promise<WatchProviderData | null> {
  const admin = createSupabaseAdmin();

  // Try cache
  const { data: cached } = await admin
    .from("watch_providers_cache")
    .select("providers")
    .eq("tmdb_id", tmdbId)
    .eq("type", "tv")
    .eq("country", country)
    .single();

  if (cached?.providers) return cached.providers as WatchProviderData;

  // Fetch from TMDB
  try {
    const res = await tmdbWatchProviders(tmdbId, "tv");
    const regionData = res.results?.[country] || null;

    if (regionData) {
      await admin.from("watch_providers_cache").upsert(
        { tmdb_id: tmdbId, type: "tv", country, providers: regionData, cached_at: new Date().toISOString() },
        { onConflict: "tmdb_id,type,country" },
      );
    }

    return regionData;
  } catch {
    return null;
  }
}

/* ── Metadata ─────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { region, slug } = await params;
  if (!(VALID_REGIONS as readonly string[]).includes(region)) return {};

  const title = await fetchTitleData(slug);
  if (!title) return {};

  const regionName = REGION_NAME[region];
  const t = REGION_TEXT[region as RegionTextKey] ?? REGION_TEXT.no;
  const displayTitle = `${title.title}${title.year ? ` (${title.year})` : ""}`;
  const pageTitle = t.metaTitle(displayTitle, regionName);
  const description = title.overview
    ? `${t.metaDesc(title.title, regionName)} ${title.overview.slice(0, 140)}...`
    : t.metaDescFallback(title.title, regionName);

  const canonical = `https://logflix.app/${region}/tv/${title.slug || slug}`;

  const alternates: Record<string, string> = {};
  for (const r of VALID_REGIONS) {
    alternates[REGION_HREFLANG[r]] = `https://logflix.app/${r}/tv/${title.slug || slug}`;
  }
  alternates["x-default"] = `https://logflix.app/no/tv/${title.slug || slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      type: "video.tv_show",
      images: title.poster_path
        ? [`https://image.tmdb.org/t/p/w780${title.poster_path}`]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: description.slice(0, 200),
    },
  };
}

/* ── Static params (top 100 per region) ───────────────── */

export async function generateStaticParams() {
  const admin = createSupabaseAdmin();
  const params: Params[] = [];

  for (const region of VALID_REGIONS) {
    const country = REGION_COUNTRY[region];

    // Fetch provider tmdb_ids for this region first
    const { data: provRows } = await admin
      .from("watch_providers_cache")
      .select("tmdb_id")
      .eq("type", "tv")
      .eq("country", country);

    const provIds = (provRows || []).map((r: { tmdb_id: number }) => r.tmdb_id);
    if (provIds.length === 0) continue;

    const { data: titles } = await admin
      .from("titles_cache")
      .select("slug")
      .eq("type", "tv")
      .not("slug", "is", null)
      .in("tmdb_id", provIds)
      .order("popularity", { ascending: false })
      .limit(100);

    for (const t of titles || []) {
      if (t.slug) params.push({ region, slug: t.slug });
    }
  }

  return params;
}

/* ── Page ─────────────────────────────────────────────── */

export default async function TvPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { region, slug } = await params;
  if (!(VALID_REGIONS as readonly string[]).includes(region)) notFound();

  const title = await fetchTitleData(slug);
  if (!title) notFound();

  const country = REGION_COUNTRY[region] || "NO";
  const providers = await fetchProviders(title.tmdb_id, country);

  // Extract tagline from tmdb_payload if available
  const tagline = (title.tmdb_payload as Record<string, unknown>)?.tagline as string | null ?? null;

  // Ensure genres are { id, name } objects
  const genres = Array.isArray(title.genres)
    ? title.genres.filter((g: unknown): g is { id: number; name: string } =>
        typeof g === "object" && g !== null && "name" in g,
      )
    : [];

  return (
    <TitlePageContent
      title={title.title}
      originalTitle={title.original_title}
      year={title.year}
      overview={title.overview}
      tagline={tagline}
      posterPath={title.poster_path}
      backdropPath={title.backdrop_path}
      genres={genres}
      voteAverage={title.vote_average}
      type="tv"
      tmdbId={title.tmdb_id}
      slug={title.slug || slug}
      region={region}
      providers={providers}
      curatorHook={title.curator_hook ?? null}
      curatorBody={title.curator_body ?? null}
      curatorVerdict={title.curator_verdict ?? null}
      moodTags={title.mood_tags ?? null}
    />
  );
}
