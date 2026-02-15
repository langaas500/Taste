"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaType, Sentiment, FriendOverlap } from "@/lib/types";

interface TitleCardProps {
  tmdb_id: number;
  type: MediaType;
  title: string;
  year?: number | null;
  poster_path?: string | null;
  sentiment?: Sentiment | null;
  status?: string | null;
  progress?: { season: number; episode: number } | null;
  isFavorite?: boolean;
  friendOverlap?: FriendOverlap[];
  onAction?: (action: string) => void;
  onClick?: () => void;
  actions?: { label: string; action: string; variant?: "default" | "green" | "red" | "yellow" | "accent" }[];
  children?: React.ReactNode;
}

const sentimentConfig = {
  liked: { dotBg: "bg-emerald-400", color: "text-emerald-400", label: "Likte" },
  disliked: { dotBg: "bg-red-400", color: "text-red-400", label: "Mislikte" },
  neutral: { dotBg: "bg-amber-400", color: "text-amber-400", label: "Meh" },
};

export default function TitleCard({
  type,
  title,
  year,
  poster_path,
  sentiment,
  progress,
  isFavorite,
  friendOverlap,
  onAction,
  onClick,
  actions,
  children,
}: TitleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgSrc = poster_path ? `https://image.tmdb.org/t/p/w342${poster_path}` : null;

  return (
    <div className="group relative flex flex-col">
      {/* Poster - clickable for info */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-500 cursor-pointer" onClick={onClick}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/15">
              <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 16l5-4 3 3 4-5 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {imgSrc && !imgLoaded && (
          <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 text-[9px] font-semibold uppercase tracking-widest text-white/60">
          {type === "tv" ? "TV" : "Film"}
        </div>

        {/* Progress badge (episode tracking) */}
        {progress && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-sky-400 tracking-wide">
            S{progress.season} E{progress.episode}
          </div>
        )}

        {/* Favorite star - centered on poster */}
        <button
          aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til favoritter"}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 z-10"
          style={{
            background: isFavorite ? "rgba(250,204,21,0.25)" : "rgba(0,0,0,0.5)",
            opacity: isFavorite ? 1 : 0,
            pointerEvents: isFavorite ? "auto" : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAction?.("toggle-favorite");
          }}
        >
          <svg
            className="w-5 h-5 transition-transform duration-200 active:scale-125 drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="#facc15"
            stroke="#facc15"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
        {/* Unfavorite on hover - only visible when hovering and not already favorite */}
        {!isFavorite && (
          <button
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("toggle-favorite");
            }}
          >
            <svg
              className="w-5 h-5 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )}

        {/* Sentiment dot */}
        {sentiment && (
          <div className="absolute top-2 right-2 z-10">
            <span className={`block w-3.5 h-3.5 rounded-full ${sentimentConfig[sentiment].dotBg} ring-2 ring-black/40 shadow-lg`} />
          </div>
        )}

        {/* Hover overlay with actions - desktop only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex-col justify-end p-3 gap-1.5 hidden md:flex">
          {actions && actions.length > 0 && (
            <div className="flex gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400 ease-out">
              {actions.map(({ label, action, variant = "default" }) => {
                const isLike = action === "like" || variant === "green";
                const isDislike = action === "dislike" || variant === "red";
                const isMeh = action === "meh" || variant === "yellow";
                const isAccent = variant === "accent";

                let btnClass = "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white";
                if (isLike) btnClass = "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30";
                if (isDislike) btnClass = "bg-red-500/15 text-red-400 hover:bg-red-500/30";
                if (isMeh) btnClass = "bg-amber-500/15 text-amber-400 hover:bg-amber-500/30";
                if (isAccent) btnClass = "bg-[var(--accent)]/15 text-[var(--accent-light)] hover:bg-[var(--accent)]/30";

                return (
                  <button
                    key={action}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(action);
                    }}
                    aria-label={label.replace(/[\u{1F44D}\u{1F44E}\u{1F610}★✕+]/gu, "").trim() || label}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-95 ${btnClass}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Text below poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-[13px] font-medium text-white/85 leading-tight truncate group-hover:text-white transition-colors duration-300 cursor-pointer" onClick={onClick}>
          {title}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-white/30 tabular-nums">{year || "—"}</span>
          {sentiment && (
            <>
              <span className="text-white/10">·</span>
              <span className={`text-[11px] ${sentimentConfig[sentiment].color}`}>
                {sentimentConfig[sentiment].label}
              </span>
            </>
          )}
          {progress && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[11px] text-sky-400">S{progress.season}E{progress.episode}</span>
            </>
          )}
        </div>
        {friendOverlap && friendOverlap.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-white/30">👥</span>
            <span className="text-[10px] text-white/40 truncate">
              {friendOverlap.length <= 2
                ? friendOverlap.map((f) => f.name).join(", ")
                : `${friendOverlap.slice(0, 2).map((f) => f.name).join(", ")} +${friendOverlap.length - 2}`}
            </span>
          </div>
        )}
        {children}
      </div>

      {/* Mobile action buttons - always visible */}
      {actions && actions.length > 0 && (
        <div className="flex gap-1 mt-2 md:hidden">
          {actions.map(({ label, action, variant = "default" }) => {
            const isLike = action === "like" || action === "liked" || variant === "green";
            const isDislike = action === "dislike" || action === "disliked" || variant === "red";
            const isMeh = action === "meh" || action === "neutral" || variant === "yellow";
            const isAccent = variant === "accent";

            let btnClass = "bg-white/[0.06] text-white/50 active:bg-white/[0.12] border-white/[0.06]";
            if (isLike) btnClass = "bg-emerald-500/10 text-emerald-400 active:bg-emerald-500/25 border-emerald-500/15";
            if (isDislike) btnClass = "bg-red-500/10 text-red-400 active:bg-red-500/25 border-red-500/15";
            if (isMeh) btnClass = "bg-amber-500/10 text-amber-400 active:bg-amber-500/25 border-amber-500/15";
            if (isAccent) btnClass = "bg-[var(--accent)]/10 text-[var(--accent-light)] active:bg-[var(--accent)]/25 border-[var(--accent)]/15";

            return (
              <button
                key={action}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(action);
                }}
                aria-label={label.replace(/[\u{1F44D}\u{1F44E}\u{1F610}★✕+]/gu, "").trim() || label}
                className={`flex-1 py-2 rounded-lg text-[10px] font-semibold border transition-all active:scale-95 ${btnClass}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
