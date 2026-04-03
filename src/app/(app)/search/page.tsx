"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import AdvancedSearchPanel from "@/components/AdvancedSearchPanel";
import ConversionWall from "@/components/ConversionWall";
import GlowButton from "@/components/GlowButton";
import { logTitle } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useLocale } from "@/hooks/useLocale";
import { recordGuestTitleAction } from "@/lib/guest-actions";
import Link from "next/link";
import type { TMDBSearchResult, MediaType, AdvancedSearchFilters } from "@/lib/types";

/* ── Discovery row types ─────────────────────────────── */

interface DiscoveryItem {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
}

interface DiscoveryRowData {
  key: string;
  label: string;
  results: DiscoveryItem[];
}

/* ── Skeleton row ────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div className="mb-8">
      <div className="h-3 w-28 rounded bg-white/[0.06] mb-3 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[140px] aspect-[2/3] rounded-[10px] bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/* ── Single discovery row with scroll + arrows ───────── */

function DiscoveryRow({ row, onSelect }: { row: DiscoveryRowData; onSelect: (item: DiscoveryItem) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <div
      className="mb-12 relative group/row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3
        className="mb-3 px-0.5"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(212,168,83,0.7)", borderLeft: "2px solid rgba(212,168,83,0.4)", paddingLeft: 8 }}
      >
        {row.label}
      </h3>

      <div className="relative">
        {/* Left arrow */}
        {hovered && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-r from-black/60 to-transparent items-center justify-center cursor-pointer transition-opacity hidden md:flex"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 discovery-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x", overscrollBehaviorX: "contain" }}
        >
          {row.results.map((item) => {
            const title = item.title || item.name || "";
            const year = (item.release_date || item.first_air_date || "").slice(0, 4);
            const imgSrc = item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : null;

            return (
              <div
                key={`${item.id}-${item.media_type || "x"}`}
                className="flex-shrink-0 w-[140px] cursor-pointer group/card"
                onClick={() => onSelect(item)}
              >
                <div className="relative aspect-[2/3] w-full rounded-[10px] overflow-hidden bg-white/[0.03] transition-transform duration-250 ease-out group-hover/card:scale-[1.04]">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={title}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/10">
                        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-2.5">
                    <p className="text-[12px] font-semibold text-white leading-tight line-clamp-2">{title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {year && <span className="text-[10px] text-white/50">{year}</span>}
                      {item.vote_average > 0 && (
                        <span className="text-[10px] font-bold text-white bg-red-600 rounded px-1.5 py-0.5 leading-none">
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        {hovered && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-l from-black/60 to-transparent items-center justify-center cursor-pointer transition-opacity hidden md:flex"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

const strings = {
  no: {
    search: "Søk",
    wrappedReady: "Din Wrapped er klar",
    wrappedSubtitle: "Se ditt år i film og serier",
    searchPlaceholder: "Søk etter filmer og serier...",
    all: "Alle",
    movies: "Filmer",
    tv: "TV",
    searchBtn: "Søk",
    advancedSearch: "Avansert søk",
    hideWatchedLabel: "Skjul sette",
    backToSearch: "Tilbake til vanlig søk",
    searching: "Søker...",
    filmography: "Filmografi:",
    titles: "titler",
    advancedSearchDash: "Avansert søk —",
    results: "resultater",
    film: "Film",
    added: "Lagt til",
    liked: "Likte",
    disliked: "Nei",
    meh: "Meh",
    addWatchlist: "+ Se-liste",
    listPlus: "List+",
    loadMore: "Last inn flere",
    noResults: "Ingen resultater. Prøv å endre filtrene.",
    topicMatchHint: "Viser også relaterte filmer og serier basert på tema",
    noResultsFor: "Ingen resultater for",
    likedAction: "\ud83d\udc4d Likte",
    dislikedAction: "\ud83d\udc4e Nei",
    mehAction: "\ud83d\ude10 Meh",
    watchlistAction: "+ Se-liste",
  },
  en: {
    search: "Search",
    wrappedReady: "Your Wrapped is ready",
    wrappedSubtitle: "See your year in movies and series",
    searchPlaceholder: "Search for movies and series...",
    all: "All",
    movies: "Movies",
    tv: "TV",
    searchBtn: "Search",
    advancedSearch: "Advanced search",
    hideWatchedLabel: "Hide watched",
    backToSearch: "Back to regular search",
    searching: "Searching...",
    filmography: "Filmography:",
    titles: "titles",
    advancedSearchDash: "Advanced search —",
    results: "results",
    film: "Movie",
    added: "Added",
    liked: "Liked",
    disliked: "No",
    meh: "Meh",
    addWatchlist: "+ Watchlist",
    listPlus: "List+",
    loadMore: "Load more",
    noResults: "No results. Try changing the filters.",
    topicMatchHint: "Also showing related movies and series based on topic",
    noResultsFor: "No results for",
    likedAction: "\ud83d\udc4d Liked",
    dislikedAction: "\ud83d\udc4e No",
    mehAction: "\ud83d\ude10 Meh",
    watchlistAction: "+ Watchlist",
  },
  dk: {
    search: "Søg",
    wrappedReady: "Din Wrapped er klar",
    wrappedSubtitle: "Se dit år i film og serier",
    searchPlaceholder: "Søg efter film og serier...",
    all: "Alle",
    movies: "Film",
    tv: "TV",
    searchBtn: "Søg",
    advancedSearch: "Avanceret søgning",
    hideWatchedLabel: "Skjul sete",
    backToSearch: "Tilbage til normal søgning",
    searching: "Søger...",
    filmography: "Filmografi:",
    titles: "titler",
    advancedSearchDash: "Avanceret søgning —",
    results: "resultater",
    film: "Film",
    added: "Tilføjet",
    liked: "Kunne lide",
    disliked: "Nej",
    meh: "Meh",
    addWatchlist: "+ Watchlist",
    listPlus: "List+",
    loadMore: "Indlæs flere",
    noResults: "Ingen resultater. Prøv at ændre filtrene.",
    topicMatchHint: "Viser også relaterede film og serier baseret på tema",
    noResultsFor: "Ingen resultater for",
    likedAction: "\ud83d\udc4d Kunne lide",
    dislikedAction: "\ud83d\udc4e Nej",
    mehAction: "\ud83d\ude10 Meh",
    watchlistAction: "+ Watchlist",
  },
  se: {
    search: "Sök",
    wrappedReady: "Din Wrapped är klar",
    wrappedSubtitle: "Se ditt år i film och serier",
    searchPlaceholder: "Sök efter filmer och serier...",
    all: "Alla",
    movies: "Filmer",
    tv: "TV",
    searchBtn: "Sök",
    advancedSearch: "Avancerad sökning",
    hideWatchedLabel: "Dölj sedda",
    backToSearch: "Tillbaka till vanlig sökning",
    searching: "Söker...",
    filmography: "Filmografi:",
    titles: "titlar",
    advancedSearchDash: "Avancerad sökning —",
    results: "resultat",
    film: "Film",
    added: "Tillagd",
    liked: "Gillade",
    disliked: "Nej",
    meh: "Meh",
    addWatchlist: "+ Bevakningslista",
    listPlus: "List+",
    loadMore: "Ladda fler",
    noResults: "Inga resultat. Försök att ändra filtren.",
    topicMatchHint: "Visar även relaterade filmer och serier baserat på tema",
    noResultsFor: "Inga resultat för",
    likedAction: "\ud83d\udc4d Gillade",
    dislikedAction: "\ud83d\udc4e Nej",
    mehAction: "\ud83d\ude10 Meh",
    watchlistAction: "+ Bevakningslista",
  },
  fi: {
    search: "Haku",
    wrappedReady: "Wrapped on valmis",
    wrappedSubtitle: "Katso vuotesi elokuvina ja sarjoina",
    searchPlaceholder: "Hae elokuvia ja sarjoja...",
    all: "Kaikki",
    movies: "Elokuvat",
    tv: "TV",
    searchBtn: "Hae",
    advancedSearch: "Tarkennettu haku",
    hideWatchedLabel: "Piilota katsotut",
    backToSearch: "Takaisin normaaliin hakuun",
    searching: "Haetaan...",
    filmography: "Filmografia:",
    titles: "nimikettä",
    advancedSearchDash: "Tarkennettu haku —",
    results: "tulosta",
    film: "Elokuva",
    added: "Lisätty",
    liked: "Tykkäsin",
    disliked: "Ei",
    meh: "Meh",
    addWatchlist: "+ Seurantalista",
    listPlus: "List+",
    loadMore: "Lataa lisää",
    noResults: "Ei tuloksia. Kokeile muuttaa suodattimia.",
    topicMatchHint: "Näytetään myös aiheeseen liittyviä elokuvia ja sarjoja",
    noResultsFor: "Ei tuloksia haulle",
    likedAction: "\ud83d\udc4d Tykkäsin",
    dislikedAction: "\ud83d\udc4e Ei",
    mehAction: "\ud83d\ude10 Meh",
    watchlistAction: "+ Seurantalista",
  },
} as const;

export default function SearchPage() {
  const guest = useGuestMode();
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"multi" | "movie" | "tv">("multi");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRegion, setUserRegion] = useState("US");
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ id: number; type: MediaType; title: string } | null>(null);

  // Advanced search state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({
    type: "movie",
    genres: [],
    providers: [],
    yearFrom: "",
    yearTo: "",
    sortBy: "popularity.desc",
    withCast: [],
  });
  const [advancedResults, setAdvancedResults] = useState<TMDBSearchResult[]>([]);
  const [advancedPage, setAdvancedPage] = useState(1);
  const [advancedTotalPages, setAdvancedTotalPages] = useState(0);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [personMode, setPersonMode] = useState<{
    personId: number;
    personName: string;
    credits: TMDBSearchResult[];
  } | null>(null);

  const [topicMatch, setTopicMatch] = useState(false);
  const [hideWatched, setHideWatched] = useState(true);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("logflix_search_history");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  function addToHistory(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setSearchHistory(updated);
    try { localStorage.setItem("logflix_search_history", JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function removeFromHistory(term: string) {
    const updated = searchHistory.filter((h) => h !== term);
    setSearchHistory(updated);
    try { localStorage.setItem("logflix_search_history", JSON.stringify(updated)); } catch { /* ignore */ }
  }

  // Override global bg-taste.jpg on search page
  useEffect(() => {
    document.body.classList.add("premium-bg-override");
    return () => { document.body.classList.remove("premium-bg-override"); };
  }, []);

  // Close history dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Discovery rows (shown when search is empty)
  const [discoveryRows, setDiscoveryRows] = useState<DiscoveryRowData[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const discoveryFetched = useRef(false);

  useEffect(() => {
    if (guest.isGuest) return;
    const supabase = createSupabaseBrowser();
    Promise.all([
      fetch("/api/profile").then((r) => r.json()).catch(() => null),
      supabase.from("user_titles").select("tmdb_id, type").in("status", ["watched", "watching"]),
    ]).then(([profileData, titlesRes]) => {
      if (profileData?.profile?.preferred_region) setUserRegion(profileData.profile.preferred_region);
      if (profileData?.profile?.streaming_services && Array.isArray(profileData.profile.streaming_services) && profileData.profile.streaming_services.length > 0) {
        setAdvancedFilters((prev) => ({ ...prev, providers: profileData.profile.streaming_services }));
      }
      const rows = titlesRes?.data ?? [];
      if (rows.length > 0) {
        setWatchedIds(new Set(rows.map((r: { tmdb_id: number; type: string }) => `${r.tmdb_id}:${r.type}`)));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (discoveryFetched.current) return;
    discoveryFetched.current = true;
    fetch("/api/tmdb/discovery")
      .then((r) => r.json())
      .then((data) => {
        if (data.rows) setDiscoveryRows(data.rows);
      })
      .catch(() => {})
      .finally(() => setDiscoveryLoading(false));
  }, []);

  const showDiscovery = !query.trim() && !isAdvancedMode && results.length === 0;

  function handleDiscoverySelect(item: DiscoveryItem) {
    const type: MediaType = item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie";
    setSelectedItem({
      id: item.id,
      type,
      title: item.title || item.name || "Unknown",
      poster_path: item.poster_path,
    });
  }

  // Core search function (used by both form submit and live search)
  const doSearch = useCallback(async (q: string, type: string, saveHistory = false) => {
    if (!q.trim()) return;
    if (saveHistory) addToHistory(q);
    setShowHistory(false);
    setLoading(true);
    setError("");
    setIsAdvancedMode(false);
    setPersonMode(null);
    setTopicMatch(false);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&type=${type}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
      setTopicMatch(!!data.topicMatch);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  // Form submit — immediate search + save to history
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query, typeFilter, true);
  }

  // Live search — debounced, triggers after 3+ chars
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isAdvancedMode) return;
    const q = query.trim();
    if (q.length < 3) {
      if (q.length === 0 && results.length > 0) setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch(q, typeFilter);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter]);

  // Advanced discover search
  async function handleAdvancedSearch(page = 1) {
    setAdvancedLoading(true);
    setIsAdvancedMode(true);
    setPersonMode(null);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("type", advancedFilters.type);

      if (advancedFilters.genres.length > 0) {
        params.set("with_genres", advancedFilters.genres.join(","));
      }
      if (advancedFilters.providers.length > 0) {
        params.set("with_watch_providers", advancedFilters.providers.join("|"));
        params.set("watch_region", userRegion);
      }
      if (advancedFilters.yearFrom) {
        const key = advancedFilters.type === "movie" ? "primary_release_date.gte" : "first_air_date.gte";
        params.set(key, `${advancedFilters.yearFrom}-01-01`);
      }
      if (advancedFilters.yearTo) {
        const key = advancedFilters.type === "movie" ? "primary_release_date.lte" : "first_air_date.lte";
        params.set(key, `${advancedFilters.yearTo}-12-31`);
      }
      if (advancedFilters.sortBy) {
        // Swap date sort keys for TV
        let sortBy = advancedFilters.sortBy;
        if (advancedFilters.type === "tv") {
          sortBy = sortBy.replace("primary_release_date", "first_air_date");
        }
        params.set("sort_by", sortBy);
      }
      if (advancedFilters.withCast.length > 0) {
        params.set("with_cast", advancedFilters.withCast.join("|"));
      }
      params.set("vote_count.gte", "50");
      params.set("page", String(page));

      const res = await fetch(`/api/tmdb/discover?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (page === 1) {
        setAdvancedResults(data.results || []);
      } else {
        setAdvancedResults((prev) => [...prev, ...(data.results || [])]);
      }
      setAdvancedPage(data.page || 1);
      setAdvancedTotalPages(data.total_pages || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Advanced search failed");
    }
    setAdvancedLoading(false);
  }

  // Person filmography
  async function handlePersonSelect(personId: number, personName: string) {
    setAdvancedLoading(true);
    setIsAdvancedMode(true);
    setError("");
    try {
      const res = await fetch(`/api/tmdb/person?action=credits&id=${personId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPersonMode({ personId, personName, credits: data.cast || [] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load filmography");
    }
    setAdvancedLoading(false);
  }

  // Actions (like, watchlist, etc.)
  async function handleAction(item: TMDBSearchResult, action: string, fallbackType?: MediaType) {
    // Guest gate: track action, show wall if limit reached
    if (guest.isGuest) {
      if (!guest.trackAction()) return;
      const type: MediaType = item.media_type === "movie" ? "movie" : item.media_type === "tv" ? "tv" : (fallbackType || (item.title ? "movie" : "tv"));
      const key = `${item.id}:${type}`;
      setActionStates((prev) => ({ ...prev, [key]: action }));
      // Record for migration after signup
      recordGuestTitleAction({
        tmdb_id: item.id,
        type,
        action: action as "liked" | "disliked" | "neutral" | "watchlist" | "watched",
        ts: Date.now(),
      });
      return;
    }

    const type: MediaType = item.media_type === "movie" ? "movie" : item.media_type === "tv" ? "tv" : (fallbackType || (item.title ? "movie" : "tv"));
    const key = `${item.id}:${type}`;
    setActionStates((prev) => ({ ...prev, [key]: action }));
    try {
      if (action === "watchlist") {
        await logTitle({ tmdb_id: item.id, type, status: "watchlist" });
      } else {
        await logTitle({
          tmdb_id: item.id,
          type,
          status: "watched",
          sentiment: action as "liked" | "disliked" | "neutral",
        });
      }
    } catch {
      setActionStates((prev) => ({ ...prev, [key]: "" }));
    }
  }

  // Determine which results to show
  const rawResults = isAdvancedMode
    ? personMode
      ? personMode.credits
      : advancedResults
    : results;
  const displayResults = hideWatched && watchedIds.size > 0
    ? rawResults.filter((r) => !watchedIds.has(`${r.id}:${r.media_type ?? (isAdvancedMode ? advancedFilters.type : "movie")}`))
    : rawResults;

  const isLoading = isAdvancedMode ? advancedLoading : loading;
  const fallbackType: MediaType | undefined = isAdvancedMode && !personMode ? advancedFilters.type : undefined;

  return (
    <div className="animate-fade-in-up">
      <style>{`
        @keyframes wrapped-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(229,9,20,0.1); }
          50% { box-shadow: 0 0 35px rgba(229,9,20,0.25), 0 0 60px rgba(245,200,66,0.08); }
        }
      `}</style>

      {/* Wrapped teaser */}
      <Link
        href="/wrapped"
        className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl transition-all group"
        style={{
          background: "linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(245,200,66,0.08) 100%)",
          border: "1px solid rgba(229,9,20,0.3)",
          animation: "wrapped-pulse 2.5s ease-in-out infinite",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(229,9,20,0.2), rgba(245,200,66,0.1))", border: "0.5px solid rgba(229,9,20,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs><linearGradient id="wrapped-g" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#E50914"/><stop offset="100%" stopColor="#D4A853"/></linearGradient></defs>
            <rect x="3" y="8" width="18" height="13" rx="2" stroke="url(#wrapped-g)"/>
            <path d="M12 8v13" stroke="url(#wrapped-g)"/>
            <path d="M3 12h18" stroke="url(#wrapped-g)" opacity="0.5"/>
            <path d="M7.5 8C7.5 8 7.5 4 12 4s4.5 4 4.5 4" stroke="url(#wrapped-g)"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">{s.wrappedReady}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{s.wrappedSubtitle}</p>
        </div>
        <svg className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3 sticky top-0 z-20 -mx-4 px-4 py-2 md:static md:mx-0 md:px-0 md:py-0 bg-[var(--bg-base)]/95 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="w-full pl-10 pr-3 text-sm text-[var(--text-primary)] placeholder-white/30 transition-all duration-200 focus:outline-none"
            style={{ height: 52, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }}
            onFocus={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,42,42,0.5)"; el.style.boxShadow = "0 0 0 3px rgba(255,42,42,0.1)"; if (searchHistory.length > 0 && !query.trim()) setShowHistory(true); }}
            onBlur={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.boxShadow = "none"; }}
            autoComplete="off"
          />
          {/* Search history dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div ref={historyRef} style={{ position: "absolute", top: 56, left: 0, right: 0, background: "rgba(18,18,22,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", zIndex: 30, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                  {locale === "no" ? "Siste søk" : "Recent searches"}
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchHistory([]); setShowHistory(false); try { localStorage.removeItem("logflix_search_history"); } catch { /* ignore */ } }}
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {locale === "no" ? "Tøm" : "Clear"}
                </button>
              </div>
              {searchHistory.map((term) => (
                <div
                  key={term}
                  style={{ display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 10 }}>
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => { setQuery(term); setShowHistory(false); searchInputRef.current?.form?.requestSubmit(); }}
                    style={{ flex: 1, textAlign: "left", fontSize: 14, color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFromHistory(term); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "rgba(255,255,255,0.2)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "multi" | "movie" | "tv")}
          className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-white/20 transition-all duration-300"
        >
          <option value="multi">{s.all}</option>
          <option value="movie">{s.movies}</option>
          <option value="tv">{s.tv}</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white/90 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-30 active:scale-[0.97] border border-white/[0.08] hover:border-white/[0.15]"
        >
          {s.searchBtn}
        </button>
      </form>

      {/* Advanced search toggle */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 px-1 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          {s.advancedSearch}
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${advancedOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {isAdvancedMode && (
            <button
              onClick={() => { setIsAdvancedMode(false); setPersonMode(null); setAdvancedResults([]); setAdvancedPage(1); }}
              className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors"
            >
              {s.backToSearch}
            </button>
          )}
          {!guest.isGuest && watchedIds.size > 0 && (
            <button
              onClick={() => setHideWatched((h) => !h)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                hideWatched
                  ? "bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.06]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                {hideWatched
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                }
              </svg>
              {s.hideWatchedLabel}
            </button>
          )}
        </div>
      </div>

      {/* Mood pills → Curator */}
      {!query.trim() && !isAdvancedMode && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { label: locale === "no" ? "Mørkt og intenst" : "Dark and intense", emoji: "🖤" },
            { label: locale === "no" ? "Koselig kveld" : "Cozy night in", emoji: "🛋️" },
            { label: locale === "no" ? "Latter og hygge" : "Laugh and chill", emoji: "😂" },
            { label: locale === "no" ? "Overrask meg" : "Surprise me", emoji: "🎲" },
          ].map((pill) => (
            <Link
              key={pill.label}
              href={`/curator?prompt=${encodeURIComponent(pill.label)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <span style={{ fontSize: 13 }}>{pill.emoji}</span>
              {pill.label}
            </Link>
          ))}
        </div>
      )}

      {/* Advanced panel */}
      <AdvancedSearchPanel
        isOpen={advancedOpen}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onSearch={() => handleAdvancedSearch(1)}
        onPersonSelect={handlePersonSelect}
      />

      {error && (
        <div className="text-sm text-red-400 bg-red-500/[0.08] rounded-xl px-4 py-3 mb-5 border border-red-500/[0.12]">
          {error}
        </div>
      )}

      {isLoading && <LoadingSpinner text={s.searching} />}

      {/* Person filmography header */}
      {isAdvancedMode && personMode && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setPersonMode(null)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-white/80">
            {s.filmography} {personMode.personName}
          </h3>
          <span className="text-xs text-white/30">{personMode.credits.length} {s.titles}</span>
        </div>
      )}

      {/* Advanced mode info */}
      {isAdvancedMode && !personMode && advancedResults.length > 0 && (
        <p className="text-xs text-white/30 mb-4">
          {s.advancedSearchDash} {advancedResults.length} {s.results}
        </p>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {displayResults.map((item) => {
          const type: MediaType = item.media_type === "movie" ? "movie" : item.media_type === "tv" ? "tv" : (fallbackType || (item.title ? "movie" : "tv"));
          const key = `${item.id}:${type}`;
          const actionDone = actionStates[key];
          const title = item.title || item.name || "Unknown";
          const year = (item.release_date || item.first_air_date || "").slice(0, 4);
          const imgSrc = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : null;

          return (
            <div key={key} className="group flex flex-col cursor-pointer" onClick={() => setSelectedItem({ id: item.id, type, title, poster_path: item.poster_path })}>
              {/* Poster */}
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-500">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/12">
                      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 16l5-4 3 3 4-5 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Type badge */}
                <span className="absolute top-2.5 left-2.5 z-10 text-[10px] px-2 py-0.5 rounded-md bg-black/50 text-white/50 uppercase font-bold tracking-widest">
                  {type === "movie" ? s.film : s.tv}
                </span>

                {/* Rating badge */}
                {item.vote_average != null && item.vote_average > 0 && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50">
                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[11px] text-white/60 font-semibold tabular-nums">{item.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Hover overlay - desktop only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex-col justify-end p-3 hidden md:flex">
                  {actionDone ? (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[13px] font-semibold text-emerald-400 capitalize">
                        {actionDone === "watchlist" ? s.added : actionDone}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                      {/* Sentiment row */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(item, "liked", fallbackType); }}
                          className="flex-1 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 text-[12px] font-semibold tracking-wide hover:bg-emerald-500/30 transition-all duration-200 active:scale-95"
                        >
                          {s.liked}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(item, "disliked", fallbackType); }}
                          className="flex-1 py-2 rounded-lg bg-red-500/15 text-red-400 text-[12px] font-semibold tracking-wide hover:bg-red-500/30 transition-all duration-200 active:scale-95"
                        >
                          {s.disliked}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(item, "neutral", fallbackType); }}
                          className="flex-1 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-[12px] font-semibold tracking-wide hover:bg-amber-500/30 transition-all duration-200 active:scale-95"
                        >
                          {s.meh}
                        </button>
                      </div>
                      {/* Watchlist + List */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(item, "watchlist", fallbackType); }}
                          className="flex-1 py-2 rounded-lg bg-white/[0.08] text-white/70 text-[12px] font-semibold tracking-wide hover:bg-white/[0.15] hover:text-white transition-all duration-200 active:scale-[0.97] border border-white/[0.06]"
                        >
                          {s.addWatchlist}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (guest.isGuest) { guest.setShowWall(true); return; } setAddToListItem({ id: item.id, type, title }); }}
                          className="py-2 px-3 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)] text-[12px] font-semibold hover:bg-[var(--accent)]/20 transition-all duration-200 active:scale-95"
                        >
                          {s.listPlus}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title + year */}
              <div className="mt-2.5 px-0.5">
                <h3 className="text-[13px] font-medium text-white/80 leading-tight truncate group-hover:text-white transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-[12px] text-white/25 mt-0.5 tabular-nums">{year || "—"}</p>
              </div>

              {/* Mobile action buttons - always visible */}
              {!actionDone ? (
                <div className="flex flex-col gap-1 mt-2 md:hidden">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item, "liked", fallbackType); }}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/15 active:scale-95 transition-all"
                    >
                      {s.liked}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item, "disliked", fallbackType); }}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-semibold border border-red-500/15 active:scale-95 transition-all"
                    >
                      {s.disliked}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item, "neutral", fallbackType); }}
                      className="flex-1 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/15 active:scale-95 transition-all"
                    >
                      {s.meh}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item, "watchlist", fallbackType); }}
                      className="flex-1 py-1.5 rounded-lg bg-white/[0.06] text-white/50 text-[10px] font-semibold border border-white/[0.06] active:scale-95 transition-all"
                    >
                      {s.addWatchlist}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (guest.isGuest) { guest.setShowWall(true); return; } setAddToListItem({ id: item.id, type, title }); }}
                      className="py-1.5 px-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)] text-[10px] font-semibold border border-[var(--accent)]/15 active:scale-95 transition-all"
                    >
                      {s.listPlus}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 md:hidden">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] font-semibold text-emerald-400 capitalize">
                    {actionDone === "watchlist" ? s.added : actionDone}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load more for advanced mode */}
      {isAdvancedMode && !personMode && advancedPage < advancedTotalPages && !advancedLoading && (
        <div className="flex justify-center mt-8">
          <GlowButton
            variant="ghost"
            onClick={() => handleAdvancedSearch(advancedPage + 1)}
          >
            {s.loadMore}
          </GlowButton>
        </div>
      )}

      {/* Empty states */}
      {!isLoading && displayResults.length === 0 && isAdvancedMode && (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">{s.noResults}</p>
        </div>
      )}

      {!isLoading && !isAdvancedMode && topicMatch && displayResults.length > 0 && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <svg className="w-3.5 h-3.5 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-xs text-white/40">{s.topicMatchHint}</span>
        </div>
      )}

      {!isLoading && results.length === 0 && !isAdvancedMode && query && (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">{s.noResultsFor} &laquo;{query}&raquo;</p>
        </div>
      )}

      {/* Discovery rows — shown when search field is empty */}
      {showDiscovery && (
        <div className="transition-opacity duration-300" style={{ opacity: showDiscovery ? 1 : 0 }}>
          <style>{`.discovery-scroll::-webkit-scrollbar { display: none; }`}</style>
          {discoveryLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            discoveryRows.map((row) => (
              <DiscoveryRow key={row.key} row={row} onSelect={handleDiscoverySelect} />
            ))
          )}
        </div>
      )}

      {/* Add to List Modal (authenticated only) */}
      {addToListItem && !guest.isGuest && (
        <AddToListModal
          tmdb_id={addToListItem.id}
          type={addToListItem.type}
          title={addToListItem.title}
          onClose={() => setAddToListItem(null)}
        />
      )}

      {/* Conversion Wall */}
      <ConversionWall open={guest.showWall} onClose={() => guest.setShowWall(false)} />

      {/* Streaming Modal */}
      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
          actions={[
            { label: s.likedAction, action: "liked", variant: "green" },
            { label: s.dislikedAction, action: "disliked", variant: "red" },
            { label: s.mehAction, action: "neutral", variant: "yellow" },
            { label: s.watchlistAction, action: "watchlist", variant: "default" },
            { label: s.listPlus, action: "add-to-list", variant: "accent" },
          ]}
          onAction={(action) => {
            if (action === "add-to-list") {
              setAddToListItem({ id: selectedItem.id, type: selectedItem.type, title: selectedItem.title });
              return;
            }
            const item = displayResults.find((r) => r.id === selectedItem.id);
            if (item) handleAction(item, action, fallbackType);
          }}
        />
      )}
    </div>
  );
}
