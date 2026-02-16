"use client";

import { useEffect, useState, useMemo } from "react";
import TitleCard from "@/components/TitleCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { logTitle, removeTitle, toggleFavorite, fetchFriendOverlaps } from "@/lib/api";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType, FriendOverlap } from "@/lib/types";

type SortKey = "recent" | "alpha" | "year";
type TypeFilter = "all" | "tv" | "movie";

export default function WatchlistPage() {
  const [titles, setTitles] = useState<(UserTitle & { cache?: TitleCache })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("recent");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [genreFilter, setGenreFilter] = useState<number | null>(null);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);
  const [friendOverlaps, setFriendOverlaps] = useState<Record<string, FriendOverlap[]>>({});

  useEffect(() => {
    loadData();
    fetchFriendOverlaps().then(setFriendOverlaps).catch(() => {});
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ut } = await supabase.from("user_titles").select("*").eq("user_id", user.id).eq("status", "watchlist").order("created_at", { ascending: false });

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

  async function handleToggleFavorite(tmdb_id: number, type: MediaType) {
    const t = titles.find((x) => x.tmdb_id === tmdb_id && x.type === type);
    if (!t) return;
    const newVal = !t.favorite;
    try {
      await toggleFavorite(tmdb_id, type, newVal);
      setTitles((prev) =>
        prev.map((x) => x.tmdb_id === tmdb_id && x.type === type ? { ...x, favorite: newVal } : x)
      );
    } catch { /* keep state unchanged on failure */ }
  }

  async function handleAction(t: UserTitle & { cache?: TitleCache }, action: string) {
    if (action === "toggle-favorite") {
      handleToggleFavorite(t.tmdb_id, t.type);
      return;
    }
    if (action === "add-to-list") {
      setAddToListItem({ tmdb_id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}` });
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
    return [...set.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "nb"));
  }, [titles]);

  if (loading) return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div className="skeleton h-7 w-28 rounded-lg" />
      </div>
      <SkeletonGrid count={8} />
    </div>
  );

  const hasActiveFilters = typeFilter !== "all" || genreFilter != null || yearFrom || yearTo;

  let afterFilters = [...titles];
  if (typeFilter !== "all") {
    afterFilters = afterFilters.filter((t) => t.type === typeFilter);
  }
  if (genreFilter) {
    afterFilters = afterFilters.filter((t) =>
      ((t.cache?.genres as { id: number; name: string }[]) || []).some((g) => g.id === genreFilter)
    );
  }
  if (yearFrom) {
    afterFilters = afterFilters.filter((t) => (t.cache?.year || 0) >= parseInt(yearFrom));
  }
  if (yearTo) {
    afterFilters = afterFilters.filter((t) => (t.cache?.year || 0) <= parseInt(yearTo));
  }

  const sorted = afterFilters.sort((a, b) => {
    if (sort === "alpha") return (a.cache?.title || "").localeCompare(b.cache?.title || "", "nb");
    if (sort === "year") return (b.cache?.year || 0) - (a.cache?.year || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Se-liste</h2>
        {titles.length > 0 && (
          <span className="text-sm text-[var(--text-tertiary)] font-medium">{titles.length} titler</span>
        )}
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="Se-listen er tom"
          description="Legg til filmer og serier du vil se senere. Finn noe nytt via søk eller la oss anbefale noe for deg."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/search">
                <GlowButton>Søk</GlowButton>
              </Link>
              <Link href="/recommendations" className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-hover)] transition-colors">
                Anbefalinger
              </Link>
            </div>
          }
        />
      ) : (<>
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Type</span>
            {([["all", "Alle"], ["tv", "Serier"], ["movie", "Film"]] as [TypeFilter, string][]).map(([key, label]) => (
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
          {sorted.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Sorter</span>
              {([["recent", "Nylig"], ["alpha", "A–Å"], ["year", "År"]] as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    sort === key
                      ? "bg-white/[0.1] text-white"
                      : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Genre + year filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <select
            value={genreFilter ?? ""}
            onChange={(e) => setGenreFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111627] border border-white/[0.08] text-white/70 focus:outline-none focus:border-white/20 transition-all [color-scheme:dark]"
          >
            <option value="" className="bg-[#111627] text-white/70">Alle sjangere</option>
            {allGenres.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#111627] text-white/70">{g.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">År</span>
            <input
              type="number"
              placeholder="Fra"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-white/70 placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
            <span className="text-white/20">–</span>
            <input
              type="number"
              placeholder="Til"
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
              Nullstill
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 stagger">
          {sorted.map((t) => (
            <TitleCard
              key={t.id}
              tmdb_id={t.tmdb_id}
              type={t.type}
              title={t.cache?.title || `TMDB:${t.tmdb_id}`}
              year={t.cache?.year}
              poster_path={t.cache?.poster_path}
              isFavorite={t.favorite}
              friendOverlap={friendOverlaps[`${t.tmdb_id}:${t.type}`]}
              onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              onAction={(action) => handleAction(t, action)}
              actions={[
                { label: "List+", action: "add-to-list", variant: "accent" },
                { label: "👍", action: "liked", variant: "green" },
                { label: "👎", action: "disliked", variant: "red" },
                { label: "😐", action: "neutral", variant: "yellow" },
                { label: "✕", action: "remove", variant: "default" },
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
            actions={[
              { label: "List+", action: "add-to-list", variant: "accent" },
              { label: "👍", action: "liked", variant: "green" },
              { label: "👎", action: "disliked", variant: "red" },
              { label: "😐", action: "neutral", variant: "yellow" },
              { label: "✕", action: "remove", variant: "default" },
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
