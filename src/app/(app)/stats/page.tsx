"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache } from "@/lib/types";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: ut }, { data: cache }] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id),
      supabase.from("titles_cache").select("*"),
    ]);

    const titles = (ut || []) as UserTitle[];
    const cacheMap = new Map<string, TitleCache>();
    for (const c of (cache || []) as TitleCache[]) {
      cacheMap.set(`${c.tmdb_id}:${c.type}`, c);
    }

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
        date: new Date(t.watched_at!).toLocaleDateString(),
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

  if (loading) return <LoadingSpinner text="Knuser tall..." />;

  if (!stats || stats.totalWatched === 0) {
    return (
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Statistikk</h2>
        <EmptyState
          title="Ingen statistikk ennå"
          description="Begynn å logge filmer og serier for å se visningsstatistikken din."
          action={
            <Link href="/search">
              <GlowButton>Søk</GlowButton>
            </Link>
          }
        />
      </div>
    );
  }

  const maxGenre = stats.topGenres[0]?.count || 1;

  const overviewCards = [
    { label: "Sett", value: stats.totalWatched, color: "text-[var(--accent-light)]" },
    { label: "Se-liste", value: stats.totalWatchlist, color: "text-[var(--yellow)]" },
    { label: "Filmer", value: stats.movies, color: "text-[var(--text-primary)]" },
    { label: "Serier", value: stats.tvShows, color: "text-[var(--text-primary)]" },
  ];

  const sentimentBars = [
    { label: "Likte", value: stats.liked, color: "bg-[var(--green)]", textColor: "text-[var(--green)]" },
    { label: "Nøytral", value: stats.neutral, color: "bg-[var(--yellow)]", textColor: "text-[var(--yellow)]" },
    { label: "Mislikte", value: stats.disliked, color: "bg-[var(--red)]", textColor: "text-[var(--red)]" },
    { label: "Uvurdert", value: stats.unrated, color: "bg-[var(--text-tertiary)]", textColor: "text-[var(--text-tertiary)]" },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Statistikk</h2>

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
          Vurdering
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
            Gjennomsnittlig vurdering: <span className="text-[var(--text-primary)] font-semibold">{stats.avgRating}/10</span>
          </p>
        )}
      </GlassCard>

      {/* Top genres */}
      {stats.topGenres.length > 0 && (
        <GlassCard hover={false} className="p-5 mb-4">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
            Toppsjangre
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
