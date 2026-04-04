"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import LoadingSpinner from "@/components/LoadingSpinner";

const s = {
  no: {
    title: "Din smaksreise",
    sub: "Se hvordan filmsmaken din har utviklet seg over tid.",
    loading: "Analyserer smaksutviklingen din...",
    insufficient: "Du trenger minst 10 loggede titler for å se smaksutviklingen din.",
    logMore: "Logg flere titler →",
    totalLogged: (n: number) => `${n} titler logget totalt`,
    firstTitle: (t: string, d: string) => `Det startet med "${t}" den ${d}`,
    shift: (from: string, to: string) => `Du har gått fra ${from} til ${to}`,
    period: { "0-3m": "Siste 3 måneder", "3-6m": "3–6 måneder siden", "6-12m": "6–12 måneder siden", "12m+": "Over 12 måneder siden" },
    titles: "titler",
    avgRating: "Snitt",
    aiLabel: "Curator sier:",
    premiumOnly: "Oppgrader for AI-innsikt →",
  },
  en: {
    title: "Your taste journey",
    sub: "See how your taste in film has evolved over time.",
    loading: "Analyzing your taste evolution...",
    insufficient: "You need at least 10 logged titles to see your taste evolution.",
    logMore: "Log more titles →",
    totalLogged: (n: number) => `${n} titles logged in total`,
    firstTitle: (t: string, d: string) => `It all started with "${t}" on ${d}`,
    shift: (from: string, to: string) => `You've moved from ${from} to ${to}`,
    period: { "0-3m": "Last 3 months", "3-6m": "3–6 months ago", "6-12m": "6–12 months ago", "12m+": "Over 12 months ago" },
    titles: "titles",
    avgRating: "Avg",
    aiLabel: "Curator says:",
    premiumOnly: "Upgrade for AI insight →",
  },
  dk: {
    title: "Din smagsrejse",
    sub: "Se hvordan din filmsmag har udviklet sig over tid.",
    loading: "Analyserer din smagsudvikling...",
    insufficient: "Du har brug for mindst 10 loggede titler for at se din smagsudvikling.",
    logMore: "Log flere titler →",
    totalLogged: (n: number) => `${n} titler logget i alt`,
    firstTitle: (t: string, d: string) => `Det startede med "${t}" den ${d}`,
    shift: (from: string, to: string) => `Du er gået fra ${from} til ${to}`,
    period: { "0-3m": "Sidste 3 måneder", "3-6m": "3–6 måneder siden", "6-12m": "6–12 måneder siden", "12m+": "Over 12 måneder siden" },
    titles: "titler",
    avgRating: "Gns",
    aiLabel: "Curator siger:",
    premiumOnly: "Opgrader for AI-indsigt →",
  },
  se: {
    title: "Din smakresa",
    sub: "Se hur din filmsmak har utvecklats över tid.",
    loading: "Analyserar din smakutveckling...",
    insufficient: "Du behöver minst 10 loggade titlar för att se din smakutveckling.",
    logMore: "Logga fler titlar →",
    totalLogged: (n: number) => `${n} titlar loggade totalt`,
    firstTitle: (t: string, d: string) => `Det började med "${t}" den ${d}`,
    shift: (from: string, to: string) => `Du har gått från ${from} till ${to}`,
    period: { "0-3m": "Senaste 3 månaderna", "3-6m": "3–6 månader sedan", "6-12m": "6–12 månader sedan", "12m+": "Över 12 månader sedan" },
    titles: "titlar",
    avgRating: "Snitt",
    aiLabel: "Curator säger:",
    premiumOnly: "Uppgradera för AI-insikt →",
  },
  fi: {
    title: "Makumatkasi",
    sub: "Katso miten elokuvamaustusi on kehittynyt ajan myötä.",
    loading: "Analysoidaan makukehitystäsi...",
    insufficient: "Tarvitset vähintään 10 kirjattua nimikettä nähdäksesi makukehityksesi.",
    logMore: "Kirjaa lisää nimikkeitä →",
    totalLogged: (n: number) => `${n} nimikettä kirjattu yhteensä`,
    firstTitle: (t: string, d: string) => `Kaikki alkoi nimikkeestä "${t}" ${d}`,
    shift: (from: string, to: string) => `Olet siirtynyt genrestä ${from} genreen ${to}`,
    period: { "0-3m": "Viimeiset 3 kuukautta", "3-6m": "3–6 kuukautta sitten", "6-12m": "6–12 kuukautta sitten", "12m+": "Yli 12 kuukautta sitten" },
    titles: "nimikettä",
    avgRating: "Ka",
    aiLabel: "Curator sanoo:",
    premiumOnly: "Päivitä AI-näkemystä varten →",
  },
} as const;

