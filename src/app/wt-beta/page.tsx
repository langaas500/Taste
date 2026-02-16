"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { logTitle } from "@/lib/api";

/* ── constants ─────────────────────────────────────────── */

const RED = "#ff2a2a";
const TITLES_CACHE_KEY = "wt_titles_v2";
const PROFILE_CACHE_KEY = "wt_profile_v2";
const PARTNER_CACHE_KEY = "wt_partner_v2";

/* ── genre map ─────────────────────────────────────────── */

const GENRE_MAP: Record<number, { name: string; color: string }> = {
  28: { name: "Action", color: "#5a1a1a" },
  12: { name: "Eventyr", color: "#2d5a27" },
  16: { name: "Animasjon", color: "#4a2d5a" },
  35: { name: "Komedie", color: "#5a4a2d" },
  80: { name: "Krim", color: "#1a1a2d" },
  99: { name: "Dokumentar", color: "#3d3d1a" },
  18: { name: "Drama", color: "#2d2d5a" },
  10751: { name: "Familie", color: "#5a2d4a" },
  14: { name: "Fantasy", color: "#1a3d5a" },
  36: { name: "Historie", color: "#3d2d1a" },
  27: { name: "Skrekk", color: "#3d1a1a" },
  10402: { name: "Musikk", color: "#5a1a4a" },
  9648: { name: "Mysterium", color: "#1a2d4a" },
  10749: { name: "Romantikk", color: "#5a2d4a" },
  878: { name: "Sci-Fi", color: "#1a4a5a" },
  53: { name: "Thriller", color: "#2d1a3d" },
  10752: { name: "Krig", color: "#3d1a3d" },
  37: { name: "Western", color: "#5a4a1a" },
  10759: { name: "Action", color: "#5a1a1a" },
  10762: { name: "Barn", color: "#5a2d4a" },
  10763: { name: "Nyheter", color: "#3d3d1a" },
  10764: { name: "Reality", color: "#5a4a2d" },
  10765: { name: "Sci-Fi", color: "#1a4a5a" },
  10766: { name: "Såpe", color: "#5a2d4a" },
  10767: { name: "Prat", color: "#2d5a27" },
  10768: { name: "Krig", color: "#1a1a2d" },
};

/* ── types ─────────────────────────────────────────────── */

interface WTTitle {
  tmdb_id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv";
  genre_ids: number[];
  overview: string;
  poster_path: string | null;
  vote_average: number | null;
  reason?: string;
}

interface TasteProfile {
  liked: number[];
  meh: number[];
  disliked: number[];
}

type Screen = "intro" | "mood" | "onboarding" | "together" | "waiting" | "join";
type Rating = "liked" | "meh" | "disliked";
type SwipeAction = "like" | "nope" | "meh";
type Mode = "solo" | "paired";
type Mood = "light" | "dark" | "thriller" | "action" | "romance" | "horror";

const MOODS: { id: Mood; label: string; color: string }[] = [
  { id: "light",    label: "Lett & morsom",    color: "#fbbf24" },
  { id: "dark",     label: "Mørk & intens",   color: "#6366f1" },
  { id: "thriller", label: "Smart thriller",   color: "#14b8a6" },
  { id: "action",   label: "Action & tempo",   color: "#ef4444" },
  { id: "romance",  label: "Romantikk",        color: "#ec4899" },
  { id: "horror",   label: "Skrekk",           color: "#84cc16" },
];

/* ── helpers ───────────────────────────────────────────── */

function getGenreColor(genre_ids: number[]): string {
  for (const id of genre_ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id].color;
  }
  return "#2d2d5a";
}

function getGenreName(genre_ids: number[]): string {
  for (const id of genre_ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id].name;
  }
  return "Film/Serie";
}

function generateMockPartner(titles: WTTitle[]): TasteProfile {
  const ids = titles.map((t) => t.tmdb_id);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const count = shuffled.length;
  const likeCount = Math.ceil(count * 0.35);
  const mehCount = Math.ceil(count * 0.25);
  return {
    liked: shuffled.slice(0, likeCount),
    meh: shuffled.slice(likeCount, likeCount + mehCount),
    disliked: shuffled.slice(likeCount + mehCount),
  };
}

function computeRecs(
  titles: WTTitle[],
  profile: TasteProfile,
  partner: TasteProfile,
  excluded: number[]
): WTTitle[] {
  const excludeSet = new Set([...profile.disliked, ...partner.disliked, ...excluded]);

  const scored = titles
    .filter((t) => !excludeSet.has(t.tmdb_id))
    .map((t) => {
      let score = 0;
      if (profile.liked.includes(t.tmdb_id)) score += 2;
      if (partner.liked.includes(t.tmdb_id)) score += 2;
      if (profile.meh.includes(t.tmdb_id)) score += 1;
      if (partner.meh.includes(t.tmdb_id)) score += 1;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, Math.min(12, scored.length));
  for (let i = top.length - 1; i > 0; i--) {
    if (Math.random() < 0.1) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]];
    }
  }

  return top.slice(0, 7).map((s) => s.t);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/* ── poster component ──────────────────────────────────── */

