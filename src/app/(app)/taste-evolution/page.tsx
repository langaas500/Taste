"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import LoadingSpinner from "@/components/LoadingSpinner";
import { track } from "@/lib/posthog";

/* ── i18n ─────────────────────────────────────────── */

const t = {
  no: {
    title: "Din smaksreise", sub: "Se hvordan filmsmaken din har utviklet seg.",
    loading: "Analyserer smaksutviklingen din...",
    insufficient: "Du trenger minst 5 loggede titler for å se smaksutviklingen din.",
    logMore: "Logg flere titler →",
    totalLogged: (n: number) => `${n} titler logget`,
    movies: "Filmer", series: "Serier",
    liked: "Likte", neutral: "Nøytral", disliked: "Mislikte",
    avgRating: "Snittrating", tempo: "Seertempo", perMonth: "/mnd",
    genres: "Sjangre", decades: "Tiår",
    directors: "Dine regissører", actors: "Dine skuespillere",
    countries: (n: number) => `Filmer fra ${n} land`,
    moods: "Din stemning",
    milestones: "Milepæler",
    firstTitle: "Det startet med", genreFirst: (g: string) => `Første ${g}!`,
    titleCount: (n: number) => `${n}. tittel logget!`, streak: (n: number) => `${n} dager på rad!`,
    share: "Del din filmsmak",
    shareText: "Min filmsmak på Logflix",
    aiLabel: "Curator sier:",
    premiumAi: "Oppgrader for AI-innsikt →",
    period: { "0-3m": "Siste 3 mnd", "3-6m": "3–6 mnd", "6-12m": "6–12 mnd", "12m+": "12+ mnd" },
  },
  en: {
    title: "Your taste journey", sub: "See how your taste in film has evolved.",
    loading: "Analyzing your taste evolution...",
    insufficient: "You need at least 5 logged titles to see your taste evolution.",
    logMore: "Log more titles →",
    totalLogged: (n: number) => `${n} titles logged`,
    movies: "Movies", series: "Series",
    liked: "Liked", neutral: "Neutral", disliked: "Disliked",
    avgRating: "Avg rating", tempo: "Watch tempo", perMonth: "/mo",
    genres: "Genres", decades: "Decades",
    directors: "Your directors", actors: "Your actors",
    countries: (n: number) => `Films from ${n} countries`,
    moods: "Your mood",
    milestones: "Milestones",
    firstTitle: "It all started with", genreFirst: (g: string) => `First ${g}!`,
    titleCount: (n: number) => `${n}th title logged!`, streak: (n: number) => `${n}-day streak!`,
    share: "Share your film taste",
    shareText: "My film taste on Logflix",
    aiLabel: "Curator says:",
    premiumAi: "Upgrade for AI insight →",
    period: { "0-3m": "Last 3 mo", "3-6m": "3–6 mo", "6-12m": "6–12 mo", "12m+": "12+ mo" },
  },
  dk: {
    title: "Din smagsrejse", sub: "Se hvordan din filmsmag har udviklet sig.",
    loading: "Analyserer din smagsudvikling...",
    insufficient: "Du har brug for mindst 5 loggede titler.", logMore: "Log flere titler →",
    totalLogged: (n: number) => `${n} titler logget`, movies: "Film", series: "Serier",
    liked: "Liked", neutral: "Neutral", disliked: "Disliked",
    avgRating: "Gns rating", tempo: "Seetempo", perMonth: "/md",
    genres: "Genrer", decades: "Årtier",
    directors: "Dine instruktører", actors: "Dine skuespillere",
    countries: (n: number) => `Film fra ${n} lande`, moods: "Din stemning",
    milestones: "Milepæle", firstTitle: "Det startede med",
    genreFirst: (g: string) => `Første ${g}!`, titleCount: (n: number) => `${n}. titel logget!`,
    streak: (n: number) => `${n} dage i træk!`, share: "Del din filmsmag",
    shareText: "Min filmsmag på Logflix", aiLabel: "Curator siger:", premiumAi: "Opgrader for AI-indsigt →",
    period: { "0-3m": "Sidste 3 md", "3-6m": "3–6 md", "6-12m": "6–12 md", "12m+": "12+ md" },
  },
  se: {
    title: "Din smakresa", sub: "Se hur din filmsmak har utvecklats.",
    loading: "Analyserar din smakutveckling...",
    insufficient: "Du behöver minst 5 loggade titlar.", logMore: "Logga fler titlar →",
    totalLogged: (n: number) => `${n} titlar loggade`, movies: "Filmer", series: "Serier",
    liked: "Gillade", neutral: "Neutral", disliked: "Ogillade",
    avgRating: "Snittbetyg", tempo: "Tittartempo", perMonth: "/mån",
    genres: "Genrer", decades: "Årtionden",
    directors: "Dina regissörer", actors: "Dina skådespelare",
    countries: (n: number) => `Film från ${n} länder`, moods: "Din stämning",
    milestones: "Milstolpar", firstTitle: "Det började med",
    genreFirst: (g: string) => `Första ${g}!`, titleCount: (n: number) => `${n}:e titeln loggad!`,
    streak: (n: number) => `${n} dagar i rad!`, share: "Dela din filmsmak",
    shareText: "Min filmsmak på Logflix", aiLabel: "Curator säger:", premiumAi: "Uppgradera för AI-insikt →",
    period: { "0-3m": "Senaste 3 mån", "3-6m": "3–6 mån", "6-12m": "6–12 mån", "12m+": "12+ mån" },
  },
  fi: {
    title: "Makumatkasi", sub: "Katso miten elokuvamaustusi on kehittynyt.",
    loading: "Analysoidaan makukehitystäsi...",
    insufficient: "Tarvitset vähintään 5 kirjattua nimikettä.", logMore: "Kirjaa lisää →",
    totalLogged: (n: number) => `${n} nimikettä kirjattu`, movies: "Elokuvat", series: "Sarjat",
    liked: "Pidetty", neutral: "Neutraali", disliked: "Ei pidetty",
    avgRating: "Ka arvosana", tempo: "Katselutahti", perMonth: "/kk",
    genres: "Genret", decades: "Vuosikymmenet",
    directors: "Ohjaajasi", actors: "Näyttelijäsi",
    countries: (n: number) => `Elokuvia ${n} maasta`, moods: "Tunnelmasi",
    milestones: "Virstanpylväät", firstTitle: "Kaikki alkoi nimikkeestä",
    genreFirst: (g: string) => `Ensimmäinen ${g}!`, titleCount: (n: number) => `${n}. nimike kirjattu!`,
    streak: (n: number) => `${n} päivää putkeen!`, share: "Jaa elokuvamausi",
    shareText: "Elokuvamauni Logflixissä", aiLabel: "Curator sanoo:", premiumAi: "Päivitä AI-näkemystä varten →",
    period: { "0-3m": "Viim 3 kk", "3-6m": "3–6 kk", "6-12m": "6–12 kk", "12m+": "12+ kk" },
  },
} as const;

