"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import GlowButton from "@/components/GlowButton";
import type { TMDBGenre, TMDBPersonResult, AdvancedSearchFilters, WatchProvider } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";

const strings = {
  no: { type: "Type", movie: "Film", tvSeries: "TV-serier", actor: "Skuespiller", searchActor: "Søk etter skuespiller...", showFilmography: "Vis filmografi", genre: "Sjanger", streamingService: "Strømmetjeneste", showFewer: "Vis færre", showAll: "Vis alle", year: "Årstall", from: "Fra", to: "Til", sortBy: "Sorter etter", mostPopular: "Mest populær", highestRated: "Høyest rangert", newestFirst: "Nyeste først", oldestFirst: "Eldste først", searchWithFilters: "Søk med filtre", searching: "Søker..." },
  en: { type: "Type", movie: "Film", tvSeries: "TV series", actor: "Actor", searchActor: "Search for actor...", showFilmography: "Show filmography", genre: "Genre", streamingService: "Streaming service", showFewer: "Show fewer", showAll: "Show all", year: "Year", from: "From", to: "To", sortBy: "Sort by", mostPopular: "Most popular", highestRated: "Highest rated", newestFirst: "Newest first", oldestFirst: "Oldest first", searchWithFilters: "Search with filters", searching: "Searching..." },
  dk: { type: "Type", movie: "Film", tvSeries: "TV-serier", actor: "Skuespiller", searchActor: "Søg efter skuespiller...", showFilmography: "Vis filmografi", genre: "Genre", streamingService: "Streamingtjeneste", showFewer: "Vis færre", showAll: "Vis alle", year: "År", from: "Fra", to: "Til", sortBy: "Sorter efter", mostPopular: "Mest populær", highestRated: "Højest bedømt", newestFirst: "Nyeste først", oldestFirst: "Ældste først", searchWithFilters: "Søg med filtre", searching: "Søger..." },
  se: { type: "Typ", movie: "Film", tvSeries: "TV-serier", actor: "Skådespelare", searchActor: "Sök efter skådespelare...", showFilmography: "Visa filmografi", genre: "Genre", streamingService: "Streamingtjänst", showFewer: "Visa färre", showAll: "Visa alla", year: "År", from: "Från", to: "Till", sortBy: "Sortera efter", mostPopular: "Mest populär", highestRated: "Högst betyg", newestFirst: "Nyaste först", oldestFirst: "Äldst först", searchWithFilters: "Sök med filter", searching: "Söker..." },
  fi: { type: "Tyyppi", movie: "Elokuva", tvSeries: "TV-sarjat", actor: "Näyttelijä", searchActor: "Hae näyttelijää...", showFilmography: "Näytä filmografia", genre: "Genre", streamingService: "Suoratoistopalvelu", showFewer: "Näytä vähemmän", showAll: "Näytä kaikki", year: "Vuosi", from: "Alkaen", to: "Asti", sortBy: "Järjestä", mostPopular: "Suosituin", highestRated: "Parhaiten arvioitu", newestFirst: "Uusin ensin", oldestFirst: "Vanhin ensin", searchWithFilters: "Hae suodattimilla", searching: "Haetaan..." },
} as const;

interface Props {
  isOpen: boolean;
  filters: AdvancedSearchFilters;
  onFiltersChange: (f: AdvancedSearchFilters) => void;
  onSearch: () => void;
  onPersonSelect: (personId: number, personName: string) => void;
}

