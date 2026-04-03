"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

/* ── i18n ─────────────────────────────────────────── */

type Locale = "no" | "en" | "dk" | "se" | "fi";

const strings = {
  no: {
    pageTitle: "Blinddate-kveld",
    searchPlaceholder: "Sok etter film eller serie...",
    pickTitle: "Velg en tittel til partneren din",
    pickSub: "De far ikke vite hva det er for de trykker play.",
    yourPick: "Ditt valg:",
    shareLinkLabel: "Del denne lenken med partneren din:",
    copied: "Kopiert!",
    copyLink: "Kopier lenke",
    newPick: "Velg en annen",
    mysteryTitle: "Din partner har valgt noe til deg. Tor du se det?",
    genre: "Sjanger",
    runtime: "Lengde",
    year: "Ar",
    min: "min",
    seasons: "sesonger",
    reveal: "Vi er klare \u2014 avslor!",
    revealed: "God kveld \u2014 dette er kveldens film!",
    revealedTv: "God kveld \u2014 dette er kveldens serie!",
    loading: "Laster...",
    noResults: "Ingen resultater",
    movie: "Film",
    tv: "Serie",
  },
  en: {
    pageTitle: "Blind Date Night",
    searchPlaceholder: "Search for a movie or show...",
    pickTitle: "Pick a title for your partner",
    pickSub: "They won\u2019t know what it is until they press play.",
    yourPick: "Your pick:",
    shareLinkLabel: "Share this link with your partner:",
    copied: "Copied!",
    copyLink: "Copy link",
    newPick: "Pick another",
    mysteryTitle: "Your partner has picked something for you. Dare to watch?",
    genre: "Genre",
    runtime: "Runtime",
    year: "Year",
    min: "min",
    seasons: "seasons",
    reveal: "We\u2019re ready \u2014 reveal!",
    revealed: "Good evening \u2014 tonight\u2019s movie is!",
    revealedTv: "Good evening \u2014 tonight\u2019s show is!",
    loading: "Loading...",
    noResults: "No results",
    movie: "Movie",
    tv: "Show",
  },
  dk: {
    pageTitle: "Blinddate-aften",
    searchPlaceholder: "Sog efter film eller serie...",
    pickTitle: "Vaelg en titel til din partner",
    pickSub: "De far ikke at vide hvad det er for de trykker play.",
    yourPick: "Dit valg:",
    shareLinkLabel: "Del denne lenke med din partner:",
    copied: "Kopieret!",
    copyLink: "Kopier lenke",
    newPick: "Vaelg en anden",
    mysteryTitle: "Din partner har valgt noget til dig. Tor du se det?",
    genre: "Genre",
    runtime: "Laengde",
    year: "Ar",
    min: "min",
    seasons: "saesoner",
    reveal: "Vi er klar \u2014 afslor!",
    revealed: "God aften \u2014 aftenens film er!",
    revealedTv: "God aften \u2014 aftenens serie er!",
    loading: "Indlaeser...",
    noResults: "Ingen resultater",
    movie: "Film",
    tv: "Serie",
  },
  se: {
    pageTitle: "Blinddate-kvall",
    searchPlaceholder: "Sok efter film eller serie...",
    pickTitle: "Valj en titel at din partner",
    pickSub: "De far inte veta vad det ar forran de trycker play.",
    yourPick: "Ditt val:",
    shareLinkLabel: "Dela denna lank med din partner:",
    copied: "Kopierat!",
    copyLink: "Kopiera lank",
    newPick: "Valj en annan",
    mysteryTitle: "Din partner har valt nagot at dig. Vagar du se det?",
    genre: "Genre",
    runtime: "Langd",
    year: "Ar",
    min: "min",
    seasons: "sasonger",
    reveal: "Vi ar redo \u2014 avsloja!",
    revealed: "God kvall \u2014 kvallens film ar!",
    revealedTv: "God kvall \u2014 kvallens serie ar!",
    loading: "Laddar...",
    noResults: "Inga resultat",
    movie: "Film",
    tv: "Serie",
  },
  fi: {
    pageTitle: "Sokkotreffien ilta",
    searchPlaceholder: "Etsi elokuvaa tai sarjaa...",
    pickTitle: "Valitse nimike kumppanillesi",
    pickSub: "He eivat tieda mita se on ennen kuin painavat play.",
    yourPick: "Valintasi:",
    shareLinkLabel: "Jaa tama linkki kumppanillesi:",
    copied: "Kopioitu!",
    copyLink: "Kopioi linkki",
    newPick: "Valitse toinen",
    mysteryTitle: "Kumppanisi on valinnut jotain sinulle. Uskaltaatko katsoa?",
    genre: "Genre",
    runtime: "Kesto",
    year: "Vuosi",
    min: "min",
    seasons: "kausia",
    reveal: "Olemme valmiit \u2014 paljasta!",
    revealed: "Hyvaa iltaa \u2014 illan elokuva on!",
    revealedTv: "Hyvaa iltaa \u2014 illan sarja on!",
    loading: "Ladataan...",
    noResults: "Ei tuloksia",
    movie: "Elokuva",
    tv: "Sarja",
  },
} as const;

