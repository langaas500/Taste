"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import StreamingModal from "@/components/StreamingModal";
import { logTitle } from "@/lib/api";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import { prefetchNetflixIds } from "@/lib/prefetch-netflix-ids";
import type { UserTitle, TitleCache, MediaType, Recommendation } from "@/lib/types";

/* ── locale strings ─────────────────────────────────────── */

const strings = {
  no: {
    title: "Hjem",
    titlesInCollection: "titler i samlingen din",
    titleSingular: "tittel",
    togetherLabel: "Se Sammen",
    togetherHeadline: "Finn noe å se i kveld",
    togetherSub: "Match med en venn på under 3 minutter",
    togetherFree: "✓ Gratis",
    togetherTime: "✓ Under 3 min",
    togetherCta: "Finn en match",
    importTitle: "Importer seerhistorikk",
    importSub: "Hent inn det du allerede har sett fra Netflix og andre tjenester",
    continueWatching: "Fortsett å se",
    forDeg: "For deg",
    recentlyLogged: "Nylig logget",
    trending: "Populært nå",
    seeAll: "Se alle",
    watched: "Sett og likte",
    watchlist: "Legg i se-liste",
    liked: "Sett",
    disliked: "Mislikte",
    watchlistAction: "Se-liste",
  },
  en: {
    title: "Home",
    titlesInCollection: "titles in your collection",
    titleSingular: "title",
    togetherLabel: "Watch Together",
    togetherHeadline: "Find something to watch tonight",
    togetherSub: "Match with a friend in under 3 minutes",
    togetherFree: "✓ Free",
    togetherTime: "✓ Under 3 min",
    togetherCta: "Find a match",
    importTitle: "Import watch history",
    importSub: "Import what you've already watched from Netflix and other services",
    continueWatching: "Continue watching",
    forDeg: "For You",
    recentlyLogged: "Recently logged",
    trending: "Trending now",
    seeAll: "See all",
    watched: "Watched & liked",
    watchlist: "Add to watchlist",
    liked: "Watched",
    disliked: "Disliked",
    watchlistAction: "Watchlist",
  },
} as const;

type Locale = "no" | "en";

function getLocale(region: string): Locale {
  return region === "NO" ? "no" : "en";
}

/* ── types ─────────────────────────────────────────────── */

