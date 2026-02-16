"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";

interface TopTitle {
  tmdb_id: number;
  type: string;
  title: string | null;
  poster_path: string | null;
  year: number | null;
  favorite: boolean | null;
}

interface WrappedStats {
  totalWatched: number;
  movies: number;
  tvShows: number;
  estimatedHours: number;
  sentimentCounts: { liked: number; ok: number; disliked: number; unrated: number };
  topGenres: { name: string; count: number; percent: number }[];
  topTitles: TopTitle[];
  mostActiveMonth: { month: string; count: number } | null;
  tasteSummary: { summary?: string; categories?: { name: string; description: string }[] } | null;
}

function monthName(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

/* ── Animated counter ── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── Slide components ── */
function SlideNumbers({ stats }: { stats: WrappedStats }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-sm text-[var(--text-tertiary)] mb-2 uppercase tracking-wider font-semibold">Ditt år i tall</p>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-4xl font-black gradient-text"><Counter value={stats.movies} /></p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">filmer</p>
        </div>
        <div>
          <p className="text-4xl font-black gradient-text"><Counter value={stats.tvShows} /></p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">serier</p>
        </div>
        <div>
          <p className="text-4xl font-black gradient-text"><Counter value={stats.estimatedHours} /></p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">timer</p>
        </div>
      </div>
      <p className="text-lg font-bold text-[var(--text-primary)]">
        <Counter value={stats.totalWatched} /> titler totalt
      </p>
      {stats.mostActiveMonth && (
        <p className="text-sm text-[var(--text-secondary)] mt-3">
          Mest aktiv i <span className="text-[var(--accent-light)] font-semibold">{monthName(stats.mostActiveMonth.month)}</span> med {stats.mostActiveMonth.count} titler
        </p>
      )}
    </div>
  );
}

function SlideTopGenre({ stats }: { stats: WrappedStats }) {
  if (stats.topGenres.length === 0) return null;
  const top = stats.topGenres[0];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-sm text-[var(--text-tertiary)] mb-4 uppercase tracking-wider font-semibold">Din topp-sjanger</p>
      <p className="text-5xl font-black gradient-text mb-3">{top.name}</p>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Du er en <span className="text-[var(--accent-light)] font-bold">{top.name.toLowerCase()}-entusiast</span>
      </p>
      <div className="w-full max-w-xs space-y-3">
        {stats.topGenres.map((g, i) => (
          <div key={g.name} className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-tertiary)] w-5 text-right">{i + 1}.</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-[var(--text-primary)]">{g.name}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">{g.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-surface)]">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${g.percent}%`,
                    background: i === 0 ? "var(--accent)" : i === 1 ? "var(--accent-light)" : "var(--text-tertiary)",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideFavorites({ stats }: { stats: WrappedStats }) {
  if (stats.topTitles.length === 0) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-sm text-[var(--text-tertiary)] mb-6 uppercase tracking-wider font-semibold">Dine favoritter</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {stats.topTitles.map((t, i) => (
          <div key={`${t.tmdb_id}:${t.type}`} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`w-[100px] aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden mb-2 ${i === 0 ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-base)]" : ""}`}>
              {t.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${t.poster_path}`}
                  alt={t.title || ""}
                  width={100}
                  height={150}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center text-2xl">🎬</div>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[100px]">{t.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTaste({ stats }: { stats: WrappedStats }) {
  const summary = stats.tasteSummary;
  if (!summary) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-sm text-[var(--text-tertiary)] mb-4 uppercase tracking-wider font-semibold">Din smak i et nøtteskall</p>
      {summary.summary && (
        <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed mb-6">{summary.summary}</p>
      )}
      {summary.categories && (
        <div className="space-y-4 w-full max-w-sm">
          {summary.categories.slice(0, 3).map((cat) => (
            <div key={cat.name} className="glass rounded-[var(--radius-md)] p-4 text-left">
              <p className="text-sm font-semibold text-[var(--accent-light)] mb-1">{cat.name}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideShare() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const url = window.location.origin + "/wrapped";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-sm text-[var(--text-tertiary)] mb-4 uppercase tracking-wider font-semibold">Del din smak</p>
      <p className="text-3xl font-black gradient-text mb-3">Logflix Wrapped</p>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8">
        Del filmsmaken din med venner og vis hva du har sett i år!
      </p>
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] text-sm font-semibold glass hover:border-[var(--glass-hover)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
          </svg>
          {copied ? "Kopiert!" : "Kopier lenke"}
        </button>
        <Link href="/home">
          <GlowButton>Tilbake til Logflix</GlowButton>
        </Link>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [insufficient, setInsufficient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch("/api/wrapped")
      .then((r) => r.json())
      .then((d) => {
        if (d.insufficient) {
          setInsufficient(true);
        } else {
          setStats(d.stats);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const slides = stats
    ? [
        <SlideNumbers key="numbers" stats={stats} />,
        ...(stats.topGenres.length > 0 ? [<SlideTopGenre key="genre" stats={stats} />] : []),
        ...(stats.topTitles.length > 0 ? [<SlideFavorites key="favorites" stats={stats} />] : []),
        ...(stats.tasteSummary ? [<SlideTaste key="taste" stats={stats} />] : []),
        <SlideShare key="share" />,
      ]
    : [];

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
  }, [goNext, goPrev]);

  // Keyboard nav
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (loading) return <LoadingSpinner text="Genererer din Wrapped..." />;

  if (insufficient) {
    return (
      <div className="animate-fade-in-up">
        <EmptyState
          title="Ikke nok data ennå"
          description="Logg minst 10 titler for å få din personlige Logflix Wrapped! Importer fra Netflix eller logg titler manuelt."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/search">
                <GlowButton>Søk etter titler</GlowButton>
              </Link>
              <Link href="/timemachine" className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-hover)] transition-colors">
                Importer fra Netflix
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg-base)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background gradient per slide */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${
            currentSlide === 0 ? "rgba(255,42,42,0.08)" :
            currentSlide === 1 ? "rgba(255,107,107,0.08)" :
            currentSlide === 2 ? "rgba(52,211,153,0.06)" :
            currentSlide === 3 ? "rgba(56,189,248,0.06)" :
            "rgba(255,42,42,0.05)"
          } 0%, transparent 70%)`,
        }}
      />

      {/* Close button */}
      <Link
        href="/home"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Link>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-500"
            style={{
              opacity: i === currentSlide ? 1 : 0,
              transform: i === currentSlide ? "translateX(0)" : i < currentSlide ? "translateX(-30%)" : "translateX(30%)",
              pointerEvents: i === currentSlide ? "auto" : "none",
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Progress dots + navigation */}
      <div className="relative z-10 pb-8 pt-4 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === currentSlide ? "var(--accent)" : "var(--bg-surface-hover)",
                width: i === currentSlide ? 24 : 8,
              }}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <button
              onClick={goPrev}
              className="px-5 py-2 rounded-[var(--radius-md)] text-sm font-medium glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Forrige
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-[var(--radius-md)] text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Neste
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
