"use client";

import { useEffect, useState } from "react";
import TitleCard from "@/components/TitleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import StreamingModal from "@/components/StreamingModal";
import { fetchSharedLists } from "@/lib/api";
import type { SharedList, TitleCache, MediaType } from "@/lib/types";

export default function SharedPage() {
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchSharedLists();
      setSharedLists(data.sharedLists);
    } catch {}
    setLoading(false);
  }

  if (loading) return <LoadingSpinner text="Laster delte lister..." />;

  if (sharedLists.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Delt med meg</h2>
        <EmptyState
          title="Ingen delte lister"
          description="N\u00e5r noen kobler seg til deg og deler listene sine, vises de her."
        />
      </div>
    );
  }

  // Group by owner
  const grouped = new Map<string, { owner_name: string | null; lists: SharedList[] }>();
  for (const sl of sharedLists) {
    const key = sl.owner_name || "Unknown";
    if (!grouped.has(key)) grouped.set(key, { owner_name: sl.owner_name, lists: [] });
    grouped.get(key)!.lists.push(sl);
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Delt med meg</h2>

      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([key, { owner_name, lists }]) => (
          <div key={key}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
              Fra {owner_name || "Ukjent"}
            </p>
            {lists.map((sl) => (
              <div key={sl.list.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-white/80">{sl.list.name}</h3>
                  <span className="text-xs text-white/25">
                    {sl.items.length} {sl.items.length === 1 ? "tittel" : "titler"}
                  </span>
                </div>
                {sl.items.length === 0 ? (
                  <p className="text-xs text-white/20">Tom liste</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {sl.items.map((item) => (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

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
