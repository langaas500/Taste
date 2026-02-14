"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import TitleCard from "@/components/TitleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { removeTitle, addExclusion } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType, Recommendation } from "@/lib/types";

type Filter = "all" | "liked" | "disliked" | "neutral" | "excluded";

export default function LibraryPage() {
  const [titles, setTitles] = useState<(UserTitle & { cache?: TitleCache })[]>([]);
  const [exclusions, setExclusions] = useState<{ tmdb_id: number; type: string; reason: string | null }[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: ut }, { data: exc }, { data: cache }] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id).eq("status", "watched").order("updated_at", { ascending: false }),
      supabase.from("user_exclusions").select("*").eq("user_id", user.id),
      supabase.from("titles_cache").select("*"),
    ]);

    const cacheMap = new Map<string, TitleCache>();
    for (const c of (cache || []) as TitleCache[]) {
      cacheMap.set(`${c.tmdb_id}:${c.type}`, c);
    }

    const enriched = ((ut || []) as UserTitle[]).map((t) => ({
      ...t,
      cache: cacheMap.get(`${t.tmdb_id}:${t.type}`),
    }));

    setTitles(enriched);
    setExclusions((exc || []) as { tmdb_id: number; type: string; reason: string | null }[]);
    setLoading(false);

    // Load recommendations in background if user has titles
    if (enriched.length >= 3) {
      loadRecs();
    }
  }

  async function loadRecs() {
    setRecsLoading(true);
    try {
      const res = await fetch("/api/recommendations");
      const data = await res.json();
      if (!data.error) setRecs(data.recommendations || []);
    } catch {}
    setRecsLoading(false);
  }

  async function handleRemove(tmdb_id: number, type: MediaType) {
    await removeTitle(tmdb_id, type);
    setTitles((prev) => prev.filter((t) => !(t.tmdb_id === tmdb_id && t.type === type)));
  }

  async function handleExclude(tmdb_id: number, type: MediaType) {
    await addExclusion(tmdb_id, type, "Excluded from library");
    setExclusions((prev) => [...prev, { tmdb_id, type, reason: "Excluded from library" }]);
  }

  function scrollRecs(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  const filtered =
    filter === "excluded"
      ? []
      : filter === "all"
        ? titles
        : titles.filter((t) => t.sentiment === filter);

  const excludedSet = new Set(exclusions.map((e) => `${e.tmdb_id}:${e.type}`));

  if (loading) return <LoadingSpinner text="Loading library..." />;

  const filterTabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Alle", count: titles.length },
    { id: "liked", label: "Likte", count: titles.filter((t) => t.sentiment === "liked").length },
    { id: "neutral", label: "Noytral", count: titles.filter((t) => t.sentiment === "neutral").length },
    { id: "disliked", label: "Mislikte", count: titles.filter((t) => t.sentiment === "disliked").length },
    { id: "excluded", label: "Ekskluderte", count: exclusions.length },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Hero header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Mitt Bibliotek
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1.5">
          {titles.length} {titles.length === 1 ? "tittel" : "titler"} i samlingen din
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 -mx-1">
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "text-[var(--text-primary)] bg-white/[0.08]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/[0.03]"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs tabular-nums ${
                  isActive ? "text-[var(--accent-light)]" : "text-[var(--text-tertiary)]"
                }`}>
                  {tab.count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Library grid */}
      {filter === "excluded" ? (
        exclusions.length === 0 ? (
          <EmptyState title="Ingen ekskluderinger" description="Titler du ekskluderer vises ikke i anbefalinger." />
        ) : (
          <div className="space-y-2 stagger">
            {exclusions.map((e) => (
              <div key={`${e.tmdb_id}:${e.type}`} className="glass rounded-[var(--radius-lg)] flex items-center justify-between p-4">
                <span className="text-sm text-[var(--text-secondary)]">TMDB:{e.tmdb_id} ({e.type})</span>
                <button
                  onClick={async () => {
                    await fetch("/api/exclusions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tmdb_id: e.tmdb_id, type: e.type }) });
                    setExclusions((prev) => prev.filter((x) => !(x.tmdb_id === e.tmdb_id && x.type === e.type)));
                  }}
                  className="btn-press px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--red-glow)] text-[var(--red)] transition-all duration-200 hover:bg-[rgba(248,113,113,0.25)]"
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Ingen titler her"
          description="Sok etter filmer og serier for a bygge biblioteket ditt."
          action={
            <Link href="/search">
              <GlowButton>Sok</GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 stagger">
          {filtered.map((t) => (
            <TitleCard
              key={t.id}
              tmdb_id={t.tmdb_id}
              type={t.type}
              title={t.cache?.title || `TMDB:${t.tmdb_id}`}
              year={t.cache?.year}
              poster_path={t.cache?.poster_path}
              sentiment={t.sentiment}
              onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              onAction={(action) => {
                if (action === "remove") handleRemove(t.tmdb_id, t.type);
                if (action === "exclude") handleExclude(t.tmdb_id, t.type);
                if (action === "add-to-list") setAddToListItem({ tmdb_id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}` });
              }}
              actions={[
                { label: "List+", action: "add-to-list", variant: "accent" as const },
                ...(excludedSet.has(`${t.tmdb_id}:${t.type}`)
                  ? [{ label: "Ekskludert", action: "excluded", variant: "red" as const }]
                  : [{ label: "Ekskluder", action: "exclude", variant: "red" as const }]),
                { label: "Fjern", action: "remove", variant: "default" as const },
              ]}
            />
          ))}
        </div>
      )}

      {/* "For deg" recommendations section */}
      {recs.length > 0 && (
        <div className="mt-12 animate-fade-in-up">
          {/* Section header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                For deg
              </h2>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Basert pa din smak
              </p>
            </div>
            <Link href="/recommendations">
              <GlowButton variant="ghost" size="sm">Se alle</GlowButton>
            </Link>
          </div>

          {/* Scrollable row */}
          <div className="relative group/scroll">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />

            {/* Arrow buttons (desktop) */}
            <button
              onClick={() => scrollRecs("left")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] text-white/60 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/scroll:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => scrollRecs("right")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] text-white/60 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/scroll:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4"
            >
              {recs.map((rec) => {
                const imgSrc = rec.poster_path
                  ? `https://image.tmdb.org/t/p/w342${rec.poster_path}`
                  : null;

                return (
                  <div
                    key={`${rec.tmdb_id}:${rec.type}`}
                    className="group flex-shrink-0 w-[140px] sm:w-[160px] cursor-pointer"
                    onClick={() => setSelectedItem({ id: rec.tmdb_id, type: rec.type, title: rec.title, poster_path: rec.poster_path })}
                  >
                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-500 group-hover:shadow-[0_8px_30px_rgba(124,92,252,0.12)]">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={rec.title}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/12">
                            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </div>
                      )}

                      {/* Subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="mt-2 px-0.5">
                      <h3 className="text-[12px] font-medium text-white/70 leading-tight truncate group-hover:text-white transition-colors duration-300">
                        {rec.title}
                      </h3>
                      <p className="text-[11px] text-white/25 mt-0.5 tabular-nums">{rec.year || "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recs loading placeholder */}
      {recsLoading && titles.length >= 3 && (
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">For deg</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-5">Basert pa din smak</p>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px]">
                <div className="aspect-[2/3] rounded-xl skeleton" />
                <div className="h-3 w-20 mt-2 skeleton" />
                <div className="h-2.5 w-12 mt-1 skeleton" />
              </div>
            ))}
          </div>
        </div>
      )}

      {addToListItem && (
        <AddToListModal
          tmdb_id={addToListItem.tmdb_id}
          type={addToListItem.type}
          title={addToListItem.title}
          onClose={() => setAddToListItem(null)}
        />
      )}

      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
