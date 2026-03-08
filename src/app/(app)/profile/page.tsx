"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
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
    wrapped: "Se din månedsrapport",
  },
  dk: {
    title: "Profil",
    tasteProfile: "Smagsprofil",
    stats: "Statistik",
    youLike: "Du kan lide",
    avoid: "Du undgår",
    tempoTone: "Tempo & tone",
    generateTaste: "Generer smagsprofil",
    noTaste: "Ingen smagsprofil endnu",
    noTasteSub: "Tilføj nogle sete titler til dit bibliotek for at generere en analyse.",
    filmLover: "Filmelsker",
    generating: "Genererer...",
    vurdering: "Vurdering",
    toppsjangre: "Topgenrer",
    sett: "Set",
    seliste: "Se-liste",
    filmer: "Film",
    serier: "Serier",
    likte: "Kunne lide",
    noytral: "Neutral",
    mislikte: "Kunne ikke lide",
    uvurdert: "Uvurderet",
    wrapped: "Se din månedsoversigt",
  },
  fi: {
    title: "Profiili",
    tasteProfile: "Makuprofiili",
    stats: "Tilastot",
    youLike: "Pidät",
    avoid: "Vältät",
    tempoTone: "Tempo & sävy",
    generateTaste: "Luo makuprofiili",
    noTaste: "Ei makuprofiilia vielä",
    noTasteSub: "Lisää katsottuja nimikkeitä kirjastoosi luodaksesi analyysin.",
    filmLover: "Elokuvarakastaja",
    generating: "Luodaan...",
    vurdering: "Arviointi",
    toppsjangre: "Suosikkilajityypit",
    sett: "Katsottu",
    seliste: "Katselulista",
    filmer: "Elokuvat",
    serier: "Sarjat",
    likte: "Pidetty",
    noytral: "Neutraali",
    mislikte: "Ei pidetty",
    uvurdert: "Arvioimaton",
    wrapped: "Katso kuukausiraporttisi",
  },
  se: {
    title: "Profil",
    tasteProfile: "Smakprofil",
    stats: "Statistik",
    youLike: "Du gillar",
    avoid: "Du undviker",
    tempoTone: "Tempo & ton",
    generateTaste: "Generera smakprofil",
    noTaste: "Ingen smakprofil ännu",
    noTasteSub: "Lägg till några sedda titlar i ditt bibliotek för att generera en analys.",
    filmLover: "Filmälskare",
    generating: "Genererar...",
    vurdering: "Betyg",
    toppsjangre: "Toppgenrer",
    sett: "Sett",
    seliste: "Se-lista",
    filmer: "Filmer",
    serier: "Serier",
    likte: "Gillade",
    noytral: "Neutral",
    mislikte: "Ogillade",
    uvurdert: "Ej betygsatt",
    wrapped: "Se din månadsrapport",
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
    wrapped: "Monthly Wrapped",
  },
} as const;

type Locale = "no" | "dk" | "fi" | "se" | "en";

const regionToLocale: Record<string, Locale> = {
  NO: "no", DK: "dk", FI: "fi", SE: "se",
};

