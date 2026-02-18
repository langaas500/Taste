"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logTitle } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { getMessages } from "./messages";
import { getLocale, t, type Locale } from "./strings";

/* ── constants ─────────────────────────────────────────── */

const RED = "#ff2a2a";
const TITLES_CACHE_KEY = "wt_titles_v3";
const GUEST_PROFILE_KEY = "wt_guest_profile_v1";
const ROUND1_LIMIT = 25;
const ROUND2_LIMIT = 15;
const ROUND1_DURATION = 120;
const ROUND2_DURATION = 60;
const SUPERLIKES_PER_ROUND = 3;


/* ── poster ribbon — static curated palette ─────────────── */

// 12 distinct gradient pairs (genre moods). Tiles appear at low opacity for atmosphere.
const RIBBON_COLORS: [string, string][] = [
  ["#8b1a1a", "#4a0a0a"], // crimson       — action/thriller
  ["#1a1a8b", "#0a0a4a"], // navy          — sci-fi/drama
  ["#1a6b25", "#0a3d14"], // forest green  — adventure/nature
  ["#6b1a8b", "#3d0a4a"], // violet        — fantasy/horror
  ["#8b5a1a", "#4a300a"], // amber         — period/western
  ["#1a8b6b", "#0a4a3d"], // teal          — crime/mystery
  ["#8b3a1a", "#4a1e0a"], // sienna        — thriller
  ["#1a3a8b", "#0a1e4a"], // midnight blue — drama
  ["#4a8b1a", "#274a0a"], // olive         — war/history
  ["#8b1a4a", "#4a0a27"], // rose          — romance
  ["#1a8b8b", "#0a4a4a"], // cyan          — sci-fi
  ["#5a3a8b", "#2d1e4a"], // indigo        — mystery
];

/* ── streaming providers ───────────────────────────────── */

const VIAPLAY_REGIONS = new Set(["NO", "SE", "DK", "FI", "IS"]);

interface Provider { id: number; name: string; }
const PROVIDERS: Provider[] = [
  { id: 8,    name: "Netflix" },
  { id: 9,    name: "Prime Video" },
  { id: 337,  name: "Disney+" },
  { id: 1899, name: "Max" },
  { id: 350,  name: "Apple TV+" },
  { id: 76,   name: "Viaplay" },
];

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

interface TitlesCacheEntry {
  titles: WTTitle[];
  mood: string;
  ts: number;
}

interface GuestProfile {
  liked: { tmdb_id: number; type: "movie" | "tv"; title: string; genre_ids: number[] }[];
}

type Screen = "intro" | "providers" | "together" | "waiting" | "join";
type SwipeAction = "like" | "nope" | "meh"; // meh kept for API compat, not used in UI
type Mode = "solo" | "paired";
type RoundPhase = "swiping" | "results" | "no-match" | "winner" | "double-super";
type RitualState = "idle" | "arming" | "countdown" | "done";

interface RoundMatch {
  title: WTTitle;
  decisionTime: number; // ms — ranking signal only, never shown to user
}

/* ── helpers ─────────────────────────────────────────────── */

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

function generateMockPartner(titles: WTTitle[]): { liked: number[] } {
  const ids = titles.map((t) => t.tmdb_id);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { liked: shuffled.slice(0, Math.ceil(shuffled.length * 0.35)) };
}

function readTitlesCache(): WTTitle[] {
  try {
    const raw = localStorage.getItem(TITLES_CACHE_KEY);
    if (!raw) return [];
    const entry = JSON.parse(raw) as TitlesCacheEntry;
    if (!Array.isArray(entry.titles)) return [];
    if (Date.now() - (entry.ts || 0) > 24 * 60 * 60 * 1000) return [];
    return entry.titles;
  } catch {
    return [];
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function saveGuestLike(t: WTTitle) {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    const profile: GuestProfile = raw ? JSON.parse(raw) : { liked: [] };
    if (!profile.liked.some((l) => l.tmdb_id === t.tmdb_id)) {
      profile.liked.unshift({ tmdb_id: t.tmdb_id, type: t.type, title: t.title, genre_ids: t.genre_ids });
      if (profile.liked.length > 50) profile.liked = profile.liked.slice(0, 50);
    }
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* storage full */ }
}

function buildGuestParams(): string {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return "";
    const profile: GuestProfile = JSON.parse(raw);
    if (!profile.liked || profile.liked.length === 0) return "";
    const seeds = profile.liked.slice(0, 5).map((l) => `${l.tmdb_id}:${l.type}`).join(",");
    const genreCount: Record<number, number> = {};
    for (const l of profile.liked) {
      for (const gid of l.genre_ids) {
        genreCount[gid] = (genreCount[gid] || 0) + 1;
      }
    }
    const genres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)
      .join(",");
    const params = new URLSearchParams();
    params.set("seed_liked", seeds);
    if (genres) params.set("liked_genres", genres);
    return params.toString();
  } catch {
    return "";
  }
}

/* ── input mode detection ─────────────────────────────── */

function useInputMode() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const check = () => setIsTouch(Boolean(window.matchMedia("(pointer: coarse)").matches || ((navigator as any).maxTouchPoints ?? 0) > 0));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { isTouch };
}

/* ── page component ─────────────────────────────────────── */

