"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
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
    streakTitle: "Watch Together Streak",
    streakWeeks: "uker",
    streakCurrent: "Nåværende",
    streakLongest: "Lengste",
    streakAtRisk: "Ikke la streaken brytes!",
    streakRewardHelgevalg: "Helgevalg låst opp!",
    streakRewardSkjultePerler: "Skjulte perler låst opp!",
    streakRewardKlassikere: "Klassikere låst opp!",
    frozenTitle: "Rapporten er satt på pause",
    frozenScore: (s: number, m: number) => `Taste Compatibility stoppet på ${s}% — ${m} matcher`,
    frozenStreak: (n: number) => `🔥 ${n} ukers streak`,
    frozenCta: "Gjenaktiver — 29 kr/mnd",
    frozenSub: "for dere begge",
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
    streakTitle: "Watch Together Streak",
    streakWeeks: "weeks",
    streakCurrent: "Current",
    streakLongest: "Longest",
    streakAtRisk: "Don't let the streak break!",
    streakRewardHelgevalg: "Weekend picks unlocked!",
    streakRewardSkjultePerler: "Hidden gems unlocked!",
    streakRewardKlassikere: "Classics unlocked!",
    frozenTitle: "Report paused",
    frozenScore: (s: number, m: number) => `Taste Compatibility stopped at ${s}% — ${m} matches`,
    frozenStreak: (n: number) => `🔥 ${n} week streak`,
    frozenCta: "Reactivate — 29 NOK/mo",
    frozenSub: "for both of you",
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
    streakTitle: "Watch Together Streak",
    streakWeeks: "uger",
    streakCurrent: "Nuværende",
    streakLongest: "Længste",
    streakAtRisk: "Lad ikke streaken brydes!",
    streakRewardHelgevalg: "Weekendvalg låst op!",
    streakRewardSkjultePerler: "Skjulte perler låst op!",
    streakRewardKlassikere: "Klassikere låst op!",
    frozenTitle: "Rapporten er sat på pause",
    frozenScore: (s: number, m: number) => `Smagskompatibilitet stoppet på ${s}% — ${m} matches`,
    frozenStreak: (n: number) => `🔥 ${n} ugers streak`,
    frozenCta: "Genaktiver — 29 NOK/md",
    frozenSub: "for jer begge",
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
    streakTitle: "Watch Together Streak",
    streakWeeks: "veckor",
    streakCurrent: "Nuvarande",
    streakLongest: "Längsta",
    streakAtRisk: "Låt inte streaken brytas!",
    streakRewardHelgevalg: "Helgval upplåst!",
    streakRewardSkjultePerler: "Dolda pärlor upplåsta!",
    streakRewardKlassikere: "Klassiker upplåsta!",
    frozenTitle: "Rapporten är pausad",
    frozenScore: (s: number, m: number) => `Smakkompatibilitet stannade på ${s}% — ${m} matchningar`,
    frozenStreak: (n: number) => `🔥 ${n} veckors streak`,
    frozenCta: "Återaktivera — 29 NOK/mån",
    frozenSub: "för er båda",
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
    streakTitle: "Watch Together Streak",
    streakWeeks: "viikkoa",
    streakCurrent: "Nykyinen",
    streakLongest: "Pisin",
    streakAtRisk: "Älä anna putken katketa!",
    streakRewardHelgevalg: "Viikonloppuvalinnat avattu!",
    streakRewardSkjultePerler: "Piilotetut helmet avattu!",
    streakRewardKlassikere: "Klassikot avattu!",
    frozenTitle: "Raportti tauolla",
    frozenScore: (s: number, m: number) => `Makuyhteensopivuus pysähtyi ${s}%:iin — ${m} matchia`,
    frozenStreak: (n: number) => `🔥 ${n} viikon putki`,
    frozenCta: "Aktivoi uudelleen — 29 NOK/kk",
    frozenSub: "molemmille",
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
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number; streak_at_risk: boolean; unlocked_rewards: string[] } | null>(null);
  const [frozenData, setFrozenData] = useState<{ score: number; matches: number; streak: number; frozen_at: string } | null>(null);
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
    fetch("/api/couple-streak")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setStreak(d); })
      .catch(() => {});
    // Fetch frozen couple data for cancelled subscribers
    createSupabaseBrowser()
      .from("profiles")
      .select("frozen_couple_data")
      .single()
      .then(({ data: p }) => {
        if (p?.frozen_couple_data) setFrozenData(p.frozen_couple_data);
      });
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

      {/* Couple streak */}
      {streak && (streak.current_streak > 0 || streak.longest_streak > 0) && (
        <section className="mb-8 rounded-xl border border-white/[0.06] p-4" style={{ background: "rgba(255,255,255,0.025)" }}>
          <h2 className="text-sm font-bold text-white/80 mb-3">{s.streakTitle}</h2>
          <div className="flex gap-6 mb-2">
            <div>
              <p className="text-2xl font-black text-white">🔥 {streak.current_streak}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.streakCurrent} ({s.streakWeeks})</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white/50">{streak.longest_streak}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.streakLongest}</p>
            </div>
          </div>
          {streak.streak_at_risk && (
            <p className="text-xs font-semibold mt-2" style={{ color: "#f59e0b" }}>⚠️ {s.streakAtRisk}</p>
          )}
          {streak.unlocked_rewards.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {streak.unlocked_rewards.map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-full text-[10px] font-medium border" style={{ background: "rgba(255,200,100,0.08)", borderColor: "rgba(255,200,100,0.2)", color: "rgba(255,200,100,0.8)" }}>
                  🎁 {r === "klassikere" ? s.streakRewardKlassikere : r === "skjulte-perler" ? s.streakRewardSkjultePerler : s.streakRewardHelgevalg}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Premium gate overlay for free users */}
      <div className={blurred ? "relative" : ""}>
        {blurred && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            {frozenData ? (
              <div className="text-center px-6">
                <p className="text-lg font-bold text-white mb-2">⏸ {s.frozenTitle}</p>
                <p className="text-sm text-white/60 mb-1">{s.frozenScore(frozenData.score, frozenData.matches)}</p>
                {frozenData.streak > 0 && (
                  <p className="text-sm text-white/50 mb-4">{s.frozenStreak(frozenData.streak)}</p>
                )}
                <Link
                  href="/premium"
                  className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 mb-1.5"
                  style={{ background: "#E50914" }}
                >
                  {s.frozenCta}
                </Link>
                <p className="text-[11px] text-white/30">{s.frozenSub}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/70 text-center px-6 mb-4">{s.premiumGate}</p>
                <Link
                  href="/premium"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#E50914" }}
                >
                  {s.upgradeCta}
                </Link>
              </>
            )}
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
