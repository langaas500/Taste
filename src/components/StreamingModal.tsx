"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { WatchProvider, WatchProviderData, FriendOverlap } from "@/lib/types";

interface ModalAction {
  label: string;
  action: string;
  variant?: "default" | "green" | "red" | "yellow" | "accent";
}

interface StreamingModalProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  onClose: () => void;
  actions?: ModalAction[];
  onAction?: (action: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  progress?: { season: number; episode: number } | null;
  onUpdateProgress?: (season: number, episode: number) => void;
  friendOverlap?: FriendOverlap[];
}

interface TitleDetails {
  overview: string | null;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number | null;
  year: number | null;
  genres: { id: number; name: string }[];
  // movie fields
  runtime?: number | null;
  // tv fields
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  // videos
  videos?: { results: VideoResult[] };
  // credits
  credits?: { cast: CastMember[] };
}

interface VideoResult {
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export default function StreamingModal({ tmdbId, type, title, posterPath, onClose, actions, onAction, isFavorite, onToggleFavorite, progress, onUpdateProgress, friendOverlap }: StreamingModalProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [providers, setProviders] = useState<WatchProviderData | null>(null);
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [detailsRes, providersRes] = await Promise.all([
          fetch(`/api/tmdb/details?tmdb_id=${tmdbId}&type=${type}`),
          fetch(`/api/tmdb/providers?tmdb_id=${tmdbId}&type=${type}`),
        ]);
        const detailsData = await detailsRes.json();
        const providersData = await providersRes.json();

        if (detailsData.error) throw new Error(detailsData.error);

        setDetails({
          overview: detailsData.overview,
          backdrop_path: detailsData.backdrop_path,
          poster_path: detailsData.poster_path,
          vote_average: detailsData.vote_average,
          year: detailsData.year,
          genres: detailsData.details?.genres || [],
          runtime: detailsData.details?.runtime,
          number_of_seasons: detailsData.details?.number_of_seasons,
          number_of_episodes: detailsData.details?.number_of_episodes,
          status: detailsData.details?.status,
          videos: detailsData.details?.videos,
          credits: detailsData.details?.credits,
        });

        if (!providersData.error) {
          setProviders(providersData.providers);
          setCountry(providersData.country);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
      setLoading(false);
    }
    fetchData();
  }, [tmdbId, type]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showTrailer) setShowTrailer(false);
        else onClose();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, showTrailer]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Find best trailer
  const trailer = details?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) || details?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) || details?.videos?.results?.find(
    (v) => v.site === "YouTube"
  );

  const hasProviders = providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length);
  const backdropSrc = details?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : posterPath
      ? `https://image.tmdb.org/t/p/w780${posterPath}`
      : null;

  const topCast = details?.credits?.cast?.slice(0, 6) || [];

  async function handleShare() {
    const tmdbUrl = `https://www.themoviedb.org/${type}/${tmdbId}`;
    const shareText = `${title}${details?.year ? ` (${details.year})` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: tmdbUrl });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${tmdbUrl}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard also failed, ignore
    }
  }

  // Format runtime
  const runtimeStr = details?.runtime
    ? `${Math.floor(details.runtime / 60)}t ${details.runtime % 60}m`
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* YouTube Trailer Overlay */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="absolute inset-0 bg-black/90" />
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              <XIcon />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl bg-[#0c1022] border border-white/[0.08] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Top buttons - always on top */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {/* Favorite star */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til favoritter"}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all border border-white/10"
              style={{ background: isFavorite ? "rgba(250,204,21,0.2)" : "rgba(0,0,0,0.6)" }}
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill={isFavorite ? "#facc15" : "none"} stroke={isFavorite ? "#facc15" : "rgba(255,255,255,0.6)"} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
          )}
          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/10 relative"
          >
            {shareCopied ? (
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            )}
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/10"
          >
            <XIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Backdrop header */}
          <div className="relative h-40 sm:h-72 overflow-hidden flex-shrink-0">
            {backdropSrc && (
              <Image
                src={backdropSrc}
                alt=""
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1022] via-[#0c1022]/60 to-transparent" />

            {/* Title overlay at bottom of backdrop */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4">
              {/* Small poster */}
              {posterPath && (
                <div className="relative w-20 h-[120px] rounded-lg overflow-hidden border border-white/10 shadow-lg flex-shrink-0 hidden sm:block">
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{title}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {details?.year && (
                    <span className="text-sm text-white/50">{details.year}</span>
                  )}
                  {runtimeStr && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-sm text-white/50">{runtimeStr}</span>
                    </>
                  )}
                  {type === "tv" && details?.number_of_seasons && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-sm text-white/50">
                        {details.number_of_seasons} {details.number_of_seasons === 1 ? "sesong" : "sesonger"}
                      </span>
                    </>
                  )}
                  {details?.vote_average && details.vote_average > 0 && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-sm text-amber-400">★ {details.vote_average.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content body */}
          <div className="p-5 space-y-5">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-7 h-7 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 text-center py-8">{error}</p>
            )}

            {!loading && !error && details && (
              <>
                {/* Genres */}
                {details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {details.genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.06] text-white/50 border border-white/[0.06]"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Episode progress (Watch Bank) */}
                {progress && onUpdateProgress && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/[0.06] border border-sky-500/15">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-sky-400/60 font-semibold uppercase tracking-wider mb-1">Husk hvor du var</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-sky-400">S{progress.season} E{progress.episode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (progress.episode > 1) {
                            onUpdateProgress(progress.season, progress.episode - 1);
                          } else if (progress.season > 1) {
                            onUpdateProgress(progress.season - 1, 1);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white flex items-center justify-center transition-all text-lg font-bold"
                      >
                        −
                      </button>
                      <button
                        onClick={() => onUpdateProgress(progress.season, progress.episode + 1)}
                        className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 flex items-center justify-center transition-all text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {actions && actions.length > 0 && onAction && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map(({ label, action, variant = "default" }) => {
                      const isLike = action === "like" || action === "liked" || variant === "green";
                      const isDislike = action === "dislike" || action === "disliked" || variant === "red";
                      const isMeh = action === "meh" || action === "neutral" || variant === "yellow";
                      const isAccent = variant === "accent";

                      let btnClass = "bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white border-white/[0.08]";
                      if (isLike) btnClass = "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20";
                      if (isDislike) btnClass = "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/20";
                      if (isMeh) btnClass = "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/20";
                      if (isAccent) btnClass = "bg-[var(--accent)]/15 text-[var(--accent-light)] hover:bg-[var(--accent)]/25 border-[var(--accent)]/20";

                      return (
                        <button
                          key={action}
                          onClick={() => {
                            onAction(action);
                            if (action !== "add-to-list") onClose();
                          }}
                          aria-label={label.replace(/[\u{1F44D}\u{1F44E}\u{1F610}★✕+]/gu, "").trim() || label}
                          className={`px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${btnClass}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Trailer button */}
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-600/25 hover:text-red-300 transition-all group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-sm font-semibold">Se trailer</span>
                  </button>
                )}

                {/* Overview */}
                {details.overview && (
                  <div>
                    <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-1.5">Handling</p>
                    <p className="text-sm text-white/60 leading-relaxed">{details.overview}</p>
                  </div>
                )}

                {/* Cast */}
                {topCast.length > 0 && (
                  <div>
                    <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2">Skuespillere</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                      {topCast.map((person) => (
                        <div key={person.id} className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                          {person.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                              alt={person.name}
                              width={28}
                              height={28}
                              className="rounded-full object-cover w-7 h-7"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 font-bold">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-white/70 truncate max-w-[100px]">{person.name}</p>
                            <p className="text-[10px] text-white/30 truncate max-w-[100px]">{person.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friend overlap */}
                {friendOverlap && friendOverlap.length > 0 && (
                  <div>
                    <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2">Venner som har denne</p>
                    <div className="space-y-1.5">
                      {friendOverlap.map((f, i) => {
                        const statusLabel =
                          f.status === "watched" ? "Sett" :
                          f.status === "watchlist" ? "Se-liste" :
                          f.status === "watching" ? `Ser nå${f.season && f.episode ? ` (S${f.season} E${f.episode})` : ""}` :
                          f.status;
                        const dotColor =
                          f.status === "watched" ? "bg-emerald-400" :
                          f.status === "watchlist" ? "bg-amber-400" :
                          "bg-sky-400";
                        return (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span className="text-sm text-white/70 flex-1">{f.name}</span>
                            <span className="text-xs text-white/40">{statusLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Streaming providers */}
                <div>
                  <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2">
                    Tilgjengelig i {country || "..."}
                  </p>

                  {!hasProviders && (
                    <p className="text-sm text-white/30">Ingen strømmetjenester tilgjengelig</p>
                  )}

                  {hasProviders && (
                    <div className="space-y-3">
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

                  {/* JustWatch attribution */}
                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ProviderSection({ label, providers }: { label: string; providers: WatchProvider[] }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-1.5">{label}</p>
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