export default function AdvancedSearchPanel({ isOpen, filters, onFiltersChange, onSearch, onPersonSelect }: Props) {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
  const [genres, setGenres] = useState<Record<string, TMDBGenre[]>>({});
  const [providers, setProviders] = useState<Record<string, WatchProvider[]>>({});
  const [personQuery, setPersonQuery] = useState("");
  const [personResults, setPersonResults] = useState<TMDBPersonResult[]>([]);
  const [personLoading, setPersonLoading] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState<{ id: number; name: string }[]>([]);
  const [showProviders, setShowProviders] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController>(null);

  // Fetch genres when type changes
  useEffect(() => {
    if (!isOpen) return;
    const t = filters.type;
    if (genres[t]) return;
    fetch(`/api/tmdb/discover?action=genres&type=${t}`)
      .then((r) => r.json())
      .then((d) => setGenres((prev) => ({ ...prev, [t]: d.genres || [] })))
      .catch(() => {});
  }, [isOpen, filters.type, genres]);

  // Fetch providers when type changes
  useEffect(() => {
    if (!isOpen) return;
    const t = filters.type;
    if (providers[t]) return;
    fetch(`/api/tmdb/discover?action=providers&type=${t}`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.providers || []) as WatchProvider[];
        // Show top providers by display_priority
        list.sort((a: WatchProvider, b: WatchProvider) => a.display_priority - b.display_priority);
        setProviders((prev) => ({ ...prev, [t]: list.slice(0, 30) }));
      })
      .catch(() => {});
  }, [isOpen, filters.type, providers]);

  // Debounced person search with abort to prevent stale results
  const handlePersonInput = useCallback((val: string) => {
    setPersonQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setPersonResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setPersonLoading(true);
      try {
        const res = await fetch(`/api/tmdb/person?action=search&q=${encodeURIComponent(val)}`, { signal: abortRef.current.signal });
        const data = await res.json();
        setPersonResults((data.results || []).slice(0, 8));
      } catch {}
      setPersonLoading(false);
    }, 400);
  }, []);

  function selectPerson(p: TMDBPersonResult) {
    if (selectedPersons.some((s) => s.id === p.id)) return;
    const updated = [...selectedPersons, { id: p.id, name: p.name }];
    setSelectedPersons(updated);
    onFiltersChange({ ...filters, withCast: updated.map((s) => s.id) });
    setPersonQuery("");
    setPersonResults([]);
  }

  function removePerson(id: number) {
    const updated = selectedPersons.filter((s) => s.id !== id);
    setSelectedPersons(updated);
    onFiltersChange({ ...filters, withCast: updated.map((s) => s.id) });
  }

  function toggleGenre(id: number) {
    const g = filters.genres.includes(id)
      ? filters.genres.filter((x) => x !== id)
      : [...filters.genres, id];
    onFiltersChange({ ...filters, genres: g });
  }

  function toggleProvider(id: number) {
    const p = filters.providers.includes(id)
      ? filters.providers.filter((x) => x !== id)
      : [...filters.providers, id];
    onFiltersChange({ ...filters, providers: p });
  }

  const currentGenres = genres[filters.type] || [];
  const currentProviders = providers[filters.type] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="glass rounded-2xl p-4 mb-6 space-y-4">
            {/* Type toggle */}
            <div>
              <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2 block">{s.type}</label>
              <div className="flex gap-1.5">
                {(["movie", "tv"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onFiltersChange({ ...filters, type: t, genres: [], providers: [] })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      filters.type === t
                        ? "bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30"
                        : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                  >
                    {t === "movie" ? s.movie : s.tvSeries}
                  </button>
                ))}
              </div>
            </div>

            {/* Person search */}
            <div className="relative">
              <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2 block">{s.actor}</label>
              {selectedPersons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedPersons.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 text-[var(--accent-light)] text-xs font-medium"
                    >
                      {p.name}
                      <button onClick={() => removePerson(p.id)} className="ml-0.5 hover:text-white transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={personQuery}
                  onChange={(e) => handlePersonInput(e.target.value)}
                  placeholder={s.searchActor}
                  className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
                {selectedPersons.length === 1 && (
                  <button
                    onClick={() => onPersonSelect(selectedPersons[0].id, selectedPersons[0].name)}
                    className="px-3 py-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent-light)] text-xs font-semibold hover:bg-[var(--accent)]/25 transition-all"
                  >
                    {s.showFilmography}
                  </button>
                )}
              </div>

              {/* Person dropdown */}
              {personResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 glass rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
                  {personResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPerson(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] overflow-hidden flex-shrink-0">
                        {p.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.profile_path}`}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white/80 font-medium">{p.name}</p>
                        <p className="text-[10px] text-white/30">{p.known_for_department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {personLoading && personQuery && (
                <div className="absolute z-30 left-0 right-0 mt-1 glass rounded-xl border border-white/[0.08] px-3 py-3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
                  <span className="text-xs text-white/40">{s.searching}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div>
              <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2 block">{s.genre}</label>
              <div className="flex flex-wrap gap-1.5">
                {currentGenres.map((g) => {
                  const sel = filters.genres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        sel
                          ? "bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30"
                          : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Streaming providers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">{s.streamingService}</label>
                {currentProviders.length > 10 && (
                  <button
                    onClick={() => setShowProviders(!showProviders)}
                    className="text-[10px] text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors"
                  >
                    {showProviders ? s.showFewer : `${s.showAll} (${currentProviders.length})`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(showProviders ? currentProviders : currentProviders.slice(0, 10)).map((p) => {
                  const sel = filters.providers.includes(p.provider_id);
                  return (
                    <button
                      key={p.provider_id}
                      onClick={() => toggleProvider(p.provider_id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        sel
                          ? "bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30"
                          : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                      }`}
                    >
                      {p.logo_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded-sm"
                        />
                      )}
                      {p.provider_name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year range */}
            <div>
              <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2 block">{s.year}</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={filters.yearFrom}
                  onChange={(e) => onFiltersChange({ ...filters, yearFrom: e.target.value })}
                  placeholder={s.from}
                  min={1900}
                  max={2026}
                  className="w-24 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
                <span className="text-white/20">—</span>
                <input
                  type="number"
                  value={filters.yearTo}
                  onChange={(e) => onFiltersChange({ ...filters, yearTo: e.target.value })}
                  placeholder={s.to}
                  min={1900}
                  max={2026}
                  className="w-24 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>

            {/* Sort by */}
            <div>
              <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2 block">{s.sortBy}</label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 focus:outline-none focus:border-white/20 transition-all"
              >
                <option value="popularity.desc">{s.mostPopular}</option>
                <option value="vote_average.desc">{s.highestRated}</option>
                <option value="primary_release_date.desc">{s.newestFirst}</option>
                <option value="primary_release_date.asc">{s.oldestFirst}</option>
              </select>
            </div>

            {/* Search button */}
            <GlowButton onClick={onSearch} fullWidth>
              {s.searchWithFilters}
            </GlowButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
