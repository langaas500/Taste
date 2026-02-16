"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type MediaType = "movie" | "tv";

interface OnboardingTitle {
  tmdb_id: number;
  type: MediaType;
  title: string;
  poster_path: string | null;
  year: string;
}

interface Selection {
  tmdb_id: number;
  type: MediaType;
  sentiment: "liked" | "disliked";
}

const STREAMING_SERVICES = [
  { id: 8, name: "Netflix", color: "#e50914" },
  { id: 384, name: "Max", color: "#002be7" },
  { id: 337, name: "Disney+", color: "#113ccf" },
  { id: 76, name: "Viaplay", color: "#f12b24" },
  { id: 383, name: "TV 2 Play", color: "#e4002b" },
  { id: 350, name: "Apple TV+", color: "#555555" },
  { id: 119, name: "Prime Video", color: "#00a8e1" },
  { id: 531, name: "Paramount+", color: "#0064ff" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [titles, setTitles] = useState<OnboardingTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OnboardingTitle[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tasteSummary, setTasteSummary] = useState<{ youLike: string; avoid: string; pacing: string } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load curated titles when entering step 2
  useEffect(() => {
    if (step === 2 && titles.length === 0) {
      setLoading(true);
      fetch("/api/onboarding/titles")
        .then((r) => r.json())
        .then((data) => setTitles(data.titles || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [step, titles.length]);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=multi`);
        const data = await res.json();
        const results: OnboardingTitle[] = (data.results || [])
          .filter((r: Record<string, unknown>) => r.poster_path && (r.media_type === "movie" || r.media_type === "tv"))
          .slice(0, 12)
          .map((r: Record<string, unknown>) => ({
            tmdb_id: r.id as number,
            type: r.media_type as MediaType,
            title: (r.title || r.name) as string,
            poster_path: r.poster_path as string,
            year: ((r.release_date || r.first_air_date) as string || "").slice(0, 4),
          }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  function toggleSelection(title: OnboardingTitle, forceSentiment?: "liked" | "disliked") {
    const key = `${title.tmdb_id}:${title.type}`;
    setSelections((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);

      if (forceSentiment) {
        if (existing?.sentiment === forceSentiment) {
          next.delete(key);
        } else {
          next.set(key, { tmdb_id: title.tmdb_id, type: title.type, sentiment: forceSentiment });
        }
      } else {
        if (existing) {
          next.delete(key);
        } else {
          next.set(key, { tmdb_id: title.tmdb_id, type: title.type, sentiment: "liked" });
        }
      }
      return next;
    });
  }

  function handlePointerDown(title: OnboardingTitle) {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleSelection(title, "disliked");
    }, 500);
  }

  function handlePointerUp(title: OnboardingTitle) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressTriggered.current) {
      toggleSelection(title, "liked");
    }
  }

  function handlePointerCancel() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function toggleService(id: number) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const titleData = Array.from(selections.values());
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: titleData,
          streaming_services: Array.from(selectedServices),
        }),
      });

      // Try to fetch taste summary for step 4
      try {
        // Wait a moment for taste summary to generate
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch("/api/taste-summary");
        const data = await res.json();
        if (data.taste_summary) setTasteSummary(data.taste_summary);
      } catch {
        // Not critical
      }

      setStep(4);
    } catch {
      // Still move forward
      setStep(4);
    }
    setSaving(false);
  }

  const selectionCount = selections.size;
  const displayTitles = searchQuery.trim() ? searchResults : titles;
  const likedCount = Array.from(selections.values()).filter((s) => s.sentiment === "liked").length;
  const dislikedCount = Array.from(selections.values()).filter((s) => s.sentiment === "disliked").length;

  return (
    <div className="min-h-dvh relative" style={{ background: "var(--bg-base)" }}>
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255, 42, 42, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Progress bar */}
      {step > 1 && step < 4 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--bg-surface)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* ───── STEP 1: Welcome ───── */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-dvh text-center animate-fade-in-up">
            <Image
              src="/logo.png"
              alt="Logflix"
              width={140}
              height={47}
              className="object-contain mb-8"
              style={{ height: "auto" }}
              priority
            />

            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
              La oss bygge din <span className="gradient-text">filmprofil</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-md leading-relaxed mb-10">
              Velg titler du har sett, så vi kan lære hva du liker og gi deg personlige anbefalinger.
            </p>

            <button
              onClick={() => setStep(2)}
              className="btn-press px-8 py-3.5 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_30px_var(--accent-glow-strong)] text-white rounded-[var(--radius-lg)] font-semibold text-sm transition-all duration-200"
            >
              La oss starte
            </button>

            <p className="text-xs text-[var(--text-tertiary)] mt-6">Tar bare 2 minutter</p>
          </div>
        )}

        {/* ───── STEP 2: Title Selection ───── */}
        {step === 2 && (
          <div className="py-6 pb-28 animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">
                Hva har du sett?
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                Trykk = likte, hold inne = mislikte
              </p>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Finner du ikke noe? Søk her..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] input-glow focus:outline-none transition-all"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                )}
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-xs">
                {likedCount > 0 && (
                  <span className="text-[var(--green)]">
                    {likedCount} likte
                  </span>
                )}
                {dislikedCount > 0 && (
                  <span className="text-[var(--red)]">
                    {dislikedCount} mislikte
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                {selectionCount} av minimum 5 valgt
              </span>
            </div>

            {/* Progress */}
            <div className="h-1 bg-[var(--bg-surface)] rounded-full mb-5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((selectionCount / 5) * 100, 100)}%`,
                  background: selectionCount >= 5 ? "var(--green)" : "var(--accent)",
                }}
              />
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] skeleton rounded-[var(--radius-md)]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {displayTitles.map((title) => {
                  const key = `${title.tmdb_id}:${title.type}`;
                  const selection = selections.get(key);
                  const isLiked = selection?.sentiment === "liked";
                  const isDisliked = selection?.sentiment === "disliked";

                  return (
                    <div
                      key={key}
                      className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden cursor-pointer select-none transition-all duration-200"
                      style={{
                        boxShadow: isLiked
                          ? "0 0 20px rgba(52, 211, 153, 0.3), inset 0 0 0 2px var(--green)"
                          : isDisliked
                          ? "0 0 20px rgba(248, 113, 113, 0.3), inset 0 0 0 2px var(--red)"
                          : "none",
                        opacity: selection ? 1 : 0.7,
                        transform: selection ? "scale(0.97)" : "scale(1)",
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handlePointerDown(title);
                      }}
                      onPointerUp={() => handlePointerUp(title)}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {title.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${title.poster_path}`}
                          alt={title.title}
                          fill
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                          className="object-cover"
                          draggable={false}
                        />
                      )}

                      {/* Selection badge */}
                      {selection && (
                        <div className="absolute top-1.5 right-1.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              background: isLiked ? "var(--green)" : "var(--red)",
                              color: "white",
                              boxShadow: isLiked
                                ? "0 0 12px rgba(52, 211, 153, 0.5)"
                                : "0 0 12px rgba(248, 113, 113, 0.5)",
                            }}
                          >
                            {isLiked ? "+" : "-"}
                          </div>
                        </div>
                      )}

                      {/* Title label at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-[10px] font-medium text-white/90 truncate">{title.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fixed bottom bar */}
            <div
              className="fixed bottom-0 left-0 right-0 z-40 p-4"
              style={{
                background: "linear-gradient(to top, var(--bg-base) 70%, transparent)",
                paddingBottom: "calc(var(--safe-bottom) + 16px)",
              }}
            >
              <div className="max-w-3xl mx-auto flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Tilbake
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectionCount < 5}
                  className="btn-press flex-1 py-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Fortsett ({selectionCount}/5)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───── STEP 3: Streaming Services ───── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center min-h-dvh py-10 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
              Hvilke tjenester bruker du?
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-8 text-center">
              Vi filtrerer anbefalinger til tjenester du har
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-10">
              {STREAMING_SERVICES.map((service) => {
                const selected = selectedServices.has(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className="btn-press relative flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border transition-all duration-200"
                    style={{
                      background: selected ? `${service.color}15` : "var(--glass)",
                      borderColor: selected ? `${service.color}40` : "var(--glass-border)",
                      boxShadow: selected ? `0 0 20px ${service.color}20` : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: service.color }}
                    >
                      {service.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {service.name}
                    </span>
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: service.color }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 w-full max-w-lg">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Tilbake
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-press flex-1 py-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all disabled:opacity-40"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Lagrer...
                  </span>
                ) : (
                  "Fullfør"
                )}
              </button>
              {selectedServices.size === 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Hopp over
                </button>
              )}
            </div>
          </div>
        )}

        {/* ───── STEP 4: Done ───── */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-dvh py-10 text-center animate-fade-in-up">
            {/* Celebration */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--green-glow)] flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--green)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>
                ✨
              </div>
              <div className="absolute -bottom-1 -left-3 text-lg animate-bounce" style={{ animationDelay: "0.5s" }}>
                🎬
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Profilen din er klar!
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm">
              Vi logget {selectionCount} titler og bygget smaksprofilen din. Nå kan vi gi deg personlige anbefalinger.
            </p>

            {/* Taste summary preview */}
            {tasteSummary && (
              <div className="glass rounded-[var(--radius-lg)] p-5 mb-8 text-left w-full max-w-md">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Din smaksprofil</h3>
                <div className="space-y-2.5">
                  {tasteSummary.youLike && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--green)] font-bold">Du liker</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.youLike}</p>
                    </div>
                  )}
                  {tasteSummary.avoid && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--red)] font-bold">Du unngår</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.avoid}</p>
                    </div>
                  )}
                  {tasteSummary.pacing && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--yellow)] font-bold">Tempo</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.pacing}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => router.push("/recommendations")}
                className="btn-press flex-1 py-3 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all"
              >
                Utforsk anbefalinger
              </button>
              <button
                onClick={() => router.push("/library")}
                className="btn-press flex-1 py-3 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] font-medium text-sm transition-all"
              >
                Gå til biblioteket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