function Poster({
  title,
  size = "large",
}: {
  title: WTTitle;
  size?: "large" | "small" | "medium";
}) {
  const url = title.poster_path ? `https://image.tmdb.org/t/p/w500${title.poster_path}` : null;
  const color = getGenreColor(title.genre_ids);

  const sizeClass =
    size === "large" ? "w-full aspect-[2/3]" : size === "medium" ? "w-full aspect-[2/3]" : "w-16 h-24";
  const textSize = size === "large" ? "text-5xl" : size === "medium" ? "text-4xl" : "text-lg";
  const rounded = size === "small" ? "rounded-lg" : "rounded-2xl";

  return (
    <div className={`relative overflow-hidden ${sizeClass} ${rounded}`} style={{ background: `linear-gradient(135deg, ${color}, ${color}66)` }}>
      <span className={`absolute inset-0 flex items-center justify-center ${textSize} font-black`} style={{ color: "rgba(255,255,255,0.15)" }}>
        {title.title.substring(0, 2).toUpperCase()}
      </span>

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* poster glass gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.00) 38%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

/* ── fireworks overlay (no libs) ───────────────────────── */

function Fireworks({ color, onDone }: { color: string; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const base = hexToRgb(color);
    const mkColor = (a: number) => `rgba(${base.r},${base.g},${base.b},${a})`;

    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; a: number };
    const parts: P[] = [];
    const t0 = performance.now();

    const spawnBurst = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 2.5 + Math.random() * 4.8;
        parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.6, r: 1.2 + Math.random() * 2.4, life: 0, max: 44 + Math.random() * 30, a: 0.95 });
      }
    };

    if (!startedRef.current) {
      startedRef.current = true;
      // 3 bursts
      for (let b = 0; b < 3; b++) {
        const bx = window.innerWidth * (0.25 + Math.random() * 0.5);
        const by = window.innerHeight * (0.26 + Math.random() * 0.38);
        spawnBurst(bx, by, 85);
      }
    }

    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += 1;
        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        const k = 1 - p.life / p.max;
        const alpha = clamp(p.a * k, 0, 1);

        ctx.beginPath();
        ctx.fillStyle = mkColor(alpha);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = mkColor(alpha * 0.6);
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
        ctx.stroke();

        if (p.life >= p.max) parts.splice(i, 1);
      }

      const elapsed = performance.now() - t0;
      if (parts.length === 0 || elapsed > 1900) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", resize);
        onDone();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color, onDone]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[80] pointer-events-none" aria-hidden="true" />;
}

/* ── input mode detection ──────────────────────────────── */

function useInputMode() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const coarse = typeof window !== "undefined" && typeof window.matchMedia !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    const hasTouch = typeof navigator !== "undefined" && ((navigator as any).maxTouchPoints ?? 0) > 0;

    setIsTouch(Boolean(coarse || hasTouch));

    const onResize = () => {
      const coarseNow = window.matchMedia("(pointer: coarse)").matches;
      setIsTouch(Boolean(coarseNow || ((navigator as any).maxTouchPoints ?? 0) > 0));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return { isTouch };
}

/* ── page component ────────────────────────────────────── */

