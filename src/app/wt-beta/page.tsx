"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";

/* ── constants ─────────────────────────────────────────── */

const RED = "#ff2a2a";
const POSTER_CACHE_KEY = "wt_posters_v1";

/* ── types ─────────────────────────────────────────────── */

interface MockTitle {
  id: number;
  tmdb_id: number;
  title: string;
  year: number;
  type: "movie" | "tv";
  genre: string;
  why: string;
  platform: string;
  color: string;
}

interface TasteProfile {
  liked: number[];
  meh: number[];
  disliked: number[];
}

type Screen = "intro" | "onboarding" | "together";
type Rating = "liked" | "meh" | "disliked";
type SwipeAction = "like" | "nope" | "meh";

/* ── 40 mock titles ────────────────────────────────────── */

const MOCK_TITLES: MockTitle[] = [
  { id: 1, tmdb_id: 1396, title: "Breaking Bad", year: 2008, type: "tv", genre: "Drama", why: "Perfekt for dere som elsker intenst drama", platform: "Netflix", color: "#2d5a27" },
  { id: 2, tmdb_id: 278, title: "The Shawshank Redemption", year: 1994, type: "movie", genre: "Drama", why: "En tidløs klassiker alle kan enes om", platform: "Max", color: "#8b6914" },
  { id: 3, tmdb_id: 66732, title: "Stranger Things", year: 2016, type: "tv", genre: "Sci-Fi", why: "Nostalgi og spenning i perfekt blanding", platform: "Netflix", color: "#8b1a1a" },
  { id: 4, tmdb_id: 496243, title: "Parasite", year: 2019, type: "movie", genre: "Thriller", why: "Uforutsigbar historie som holder dere på kanten", platform: "Lei", color: "#2d2d5a" },
  { id: 5, tmdb_id: 2316, title: "The Office", year: 2005, type: "tv", genre: "Komedie", why: "Perfekt for en avslappet kveld", platform: "Max", color: "#5a4a2d" },
  { id: 6, tmdb_id: 27205, title: "Inception", year: 2010, type: "movie", genre: "Sci-Fi", why: "Visuelt storslått med dypt plot", platform: "Netflix", color: "#1a3d5a" },
  { id: 7, tmdb_id: 136315, title: "The Bear", year: 2022, type: "tv", genre: "Drama", why: "Intenst og fengslende fra første episode", platform: "Disney+", color: "#5a2d2d" },
  { id: 8, tmdb_id: 545611, title: "Everything Everywhere All at Once", year: 2022, type: "movie", genre: "Action", why: "Kreativt og rørende på samme tid", platform: "Lei", color: "#4a2d5a" },
  { id: 9, tmdb_id: 76331, title: "Succession", year: 2018, type: "tv", genre: "Drama", why: "Familiedrama på sitt mest underholdende", platform: "Max", color: "#2d4a2d" },
  { id: 10, tmdb_id: 157336, title: "Interstellar", year: 2014, type: "movie", genre: "Sci-Fi", why: "Episk romfart med emosjonell kjerne", platform: "Prime", color: "#1a1a4a" },
  { id: 11, tmdb_id: 93405, title: "Squid Game", year: 2021, type: "tv", genre: "Thriller", why: "Intens og fartsfylt spenning", platform: "Netflix", color: "#5a1a3d" },
  { id: 12, tmdb_id: 155, title: "The Dark Knight", year: 2008, type: "movie", genre: "Action", why: "Superheltfilm som går utover sjangeren", platform: "Max", color: "#1a1a2d" },
  { id: 13, tmdb_id: 119051, title: "Wednesday", year: 2022, type: "tv", genre: "Komedie", why: "Mørk humor med sjarm", platform: "Netflix", color: "#2d1a3d" },
  { id: 14, tmdb_id: 872585, title: "Oppenheimer", year: 2023, type: "movie", genre: "Drama", why: "Historisk drama i storformat", platform: "Lei", color: "#3d2d1a" },
  { id: 15, tmdb_id: 97546, title: "Ted Lasso", year: 2020, type: "tv", genre: "Komedie", why: "Feelgood-serie som varmer hjertet", platform: "Apple TV+", color: "#2d5a4a" },
  { id: 16, tmdb_id: 438631, title: "Dune", year: 2021, type: "movie", genre: "Sci-Fi", why: "Visuell sci-fi-opplevelse", platform: "Max", color: "#5a4a1a" },
  { id: 17, tmdb_id: 100088, title: "The Last of Us", year: 2023, type: "tv", genre: "Drama", why: "Sterke karakterer i postapokalyptisk setting", platform: "Max", color: "#3d5a2d" },
  { id: 18, tmdb_id: 244786, title: "Whiplash", year: 2014, type: "movie", genre: "Drama", why: "Nerve og intensitet fra start til slutt", platform: "Netflix", color: "#5a3d1a" },
  { id: 19, tmdb_id: 95396, title: "Severance", year: 2022, type: "tv", genre: "Thriller", why: "Mystisk og avhengighetsskapende", platform: "Apple TV+", color: "#1a4a5a" },
  { id: 20, tmdb_id: 120467, title: "The Grand Budapest Hotel", year: 2014, type: "movie", genre: "Komedie", why: "Visuell komedie med sjel", platform: "Disney+", color: "#5a1a4a" },
  { id: 21, tmdb_id: 70523, title: "Dark", year: 2017, type: "tv", genre: "Sci-Fi", why: "Kompleks tidsreisehistorie som belønner oppmerksomhet", platform: "Netflix", color: "#1a2d4a" },
  { id: 22, tmdb_id: 419430, title: "Get Out", year: 2017, type: "movie", genre: "Thriller", why: "Smart skrekk med viktig budskap", platform: "Prime", color: "#3d1a1a" },
  { id: 23, tmdb_id: 67070, title: "Fleabag", year: 2016, type: "tv", genre: "Komedie", why: "Skarp humor og ekte følelser", platform: "Prime", color: "#4a3d2d" },
  { id: 24, tmdb_id: 324857, title: "Spider-Man: Into the Spider-Verse", year: 2018, type: "movie", genre: "Animasjon", why: "Visuelt nyskapende og underholdende", platform: "Netflix", color: "#2d1a5a" },
  { id: 25, tmdb_id: 87108, title: "Chernobyl", year: 2019, type: "tv", genre: "Drama", why: "Gripende historisk fortelling", platform: "Max", color: "#3d3d1a" },
  { id: 26, tmdb_id: 346698, title: "Barbie", year: 2023, type: "movie", genre: "Komedie", why: "Overraskende smart og morsom", platform: "Max", color: "#5a2d4a" },
  { id: 27, tmdb_id: 83867, title: "Andor", year: 2022, type: "tv", genre: "Sci-Fi", why: "Star Wars på sitt mest modne", platform: "Disney+", color: "#1a3d3d" },
  { id: 28, tmdb_id: 414906, title: "The Batman", year: 2022, type: "movie", genre: "Action", why: "Mørk detektivhistorie i Gotham", platform: "Max", color: "#1a1a3d" },
  { id: 29, tmdb_id: 154521, title: "Beef", year: 2023, type: "tv", genre: "Drama", why: "Uventet og avhengighetsskapende", platform: "Netflix", color: "#5a2d1a" },
  { id: 30, tmdb_id: 329865, title: "Arrival", year: 2016, type: "movie", genre: "Sci-Fi", why: "Tankevekkende sci-fi med dybde", platform: "Prime", color: "#2d3d5a" },
  { id: 31, tmdb_id: 111803, title: "The White Lotus", year: 2021, type: "tv", genre: "Drama", why: "Satirisk drama med strålende rollefigurer", platform: "Max", color: "#4a5a2d" },
  { id: 32, tmdb_id: 546554, title: "Knives Out", year: 2019, type: "movie", genre: "Thriller", why: "Morsom og smart mysteriefilm", platform: "Prime", color: "#3d2d4a" },
  { id: 33, tmdb_id: 126308, title: "Shogun", year: 2024, type: "tv", genre: "Drama", why: "Episk historisk drama fra Japan", platform: "Disney+", color: "#5a1a1a" },
  { id: 34, tmdb_id: 792307, title: "Poor Things", year: 2023, type: "movie", genre: "Drama", why: "Visuelt unik og tankevekkende", platform: "Disney+", color: "#3d1a5a" },
  { id: 35, tmdb_id: 94605, title: "Arcane", year: 2021, type: "tv", genre: "Animasjon", why: "Animasjon som sprenger sjangeren", platform: "Netflix", color: "#1a5a3d" },
  { id: 36, tmdb_id: 361743, title: "Top Gun: Maverick", year: 2022, type: "movie", genre: "Action", why: "Adrenalinfylt underholdning", platform: "Prime", color: "#2d4a5a" },
  { id: 37, tmdb_id: 106379, title: "Fallout", year: 2024, type: "tv", genre: "Sci-Fi", why: "Postapokalyptisk eventyr med humor", platform: "Prime", color: "#4a2d1a" },
  { id: 38, tmdb_id: 840430, title: "The Holdovers", year: 2023, type: "movie", genre: "Drama", why: "Varm historie om uventede vennskap", platform: "Lei", color: "#2d5a5a" },
  { id: 39, tmdb_id: 119299, title: "Slow Horses", year: 2022, type: "tv", genre: "Thriller", why: "Britisk spionserie med bitt", platform: "Apple TV+", color: "#4a4a2d" },
  { id: 40, tmdb_id: 593643, title: "The Menu", year: 2022, type: "movie", genre: "Thriller", why: "Mørk satire som underholder", platform: "Disney+", color: "#3d1a3d" },
];

