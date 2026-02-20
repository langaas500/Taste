"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import GlassCard from "@/components/GlassCard";
import type { UserTitle } from "@/lib/types";

/* ── locale strings ─────────────────────────────────────── */

const strings = {
  no: {
    title: "Profil",
    tasteProfile: "Smaksprofil",
    stats: "Statistikk",
    youLike: "Du liker",
    avoid: "Du unngår",
    tempoTone: "Tempo & tone",
    generateTaste: "Generer smaksprofil",
    noTaste: "Ingen smaksprofil ennå",
    noTasteSub: "Legg til noen sette titler i biblioteket for å generere en analyse.",
    filmLover: "Filmelsker",
    generating: "Genererer...",
    vurdering: "Vurdering",
    toppsjangre: "Toppsjangre",
    sett: "Sett",
    seliste: "Se-liste",
    filmer: "Filmer",
    serier: "Serier",
    likte: "Likte",
    noytral: "Nøytral",
    mislikte: "Mislikte",
    uvurdert: "Uvurdert",
  },
  en: {
    title: "Profile",
    tasteProfile: "Taste Profile",
    stats: "Statistics",
    youLike: "You like",
    avoid: "You avoid",
    tempoTone: "Tempo & tone",
    generateTaste: "Generate taste profile",
    noTaste: "No taste profile yet",
    noTasteSub: "Add some watched titles to your library to generate an analysis.",
    filmLover: "Film lover",
    generating: "Generating...",
    vurdering: "Rating",
    toppsjangre: "Top Genres",
    sett: "Watched",
    seliste: "Watchlist",
    filmer: "Movies",
    serier: "Series",
    likte: "Liked",
    noytral: "Neutral",
    mislikte: "Disliked",
    uvurdert: "Unrated",
  },
} as const;

type Locale = "no" | "en";

function getLocale(region: string): Locale {
  return region === "NO" ? "no" : "en";
}

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
  avgRating: number | null;
}

export default function ProfilePage() {
  const [locale, setLocale] = useState<Locale>("no");
  const [taste, setTaste] = useState<{ youLike: string; avoid: string; pacing: string } | null>(null);
  const [tasteLoading, setTasteLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) setLocale(getLocale(data.region));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
        setDisplayName(data?.display_name || null);
      }
    })();
  }, []);

  useEffect(() => {
    fetch("/api/taste-summary")
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) setTaste(data.summary);
        setTasteLoading(false);
      })
      .catch(() => setTasteLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatsLoading(false);
      return;
    }

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
      avgRating,
    });
    setStatsLoading(false);
  }

  async function handleGenerateTaste() {
    setGenerating(true);
    try {
      const res = await fetch("/api/taste-summary", { method: "POST" });
      const data = await res.json();
      if (data.summary) setTaste(data.summary);
    } catch {
      // Silent fail
    }
    setGenerating(false);
  }

  const s = strings[locale];

  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail
      ? userEmail[0].toUpperCase()
      : "?";

  const userName = displayName || userEmail?.split("@")[0] || "User";

  const maxGenre = stats?.topGenres[0]?.count || 1;

  const genreColors = [
    { bg: "bg-[#ff6b9d]", text: "text-[#ff6b9d]" },       // Soft pink
    { bg: "bg-[#c084fc]", text: "text-[#c084fc]" },       // Soft purple
    { bg: "bg-[#60a5fa]", text: "text-[#60a5fa]" },       // Soft blue
    { bg: "bg-[#34d399]", text: "text-[#34d399]" },       // Soft green
    { bg: "bg-[#fbbf24]", text: "text-[#fbbf24]" },       // Soft yellow
    { bg: "bg-[#fb923c]", text: "text-[#fb923c]" },       // Soft orange
    { bg: "bg-[#f87171]", text: "text-[#f87171]" },       // Soft red
    { bg: "bg-[#a78bfa]", text: "text-[#a78bfa]" },       // Soft lavender
  ];

  const overviewCards = [
    { label: s.sett, value: stats?.totalWatched || 0, color: "text-[var(--accent-light)]" },
    { label: s.seliste, value: stats?.totalWatchlist || 0, color: "text-[var(--yellow)]" },
    { label: s.filmer, value: stats?.movies || 0, color: "text-[var(--text-primary)]" },
    { label: s.serier, value: stats?.tvShows || 0, color: "text-[var(--text-primary)]" },
  ];

  const sentimentBars = [
    { label: s.likte, value: stats?.liked || 0, color: "bg-[var(--green)]", textColor: "text-[var(--green)]" },
    { label: s.noytral, value: stats?.neutral || 0, color: "bg-[var(--yellow)]", textColor: "text-[var(--yellow)]" },
    { label: s.mislikte, value: stats?.disliked || 0, color: "bg-[var(--red)]", textColor: "text-[var(--red)]" },
    { label: s.uvurdert, value: stats?.unrated || 0, color: "bg-[var(--text-tertiary)]", textColor: "text-[var(--text-tertiary)]" },
  ];

  return (
    <div className="animate-fade-in-up max-w-4xl">
      {/* User info header */}
      <div className="mb-8 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            background: "rgba(255,42,42,0.1)",
            border: "2px solid rgba(255,42,42,0.2)",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: "#ff2a2a" }}>{initials}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {userName}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{s.filmLover}</p>
        </div>
      </div>

      {/* Taste profile section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{s.tasteProfile}</h2>

        {tasteLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="skeleton h-4 w-20 rounded mb-3" />
                <div className="skeleton h-3 w-full rounded mb-2" />
                <div className="skeleton h-3 w-full rounded mb-2" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : !taste ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-[var(--accent)]/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <div>
                <h3 className="text-base font-semibold text-white/90 mb-1">{s.noTaste}</h3>
                <p className="text-sm text-white/40 mb-4">{s.noTasteSub}</p>
              </div>
              <button
                onClick={handleGenerateTaste}
                disabled={generating}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "#ff2a2a" }}
              >
                {generating ? s.generating : s.generateTaste}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Du liker */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <h3 className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider">
                  {s.youLike}
                </h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4">{taste.youLike}</p>
            </div>

            {/* Du unngår */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#ff2a2a]" />
                <h3 className="text-xs font-semibold text-[#ff2a2a] uppercase tracking-wider">
                  {s.avoid}
                </h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4">{taste.avoid}</p>
            </div>

            {/* Tempo & tone */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#ff2a2a]" />
                <h3 className="text-xs font-semibold text-[#ff5757] uppercase tracking-wider">
                  {s.tempoTone}
                </h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4">{taste.pacing}</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics section */}
      {!statsLoading && stats && stats.totalWatched > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{s.stats}</h2>

          {/* Overview cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
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
              {s.vurdering}
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
                {s.toppsjangre}
              </h3>
              <div className="flex gap-3 items-end">
                {stats.topGenres.map(({ name, count }, index) => {
                  const colorSet = genreColors[index] || genreColors[genreColors.length - 1];
                  return (
                    <div key={`${name}-${index}`} className="flex-1 text-center min-w-0">
                      <div className="h-32 flex items-end justify-center mb-2">
                        <div
                          className={`w-full rounded-t-[var(--radius-sm)] ${colorSet.bg} transition-all duration-500`}
                          style={{
                            height: `${(count / maxGenre) * 100}%`,
                            minHeight: count > 0 ? "8px" : "0"
                          }}
                        />
                      </div>
                      <p className={`text-sm font-bold ${colorSet.text} mb-1`}>{count}</p>
                      <p className="text-[9px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide leading-tight break-words">
                        {name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
