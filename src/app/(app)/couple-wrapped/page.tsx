"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

/* ── i18n ─────────────────────────────────────────── */

const strings = {
  no: {
    title: "Par-Wrapped",
    loading: "Henter par-data...",
    noPartner: "Koble til en partner for å se Par-Wrapped",
    connect: "Koble til partner",
    insufficient: "Dere trenger minst 3 titler til sammen denne måneden",
    addMore: "Logg flere titler",
    overlap: "Dere så begge",
    agreement: "enighet",
    sharedGenres: "Felles sjangre",
    wtMatches: "Se Sammen-matcher",
    movies: "filmer",
    series: "serier",
    hours: "timer",
    total: "titler",
    topGenres: "Toppsjangre",
    vs: "vs",
    monthNames: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
  },
  en: {
    title: "Couple Wrapped",
    loading: "Fetching couple data...",
    noPartner: "Link a partner to see Couple Wrapped",
    connect: "Connect partner",
    insufficient: "You need at least 3 titles combined this month",
    addMore: "Log more titles",
    overlap: "You both watched",
    agreement: "agreement",
    sharedGenres: "Shared genres",
    wtMatches: "Watch Together matches",
    movies: "movies",
    series: "series",
    hours: "hours",
    total: "titles",
    topGenres: "Top genres",
    vs: "vs",
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  dk: {
    title: "Par-Wrapped",
    loading: "Henter pardata...",
    noPartner: "Forbind en partner for at se Par-Wrapped",
    connect: "Forbind partner",
    insufficient: "I har brug for mindst 3 titler tilsammen denne måned",
    addMore: "Log flere titler",
    overlap: "I så begge",
    agreement: "enighed",
    sharedGenres: "Fælles genrer",
    wtMatches: "Se Sammen-matches",
    movies: "film",
    series: "serier",
    hours: "timer",
    total: "titler",
    topGenres: "Topgenrer",
    vs: "vs",
    monthNames: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  },
  se: {
    title: "Par-Wrapped",
    loading: "Hämtar pardata...",
    noPartner: "Koppla ihop med en partner för att se Par-Wrapped",
    connect: "Koppla partner",
    insufficient: "Ni behöver minst 3 titlar tillsammans denna månad",
    addMore: "Logga fler titlar",
    overlap: "Ni såg båda",
    agreement: "överens",
    sharedGenres: "Gemensamma genrer",
    wtMatches: "Se Tillsammans-matchningar",
    movies: "filmer",
    series: "serier",
    hours: "timmar",
    total: "titlar",
    topGenres: "Toppgenrer",
    vs: "vs",
    monthNames: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
  },
  fi: {
    title: "Pari-Wrapped",
    loading: "Haetaan paritietoja...",
    noPartner: "Yhdistä kumppani nähdäksesi Pari-Wrapped",
    connect: "Yhdistä kumppani",
    insufficient: "Tarvitsette vähintään 3 nimikettä yhteensä tässä kuussa",
    addMore: "Kirjaa lisää nimikkeitä",
    overlap: "Molemmat katsoitte",
    agreement: "yksimielisyys",
    sharedGenres: "Yhteiset genret",
    wtMatches: "Katsotaan yhdessä -osumat",
    movies: "elokuvia",
    series: "sarjoja",
    hours: "tuntia",
    total: "nimikettä",
    topGenres: "Suosikkigenret",
    vs: "vs",
    monthNames: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
  },
} as const;

/* ── Types ────────────────────────────────────────── */

interface OverlapTitle {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  mySentiment: string | null;
  myRating: number | null;
  partnerSentiment: string | null;
  partnerRating: number | null;
}

interface PersonStats {
  total: number;
  movies: number;
  series: number;
  topGenres: string[];
  hours: number;
}

interface CoupleWrappedData {
  month: string;
  myName: string | null;
  partnerName: string | null;
  isPremium?: boolean;
  my: PersonStats;
  partner: PersonStats;
  overlap: {
    count: number;
    titles: OverlapTitle[];
    agreementScore: number | null;
    sharedGenres: string[];
  };
  wtMatches: number;
}

/* ── Component ───────────────────────────────────── */

export default function CoupleWrappedPage() {
  const [data, setData] = useState<CoupleWrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    fetch(`/api/couple-wrapped?month=${currentMonth}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === "No linked partner") {
          setError("no_partner");
        } else if (d.insufficient) {
          setError("insufficient");
        } else if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
      })
      .catch(() => setError("Failed"))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const monthIdx = now.getMonth();
  const monthName = s.monthNames[monthIdx];
  const year = now.getFullYear();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;

  if (error === "no_partner") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">💑</span>
        <p className="text-sm text-white/50 mb-4">{s.noPartner}</p>
        <Link href="/settings" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#E50914" }}>{s.connect}</Link>
      </div>
    );
  }

  if (error === "insufficient") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">📊</span>
        <p className="text-sm text-white/50 mb-4">{s.insufficient}</p>
        <Link href="/search" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#E50914" }}>{s.addMore}</Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in-up pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#E50914" }}>{s.title}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {data.myName || "?"} & {data.partnerName || "?"}
        </h1>
        <p className="text-sm text-white/40 mt-1">{monthName} {year}</p>
      </div>

      {/* Side by side stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { name: data.myName || "Du", stats: data.my },
          { name: data.partnerName || "Partner", stats: data.partner },
        ].map((person) => (
          <div
            key={person.name}
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs font-semibold text-white/50 mb-3 truncate">{person.name}</p>
            <p className="text-3xl font-extrabold text-white">{person.stats.total}</p>
            <p className="text-[10px] text-white/30 mb-3">{s.total}</p>
            <div className="flex gap-3 text-[11px] text-white/40">
              <span>{person.stats.movies} {s.movies}</span>
              <span>{person.stats.series} {s.series}</span>
            </div>
            <div className="flex gap-3 text-[11px] text-white/30 mt-1">
              <span>~{person.stats.hours} {s.hours}</span>
            </div>
            {person.stats.topGenres.length > 0 && (
              <div className="mt-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/20 mb-1.5">{s.topGenres}</p>
                <div className="flex flex-wrap gap-1">
                  {person.stats.topGenres.slice(0, 3).map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(229,9,20,0.12)", color: "#ff8080", border: "1px solid rgba(229,9,20,0.2)" }}>{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shared stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Overlap count */}
        <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-2xl font-extrabold text-white">{data.overlap.count}</p>
          <p className="text-[10px] text-white/30 mt-1">{s.overlap}</p>
        </div>
        {/* Agreement score */}
        {data.overlap.agreementScore !== null && (
          <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-2xl font-extrabold" style={{ color: data.overlap.agreementScore >= 70 ? "#4ade80" : data.overlap.agreementScore >= 40 ? "#facc15" : "#ef4444" }}>{data.overlap.agreementScore}%</p>
            <p className="text-[10px] text-white/30 mt-1">{s.agreement}</p>
          </div>
        )}
        {/* WT matches */}
        <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-2xl font-extrabold text-white">{data.wtMatches}</p>
          <p className="text-[10px] text-white/30 mt-1">{s.wtMatches}</p>
        </div>
      </div>

      {/* Shared genres */}
      {data.overlap.sharedGenres.length > 0 && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-3">{s.sharedGenres}</p>
          <div className="flex flex-wrap gap-2">
            {data.overlap.sharedGenres.map((g) => (
              <span key={g} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(229,9,20,0.1)", color: "#ff8080", border: "1px solid rgba(229,9,20,0.25)" }}>{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Overlap titles */}
      {data.overlap.titles.length > 0 && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-4">{s.overlap}</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1" style={{ touchAction: "pan-x", overscrollBehaviorX: "contain" }}>
            {data.overlap.titles.map((t) => (
              <div key={`${t.tmdb_id}:${t.type}`} className="flex-shrink-0 w-[100px]">
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                  {t.poster_path ? (
                    <Image src={`https://image.tmdb.org/t/p/w185${t.poster_path}`} alt={t.title || ""} fill sizes="100px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 text-2xl">?</div>
                  )}
                  {/* Dual sentiment dots */}
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    {t.mySentiment && <div className="w-2 h-2 rounded-full" style={{ background: t.mySentiment === "liked" ? "#4ade80" : t.mySentiment === "disliked" ? "#ef4444" : "#facc15" }} />}
                    {t.partnerSentiment && <div className="w-2 h-2 rounded-full" style={{ background: t.partnerSentiment === "liked" ? "#4ade80" : t.partnerSentiment === "disliked" ? "#ef4444" : "#facc15", border: "1px solid rgba(0,0,0,0.3)" }} />}
                  </div>
                </div>
                <p className="text-[10px] text-white/50 mt-1 truncate">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to couple report */}
      <div className="text-center mt-4">
        <Link href="/couple-report" className="text-xs text-white/30 hover:text-white/50 transition-colors">
          {locale === "no" ? "Se par-rapporten →" : locale === "se" ? "Se parrapporten →" : locale === "dk" ? "Se parrapporten →" : locale === "fi" ? "Katso pariraportti →" : "See couple report →"}
        </Link>
      </div>
    </div>
  );
}
