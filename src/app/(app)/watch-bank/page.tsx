"use client";

import { useEffect, useState, useMemo } from "react";
import TitleCard from "@/components/TitleCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { logTitle, updateProgress, toggleFavorite, removeTitle, fetchFriendOverlaps } from "@/lib/api";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType, FriendOverlap } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

const strings: Record<Locale, {
  pageTitle: string; subtitle: string; count: string; emptyTitle: string;
  emptyDesc: string; findNew: string; recommendations: string; all: string;
  shows: string; movies: string; allGenres: string; year: string; from: string;
  to: string; reset: string; done: string; remove: string; doneUp: string;
  doneDown: string; doneMeh: string;
}> = {
  no: { pageTitle: "Watch Bank", subtitle: "Husk hvor du var i seriene dine", count: "serier", emptyTitle: "Ingen pågående serier", emptyDesc: "Finn noe nytt å se! Legg til serier du følger med på, så husker vi hvilken episode du er på.", findNew: "Finn noe nytt", recommendations: "Anbefalinger", all: "Alle", shows: "Serier", movies: "Film", allGenres: "Alle sjangere", year: "År", from: "Fra", to: "Til", reset: "Nullstill", done: "Ferdig", remove: "Fjern", doneUp: "Ferdig 👍", doneDown: "Ferdig 👎", doneMeh: "Ferdig 😐" },
  en: { pageTitle: "Watch Bank", subtitle: "Remember where you left off", count: "shows", emptyTitle: "No shows in progress", emptyDesc: "Find something new to watch! Add shows you're following and we'll remember which episode you're on.", findNew: "Find something new", recommendations: "Recommendations", all: "All", shows: "Shows", movies: "Movies", allGenres: "All genres", year: "Year", from: "From", to: "To", reset: "Reset", done: "Done", remove: "Remove", doneUp: "Done 👍", doneDown: "Done 👎", doneMeh: "Done 😐" },
  dk: { pageTitle: "Watch Bank", subtitle: "Husk hvor du var i dine serier", count: "serier", emptyTitle: "Ingen igangværende serier", emptyDesc: "Find noget nyt at se! Tilføj serier du følger med i, så husker vi hvilken episode du er på.", findNew: "Find noget nyt", recommendations: "Anbefalinger", all: "Alle", shows: "Serier", movies: "Film", allGenres: "Alle genrer", year: "År", from: "Fra", to: "Til", reset: "Nulstil", done: "Færdig", remove: "Fjern", doneUp: "Færdig 👍", doneDown: "Færdig 👎", doneMeh: "Færdig 😐" },
  se: { pageTitle: "Watch Bank", subtitle: "Kom ihåg var du var i dina serier", count: "serier", emptyTitle: "Inga pågående serier", emptyDesc: "Hitta något nytt att titta på! Lägg till serier du följer så kommer vi ihåg vilken episod du är på.", findNew: "Hitta något nytt", recommendations: "Rekommendationer", all: "Alla", shows: "Serier", movies: "Filmer", allGenres: "Alla genrer", year: "År", from: "Från", to: "Till", reset: "Återställ", done: "Klar", remove: "Ta bort", doneUp: "Klar 👍", doneDown: "Klar 👎", doneMeh: "Klar 😐" },
  fi: { pageTitle: "Watch Bank", subtitle: "Muista missä jäit sarjoissasi", count: "sarjaa", emptyTitle: "Ei käynnissä olevia sarjoja", emptyDesc: "Löydä jotain uutta katsottavaa! Lisää sarjat joita seuraat niin muistamme missä jaksossa olet.", findNew: "Löydä jotain uutta", recommendations: "Suositukset", all: "Kaikki", shows: "Sarjat", movies: "Elokuvat", allGenres: "Kaikki genret", year: "Vuosi", from: "Alkaen", to: "Asti", reset: "Nollaa", done: "Valmis", remove: "Poista", doneUp: "Valmis 👍", doneDown: "Valmis 👎", doneMeh: "Valmis 😐" },
};

type TypeFilter = "all" | "tv" | "movie";

