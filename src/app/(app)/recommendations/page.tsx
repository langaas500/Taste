"use client";

import { useState } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import { submitFeedback, addExclusion } from "@/lib/api";
import type { Recommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

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

  async function handleAction(rec: Recommendation, action: string) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    setDismissed((prev) => new Set(prev).add(key));

    if (action === "like_suggestion") {
      await submitFeedback(rec.tmdb_id, rec.type, "like_suggestion");
    } else if (action === "not_for_me") {
      await submitFeedback(rec.tmdb_id, rec.type, "not_for_me");
    } else if (action === "exclude") {
      await addExclusion(rec.tmdb_id, rec.type, "From recommendations");
    }
  }

  const visible = recs.filter((r) => !dismissed.has(`${r.tmdb_id}:${r.type}`));

  if (loading) return <AIThinkingScreen />;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">For You</h2>
        <GlowButton onClick={loadRecs} disabled={loading}>
          {loaded ? "Refresh" : "Get Recommendations"}
        </GlowButton>
      </div>

      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">
          {error}
        </div>
      )}

      {!loaded && (
        <EmptyState
          title="Personalized recommendations"
          description="Click the button above to generate recommendations based on your library and taste profile."
          icon={
            <svg className="w-7 h-7 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
      )}

      {loaded && visible.length === 0 && (
        <EmptyState
          title="All caught up!"
          description="You've reviewed all recommendations. Click Refresh to get more."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 stagger">
        {visible.map((rec) => {
          const imgSrc = rec.poster_path
            ? `https://image.tmdb.org/t/p/w342${rec.poster_path}`
            : null;

          return (
            <div
              key={`${rec.tmdb_id}:${rec.type}`}
              className="glass card-lift rounded-[var(--radius-lg)] overflow-hidden"
            >
              <div className="flex gap-3 p-4">
                <div className="w-[72px] h-[108px] flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-surface)]">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={rec.title} width={72} height={108} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-[10px]">No poster</div>
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
              <div className="flex border-t border-[var(--glass-border)]">
                <button
                  onClick={() => handleAction(rec, "like_suggestion")}
                  className="btn-press flex-1 py-2.5 text-xs font-medium text-[var(--green)] hover:bg-[var(--green-glow)] transition-colors"
                >
                  Like suggestion
                </button>
                <button
                  onClick={() => handleAction(rec, "not_for_me")}
                  className="btn-press flex-1 py-2.5 text-xs font-medium text-[var(--yellow)] hover:bg-[var(--yellow-glow)] transition-colors border-l border-[var(--glass-border)]"
                >
                  Not for me
                </button>
                <button
                  onClick={() => handleAction(rec, "exclude")}
                  className="btn-press flex-1 py-2.5 text-xs font-medium text-[var(--red)] hover:bg-[var(--red-glow)] transition-colors border-l border-[var(--glass-border)]"
                >
                  Don&apos;t recommend
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