/* ── Colors ───────────────────────────────────────── */

const GC: Record<string, string> = {
  Action: "#ff4444", Drama: "#9b59b6", Comedy: "#f1c40f", Thriller: "#e67e22",
  Horror: "#c0392b", Romance: "#e91e63", "Science Fiction": "#3498db", Adventure: "#2ecc71",
  Animation: "#1abc9c", Crime: "#795548", Fantasy: "#8e44ad", Documentary: "#607d8b",
  Mystery: "#5c6bc0", War: "#78909c", Music: "#ff9800", Family: "#4caf50",
  History: "#8d6e63", Western: "#a1887f",
};
const gc = (name: string) => GC[name] || "#666";

/* ── Types ────────────────────────────────────────── */

interface EvData {
  insufficient: boolean; count?: number; totalTitles: number;
  movieCount: number; tvCount: number;
  likedCount: number; neutralCount: number; dislikedCount: number;
  avgRating: number | null; titlesPerMonth: number;
  genreBreakdown: { name: string; count: number; pct: number }[];
  decadeBreakdown: { decade: string; count: number; pct: number }[];
  topDirectors: { name: string; count: number }[];
  topActors: { name: string; count: number }[];
  countryCount: number; topMoods: string[];
  milestones: { icon: string; text: string }[];
  periods: { label: string; titleCount: number; topGenres: { name: string; pct: number }[] }[];
  posters: string[]; aiInsight: string | null; isPremium: boolean;
}

