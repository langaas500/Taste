"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Locale } from "@/lib/i18n";

/* ── locale strings ──────────────────────────────────── */

const strings = {
  no: {
    loading: "Beregner kompatibilitet...",
    title: "Par-rapport",
    compatibility: "Taste Compatibility",
    genreLabel: "Sjanger-overlapp",
    eraLabel: "Tidsperiode",
    toneLabel: "Match-rate",
    percentile: (n: number) => `Bedre enn ${n}% av par på Logflix`,
    favorites: "Felles favoritter",
    topGenres: "Sjangre dere elsker",
    avoidedGenres: "Sjangre dere unngår",
    nextPick: "Neste anbefaling",
    share: "Del rapporten",
    shareTitle: "Vår filmkompatibilitet på Logflix",
    noPartner: "Koble til en partner for å se rapporten",
    connect: "Koble til partner",
    matches: "matcher totalt",
    premiumGate: "Se hele rapporten — 29 kr/mnd for dere begge",
    upgradeCta: "Bli Founding Member",
    movie: "Film",
    series: "Serie",
  },
  en: {
    loading: "Calculating compatibility...",
    title: "Couple Report",
    compatibility: "Taste Compatibility",
    genreLabel: "Genre overlap",
    eraLabel: "Era match",
    toneLabel: "Match rate",
    percentile: (n: number) => `Better than ${n}% of couples on Logflix`,
    favorites: "Shared favorites",
    topGenres: "Genres you both love",
    avoidedGenres: "Genres you both avoid",
    nextPick: "Next recommendation",
    share: "Share report",
    shareTitle: "Our film compatibility on Logflix",
    noPartner: "Link a partner to see the report",
    connect: "Connect partner",
    matches: "total matches",
    premiumGate: "See full report — 29 NOK/mo for both of you",
    upgradeCta: "Become a Founding Member",
    movie: "Movie",
    series: "Series",
  },
  dk: {
    loading: "Beregner kompatibilitet...",
    title: "Par-rapport",
    compatibility: "Smagskompatibilitet",
    genreLabel: "Genre-overlap",
    eraLabel: "Tidsperiode",
    toneLabel: "Match-rate",
    percentile: (n: number) => `Bedre end ${n}% af par på Logflix`,
    favorites: "Fælles favoritter",
    topGenres: "Genrer I elsker",
    avoidedGenres: "Genrer I undgår",
    nextPick: "Næste anbefaling",
    share: "Del rapporten",
    shareTitle: "Vores filmkompatibilitet på Logflix",
    noPartner: "Forbind en partner for at se rapporten",
    connect: "Forbind partner",
    matches: "matches i alt",
    premiumGate: "Se hele rapporten — 29 NOK/md for jer begge",
    upgradeCta: "Bliv Founding Member",
    movie: "Film",
    series: "Serie",
  },
  se: {
    loading: "Beräknar kompatibilitet...",
    title: "Par-rapport",
    compatibility: "Smakkompatibilitet",
    genreLabel: "Genreöverlapp",
    eraLabel: "Eramatch",
    toneLabel: "Matchfrekvens",
    percentile: (n: number) => `Bättre än ${n}% av par på Logflix`,
    favorites: "Gemensamma favoriter",
    topGenres: "Genrer ni älskar",
    avoidedGenres: "Genrer ni undviker",
    nextPick: "Nästa rekommendation",
    share: "Dela rapporten",
    shareTitle: "Vår filmkompatibilitet på Logflix",
    noPartner: "Koppla ihop med en partner för att se rapporten",
    connect: "Koppla partner",
    matches: "matchningar totalt",
    premiumGate: "Se hela rapporten — 29 NOK/mån för er båda",
    upgradeCta: "Bli Founding Member",
    movie: "Film",
    series: "Serie",
  },
  fi: {
    loading: "Lasketaan yhteensopivuutta...",
    title: "Pariraportti",
    compatibility: "Makuyhteensopivuus",
    genreLabel: "Genrejen päällekkäisyys",
    eraLabel: "Aikakausi",
    toneLabel: "Match-aste",
    percentile: (n: number) => `Parempi kuin ${n}% pareista Logflixissä`,
    favorites: "Yhteiset suosikit",
    topGenres: "Genret joita molemmat rakastavat",
    avoidedGenres: "Genret joita molemmat välttävät",
    nextPick: "Seuraava suositus",
    share: "Jaa raportti",
    shareTitle: "Elokuvayhteensopivuutemme Logflixissä",
    noPartner: "Yhdistä kumppani nähdäksesi raportin",
    connect: "Yhdistä kumppani",
    matches: "matchia yhteensä",
    premiumGate: "Katso koko raportti — 29 NOK/kk molemmille",
    upgradeCta: "Liity Founding Memberiksi",
    movie: "Elokuva",
    series: "Sarja",
  },
} as const;

