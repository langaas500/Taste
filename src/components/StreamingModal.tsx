"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { WatchProvider, WatchProviderData } from "@/lib/types";

interface StreamingModalProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  onClose: () => void;
}

export default function StreamingModal({ tmdbId, type, title, posterPath, onClose }: StreamingModalProps) {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<WatchProviderData | null>(null);
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(`/api/tmdb/providers?tmdb_id=${tmdbId}&type=${type}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setProviders(data.providers);
        setCountry(data.country);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
      setLoading(false);
    }
    fetchProviders();
  }, [tmdbId, type]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const hasProviders = providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1022] border border-white/[0.08] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header with poster background */}
        <div className="relative h-28 overflow-hidden">
          {posterPath && (
            <Image
              src={`https://image.tmdb.org/t/p/w780${posterPath}`}
              alt=""
              fill
              className="object-cover opacity-30 blur-sm"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c1022]" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-base font-semibold text-white truncate">{title}</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Streaming i {country || "..."}
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center py-6">{error}</p>
          )}

          {!loading && !error && !hasProviders && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">Ingen strømmetjenester tilgjengelig</p>
              <p className="text-white/20 text-xs mt-1">i {country}</p>
            </div>
          )}

          {!loading && !error && hasProviders && (
            <div className="space-y-4">
              {providers!.flatrate && providers!.flatrate.length > 0 && (
                <ProviderSection label="Stream" providers={providers!.flatrate} />
              )}
              {providers!.rent && providers!.rent.length > 0 && (
                <ProviderSection label="Lei" providers={providers!.rent} />
              )}
              {providers!.buy && providers!.buy.length > 0 && (
                <ProviderSection label="Kjøp" providers={providers!.buy} />
              )}
            </div>
          )}

          {/* JustWatch attribution (required by TMDB) */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-white/20">Data fra JustWatch</span>
            {providers?.link && (
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
              >
                Se alle alternativer →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderSection({ label, providers }: { label: string; providers: WatchProvider[] }) {
  return (
    <div>
      <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <div
            key={p.provider_id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            {p.logo_path && (
              <Image
                src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                alt={p.provider_name}
                width={24}
                height={24}
                className="rounded"
              />
            )}
            <span className="text-xs text-white/70">{p.provider_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