/* ── helpers ───────────────────────────────────────────── */

function generateMockPartner(): TasteProfile {
  const ids = MOCK_TITLES.map((t) => t.id);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    liked: shuffled.slice(0, 14),
    meh: shuffled.slice(14, 24),
    disliked: shuffled.slice(24, 34),
  };
}

function computeRecs(profile: TasteProfile, partner: TasteProfile, excluded: number[]): MockTitle[] {
  const excludeSet = new Set([...profile.disliked, ...partner.disliked, ...excluded]);

  const scored = MOCK_TITLES
    .filter((t) => !excludeSet.has(t.id))
    .map((t) => {
      let score = 0;
      if (profile.liked.includes(t.id)) score += 2;
      if (partner.liked.includes(t.id)) score += 2;
      if (profile.meh.includes(t.id)) score += 1;
      if (partner.meh.includes(t.id)) score += 1;
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

function posterUrl(posters: Record<string, string>, t: MockTitle): string | null {
  const key = `${t.tmdb_id}:${t.type}`;
  return posters[key] ? `https://image.tmdb.org/t/p/w500${posters[key]}` : null;
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
  posters,
  size = "large",
}: {
  title: MockTitle;
  posters: Record<string, string>;
  size?: "large" | "small" | "medium";
}) {
  const url = posterUrl(posters, title);

  const sizeClass =
    size === "large" ? "w-full aspect-[2/3]" : size === "medium" ? "w-full aspect-[2/3]" : "w-16 h-24";
  const textSize = size === "large" ? "text-5xl" : size === "medium" ? "text-4xl" : "text-lg";
  const rounded = size === "small" ? "rounded-lg" : "rounded-2xl";

  return (
    <div className={`relative overflow-hidden ${sizeClass} ${rounded}`} style={{ background: `linear-gradient(135deg, ${title.color}, ${title.color}66)` }}>
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
  const [screen, setScreen] = useState<Screen>("intro");
  const [profile, setProfile] = useState<TasteProfile>({ liked: [], meh: [], disliked: [] });
  const [partner, setPartner] = useState<TasteProfile | null>(null);
  const [timer, setTimer] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [recs, setRecs] = useState<MockTitle[]>([]);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [chosen, setChosen] = useState<MockTitle | null>(null);
  const [undoInfo, setUndoInfo] = useState<{ msg: string; fn: () => void } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lowData, setLowData] = useState(false);
  const [posters, setPosters] = useState<Record<string, string>>({});
  const [matchOverlay, setMatchOverlay] = useState<{ title: MockTitle; color: string } | null>(null);
  const [microToast, setMicroToast] = useState<string | null>(null);

  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const microTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // swipe state
  const [swipe, setSwipe] = useState<{ x: number; y: number; rot: number; dragging: boolean }>({ x: 0, y: 0, rot: 0, dragging: false });
  const [fly, setFly] = useState<{ active: boolean; x: number; y: number; rot: number }>({ active: false, x: 0, y: 0, rot: 0 });
  const ptr = useRef<{ id: number | null; sx: number; sy: number; target: HTMLElement | null }>({ id: null, sx: 0, sy: 0, target: null });

  const { isTouch } = useInputMode();
  const isDesktop = mounted && !isTouch;

  /* ── load localStorage + fetch posters on mount ── */
  useEffect(() => {
    setMounted(true);
    try {
      const p = localStorage.getItem("logflix_profile_v1");
      if (p) setProfile(JSON.parse(p));
      const pp = localStorage.getItem("logflix_partner_v1");
      if (pp) setPartner(JSON.parse(pp));
    } catch {
      /* empty */
    }

    const cached = localStorage.getItem(POSTER_CACHE_KEY);
    if (cached) {
      try {
        setPosters(JSON.parse(cached));
        return;
      } catch {
        /* refetch */
      }
    }

    const ids = MOCK_TITLES.map((t) => `${t.tmdb_id}:${t.type}`).join(",");
    fetch(`/api/wt-beta/posters?ids=${ids}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setPosters(data);
        localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(data));
      })
      .catch(() => {
        /* posters optional */
      });
  }, []);

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
  const hasProfile = ratedIds.size > 0;
  const profileComplete = ratedIds.size >= MOCK_TITLES.length;
  const currentTitle = useMemo(() => MOCK_TITLES.find((t) => !ratedIds.has(t.id)), [ratedIds]);
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
    const next: TasteProfile = { ...profile, [rating]: [...profile[rating], currentTitle.id] };
    setProfile(next);
    localStorage.setItem("logflix_profile_v1", JSON.stringify(next));
    const totalRated = next.liked.length + next.meh.length + next.disliked.length;
    if (totalRated >= MOCK_TITLES.length) goTogether(next);
  }

  /* ── enter together mode ── */
  function ensurePartner(): TasteProfile {
    let part = partner;
    if (!part) {
      part = generateMockPartner();
      setPartner(part);
      try {
        localStorage.setItem("logflix_partner_v1", JSON.stringify(part));
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

    setRecs(computeRecs(prof, part, excluded));
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
    localStorage.removeItem("logflix_profile_v1");
    localStorage.removeItem("logflix_partner_v1");
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
  }

  /* ── commit choice ───────────────────────────────────── */
  function commitChoice(t: MockTitle, action: SwipeAction) {
    const prevRecs = [...recs];
    const prevExcluded = [...excluded];
    const prevTimerRunning = timerRunning;
    const prevTimer = timer;
    const part = ensurePartner();

    if (action === "like") {
      const isMatch = part.liked.includes(t.id);

      if (isMatch) {
        setChosen(t);
        setTimerRunning(false);
        setMatchOverlay({ title: t, color: t.color });

        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(35);
        } catch {
          /* ignore */
        }

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

      showMicro("Ikke match… fortsett 🫱");
      setExcluded((e) => [...e, t.id]);
      setRecs((r) => r.slice(1));
      showUndo(`Du likte «${t.title}» (ikke match)`, () => {
        setExcluded(prevExcluded);
        setRecs(prevRecs);
      });
      return;
    }

    setExcluded((e) => [...e, t.id]);
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
    const newExcl = [...excluded, ...recs.map((r) => r.id)];
    setExcluded(newExcl);
    setRecs(computeRecs(profile, part, newExcl));
    showUndo("Nye forslag lastet", () => {
      setExcluded(prevExcl);
      setRecs(prevRecs);
    });

    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });
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

  const bgColor = chosen?.color || top?.color || "#0a0a0f";
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
          <Link href="/library" className="text-xs font-medium no-underline" style={{ color: "rgba(255,255,255,0.4)" }}>
            &larr; Logflix
          </Link>

          {screen === "together" && !chosen && (
            <span className="text-sm font-mono font-bold tabular-nums" style={{ color: timer <= 30 ? RED : "rgba(255,255,255,0.5)" }}>
              {mm}:{ss}
            </span>
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

                <h1 className="text-2xl font-bold text-white mb-2">Se sammen på 3 minutter</h1>
                <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Mobil: swipe. Desktop: piltaster og knapper. Match = begge liker.
                </p>

                <div className="flex flex-col gap-3">
                  <button onClick={() => (profileComplete ? goTogether() : setScreen("onboarding"))} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: RED, minHeight: 48 }}>
                    {profileComplete ? "Se forslag" : "Start"}
                  </button>

                  <button
                    onClick={() => goTogether()}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 48 }}
                  >
                    Hopp rett til forslag
                  </button>
                </div>

                {!hasProfile && <p className="text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>Lite datagrunnlag. Funker likevel.</p>}
                {hasProfile && !profileComplete && <p className="text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>Du har {progress} av {MOCK_TITLES.length} vurderinger lagret.</p>}
              </div>
            </div>
          )}

          {/* ONBOARDING */}
          {screen === "onboarding" && currentTitle && (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-[260px] mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {progress + 1} / {MOCK_TITLES.length}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {currentTitle.genre}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(progress / MOCK_TITLES.length) * 100}%`, background: RED }} />
                </div>
              </div>

              <div className="w-full max-w-[260px]">
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Poster title={currentTitle} posters={posters} size="large" />
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white mb-1">{currentTitle.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {currentTitle.year}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: currentTitle.type === "movie" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)", color: currentTitle.type === "movie" ? "#60a5fa" : "#a78bfa" }}>
                        {currentTitle.type === "movie" ? "Film" : "Serie"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => rate("disliked")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)", minHeight: 48 }}>
                    👎 Nei
                  </button>
                  <button onClick={() => rate("meh")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.15)", minHeight: 48 }}>
                    😐 Meh
                  </button>
                  <button onClick={() => rate("liked")} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)", minHeight: 48 }}>
                    👍 Liker
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
                        <Poster title={chosen} posters={posters} size="medium" />
                        <div className="p-5 text-center">
                          <h3 className="text-xl font-bold text-white">{chosen.title}</h3>
                          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {chosen.year} &middot; {chosen.platform}
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
                            Start på nytt
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full flex items-center justify-center select-none">
                          {/* next card */}
                          {next && (
                            <div className="absolute inset-x-0 mx-auto w-full max-w-[520px]" style={{ transform: "translateY(16px) scale(0.965)", opacity: 0.65 }}>
                              <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <Poster title={next} posters={posters} size="large" />
                                <div className="p-4">
                                  <h3 className="text-base font-bold text-white truncate">{next.title}</h3>
                                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {next.year} · {next.platform}
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
                                  <Poster title={top} posters={posters} size="large" />

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
                                      <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                                        {top.why}
                                      </p>
                                      <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {top.year} · {top.platform}
                                      </p>
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
                                      ← Ikke for oss
                                    </button>
                                    <button onClick={() => top && commitChoice(top, "meh")} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.18)", minHeight: 44 }}>
                                      ↓ Meh
                                    </button>
                                    <button onClick={() => top && commitChoice(top, "like")} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: "rgba(34,197,94,0.14)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.20)", minHeight: 44 }}>
                                      → Se nå
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
                          ←
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Meh
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          ↓
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                          Se nå (match)
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                          →
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
                        Du får <span style={{ color: "rgba(255,255,255,0.75)" }}>MATCH</span> når dere begge liker samme tittel. Da kommer fireworks og dere er ferdige.
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
                  {matchOverlay.title.year} · {matchOverlay.title.platform}
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