/* ── Component ────────────────────────────────────── */

const glass = "rounded-2xl border border-white/[0.06] backdrop-blur-md";
const glassStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)" };

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", flex: 1 }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={`${glass} p-4`} style={glassStyle}>
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function TasteEvolutionPage() {
  const locale = useLocale();
  const s = t[locale as keyof typeof t] ?? t.en;
  const [data, setData] = useState<EvData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/taste-evolution")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner /><p className="text-sm text-white/40">{s.loading}</p>
    </div>
  );

  if (!data || data.insufficient) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">{s.title}</h1>
      <p className="text-white/50 mb-6">{s.insufficient}</p>
      <Link href="/search" className="text-sm font-semibold" style={{ color: "#ff2a2a" }}>{s.logMore}</Link>
    </div>
  );

  const d = data;
  const moviePct = d.totalTitles > 0 ? Math.round((d.movieCount / d.totalTitles) * 100) : 0;

  async function handleShare() {
    track("taste_evolution_shared");
    const text = `${s.shareText}\n\n${d.genreBreakdown.slice(0, 3).map((g) => `${g.name} ${g.pct}%`).join(" · ")}\n${d.totalTitles} titles · ${d.topDirectors[0]?.name ?? ""}\n\nlogflix.app/taste-evolution`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  function renderMilestone(m: { icon: string; text: string }) {
    const [type, ...rest] = m.text.split(":");
    if (type === "first") return <span>{s.firstTitle} <strong className="text-white">{rest[0]}</strong></span>;
    if (type === "genre") return <span>{s.genreFirst(rest[0])} <span className="text-white/40">({rest[1]})</span></span>;
    if (type === "count") return <span>{s.titleCount(parseInt(rest[0]))}</span>;
    if (type === "streak") return <span>{s.streak(parseInt(rest[0]))}</span>;
    return <span>{m.text}</span>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Poster mosaic header */}
      {d.posters.length > 0 && (
        <div className="relative h-28 rounded-2xl overflow-hidden mb-6">
          <div className="flex gap-1 h-full">
            {d.posters.slice(0, 8).map((p, i) => (
              <div key={i} className="flex-1 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://image.tmdb.org/t/p/w185${p}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.95) 100%)" }} />
          <div className="absolute bottom-3 left-4">
            <h1 className="text-2xl font-black text-white">{s.title}</h1>
            <p className="text-xs text-white/40">{s.totalLogged(d.totalTitles)}</p>
          </div>
        </div>
      )}
      {d.posters.length === 0 && (
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">{s.title}</h1>
          <p className="text-xs text-white/40">{s.totalLogged(d.totalTitles)}</p>
        </div>
      )}

      {/* AI insight */}
      {d.aiInsight && (
        <div className={`${glass} p-4 mb-4`} style={{ ...glassStyle, borderColor: "rgba(245,200,66,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#F5C842" }}>{s.aiLabel}</p>
          <p className="text-sm text-white/70 italic leading-relaxed">{d.aiInsight}</p>
        </div>
      )}
      {!d.aiInsight && !d.isPremium && (
        <Link href="/premium" className={`block ${glass} p-3 mb-4 text-center text-xs`} style={{ ...glassStyle, color: "rgba(255,255,255,0.3)" }}>
          {s.premiumAi}
        </Link>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label={s.movies} value={`${moviePct}%`} sub={`${d.movieCount} ${s.movies.toLowerCase()}`} />
        <StatCard label={s.series} value={`${100 - moviePct}%`} sub={`${d.tvCount} ${s.series.toLowerCase()}`} />
        <StatCard label={s.tempo} value={`${d.titlesPerMonth}`} sub={s.perMonth} />
      </div>

      {/* Sentiment bar */}
      <div className={`${glass} p-4 mb-4`} style={glassStyle}>
        <div className="flex gap-4 mb-2">
          <span className="text-[10px] text-emerald-400 font-semibold">{s.liked} {d.likedCount}</span>
          <span className="text-[10px] text-yellow-400 font-semibold">{s.neutral} {d.neutralCount}</span>
          <span className="text-[10px] text-red-400 font-semibold">{s.disliked} {d.dislikedCount}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div style={{ width: `${(d.likedCount / d.totalTitles) * 100}%`, background: "#34d399" }} />
          <div style={{ width: `${(d.neutralCount / d.totalTitles) * 100}%`, background: "#fbbf24" }} />
          <div style={{ width: `${(d.dislikedCount / d.totalTitles) * 100}%`, background: "#f87171" }} />
        </div>
        {d.avgRating && (
          <p className="text-xs text-white/30 mt-2">{s.avgRating}: <span className="text-white/70 font-bold">{d.avgRating}/10</span></p>
        )}
      </div>

      {/* Genre breakdown */}
      <div className={`${glass} p-4 mb-4`} style={glassStyle}>
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3">{s.genres}</p>
        <div className="space-y-2">
          {d.genreBreakdown.slice(0, 8).map((g) => (
            <div key={g.name} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-24 truncate">{g.name}</span>
              <Bar pct={g.pct} color={gc(g.name)} />
              <span className="text-xs font-bold w-10 text-right" style={{ color: gc(g.name) }}>{g.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decade breakdown */}
      {d.decadeBreakdown.length > 1 && (
        <div className={`${glass} p-4 mb-4`} style={glassStyle}>
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3">{s.decades}</p>
          <div className="flex gap-2">
            {d.decadeBreakdown.map((dec) => (
              <div key={dec.decade} className="flex-1 text-center">
                <div className="rounded-lg mx-auto mb-1" style={{ height: `${Math.max(8, dec.pct * 0.8)}px`, background: "rgba(255,42,42,0.4)", width: "100%" }} />
                <p className="text-[10px] text-white/40">{dec.decade}</p>
                <p className="text-xs font-bold text-white/70">{dec.pct}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directors + Actors */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {d.topDirectors.length > 0 && (
          <div className={`${glass} p-4`} style={glassStyle}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">{s.directors}</p>
            {d.topDirectors.map((dir) => (
              <div key={dir.name} className="flex items-center justify-between py-1">
                <span className="text-xs text-white/70 truncate">{dir.name}</span>
                <span className="text-[10px] text-white/30 ml-2">{dir.count}×</span>
              </div>
            ))}
          </div>
        )}
        {d.topActors.length > 0 && (
          <div className={`${glass} p-4`} style={glassStyle}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">{s.actors}</p>
            {d.topActors.map((act) => (
              <div key={act.name} className="flex items-center justify-between py-1">
                <span className="text-xs text-white/70 truncate">{act.name}</span>
                <span className="text-[10px] text-white/30 ml-2">{act.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Countries + Moods */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {d.countryCount > 0 && (
          <div className={`${glass} p-4 flex items-center gap-3`} style={glassStyle}>
            <span className="text-2xl">🌍</span>
            <p className="text-sm font-semibold text-white/70">{s.countries(d.countryCount)}</p>
          </div>
        )}
        {d.topMoods.length > 0 && (
          <div className={`${glass} p-4`} style={glassStyle}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">{s.moods}</p>
            <div className="flex flex-wrap gap-1">
              {d.topMoods.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(255,42,42,0.1)", color: "rgba(255,120,120,0.9)", border: "0.5px solid rgba(255,42,42,0.2)" }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      {d.milestones.length > 0 && (
        <div className={`${glass} p-4 mb-4`} style={glassStyle}>
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3">{s.milestones}</p>
          <div className="space-y-2">
            {d.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-white/50">
                <span className="text-base flex-shrink-0">{m.icon}</span>
                {renderMilestone(m)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Periods timeline */}
      {d.periods.length > 0 && (
        <div className={`${glass} p-4 mb-4`} style={glassStyle}>
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3">Timeline</p>
          <div className="space-y-3">
            {d.periods.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70">{s.period[p.label as keyof typeof s.period] || p.label}</span>
                  <span className="text-[10px] text-white/30">{p.titleCount}</span>
                </div>
                <div className="flex gap-1.5">
                  {p.topGenres.map((g) => (
                    <span key={g.name} className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                      style={{ background: `${gc(g.name)}20`, color: gc(g.name), border: `0.5px solid ${gc(g.name)}40` }}>
                      {g.name} {g.pct}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: "#ff2a2a", cursor: "pointer", border: "none" }}
      >
        {s.share}
      </button>
    </div>
  );
}
