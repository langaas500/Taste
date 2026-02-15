"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";
import { fetchLists, createList, deleteList } from "@/lib/api";

interface ListWithMeta {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
  thumbnails: (string | null)[];
  created_at: string;
}

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchLists();
      setLists(data.lists as unknown as ListWithMeta[]);
    } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const data = await createList(newName.trim());
      setLists((prev) => [{ ...data.list, item_count: 0, thumbnails: [] } as ListWithMeta, ...prev]);
      setNewName("");
      setShowCreate(false);
    } catch {}
    setCreating(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch {}
  }

  if (loading) return <LoadingSpinner text="Laster lister..." />;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Mine lister</h2>
        <GlowButton onClick={() => setShowCreate(!showCreate)} size="sm">
          + Ny liste
        </GlowButton>
      </div>

      {showCreate && (
        <GlassCard hover={false} className="p-4 mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
              autoFocus
              placeholder="Listenavn..."
              maxLength={50}
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-[var(--text-primary)] placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
            <GlowButton onClick={handleCreate} disabled={creating || !newName.trim()} size="sm">
              {creating ? "Oppretter..." : "Opprett"}
            </GlowButton>
            <button
              onClick={() => setShowCreate(false)}
              className="px-3 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </GlassCard>
      )}

      {lists.length === 0 ? (
        <EmptyState
          title="Ingen lister enn\u00e5"
          description="Lag egne lister for \u00e5 organisere filmene og seriene dine."
          action={
            <GlowButton onClick={() => setShowCreate(true)}>Lag din f\u00f8rste liste</GlowButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {lists.map((list) => (
            <GlassCard
              key={list.id}
              className="p-4 cursor-pointer group"
              onClick={() => router.push(`/lists/${list.id}`)}
            >
              {/* Thumbnail grid */}
              <div className="grid grid-cols-4 gap-1 mb-3 rounded-lg overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[2/3] bg-white/[0.03]">
                    {list.thumbnails[i] && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${list.thumbnails[i]}`}
                        alt=""
                        width={92}
                        height={138}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                    {list.name}
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">
                    {list.item_count} {list.item_count === 1 ? "tittel" : "titler"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(list.id);
                  }}
                  className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
