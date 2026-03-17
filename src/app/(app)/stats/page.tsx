"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

const DATE_LOCALE: Record<Locale, string> = { no: "nb-NO", en: "en-US", dk: "da-DK", se: "sv-SE", fi: "fi-FI" };

const strings: Record<Locale, {
  loading: string; pageTitle: string; emptyTitle: string; emptyDesc: string;
  search: string; importNetflix: string; watched: string; watchlist: string;
  movies: string; tvShows: string; sentiment: string; liked: string;
  neutral: string; disliked: string; unrated: string; avgRating: string;
  topGenres: string; recentlyWatched: string;
}> = {
  no: { loading: "Knuser tall...", pageTitle: "Statistikk", emptyTitle: "Ingen statistikk ennå", emptyDesc: "Logg filmer og serier for å se visningsstatistikken din. Du kan også importere seerhistorikk fra Netflix.", search: "Søk etter titler", importNetflix: "Importer fra Netflix", watched: "Sett", watchlist: "Se-liste", movies: "Filmer", tvShows: "Serier", sentiment: "Vurdering", liked: "Likte", neutral: "Nøytral", disliked: "Mislikte", unrated: "Uvurdert", avgRating: "Gjennomsnittlig vurdering", topGenres: "Toppsjangre", recentlyWatched: "Nylig sett" },
  en: { loading: "Crunching numbers...", pageTitle: "Statistics", emptyTitle: "No statistics yet", emptyDesc: "Log movies and shows to see your viewing statistics. You can also import watch history from Netflix.", search: "Search titles", importNetflix: "Import from Netflix", watched: "Watched", watchlist: "Watchlist", movies: "Movies", tvShows: "Shows", sentiment: "Sentiment", liked: "Liked", neutral: "Neutral", disliked: "Disliked", unrated: "Unrated", avgRating: "Average rating", topGenres: "Top genres", recentlyWatched: "Recently watched" },
  dk: { loading: "Knuser tal...", pageTitle: "Statistik", emptyTitle: "Ingen statistik endnu", emptyDesc: "Log film og serier for at se din visningsstatistik. Du kan også importere seerhistorik fra Netflix.", search: "Søg efter titler", importNetflix: "Importer fra Netflix", watched: "Set", watchlist: "Se-liste", movies: "Film", tvShows: "Serier", sentiment: "Vurdering", liked: "Kunne lide", neutral: "Neutral", disliked: "Kunne ikke lide", unrated: "Uvurderet", avgRating: "Gennemsnitlig vurdering", topGenres: "Topgenrer", recentlyWatched: "Senest set" },
  se: { loading: "Krossar siffror...", pageTitle: "Statistik", emptyTitle: "Ingen statistik ännu", emptyDesc: "Logga filmer och serier för att se din visningsstatistik. Du kan också importera tittarhistorik från Netflix.", search: "Sök efter titlar", importNetflix: "Importera från Netflix", watched: "Sett", watchlist: "Att se", movies: "Filmer", tvShows: "Serier", sentiment: "Omdöme", liked: "Gillade", neutral: "Neutral", disliked: "Ogillade", unrated: "Ej bedömd", avgRating: "Genomsnittligt betyg", topGenres: "Toppgenrer", recentlyWatched: "Nyligen sett" },
  fi: { loading: "Murskataan lukuja...", pageTitle: "Tilastot", emptyTitle: "Ei tilastoja vielä", emptyDesc: "Kirjaa elokuvia ja sarjoja nähdäksesi katselutilastosi. Voit myös tuoda katseluhistorian Netflixistä.", search: "Etsi nimikkeitä", importNetflix: "Tuo Netflixistä", watched: "Katsottu", watchlist: "Katselulista", movies: "Elokuvat", tvShows: "Sarjat", sentiment: "Arvio", liked: "Pidin", neutral: "Neutraali", disliked: "En pitänyt", unrated: "Arvioimaton", avgRating: "Keskimääräinen arvio", topGenres: "Suosituimmat genret", recentlyWatched: "Äskettäin katsottu" },
};

interface Stats {
  totalWatched: number;
  totalWatchlist: number;
  movies: number;
  tvShows: number;
  liked: number;
  disliked: number;
  neutral: number;
  unrated: number;
  topGenres: { name: string; count: number }[];
  recentlyWatched: { title: string; type: string; date: string }[];
  avgRating: number | null;
}

