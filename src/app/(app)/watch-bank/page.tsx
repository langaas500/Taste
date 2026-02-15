"use client";

import { useEffect, useState } from "react";
import TitleCard from "@/components/TitleCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { logTitle, updateProgress, toggleFavorite, removeTitle } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import type { UserTitle, TitleCache, MediaType } from "@/lib/types";

export default function WatchBankPage() {
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
      supabase.from("user_titles").select("*").eq("user_id", user.id).eq("status", "watching").order("updated_at", { ascending: false }),
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

  async function handleUpdateProgress(tmdb_id: number, type: MediaType, season: number, episode: number) {
    season = Math.max(1, season);
    episode = Math.max(1, episode);
    await updateProgress(tmdb_id, type, season, episode);
    setTitles((prev) =>
      prev.map((t) =>
        t.tmdb_id === tmdb_id && t.type === type
          ? { ...t, last_season: season, last_episode: episode }
          : t
      )
    );
  }

  async function handleToggleFavorite(tmdb_id: number, type: MediaType) {
    const t = titles.find((x) => x.tmdb_id === tmdb_id && x.type === type);
    if (!t) return;
    const newVal = !t.favorite;
    await toggleFavorite(tmdb_id, type, newVal);
    setTitles((prev) =>
      prev.map((x) =>
        x.tmdb_id === tmdb_id && x.type === type ? { ...x, favorite: newVal } : x
      )
    );
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

  if (loading) return (
    <div className="animate-fade-in-up">
      <div className="glass rounded-xl px-5 py-4 mb-5">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-3 w-56 rounded mt-2" />
      </div>
      <SkeletonGrid count={6} />
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="glass rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Watch Bank</h2>
          <p className="text-xs text-white/50 mt-0.5">Husk hvor du var i seriene dine</p>
        </div>
        {titles.length > 0 && (
          <span className="text-sm text-white/60 font-medium">{titles.length} serier</span>
        )}
      </div>

      {titles.length === 0 ? (
        <div className="glass rounded-xl px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h3 className="text-lg font-semibold text-white">Ingen serier lagret</h3>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">Legg til serier du vil fortsette senere, så husker vi hvilken episode du er på.</p>
            <div className="mt-3">
              <Link href="/search">
                <GlowButton>Søk etter serier</GlowButton>
              </Link>
            </div>
          </div>
        </div>
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
              progress={t.last_season && t.last_episode ? { season: t.last_season, episode: t.last_episode } : null}
              isFavorite={t.favorite}
              onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              onAction={(action) => handleAction(t, action)}
              actions={[
                { label: "Ferdig", action: "liked", variant: "green" },
                { label: "Fjern", action: "remove", variant: "red" },
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
            isFavorite={t?.favorite}
            onToggleFavorite={() => handleToggleFavorite(selectedItem.id, selectedItem.type)}
            progress={t?.last_season && t?.last_episode ? { season: t.last_season, episode: t.last_episode } : null}
            onUpdateProgress={(season, episode) => handleUpdateProgress(selectedItem.id, selectedItem.type, season, episode)}
            actions={[
              { label: "List+", action: "add-to-list", variant: "accent" },
              { label: "Ferdig 👍", action: "liked", variant: "green" },
              { label: "Ferdig 👎", action: "disliked", variant: "red" },
              { label: "Ferdig 😐", action: "neutral", variant: "yellow" },
              { label: "Fjern", action: "remove", variant: "default" },
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