/* ── types ────────────────────────────────────────────── */

interface FavoriteTitle {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  slug: string | null;
  year: number | null;
}

interface TonightPick {
  movie_title: string | null;
  movie_poster_path: string | null;
  movie_match_score: number | null;
  series_title: string | null;
  series_poster_path: string | null;
  series_match_score: number | null;
}

interface ReportData {
  compatibility_score: number;
  genre_overlap: number;
  tone_score: number;
  era_score: number;
  percentile: number;
  total_matches: number;
  favorite_titles: FavoriteTitle[];
  top_genres: string[];
  avoided_genres: string[];
  partner_name: string;
  partner_founding: boolean;
  my_name: string;
  my_founding: boolean;
  is_premium: boolean;
  tonight_pick: TonightPick | null;
}

/* ── page ─────────────────────────────────────────────── */

export default function CoupleReportPage() {
  const locale = useLocale();
  const s = strings[locale as keyof typeof strings] ?? strings.en;
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noPartner, setNoPartner] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const scoreRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/couple-report")
      .then((r) => {
        if (r.status === 404) { setNoPartner(true); return null; }
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Animate score counter
  useEffect(() => {
    if (!data) return;
    const target = data.compatibility_score;
    let current = 0;
    scoreRef.current = setInterval(() => {
      current += Math.ceil(target / 40);
      if (current >= target) {
        current = target;
        if (scoreRef.current) clearInterval(scoreRef.current);
      }
      setAnimatedScore(current);
    }, 30);
    return () => { if (scoreRef.current) clearInterval(scoreRef.current); };
  }, [data]);

  if (loading) return <LoadingSpinner text={s.loading} />;

  if (noPartner) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <span className="text-4xl mb-4">💑</span>
        <p className="text-sm text-white/50 mb-4">{s.noPartner}</p>
        <Link
          href="/settings"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#E50914" }}
        >
          {s.connect}
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const blurred = !data.is_premium;
  const names = `${data.my_name} & ${data.partner_name}`;
  const isFounding = data.my_founding || data.partner_founding;

  async function handleShare() {
    if (!data) return;
    const text = `${names}: ${data.compatibility_score}% ${s.compatibility} 🎬`;
    if (navigator.share) {
      try {
        await navigator.share({ title: s.shareTitle, text, url: "https://logflix.app/couple-report" });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\nhttps://logflix.app/couple-report`);
    }
  }

  return (
    <div className="min-h-dvh px-4 pb-20 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(229,9,20,0.85)" }}>
          {s.title}
        </p>
        <h1 className="text-xl font-extrabold text-white mb-1">
          {isFounding && <span style={{ marginRight: 4 }}>⭐</span>}
          {names}
        </h1>
        <p className="text-xs text-white/30">{data.total_matches} {s.matches}</p>
      </div>

      {/* Score circle */}
      <div className="relative mb-6">
        <div
          className="mx-auto w-40 h-40 rounded-full flex flex-col items-center justify-center border"
          style={{
            background: "rgba(229,9,20,0.04)",
            borderColor: `rgba(229,9,20,${0.15 + (data.compatibility_score / 100) * 0.35})`,
            boxShadow: `0 0 ${20 + data.compatibility_score / 3}px rgba(229,9,20,${0.1 + (data.compatibility_score / 100) * 0.2})`,
          }}
        >
          <span className="text-4xl font-black text-white">{animatedScore}%</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{s.compatibility}</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="flex justify-center gap-4 mb-4 text-center">
        <div>
          <p className="text-lg font-bold text-white">{data.genre_overlap}%</p>
          <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.genreLabel}</p>
        </div>
        <div className="w-px bg-white/[0.06]" />
        <div>
          <p className="text-lg font-bold text-white">{data.tone_score}%</p>
          <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.toneLabel}</p>
        </div>
        <div className="w-px bg-white/[0.06]" />
        <div>
          <p className="text-lg font-bold text-white">{data.era_score}%</p>
          <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.eraLabel}</p>
        </div>
      </div>

      <p className="text-center text-xs text-white/35 mb-8">{s.percentile(data.percentile)}</p>

      {/* Premium gate overlay for free users */}
      <div className={blurred ? "relative" : ""}>
        {blurred && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <p className="text-sm text-white/70 text-center px-6 mb-4">{s.premiumGate}</p>
            <Link
              href="/premium"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#E50914" }}
            >
              {s.upgradeCta}
            </Link>
          </div>
        )}

        <div className={blurred ? "filter blur-sm pointer-events-none select-none" : ""}>
          {/* Favorites */}
          {data.favorite_titles.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-white/80 mb-3">{s.favorites}</h2>
              <div className="grid grid-cols-5 gap-2">
                {data.favorite_titles.slice(0, 5).map((t) => (
                  <Link key={t.tmdb_id} href={t.slug ? `/no/${t.type}/${t.slug}` : "#"} className="group">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] group-hover:border-white/[0.15] transition-all">
                      {t.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${t.poster_path}`}
                          alt={t.title}
                          width={185}
                          height={278}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">?</div>
                      )}
                    </div>
                    <p className="text-[9px] text-white/40 mt-1 truncate">{t.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top genres */}
          {data.top_genres.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-white/80 mb-3">{s.topGenres}</h2>
              <div className="flex flex-wrap gap-2">
                {data.top_genres.map((g) => (
                  <span key={g} className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60 border border-white/[0.08] bg-white/[0.03]">
                    {g}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Avoided genres */}
          {data.avoided_genres.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-white/80 mb-3">{s.avoidedGenres}</h2>
              <div className="flex flex-wrap gap-2">
                {data.avoided_genres.map((g) => (
                  <span key={g} className="px-3 py-1.5 rounded-full text-xs font-medium text-white/30 border border-white/[0.05] bg-white/[0.01]">
                    {g}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Tonight's pick */}
          {data.tonight_pick && (data.tonight_pick.movie_title || data.tonight_pick.series_title) && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-white/80 mb-3">{s.nextPick}</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.tonight_pick.movie_title && (
                  <div className="rounded-xl border border-white/[0.06] p-3" style={{ background: "rgba(255,255,255,0.025)" }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-2">🎬 {s.movie}</p>
                    {data.tonight_pick.movie_poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${data.tonight_pick.movie_poster_path}`}
                        alt={data.tonight_pick.movie_title}
                        width={185}
                        height={278}
                        className="w-full rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs font-medium text-white/70 truncate">{data.tonight_pick.movie_title}</p>
                  </div>
                )}
                {data.tonight_pick.series_title && (
                  <div className="rounded-xl border border-white/[0.06] p-3" style={{ background: "rgba(255,255,255,0.025)" }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-2">📺 {s.series}</p>
                    {data.tonight_pick.series_poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${data.tonight_pick.series_poster_path}`}
                        alt={data.tonight_pick.series_title}
                        width={185}
                        height={278}
                        className="w-full rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs font-medium text-white/70 truncate">{data.tonight_pick.series_title}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Share button */}
      {data.is_premium && (
        <div className="flex justify-center">
          <button
            onClick={handleShare}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/80 border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            {s.share}
          </button>
        </div>
      )}
    </div>
  );
}
