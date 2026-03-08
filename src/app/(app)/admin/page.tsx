"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import LoadingSpinner from "@/components/LoadingSpinner";

/* ── Admin email check ────────────────────────────────── */
const ADMIN_EMAILS = ["martinrlangaas@protonmail.com"];

/* ── Shared glass card style (matches settings page) ──── */
const glassCard = "rounded-2xl border border-white/[0.06] p-5 transition-all duration-200 hover:border-white/[0.1]";
const glassCardStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
};
const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 mb-1";
const sectionDesc = "text-[12px] text-white/60 leading-relaxed mb-4";

/* ── Types ────────────────────────────────────────────── */
interface SeoTitle {
  tmdb_id: number;
  type: string;
  title: string;
  slug: string;
  has_providers: boolean;
  has_curator: boolean;
  has_mood_tags: boolean;
  updated_at: string;
}

interface RecentTitle {
  tmdb_id: number;
  type: string;
  title: string;
  slug: string;
  updated_at: string;
}

interface Stats {
  curator: {
    total_with_slug: number;
    has_curator: number;
    has_mood_tags: number;
    missing_curator: number;
  };
  providers: {
    no_providers: number;
    NO: number;
    DK: number;
    FI: number;
    SE: number;
  };
  seo: {
    page: number;
    page_size: number;
    total: number;
    titles: SeoTitle[];
  };
  recent: RecentTitle[];
}

/* ── Dot indicator ────────────────────────────────────── */
function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "bg-red-400/60"}`}
    />
  );
}

/* ── Progress bar (reusable) ──────────────────────────── */
function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-white/60">{label}</span>
        <span className="text-[10px] font-mono text-white/50">
          {value} <span className="text-white/25">/ {max}</span>
          <span className="text-white/30 ml-1">({pct.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #E50914, #ff4d56)",
            boxShadow: "0 0 8px rgba(229,9,20,0.3)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Stat card (small number box) ─────────────────────── */
function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
      <span className="text-lg font-bold font-mono text-white/90">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</span>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState("");

  // Auth check (client-side)
  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
        router.replace("/home");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    })();
  }, [router]);

  // Fetch stats
  useEffect(() => {
    if (!authorized) return;
    fetchStats(page);
  }, [authorized, page]);

  async function fetchStats(p: number) {
    setError("");
    try {
      const res = await fetch(`/api/admin/stats?page=${p}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setStats(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Feil ved lasting");
    }
  }

  async function handleTriggerCron() {
    setTriggering(true);
    setTriggerResult("");
    try {
      const res = await fetch("/api/admin/trigger-cron", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setTriggerResult(`OK: ${data.processed || 0} processed, ${data.failed || 0} failed`);
      // Refresh stats after cron
      fetchStats(page);
    } catch (e: unknown) {
      setTriggerResult(e instanceof Error ? e.message : "Feil");
    } finally {
      setTriggering(false);
    }
  }

  if (loading) return <LoadingSpinner text="Sjekker tilgang..." />;
  if (!authorized) return null;

  const totalPages = stats ? Math.ceil(stats.seo.total / stats.seo.page_size) : 0;

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      <h2
        className="mb-6"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}
      >
        Admin Dashboard
      </h2>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20 mb-6">
          {error}
        </div>
      )}

      {!stats ? (
        <LoadingSpinner text="Laster data..." />
      ) : (
        <div className="space-y-5">
          {/* ── 1. Curator Generation Progress ──────── */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Curator Generation</p>
            <p className={sectionDesc}>Fremdrift for AI-generert curator-innhold på SEO-sider.</p>

            <div className="space-y-3 mb-4">
              <ProgressBar
                value={stats.curator.has_curator}
                max={stats.curator.total_with_slug}
                label="Har curator_hook"
              />
              <ProgressBar
                value={stats.curator.has_mood_tags}
                max={stats.curator.total_with_slug}
                label="Har mood_tags"
              />
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <StatBox label="Totalt m/ slug" value={stats.curator.total_with_slug} />
              <StatBox label="Har curator" value={stats.curator.has_curator} />
              <StatBox label="Mangler" value={stats.curator.missing_curator} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTriggerCron}
                disabled={triggering}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer disabled:opacity-40 disabled:pointer-events-none border-white/[0.08] text-white/65 hover:bg-[rgba(229,9,20,0.08)] hover:text-white hover:border-[rgba(229,9,20,0.3)]"
              >
                {triggering ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" />
                    </svg>
                    Kjører...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                    </svg>
                    Trigger cron nå
                  </>
                )}
              </button>
              {triggerResult && (
                <span className={`text-xs ${triggerResult.startsWith("OK") ? "text-emerald-400" : "text-red-400"}`}>
                  {triggerResult}
                </span>
              )}
            </div>
          </div>

          {/* ── 2. Provider Coverage ───────────────── */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Provider Coverage</p>
            <p className={sectionDesc}>Antall titler med strømmeleverandør-data per region.</p>

            <div className="flex flex-wrap gap-3">
              <StatBox label="NO" value={stats.providers.NO} />
              <StatBox label="DK" value={stats.providers.DK} />
              <StatBox label="FI" value={stats.providers.FI} />
              <StatBox label="SE" value={stats.providers.SE} />
              <StatBox label="Ingen providers" value={stats.providers.no_providers} />
            </div>
          </div>

          {/* ── 3. Recent Activity ─────────────────── */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Siste aktivitet</p>
            <p className={sectionDesc}>Siste 10 slugs lagt til i titles_cache.</p>

            <div className="space-y-1.5">
              {stats.recent.map((t) => (
                <div key={`${t.tmdb_id}:${t.type}`} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50 flex-shrink-0">
                      {t.type}
                    </span>
                    <span className="text-xs text-white/70 truncate">{t.title}</span>
                    <span className="text-[10px] text-white/30 font-mono flex-shrink-0">/{t.slug}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono flex-shrink-0 ml-2">
                    {new Date(t.updated_at).toLocaleDateString("no-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {stats.recent.length === 0 && (
                <p className="text-xs text-white/30">Ingen data.</p>
              )}
            </div>
          </div>

          {/* ── 4. SEO Pages Status ────────────────── */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>SEO Pages Status</p>
            <p className={sectionDesc}>
              Alle titler med slug. Side {page + 1} av {totalPages || 1} ({stats.seo.total} totalt).
            </p>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_50px_36px_36px_36px_90px] gap-2 items-center px-2 pb-2 border-b border-white/[0.06]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Tittel</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Type</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 text-center" title="Har providers">Prov</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 text-center" title="Har curator">Cur</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 text-center" title="Har mood tags">Mood</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 text-right">Oppdatert</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-white/[0.03]">
              {stats.seo.titles.map((t) => (
                <div
                  key={`${t.tmdb_id}:${t.type}`}
                  className="grid grid-cols-[1fr_50px_36px_36px_36px_90px] gap-2 items-center px-2 py-2 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-white/70 truncate block">{t.title}</span>
                    <span className="text-[10px] text-white/25 font-mono">/{t.slug}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">{t.type}</span>
                  <span className="text-center"><Dot ok={t.has_providers} /></span>
                  <span className="text-center"><Dot ok={t.has_curator} /></span>
                  <span className="text-center"><Dot ok={t.has_mood_tags} /></span>
                  <span className="text-[10px] text-white/30 font-mono text-right">
                    {new Date(t.updated_at).toLocaleDateString("no-NO", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
              {stats.seo.titles.length === 0 && (
                <p className="text-xs text-white/30 py-4 text-center">Ingen SEO-sider ennå.</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Forrige
                </button>
                <span className="text-xs font-mono text-white/40">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Neste
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
