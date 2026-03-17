"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

const strings: Record<string, Record<Locale, string>> = {
  title: { no: "Match-historikk", en: "Match History", dk: "Match-historik", se: "Match-historik", fi: "Match-historia" },
  back: { no: "Se Sammen", en: "Watch Together", dk: "Se Sammen", se: "Se Tillsammans", fi: "Katsotaan Yhdessä" },
  totalMatches: { no: "matcher totalt", en: "total matches", dk: "matches i alt", se: "matchningar totalt", fi: "matchia yhteensä" },
  topGenre: { no: "Topp-sjanger", en: "Top genre", dk: "Top-genre", se: "Toppgenre", fi: "Suosituin genre" },
  lastMatch: { no: "Siste match", en: "Last match", dk: "Seneste match", se: "Senaste match", fi: "Viimeisin match" },
  noMatches: { no: "Ingen matcher ennå", en: "No matches yet", dk: "Ingen matches endnu", se: "Inga matchningar ännu", fi: "Ei vielä matcheja" },
  noMatchesSub: { no: "Start en runde Se Sammen og finn noe å se!", en: "Start a Watch Together round and find something to watch!", dk: "Start en runde Se Sammen og find noget at se!", se: "Starta en runda Se Tillsammans och hitta något att se!", fi: "Aloita Katsotaan Yhdessä -kierros ja löydä jotain katsottavaa!" },
  startTogether: { no: "Start Se Sammen", en: "Start Watch Together", dk: "Start Se Sammen", se: "Starta Se Tillsammans", fi: "Aloita Katsotaan Yhdessä" },
  movie: { no: "Film", en: "Movie", dk: "Film", se: "Film", fi: "Elokuva" },
  tv: { no: "Serie", en: "Series", dk: "Serie", se: "Serie", fi: "Sarja" },
  loading: { no: "Laster...", en: "Loading...", dk: "Indlæser...", se: "Laddar...", fi: "Ladataan..." },
};

function s(key: string, locale: Locale): string {
  return strings[key]?.[locale] ?? strings[key]?.en ?? key;
}

interface MatchItem {
  session_id: string;
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  year: number | null;
  slug: string | null;
  created_at: string;
}

interface Stats {
  total_matches: number;
  top_genre: string | null;
  last_match: MatchItem | null;
}

export default function HistoryPage() {
  const locale = useLocale();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/together/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(locale === "no" ? "no-NO" : locale === "dk" ? "da-DK" : locale === "se" ? "sv-SE" : locale === "fi" ? "fi-FI" : "en-US", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch {
      return iso.slice(0, 10);
    }
  }

  const regionMap: Record<string, string> = { no: "no", se: "se", dk: "dk", fi: "fi", en: "no" };
  const region = regionMap[locale] ?? "no";

  function buildTitleUrl(match: MatchItem): string {
    if (match.slug) return `/${region}/${match.type}/${match.slug}`;
    const slug = match.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `/${region}/${match.type}/${slug}-${match.tmdb_id}`;
  }

  return (
    <div className="min-h-dvh" style={{ background: "#06080f" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link
            href="/together"
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {s("back", locale)}
          </Link>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
          {s("title", locale)}
        </h1>
      </div>

      <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", paddingTop: 40 }}>
            {s("loading", locale)}
          </p>
        ) : matches.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {s("noMatches", locale)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24, maxWidth: 280, margin: "0 auto 24px" }}>
              {s("noMatchesSub", locale)}
            </p>
            <Link
              href="/together"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#ff2a2a",
                color: "#fff",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {s("startTogether", locale)}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#ff2a2a" }}>{stats.total_matches}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("totalMatches", locale)}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{stats.top_genre || "—"}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("topGenre", locale)}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1.2 }}>{stats.last_match?.title || "—"}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("lastMatch", locale)}</p>
                </div>
              </div>
            )}

            {/* Match list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {matches.map((m) => (
                <Link
                  key={m.session_id}
                  href={buildTitleUrl(m)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                >
                  {/* Poster */}
                  <div style={{ width: 40, height: 60, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                    {m.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                        alt={m.title}
                        width={40}
                        height={60}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.15)", fontSize: 10 }}>?</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {m.type === "tv" ? s("tv", locale) : s("movie", locale)}{m.year ? ` · ${m.year}` : ""}
                    </p>
                  </div>

                  {/* Date */}
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {formatDate(m.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
