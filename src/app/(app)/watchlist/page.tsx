"use client";

import { useEffect, useState } from "react";
import TitleCard from "@/components/TitleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { logTitle, removeTitle } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType } from "@/lib/types";

export default function WatchlistPage() {
  const [titles, setTitles] = useState<(UserTitle & { cache?: TitleCache })[]>([]);
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

    const [{ data: ut }, { data: cache }] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id).eq("status", "watchlist").order("created_at", { ascending: false }),
      supabase.from("titles_cache").select("*"),
    ]);

    const cacheMap = new Map<string, TitleCache>();
    for (const c of (cache || []) as TitleCache[]) {
      cacheMap.set(`${c.tmdb_id}:${c.type}`, c);
    }

    setTitles(
      ((ut || []) as UserTitle[]).map((t) => ({
        ...t,
        cache: cacheMap.get(`${t.tmdb_id}:${t.type}`),
      }))
    );
    setLoading(false);
  }

  async function handleAction(t: UserTitle & { cache?: TitleCache }, action: string) {
    if (action === "add-to-list") {
      setAddToListItem({ tmdb_id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}` });
      return;
    }
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
  }

  if (loading) return <LoadingSpinner text="Loading watchlist..." />;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Watchlist</h2>
        {titles.length > 0 && (
          <span className="text-sm text-[var(--text-tertiary)] font-medium">{titles.length} titles</span>
        )}
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Add movies and shows you want to watch later."
          action={
            <Link href="/search">
              <GlowButton>Search</GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 stagger">
          {titles.map((t) => (
            <TitleCard
              key={t.id}
              tmdb_id={t.tmdb_id}
              type={t.type}
              title={t.cache?.title || `TMDB:${t.tmdb_id}`}
              year={t.cache?.year}
              poster_path={t.cache?.poster_path}
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
      )}

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
