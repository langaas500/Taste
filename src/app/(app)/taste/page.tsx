"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import PremiumModal from "@/components/PremiumModal";
import type { TasteSummary } from "@/lib/types";

const BLUR_CHAR_LIMIT = 100;

function TasteCard({ color, labelColor, label, text, isPremium }: {
  color: string;
  labelColor?: string;
  label: string;
  text: string;
  isPremium: boolean;
}) {
  const needsBlur = !isPremium && text.length > BLUR_CHAR_LIMIT;
  const visibleText = needsBlur ? text.slice(0, BLUR_CHAR_LIMIT) : text;
  const blurredText = needsBlur ? text.slice(BLUR_CHAR_LIMIT) : "";

  return (
    <GlassCard hover={false} className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor || color }}>
          {label}
        </h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {visibleText}
        {needsBlur && (
          <span
            className="select-none"
            style={{ filter: "blur(12px)", opacity: 0.65 }}
          >
            {blurredText}
          </span>
        )}
      </p>
      {needsBlur && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[11px] text-white/40">Oppgrader til Premium for å se hele profilen</span>
        </div>
      )}
    </GlassCard>
  );
}

export default function TastePage() {
  const [summary, setSummary] = useState<TasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.profile) setIsPremium(!!d.profile.is_premium); })
      .catch(() => {});
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const res = await fetch("/api/taste-summary");
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/taste-summary", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate taste summary");
    }
    setGenerating(false);
  }

  if (loading) return <LoadingSpinner text="Laster smaksprofil..." />;
  if (generating) return <AIThinkingScreen />;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Din smaksprofil</h2>
        {/* No summary yet: allow free first generation */}
        {!summary && (
          <GlowButton onClick={generate} disabled={generating}>
            Analyser min smak
          </GlowButton>
        )}
        {/* Has summary + premium: allow refresh */}
        {summary && isPremium && (
          <GlowButton onClick={generate} disabled={generating}>
            Oppdater smaksprofil
          </GlowButton>
        )}
        {/* Has summary + NOT premium: show upgrade trigger */}
        {summary && !isPremium && (
          <button
            onClick={() => setShowPremium(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-[2px] cursor-pointer"
            style={{ background: "linear-gradient(#B00000, #E50914)" }}
          >
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Oppgrader for å oppdatere
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">
          {error}
        </div>
      )}

      {!summary && (
        <EmptyState
          title="Ingen smaksprofil ennå"
          description="Legg til noen sette titler med vurderinger i biblioteket, så genererer vi en AI-drevet smaksanalyse."
          icon={
            <svg className="w-7 h-7 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
        />
      )}

      {summary && (
        <div className="space-y-4 stagger">
          <TasteCard
            color="var(--green)"
            label="Du liker..."
            text={summary.youLike}
            isPremium={isPremium}
          />
          <TasteCard
            color="var(--red)"
            label="Du unngår gjerne..."
            text={summary.avoid}
            isPremium={isPremium}
          />
          <TasteCard
            color="var(--accent)"
            labelColor="var(--accent-light)"
            label="Tempo, tone og temaer"
            text={summary.pacing}
            isPremium={isPremium}
          />

          {summary.updatedAt && (
            <p className="text-xs text-[var(--text-tertiary)] text-center pt-2">
              Sist oppdatert: {new Date(summary.updatedAt).toLocaleString("nb-NO")}
            </p>
          )}
        </div>
      )}

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="taste_refresh" />
    </div>
  );
}