export default function WTBetaPage() {
  const [titles, setTitles] = useState<WTTitle[]>([]);
  const [titlesLoading, setTitlesLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("intro");
  const [profile, setProfile] = useState<TasteProfile>({ liked: [], meh: [], disliked: [] });
  const [partner, setPartner] = useState<TasteProfile | null>(null);
  const [timer, setTimer] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [recs, setRecs] = useState<WTTitle[]>([]);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [chosen, setChosen] = useState<WTTitle | null>(null);
  const [undoInfo, setUndoInfo] = useState<{ msg: string; fn: () => void } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lowData, setLowData] = useState(false);
  const [matchOverlay, setMatchOverlay] = useState<{ title: WTTitle; color: string } | null>(null);
  const [microToast, setMicroToast] = useState<string | null>(null);

  // mood state
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodIntent, setMoodIntent] = useState<"solo" | "paired">("solo");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // paired mode state
  const [mode, setMode] = useState<Mode>("solo");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [partnerSwipeCount, setPartnerSwipeCount] = useState(0);
  const [sessionError, setSessionError] = useState("");

  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const microTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // swipe state
  const [swipe, setSwipe] = useState<{ x: number; y: number; rot: number; dragging: boolean }>({ x: 0, y: 0, rot: 0, dragging: false });
  const [fly, setFly] = useState<{ active: boolean; x: number; y: number; rot: number }>({ active: false, x: 0, y: 0, rot: 0 });
  const ptr = useRef<{ id: number | null; sx: number; sy: number; target: HTMLElement | null }>({ id: null, sx: 0, sy: 0, target: null });

  const { isTouch } = useInputMode();
  const isDesktop = mounted && !isTouch;

  /* ── load localStorage on mount (titles fetched after mood selection) ── */
  useEffect(() => {
    setMounted(true);
    setTitlesLoading(false); // no auto-fetch; intro shows immediately
    try {
      const p = localStorage.getItem(PROFILE_CACHE_KEY);
      if (p) setProfile(JSON.parse(p));
      const pp = localStorage.getItem(PARTNER_CACHE_KEY);
      if (pp) setPartner(JSON.parse(pp));
    } catch {
      /* empty */
    }
  }, []);

  /* ── fetch titles with mood ── */
  async function fetchTitlesForMood(mood: Mood) {
    setTitlesLoading(true);
    try {
      const res = await fetch(`/api/wt-beta/titles?mood=${mood}`);
      const data = await res.json();
      const t: WTTitle[] = data.titles || [];
      setTitles(t);
      if (t.length > 0) {
        localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify(t));
      }
      return t;
    } catch {
      return [];
    } finally {
      setTitlesLoading(false);
    }
  }

  /* ── countdown timer ── */
  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timer]);

  /* ── memo profile progress ── */
  const ratedIds = useMemo(() => new Set([...profile.liked, ...profile.meh, ...profile.disliked]), [profile.liked, profile.meh, profile.disliked]);
  const profileComplete = titles.length > 0 && ratedIds.size >= titles.length;
  const currentTitle = useMemo(() => titles.find((t) => !ratedIds.has(t.tmdb_id)), [ratedIds, titles]);
  const progress = ratedIds.size;

  /* ── auto-transition when onboarding completes ── */
  useEffect(() => {
    if (screen === "onboarding" && profileComplete) goTogether(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, profileComplete]);

  /* ── undo helpers ── */
  const showUndo = useCallback((msg: string, fn: () => void) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoInfo({ msg, fn });
    undoTimer.current = setTimeout(() => setUndoInfo(null), 3000);
  }, []);

  function doUndo() {
    if (!undoInfo) return;
    undoInfo.fn();
    setUndoInfo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }

  function showMicro(msg: string) {
    if (microTimer.current) clearTimeout(microTimer.current);
    setMicroToast(msg);
    microTimer.current = setTimeout(() => setMicroToast(null), 900);
  }

  /* ── rate a title in onboarding ── */
  function rate(rating: Rating) {
    if (!currentTitle) return;
    const next: TasteProfile = { ...profile, [rating]: [...profile[rating], currentTitle.tmdb_id] };
    setProfile(next);
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(next));

    // Persist to Supabase (fire-and-forget)
    const sentimentMap: Record<Rating, string> = { liked: "liked", meh: "neutral", disliked: "disliked" };
    logTitle({
      tmdb_id: currentTitle.tmdb_id,
      type: currentTitle.type,
      status: "watched",
      sentiment: sentimentMap[rating],
    }).catch(() => {/* auth may not be available */});

    const totalRated = next.liked.length + next.meh.length + next.disliked.length;
    if (totalRated >= titles.length) goTogether(next);
  }

  /* ── enter together mode ── */
  function ensurePartner(): TasteProfile {
    let part = partner;
    if (!part) {
      part = generateMockPartner(titles);
      setPartner(part);
      try {
        localStorage.setItem(PARTNER_CACHE_KEY, JSON.stringify(part));
      } catch {
        /* ignore */
      }
    }
    return part!;
  }

  function goTogether(p?: TasteProfile) {
    const prof = p || profile;
    const part = ensurePartner();
    const totalRated = prof.liked.length + prof.meh.length + prof.disliked.length;
    setLowData(totalRated === 0);

    setRecs(computeRecs(titles, prof, part, excluded));
    setScreen("together");
    setTimer(180);
    setTimerRunning(true);
    setChosen(null);
    setMatchOverlay(null);

    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });
  }

  /* ── reset everything ── */
  function reset() {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(PARTNER_CACHE_KEY);
    localStorage.removeItem(TITLES_CACHE_KEY);
    setProfile({ liked: [], meh: [], disliked: [] });
    setPartner(null);
    setExcluded([]);
    setChosen(null);
    setTimer(180);
    setTimerRunning(false);
    setRecs([]);
    setUndoInfo(null);
    setLowData(false);
    setScreen("intro");
    setMatchOverlay(null);
    setMicroToast(null);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });

    // Clear mood + paired state
    setSelectedMood(null);
    setMoodIntent("solo");
    setAdvancedOpen(false);
    setMode("solo");
    setSessionId(null);
    setSessionCode("");
    setJoinCode("");
    setPartnerJoined(false);
    setPartnerSwipeCount(0);
    setSessionError("");
  }

  /* ── commit choice ───────────────────────────────────── */
  function commitChoice(t: WTTitle, action: SwipeAction) {
    // Paired mode: submit to server, advance card, no local match detection
    if (mode === "paired") {
      submitPairedSwipe(t, action);
      setRecs((r) => r.slice(1));
      if (action === "like") {
        logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watched", sentiment: "liked" }).catch(() => {});
      }
      return;
    }

    // Solo mode: local match detection with mock partner
    const prevRecs = [...recs];
    const prevExcluded = [...excluded];
    const prevTimerRunning = timerRunning;
    const prevTimer = timer;
    const part = ensurePartner();

    if (action === "like") {
      const isMatch = part.liked.includes(t.tmdb_id);

      if (isMatch) {
        setChosen(t);
        setTimerRunning(false);
        setMatchOverlay({ title: t, color: getGenreColor(t.genre_ids) });

        logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watchlist" }).catch(() => {});

        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(35);
        } catch { /* ignore */ }

        showUndo(`MATCH «${t.title}»`, () => {
          setChosen(null);
          setRecs(prevRecs);
          setExcluded(prevExcluded);
          setMatchOverlay(null);
          setTimer(prevTimer);
          setTimerRunning(prevTimerRunning && prevTimer > 0);
        });
        return;
      }

      logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watched", sentiment: "liked" }).catch(() => {});

      showMicro("Ikke match… fortsett 🫱");
      setExcluded((e) => [...e, t.tmdb_id]);
      setRecs((r) => r.slice(1));
      showUndo(`Du likte «${t.title}» (ikke match)`, () => {
        setExcluded(prevExcluded);
        setRecs(prevRecs);
      });
      return;
    }

    setExcluded((e) => [...e, t.tmdb_id]);
    setRecs((r) => r.slice(1));
    showUndo(action === "nope" ? `Fjernet «${t.title}»` : `Meh på «${t.title}»`, () => {
      setExcluded(prevExcluded);
      setRecs(prevRecs);
    });
  }

  function nyeForslag() {
    const prevRecs = [...recs];
    const prevExcl = [...excluded];
    const part = ensurePartner();
    const newExcl = [...excluded, ...recs.map((r) => r.tmdb_id)];
    setExcluded(newExcl);
    setRecs(computeRecs(titles, profile, part, newExcl));
    showUndo("Nye forslag lastet", () => {
      setExcluded(prevExcl);
      setRecs(prevRecs);
    });

    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });
  }

  /* ── paired mode: create session ── */
  async function createSession(mood?: Mood) {
    setSessionError("");
    setTitlesLoading(true);
    try {
      const res = await fetch("/api/wt-beta/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setSessionCode(data.session.code);
      setTitles(data.session.titles);
      localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify(data.session.titles));
      setMode("paired");
      setScreen("waiting");
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : "Kunne ikke opprette runde");
    }
    setTitlesLoading(false);
  }

  /* ── paired mode: join session ── */
  async function joinSession() {
    if (!joinCode.trim()) return;
    setSessionError("");
    setTitlesLoading(true);
    try {
      const res = await fetch("/api/wt-beta/session/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setTitles(data.session.titles);
      localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify(data.session.titles));
      setMode("paired");
      // Guest goes straight to swiping
      setRecs([...data.session.titles]);
      setScreen("together");
      setTimer(180);
      setTimerRunning(true);
      setChosen(null);
      setMatchOverlay(null);
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : "Kunne ikke bli med");
    }
    setTitlesLoading(false);
  }

  /* ── paired mode: poll for partner state ── */
  useEffect(() => {
    if (mode !== "paired" || !sessionId) return;
    if (chosen) return; // stop polling after match

    const poll = async () => {
      try {
        const res = await fetch(`/api/wt-beta/session?id=${sessionId}`);
        const data = await res.json();
        if (!data.session) return;

        // Partner joined?
        if (!partnerJoined && data.session.partner_joined) {
          setPartnerJoined(true);
          // Host: start the game
          if (screen === "waiting") {
            setRecs([...titles]);
            setScreen("together");
            setTimer(180);
            setTimerRunning(true);
          }
        }

        // Update partner swipe count
        const pSwipes = data.session.partner_swipes || {};
        setPartnerSwipeCount(Object.keys(pSwipes).length);

        // Match detected server-side?
        if (data.session.match_tmdb_id && !chosen) {
          const matchTitle = titles.find(
            (t) => t.tmdb_id === data.session.match_tmdb_id
          );
          if (matchTitle) {
            setChosen(matchTitle);
            setTimerRunning(false);
            setMatchOverlay({ title: matchTitle, color: getGenreColor(matchTitle.genre_ids) });
          }
        }
      } catch {
        /* polling error, retry next interval */
      }
    };

    const interval = setInterval(poll, 2000);
    poll(); // immediate first poll
    return () => clearInterval(interval);
  }, [mode, sessionId, partnerJoined, screen, titles, chosen]);

  /* ── paired mode: submit swipe to server ── */
  function submitPairedSwipe(t: WTTitle, action: SwipeAction) {
    if (!sessionId) return;
    fetch("/api/wt-beta/session/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        tmdb_id: t.tmdb_id,
        type: t.type,
        action,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        // Instant match detection from swipe response
        if (data.match && !chosen) {
          const matchTitle = titles.find(
            (mt) => mt.tmdb_id === data.match.tmdb_id
          );
          if (matchTitle) {
            setChosen(matchTitle);
            setTimerRunning(false);
            setMatchOverlay({ title: matchTitle, color: getGenreColor(matchTitle.genre_ids) });
            try {
              if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(35);
            } catch { /* ignore */ }
          }
        }
      })
      .catch(() => {});
  }

  /* ── desktop keyboard controls ───────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    if (screen !== "together") return;
    if (chosen) return;
    if (!isDesktop) return;
    if (matchOverlay) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const top = recs[0];
      if (!top) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        commitChoice(top, "nope");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        commitChoice(top, "like");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        commitChoice(top, "meh");
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        nyeForslag();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, screen, chosen, isDesktop, matchOverlay, recs]);

  /* ── swipe handlers (MOBILE ONLY) ────────────────────── */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (screen !== "together") return;
    if (chosen) return;
    if (!recs[0]) return;
    if (fly.active) return;
    if (isDesktop) return; // desktop: no swipe

    ptr.current.id = e.pointerId;
    ptr.current.sx = e.clientX;
    ptr.current.sy = e.clientY;
    ptr.current.target = e.currentTarget;

    e.currentTarget.setPointerCapture(e.pointerId);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: true });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId) return;
    if (!swipe.dragging) return;

    const dx = e.clientX - ptr.current.sx;
    const dy = e.clientY - ptr.current.sy;
    const rot = clamp(dx / 18, -14, 14);
    setSwipe({ x: dx, y: dy, rot, dragging: true });
  }

  function endSwipe(action?: SwipeAction) {
    const top = recs[0];
    if (!top) return;

    const dx = swipe.x;
    const dy = swipe.y;

    const likeThreshold = 120;
    const nopeThreshold = -120;
    const mehThreshold = 120;

    let decided: SwipeAction | null = action || null;
    if (!decided) {
      if (dx > likeThreshold) decided = "like";
      else if (dx < nopeThreshold) decided = "nope";
      else if (dy > mehThreshold && Math.abs(dx) < 140) decided = "meh";
    }

    if (!decided) {
      setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
      return;
    }

    const outX = decided === "like" ? window.innerWidth * 0.9 : decided === "nope" ? -window.innerWidth * 0.9 : dx * 0.25;
    const outY = decided === "meh" ? window.innerHeight * 0.8 : dy * 0.2;
    const outRot = decided === "like" ? 18 : decided === "nope" ? -18 : swipe.rot * 0.5;

    setFly({ active: true, x: outX, y: outY, rot: outRot });

    window.setTimeout(() => {
      setFly({ active: false, x: 0, y: 0, rot: 0 });
      setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
      commitChoice(top, decided!);
    }, 160);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId) return;
    try {
      ptr.current.target?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    ptr.current.id = null;
    endSwipe();
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId) return;
    ptr.current.id = null;
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
  }

  /* ── hydration guard ── */
  if (!mounted) return null;

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  const top = recs[0] || null;
  const next = recs[1] || null;

  const bgColor = chosen ? getGenreColor(chosen.genre_ids) : top ? getGenreColor(top.genre_ids) : "#0a0a0f";
  const glowLike = clamp((swipe.x - 20) / 180, 0, 1);
  const glowNope = clamp((-swipe.x - 20) / 180, 0, 1);
  const glowMeh = clamp((swipe.y - 40) / 220, 0, 1);

  const hint = isDesktop ? "← → ↓  (R = shuffle)" : swipe.dragging ? "Slipp" : "Dra";

  return (
    <div className="min-h-dvh flex flex-col relative" style={{ background: `radial-gradient(circle at 25% 0%, ${bgColor}33, #0a0a0f 60%)` }}>
      {/* vignette overlay (makes desktop look intentional) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,.72) 55%, rgba(0,0,0,.92) 100%)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 0,
        }}
      />

      {/* content wrapper */}
      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* ── top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <Link href="/home" className="text-xs font-medium no-underline" style={{ color: "rgba(255,255,255,0.4)" }}>
            &larr; Logflix
          </Link>

          {screen === "together" && !chosen && (
            <div className="flex items-center gap-3">
              {mode === "paired" && (
                <span className="text-[11px] font-medium px-2 py-1 rounded-lg" style={{ background: "rgba(255,42,42,0.12)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,42,42,0.15)" }}>
                  Partner: {partnerSwipeCount} swipes
                </span>
              )}
              <span className="text-sm font-mono font-bold tabular-nums" style={{ color: timer <= 30 ? RED : "rgba(255,255,255,0.5)" }}>
                {mm}:{ss}
              </span>
            </div>
          )}

          <button onClick={reset} className="text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.25)" }}>
            Reset
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {/* INTRO */}
          {screen === "intro" && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-sm w-full">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={RED}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Se sammen p&aring; 3 minutter</h1>
                <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Finn noe &aring; se sammen. Swipe p&aring; mobil, piltaster p&aring; desktop. Match = begge liker.
                </p>

                <div className="flex flex-col gap-3">
                  {/* Primary CTA: solo flow */}
                  <button
                    onClick={() => { setMoodIntent("solo"); setScreen("mood"); }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: RED, minHeight: 48 }}
                  >
                    Start 3-min runde
                  </button>

                  {/* Avansert toggle */}
                  <button
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Avansert
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Avansert options (collapsible) */}
                  {advancedOpen && (
                    <div className="flex flex-col gap-2">
                      {/* Paired mode: go to mood then create session */}
                      <button
                        onClick={() => { setMoodIntent("paired"); setScreen("mood"); }}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)", minHeight: 44 }}
                      >
                        Spill p&aring; hver deres telefon
                      </button>

                      {/* Paired mode: join session */}
                      <button
                        onClick={() => setScreen("join")}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 44 }}
                      >
                        Bli med i runde
                      </button>
                    </div>
                  )}

                  {sessionError && (
                    <p className="text-xs mt-1 text-center" style={{ color: "#f87171" }}>{sessionError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MOOD SELECTOR */}
          {screen === "mood" && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-sm w-full">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={RED}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Hva er stemningen i kveld?</h2>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Velg &eacute;n. Vi tilpasser forslagene.
                </p>

                {titlesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${RED} transparent ${RED} ${RED}` }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Henter forslag&hellip;</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={async () => {
                          setSelectedMood(m.id);
                          if (moodIntent === "paired") {
                            await createSession(m.id);
                          } else {
                            const fetched = await fetchTitlesForMood(m.id);
                            if (fetched.length > 0) {
                              if (profileComplete) {
                                goTogether();
                              } else {
                                setScreen("onboarding");
                              }
                            }
                          }
                        }}
                        className="flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        style={{
                          background: `${m.color}12`,
                          border: `1px solid ${m.color}30`,
                          color: m.color,
                          minHeight: 56,
                        }}
                      >
                        <span className="text-base font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {sessionError && (
                  <p className="text-xs mt-3 text-center" style={{ color: "#f87171" }}>{sessionError}</p>
                )}

                <button
                  onClick={() => { setScreen("intro"); setSessionError(""); }}
                  className="text-xs font-medium bg-transparent border-0 cursor-pointer mt-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  &larr; Tilbake
                </button>
              </div>
            </div>
          )}

          {/* WAITING (host waits for partner to join) */}
          {screen === "waiting" && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-sm w-full">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}>
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${RED} transparent ${RED} ${RED}` }} />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Venter p&aring; partner&hellip;</h2>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Del koden nedenfor med den du vil se med.
                </p>

                {/* Session code */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer transition-all active:scale-95"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                    onClick={() => {
                      navigator.clipboard.writeText(sessionCode).catch(() => {});
                      showMicro("Kode kopiert!");
                    }}
                  >
                    <span className="text-3xl font-mono font-black tracking-[0.3em] text-white">{sessionCode}</span>
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.5)">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  </div>
                  <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>Trykk for &aring; kopiere</p>
                </div>

                <button
                  onClick={() => { setScreen("intro"); setMode("solo"); setSessionId(null); setSessionCode(""); }}
                  className="text-xs font-medium bg-transparent border-0 cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  &larr; Avbryt
                </button>
              </div>
            </div>
          )}

          {/* JOIN (guest enters code) */}
          {screen === "join" && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-sm w-full">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={RED}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Bli med i runde</h2>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Skriv inn koden du fikk av den andre.
                </p>

                <div className="flex flex-col items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") joinSession(); }}
                    placeholder="KODE"
                    className="w-48 text-center text-2xl font-mono font-black tracking-[0.3em] py-3 rounded-xl border-0 outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", color: "white", caretColor: RED }}
                    autoFocus
                  />

                  <button
                    onClick={joinSession}
                    disabled={joinCode.length < 4 || titlesLoading}
                    className="w-48 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: RED, minHeight: 44 }}
                  >
                    {titlesLoading ? "Kobler til…" : "Bli med"}
                  </button>

                  {sessionError && (
                    <p className="text-xs mt-1" style={{ color: "#f87171" }}>{sessionError}</p>
                  )}
                </div>

                <button
                  onClick={() => { setScreen("intro"); setJoinCode(""); setSessionError(""); }}
                  className="text-xs font-medium bg-transparent border-0 cursor-pointer mt-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  &larr; Tilbake
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING */}
          {screen === "onboarding" && currentTitle && (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-[260px] mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {progress + 1} / {titles.length}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {getGenreName(currentTitle.genre_ids)}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(progress / titles.length) * 100}%`, background: RED }} />
                </div>
              </div>

              <div className="w-full max-w-[260px]">
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Poster title={currentTitle} size="large" />
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white mb-1">{currentTitle.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {currentTitle.year || "—"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: currentTitle.type === "movie" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)", color: currentTitle.type === "movie" ? "#60a5fa" : "#a78bfa" }}>
                        {currentTitle.type === "movie" ? "Film" : "Serie"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => rate("disliked")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)", minHeight: 48 }}>
                    &#128078; Nei
                  </button>
                  <button onClick={() => rate("meh")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.15)", minHeight: 48 }}>
                    &#128528; Meh
                  </button>
                  <button onClick={() => rate("liked")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)", minHeight: 48 }}>
                    &#128077; Liker
                  </button>
                </div>

                <button onClick={() => goTogether()} className="w-full mt-3 py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Hopp over &rarr;
                </button>
              </div>
            </div>
          )}

          {screen === "onboarding" && !currentTitle && !profileComplete && (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ color: "rgba(255,255,255,0.4)" }}>Laster...</p>
            </div>
          )}

          {/* TOGETHER */}
          {screen === "together" && (
            <div className="flex-1 px-4 pb-8 pt-2 overflow-hidden">
              {/* desktop layout: center card + right panel */}
              <div className="h-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
                {/* main (card) */}
                <div className="flex flex-col items-center justify-center">
                  {chosen ? (
                    <div className="w-full flex flex-col items-center justify-center text-center py-8">
                      <h2 className="text-3xl font-black text-white">MATCH!</h2>
                      <p className="text-sm mt-2 mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Begge likte den. Ferdig.
                      </p>

                      <div className="rounded-3xl overflow-hidden w-full max-w-[320px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <Poster title={chosen} size="medium" />
                        <div className="p-5 text-center">
                          <h3 className="text-xl font-bold text-white">{chosen.title}</h3>
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {chosen.year} &middot; {getGenreName(chosen.genre_ids)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={() => {
                            setChosen(null);
                            setMatchOverlay(null);
                            if (timer > 0) setTimerRunning(true);
                          }}
                          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 44 }}
                        >
                          Velg en annen
                        </button>

                        <button onClick={nyeForslag} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 44 }}>
                          Shuffle
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-full max-w-[520px] mb-4 text-center lg:text-left">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-xl lg:text-2xl font-bold text-white">Swipe</h2>
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.70)" }}>
                            {isDesktop ? "← → ↓ (R=shuffle)" : "Swipe høyre/venstre. Ned=meh"}
                          </span>
                        </div>

                        {lowData && (
                          <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.28)" }}>
                            Lite datagrunnlag. Funker likevel.
                          </p>
                        )}
                      </div>

                      {recs.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center text-center py-12">
                          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Ingen flere forslag tilgjengelig.
                          </p>
                          <button onClick={reset} className="mt-4 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: RED }}>
                            Start p&aring; nytt
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full flex items-center justify-center select-none">
                          {/* next card */}
                          {next && (
                            <div className="absolute inset-x-0 mx-auto w-full max-w-[520px]" style={{ transform: "translateY(16px) scale(0.965)", opacity: 0.65 }}>
                              <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <Poster title={next} size="large" />
                                <div className="p-4">
                                  <h3 className="text-base font-bold text-white truncate">{next.title}</h3>
                                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {next.year} &middot; {getGenreName(next.genre_ids)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* top card */}
                          {top && (
                            <div className="w-full max-w-[520px]">
                              <div
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                                className="rounded-3xl overflow-hidden"
                                style={{
                                  touchAction: isDesktop ? "auto" : "none",
                                  cursor: isDesktop ? "default" : "grab",
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  transform: `translate3d(${(fly.active ? fly.x : swipe.x)}px, ${(fly.active ? fly.y : swipe.y)}px, 0) rotate(${(fly.active ? fly.rot : swipe.rot)}deg)`,
                                  transition: swipe.dragging ? "none" : fly.active ? "transform 160ms cubic-bezier(.2,.9,.2,1)" : "transform 200ms cubic-bezier(.2,.9,.2,1)",
                                  boxShadow: `0 18px 70px rgba(0,0,0,0.55),
                                    0 0 55px rgba(34,197,94,${glowLike * 0.22}),
                                    0 0 55px rgba(239,68,68,${glowNope * 0.20}),
                                    0 0 55px rgba(234,179,8,${glowMeh * 0.16})`,
                                }}
                              >
                                <div className="relative">
                                  <Poster title={top} size="large" />

                                  <div className="absolute top-3 left-3 pointer-events-none">
                                    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)" }}>
                                      {hint}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-5">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h3 className="text-lg font-bold text-white truncate">{top.title}</h3>
                                      <p className="text-sm mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                                        {top.overview}
                                      </p>
                                      <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {top.year} &middot; {getGenreName(top.genre_ids)}
                                      </p>
                                      {top.reason && (
                                        <p className="text-[11px] mt-1.5 italic" style={{ color: "rgba(255,255,255,0.28)" }}>
                                          {top.reason}
                                        </p>
                                      )}
                                    </div>

                                    <span className="text-[10px] px-2 py-1 rounded-lg font-semibold shrink-0" style={{ background: top.type === "movie" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)", color: top.type === "movie" ? "#60a5fa" : "#a78bfa" }}>
                                      {top.type === "movie" ? "Film" : "Serie"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* controls UNDER card (desktop), minimal on mobile */}
                              <div className="mt-4 flex items-center justify-center gap-3">
                                {isDesktop ? (
                                  <>
                                    <button onClick={() => top && commitChoice(top, "nope")} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)", minHeight: 44 }}>
                                      &larr; Ikke for oss
                                    </button>
                                    <button onClick={() => top && commitChoice(top, "meh")} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.18)", minHeight: 44 }}>
                                      &darr; Meh
                                    </button>
                                    <button onClick={() => top && commitChoice(top, "like")} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(34,197,94,0.14)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.20)", minHeight: 44 }}>
                                      &rarr; Se n&aring;
                                    </button>
                                    <button onClick={nyeForslag} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.10)", minHeight: 44 }}>
                                      R Shuffle
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={nyeForslag} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.10)", minHeight: 44 }}>
                                    Shuffle
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* right panel (desktop only) */}
                <div className="hidden lg:block">
                  <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
                          DESKTOP MODE
                        </div>
                        <div className="text-lg font-bold text-white mt-1">Kontroller</div>
                      </div>
                      <div className="text-sm font-mono font-bold tabular-nums" style={{ color: timer <= 30 ? RED : "rgba(255,255,255,0.55)" }}>
                        {mm}:{ss}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Ikke for oss
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          &larr;
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Meh
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          &darr;
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Se n&aring; (match)
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          &rarr;
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Nye forslag
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          R
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 p-4 rounded-2xl" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="text-sm font-semibold text-white">Match-logikk</div>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                        Du f&aring;r <span style={{ color: "rgba(255,255,255,0.75)" }}>MATCH</span> n&aring;r dere begge liker samme tittel. Da kommer fireworks og dere er ferdige.
                      </p>
                    </div>

                    {timer === 0 && (
                      <div className="mt-4 text-xs font-semibold" style={{ color: RED }}>
                        Timeren er ute. Trykk Shuffle eller match.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── match overlay ── */}
        {matchOverlay && (
          <>
            <Fireworks
              color={matchOverlay.color}
              onDone={() => {
                /* keep overlay */
              }}
            />
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center px-6"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
              onClick={() => setMatchOverlay(null)}
              role="button"
              tabIndex={0}
            >
              <div
                className="w-full max-w-sm rounded-3xl p-5 text-center"
                style={{
                  background: "rgba(20,20,30,0.82)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: `0 30px 120px rgba(0,0,0,0.6), 0 0 70px ${matchOverlay.color}33`,
                }}
              >
                <div className="text-[11px] font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
                  IT&apos;S A MATCH
                </div>
                <div className="text-2xl font-black mt-2 text-white">{matchOverlay.title.title}</div>
                <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {matchOverlay.title.year} &middot; {getGenreName(matchOverlay.title.genre_ids)}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMatchOverlay(null);
                    }}
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{ background: RED, color: "white", minHeight: 44 }}
                  >
                    Lukk
                  </button>
                </div>
                <div className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.28)" }}>
                  Dette var faktisk felles.
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── micro toast ── */}
        {microToast && (
          <div
            className="fixed top-14 left-1/2 -translate-x-1/2 z-[85] px-3 py-2 rounded-xl"
            style={{ background: "rgba(20,20,30,0.92)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            <span className="text-xs font-medium">{microToast}</span>
          </div>
        )}

        {/* ── undo toast ── */}
        {undoInfo && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {undoInfo.msg}
            </span>
            <button onClick={doUndo} className="text-sm font-semibold bg-transparent border-0 cursor-pointer" style={{ color: RED }}>
              Angre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
