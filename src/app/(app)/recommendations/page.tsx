"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { submitFeedback, addExclusion, logTitle } from "@/lib/api";
import type { Recommendation, MediaType } from "@/lib/types";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [feedbackStates, setFeedbackStates] = useState<Record<string, string>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [dismissTimers, setDismissTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);

  useEffect(() => {
    loadRecs();
  }, []);

  async function loadRecs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommendations");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecs(data.recommendations || []);
      setLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load recommendations");
    }
    setLoading(false);
  }

  async function handleFeedback(rec: Recommendation, action: string) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    setFeedbackStates((prev) => ({ ...prev, [key]: action }));

    if (action === "like_suggestion") {
      await submitFeedback(rec.tmdb_id, rec.type, "like_suggestion");
    } else if (action === "not_for_me") {
      await submitFeedback(rec.tmdb_id, rec.type, "not_for_me");
    } else if (action === "exclude") {
      await addExclusion(rec.tmdb_id, rec.type, "From recommendations");
    }
  }

  async function handleTitleAction(rec: Recommendation, action: string) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    if (action === "add-to-list") {
      setAddToListItem({ tmdb_id: rec.tmdb_id, type: rec.type, title: rec.title });
      return;
    }
    setActionStates((prev) => ({ ...prev, [key]: action }));
    try {
      if (action === "watchlist") {
        await logTitle({ tmdb_id: rec.tmdb_id, type: rec.type, status: "watchlist" });
      } else if (action === "liked" || action === "disliked" || action === "neutral") {
        await logTitle({ tmdb_id: rec.tmdb_id, type: rec.type, status: "watched", sentiment: action });
      }
      const timer = setTimeout(() => {
        setDismissed((prev) => new Set(prev).add(key));
        setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
      }, 3000);
      setDismissTimers((prev) => ({ ...prev, [key]: timer }));
    } catch {
      setActionStates((prev) => ({ ...prev, [key]: "" }));
    }
  }

  function handleUndo(rec: Recommendation) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    const timer = dismissTimers[key];
    if (timer) clearTimeout(timer);
    setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setActionStates((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  const visible = recs.filter((r) => !dismissed.has(`${r.tmdb_id}:${r.type}`));

  if (loading) return <AIThinkingScreen />;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">For deg</h2>
        <GlowButton onClick={loadRecs} disabled={loading}>
          {loaded ? "Oppdater" : "Hent anbefalinger"}
        </GlowButton>
      </div>

      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">
          {error}
        </div>
      )}

      {!loaded && (
        <EmptyState
          title="Personlige anbefalinger"
          description="Trykk p\u00e5 knappen over for \u00e5 generere anbefalinger basert p\u00e5 biblioteket og smaksprofilen din."
          icon={
            <svg className="w-7 h-7 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
      )}

      {loaded && visible.length === 0 && (
        <EmptyState
          title="Alt gjennomg\u00e5tt!"
          description="Du har vurdert alle anbefalingene. Trykk Oppdater for \u00e5 f\u00e5 flere."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 stagger">
        {visible.map((rec) => {
          const imgSrc = rec.poster_path
            ? `https://image.tmdb.org/t/p/w342${rec.poster_path}`
            : null;
          const key = `${rec.tmdb_id}:${rec.type}`;
          const actionDone = actionStates[key];
          const feedbackDone = feedbackStates[key];

          return (
            <div
              key={key}
              className="glass card-lift rounded-[var(--radius-lg)] overflow-hidden"
            >
              <div
                className="flex gap-3 p-4 cursor-pointer"
                onClick={() => setSelectedItem({ id: rec.tmdb_id, type: rec.type, title: rec.title, poster_path: rec.poster_path || null })}
              >
                <div className="w-[72px] h-[108px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-surface)]">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={rec.title} width={72} height={108} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-[10px]">Ingen plakat</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">{rec.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {rec.year || "—"} &middot; {rec.type.toUpperCase()}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-2">
                    {rec.why}
                  </p>
                  {rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-[var(--radius-full)] bg-[var(--accent-glow)] text-[var(--accent-light)] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title actions */}
              {actionDone ? (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-xs font-semibold text-emerald-400">
                      {actionDone === "watchlist" ? "Lagt til i se-liste" : actionDone === "liked" ? "Likte" : actionDone === "disliked" ? "Mislikte" : actionDone === "neutral" ? "Nøytral" : actionDone}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUndo(rec)}
                    className="text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
                  >
                    Angre
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex border-t border-[var(--glass-border)]">
                    <button
                      onClick={() => handleTitleAction(rec, "liked")}
                      aria-label="Sett og likte"
                      className="btn-press flex-1 py-3 sm:py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/15 transition-colors"
                    >
                      👍 Sett
                    </button>
                    <button
                      onClick={() => handleTitleAction(rec, "disliked")}
                      aria-label="Sett og mislikte"
                      className="btn-press flex-1 py-3 sm:py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 active:bg-red-500/15 transition-colors border-l border-[var(--glass-border)]"
                    >
                      👎 Sett
                    </button>
                    <button
                      onClick={() => handleTitleAction(rec, "watchlist")}
                      aria-label="Legg til i se-liste"
                      className="btn-press flex-1 py-3 sm:py-2 text-xs font-medium text-white/60 hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors border-l border-[var(--glass-border)]"
                    >
                      + Se-liste
                    </button>
                    <button
                      onClick={() => handleTitleAction(rec, "add-to-list")}
                      aria-label="Legg til i liste"
                      className="btn-press flex-1 py-3 sm:py-2 text-xs font-medium text-[var(--accent-light)] hover:bg-[var(--accent-glow)] active:bg-[var(--accent)]/15 transition-colors border-l border-[var(--glass-border)]"
                    >
                      List+
                    </button>
                  </div>
                  <div className="flex border-t border-[var(--glass-border)]">
                    <button
                      onClick={() => handleFeedback(rec, "like_suggestion")}
                      className={`btn-press flex-1 py-2.5 sm:py-2 text-[11px] font-medium transition-colors border-l first:border-l-0 border-[var(--glass-border)] ${feedbackDone === "like_suggestion" ? "bg-[var(--green-glow)] text-[var(--green)]" : feedbackDone ? "text-white/20" : "text-[var(--green)] hover:bg-[var(--green-glow)]"}`}
                    >
                      {feedbackDone === "like_suggestion" ? "✓ Bra forslag" : "Bra forslag"}
                    </button>
                    <button
                      onClick={() => handleFeedback(rec, "not_for_me")}
                      className={`btn-press flex-1 py-2.5 sm:py-2 text-[11px] font-medium transition-colors border-l border-[var(--glass-border)] ${feedbackDone === "not_for_me" ? "bg-[var(--yellow-glow)] text-[var(--yellow)]" : feedbackDone ? "text-white/20" : "text-[var(--yellow)] hover:bg-[var(--yellow-glow)]"}`}
                    >
                      {feedbackDone === "not_for_me" ? "✓ Ikke for meg" : "Ikke for meg"}
                    </button>
                    <button
                      onClick={() => handleFeedback(rec, "exclude")}
                      className={`btn-press flex-1 py-2.5 sm:py-2 text-[11px] font-medium transition-colors border-l border-[var(--glass-border)] ${feedbackDone === "exclude" ? "bg-[var(--red-glow)] text-[var(--red)]" : feedbackDone ? "text-white/20" : "text-[var(--red)] hover:bg-[var(--red-glow)]"}`}
                    >
                      {feedbackDone === "exclude" ? "✓ Ikke anbefal" : "Ikke anbefal"}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add to List Modal */}
      {addToListItem && (
        <AddToListModal
          tmdb_id={addToListItem.tmdb_id}
          type={addToListItem.type}
          title={addToListItem.title}
          onClose={() => setAddToListItem(null)}
        />
      )}

      {/* Streaming Modal */}
      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
          actions={[
            { label: "👍 Sett", action: "liked", variant: "green" },
            { label: "👎 Sett", action: "disliked", variant: "red" },
            { label: "😐 Sett", action: "neutral", variant: "yellow" },
            { label: "+ Se-liste", action: "watchlist", variant: "default" },
            { label: "List+", action: "add-to-list", variant: "accent" },
          ]}
          onAction={(action) => {
            if (action === "add-to-list") {
              setAddToListItem({ tmdb_id: selectedItem.id, type: selectedItem.type, title: selectedItem.title });
              return;
            }
            const rec = recs.find((r) => r.tmdb_id === selectedItem.id && r.type === selectedItem.type);
            if (rec) handleTitleAction(rec, action);
          }}
        />
      )}
    </div>
  );
}