/* ── Types ────────────────────────────────────────── */

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  overview?: string;
}

interface TitleDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  genres: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number | null;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

/* ── Genre ID → English name (fallback if detail fetch fails) ── */

const GENRE_FALLBACK: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10765: "Sci-Fi & Fantasy",
};

/* ── Helpers ──────────────────────────────────────── */

function getLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2) ?? "en";
  if (lang === "nb" || lang === "nn") return "no";
  if (lang === "da") return "dk";
  if (lang === "sv") return "se";
  if (lang === "fi") return "fi";
  return "en";
}

function getYear(d: TitleDetails): string {
  return (d.release_date || d.first_air_date || "").slice(0, 4) || "—";
}

function getRuntime(d: TitleDetails, s: { min: string; seasons: string }): string {
  if (d.runtime) return `${d.runtime} ${s.min}`;
  if (d.number_of_seasons) return `${d.number_of_seasons} ${s.seasons}`;
  return "—";
}

function getGenres(d: TitleDetails): string {
  return d.genres?.map((g) => g.name).join(", ") || "—";
}

function getType(d: TitleDetails): "movie" | "tv" {
  return d.title ? "movie" : "tv";
}

/* ── Component ───────────────────────────────────── */

export default function BlindDatePage() {
  const searchParams = useSearchParams();
  const tmdbId = searchParams.get("id");
  const typeParam = searchParams.get("type") as "movie" | "tv" | null;

  const [locale] = useState<Locale>(getLocale);
  const s = strings[locale] ?? strings.en;

  // Picker state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<TitleDetails | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Receiver state
  const [mystery, setMystery] = useState<TitleDetails | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // If ?id= is present, this is the receiver view
  const isReceiver = !!tmdbId;

  // Fetch details for receiver
  useEffect(() => {
    if (!tmdbId) return;
    setLoadingDetails(true);
    const type = typeParam || "movie";
    fetch(`/api/tmdb/details?tmdb_id=${tmdbId}&type=${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.details) setMystery(data.details);
        else if (data.title) {
          // The details API returns parsed data — reconstruct
          setMystery({
            id: parseInt(tmdbId),
            title: type === "movie" ? data.title : undefined,
            name: type === "tv" ? data.title : undefined,
            poster_path: data.poster_path || null,
            genres: data.genres || [],
            runtime: data.runtime || null,
            number_of_seasons: data.number_of_seasons || null,
            release_date: data.release_date || data.year ? `${data.year}` : undefined,
            first_air_date: type === "tv" ? (data.first_air_date || (data.year ? `${data.year}` : undefined)) : undefined,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDetails(false));
  }, [tmdbId, typeParam]);

  // Search TMDB
  useEffect(() => {
    if (!query.trim() || isReceiver) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}&type=multi`);
        const data = await res.json();
        const items = (data.results || []) as SearchResult[];
        setResults(items.filter((r) => r.media_type === "movie" || r.media_type === "tv").slice(0, 8));
      } catch { /* ignore */ }
      setSearching(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, isReceiver]);

  // Pick a title
  async function handlePick(result: SearchResult) {
    setResults([]);
    setQuery("");
    try {
      const res = await fetch(`/api/tmdb/details?tmdb_id=${result.id}&type=${result.media_type}`);
      const data = await res.json();
      if (data.details) {
        setPicked(data.details);
      } else if (data.title) {
        setPicked({
          id: result.id,
          title: result.media_type === "movie" ? data.title : undefined,
          name: result.media_type === "tv" ? data.title : undefined,
          poster_path: data.poster_path || result.poster_path || null,
          genres: data.genres || [],
          runtime: data.runtime || null,
          number_of_seasons: data.number_of_seasons || null,
          release_date: data.release_date || result.release_date,
          first_air_date: data.first_air_date || result.first_air_date,
        });
      }
    } catch {
      // Fallback with search data
      setPicked({
        id: result.id,
        title: result.title,
        name: result.name,
        poster_path: result.poster_path,
        genres: (result.genre_ids || []).map((gid) => ({ id: gid, name: GENRE_FALLBACK[gid] || "Unknown" })),
        runtime: null,
        release_date: result.release_date,
        first_air_date: result.first_air_date,
      });
    }
  }

  function getShareLink(d: TitleDetails): string {
    const type = getType(d);
    return `${window.location.origin}/blinddate?id=${d.id}&type=${type}`;
  }

  async function copyShareLink() {
    if (!picked) return;
    try {
      await navigator.clipboard.writeText(getShareLink(picked));
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* ignore */ }
  }

  /* ── Receiver: loading ── */
  if (isReceiver && loadingDetails) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-sm text-white/40 animate-pulse">{s.loading}</p>
      </div>
    );
  }

  /* ── Receiver: mystery / reveal ── */
  if (isReceiver && mystery) {
    const type = getType(mystery);
    const titleName = mystery.title || mystery.name || "";

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-6" style={{ color: "#ff2a2a" }}>
          {s.pageTitle}
        </p>

        {/* Mystery card */}
        <div
          className="w-full max-w-xs rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Poster area */}
          <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.02)" }}>
            {revealed && mystery.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${mystery.poster_path}`}
                alt={titleName}
                fill
                className="object-cover animate-fade-in-up"
                sizes="320px"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <span style={{ fontSize: 64, opacity: 0.3 }}>?</span>
              </div>
            )}
          </div>

          {/* Info area */}
          <div className="p-5">
            {!revealed ? (
              <>
                <p className="text-sm text-white/60 text-center leading-relaxed mb-5">{s.mysteryTitle}</p>

                {/* Clues */}
                <div className="flex justify-center gap-4 mb-6">
                  {[
                    { label: s.genre, value: getGenres(mystery) },
                    { label: s.runtime, value: getRuntime(mystery, s) },
                    { label: s.year, value: getYear(mystery) },
                  ].map((clue) => (
                    <div key={clue.label} className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1">{clue.label}</p>
                      <p className="text-xs font-semibold text-white/70">{clue.value}</p>
                    </div>
                  ))}
                </div>

                {/* Reveal button */}
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #B00000, #E50914)", boxShadow: "0 0 24px rgba(229,9,20,0.4)" }}
                >
                  {s.reveal}
                </button>
              </>
            ) : (
              <div className="animate-fade-in-up">
                <p className="text-[10px] font-bold uppercase tracking-wider text-center mb-2" style={{ color: "#ff2a2a" }}>
                  {type === "movie" ? s.revealed : s.revealedTv}
                </p>
                <h2 className="text-xl font-extrabold text-white text-center mb-2 tracking-tight">{titleName}</h2>
                <p className="text-xs text-white/40 text-center mb-3">{getYear(mystery)} &middot; {getGenres(mystery)}</p>
                {mystery.overview && (
                  <p className="text-xs text-white/50 leading-relaxed text-center line-clamp-4">{mystery.overview}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Picker: title already picked ── */
  if (picked) {
    const type = getType(picked);
    const titleName = picked.title || picked.name || "";

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-6" style={{ color: "#ff2a2a" }}>
          {s.pageTitle}
        </p>

        <div
          className="w-full max-w-xs rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Poster */}
          {picked.poster_path && (
            <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
              <Image
                src={`https://image.tmdb.org/t/p/w500${picked.poster_path}`}
                alt={titleName}
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
          )}

          {/* Info */}
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">{s.yourPick}</p>
            <h2 className="text-lg font-bold text-white mb-1">{titleName}</h2>
            <p className="text-xs text-white/40 mb-4">
              {getYear(picked)} &middot; {getGenres(picked)} &middot; {type === "movie" ? s.movie : s.tv}
            </p>

            {/* Share link */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">{s.shareLinkLabel}</p>
            <div className="flex gap-2 mb-4">
              <div
                className="flex-1 rounded-lg px-3 py-2 text-xs text-white/60 truncate select-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {getShareLink(picked)}
              </div>
              <button
                onClick={copyShareLink}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                style={{ background: linkCopied ? "#22c55e" : "#ff2a2a" }}
              >
                {linkCopied ? s.copied : s.copyLink}
              </button>
            </div>

            {/* Pick another */}
            <button
              onClick={() => setPicked(null)}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-white/50 transition-all hover:text-white/70 cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {s.newPick}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Picker: search screen ── */
  return (
    <div className="min-h-[80vh] flex flex-col items-center px-4 pt-16 animate-fade-in-up">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "#ff2a2a" }}>
        {s.pageTitle}
      </p>
      <h1 className="text-2xl font-extrabold text-white text-center mb-2 tracking-tight">{s.pickTitle}</h1>
      <p className="text-sm text-white/40 text-center mb-8 max-w-xs">{s.pickSub}</p>

      {/* Search input */}
      <div className="w-full max-w-sm relative">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all focus-within:border-red-600/40"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/20"
            autoFocus
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          )}
        </div>

        {/* Results dropdown */}
        {results.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
            style={{
              background: "rgba(15,15,20,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
          >
            {results.map((r) => {
              const title = r.title || r.name || "";
              const year = (r.release_date || r.first_air_date || "").slice(0, 4);
              return (
                <button
                  key={`${r.id}-${r.media_type}`}
                  onClick={() => handlePick(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06] cursor-pointer"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
                    {r.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                        alt={title}
                        width={40}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{title}</p>
                    <p className="text-[11px] text-white/35">
                      {year}{year ? " \u00b7 " : ""}{r.media_type === "movie" ? s.movie : s.tv}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {query.trim() && !searching && results.length === 0 && (
          <p className="text-xs text-white/25 text-center mt-4">{s.noResults}</p>
        )}
      </div>
    </div>
  );
}
