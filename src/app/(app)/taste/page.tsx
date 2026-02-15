"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import type { TasteSummary } from "@/lib/types";

export default function TastePage() {
  const [summary, setSummary] = useState<TasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
        <GlowButton onClick={generate} disabled={generating}>
          {summary ? "Generer på nytt" : "Analyser min smak"}
        </GlowButton>
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
          <GlassCard hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[var(--green)]" />
              <h3 className="text-xs font-semibold text-[var(--green)] uppercase tracking-wider">
                Du liker...
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{summary.youLike}</p>
          </GlassCard>

          <GlassCard hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[var(--red)]" />
              <h3 className="text-xs font-semibold text-[var(--red)] uppercase tracking-wider">
                Du unngår gjerne...
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{summary.avoid}</p>
          </GlassCard>

          <GlassCard hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <h3 className="text-xs font-semibold text-[var(--accent-light)] uppercase tracking-wider">
                Tempo, tone og temaer
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{summary.pacing}</p>
          </GlassCard>

          {summary.updatedAt && (
            <p className="text-xs text-[var(--text-tertiary)] text-center pt-2">
              Sist oppdatert: {new Date(summary.updatedAt).toLocaleString("nb-NO")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