const GENRE_COLORS: Record<string, string> = {
  Action: "#ff4444", Drama: "#9b59b6", Comedy: "#f1c40f", Thriller: "#e67e22",
  Horror: "#c0392b", Romance: "#e91e63", "Science Fiction": "#3498db", Adventure: "#2ecc71",
  Animation: "#1abc9c", Crime: "#795548", Fantasy: "#8e44ad", Documentary: "#607d8b",
  Mystery: "#5c6bc0", War: "#78909c", Music: "#ff9800", Family: "#4caf50",
  History: "#8d6e63", Western: "#a1887f",
};

interface PeriodData {
  label: string;
  titleCount: number;
  topGenres: { name: string; count: number; pct: number }[];
  avgRating: number | null;
}

interface EvolutionData {
  insufficient: boolean;
  count?: number;
  totalTitles: number;
  periods: PeriodData[];
  firstTitle: { title: string; date: string } | null;
  biggestShift: { from: string; to: string } | null;
  aiInsight: string | null;
  isPremium: boolean;
}

export default function TasteEvolutionPage() {
  const locale = useLocale();
  const t = s[locale as keyof typeof s] ?? s.en;
  const [data, setData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/taste-evolution")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <p className="text-sm text-white/40">{t.loading}</p>
      </div>
    );
  }

  if (!data || data.insufficient) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">{t.title}</h1>
        <p className="text-white/50 mb-6">{t.insufficient}</p>
        <Link href="/search" className="text-sm font-semibold" style={{ color: "#ff2a2a" }}>
          {t.logMore}
        </Link>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale === "no" ? "nb-NO" : locale === "se" ? "sv-SE" : locale === "dk" ? "da-DK" : locale === "fi" ? "fi-FI" : "en-US", { day: "numeric", month: "long", year: "numeric" });
    } catch { return iso.slice(0, 10); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
      <p className="text-sm text-white/40 mb-2">{t.sub}</p>
      <p className="text-xs text-white/25 mb-8">{t.totalLogged(data.totalTitles)}</p>

      {/* AI insight (premium) */}
      {data.aiInsight && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: "rgba(245,200,66,0.06)", border: "0.5px solid rgba(245,200,66,0.2)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#F5C842" }}>
            {t.aiLabel}
          </p>
          <p className="text-sm text-white/70 italic leading-relaxed">{data.aiInsight}</p>
        </div>
      )}
      {!data.aiInsight && !data.isPremium && (
        <Link
          href="/premium"
          className="block rounded-2xl p-3 mb-6 text-center text-xs font-medium transition-all hover:border-white/15"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
        >
          {t.premiumOnly}
        </Link>
      )}

      {/* Biggest shift */}
      {data.biggestShift && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(255,42,42,0.05)", border: "1px solid rgba(255,42,42,0.15)" }}>
          <p className="text-sm font-semibold text-white">
            {t.shift(data.biggestShift.from, data.biggestShift.to)}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4 mb-8">
        {data.periods.map((period) => (
          <div
            key={period.label}
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {t.period[period.label as keyof typeof t.period] || period.label}
              </h3>
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>{period.titleCount} {t.titles}</span>
                {period.avgRating && <span>{t.avgRating} {period.avgRating}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {period.topGenres.map((g) => (
                <span
                  key={g.name}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: `${GENRE_COLORS[g.name] || "#666"}20`,
                    color: GENRE_COLORS[g.name] || "#aaa",
                    border: `0.5px solid ${GENRE_COLORS[g.name] || "#666"}40`,
                  }}
                >
                  {g.name} {g.pct}%
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* First title */}
      {data.firstTitle && (
        <p className="text-xs text-white/25 text-center italic">
          {t.firstTitle(data.firstTitle.title, formatDate(data.firstTitle.date))}
        </p>
      )}
    </div>
  );
}
