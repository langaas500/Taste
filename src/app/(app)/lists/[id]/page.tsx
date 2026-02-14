"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TitleCard from "@/components/TitleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import { fetchList, removeFromList } from "@/lib/api";
import Link from "next/link";
import type { CustomListWithItems, TitleCache, MediaType } from "@/lib/types";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<CustomListWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const data = await fetchList(id);
      setList(data.list);
    } catch {
      router.push("/lists");
    }
    setLoading(false);
  }

  async function handleRemove(tmdb_id: number, type: MediaType) {
    await removeFromList(id, tmdb_id, type);
    setList((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => !(i.tmdb_id === tmdb_id && i.type === type)) } : prev
    );
  }

  if (loading) return <LoadingSpinner text="Loading list..." />;
  if (!list) return null;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push("/lists")}
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{list.name}</h2>
          {list.description && (
            <p className="text-xs text-white/30 mt-0.5">{list.description}</p>
          )}
        </div>
        <span className="ml-auto text-sm text-white/30 font-medium">
          {list.items.length} {list.items.length === 1 ? "title" : "titles"}
        </span>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          title="This list is empty"
          description="Add movies and shows from search or your library."
          action={
            <Link href="/search">
              <GlowButton>Search</GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 stagger">
          {list.items.map((item) => (
            <TitleCard
              key={`${item.tmdb_id}:${item.type}`}
              tmdb_id={item.tmdb_id}
              type={item.type}
              title={(item.cache as TitleCache | undefined)?.title || `TMDB:${item.tmdb_id}`}
              year={(item.cache as TitleCache | undefined)?.year}
              poster_path={(item.cache as TitleCache | undefined)?.poster_path}
              onClick={() =>
                setSelectedItem({
                  id: item.tmdb_id,
                  type: item.type,
                  title: (item.cache as TitleCache | undefined)?.title || `TMDB:${item.tmdb_id}`,
                  poster_path: (item.cache as TitleCache | undefined)?.poster_path || null,
                })
              }
              onAction={(action) => {
                if (action === "remove") handleRemove(item.tmdb_id, item.type);
              }}
              actions={[
                { label: "Remove", action: "remove", variant: "red" },
              ]}
            />
          ))}
        </div>
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
