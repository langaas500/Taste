"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchLists, addToList, removeFromList, createList } from "@/lib/api";
import type { MediaType } from "@/lib/types";

interface AddToListModalProps {
  tmdb_id: number;
  type: MediaType;
  title: string;
  onClose: () => void;
}

interface ListInfo {
  id: string;
  name: string;
  item_count: number;
}

export default function AddToListModal({ tmdb_id, type, title, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<ListInfo[]>([]);
  const [inLists, setInLists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  async function loadLists() {
    try {
      const data = await fetchLists();
      setLists(data.lists as unknown as ListInfo[]);

      // Check which lists already contain this title
      // We'll fetch each list's items - for now, use a simple approach
      // The API returns thumbnails but not full item lists, so we check via items endpoint
      const res = await fetch(`/api/lists/check?tmdb_id=${tmdb_id}&type=${type}`);
      if (res.ok) {
        const check = await res.json();
        setInLists(new Set(check.list_ids || []));
      }
    } catch {}
    setLoading(false);
  }

  async function handleToggle(listId: string) {
    if (inLists.has(listId)) {
      await removeFromList(listId, tmdb_id, type);
      setInLists((prev) => { const s = new Set(prev); s.delete(listId); return s; });
    } else {
      await addToList(listId, tmdb_id, type);
      setInLists((prev) => new Set(prev).add(listId));
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const data = await createList(newName.trim());
      const newList = data.list as unknown as ListInfo;
      await addToList(newList.id, tmdb_id, type);
      setLists((prev) => [...prev, { ...newList, item_count: 1 }]);
      setInLists((prev) => new Set(prev).add(newList.id));
      setNewName("");
    } catch {}
    setCreating(false);
  }

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#0c1022] border border-white/[0.08] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Legg til i liste</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-white/30 mt-1 truncate">{title}</p>
        </div>

        {/* Lists */}
        <div className="p-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            </div>
          ) : lists.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-6">Ingen lister ennå. Lag en nedenfor.</p>
          ) : (
            <div className="space-y-1">
              {lists.map((list) => {
                const isIn = inLists.has(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleToggle(list.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                      isIn
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isIn ? "text-emerald-400" : "text-white/70"}`}>
                      {list.name}
                    </span>
                    {isIn ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new list */}
        <div className="p-3 pt-0 border-t border-white/[0.06]">
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="Nytt listenavn..."
              maxLength={50}
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-3 py-2 bg-[var(--accent)]/15 text-[var(--accent-light)] rounded-lg text-xs font-semibold hover:bg-[var(--accent)]/25 transition-all disabled:opacity-30"
            >
              {creating ? "..." : "Opprett"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
