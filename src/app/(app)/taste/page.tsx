"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import PremiumModal from "@/components/PremiumModal";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useLocale } from "@/hooks/useLocale";
import type { TasteSummary } from "@/lib/types";

const BLUR_CHAR_LIMIT = 100;
const MIN_TITLES = 10;

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    pageTitle: "Din smaksprofil",
    analyze: "Analyser min smak",
    refresh: "Oppdater smaksprofil",
    upgradeRefresh: "Oppgrader for å oppdatere",
    blurHint: "Oppgrader til Premium for å se hele profilen",
    lastUpdated: "Sist oppdatert",
    youLike: "Du liker...",
    avoid: "Du unngår gjerne...",
    pacing: "Tempo, tone og temaer",
    // Empty state: 0 titles
    emptyIcon: "🎬",
    emptyTitle: "Vi trenger litt mer å jobbe med",
    emptyDesc: "Legg til minst 10 titler i biblioteket for å analysere filmsmaken din",
    emptyCta: "Legg til titler",
    emptyImport: "Importer fra Netflix eller Trakt",
    // Progress: 1-9 titles
    progressText: (n: number) => `${n} av ${MIN_TITLES} titler lagt til — nesten klar!`,
    progressCta: "Legg til flere titler",
    // Generating
    generating: "Analyserer filmsmaken din...",
    loading: "Laster smaksprofil...",
  },
  en: {
    pageTitle: "Your taste profile",
    analyze: "Analyze my taste",
    refresh: "Refresh taste profile",
    upgradeRefresh: "Upgrade to refresh",
    blurHint: "Upgrade to Premium to see the full profile",
    lastUpdated: "Last updated",
    youLike: "You like...",
    avoid: "You tend to avoid...",
    pacing: "Pacing, tone and themes",
    emptyIcon: "🎬",
    emptyTitle: "We need a bit more to work with",
    emptyDesc: "Add at least 10 titles to your library to analyze your film taste",
    emptyCta: "Add titles",
    emptyImport: "Import from Netflix or Trakt",
    progressText: (n: number) => `${n} of ${MIN_TITLES} titles added — almost there!`,
    progressCta: "Add more titles",
    generating: "Analyzing your film taste...",
    loading: "Loading taste profile...",
  },
  se: {
    pageTitle: "Din smakprofil",
    analyze: "Analysera min smak",
    refresh: "Uppdatera smakprofil",
    upgradeRefresh: "Uppgradera för att uppdatera",
    blurHint: "Uppgradera till Premium för att se hela profilen",
    lastUpdated: "Senast uppdaterad",
    youLike: "Du gillar...",
    avoid: "Du undviker gärna...",
    pacing: "Tempo, ton och teman",
    emptyIcon: "🎬",
    emptyTitle: "Vi behöver lite mer att jobba med",
    emptyDesc: "Lägg till minst 10 titlar i ditt bibliotek för att analysera din filmsmak",
    emptyCta: "Lägg till titlar",
    emptyImport: "Importera från Netflix eller Trakt",
    progressText: (n: number) => `${n} av ${MIN_TITLES} titlar tillagda — nästan klar!`,
    progressCta: "Lägg till fler titlar",
    generating: "Analyserar din filmsmak...",
    loading: "Laddar smakprofil...",
  },
  dk: {
    pageTitle: "Din smagsprofil",
    analyze: "Analysér min smag",
    refresh: "Opdater smagsprofil",
    upgradeRefresh: "Opgrader for at opdatere",
    blurHint: "Opgrader til Premium for at se hele profilen",
    lastUpdated: "Sidst opdateret",
    youLike: "Du kan lide...",
    avoid: "Du undgår gerne...",
    pacing: "Tempo, tone og temaer",
    emptyIcon: "🎬",
    emptyTitle: "Vi har brug for lidt mere at arbejde med",
    emptyDesc: "Tilføj mindst 10 titler til dit bibliotek for at analysere din filmsmag",
    emptyCta: "Tilføj titler",
    emptyImport: "Importér fra Netflix eller Trakt",
    progressText: (n: number) => `${n} af ${MIN_TITLES} titler tilføjet — næsten klar!`,
    progressCta: "Tilføj flere titler",
    generating: "Analyserer din filmsmag...",
    loading: "Indlæser smagsprofil...",
  },
  fi: {
    pageTitle: "Makuprofiilisi",
    analyze: "Analysoi makuni",
    refresh: "Päivitä makuprofiili",
    upgradeRefresh: "Päivitä Premium-jäsenenä",
    blurHint: "Päivitä Premiumiin nähdäksesi koko profiilin",
    lastUpdated: "Viimeksi päivitetty",
    youLike: "Pidät...",
    avoid: "Vältät mielellään...",
    pacing: "Tempo, sävy ja teemat",
    emptyIcon: "🎬",
    emptyTitle: "Tarvitsemme hieman enemmän",
    emptyDesc: "Lisää vähintään 10 nimikettä kirjastoosi analysoidaksemme elokuvamakuasi",
    emptyCta: "Lisää nimikkeitä",
    emptyImport: "Tuo Netflixistä tai Traktista",
    progressText: (n: number) => `${n}/${MIN_TITLES} nimikettä lisätty — melkein valmis!`,
    progressCta: "Lisää nimikkeitä",
    generating: "Analysoidaan elokuvamakuasi...",
    loading: "Ladataan makuprofiilia...",
  },
} as const;