function getLocale(region: string): Locale {
  return regionToLocale[region] || "en";
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

/* ── Shared card style ─────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: "rgba(10,10,10,0.65)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(229,9,20,0.15)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
  borderRadius: 16,
  transition: "all 0.3s ease",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  margin: "0 0 12px",
};

/* ── Gradient number component ─────────────────────────── */

function GradientNumber({ value, className = "" }: { value: number | string; className?: string }) {
  return (
    <span
      className={className}
      style={{
        background: "linear-gradient(180deg, #fff 60%, rgba(255,255,255,0.4) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {value}
    </span>
  );
}

/* ── Highlight key terms in taste text ────────────────── */

function highlightTerms(text: string): React.ReactNode {
  if (!text) return null;
  // Match quoted strings and multi-word capitalized sequences (likely titles)
  const regex = /"[^"]+"|(?:[A-Z][a-zA-Z']+(?:\s+(?:and|the|of|in|on|a|an|for|to|&|vs\.?)\s*)*\s+[A-Z][a-zA-Z']+(?:(?:\s+(?:and|the|of|in|on|a|an|for|to|&|vs\.?)\s*)*\s+[A-Z][a-zA-Z']+)*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index} style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>{match[0]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? <>{parts}</> : text;
}

/* ── Main page ─────────────────────────────────────────── */

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
        if (!g.name) continue;
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

  const overviewCards = [
    { label: s.sett, value: stats?.totalWatched || 0 },
    { label: s.seliste, value: stats?.totalWatchlist || 0 },
    { label: s.filmer, value: stats?.movies || 0 },
    { label: s.serier, value: stats?.tvShows || 0 },
  ];

  const sentimentBars = [
    { label: s.likte, value: stats?.liked || 0, bg: "linear-gradient(180deg, #E50914, #8B0000)", shadow: "0 0 16px rgba(229,9,20,0.3)" },
    { label: s.noytral, value: stats?.neutral || 0, bg: "rgba(255,255,255,0.25)", shadow: "none" },
    { label: s.mislikte, value: stats?.disliked || 0, bg: "rgba(255,255,255,0.12)", shadow: "none" },
    { label: s.uvurdert, value: stats?.unrated || 0, bg: "rgba(255,255,255,0.06)", shadow: "none" },
  ];

  const tasteCards = taste
    ? [
        { eyebrow: s.youLike, text: taste.youLike },
        { eyebrow: s.avoid, text: taste.avoid },
        { eyebrow: s.tempoTone, text: taste.pacing },
      ]
    : [];

  return (
    <div className="animate-fade-in-up">
        {/* User info header — compact */}
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <div className="relative">
            <div
              className="absolute pointer-events-none"
              style={{ width: 100, height: 100, top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)" }}
            />
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative"
              style={{ background: "rgba(255,42,42,0.1)", border: "2px solid rgba(255,42,42,0.2)" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: "#ff2a2a" }}>{initials}</span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">{userName}</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>{s.filmLover}</p>
          </div>
        </div>

        {/* Wrapped button */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/wrapped"
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              border: "1px solid rgba(229,9,20,0.4)",
            }}
            className="hover:border-[rgba(229,9,20,0.7)] hover:-translate-y-0.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(229,9,20,0.85)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {s.wrapped}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Taste profile section */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={sectionHeadingStyle}>{s.tasteProfile}</h2>

          {tasteLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...cardStyle, padding: 16 }}>
                  <div className="skeleton h-4 w-20 rounded mb-3" />
                  <div className="skeleton h-3 w-full rounded mb-2" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : !taste ? (
            <div style={{ ...cardStyle, padding: 20, textAlign: "center" }}>
              <div className="flex flex-col items-center gap-3">
                <svg className="w-10 h-10" style={{ color: "rgba(229,9,20,0.4)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <div>
                  <h3 className="text-base font-semibold text-white/90 mb-1">{s.noTaste}</h3>
                  <p className="text-sm text-white/40 mb-3">{s.noTasteSub}</p>
                </div>
                <button
                  onClick={handleGenerateTaste}
                  disabled={generating}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: "#ff2a2a" }}
                >
                  {generating ? s.generating : s.generateTaste}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 items-stretch" style={{ gap: 10 }}>
              {tasteCards.map(({ eyebrow, text }) => (
                <div
                  key={eyebrow}
                  className="hover:-translate-y-0.5 cursor-default"
                  style={{
                    ...cardStyle,
                    padding: "14px 14px 14px 14px",
                    borderLeft: "2px solid rgba(229,9,20,0.7)",
                  }}
                >
                  <p style={{
                    color: "rgba(229,9,20,0.85)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}>
                    {eyebrow}
                  </p>
                  <p style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {highlightTerms(text)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics section */}
        {!statsLoading && stats && stats.totalWatched > 0 && (
          <div>
            <h2 style={sectionHeadingStyle}>{s.stats}</h2>

            {/* Overview cards — 4 compact stat boxes */}
            <div className="grid grid-cols-4" style={{ gap: 10, marginBottom: 16 }}>
              {overviewCards.map(({ label, value }) => (
                <div key={label} className="hover:-translate-y-0.5 cursor-default" style={{ ...cardStyle, padding: "12px 8px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.5), transparent)" }} />
                  <GradientNumber value={value} className="text-xl font-bold" />
                  <p style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Two-column layout: Rating (left) + Top Genres (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
              {/* Sentiment breakdown */}
              <div style={{ ...cardStyle, padding: 16 }}>
                <h3 style={sectionHeadingStyle}>{s.vurdering}</h3>
                <div className="flex" style={{ gap: 12 }}>
                  {sentimentBars.map(({ label, value, bg, shadow }) => (
                    <div key={label} className="flex-1 text-center">
                      <div className="flex items-end justify-center" style={{ height: 56, marginBottom: 6 }}>
                        <div
                          className="transition-all duration-500"
                          style={{
                            width: 28,
                            borderRadius: "4px 4px 0 0",
                            background: bg,
                            boxShadow: shadow,
                            height: `${stats.totalWatched > 0 ? (value / stats.totalWatched) * 100 : 0}%`,
                            minHeight: value > 0 ? 4 : 0,
                          }}
                        />
                      </div>
                      <GradientNumber value={value} className="text-base font-bold" />
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, marginTop: 2 }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                {stats.avgRating && (
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)", marginTop: 10, paddingTop: 10, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
                    Gjennomsnittlig: <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{stats.avgRating}/10</span>
                  </p>
                )}
              </div>

              {/* Top genres */}
              {stats.topGenres.length > 0 && (
                <div style={{ ...cardStyle, padding: 16 }}>
                  <h3 style={sectionHeadingStyle}>{s.toppsjangre}</h3>
                  <div className="flex items-stretch" style={{ gap: 6 }}>
                    {stats.topGenres.map(({ name, count }, index) => {
                      const opacity = index === 0 ? 1 : Math.max(0.2, 0.8 - index * 0.1);
                      const barBg = index === 0 ? "linear-gradient(180deg, #E50914, #8B0000)" : `rgba(229,9,20,${opacity})`;
                      const barShadow = index === 0 ? "0 0 20px rgba(229,9,20,0.4)" : "none";
                      return (
                        <div key={`${name}-${index}`} className="flex-1 text-center min-w-0">
                          <div className="flex items-end justify-center" style={{ height: 72, marginBottom: 4 }}>
                            <div
                              className="w-full transition-all duration-500 hover:brightness-125"
                              style={{
                                borderRadius: "3px 3px 0 0",
                                background: barBg,
                                boxShadow: barShadow,
                                height: `${(count / maxGenre) * 100}%`,
                                minHeight: count > 0 ? 6 : 0,
                              }}
                            />
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>{count}</p>
                          <p style={{
                            fontSize: 8,
                            color: "rgba(255,255,255,0.4)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                            margin: 0,
                          }}>
                            {name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
