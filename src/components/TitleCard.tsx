"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaType, Sentiment } from "@/lib/types";

interface TitleCardProps {
  tmdb_id: number;
  type: MediaType;
  title: string;
  year?: number | null;
  poster_path?: string | null;
  sentiment?: Sentiment | null;
  status?: string | null;
  onAction?: (action: string) => void;
  onClick?: () => void;
  actions?: { label: string; action: string; variant?: "default" | "green" | "red" | "yellow" | "accent" }[];
  children?: React.ReactNode;
}

const sentimentConfig = {
  liked: { dotBg: "bg-emerald-400", color: "text-emerald-400", label: "Liked" },
  disliked: { dotBg: "bg-red-400", color: "text-red-400", label: "Disliked" },
  neutral: { dotBg: "bg-amber-400", color: "text-amber-400", label: "Meh" },
};

export default function TitleCard({
  type,
  title,
  year,
  poster_path,
  sentiment,
  onAction,
  onClick,
  actions,
  children,
}: TitleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgSrc = poster_path ? `https://image.tmdb.org/t/p/w342${poster_path}` : null;

  return (
    <div className="group relative flex flex-col cursor-pointer" onClick={onClick}>
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-500">
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

        {/* Sentiment dot */}
        {sentiment && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`block w-2.5 h-2.5 rounded-full ${sentimentConfig[sentiment].dotBg} ring-2 ring-black/30`} />
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-3 gap-1.5">
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
        <h3 className="text-[13px] font-medium text-white/85 leading-tight truncate group-hover:text-white transition-colors duration-300">
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
        </div>
        {children}
      </div>
    </div>
  );
}
