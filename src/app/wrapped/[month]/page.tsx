"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

/* ── i18n ─────────────────────────────────────────────── */

const WRAPPED_TEXT = {
  no: {
    loading: "Genererer din Wrapped...",
    insufficientTitle: "Ikke nok data ennå",
    insufficientDesc: (n: number) => `Du har logget ${n} titler denne måneden. Logg minst 3 for å se din Wrapped!`,
    yourMonth: (m: string) => `Din ${m}`,
    viewingMonth: (name: string, m: string) => `${name}s ${m}`,
    titlesTotal: "titler totalt",
    movies: "filmer",
    tvShows: "serier",
    hours: "timer",
    yourNumbers: "Ditt tall",
    topGenre: "Din topp-sjanger",
    enthusiast: (g: string) => `${g}-entusiast`,
    uniqueGenres: (n: number) => `${n} unike sjangre utforsket`,
    favorites: "Dine topper",
    moodMap: "Stemningskart",
    nightOwl: "Nattuglen",
    nightOwlDesc: (p: number) => `${p}% av titlene dine ble logget etter midnatt`,
    nordicNoir: "Nordic Noir",
    nordicNoirDesc: (p: number) => `${p}% av titlene dine er Nordic Noir`,
    streak: "Lengste streak",
    streakDays: (n: number) => `${n} ${n === 1 ? "dag" : "dager"} på rad`,
    wtMatches: "Se Sammen",
    wtMatchesDesc: (n: number) => `${n} ${n === 1 ? "match" : "matcher"} denne måneden`,
    watchlistAdds: "Lagt til i se-liste",
    timeCapsule: "Tidskapselen",
    timeCapsuleDesc: (decade: string, n: number) => `${decade}-tallet var din favoritt med ${n} titler`,
    globetrotter: "Globetrotter",
    nordic: "Norden",
    hollywood: "Hollywood",
    other: "Resten",
    hiddenGems: "Oppdagelsesreisende",
    hiddenGemsDesc: (n: number) => `${n} skjulte perler oppdaget`,
    vibeTitle: "Din vibe",
    share: "Del din Wrapped",
    shareDesc: "Vis filmsmaken din!",
    copyLink: "Kopier lenke",
    copied: "Kopiert!",
    download: "Last ned som bilde",
    back: "Tilbake",
    prev: "Forrige",
    next: "Neste",
    logflix: "logflix.app",
  },
  dk: {
    loading: "Genererer din Wrapped...",
    insufficientTitle: "Ikke nok data endnu",
    insufficientDesc: (n: number) => `Du har logget ${n} titler denne måned. Log mindst 3 for at se din Wrapped!`,
    yourMonth: (m: string) => `Din ${m}`,
    viewingMonth: (name: string, m: string) => `${name}s ${m}`,
    titlesTotal: "titler totalt",
    movies: "film",
    tvShows: "serier",
    hours: "timer",
    yourNumbers: "Dine tal",
    topGenre: "Din top-genre",
    enthusiast: (g: string) => `${g}-entusiast`,
    uniqueGenres: (n: number) => `${n} unikke genrer udforsket`,
    favorites: "Dine topscorere",
    moodMap: "Stemningskort",
    nightOwl: "Natuglen",
    nightOwlDesc: (p: number) => `${p}% af dine titler blev logget efter midnat`,
    nordicNoir: "Nordic Noir",
    nordicNoirDesc: (p: number) => `${p}% af dine titler er Nordic Noir`,
    streak: "Længste streak",
    streakDays: (n: number) => `${n} ${n === 1 ? "dag" : "dage"} i træk`,
    wtMatches: "Se Sammen",
    wtMatchesDesc: (n: number) => `${n} ${n === 1 ? "match" : "matches"} denne måned`,
    watchlistAdds: "Tilføjet til watchlist",
    timeCapsule: "Tidskapslen",
    timeCapsuleDesc: (decade: string, n: number) => `${decade}'erne var din favorit med ${n} titler`,
    globetrotter: "Globetrotter",
    nordic: "Norden",
    hollywood: "Hollywood",
    other: "Resten",
    hiddenGems: "Opdagelsesrejsende",
    hiddenGemsDesc: (n: number) => `${n} skjulte perler opdaget`,
    vibeTitle: "Din vibe",
    share: "Del din Wrapped",
    shareDesc: "Vis din filmsmag!",
    copyLink: "Kopiér link",
    copied: "Kopieret!",
    download: "Download som billede",
    back: "Tilbage",
    prev: "Forrige",
    next: "Næste",
    logflix: "logflix.app",
  },
  fi: {
    loading: "Luodaan Wrapped-yhteenvetoa...",
    insufficientTitle: "Ei tarpeeksi dataa vielä",
    insufficientDesc: (n: number) => `Olet kirjannut ${n} nimikettä tässä kuussa. Kirjaa vähintään 3 nähdäksesi Wrappedisi!`,
    yourMonth: (m: string) => `Sinun ${m}`,
    viewingMonth: (name: string, m: string) => `${name}: ${m}`,
    titlesTotal: "nimikettä yhteensä",
    movies: "elokuvia",
    tvShows: "sarjoja",
    hours: "tuntia",
    yourNumbers: "Numerosi",
    topGenre: "Suosikkigenresi",
    enthusiast: (g: string) => `${g}-fani`,
    uniqueGenres: (n: number) => `${n} eri genreä tutkittu`,
    favorites: "Suosikkisi",
    moodMap: "Tunnelmakartta",
    nightOwl: "Yökyöpeli",
    nightOwlDesc: (p: number) => `${p}% nimikkeistäsi kirjattiin keskiyön jälkeen`,
    nordicNoir: "Nordic Noir",
    nordicNoirDesc: (p: number) => `${p}% nimikkeistäsi on Nordic Noir`,
    streak: "Pisin putki",
    streakDays: (n: number) => `${n} ${n === 1 ? "päivä" : "päivää"} putkeen`,
    wtMatches: "Katsotaan yhdessä",
    wtMatchesDesc: (n: number) => `${n} ${n === 1 ? "osuma" : "osumaa"} tässä kuussa`,
    watchlistAdds: "Lisätty katselulistalle",
    timeCapsule: "Aikakapseli",
    timeCapsuleDesc: (decade: string, n: number) => `${decade}-luku oli suosikkisi ${n} nimikkeellä`,
    globetrotter: "Maailmanmatkaaja",
    nordic: "Pohjoismaat",
    hollywood: "Hollywood",
    other: "Muu",
    hiddenGems: "Löytöretkeilijä",
    hiddenGemsDesc: (n: number) => `${n} piilotettu helmi löydetty`,
    vibeTitle: "Tunnelmasi",
    share: "Jaa Wrapped",
    shareDesc: "Näytä elokuvamakusi!",
    copyLink: "Kopioi linkki",
    copied: "Kopioitu!",
    download: "Lataa kuvana",
    back: "Takaisin",
    prev: "Edellinen",
    next: "Seuraava",
    logflix: "logflix.app",
  },
  se: {
    loading: "Genererar din Wrapped...",
    insufficientTitle: "Inte tillräckligt med data ännu",
    insufficientDesc: (n: number) => `Du har loggat ${n} titlar den här månaden. Logga minst 3 för att se din Wrapped!`,
    yourMonth: (m: string) => `Din ${m}`,
    viewingMonth: (name: string, m: string) => `${name}s ${m}`,
    titlesTotal: "titlar totalt",
    movies: "filmer",
    tvShows: "serier",
    hours: "timmar",
    yourNumbers: "Dina siffror",
    topGenre: "Din toppgenre",
    enthusiast: (g: string) => `${g}-entusiast`,
    uniqueGenres: (n: number) => `${n} unika genrer utforskade`,
    favorites: "Dina favoriter",
    moodMap: "Stämningskarta",
    nightOwl: "Nattugglan",
    nightOwlDesc: (p: number) => `${p}% av dina titlar loggades efter midnatt`,
    nordicNoir: "Nordic Noir",
    nordicNoirDesc: (p: number) => `${p}% av dina titlar är Nordic Noir`,
    streak: "Längsta sviten",
    streakDays: (n: number) => `${n} ${n === 1 ? "dag" : "dagar"} i rad`,
    wtMatches: "Se Tillsammans",
    wtMatchesDesc: (n: number) => `${n} ${n === 1 ? "match" : "matchningar"} den här månaden`,
    watchlistAdds: "Tillagt på bevakningslistan",
    timeCapsule: "Tidskapseln",
    timeCapsuleDesc: (decade: string, n: number) => `${decade}-talet var din favorit med ${n} titlar`,
    globetrotter: "Globetrotter",
    nordic: "Norden",
    hollywood: "Hollywood",
    other: "Övriga",
    hiddenGems: "Upptäcktsresande",
    hiddenGemsDesc: (n: number) => `${n} gömda pärlor upptäckta`,
    vibeTitle: "Din vibe",
    share: "Dela din Wrapped",
    shareDesc: "Visa din filmsmak!",
    copyLink: "Kopiera länk",
    copied: "Kopierat!",
    download: "Ladda ner som bild",
    back: "Tillbaka",
    prev: "Föregående",
    next: "Nästa",
    logflix: "logflix.app",
  },
} as const;