export default function WTBetaPage() {
  const [titles, setTitles] = useState<WTTitle[]>([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>("intro");
  const [timer, setTimer] = useState(ROUND1_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);

  const [deck, setDeck] = useState<WTTitle[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [deckExtending, setDeckExtending] = useState(false);

  const [chosen, setChosen] = useState<WTTitle | null>(null); // paired polling compat
  const [mounted, setMounted] = useState(false);
  const [ribbonPosters, setRibbonPosters] = useState<string[]>([]);
  const [preferenceMode, setPreferenceMode] = useState<"series" | "movies" | "mix">("series");
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [userRegion, setUserRegion] = useState("US");
  const [locale, setLocale] = useState<Locale>("en");
  const [matchRevealPhase, setMatchRevealPhase] = useState<0 | 1 | 2 | 3>(0);
  const [introChoice, setIntroChoice] = useState<"solo" | "paired">("paired");
  const [introFading, setIntroFading] = useState(false);
  const [ritualState, setRitualState] = useState<RitualState>("idle");
  const [ritualPhase, setRitualPhase] = useState<0 | 1 | 2>(0);
  const [returnedToday, setReturnedToday] = useState(false);
  const ritualTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [mode, setMode] = useState<Mode>("solo");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [partnerSwipeCount, setPartnerSwipeCount] = useState(0);
  const [sessionError, setSessionError] = useState("");

  // Round engine
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("swiping");
  const [round, setRound] = useState<1 | 2>(1);
  const [roundMatches, setRoundMatches] = useState<RoundMatch[]>([]);
  const [compromiseTitle, setCompromiseTitle] = useState<WTTitle | null>(null);
  const [finalWinner, setFinalWinner] = useState<WTTitle | null>(null);
  const [superLikesUsed, setSuperLikesUsed] = useState(0);
  const [iAmDone, setIAmDone] = useState(false);
  const [waitingFactIndex, setWaitingFactIndex] = useState(0);

  const superLikedIdRef = useRef<number | null>(null);
  const cardStartTime = useRef<number>(0);
  const swipeTimings = useRef<Record<number, number>>({});
  const sessionSwipes = useRef<Record<number, SwipeAction>>({});
  const roundEndingRef = useRef(false);
  const iAmDoneRef = useRef(false);
  const timerRef = useRef(ROUND1_DURATION);
  const roundRef = useRef<1 | 2>(1);
  const deckRef = useRef<WTTitle[]>([]);
  deckRef.current = deck;
  timerRef.current = timer;
  roundRef.current = round;
  const extendingRef = useRef(false);
  const partnerRef = useRef<{ liked: number[] } | null>(null);
  const guestIdRef = useRef<string>("");

  const [swipe, setSwipe] = useState<{ x: number; y: number; rot: number; dragging: boolean }>({ x: 0, y: 0, rot: 0, dragging: false });
  const [fly, setFly] = useState<{ active: boolean; x: number; rot: number }>({ active: false, x: 0, rot: 0 });

  const [authUser, setAuthUser] = useState<{ email?: string } | null>(null);
  const ptr = useRef<{ id: number | null; sx: number; sy: number; target: HTMLElement | null }>({ id: null, sx: 0, sy: 0, target: null });

  const { isTouch } = useInputMode();
  const isDesktop = mounted && !isTouch;
  const router = useRouter();

  /* ── mount ── */
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("ss_pref_mode");
      if (saved === "series" || saved === "movies" || saved === "mix") {
        setPreferenceMode(saved as "series" | "movies" | "mix");
      }
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("ss_last_play_date") === today) {
        setReturnedToday(true);
      }
      // Persist a stable guest ID for WT sessions across reloads.
      // localStorage.setItem throws in Safari incognito — keep ref assignment
      // outside that risk so the ID is always set even if persistence fails.
      let gid = "";
      try { gid = localStorage.getItem("wt_guest_id") ?? ""; } catch { /* ignore */ }
      if (!gid) {
        gid = crypto.randomUUID();
        try { localStorage.setItem("wt_guest_id", gid); } catch { /* incognito/Safari — ephemeral ok */ }
      }
      guestIdRef.current = gid;
    } catch { /* ignore */ }
    createSupabaseBrowser().auth.getSession()
      .then(({ data }) => { setAuthUser(data.session?.user ?? null); })
      .catch(() => {});
  }, []);

  /* ── ritual timer cleanup ── */
  useEffect(() => {
    return () => { ritualTimers.current.forEach(clearTimeout); };
  }, []);

  /* ── ribbon: fetch trending posters (TV 70 % / Movie 30 %) + capture region ── */
  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) setUserRegion(data.region as string);
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get("lang");
        if (langParam === "no" || langParam === "en") {
          setLocale(langParam as Locale);
        } else if (data.region) {
          setLocale(getLocale(data.region as string));
        }
        if (Array.isArray(data.posters) && data.posters.length > 0) {
          setRibbonPosters(data.posters as string[]);
        }
      })
      .catch(() => {});
  }, []);

  /* ── countdown ── */
  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { setTimerRunning(false); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timer]);

  /* ── card timing ── */
  useEffect(() => {
    if (screen === "together" && roundPhase === "swiping") {
      cardStartTime.current = Date.now();
    }
  }, [deckIndex, screen, roundPhase]);

  /* ── auto-extend deck (solo) ── */
  useEffect(() => {
    if (mode !== "solo") return;
    if (deck.length < 4 || deckIndex < deck.length - 3) return;
    if (extendingRef.current) return;
    extendingRef.current = true;
    setDeckExtending(true);
    const seenIds = new Set(deckRef.current.map((t) => t.tmdb_id));
    const extendParams = new URLSearchParams(buildGuestParams() || "");
    extendParams.set("preference", preferenceMode);
    fetch(`/api/together/titles?${extendParams}`)
      .then((r) => r.json())
      .then((data) => {
        const fresh: WTTitle[] = (Array.isArray(data.titles) ? data.titles : []).filter((t: WTTitle) => !seenIds.has(t.tmdb_id));
        if (fresh.length > 0) setDeck((d) => [...d, ...fresh]);
        else {
          const cached = readTitlesCache().filter((t) => !seenIds.has(t.tmdb_id));
          if (cached.length > 0) setDeck((d) => [...d, ...cached]);
        }
      })
      .catch(() => {
        const cached = readTitlesCache().filter((t) => !seenIds.has(t.tmdb_id));
        if (cached.length > 0) setDeck((d) => [...d, ...cached]);
      })
      .finally(() => { extendingRef.current = false; setDeckExtending(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckIndex, deck.length, mode]);

  /* ── round engine ─────────────────────────────────────── */

  async function endRound(r: 1 | 2) {
    if (roundEndingRef.current) return;
    roundEndingRef.current = true;

    let myLikedIds: number[] = [];
    let theirLikedIds: number[] = [];
    // solo: always true; paired: set to confirmed value in fetch below
    let partnerIsDone = true;

    if (mode === "solo") {
      setTimerRunning(false);
      myLikedIds = Object.entries(sessionSwipes.current)
        .filter(([, a]) => a === "like")
        .map(([id]) => Number(id));
      theirLikedIds = partnerRef.current?.liked ?? [];
    } else {
      // ── Paired mode ──────────────────────────────────────────────────────────
      // Always mark ourselves as done first — we have no more cards to swipe.
      if (!iAmDoneRef.current) {
        iAmDoneRef.current = true;
        setIAmDone(true);
      }

      try {
        const res = await fetch(`/api/together/session?id=${sessionId}`, {
          headers: { "X-WT-Guest-ID": guestIdRef.current },
        });
        const data = await res.json();
        if (!data.session) {
          // API error — stay in waiting overlay, poll will retry.
          roundEndingRef.current = false;
          return;
        }

        // Server already has a match — show it directly (avoids race condition).
        if (data.session.match_tmdb_id) {
          const mt = deckRef.current.find((t) => t.tmdb_id === data.session.match_tmdb_id);
          if (mt) {
            setTimerRunning(false);
            setFinalWinner(mt);
            setRoundPhase("winner");
            roundEndingRef.current = false;
            return;
          }
        }

        const mySw = (data.session.my_swipes ?? {}) as Record<string, string>;
        const theirSw = (data.session.partner_swipes ?? {}) as Record<string, string>;
        myLikedIds = Object.entries(mySw).filter(([, a]) => a === "like" || a === "superlike").map(([k]) => Number(k.split(":")[0]));
        theirLikedIds = Object.entries(theirSw).filter(([, a]) => a === "like" || a === "superlike").map(([k]) => Number(k.split(":")[0]));

        // Only compute results when partner has submitted at least as many swipes
        // as the round limit (or the full deck, whichever is smaller).
        const partnerSwipeTotal = Object.keys(theirSw).length;
        const roundLimit = r === 1 ? ROUND1_LIMIT : ROUND1_LIMIT + ROUND2_LIMIT;
        partnerIsDone = partnerSwipeTotal >= Math.min(roundLimit, deckRef.current.length);

        if (!partnerIsDone) {
          // Partner still swiping — stay in overlay. Poll loop will re-trigger endRound.
          roundEndingRef.current = false;
          return;
        }
      } catch {
        // Network error — stay in waiting overlay, do not fall through to results.
        roundEndingRef.current = false;
        return;
      }
      setTimerRunning(false);
    }

    const d = deckRef.current;
    const mutualIds = myLikedIds.filter((id) => theirLikedIds.includes(id));

    if (r === 1) {
      if (mutualIds.length > 0) {
        const matches: RoundMatch[] = mutualIds
          .map((id) => { const title = d.find((t) => t.tmdb_id === id); return title ? { title, decisionTime: swipeTimings.current[id] ?? Infinity } : null; })
          .filter((m): m is RoundMatch => m !== null)
          .sort((a, b) => a.decisionTime - b.decisionTime)
          .slice(0, 3);
        setRoundMatches(matches);
        if (mode === "paired" && !partnerIsDone) return;
        setRoundPhase("results");
      } else {
        const sortedMine = [...myLikedIds].sort((a, b) => (swipeTimings.current[a] ?? Infinity) - (swipeTimings.current[b] ?? Infinity));
        const cid = sortedMine[0] ?? theirLikedIds[0] ?? null;
        setCompromiseTitle(cid != null ? d.find((t) => t.tmdb_id === cid) ?? null : null);
        if (mode === "paired" && !partnerIsDone) return;
        setRoundPhase("no-match");
      }
    } else {
      const candidates = mutualIds.length > 0 ? mutualIds : myLikedIds.length > 0 ? myLikedIds : theirLikedIds;
      const sorted = [...candidates].sort((a, b) => (swipeTimings.current[a] ?? Infinity) - (swipeTimings.current[b] ?? Infinity));
      const wid = sorted[0] ?? d[0]?.tmdb_id;
      setFinalWinner(wid != null ? d.find((t) => t.tmdb_id === wid) ?? d[0] ?? null : d[0] ?? null);
      if (mode === "paired" && !partnerIsDone) return;
      setRoundPhase("winner");
    }
  }

  function startFinalRound() {
    roundEndingRef.current = false;
    iAmDoneRef.current = false;
    setIAmDone(false);
    setWaitingFactIndex(0);
    setRound(2);
    setRoundPhase("swiping");
    setTimer(ROUND2_DURATION);
    setTimerRunning(true);
    setSuperLikesUsed(0);
    superLikedIdRef.current = null;
  }

  /* ── timer = 0 → end round ── */
  useEffect(() => {
    if (timer !== 0 || screen !== "together" || roundPhase !== "swiping" || !!chosen) return;
    endRound(round as 1 | 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  /* ── deckIndex passes limit OR deck exhausted → end round ── */
  useEffect(() => {
    if (screen !== "together" || roundPhase !== "swiping" || !!chosen) return;
    if (iAmDoneRef.current) return; // Already in waiting state — don't re-trigger

    // If we run out of cards before hitting the limit, end the round anyway.
    if (deck.length > 0 && deckIndex >= deck.length) {
      endRound(round as 1 | 2);
      return;
    }

    if (round === 1 && deckIndex >= ROUND1_LIMIT) endRound(1);
    if (round === 2 && deckIndex >= ROUND1_LIMIT + ROUND2_LIMIT) endRound(2);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckIndex]);

  /* ── match moment reveal sequence ── */
  useEffect(() => {
    if (roundPhase !== "winner") { setMatchRevealPhase(0); return; }
    const t1 = window.setTimeout(() => setMatchRevealPhase(1), 400);
    const t2 = window.setTimeout(() => setMatchRevealPhase(2), 700);
    const t3 = window.setTimeout(() => setMatchRevealPhase(3), 1000);
    const t4 = window.setTimeout(() => {
      navigator.vibrate?.([100, 50, 200]);
      try {
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch { /* ignore */ }
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [roundPhase]);

  /* ── message rotation: waiting-for-join screen + iAmDone overlay ── */
  useEffect(() => {
    if (screen !== "waiting" && !iAmDone) return;
    const pool = iAmDone ? getMessages(locale, "waitingAfterDone") : getMessages(locale, "waitingForPartner");
    const id = setInterval(() => {
      setWaitingFactIndex((i) => (i + 1) % pool.length);
    }, 4000);
    return () => clearInterval(id);
  }, [screen, iAmDone, locale]);

  /* ── reset message index on context change ── */
  useEffect(() => {
    if (screen === "waiting") setWaitingFactIndex(0);
  }, [screen]);

  useEffect(() => {
    if (iAmDone) setWaitingFactIndex(0);
  }, [iAmDone]);

  /* ── enter together mode ── */
  async function goTogether() {
    setTitlesLoading(true);
    let ts: WTTitle[] = [];
    try {
      const params = new URLSearchParams();
      const gp = buildGuestParams();
      if (gp) {
        for (const [k, v] of new URLSearchParams(gp).entries()) params.set(k, v);
      }
      if (selectedProviders.length > 0) {
        params.set("providers", selectedProviders.join(","));
        params.set("region", userRegion);
      }
      params.set("preference", preferenceMode);
      const url = `/api/together/titles?${params}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        ts = Array.isArray(data.titles) ? data.titles : [];
        if (ts.length > 0) {
          try { localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify({ titles: ts, mood: "", ts: Date.now() })); } catch { /* storage full */ }
        }
      }
    } catch { /* ignore */ }
    if (ts.length === 0) ts = readTitlesCache();
    setTitlesLoading(false);
    if (ts.length === 0) return;
    partnerRef.current = generateMockPartner(ts);
    setTitles(ts);
    setDeck([...ts]);
    setDeckIndex(0);
    setScreen("together");
    try { localStorage.setItem("ss_last_play_date", new Date().toISOString().slice(0, 10)); } catch { /* ignore */ }
    setTimer(ROUND1_DURATION);
    setTimerRunning(true);
    setChosen(null);
    setSuperLikesUsed(0);
    superLikedIdRef.current = null;
    swipeTimings.current = {};
    sessionSwipes.current = {};
    roundEndingRef.current = false;
    setRound(1);
    setRoundPhase("swiping");
    setRoundMatches([]);
    setCompromiseTitle(null);
    setFinalWinner(null);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, rot: 0 });
  }

  /* ── reset ── */
  function reset() {
    setScreen("intro");
    setTitles([]);
    setDeck([]);
    setDeckIndex(0);
    setDeckExtending(false);
    extendingRef.current = false;
    setChosen(null);
    setTimer(ROUND1_DURATION);
    setTimerRunning(false);
    setSuperLikesUsed(0);
    superLikedIdRef.current = null;
    swipeTimings.current = {};
    sessionSwipes.current = {};
    roundEndingRef.current = false;
    iAmDoneRef.current = false;
    setIAmDone(false);
    setWaitingFactIndex(0);
    setRound(1);
    setRoundPhase("swiping");
    setRoundMatches([]);
    setCompromiseTitle(null);
    setFinalWinner(null);
    setMatchRevealPhase(0);
    setMode("solo");
    setSessionId(null);
    setSessionCode("");
    setJoinCode("");
    setPartnerJoined(false);
    setPartnerSwipeCount(0);
    setSessionError("");
    partnerRef.current = null;
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, rot: 0 });
  }

  /* ── ritual start sequence ── */
  function startRitual(onComplete: () => void) {
    if (ritualState !== "idle") return;
    ritualTimers.current.forEach(clearTimeout);
    ritualTimers.current = [];
    setRitualState("arming");
    setRitualPhase(0);
    const t1 = setTimeout(() => setRitualState("countdown"), 250);
    const t2 = setTimeout(() => setRitualPhase(1), 650);
    const t3 = setTimeout(() => setRitualPhase(2), 950);
    const t4 = setTimeout(() => setRitualState("done"), 1250);
    const t5 = setTimeout(() => {
      setRitualState("idle");
      setRitualPhase(0);
      onComplete();
    }, 1550);
    ritualTimers.current = [t1, t2, t3, t4, t5];
  }

  /* ── commit choice ── */
  function commitChoice(t: WTTitle, action: SwipeAction) {
    if (!(t.tmdb_id in swipeTimings.current)) {
      swipeTimings.current[t.tmdb_id] = Date.now() - cardStartTime.current;
    }
    sessionSwipes.current[t.tmdb_id] = action;
    if (mode === "paired") {
      submitPairedSwipe(t, action);
      setDeckIndex((i) => i + 1);
      if (action === "like") logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watched", sentiment: "liked" }).catch(() => {});
      return;
    }
    if (action === "like") {
      logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watched", sentiment: "liked" }).catch(() => {});
      saveGuestLike(t);
    }
    setDeckIndex((i) => i + 1);
  }

  /* ── super-like (3 per round) ── */
  function handleSuperLike() {
    if (superLikesUsed >= SUPERLIKES_PER_ROUND) return;
    const t = deck[deckIndex];
    if (!t) return;
    setSuperLikesUsed((n) => n + 1);
    superLikedIdRef.current = t.tmdb_id;
    swipeTimings.current[t.tmdb_id] = Date.now() - cardStartTime.current;
    sessionSwipes.current[t.tmdb_id] = "like";
    if (mode === "solo") {
      saveGuestLike(t);
      setFinalWinner(t);
      setTimerRunning(false);
      setRoundPhase("winner");
      logTitle({ tmdb_id: t.tmdb_id, type: t.type, status: "watchlist" }).catch(() => {});
    } else {
      fetch("/api/together/session/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current },
        body: JSON.stringify({ session_id: sessionId, tmdb_id: t.tmdb_id, type: t.type, action: "superlike" }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.doubleSuperMatch) {
            const mt = titles.find((x) => x.tmdb_id === data.doubleSuperMatch.tmdb_id);
            if (mt) { setFinalWinner(mt); setRoundPhase("double-super"); setTimerRunning(false); }
          }
        })
        .catch(() => {});
      setDeckIndex((i) => i + 1);
    }
  }

  /* ── keyboard (desktop) ── */
  useEffect(() => {
    if (!mounted || screen !== "together" || roundPhase !== "swiping" || chosen || !isDesktop) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const top = deckRef.current[deckIndex];
      if (!top) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); commitChoice(top, "nope"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); commitChoice(top, "like"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, screen, roundPhase, chosen, isDesktop, deckIndex]);

  /* ── pointer handlers ── */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (screen !== "together" || roundPhase !== "swiping" || chosen || !deck[deckIndex] || fly.active || isDesktop) return;
    ptr.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, target: e.currentTarget };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: true });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId || !swipe.dragging) return;
    const dx = e.clientX - ptr.current.sx;
    setSwipe({ x: dx, y: 0, rot: clamp(dx / 18, -14, 14), dragging: true });
  }

  function endSwipe(action?: SwipeAction) {
    const top = deck[deckIndex];
    if (!top) return;
    let decided: SwipeAction | null = action || null;
    if (!decided) {
      if (swipe.x > 100) decided = "like";
      else if (swipe.x < -100) decided = "nope";
    }
    if (!decided) { setSwipe({ x: 0, y: 0, rot: 0, dragging: false }); return; }
    const outX = decided === "like" ? window.innerWidth * 1.1 : -window.innerWidth * 1.1;
    setFly({ active: true, x: outX, rot: decided === "like" ? 20 : -20 });
    window.setTimeout(() => {
      setFly({ active: false, x: 0, rot: 0 });
      setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
      commitChoice(top, decided!);
    }, 200);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId) return;
    try { ptr.current.target?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    ptr.current.id = null;
    endSwipe();
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId) return;
    ptr.current.id = null;
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
  }

  /* ── paired: create session ── */
  async function createSession() {
    setSessionError(""); setTitlesLoading(true);
    try {
      const res = await fetch("/api/together/session", { method: "POST", headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setSessionCode(data.session.code);
      setTitles(data.session.titles);
      try { localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify({ titles: data.session.titles, mood: "", ts: Date.now() })); } catch { /* ignore */ }
      setMode("paired"); setScreen("waiting");
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : "Kunne ikke opprette runde");
    }
    setTitlesLoading(false);
  }

  /* ── paired: join session ── */
  async function joinSession() {
    if (!joinCode.trim()) return;
    setSessionError(""); setTitlesLoading(true);
    try {
      const res = await fetch("/api/together/session/join", { method: "POST", headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current }, body: JSON.stringify({ code: joinCode.trim() }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setTitles(data.session.titles);
      setDeck([...data.session.titles]);
      setDeckIndex(0);
      setMode("paired"); setScreen("together");
      setTimer(ROUND1_DURATION); setTimerRunning(true);
      setChosen(null);
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : "Kunne ikke bli med");
    }
    setTitlesLoading(false);
  }

  /* ── paired: poll ── */
  useEffect(() => {
    if (mode !== "paired" || !sessionId || !!chosen) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/together/session?id=${sessionId}`, { headers: { "X-WT-Guest-ID": guestIdRef.current } });
        const data = await res.json();
        if (!data.session) return;
        if (!partnerJoined && data.session.partner_joined) {
          setPartnerJoined(true);
          if (screen === "waiting") {
            setDeck([...titles]); setDeckIndex(0);
            setScreen("together"); setTimer(ROUND1_DURATION); setTimerRunning(true);
          }
        }
        const partnerSwiped = Object.keys(data.session.partner_swipes || {}).length;
        setPartnerSwipeCount(partnerSwiped);

        // If we're in the iAmDone overlay and partner has now finished, trigger results.
        if (iAmDoneRef.current && !roundEndingRef.current) {
          const r = roundRef.current;
          const threshold = Math.min(
            r === 1 ? ROUND1_LIMIT : ROUND1_LIMIT + ROUND2_LIMIT,
            deckRef.current.length,
          );
          if (partnerSwiped >= threshold) {
            endRound(r);
            return;
          }
        }

        if (superLikedIdRef.current) {
          const myId = superLikedIdRef.current;
          const myTitle = titles.find((t) => t.tmdb_id === myId);
          if (myTitle) {
            const key = `${myId}:${myTitle.type}`;
            const partnerSw = (data.session.partner_swipes ?? {}) as Record<string, string>;
            if (partnerSw[key] === "superlike") {
              setFinalWinner(myTitle); setRoundPhase("double-super"); setTimerRunning(false); return;
            }
          }
        }
        if (data.session.match_tmdb_id && !chosen) {
          const mt = titles.find((t) => t.tmdb_id === data.session.match_tmdb_id);
          if (mt) { setChosen(mt); setFinalWinner(mt); setRoundPhase("winner"); setTimerRunning(false); }
        }
      } catch { /* retry */ }
    };
    const interval = setInterval(poll, 2000);
    poll();
    return () => clearInterval(interval);
  }, [mode, sessionId, partnerJoined, screen, titles, chosen]);

  /* ── paired: submit swipe ── */
  function submitPairedSwipe(t: WTTitle, action: SwipeAction) {
    if (!sessionId) return;
    fetch("/api/together/session/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current },
      body: JSON.stringify({ session_id: sessionId, tmdb_id: t.tmdb_id, type: t.type, action }),
    }).catch(() => {});
  }

  /* ── hydration guard ── */
  if (!mounted) return null;

  const top = deck[deckIndex] ?? null;
  const deckExhausted = deck.length > 0 && deckIndex >= deck.length;
  const maxTimer = round === 1 ? ROUND1_DURATION : ROUND2_DURATION;
  const timerPct = Math.round((timer / maxTimer) * 100);

  /* ── shared card styles ── */
  const btnBase: React.CSSProperties = {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    cursor: "pointer",
    flexShrink: 0,
    transition: "transform 100ms",
  };

  return (
    <div className="min-h-dvh" style={{ background: "#0a0a0f" }}>
      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)", zIndex: 0 }}
      />

      <div className="relative z-10 min-h-dvh flex flex-col">

        {/* ── INTRO ── */}
        {screen === "intro" && (
          <div
            className="flex-1 flex flex-col"
            style={{
              position: "relative",
              opacity: introFading ? 0.88 : 1,
              filter: ritualState !== "idle" ? "blur(1px)" : "none",
              transition: introFading ? "opacity 220ms ease-out" : ritualState !== "idle" ? "filter 250ms ease-out" : "opacity 0ms",
            }}
          >

            {/* ── Keyframes ── */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes atmo-drift {
                0%   { transform: translate(0%,    0%); }
                25%  { transform: translate(2.2%,  1.4%); }
                55%  { transform: translate(-1.8%, 2.6%); }
                80%  { transform: translate(1.5%,  -1.2%); }
                100% { transform: translate(0%,    0%); }
              }
              .atmo-drift { animation: atmo-drift 38s linear infinite; }
              @keyframes ribbon-scroll {
                from { transform: translateX(0); }
                to   { transform: translateX(-50%); }
              }
              .ribbon-track { animation: ribbon-scroll 40s linear infinite; }
              .cta-btn { transition: filter 180ms ease, transform 140ms ease, opacity 150ms; }
              .cta-btn:hover:not(:disabled) { filter: brightness(1.08); transform: scale(1.015); }
              .cta-btn:active:not(:disabled) { filter: brightness(0.96); }
            `}} />

            {/* ── Atmospheric gradient drift — absolute behind everything ── */}
            <div
              className="atmo-drift"
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 170% 140% at 50% 65%, rgba(168,18,18,0.05) 0%, transparent 72%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* ── Logo — top center, in flow ── */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 28, paddingBottom: 4, flexShrink: 0, position: "relative", zIndex: 1 }}>
              <img
                src="/logo.png"
                alt="Logflix"
                style={{ height: 28, width: "auto", opacity: 0.85 }}
              />
            </div>

            {/* ── Trending poster strip — flat horizontal scroll ── */}
            <div
              style={{
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                marginTop: 24,
                overflow: "hidden",
                height: 132,
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {ribbonPosters.length > 0 ? (
                <div
                  className="ribbon-track"
                  style={{ display: "flex", gap: 13, width: "max-content", paddingTop: 6, paddingBottom: 6, filter: "blur(1.5px)" }}
                >
                  {[...ribbonPosters, ...ribbonPosters].map((poster, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={`https://image.tmdb.org/t/p/w185${poster}`}
                      alt=""
                      style={{ height: 120, width: "auto", borderRadius: 16, opacity: 0.65, flexShrink: 0, display: "block", objectFit: "cover" }}
                    />
                  ))}
                </div>
              ) : (
                /* Loading placeholder — gradient tiles, duplicated for seamless scroll */
                <div
                  className="ribbon-track"
                  style={{ display: "flex", gap: 13, width: "max-content", paddingTop: 6, paddingBottom: 6 }}
                >
                  {[...RIBBON_COLORS, ...RIBBON_COLORS].map(([from, to], i) => (
                    <div
                      key={i}
                      style={{ height: 120, width: 80, borderRadius: 16, background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`, opacity: 0.18, flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Hero block — flex-1, centered below ribbon ── */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 1 }}>
            <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>

              {/* Headline — time of day */}
              <h1 style={{
                fontSize: "clamp(1.7rem, 7.2vw, 2.3rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                lineHeight: 1.1,
                margin: "10px auto 20px",
                maxWidth: "85%",
              }}>
                {(() => { const h = new Date().getHours(); return h >= 18 || h < 5 ? t(locale, "intro", "headlineEvening") : t(locale, "intro", "headlineDay"); })()}
              </h1>

              {/* Subtext — 20px below headline, 24px above cards */}
              <div style={{ marginBottom: "24px" }}>
                {returnedToday ? (
                  <p style={{ fontSize: "0.9375rem", fontWeight: 400, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{t(locale, "intro", "returnedSubtitle")}</p>
                ) : (
                  <>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 400, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{t(locale, "intro", "subtitle1")}</p>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 400, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{t(locale, "intro", "subtitle2")}</p>
                  </>
                )}
              </div>

              {/* Mode selector cards */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {(["solo", "paired"] as const).map((choice) => {
                  const active = introChoice === choice;
                  return (
                    <button
                      key={choice}
                      onClick={() => setIntroChoice(choice)}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: "22px 12px",
                        minHeight: 140,
                        borderRadius: 16,
                        border: active ? "1.5px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.09)",
                        background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        transition: "all 160ms ease",
                        transform: active ? "scale(1.03)" : "scale(1)",
                        boxShadow: active ? "0 0 0 1px rgba(255,42,42,0.15), 0 4px 20px rgba(0,0,0,0.3)" : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={choice === "solo" ? "/one-phone.svg" : "/two-phones.svg"}
                        alt={choice === "solo" ? t(locale, "intro", "soloLabel") : t(locale, "intro", "pairedLabel")}
                        style={{ height: 48, width: "auto", opacity: active ? 1 : 0.55, transition: "opacity 160ms ease" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{
                          fontSize: "0.875rem",
                          fontWeight: active ? 600 : 400,
                          color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)",
                          letterSpacing: "-0.01em",
                          transition: "all 160ms ease",
                        }}>
                          {choice === "solo" ? t(locale, "intro", "soloLabel") : t(locale, "intro", "pairedLabel")}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 400,
                          color: active ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.22)",
                          letterSpacing: "-0.005em",
                          lineHeight: 1.3,
                          transition: "all 160ms ease",
                        }}>
                          {choice === "solo" ? t(locale, "intro", "soloDesc") : t(locale, "intro", "pairedDesc")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Primary CTA */}
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => {
                    if (introChoice === "solo") {
                      if (titlesLoading || ritualState !== "idle") return;
                      startRitual(() => { setMode("solo"); setSelectedProviders([]); setScreen("providers"); });
                    } else {
                      createSession();
                    }
                  }}
                  disabled={titlesLoading || (introChoice === "solo" && ritualState !== "idle")}
                  className="cta-btn"
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: "14px",
                    background: "linear-gradient(180deg, #ff2a2a 0%, #c91414 100%)",
                    color: "#fff",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: titlesLoading ? "default" : "pointer",
                    opacity: titlesLoading ? 0.55 : 1,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 8px 24px rgba(255,42,42,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  {titlesLoading ? t(locale, "intro", "loading") : introChoice === "solo" ? t(locale, "intro", "startSolo") : t(locale, "intro", "startPaired")}
                </button>
              </div>

              {/* Secondary: I have a code — always visible */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => setScreen("join")}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.38)",
                    fontSize: "0.8125rem", fontWeight: 400,
                    cursor: "pointer", padding: "4px 0",
                  }}
                >
                  {t(locale, "intro", "hasCode")}
                </button>
                {sessionError && <p style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.25rem" }}>{sessionError}</p>}
              </div>

            </div>
            </div>
          </div>
        )}

        {/* ── WAITING ── */}
        {screen === "waiting" && (
          <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes wf-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
              .wf-msg { animation: wf-rise 0.6s ease forwards; }
              @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              @keyframes code-glow { from { box-shadow: 0 0 20px rgba(255,42,42,0.10); } to { box-shadow: 0 0 20px rgba(255,42,42,0.25); } }
              @keyframes dot-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
            `}} />

            {/* Poster mosaic background */}
            {ribbonPosters.length > 0 && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{
                  display: "flex",
                  gap: 8,
                  height: "100%",
                  width: "max-content",
                  animation: "poster-drift 60s linear infinite",
                }}>
                  {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                    <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.10, filter: "blur(3px)", flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            )}

            <div className="text-center max-w-sm w-full relative z-10">
              {/* Pulsing red dot */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: RED,
                margin: "0 auto 32px", animation: "dot-pulse 1.5s ease-in-out infinite",
              }} />
              <h2 className="text-xl font-bold text-white mb-2">{t(locale, "waiting", "headline")}</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>{t(locale, "waiting", "ingress")}</p>
              <div
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer mb-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  animation: "code-glow 2s ease-in-out infinite alternate",
                }}
                onClick={() => { navigator.clipboard.writeText(sessionCode).catch(() => {}); }}
              >
                <span className="text-3xl font-mono font-black tracking-[0.3em] text-white">{sessionCode}</span>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.4)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </div>
              <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.25)" }}>{t(locale, "waiting", "copyHint")}</p>
              <p
                key={waitingFactIndex}
                className="wf-msg text-[11px] mb-8"
                style={{ color: "rgba(255,255,255,0.32)", lineHeight: 1.6, maxWidth: 240, margin: "0 auto 32px" }}
              >
                {getMessages(locale, "waitingForPartner")[waitingFactIndex % getMessages(locale, "waitingForPartner").length]}
              </p>
              <button
                onClick={() => { setScreen("intro"); setMode("solo"); setSessionId(null); setSessionCode(""); }}
                className="text-xs font-medium bg-transparent border-0 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                {t(locale, "waiting", "cancel")}
              </button>
            </div>
          </div>
        )}

        {/* ── JOIN ── */}
        {screen === "join" && (
          <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            `}} />
            {ribbonPosters.length > 0 && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
                  {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                    <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.10, filter: "blur(3px)", flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            )}
            <div className="text-center max-w-sm w-full relative z-10">
              <h2 className="text-xl font-bold text-white mb-2">{t(locale, "join", "headline")}</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>{t(locale, "join", "ingress")}</p>
              <div className="flex flex-col items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") joinSession(); }}
                  placeholder={t(locale, "join", "placeholder")}
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
                  {titlesLoading ? t(locale, "join", "connecting") : t(locale, "join", "joinBtn")}
                </button>
                {sessionError && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{sessionError}</p>}
              </div>
              <button
                onClick={() => { setScreen("intro"); setJoinCode(""); setSessionError(""); }}
                className="text-xs font-medium bg-transparent border-0 cursor-pointer mt-8"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                {t(locale, "join", "back")}
              </button>
            </div>
          </div>
        )}

        {/* ── PROVIDERS ── */}
        {screen === "providers" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
            <div style={{ width: "100%", maxWidth: 340 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 6, textAlign: "center" }}>
                {t(locale, "providers", "headline")}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.42)", marginBottom: 32, textAlign: "center" }}>
                {t(locale, "providers", "ingress")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 }}>
                {PROVIDERS
                  .filter((p) => p.id !== 76 || VIAPLAY_REGIONS.has(userRegion))
                  .map((p) => {
                    const selected = selectedProviders.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          setSelectedProviders((prev) =>
                            prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                          )
                        }
                        style={{
                          padding: "10px 20px",
                          borderRadius: 10,
                          border: selected ? "1.5px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.12)",
                          background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                          color: selected ? "#fff" : "rgba(255,255,255,0.58)",
                          fontSize: "0.875rem",
                          fontWeight: selected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 140ms ease",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {p.name}
                      </button>
                    );
                  })}
              </div>
              {/* Tonight preference toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.02em" }}>
                  {t(locale, "providers", "tonightLabel")}
                </span>
                <div style={{
                  display: "inline-flex",
                  gap: 6,
                  padding: "4px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {(["series", "movies", "mix"] as const).map((mode) => {
                    const labels: Record<string, string> = { series: t(locale, "providers", "series"), movies: t(locale, "providers", "movies"), mix: t(locale, "providers", "mix") };
                    const active = preferenceMode === mode;
                    return (
                      <button
                        key={mode}
                        aria-pressed={active}
                        onClick={() => {
                          setPreferenceMode(mode);
                          try { localStorage.setItem("ss_pref_mode", mode); } catch { /* ignore */ }
                        }}
                        onPointerDown={(e) => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.transition = "transform 100ms ease-out";
                          b.style.transform = "scale(0.97)";
                        }}
                        onPointerUp={(e) => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.transform = "scale(1)";
                        }}
                        onPointerLeave={(e) => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.transform = "scale(1)";
                        }}
                        style={{
                          height: 36,
                          padding: "0 16px",
                          borderRadius: 999,
                          border: active ? "1px solid rgba(255,42,42,0.35)" : "1px solid transparent",
                          background: active ? "rgba(255,42,42,0.18)" : "transparent",
                          color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
                          fontSize: "0.8125rem",
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          letterSpacing: "-0.01em",
                          boxShadow: active ? "0 6px 16px rgba(255,42,42,0.18)" : "none",
                          transition: "background 140ms ease, color 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
                        }}
                      >
                        {labels[mode]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={async () => { if (!titlesLoading) await goTogether(); }}
                disabled={titlesLoading}
                style={{
                  width: "100%", height: 54, borderRadius: 12,
                  background: "linear-gradient(180deg, #ff2a2a 0%, #c91414 100%)",
                  color: "#fff", fontSize: "0.9375rem", fontWeight: 600,
                  border: "none", cursor: titlesLoading ? "default" : "pointer",
                  opacity: titlesLoading ? 0.55 : 1,
                  boxShadow: "0 8px 24px rgba(255,42,42,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
                  letterSpacing: "-0.01em",
                  marginBottom: 14,
                }}
              >
                {titlesLoading ? t(locale, "providers", "loading") : selectedProviders.length > 0 ? t(locale, "providers", "continueBtn") : t(locale, "providers", "seeAll")}
              </button>
              <button
                onClick={() => setScreen("intro")}
                style={{
                  width: "100%", padding: "8px 0", background: "none", border: "none",
                  color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem", cursor: "pointer",
                }}
              >
                {t(locale, "providers", "back")}
              </button>
            </div>
          </div>
        )}

        {/* ── TOGETHER ── */}
        {screen === "together" && (
          <>
            {/* 2px matte progress bar — always at top during together */}
            <div className="fixed top-0 left-0 right-0 z-50" style={{ height: "2px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: "#7a1010", transition: "width 1s linear" }} />
            </div>

            {/* ── RESULT SCREENS (fullscreen overlays) ── */}

            {/* Dere valgte det samme */}
            {roundPhase === "double-super" && finalWinner && (
              <div className="fixed inset-0 z-30 flex flex-col justify-end px-6 pb-16">
                <div className="absolute inset-0" style={{ background: getGenreColor(finalWinner.genre_ids) }} />
                {finalWinner.poster_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://image.tmdb.org/t/p/w780${finalWinner.poster_path}`} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,1) 100%)" }} />
                <div className="relative z-10 w-full max-w-sm">
                  <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}>{t(locale, "doubleSuper", "label")}</div>
                  <h2 className="text-3xl font-black text-white leading-tight mb-1">{finalWinner.title}</h2>
                  <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>{finalWinner.year} &middot; {getGenreName(finalWinner.genre_ids)}</p>
                  <button onClick={() => setRoundPhase("winner")} className="w-full py-4 rounded-xl text-sm font-bold text-white mb-2" style={{ background: RED, minHeight: 52 }}>
                    {t(locale, "doubleSuper", "startWatching")}
                  </button>
                  <button
                    onClick={() => { setFinalWinner(null); setRoundPhase("swiping"); setSuperLikesUsed(0); superLikedIdRef.current = null; roundEndingRef.current = false; setTimerRunning(true); }}
                    className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    {t(locale, "doubleSuper", "continueBtn")}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {roundPhase === "results" && roundMatches.length > 0 && (
              <div className="fixed inset-0 z-30 flex flex-col items-center justify-center px-6 py-10" style={{ background: "#0c0a09" }}>
                <div className="w-full max-w-sm">
                  <div className="text-xs mb-6 text-center" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em" }}>{t(locale, "results", "label")}</div>
                  <div className="rounded-2xl overflow-hidden mb-4 mx-auto" style={{ maxWidth: 200, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {roundMatches[0].title.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://image.tmdb.org/t/p/w342${roundMatches[0].title.poster_path}`} alt="" className="w-full object-cover" style={{ aspectRatio: "2/3" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full flex items-center justify-center text-3xl font-black" style={{ aspectRatio: "2/3", background: getGenreColor(roundMatches[0].title.genre_ids), color: "rgba(255,255,255,0.15)" }}>{roundMatches[0].title.title.substring(0, 2)}</div>
                    )}
                    <div className="p-3">
                      <div className="font-bold text-white text-sm truncate">{roundMatches[0].title.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{roundMatches[0].title.year} &middot; {getGenreName(roundMatches[0].title.genre_ids)}</div>
                    </div>
                  </div>
                  <button onClick={() => { setFinalWinner(roundMatches[0].title); setRoundPhase("winner"); }} className="w-full py-4 rounded-xl text-sm font-bold text-white mb-3" style={{ background: RED, minHeight: 52 }}>
                    {t(locale, "results", "startWatching")}
                  </button>
                  {roundMatches.length > 1 && (
                    <div className="text-xs text-center mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {t(locale, "results", "seeAlternatives")} {roundMatches.slice(1).map((m) => m.title.title).join(" · ")}
                    </div>
                  )}
                  {round === 1 && (
                    <button onClick={startFinalRound} className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.22)" }}>
                      {t(locale, "results", "continueBtn")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* No match */}
            {roundPhase === "no-match" && (
              <div className="fixed inset-0 z-30 flex flex-col items-center justify-center px-6 py-10" style={{ background: "#0c0a09" }}>
                <div className="w-full max-w-sm text-center">
                  <div className="text-sm font-semibold text-white mb-1">{t(locale, "noMatch", "headline")}</div>
                  <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.38)" }}>{t(locale, "noMatch", "ingress")}</div>
                  {compromiseTitle && (
                    <div className="rounded-2xl overflow-hidden mb-6 mx-auto" style={{ maxWidth: 180, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {compromiseTitle.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://image.tmdb.org/t/p/w342${compromiseTitle.poster_path}`} alt="" className="w-full object-cover" style={{ aspectRatio: "2/3" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full flex items-center justify-center text-3xl font-black" style={{ aspectRatio: "2/3", background: getGenreColor(compromiseTitle.genre_ids), color: "rgba(255,255,255,0.15)" }}>{compromiseTitle.title.substring(0, 2)}</div>
                      )}
                      <div className="p-3">
                        <div className="font-bold text-white text-sm truncate">{compromiseTitle.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{compromiseTitle.year} &middot; {getGenreName(compromiseTitle.genre_ids)}</div>
                      </div>
                    </div>
                  )}
                  {round === 1 ? (
                    <button onClick={startFinalRound} className="w-full py-4 rounded-xl text-sm font-bold text-white" style={{ background: RED, minHeight: 52 }}>
                      {t(locale, "noMatch", "lastRound")}
                    </button>
                  ) : (
                    <button onClick={() => { setFinalWinner(compromiseTitle); setRoundPhase("winner"); }} className="w-full py-4 rounded-xl text-sm font-bold text-white" style={{ background: RED, minHeight: 52 }}>
                      {t(locale, "noMatch", "acceptThis")}
                    </button>
                  )}
                  <button onClick={reset} className="w-full py-3 mt-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.2)" }}>{t(locale, "noMatch", "playAgain")}</button>
                </div>
              </div>
            )}

            {/* Winner — phased match moment reveal */}
            {roundPhase === "winner" && finalWinner && (
              <div className="fixed inset-0 z-30 flex flex-col justify-end md:items-center px-6 pb-16">
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes poster-fadein { from { opacity: 0 } to { opacity: 1 } }
                  @keyframes poster-reveal {
                    0%   { transform: scale(1); }
                    15%  { transform: scale(1.05); }
                    40%  { transform: scale(0.98); }
                    60%  { transform: scale(1.02); }
                    100% { transform: scale(1); }
                  }
                  @keyframes glow-flash {
                    0%   { box-shadow: 0 0 0px rgba(255,42,42,0); }
                    30%  { box-shadow: 0 0 60px rgba(255,42,42,0.5); }
                    100% { box-shadow: 0 0 0px rgba(255,42,42,0); }
                  }
                `}} />
                <div className="absolute inset-0" style={{ background: getGenreColor(finalWinner.genre_ids) }} />
                {finalWinner.poster_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w780${finalWinner.poster_path}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover md:object-contain"
                    style={{
                      animation: "poster-fadein 600ms ease-out forwards, poster-reveal 1s ease-out 600ms forwards, glow-flash 1.2s ease-out 600ms forwards",
                      filter: matchRevealPhase >= 1 ? "brightness(0.95)" : "brightness(1)",
                      transition: "filter 600ms ease",
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,1) 100%)" }} />
                <div className="relative z-10 w-full max-w-sm md:mx-auto">
                  {/* Phase 1: label */}
                  <div style={{
                    fontSize: "1rem", letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.72)", marginBottom: 12,
                    textShadow: "0 0 20px rgba(255,42,42,0.55)",
                    opacity: matchRevealPhase >= 1 ? 1 : 0,
                    transition: "opacity 600ms ease",
                  }}>
                    {t(locale, "winner", "phase1")}
                  </div>
                  {/* Phase 2: title + meta */}
                  <div style={{ opacity: matchRevealPhase >= 2 ? 1 : 0, transition: "opacity 600ms ease" }}>
                    <h2 className="text-3xl font-black text-white leading-tight mb-1">{finalWinner.title}</h2>
                    <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {finalWinner.year} &middot; {getGenreName(finalWinner.genre_ids)}
                    </p>
                    {finalWinner.overview && (
                      <p className="text-sm mb-8 line-clamp-2" style={{ color: "rgba(255,255,255,0.58)", lineHeight: 1.5 }}>
                        {finalWinner.overview}
                      </p>
                    )}
                  </div>
                  {/* Phase 3: buttons */}
                  <div style={{ opacity: matchRevealPhase >= 3 ? 1 : 0, transition: "opacity 600ms ease" }}>
                    <button className="w-full py-4 rounded-xl text-sm font-bold text-white mb-3" style={{ background: RED, minHeight: 52 }}>
                      {t(locale, "winner", "startWatching")}
                    </button>
                    <button onClick={reset} className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {t(locale, "winner", "keepLooking")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── WAITING FOR PARTNER — shown when iAmDone but timer still running ── */}
            {roundPhase === "swiping" && iAmDone && mode === "paired" && (
              <div className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a0f" }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes wf-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                  .wf-fact { animation: wf-rise 0.7s ease forwards; }
                  @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                `}} />

                {/* Poster mosaic background */}
                {ribbonPosters.length > 0 && (
                  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                    <div style={{
                      display: "flex",
                      gap: 8,
                      height: "100%",
                      width: "max-content",
                      animation: "poster-drift 60s linear infinite",
                    }}>
                      {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                        <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.10, filter: "blur(3px)", flexShrink: 0 }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: "center", padding: "0 44px", maxWidth: 300, position: "relative", zIndex: 1 }}>
                  {/* Ghost timer — huge, faint, in background */}
                  <div style={{
                    fontSize: "clamp(4rem, 20vw, 6.5rem)",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.15)",
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    marginBottom: 32,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`}
                  </div>
                  {/* Status line */}
                  <p style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.62)",
                    letterSpacing: "-0.015em",
                    margin: "0 0 8px 0",
                  }}>
                    {t(locale, "iAmDone", "statusLine")}
                  </p>
                  {/* Partner progress — only when partner has started swiping */}
                  {partnerSwipeCount >= 1 && (
                    <p style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.28)",
                      margin: "0 0 32px 0",
                    }}>
                      {t(locale, "iAmDone", "partnerProgress").replace("{count}", String(partnerSwipeCount))}
                    </p>
                  )}
                  {/* Rotating fun fact — key forces remount for animation */}
                  <p
                    key={waitingFactIndex}
                    className="wf-fact"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.27)",
                      letterSpacing: "-0.005em",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {getMessages(locale, "waitingAfterDone")[waitingFactIndex % getMessages(locale, "waitingAfterDone").length]}
                  </p>
                </div>
              </div>
            )}

            {/* ── SWIPING PHASE — centered card layout ── */}
            {roundPhase === "swiping" && !deckExhausted && !iAmDone && (
              <div className="flex-1 flex flex-col" style={{ paddingTop: "2px" }}>

                {/* Top row: Runde label */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div style={{ width: 40 }} /> {/* spacer for balance */}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
                    {round === 1 ? t(locale, "together", "round1") : t(locale, "together", "round2")}
                  </span>
                </div>

                {/* Card area — centered */}
                <div className="flex-1 flex items-center justify-center px-5" style={{ minHeight: 0 }}>
                  {top && (
                    <div
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "320px",
                        aspectRatio: "2/3",
                        borderRadius: "18px",
                        overflow: "hidden",
                        touchAction: isDesktop ? "auto" : "none",
                        cursor: isDesktop ? "default" : swipe.dragging ? "grabbing" : "grab",
                        transform: `translate3d(${fly.active ? fly.x : swipe.x}px, 0px, 0) rotate(${fly.active ? fly.rot : swipe.rot}deg)`,
                        transition: swipe.dragging ? "none" : fly.active ? "transform 200ms cubic-bezier(.2,.9,.2,1)" : "transform 220ms cubic-bezier(.2,.9,.2,1)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                    >
                      {/* Poster background */}
                      <div className="absolute inset-0" style={{ background: getGenreColor(top.genre_ids) }} />
                      {top.poster_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w500${top.poster_path}`}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}

                      {/* Bottom gradient for text */}
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to bottom, transparent 48%, rgba(0,0,0,0.65) 72%, rgba(0,0,0,0.92) 100%)" }}
                      />

                      {/* Card text */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
                        <div
                          className="font-bold text-white leading-tight"
                          style={{ fontSize: "1.15rem" }}
                        >
                          {top.title}{top.year ? ` \u2022 ${top.year}` : ""}
                        </div>
                        {(top.reason || top.overview) && (
                          <div
                            className="mt-1 line-clamp-1"
                            style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.4 }}
                          >
                            {top.reason || top.overview}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom action buttons */}
                <div className="flex items-center justify-center gap-5 py-7">
                  {/* Thumbs down */}
                  <button
                    onClick={() => endSwipe("nope")}
                    style={{ ...btnBase, width: 52, height: 52, fontSize: "1.25rem" }}
                    aria-label="Nei"
                  >
                    👎
                  </button>

                  {/* Star — slightly smaller */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <button
                      onClick={handleSuperLike}
                      disabled={superLikesUsed >= SUPERLIKES_PER_ROUND}
                      style={{
                        ...btnBase,
                        width: 48,
                        height: 48,
                        fontSize: "1.15rem",
                        opacity: superLikesUsed >= SUPERLIKES_PER_ROUND ? 0.22 : 1,
                        background: superLikesUsed >= SUPERLIKES_PER_ROUND ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${superLikesUsed >= SUPERLIKES_PER_ROUND ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
                      }}
                      aria-label="Super-like"
                    >
                      ⭐
                    </button>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", lineHeight: 1 }}>
                      {SUPERLIKES_PER_ROUND - superLikesUsed}
                    </span>
                  </div>

                  {/* Thumbs up */}
                  <button
                    onClick={() => endSwipe("like")}
                    style={{ ...btnBase, width: 52, height: 52, fontSize: "1.25rem" }}
                    aria-label="Ja"
                  >
                    👍
                  </button>
                </div>

                {/* Desktop arrow hint */}
                {isDesktop && (
                  <div className="flex justify-center pb-4">
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{t(locale, "together", "desktopHint")}</span>
                  </div>
                )}

              </div>
            )}

            {/* Deck exhausted during swiping */}
            {roundPhase === "swiping" && deckExhausted && !iAmDone && (
              <div className="fixed inset-0 z-30 flex flex-col items-center justify-center" style={{ background: "#0c0a09" }}>
                {deckExtending ? (
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${RED} transparent ${RED} ${RED}` }} />
                ) : (
                  <>
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{t(locale, "exhausted", "message")}</p>
                    <button onClick={reset} className="text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: RED }}>{t(locale, "exhausted", "retry")}</button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── RITUAL START OVERLAY ── */}
        {ritualState !== "idle" && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "all",
              background: "rgba(0,0,0,0.06)",
              opacity: ritualState === "done" ? 0 : 1,
              transition: "opacity 300ms ease-out",
            }}
            onTouchStart={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
          >
            {/* Faint red ambient glow */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(255,42,42,0.10) 0%, transparent 60%)",
              pointerEvents: "none",
            }} />

            {/* Countdown block */}
            {(ritualState === "countdown" || ritualState === "done") && (
              <div style={{
                position: "relative",
                textAlign: "center",
                opacity: ritualState === "done" ? 0 : 1,
                transition: "opacity 300ms ease-out",
              }}>
                {/* Large text — cross-dissolve between 3:00 / Ready? / Go. */}
                <div style={{ position: "relative", height: 60, marginBottom: 16 }}>
                  {([t(locale, "ritual", "timer"), t(locale, "ritual", "ready"), t(locale, "ritual", "go")] as string[]).map((text, idx) => (
                    <div
                      key={text}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "clamp(44px, 12vw, 52px)",
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.92)",
                        letterSpacing: "-0.03em",
                        opacity: ritualPhase === idx ? 1 : 0,
                        transition: "opacity 150ms ease",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                    >
                      {text}
                    </div>
                  ))}
                </div>

                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.78)",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.01em",
                }}>
                  {t(locale, "ritual", "subtitle1")}
                </p>
                <p style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.60)",
                  margin: 0,
                  letterSpacing: "-0.005em",
                }}>
                  {t(locale, "ritual", "subtitle2")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile link — goes to /home if logged in, /login otherwise */}
        <button
          onClick={() => router.push(authUser ? "/home" : "/login")}
          className="fixed bottom-4 right-4 z-60 select-none cursor-pointer"
          style={{ background: "transparent", border: "none", padding: 0 }}
          aria-label={authUser ? t(locale, "global", "myProfile") : t(locale, "global", "login")}
        >
          {authUser ? (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              {(authUser.email ?? "?")[0].toUpperCase()}
            </div>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.15)",
                padding: "6px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {t(locale, "global", "login")}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