interface DashboardData {
  watching: (UserTitle & { cache?: TitleCache })[];
  recentlyLogged: (UserTitle & { cache?: TitleCache })[];
  recommendations: Recommendation[];
  trending: { tmdb_id: number; type: MediaType; title: string; poster_path: string | null; year: string }[];
  totalTitles: number;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [locale, setLocale] = useState<Locale>("no");

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) setLocale(getLocale(data.region));
      })
      .catch(() => {});
  }, []);

  const s = strings[locale];

  async function loadDashboard() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Parallel data fetching
    const [titlesRes, trendingRes] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      fetch("/api/tmdb/discover?type=movie&sort_by=popularity.desc&page=1").then((r) => r.json()).catch(() => ({ results: [] })),
    ]);

    const userTitles = (titlesRes.data || []) as UserTitle[];
    const cacheMap = await fetchCacheForTitles(supabase, userTitles.map((t) => ({ tmdb_id: t.tmdb_id, type: t.type })));

    const allTitles = userTitles.map((t) => ({
      ...t,
      cache: cacheMap.get(`${t.tmdb_id}:${t.type}`),
    }));

    const watching = allTitles.filter((t) => t.status === "watching");
    const recentlyLogged = allTitles.filter((t) => t.status === "watched").slice(0, 7);

    const trendingItems = ((trendingRes.results || []) as Record<string, unknown>[])
      .filter((r) => r.poster_path)
      .slice(0, 7)
      .map((r) => ({
        tmdb_id: r.id as number,
        type: "movie" as MediaType,
        title: (r.title || r.name) as string,
        poster_path: r.poster_path as string,
        year: ((r.release_date || r.first_air_date) as string || "").slice(0, 4),
      }));

    setData({
      watching,
      recentlyLogged,
      recommendations: [],
      trending: trendingItems,
      totalTitles: allTitles.length,
    });
    setLoading(false);

    // Prefetch Netflix IDs for watching titles (best-effort)
    const prefetchItems = watching.map((t) => ({ id: t.tmdb_id, type: t.type }));
    if (prefetchItems.length > 0) prefetchNetflixIds(prefetchItems);
  }

  async function handleQuickAction(tmdb_id: number, type: MediaType, action: string) {
    try {
      if (action === "watchlist") {
        await logTitle({ tmdb_id, type, status: "watchlist" });
      } else if (action === "liked") {
        await logTitle({ tmdb_id, type, status: "watched", sentiment: "liked" });
      }
    } catch {
      // Silent fail for quick actions
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in-up space-y-10">
        <div>
          <div className="skeleton h-8 w-48 rounded-lg mb-2" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton h-5 w-32 rounded mb-4" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[130px]">
                  <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                  <div className="skeleton h-3 w-20 mt-2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const showImportBanner = data.totalTitles < 20;

  return (
    <div className="animate-fade-in-up space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {s.title}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
          {data.totalTitles} {data.totalTitles === 1 ? s.titleSingular : s.titlesInCollection}
        </p>
      </div>

      {/* Se Sammen */}
      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-3">
        {/* Logo */}
        <div className="flex-shrink-0 w-56 h-56 sm:w-64 sm:h-64 relative mx-auto md:mx-0" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }}>
          <Image
            src="/se-sammen-logo.png"
            alt={s.togetherLabel}
            fill
            className="object-contain"
          />
        </div>

        {/* Glassboks */}
        <Link
          href="/together"
          className="flex-1 glass rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)]/40 transition-all"
          style={{ boxShadow: "0 0 24px rgba(255,42,42,0.08)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 p-5 sm:p-6">
            <div className="flex-1 space-y-3">
              <p className="font-bold text-xs sm:text-sm text-[var(--accent-light)] uppercase tracking-wide">{s.togetherLabel}</p>
              <h2 className="font-extrabold text-xl sm:text-2xl text-white leading-tight">{s.togetherHeadline}</h2>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{s.togetherSub}</p>
              <div className="flex gap-2.5">
                <span className="text-[11px] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full">{s.togetherFree}</span>
                <span className="text-[11px] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full">{s.togetherTime}</span>
              </div>
            </div>
            <div className="button flex-shrink-0 self-center">
              {s.togetherCta}
            </div>
          </div>
        </Link>
      </div>

      {/* Import banner for new users */}
      {showImportBanner && (
        <Link
          href="/timemachine"
          className="block glass rounded-[var(--radius-lg)] p-4 border border-[var(--accent)]/20 hover:border-[var(--accent)]/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{s.importTitle}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{s.importSub}</p>
            </div>
            <svg className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      )}

      {/* Section: Fortsett å se (Watch Bank) */}
      {data.watching.length > 0 && (
        <DashboardSection title={s.continueWatching} href="/watch-bank" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.watching.map((t) => (
              <PosterCard
                key={`w-${t.tmdb_id}:${t.type}`}
                title={t.cache?.title || `TMDB:${t.tmdb_id}`}
                posterPath={t.cache?.poster_path || null}
                subtitle={t.last_season && t.last_episode ? `S${t.last_season} E${t.last_episode}` : undefined}
                onClick={() => setSelectedItem({
                  id: t.tmdb_id,
                  type: t.type,
                  title: t.cache?.title || `TMDB:${t.tmdb_id}`,
                  poster_path: t.cache?.poster_path || null,
                })}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Section: For deg (Recommendations) */}
      {data.recommendations.length > 0 && (
        <DashboardSection title={s.forDeg} href="/recommendations" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.recommendations.map((rec) => (
              <PosterCard
                key={`r-${rec.tmdb_id}:${rec.type}`}
                title={rec.title}
                posterPath={rec.poster_path || null}
                subtitle={rec.tags?.[0]}
                onClick={() => setSelectedItem({
                  id: rec.tmdb_id,
                  type: rec.type,
                  title: rec.title,
                  poster_path: rec.poster_path || null,
                })}
                quickActions={[
                  { label: "+", action: "liked", title: s.watched },
                  { label: "Se", action: "watchlist", title: s.watchlist },
                ]}
                onQuickAction={(action) => handleQuickAction(rec.tmdb_id, rec.type, action)}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Section: Nylig logget */}
      {data.recentlyLogged.length > 0 && (
        <DashboardSection title={s.recentlyLogged} href="/library" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.recentlyLogged.map((t) => (
              <PosterCard
                key={`l-${t.tmdb_id}:${t.type}`}
                title={t.cache?.title || `TMDB:${t.tmdb_id}`}
                posterPath={t.cache?.poster_path || null}
                sentiment={t.sentiment as "liked" | "disliked" | "neutral" | null}
                onClick={() => setSelectedItem({
                  id: t.tmdb_id,
                  type: t.type,
                  title: t.cache?.title || `TMDB:${t.tmdb_id}`,
                  poster_path: t.cache?.poster_path || null,
                })}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Section: Populært nå (Trending — always visible) */}
      {data.trending.length > 0 && (
        <DashboardSection title={s.trending} href="/search" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.trending.map((t) => (
              <PosterCard
                key={`t-${t.tmdb_id}:${t.type}`}
                title={t.title}
                posterPath={t.poster_path}
                subtitle={t.year}
                onClick={() => setSelectedItem({
                  id: t.tmdb_id,
                  type: t.type,
                  title: t.title,
                  poster_path: t.poster_path,
                })}
                quickActions={[
                  { label: "+", action: "liked", title: s.watched },
                  { label: "Se", action: "watchlist", title: s.watchlist },
                ]}
                onQuickAction={(action) => handleQuickAction(t.tmdb_id, t.type, action)}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Streaming Modal */}
      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
          actions={[
            { label: s.liked, action: "liked", variant: "green" },
            { label: s.disliked, action: "disliked", variant: "red" },
            { label: s.watchlistAction, action: "watchlist", variant: "default" },
          ]}
          onAction={(action) => handleQuickAction(selectedItem.id, selectedItem.type, action)}
        />
      )}
    </div>
  );
}

/* ── Subcomponents ── */

function DashboardSection({ title, href, seeAll, children }: { title: string; href: string; seeAll: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h2>
        <Link
          href={href}
          className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] font-medium transition-colors"
        >
          {seeAll}
        </Link>
      </div>
      {children}
    </section>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
    </div>
  );
}

function PosterCard({
  title,
  posterPath,
  subtitle,
  sentiment,
  onClick,
  quickActions,
  onQuickAction,
}: {
  title: string;
  posterPath: string | null;
  subtitle?: string;
  sentiment?: "liked" | "disliked" | "neutral" | null;
  onClick: () => void;
  quickActions?: { label: string; action: string; title: string }[];
  onQuickAction?: (action: string) => void;
}) {
  const imgSrc = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null;

  const sentimentColor =
    sentiment === "liked" ? "var(--green)" :
    sentiment === "disliked" ? "var(--red)" :
    sentiment === "neutral" ? "var(--yellow)" : null;

  return (
    <div
      className="group flex-shrink-0 w-[120px] sm:w-[140px] cursor-pointer"
      style={{ scrollSnapAlign: "start" }}
    >
      <div
        className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-300"
        onClick={onClick}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="140px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <rect x="2" y="3" width="20" height="18" rx="2" />
            </svg>
          </div>
        )}

        {/* Sentiment badge */}
        {sentimentColor && (
          <div className="absolute top-1.5 left-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentimentColor, boxShadow: `0 0 6px ${sentimentColor}` }} />
          </div>
        )}

        {/* Quick actions on hover */}
        {quickActions && quickActions.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent pt-6">
            {quickActions.map((qa) => (
              <button
                key={qa.action}
                title={qa.title}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction?.(qa.action);
                }}
                className="flex-1 py-1.5 text-[10px] font-semibold text-white/80 hover:text-white bg-white/[0.1] hover:bg-white/[0.2] rounded-lg transition-all backdrop-blur-sm"
              >
                {qa.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="text-[11px] font-medium text-white/60 leading-tight truncate group-hover:text-white/80 transition-colors">
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
