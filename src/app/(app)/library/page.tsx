"use client";

import { useEffect, useState } from "react";
import TitleCard from "@/components/TitleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import AnimatedTabs from "@/components/AnimatedTabs";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { removeTitle, addExclusion } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType } from "@/lib/types";

type Filter = "all" | "liked" | "disliked" | "neutral" | "excluded";

export default function LibraryPage() {
  const [titles, setTitles] = useState<(UserTitle & { cache?: TitleCache })[]>([]);
  const [exclusions, setExclusions] = useState<{ tmdb_id: number; type: string; reason: string | null }[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);

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
  }

  async function handleRemove(tmdb_id: number, type: MediaType) {
    await removeTitle(tmdb_id, type);
    setTitles((prev) => prev.filter((t) => !(t.tmdb_id === tmdb_id && t.type === type)));
  }

  async function handleExclude(tmdb_id: number, type: MediaType) {
    await addExclusion(tmdb_id, type, "Excluded from library");
    setExclusions((prev) => [...prev, { tmdb_id, type, reason: "Excluded from library" }]);
  }

  const filtered =
    filter === "excluded"
      ? []
      : filter === "all"
        ? titles
        : titles.filter((t) => t.sentiment === filter);

  const excludedSet = new Set(exclusions.map((e) => `${e.tmdb_id}:${e.type}`));

  if (loading) return <LoadingSpinner text="Loading library..." />;

  const tabs = [
    { id: "all", label: "All", count: titles.length },
    { id: "liked", label: "Liked", count: titles.filter((t) => t.sentiment === "liked").length },
    { id: "disliked", label: "Disliked", count: titles.filter((t) => t.sentiment === "disliked").length },
    { id: "neutral", label: "Neutral", count: titles.filter((t) => t.sentiment === "neutral").length },
    { id: "excluded", label: "Excluded", count: exclusions.length },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Library</h2>

      <div className="mb-5">
        <AnimatedTabs tabs={tabs} active={filter} onChange={(id) => setFilter(id as Filter)} />
      </div>

      {filter === "excluded" ? (
        exclusions.length === 0 ? (
          <EmptyState title="No exclusions" description="Titles you exclude won't appear in recommendations." />
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
                  Remove
                </button>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No titles here"
          description="Search for movies and shows to build your library."
          action={
            <Link href="/search">
              <GlowButton>Search</GlowButton>
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
                  ? [{ label: "Excluded", action: "excluded", variant: "red" as const }]
                  : [{ label: "Exclude", action: "exclude", variant: "red" as const }]),
                { label: "Remove", action: "remove", variant: "default" as const },
              ]}
            />
          ))}
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
