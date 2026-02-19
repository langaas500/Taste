"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import AddToListModal from "@/components/AddToListModal";
import { submitFeedback, addExclusion, logTitle } from "@/lib/api";
import { prefetchNetflixIds } from "@/lib/prefetch-netflix-ids";
import type { Recommendation, MediaType } from "@/lib/types";
import { getLocale, type Locale } from "@/app/together/strings";

type TypeFilter = "all" | "tv" | "movie";

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    title: "For deg",
    refresh: "Oppdater",
    fetch: "Hent anbefalinger",
    all: "Alle",
    series: "Serier",
    movies: "Film",
    watched: "Sett",
    notForMe: "Ikke for meg",
    dontRecommend: "Ikke anbefal",
    addWatchlist: "Legg til Se-liste",
    addList: "Legg til liste",
    undo: "Angre",
    emptyTitle: "Personlige anbefalinger",
    emptyDesc: "Trykk på knappen over for å generere anbefalinger basert på biblioteket og smaksprofilen din.",
    allDoneTitle: "Alt gjennomgått!",
    allDoneDesc: "Du har vurdert alle anbefalingene. Trykk Oppdater for å få flere.",
    actionLiked: "Likte",
    actionWatchlist: "Lagt til i se-liste",
    actionDisliked: "Mislikte",
    actionNotForMe: "Ikke for meg",
    actionExclude: "Ikke anbefal igjen",
    typeTv: "Serie",
    typeMovie: "Film",
  },
  en: {
    title: "For You",
    refresh: "Refresh",
    fetch: "Get recommendations",
    all: "All",
    series: "Series",
    movies: "Movies",
    watched: "Watched",
    notForMe: "Not for me",
    dontRecommend: "Don't recommend",
    addWatchlist: "Add to watchlist",
    addList: "Add to list",
    undo: "Undo",
    emptyTitle: "Personal recommendations",
    emptyDesc: "Press the button above to generate recommendations based on your library and taste profile.",
    allDoneTitle: "All done!",
    allDoneDesc: "You've reviewed all recommendations. Press Refresh to get more.",
    actionLiked: "Liked",
    actionWatchlist: "Added to watchlist",
    actionDisliked: "Disliked",
    actionNotForMe: "Not for me",
    actionExclude: "Won't recommend again",
    typeTv: "Series",
    typeMovie: "Movie",
  },
} as const;

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [feedbackStates, setFeedbackStates] = useState<Record<string, string>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [dismissTimers, setDismissTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [addToListItem, setAddToListItem] = useState<{ tmdb_id: number; type: MediaType; title: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecs();
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) {
          const params = new URLSearchParams(window.location.search);
          const langParam = params.get("lang");
          if (langParam === "no" || langParam === "en") {
            setLocale(langParam as Locale);
          } else {
            setLocale(getLocale(data.region as string));
          }
        }
      })
      .catch(() => {});
  }, []);

  async function loadRecs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommendations");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const recsData = data.recommendations || [];
      setRecs(recsData);
      setLoaded(true);
      if (recsData.length > 0) {
        prefetchNetflixIds(recsData.map((r: Recommendation) => ({ id: r.tmdb_id, type: r.type })));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load recommendations");
    }
    setLoading(false);
  }

  async function handleFeedback(rec: Recommendation, action: string) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    setFeedbackStates((prev) => ({ ...prev, [key]: action }));

    if (action === "not_for_me") {
      await submitFeedback(rec.tmdb_id, rec.type, "not_for_me");
      const timer = setTimeout(() => {
        setDismissed((prev) => new Set(prev).add(key));
        setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
      }, 1500);
      setDismissTimers((prev) => ({ ...prev, [key]: timer }));
    } else if (action === "exclude") {
      await addExclusion(rec.tmdb_id, rec.type, "From recommendations");
      const timer = setTimeout(() => {
        setDismissed((prev) => new Set(prev).add(key));
        setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
      }, 1500);
      setDismissTimers((prev) => ({ ...prev, [key]: timer }));
    }
  }

  async function handleTitleAction(rec: Recommendation, action: string) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    if (action === "add-to-list") {
      setAddToListItem({ tmdb_id: rec.tmdb_id, type: rec.type, title: rec.title });
      return;
    }
    setActionStates((prev) => ({ ...prev, [key]: action }));
    try {
      if (action === "watchlist") {
        await logTitle({ tmdb_id: rec.tmdb_id, type: rec.type, status: "watchlist" });
      } else if (action === "liked" || action === "disliked" || action === "neutral") {
        await logTitle({ tmdb_id: rec.tmdb_id, type: rec.type, status: "watched", sentiment: action });
      }
      const timer = setTimeout(() => {
        setDismissed((prev) => new Set(prev).add(key));
        setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
      }, 3000);
      setDismissTimers((prev) => ({ ...prev, [key]: timer }));
    } catch {
      setActionStates((prev) => ({ ...prev, [key]: "" }));
    }
  }

  function handleUndo(rec: Recommendation) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    const timer = dismissTimers[key];
    if (timer) clearTimeout(timer);
    setDismissTimers((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setActionStates((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setFeedbackStates((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  const s = strings[locale];

  const visible = recs
    .filter((r) => !dismissed.has(`${r.tmdb_id}:${r.type}`))
    .filter((r) => typeFilter === "all" || r.type === typeFilter);

  const hero = visible[0] ?? null;
  const gridRecs = visible.slice(1);

  if (loading) return <AIThinkingScreen />;

  /* ── action label helper ── */
  function actionLabel(a: string) {
    if (a === "liked") return s.actionLiked;
    if (a === "watchlist") return s.actionWatchlist;
    if (a === "disliked") return s.actionDisliked;
    if (a === "not_for_me") return s.actionNotForMe;
    if (a === "exclude") return s.actionExclude;
    return a;
  }

  /* ── type badge ── */
  function typeBadge(type: string) {
    return type === "tv" ? s.typeTv : s.typeMovie;
  }

  /* ── ••• menu for a rec ── */
  function MoreMenu({ rec }: { rec: Recommendation }) {
    const key = `${rec.tmdb_id}:${rec.type}`;
    if (openMenu !== key) return null;
    return (
      <>
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
        <div
          ref={menuRef}
          className="absolute bottom-12 right-2 z-20 rounded-[var(--radius-md)] border border-white/[0.08] py-1 shadow-xl"
          style={{ background: "var(--bg-card, #1a1a1f)", minWidth: 180 }}
        >
          <button
            onClick={() => { handleTitleAction(rec, "disliked"); setOpenMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            {s.actionDisliked}
          </button>
          <button
            onClick={() => { handleTitleAction(rec, "watchlist"); setOpenMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            {s.addWatchlist}
          </button>
          <button
            onClick={() => { handleTitleAction(rec, "add-to-list"); setOpenMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            {s.addList}
          </button>
          <div className="h-px bg-white/[0.06] my-1" />
          <button
            onClick={() => { handleFeedback(rec, "exclude"); setOpenMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-red-400/80 hover:bg-red-500/10 transition-colors"
          >
            {s.dontRecommend}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{s.title}</h2>
        <GlowButton onClick={loadRecs} disabled={loading}>
          {loaded ? s.refresh : s.fetch}
        </GlowButton>
      </div>

      {/* ── Type filter ── */}
      {loaded && recs.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Type</span>
          {([["all", s.all], ["tv", s.series], ["movie", s.movies]] as [TypeFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                typeFilter === key
                  ? "bg-white/[0.1] text-white"
                  : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">
          {error}
        </div>
      )}

      {/* ── Empty states ── */}
      {!loaded && (
        <EmptyState
          title={s.emptyTitle}
          description={s.emptyDesc}
          icon={
            <svg className="w-7 h-7 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
      )}

      {loaded && visible.length === 0 && (
        <EmptyState title={s.allDoneTitle} description={s.allDoneDesc} />
      )}

      {/* ── Hero card ── */}
      {hero && (() => {
        const key = `${hero.tmdb_id}:${hero.type}`;
        const imgSrc = hero.poster_path ? `https://image.tmdb.org/t/p/w342${hero.poster_path}` : null;
        const actionDone = actionStates[key];
        const feedbackDone = feedbackStates[key];
        const isDone = !!(actionDone || feedbackDone);

        return (
          <div className="relative rounded-[var(--radius-lg)] overflow-hidden mb-6">
            {/* Blurred poster as cinematic backdrop */}
            {imgSrc && (
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${hero.poster_path}`}
                  alt=""
                  fill
                  className="object-cover scale-110"
                  style={{ filter: "blur(28px)", opacity: 0.22 }}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

            <div className="relative flex gap-4 sm:gap-6 p-4 sm:p-6">
              {/* Poster */}
              <div
                className="shrink-0 w-28 sm:w-36 rounded-[var(--radius-md)] overflow-hidden shadow-2xl ring-1 ring-white/10 cursor-pointer self-start"
                style={{ aspectRatio: "2/3" }}
                onClick={() => setSelectedItem({ id: hero.tmdb_id, type: hero.type, title: hero.title, poster_path: hero.poster_path || null })}
              >
                {imgSrc ? (
                  <Image src={imgSrc} alt={hero.title} fill className="object-cover" sizes="(max-width: 640px) 112px, 144px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-white/20 text-xs">—</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {typeBadge(hero.type)}
                    </span>
                    {hero.year && (
                      <span className="text-xs text-white/40">{hero.year}</span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-tight mb-2 line-clamp-2">{hero.title}</h2>
                  <p className="text-sm text-white/55 leading-relaxed line-clamp-3 mb-3">{hero.why}</p>
                  {hero.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hero.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isDone ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-xs font-semibold text-emerald-400">
                        {actionLabel(actionDone || feedbackDone)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUndo(hero)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      {s.undo}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 relative">
                    {/* Sett (liked) */}
                    <button
                      onClick={() => handleTitleAction(hero, "liked")}
                      className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {s.watched}
                    </button>
                    {/* Ikke for meg */}
                    <button
                      onClick={() => handleFeedback(hero, "not_for_me")}
                      className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold text-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {s.notForMe}
                    </button>
                    {/* ••• */}
                    <button
                      onClick={() => setOpenMenu(openMenu === key ? null : key)}
                      className="btn-press p-2 rounded-[var(--radius-md)] text-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    <MoreMenu rec={hero} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Grid ── */}
      {gridRecs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gridRecs.map((rec) => {
            const key = `${rec.tmdb_id}:${rec.type}`;
            const imgSrc = rec.poster_path ? `https://image.tmdb.org/t/p/w342${rec.poster_path}` : null;
            const actionDone = actionStates[key];
            const feedbackDone = feedbackStates[key];
            const isDone = !!(actionDone || feedbackDone);

            return (
              <div
                key={key}
                className="group relative flex flex-col rounded-[var(--radius-lg)] overflow-hidden border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-200"
                style={{ boxShadow: "0 0 0 0 transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(255,42,42,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent"; }}
              >
                {/* Poster */}
                <div
                  className="relative overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "2/3" }}
                  onClick={() => setSelectedItem({ id: rec.tmdb_id, type: rec.type, title: rec.title, poster_path: rec.poster_path || null })}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={rec.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-white/20 text-xs">—</div>
                  )}

                  {/* Done overlay on poster */}
                  {isDone && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-xs font-semibold text-emerald-400 text-center px-2">
                        {actionLabel(actionDone || feedbackDone)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUndo(rec); }}
                        className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                      >
                        {s.undo}
                      </button>
                    </div>
                  )}
                </div>

                {/* Info below poster */}
                <div className="flex flex-col flex-1 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.07] text-white/40">
                      {typeBadge(rec.type)}
                    </span>
                    {rec.year && (
                      <span className="text-[10px] text-white/30">{rec.year}</span>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-white/90 line-clamp-2 leading-tight mb-1.5">{rec.title}</h3>
                  {rec.why && (
                    <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mb-1.5">{rec.why}</p>
                  )}
                  {rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action row */}
                  {!isDone && (
                    <div className="flex items-center gap-1 mt-auto pt-1 relative">
                      {/* Sett */}
                      <button
                        onClick={() => handleTitleAction(rec, "liked")}
                        title={s.watched}
                        className="btn-press flex-1 flex items-center justify-center py-1.5 rounded-[var(--radius-sm)] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      {/* Ikke for meg */}
                      <button
                        onClick={() => handleFeedback(rec, "not_for_me")}
                        title={s.notForMe}
                        className="btn-press flex-1 flex items-center justify-center py-1.5 rounded-[var(--radius-sm)] text-white/35 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* ••• */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === key ? null : key); }}
                        title="More"
                        className="btn-press flex items-center justify-center px-2 py-1.5 rounded-[var(--radius-sm)] text-white/30 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                      <MoreMenu rec={rec} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add to List Modal */}
      {addToListItem && (
        <AddToListModal
          tmdb_id={addToListItem.tmdb_id}
          type={addToListItem.type}
          title={addToListItem.title}
          onClose={() => setAddToListItem(null)}
        />
      )}

      {/* Streaming Modal */}
      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
          actions={[
            { label: "👍 Sett", action: "liked", variant: "green" },
            { label: "👎 Sett", action: "disliked", variant: "red" },
            { label: "😐 Sett", action: "neutral", variant: "yellow" },
            { label: "+ Se-liste", action: "watchlist", variant: "default" },
            { label: "List+", action: "add-to-list", variant: "accent" },
          ]}
          onAction={(action) => {
            if (action === "add-to-list") {
              setAddToListItem({ tmdb_id: selectedItem.id, type: selectedItem.type, title: selectedItem.title });
              return;
            }
            const rec = recs.find((r) => r.tmdb_id === selectedItem.id && r.type === selectedItem.type);
            if (rec) handleTitleAction(rec, action);
          }}
        />
      )}
    </div>
  );
}
