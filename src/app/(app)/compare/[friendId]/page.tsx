"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";

interface CacheItem {
  title?: string;
  poster_path?: string | null;
  year?: number | null;
  key: string;
}

interface CompareData {
  friendName: string;
  matchPercent: number | null;
  stats: {
    myTotal: number;
    friendTotal: number;
    bothWatched: number;
    agree: number;
    disagree: number;
  };
  sharedLiked: CacheItem[];
  onlyMe: CacheItem[];
  onlyFriend: CacheItem[];
}

function PosterRow({ items, label }: { items: CacheItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{label}</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((item) => (
          <div key={item.key} className="flex-shrink-0 w-[90px]">
            <div className="aspect-[2/3] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-surface)] mb-1">
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                  alt={item.title || ""}
                  width={90}
                  height={135}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-2xl">🎬</div>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] truncate">{item.title || "Ukjent"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const params = useParams();
  const friendId = params.friendId as string;
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/compare/${friendId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Kunne ikke laste sammenligningen");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [friendId]);

  if (loading) return <LoadingSpinner text="Sammenligner smak..." />;

  if (error || !data) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <p className="text-[var(--text-tertiary)]">{error || "Noe gikk galt"}</p>
        <Link href="/shared" className="mt-4 inline-block">
          <GlowButton>Tilbake</GlowButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Du vs. {data.friendName}
        </h2>
        {data.matchPercent !== null ? (
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3">
            <span className="text-3xl font-black gradient-text">{data.matchPercent}%</span>
            <span className="text-sm text-[var(--text-secondary)]">enige</span>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)]">Ikke nok felles vurderinger ennå</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <GlassCard className="p-4 text-center" hover={false} onClick={undefined}>
          <p className="text-2xl font-bold text-[var(--accent-light)]">{data.stats.bothWatched}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Felles titler</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" hover={false} onClick={undefined}>
          <p className="text-2xl font-bold text-[var(--green)]">{data.stats.agree}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Enige</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" hover={false} onClick={undefined}>
          <p className="text-2xl font-bold text-[var(--red)]">{data.stats.disagree}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Uenige</p>
        </GlassCard>
      </div>

      {/* Shared liked titles */}
      <PosterRow items={data.sharedLiked} label="Begge likte" />

      {/* Only me */}
      <PosterRow items={data.onlyMe} label="Bare du har sett" />

      {/* Only friend */}
      <PosterRow items={data.onlyFriend} label={`Bare ${data.friendName} har sett`} />

      {/* Back link */}
      <div className="text-center mt-8">
        <Link href="/shared" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
          Tilbake til delte lister
        </Link>
      </div>
    </div>
  );
}