export default function WatchBankPage() {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
  const [titles, setTitles] = useState<(UserTitle & { cache?: TitleCache })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [genreFilter, setGenreFilter] = useState<number | null>(null);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [friendOverlaps, setFriendOverlaps] = useState<Record<string, FriendOverlap[]>>({});

  useEffect(() => {
    loadData();
    fetchFriendOverlaps().then(setFriendOverlaps).catch(() => {});
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ut } = await supabase.from("user_titles").select("*").eq("user_id", user.id).eq("status", "watching").order("updated_at", { ascending: false });

    const userTitles = (ut || []) as UserTitle[];
    const cacheMap = await fetchCacheForTitles(supabase, userTitles.map((t) => ({ tmdb_id: t.tmdb_id, type: t.type })));

    setTitles(
      userTitles.map((t) => ({
        ...t,
        cache: cacheMap.get(`${t.tmdb_id}:${t.type}`),
      }))
    );
    setLoading(false);
  }

  async function handleUpdateProgress(tmdb_id: number, type: MediaType, season: number, episode: number) {
    season = Math.max(1, season);
    episode = Math.max(1, episode);
    try {
      await updateProgress(tmdb_id, type, season, episode);
      setTitles((prev) =>
        prev.map((t) =>
          t.tmdb_id === tmdb_id && t.type === type
            ? { ...t, last_season: season, last_episode: episode }
            : t
        )
      );
    } catch { /* keep state unchanged on failure */ }
  }

  async function handleToggleFavorite(tmdb_id: number, type: MediaType) {
    const t = titles.find((x) => x.tmdb_id === tmdb_id && x.type === type);
    if (!t) return;
    const newVal = !t.favorite;
    try {
      await toggleFavorite(tmdb_id, type, newVal);
      setTitles((prev) =>
        prev.map((x) =>
          x.tmdb_id === tmdb_id && x.type === type ? { ...x, favorite: newVal } : x
        )
      );
    } catch { /* keep state unchanged on failure */ }
  }

  async function handleAction(t: UserTitle & { cache?: TitleCache }, action: string) {
    if (action === "add-to-list") {
      setAddToListItem({ tmdb_id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}` });
      return;
    }
    if (action === "toggle-favorite") {
      handleToggleFavorite(t.tmdb_id, t.type);
      return;
    }
    try {
      if (action === "remove") {
        await removeTitle(t.tmdb_id, t.type);
        setTitles((prev) => prev.filter((x) => x.id !== t.id));
      } else if (action === "liked" || action === "disliked" || action === "neutral") {
        await logTitle({
          tmdb_id: t.tmdb_id,
          type: t.type,
          status: "watched",
          sentiment: action,
        });
        setTitles((prev) => prev.filter((x) => x.id !== t.id));
      }
    } catch { /* keep state unchanged on failure */ }
  }

  const allGenres = useMemo(() => {
    const set = new Map<number, string>();
    for (const t of titles) {
      for (const g of (t.cache?.genres as { id: number; name: string }[]) || []) {
        if (g.id != null && g.name) set.set(g.id, g.name);
      }
    }
    return [...set.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [titles]);

  if (loading) return (
    <div className="animate-fade-in-up">
      <div className="glass rounded-xl px-5 py-4 mb-5">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-3 w-56 rounded mt-2" />
      </div>
      <SkeletonGrid count={6} />
    </div>
  );

  const hasActiveFilters = typeFilter !== "all" || genreFilter != null || yearFrom || yearTo;

  let filtered = [...titles];
  if (typeFilter !== "all") {
    filtered = filtered.filter((t) => t.type === typeFilter);
  }
  if (genreFilter) {
    filtered = filtered.filter((t) =>
      ((t.cache?.genres as { id: number; name: string }[]) || []).some((g) => g.id === genreFilter)
    );
  }
  if (yearFrom) {
    filtered = filtered.filter((t) => (t.cache?.year || 0) >= parseInt(yearFrom));
  }
  if (yearTo) {
    filtered = filtered.filter((t) => (t.cache?.year || 0) <= parseInt(yearTo));
  }

  return (
    <div className="animate-fade-in-up">
      <div className="glass rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{s.pageTitle}</h2>
          <p className="text-xs text-white/50 mt-0.5">{s.subtitle}</p>
        </div>
        {titles.length > 0 && (
          <span className="text-sm text-white/60 font-medium">{titles.length} {s.count}</span>
        )}
      </div>

      {titles.length === 0 ? (
        <div className="glass rounded-xl px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h3 className="text-lg font-semibold text-white">{s.emptyTitle}</h3>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">{s.emptyDesc}</p>
            <div className="mt-3 flex flex-wrap gap-3 justify-center">
              <Link href="/search">
                <GlowButton>{s.findNew}</GlowButton>
              </Link>
              <Link href="/recommendations" className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                {s.recommendations}
              </Link>
            </div>
          </div>
        </div>
      ) : (<>
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Type</span>
            {([["all", s.all], ["tv", s.shows], ["movie", s.movies]] as [TypeFilter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  typeFilter === key
                    ? "bg-white/[0.1] text-white"
                    : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={genreFilter ?? ""}
            onChange={(e) => setGenreFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111627] border border-white/[0.08] text-white/70 focus:outline-none focus:border-white/20 transition-all [color-scheme:dark]"
          >
            <option value="" className="bg-[#111627] text-white/70">{s.allGenres}</option>
            {allGenres.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#111627] text-white/70">{g.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">{s.year}</span>
            <input
              type="number"
              placeholder={s.from}
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-white/70 placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
            <span className="text-white/20">–</span>
            <input
              type="number"
              placeholder={s.to}
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-white/70 placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setTypeFilter("all"); setGenreFilter(null); setYearFrom(""); setYearTo(""); }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--red)] bg-[var(--red-glow)] hover:bg-[var(--red)]/15 transition-all"
            >
              {s.reset}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 stagger">
          {filtered.map((t) => (
            <TitleCard
              key={t.id}
              tmdb_id={t.tmdb_id}
              type={t.type}
              title={t.cache?.title || `TMDB:${t.tmdb_id}`}
              year={t.cache?.year}
              poster_path={t.cache?.poster_path}
              progress={t.last_season && t.last_episode ? { season: t.last_season, episode: t.last_episode } : null}
              friendOverlap={friendOverlaps[`${t.tmdb_id}:${t.type}`]}
              isFavorite={t.favorite}
              onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              onAction={(action) => handleAction(t, action)}
              actions={[
                { label: s.done, action: "liked", variant: "green" },
                { label: s.remove, action: "remove", variant: "red" },
              ]}
            />
          ))}
        </div>
      </>)}

      {addToListItem && (
        <AddToListModal
          tmdb_id={addToListItem.tmdb_id}
          type={addToListItem.type}
          title={addToListItem.title}
          onClose={() => setAddToListItem(null)}
        />
      )}

      {selectedItem && (() => {
        const t = titles.find((x) => x.tmdb_id === selectedItem.id && x.type === selectedItem.type);
        return (
          <StreamingModal
            tmdbId={selectedItem.id}
            type={selectedItem.type}
            title={selectedItem.title}
            posterPath={selectedItem.poster_path}
            onClose={() => setSelectedItem(null)}
            isFavorite={t?.favorite}
            onToggleFavorite={() => handleToggleFavorite(selectedItem.id, selectedItem.type)}
            friendOverlap={friendOverlaps[`${selectedItem.id}:${selectedItem.type}`]}
            progress={t?.last_season && t?.last_episode ? { season: t.last_season, episode: t.last_episode } : null}
            onUpdateProgress={(season, episode) => handleUpdateProgress(selectedItem.id, selectedItem.type, season, episode)}
            actions={[
              { label: "List+", action: "add-to-list", variant: "accent" },
              { label: s.doneUp, action: "liked", variant: "green" },
              { label: s.doneDown, action: "disliked", variant: "red" },
              { label: s.doneMeh, action: "neutral", variant: "yellow" },
              { label: s.remove, action: "remove", variant: "default" },
            ]}
            onAction={(action) => {
              if (t) handleAction(t, action);
            }}
          />
        );
      })()}
    </div>
  );
}