/* ── TasteCard ──────────────────────────────────────── */

function TasteCard({ color, labelColor, label, text, isPremium, blurHint }: {
  color: string;
  labelColor?: string;
  label: string;
  text: string;
  isPremium: boolean;
  blurHint: string;
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
          <span className="text-[11px] text-white/40">{blurHint}</span>
        </div>
      )}
    </GlassCard>
  );
}

/* ── Page ────────────────────────────────────────────── */

export default function TastePage() {
  const [summary, setSummary] = useState<TasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  const [showPremium, setShowPremium] = useState(false);
  const [titleCount, setTitleCount] = useState<number | null>(null);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.profile) setIsPremium(!!d.profile.is_premium); })
      .catch(() => {});
    loadSummary();
    loadTitleCount();
  }, []);

  async function loadTitleCount() {
    try {
      const supabase = createSupabaseBrowser();
      const { count } = await supabase
        .from("user_titles")
        .select("*", { count: "exact", head: true })
        .eq("status", "watched");
      setTitleCount(count ?? 0);
    } catch {
      setTitleCount(0);
    }
  }

  async function loadSummary() {
    try {
      const res = await fetch("/api/taste-summary");
      const data = await res.json();
      if (data.summary && (data.summary.youLike || data.summary.avoid || data.summary.pacing)) {
      setSummary(data.summary);
    }
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

  // Auto-generate when 10+ titles and no summary
  useEffect(() => {
    if (!loading && !summary && titleCount !== null && titleCount >= MIN_TITLES && !generating) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, summary, titleCount]);

  if (loading || titleCount === null) return <LoadingSpinner text={s.loading} />;
  if (generating) return <AIThinkingScreen />;

  // Empty state: 0 titles
  if (!summary && titleCount === 0) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-5xl mb-4">{s.emptyIcon}</span>
        <h2 className="text-xl font-bold text-white mb-2">{s.emptyTitle}</h2>
        <p className="text-sm text-white/50 mb-6 max-w-sm">{s.emptyDesc}</p>
        <Link
          href="/search"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#dc2626" }}
        >
          {s.emptyCta}
        </Link>
        <Link
          href="/timemachine"
          className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          {s.emptyImport}
        </Link>
      </div>
    );
  }

  // Progress state: 1-9 titles
  if (!summary && titleCount < MIN_TITLES) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-5xl mb-4">{s.emptyIcon}</span>
        <p className="text-sm font-medium text-white/70 mb-4">{s.progressText(titleCount)}</p>
        <div className="w-full max-w-xs h-2 rounded-full bg-white/[0.08] mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(titleCount / MIN_TITLES) * 100}%`,
              background: "#dc2626",
            }}
          />
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#dc2626" }}
        >
          {s.progressCta}
        </Link>
        <Link
          href="/timemachine"
          className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          {s.emptyImport}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{s.pageTitle}</h2>
        {/* No summary yet: allow free first generation */}
        {!summary && (
          <GlowButton onClick={generate} disabled={generating}>
            {s.analyze}
          </GlowButton>
        )}
        {/* Has summary + premium: allow refresh */}
        {summary && isPremium && (
          <GlowButton onClick={generate} disabled={generating}>
            {s.refresh}
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
            {s.upgradeRefresh}
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">
          {error}
        </div>
      )}

      {!summary && (
        <div className="flex flex-col items-center justify-center text-center px-6 py-12">
          <span className="text-4xl mb-3">{s.emptyIcon}</span>
          <p className="text-sm text-white/50">{s.emptyDesc}</p>
        </div>
      )}

      {summary && (
        <div className="space-y-4 stagger">
          {summary.youLike && (
            <TasteCard
              color="var(--green)"
              label={s.youLike}
              text={summary.youLike}
              isPremium={isPremium}
              blurHint={s.blurHint}
            />
          )}
          {summary.avoid && (
            <TasteCard
              color="var(--red)"
              label={s.avoid}
              text={summary.avoid}
              isPremium={isPremium}
              blurHint={s.blurHint}
            />
          )}
          {summary.pacing && (
            <TasteCard
              color="var(--accent)"
              labelColor="var(--accent-light)"
              label={s.pacing}
              text={summary.pacing}
              isPremium={isPremium}
              blurHint={s.blurHint}
            />
          )}

          {summary.updatedAt && (
            <p className="text-xs text-[var(--text-tertiary)] text-center pt-2">
              {s.lastUpdated}: {new Date(summary.updatedAt).toLocaleString("nb-NO")}
            </p>
          )}
        </div>
      )}

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="taste_refresh" />
    </div>
  );
}
