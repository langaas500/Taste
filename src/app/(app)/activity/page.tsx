"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import Link from "next/link";
import type { MediaType } from "@/lib/types";

interface Activity {
  user_name: string;
  user_id: string;
  action: string;
  sentiment: string | null;
  favorite: boolean | null;
  tmdb_id: number;
  type: MediaType;
  title: string | null;
  poster_path: string | null;
  year: number | null;
  updated_at: string;
}

function actionLabel(action: string, sentiment: string | null): string {
  if (action === "watched") {
    if (sentiment === "liked") return "likte";
    if (sentiment === "disliked") return "likte ikke";
    return "så";
  }
  if (action === "watchlist") return "la til i se-listen";
  if (action === "watching") return "følger med på";
  return action;
}

function actionIcon(action: string, sentiment: string | null): string {
  if (action === "watched") {
    if (sentiment === "liked") return "👍";
    if (sentiment === "disliked") return "👎";
    return "✅";
  }
  if (action === "watchlist") return "📋";
  if (action === "watching") return "📺";
  return "🎬";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "akkurat nå";
  if (minutes < 60) return `${minutes}m siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}t siden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d siden`;
  return new Date(dateStr).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTitle, setModalTitle] = useState<{ tmdb_id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/activity/friends")
      .then((r) => r.json())
      .then((d) => setActivities(d.activities || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Laster aktivitet..." />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Venneaktivitet</h2>
        <p className="text-sm text-[var(--text-tertiary)]">Se hva vennene dine ser og liker.</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="Ingen aktivitet ennå"
          description="Koble deg til venner for å se hva de ser på. Del koblingskoden din fra innstillinger."
          action={
            <Link href="/settings">
              <GlowButton>Gå til innstillinger</GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => (
            <button
              key={`${a.tmdb_id}-${a.type}-${a.user_id}-${i}`}
              onClick={() => setModalTitle({ tmdb_id: a.tmdb_id, type: a.type, title: a.title || "Ukjent", poster_path: a.poster_path })}
              className="w-full glass rounded-[var(--radius-lg)] p-4 flex items-center gap-4 text-left hover:border-[var(--glass-hover)] transition-colors btn-press"
            >
              {/* Poster */}
              <div className="w-12 h-[72px] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-surface)] flex-shrink-0">
                {a.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${a.poster_path}`}
                    alt={a.title || ""}
                    width={48}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-lg">🎬</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {a.user_name}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {actionLabel(a.action, a.sentiment)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">
                  {a.title || "Ukjent tittel"}
                  {a.year ? ` (${a.year})` : ""}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                  {timeAgo(a.updated_at)}
                </p>
              </div>

              {/* Action emoji */}
              <span className="text-lg flex-shrink-0">{actionIcon(a.action, a.sentiment)}</span>
            </button>
          ))}
        </div>
      )}

      {modalTitle && (
        <StreamingModal
          tmdbId={modalTitle.tmdb_id}
          type={modalTitle.type}
          title={modalTitle.title}
          posterPath={modalTitle.poster_path}
          onClose={() => setModalTitle(null)}
        />
      )}
    </div>
  );
}