export default function StatsPage() {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ut } = await supabase.from("user_titles").select("*").eq("user_id", user.id);

    const titles = (ut || []) as UserTitle[];
    const cacheMap = await fetchCacheForTitles(supabase, titles.map((t) => ({ tmdb_id: t.tmdb_id, type: t.type })));

    const watched = titles.filter((t) => t.status === "watched");
    const watchlist = titles.filter((t) => t.status === "watchlist");

    const genreCounts = new Map<string, number>();
    for (const t of watched) {
      const c = cacheMap.get(`${t.tmdb_id}:${t.type}`);
      if (!c) continue;
      const genres = c.genres as { id: number; name: string }[];
      for (const g of genres) {
        genreCounts.set(g.name, (genreCounts.get(g.name) || 0) + 1);
      }
    }
    const topGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const rated = watched.filter((t) => t.rating != null);
    const avgRating = rated.length > 0
      ? Math.round((rated.reduce((s, t) => s + (t.rating || 0), 0) / rated.length) * 10) / 10
      : null;

    const recentlyWatched = watched
      .filter((t) => t.watched_at)
      .sort((a, b) => new Date(b.watched_at!).getTime() - new Date(a.watched_at!).getTime())
      .slice(0, 5)
      .map((t) => ({
        title: cacheMap.get(`${t.tmdb_id}:${t.type}`)?.title || `TMDB:${t.tmdb_id}`,
        type: t.type,
        date: new Date(t.watched_at!).toLocaleDateString(DATE_LOCALE[locale]),
      }));

    setStats({
      totalWatched: watched.length,
      totalWatchlist: watchlist.length,
      movies: watched.filter((t) => t.type === "movie").length,
      tvShows: watched.filter((t) => t.type === "tv").length,
      liked: watched.filter((t) => t.sentiment === "liked").length,
      disliked: watched.filter((t) => t.sentiment === "disliked").length,
      neutral: watched.filter((t) => t.sentiment === "neutral").length,
      unrated: watched.filter((t) => !t.sentiment).length,
      topGenres,
      recentlyWatched,
      avgRating,
    });
    setLoading(false);
  }

  if (loading) return <LoadingSpinner text={s.loading} />;

  if (!stats || stats.totalWatched === 0) {
    return (
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{s.pageTitle}</h2>
        <EmptyState
          title={s.emptyTitle}
          description={s.emptyDesc}
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/search">
                <GlowButton>{s.search}</GlowButton>
              </Link>
              <Link href="/timemachine" className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-hover)] transition-colors">
                {s.importNetflix}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const maxGenre = stats.topGenres[0]?.count || 1;

  const overviewCards = [
    { label: s.watched, value: stats.totalWatched, color: "text-[var(--accent-light)]" },
    { label: s.watchlist, value: stats.totalWatchlist, color: "text-[var(--yellow)]" },
    { label: s.movies, value: stats.movies, color: "text-[var(--text-primary)]" },
    { label: s.tvShows, value: stats.tvShows, color: "text-[var(--text-primary)]" },
  ];

  const sentimentBars = [
    { label: s.liked, value: stats.liked, color: "bg-[var(--green)]", textColor: "text-[var(--green)]" },
    { label: s.neutral, value: stats.neutral, color: "bg-[var(--yellow)]", textColor: "text-[var(--yellow)]" },
    { label: s.disliked, value: stats.disliked, color: "bg-[var(--red)]", textColor: "text-[var(--red)]" },
    { label: s.unrated, value: stats.unrated, color: "bg-[var(--text-tertiary)]", textColor: "text-[var(--text-tertiary)]" },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">{s.pageTitle}</h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {overviewCards.map(({ label, value, color }) => (
          <GlassCard key={label} hover={false} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Sentiment breakdown */}
      <GlassCard hover={false} className="p-5 mb-4">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
          {s.sentiment}
        </h3>
        <div className="flex gap-4">
          {sentimentBars.map(({ label, value, color, textColor }) => (
            <div key={label} className="flex-1 text-center">
              <div className="h-20 flex items-end justify-center mb-2">
                <div
                  className={`w-8 rounded-t-[var(--radius-sm)] ${color} transition-all duration-500`}
                  style={{ height: `${stats.totalWatched > 0 ? (value / stats.totalWatched) * 100 : 0}%`, minHeight: value > 0 ? "4px" : "0" }}
                />
              </div>
              <p className={`text-lg font-bold ${textColor}`}>{value}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
        {stats.avgRating && (
          <p className="text-sm text-[var(--text-tertiary)] text-center mt-4 pt-4 border-t border-[var(--border)]">
            {s.avgRating}: <span className="text-[var(--text-primary)] font-semibold">{stats.avgRating}/10</span>
          </p>
        )}
      </GlassCard>

      {/* Top genres */}
      {stats.topGenres.length > 0 && (
        <GlassCard hover={false} className="p-5 mb-4">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
            {s.topGenres}
          </h3>
          <div className="space-y-3">
            {stats.topGenres.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs w-20 text-right text-[var(--text-secondary)] font-medium">{name}</span>
                <div className="flex-1 h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxGenre) * 100}%` }}
                  />
                </div>
                <span className="text-xs w-6 text-[var(--text-tertiary)] font-medium">{count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Recently watched */}
      {stats.recentlyWatched.length > 0 && (
        <GlassCard hover={false} className="p-5">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
            Nylig sett
          </h3>
          <div className="space-y-2.5">
            {stats.recentlyWatched.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm text-[var(--text-primary)] font-medium">{item.title}</span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
                  {item.type} &middot; {item.date}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