type WLocale = keyof typeof WRAPPED_TEXT;

const MONTH_NAMES: Record<WLocale, string[]> = {
  no: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
  dk: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  fi: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
  se: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
};

function formatMonth(ym: string, locale: WLocale): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[locale][parseInt(m) - 1]} ${y}`;
}

/* ── Types ────────────────────────────────────────────── */

interface TopTitle {
  tmdb_id: number;
  type: string;
  title: string | null;
  poster_path: string | null;
  year: number | null;
}

interface WrappedStats {
  totalWatched: number;
  movies: number;
  tvShows: number;
  estimatedHours: number;
  topGenres: { name: string; count: number; percent: number }[];
  uniqueGenres: number;
  topTitles: TopTitle[];
  moodBreakdown: { tag: string; count: number }[];
  nordicNoirPercent: number;
  nightOwlPercent: number;
  wtMatches: number;
  watchlistAdds: number;
  longestStreak: number;
  favoriteDecade: { decade: string; count: number } | null;
  globetrotter: { nordic: number; hollywood: number; other: number };
  hiddenGems: number;
  vibeTitle: string | null;
}

/* ── Styles ───────────────────────────────────────────── */

const glassStyle: React.CSSProperties = {
  background: "rgba(10,10,10,0.65)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
};

/* ── Animated counter ─────────────────────────────────── */

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display}{suffix}</span>;
}

/* ── Slide components ─────────────────────────────────── */

function SlideHero({ stats, month, displayName, isOwner, locale }: {
  stats: WrappedStats; month: string; displayName: string | null; isOwner: boolean; locale: WLocale;
}) {
  const t = WRAPPED_TEXT[locale];
  const monthStr = formatMonth(month, locale);
  const heading = isOwner
    ? t.yourMonth(monthStr)
    : t.viewingMonth(displayName || "?", monthStr);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">Logflix Wrapped</p>
      <h1 className="text-4xl sm:text-5xl font-black mb-6" style={{
        background: "linear-gradient(180deg, #fff 40%, rgba(229,9,20,0.8) 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>
        {heading}
      </h1>
      <p className="text-5xl font-black text-white mb-2">
        <Counter value={stats.totalWatched} />
      </p>
      <p className="text-sm text-white/50">{t.titlesTotal}</p>
      {stats.vibeTitle && (
        <div className="mt-6 px-5 py-2.5 rounded-full border border-[rgba(229,9,20,0.3)] bg-[rgba(229,9,20,0.08)]">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{t.vibeTitle}</p>
          <p className="text-sm font-bold text-white/90">{stats.vibeTitle}</p>
        </div>
      )}
    </div>
  );
}

function SlideNumbers({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-6">{t.yourNumbers}</p>
      <div className="grid grid-cols-3 gap-8 mb-8">
        {[
          { val: stats.movies, label: t.movies },
          { val: stats.tvShows, label: t.tvShows },
          { val: stats.estimatedHours, label: t.hours },
        ].map(({ val, label }) => (
          <div key={label}>
            <p className="text-4xl font-black" style={{
              background: "linear-gradient(180deg, #fff 60%, rgba(255,255,255,0.4) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}><Counter value={val} /></p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTopGenre({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  if (stats.topGenres.length === 0) return null;
  const top = stats.topGenres[0];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">{t.topGenre}</p>
      <p className="text-5xl font-black mb-3" style={{
        background: "linear-gradient(180deg, #fff 40%, rgba(229,9,20,0.8) 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>{top.name}</p>
      <p className="text-base text-white/50 mb-8">{t.enthusiast(top.name)}</p>
      <div className="w-full max-w-xs space-y-2.5">
        {stats.topGenres.map((g, i) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className="text-xs text-white/30 w-5 text-right font-mono">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-white/80">{g.name}</span>
                <span className="text-[10px] text-white/30">{g.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full transition-all duration-1000" style={{
                  width: `${g.percent}%`,
                  background: i === 0 ? "linear-gradient(90deg, #E50914, #ff4444)" : `rgba(229,9,20,${Math.max(0.2, 0.7 - i * 0.12)})`,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-4">{t.uniqueGenres(stats.uniqueGenres)}</p>
    </div>
  );
}

function SlideFavorites({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  if (stats.topTitles.length === 0) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-6">{t.favorites}</p>
      <div className="flex gap-4 justify-center flex-wrap">
        {stats.topTitles.map((title, i) => (
          <div key={`${title.tmdb_id}:${title.type}`} className="text-center" style={{ animationDelay: `${i * 150}ms` }}>
            <div className={`w-[110px] aspect-[2/3] rounded-xl overflow-hidden mb-2 ${i === 0 ? "ring-2 ring-[#E50914] ring-offset-2 ring-offset-[#06080f]" : ""}`}>
              {title.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${title.poster_path}`}
                  alt={title.title || ""}
                  width={110}
                  height={165}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.05] flex items-center justify-center text-2xl text-white/20">?</div>
              )}
            </div>
            <p className="text-[10px] text-white/60 truncate max-w-[110px]">{title.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMoods({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  if (stats.moodBreakdown.length === 0) return null;
  const maxCount = stats.moodBreakdown[0]?.count || 1;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-6">{t.moodMap}</p>
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {stats.moodBreakdown.map((m) => {
          const scale = 0.7 + (m.count / maxCount) * 0.3;
          return (
            <span
              key={m.tag}
              className="px-3 py-1.5 rounded-full border border-white/[0.08] text-xs transition-all"
              style={{
                background: `rgba(229,9,20,${0.04 + (m.count / maxCount) * 0.12})`,
                color: `rgba(255,255,255,${0.4 + (m.count / maxCount) * 0.4})`,
                fontSize: `${scale * 12}px`,
              }}
            >
              {m.tag} <span className="text-white/25 ml-1">{m.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SlideNightOwl({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-10">
      {/* Night owl */}
      <div>
        <p className="text-3xl mb-2">🦉</p>
        <p className="text-lg font-bold text-white/90 mb-1">{t.nightOwl}</p>
        <p className="text-4xl font-black" style={{
          background: "linear-gradient(180deg, #fff 60%, rgba(255,255,255,0.4) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}><Counter value={stats.nightOwlPercent} suffix="%" /></p>
        <p className="text-xs text-white/40 mt-1 max-w-xs">{t.nightOwlDesc(stats.nightOwlPercent)}</p>
      </div>
      {/* Nordic Noir */}
      {stats.nordicNoirPercent > 0 && (
        <div>
          <p className="text-lg font-bold text-white/90 mb-1">{t.nordicNoir}</p>
          <p className="text-4xl font-black" style={{
            background: "linear-gradient(180deg, #fff 60%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}><Counter value={stats.nordicNoirPercent} suffix="%" /></p>
          <p className="text-xs text-white/40 mt-1 max-w-xs">{t.nordicNoirDesc(stats.nordicNoirPercent)}</p>
        </div>
      )}
    </div>
  );
}

function SlideActivity({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-8">
      {/* Streak */}
      {stats.longestStreak > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-6 w-full max-w-xs" style={glassStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">{t.streak}</p>
          <p className="text-3xl font-black text-white/90"><Counter value={stats.longestStreak} /></p>
          <p className="text-xs text-white/40 mt-1">{t.streakDays(stats.longestStreak)}</p>
        </div>
      )}
      {/* WT matches */}
      <div className="rounded-2xl border border-white/[0.06] p-6 w-full max-w-xs" style={glassStyle}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">{t.wtMatches}</p>
        <p className="text-3xl font-black text-white/90"><Counter value={stats.wtMatches} /></p>
        <p className="text-xs text-white/40 mt-1">{t.wtMatchesDesc(stats.wtMatches)}</p>
      </div>
      {/* Watchlist */}
      {stats.watchlistAdds > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-6 w-full max-w-xs" style={glassStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">{t.watchlistAdds}</p>
          <p className="text-3xl font-black text-white/90"><Counter value={stats.watchlistAdds} /></p>
        </div>
      )}
    </div>
  );
}

function SlidePersonality({ stats, locale }: { stats: WrappedStats; locale: WLocale }) {
  const t = WRAPPED_TEXT[locale];
  const { globetrotter } = stats;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-6">
      {/* Tidskapselen */}
      {stats.favoriteDecade && (
        <div className="rounded-2xl border border-white/[0.06] p-5 w-full max-w-xs" style={glassStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">{t.timeCapsule}</p>
          <p className="text-3xl font-black text-white/90">{stats.favoriteDecade.decade}s</p>
          <p className="text-xs text-white/40 mt-1">{t.timeCapsuleDesc(stats.favoriteDecade.decade, stats.favoriteDecade.count)}</p>
        </div>
      )}
      {/* Globetrotter */}
      <div className="rounded-2xl border border-white/[0.06] p-5 w-full max-w-xs" style={glassStyle}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-3">{t.globetrotter}</p>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-2">
          {globetrotter.nordic > 0 && (
            <div className="h-full rounded-l-full" style={{ width: `${globetrotter.nordic}%`, background: "#3b82f6" }} />
          )}
          {globetrotter.hollywood > 0 && (
            <div className="h-full" style={{ width: `${globetrotter.hollywood}%`, background: "#E50914" }} />
          )}
          {globetrotter.other > 0 && (
            <div className="h-full rounded-r-full" style={{ width: `${globetrotter.other}%`, background: "rgba(255,255,255,0.2)" }} />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-white/40">
          <span><span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6] mr-1" />{t.nordic} {globetrotter.nordic}%</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-[#E50914] mr-1" />{t.hollywood} {globetrotter.hollywood}%</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-white/20 mr-1" />{t.other} {globetrotter.other}%</span>
        </div>
      </div>
      {/* Hidden gems */}
      {stats.hiddenGems > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-5 w-full max-w-xs" style={glassStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-2">{t.hiddenGems}</p>
          <p className="text-3xl font-black text-white/90"><Counter value={stats.hiddenGems} /></p>
          <p className="text-xs text-white/40 mt-1">{t.hiddenGemsDesc(stats.hiddenGems)}</p>
        </div>
      )}
    </div>
  );
}

function SlideShare({ isOwner, month, locale, userId, shareRef }: {
  isOwner: boolean; month: string; locale: WLocale; userId: string | null; shareRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = WRAPPED_TEXT[locale];
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/wrapped/${month}${userId ? `?u=${userId}` : ""}`
    : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleDownload = useCallback(async () => {
    if (!shareRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        backgroundColor: "#06080f",
      });
      const link = document.createElement("a");
      link.download = `logflix-wrapped-${month}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silent
    }
    setDownloading(false);
  }, [shareRef, month]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">{t.share}</p>
      <p className="text-3xl font-black mb-2" style={{
        background: "linear-gradient(180deg, #fff 40%, rgba(229,9,20,0.8) 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>Logflix Wrapped</p>
      <p className="text-sm text-white/40 mb-8 max-w-sm">{t.shareDesc}</p>
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
          </svg>
          {copied ? t.copied : t.copyLink}
        </button>
        {isOwner && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
            style={{ background: "#E50914" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? "..." : t.download}
          </button>
        )}
        <Link
          href="/home"
          className="mt-2 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          {t.back}
        </Link>
      </div>
    </div>
  );
}

/* ── Share card (hidden, used for image export) ───────── */

function ShareCard({ stats, month, displayName, locale, cardRef }: {
  stats: WrappedStats; month: string; displayName: string | null; locale: WLocale;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = WRAPPED_TEXT[locale];
  const monthStr = formatMonth(month, locale);
  const top = stats.topGenres[0];

  return (
    <div
      ref={cardRef}
      className="fixed -left-[9999px] top-0"
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(180deg, #06080f 0%, #0d0f14 40%, #1a0a0a 100%)",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top */}
      <div>
        <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
          Logflix Wrapped
        </p>
        <p style={{ fontSize: 64, fontWeight: 900, color: "#fff", marginTop: 16 }}>
          {displayName ? `${displayName}s` : ""} {monthStr}
        </p>
        {stats.vibeTitle && (
          <p style={{ fontSize: 32, fontWeight: 700, color: "rgba(229,9,20,0.85)", marginTop: 12 }}>
            &quot;{stats.vibeTitle}&quot;
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Numbers row */}
        <div style={{ display: "flex", gap: 40 }}>
          {[
            { val: stats.totalWatched, label: t.titlesTotal },
            { val: stats.movies, label: t.movies },
            { val: stats.tvShows, label: t.tvShows },
            { val: stats.estimatedHours, label: t.hours },
          ].map(({ val, label }) => (
            <div key={label} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "28px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 56, fontWeight: 900, color: "#fff" }}>{val}</p>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Top genre */}
        {top && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em" }}>{t.topGenre}</p>
            <p style={{ fontSize: 72, fontWeight: 900, color: "#E50914", marginTop: 8 }}>{top.name}</p>
          </div>
        )}

        {/* Fun stats */}
        <div style={{ display: "flex", gap: 24 }}>
          {stats.nightOwlPercent > 0 && (
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <p style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{t.nightOwl}</p>
              <p style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{stats.nightOwlPercent}%</p>
            </div>
          )}
          {stats.longestStreak > 0 && (
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <p style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{t.streak}</p>
              <p style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{stats.longestStreak}</p>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>{t.streakDays(stats.longestStreak)}</p>
            </div>
          )}
          {stats.hiddenGems > 0 && (
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <p style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{t.hiddenGems}</p>
              <p style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{stats.hiddenGems}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom branding */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 24, fontWeight: 700, color: "rgba(229,9,20,0.6)", letterSpacing: "0.1em" }}>{t.logflix}</p>
      </div>
    </div>
  );
}

/* ── Background gradient per slide ────────────────────── */

const SLIDE_GRADIENTS = [
  "rgba(229,9,20,0.08)",
  "rgba(229,9,20,0.06)",
  "rgba(255,107,107,0.06)",
  "rgba(52,211,153,0.05)",
  "rgba(56,189,248,0.05)",
  "rgba(168,85,247,0.05)",
  "rgba(229,9,20,0.06)",
  "rgba(59,130,246,0.06)",
  "rgba(229,9,20,0.05)",
];

/* ── Main page ────────────────────────────────────────── */

export default function WrappedMonthPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const month = params.month as string;
  const userId = searchParams.get("u");

  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [insufficient, setInsufficient] = useState(false);
  const [insufficientCount, setInsufficientCount] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [locale] = useState<WLocale>("no"); // Default, could detect from profile
  const touchStartX = useRef(0);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("month", month);
    if (userId) params.set("u", userId);

    fetch(`/api/wrapped-monthly?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.insufficient) {
          setInsufficient(true);
          setInsufficientCount(d.count || 0);
        } else {
          setStats(d.stats);
        }
        setDisplayName(d.displayName || null);
        setIsOwner(!!d.isOwner);
      })
      .catch(() => setInsufficient(true))
      .finally(() => setLoading(false));
  }, [month, userId]);

  const slides = stats ? [
    <SlideHero key="hero" stats={stats} month={month} displayName={displayName} isOwner={isOwner} locale={locale} />,
    <SlideNumbers key="numbers" stats={stats} locale={locale} />,
    ...(stats.topGenres.length > 0 ? [<SlideTopGenre key="genre" stats={stats} locale={locale} />] : []),
    ...(stats.topTitles.length > 0 ? [<SlideFavorites key="fav" stats={stats} locale={locale} />] : []),
    ...(stats.moodBreakdown.length > 0 ? [<SlideMoods key="moods" stats={stats} locale={locale} />] : []),
    <SlideNightOwl key="nightowl" stats={stats} locale={locale} />,
    <SlideActivity key="activity" stats={stats} locale={locale} />,
    <SlidePersonality key="personality" stats={stats} locale={locale} />,
    <SlideShare key="share" isOwner={isOwner} month={month} locale={locale} userId={userId} shareRef={shareCardRef} />,
  ] : [];

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
  }, [goNext, goPrev]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const t = WRAPPED_TEXT[locale];

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#06080f" }}>
      <LoadingSpinner text={t.loading} />
    </div>
  );

  if (insufficient) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6" style={{ background: "#06080f" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">Logflix Wrapped</p>
        <h1 className="text-2xl font-bold text-white/80 mb-3">{t.insufficientTitle}</h1>
        <p className="text-sm text-white/40 mb-8 max-w-sm">{t.insufficientDesc(insufficientCount)}</p>
        <Link
          href="/home"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#E50914" }}
        >
          {t.back}
        </Link>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "#06080f" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${SLIDE_GRADIENTS[currentSlide % SLIDE_GRADIENTS.length]} 0%, transparent 70%)`,
          }}
        />

        {/* Close */}
        <Link
          href="/home"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
          style={glassStyle}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        {/* Slides */}
        <div className="flex-1 relative overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-500"
              style={{
                opacity: i === currentSlide ? 1 : 0,
                transform: i === currentSlide ? "translateX(0)" : i < currentSlide ? "translateX(-30%)" : "translateX(30%)",
                pointerEvents: i === currentSlide ? "auto" : "none",
              }}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Progress dots + nav */}
        <div className="relative z-10 pb-8 pt-4 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  background: i === currentSlide ? "#E50914" : "rgba(255,255,255,0.15)",
                  width: i === currentSlide ? 24 : 8,
                }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button
                onClick={goPrev}
                className="px-5 py-2 rounded-xl text-sm font-medium border border-white/[0.08] text-white/50 hover:text-white/80 transition-colors cursor-pointer"
              >
                {t.prev}
              </button>
            )}
            {currentSlide < slides.length - 1 && (
              <button
                onClick={goNext}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: "#E50914" }}
              >
                {t.next}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden share card for image export */}
      {stats && (
        <ShareCard
          stats={stats}
          month={month}
          displayName={displayName}
          locale={locale}
          cardRef={shareCardRef}
        />
      )}
    </>
  );
}
