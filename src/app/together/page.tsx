"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logTitle } from "@/lib/api";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { getMessages } from "./messages";
import { t, cardsLeft, type Locale } from "./strings";
import { useLocale } from "@/hooks/useLocale";
import useQrCode from "./hooks/useQrCode";
import { track } from "@/lib/posthog";
/* ── extracted modules ─────────────────────────────────── */

import {
  RED, TITLES_CACHE_KEY, ROUND1_LIMIT, ROUND2_LIMIT,
  ROUND1_DURATION, ROUND2_DURATION, SUPERLIKES_PER_ROUND,
  RIBBON_COLORS, VIAPLAY_REGIONS, NORDIC_ONLY_PROVIDERS,
  US_ONLY_PROVIDERS, PROVIDERS,
} from "./lib/constants";
import type {
  WTTitle, Screen, SwipeAction, Mode, RoundPhase,
  RitualState, RoundMatch,
} from "./lib/constants";
import {
  getGenreColor, getGenreName, generateMockPartner,
  readTitlesCache, clamp, saveGuestLike, buildGuestParams,
  getProviderUrl, getWatchInfo, fetchActualProviders,
} from "./lib/utils";
import useSwipeQueue from "./hooks/useSwipeQueue";
import useCountdown from "./hooks/useCountdown";
import useRibbon from "./hooks/useRibbon";
import useKeyboardSwipe from "./hooks/useKeyboardSwipe";
import useMatchReveal from "./hooks/useMatchReveal";

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
  const { timer, timerRunning, timerRef, setTimer, setTimerRunning } = useCountdown();

  const [deck, setDeck] = useState<WTTitle[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [deckExtending, setDeckExtending] = useState(false);

  const [chosen, setChosen] = useState<WTTitle | null>(null); // paired polling compat
  const [mounted, setMounted] = useState(false);
  const { ribbonPosters, userRegion } = useRibbon();
  const [preferenceMode, setPreferenceMode] = useState<"series" | "movies" | "mix">("series");
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const locale = useLocale() as Locale;
  const introChoice = "paired"; // default mode for tracking
  const [introFading, setIntroFading] = useState(false);
  const [ritualState, setRitualState] = useState<RitualState>("idle");
  const [ritualPhase, setRitualPhase] = useState<0 | 1 | 2>(0);
  const ritualTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [mode, setMode] = useState<Mode>("solo");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [refMatchTitle, setRefMatchTitle] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [partnerSwipeCount, setPartnerSwipeCount] = useState(0);
  const [sessionError, setSessionError] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  // Round engine
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("swiping");
  const [round, setRound] = useState<1 | 2>(1);
  const [roundMatches, setRoundMatches] = useState<RoundMatch[]>([]);
  const [compromiseTitle, setCompromiseTitle] = useState<WTTitle | null>(null);
  const [isFallbackCompromise, setIsFallbackCompromise] = useState(false);
  const [finalWinner, setFinalWinner] = useState<WTTitle | null>(null);
  const [winnerProviderIds, setWinnerProviderIds] = useState<number[]>([]);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [watchlistAdded, setWatchlistAdded] = useState(false);
  const [watchedLogged, setWatchedLogged] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [matchMoreOpen, setMatchMoreOpen] = useState(false);
  const [streakData, setStreakData] = useState<{ current_streak: number; streak_at_risk: boolean; unlocked_rewards: Array<{ key: string; slug: string }> } | null>(null);
  const [frozenStreak, setFrozenStreak] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [superLikesUsed, setSuperLikesUsed] = useState(0);
  const [iAmDone, setIAmDone] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [lastSwipedTitle, setLastSwipedTitle] = useState<{ title: WTTitle; index: number; action: SwipeAction } | null>(null);
  const [undoUsedThisRound, setUndoUsedThisRound] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showGuestSignup, setShowGuestSignup] = useState(false);
  const [waitingFactIndex, setWaitingFactIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [showSuperLikeFlash, setShowSuperLikeFlash] = useState(false);
  const superLikeFlashTimeoutRef = useRef<number | null>(null);
  useEffect(() => () => { if (superLikeFlashTimeoutRef.current) clearTimeout(superLikeFlashTimeoutRef.current); }, []);
  const [excludeToast, setExcludeToast] = useState(false);
  const excludeToastRef = useRef<number | null>(null);
  useEffect(() => () => { if (excludeToastRef.current) clearTimeout(excludeToastRef.current); }, []);

  const superLikedIdRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number>(0);
  const cardStartTime = useRef<number>(0);
  const swipeTimings = useRef<Record<number, number>>({});
  const sessionSwipes = useRef<Record<number, SwipeAction>>({});
  const endingRoundRef = useRef(false);  // prevents concurrent endRound execution
  // Monotonic guard: once a round's results are committed, no re-entry.
  // Reset to 0 in reset() and startFinalRound().
  const endedRoundRef = useRef(0);
  const iAmDoneRef = useRef(false);
  const roundRef = useRef<1 | 2>(1);
  const deckRef = useRef<WTTitle[]>([]);
  deckRef.current = deck;
  roundRef.current = round;
  const extendingRef = useRef(false);
  const partnerRef = useRef<{ liked: number[] } | null>(null);
  const savedSoloSwipes = useRef<Record<number, { type: "movie" | "tv"; action: SwipeAction }>>({});
  const guestIdRef = useRef<string>("");

  const [swipe, setSwipe] = useState<{ x: number; y: number; rot: number; dragging: boolean }>({ x: 0, y: 0, rot: 0, dragging: false });
  const [fly, setFly] = useState<{ active: boolean; x: number; y: number; rot: number }>({ active: false, x: 0, y: 0, rot: 0 });

  const [authUser, setAuthUser] = useState<{ email?: string } | null>(null);
  const firstSwipeTrackedRef = useRef(false);
  const ptr = useRef<{ id: number | null; sx: number; sy: number; target: HTMLElement | null }>({ id: null, sx: 0, sy: 0, target: null });

  // Swipe queue (offline-first reliability) — extracted hook
  const { enqueue: enqueueSwipe, queueStatus: swipeQueueStatus, swipeQueue, inFlight, queueWorkerRunning, forceRender: forceQueueRender } = useSwipeQueue({ sessionId, round, guestId: guestIdRef.current });
  const [syncingBeforeEnd, setSyncingBeforeEnd] = useState(false);

  const { isTouch } = useInputMode();
  const { qrDataUrl } = useQrCode(sessionCode || null);
  const { matchRevealPhase, resetReveal, warmAudio } = useMatchReveal(
    roundPhase === "winner",
    () => {
      if (finalWinner) {
        track("together_match_found", { mode, tmdb_id: finalWinner.tmdb_id, title: finalWinner.title, type: finalWinner.type, round });
        track("match_created", { session_id: sessionId, title_id: finalWinner.tmdb_id, match_type: "like_like" });
      }
      try { localStorage.removeItem("wt_session_resume"); } catch {}
    },
  );
  const isDesktop = mounted && !isTouch;
  const router = useRouter();

  /* ── post-match: signup prompt for guests, premium modal for logged-in ── */
  useEffect(() => {
    if (!finalWinner) return;
    try { if (localStorage.getItem("logflix_premium_modal_shown")) return; } catch {}
    if (!authUser) {
      // Guest → show signup prompt after 5 seconds
      try { if (localStorage.getItem("logflix_guest_signup_shown")) return; } catch {}
      const timer = setTimeout(() => {
        setShowGuestSignup(true);
        try { localStorage.setItem("logflix_guest_signup_shown", "1"); } catch {}
        track("guest_signup_prompt_shown", { tmdb_id: finalWinner.tmdb_id });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [finalWinner, authUser]);

  /* ── keyboard hint (desktop, first visit) ── */
  useEffect(() => {
    if (screen !== "together" || roundPhase !== "swiping" || !isDesktop) return;
    try { if (localStorage.getItem("wt_keyboard_hint_shown")) return; } catch {}
    setShowKeyboardHint(true);
    localStorage.setItem("wt_keyboard_hint_shown", "1");
    const t = setTimeout(() => setShowKeyboardHint(false), 5000);
    return () => clearTimeout(t);
  }, [screen, roundPhase, isDesktop]);

  /* ── mount ── */
  useEffect(() => {
    setMounted(true);
    track("together_viewed", { mode: introChoice, is_guest: !authUser });
    try {
      const saved = localStorage.getItem("ss_pref_mode");
      if (saved === "series" || saved === "movies" || saved === "mix") {
        setPreferenceMode(saved as "series" | "movies" | "mix");
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
      // Check if user has seen swipe hint this session
      const hasSeenHint = sessionStorage.getItem("wt_seen_swipe_hint");
      if (!hasSeenHint) {
        setShowSwipeHint(true);
      }
    } catch { /* ignore */ }
    createSupabaseBrowser().auth.getSession()
      .then(({ data }) => {
        setAuthUser(data.session?.user ?? null);
      })
      .catch(() => {});

    // Resume saved duo session (if any)
    let resuming = false;
    try {
      const resumeRaw = localStorage.getItem("wt_session_resume");
      if (resumeRaw) {
        const resume = JSON.parse(resumeRaw);
        const TWO_HOURS = 2 * 60 * 60 * 1000;
        if (resume.sessionId && resume.ts && Date.now() - resume.ts < TWO_HOURS) {
          const cachedTitles = readTitlesCache();
          if (cachedTitles.length > 0) {
            resuming = true;
            fetch(`/api/together/session?id=${resume.sessionId}`, {
              headers: { "X-WT-Guest-ID": guestIdRef.current },
            })
              .then((r) => r.ok ? r.json() : null)
              .then((data) => {
                if (!data?.session) { localStorage.removeItem("wt_session_resume"); return; }
                const s = data.session;
                if (s.status === "completed" || s.status === "cancelled") {
                  localStorage.removeItem("wt_session_resume");
                  return;
                }
                setSessionId(resume.sessionId);
                endedRoundRef.current = 0; endingRoundRef.current = false;
                setMode("paired");
                setTitles(cachedTitles);
                setDeck([...cachedTitles]);
                setDeckIndex(0);
                if (s.partner_joined) {
                  setScreen("together");
                  setTimer(ROUND1_DURATION);
                  setTimerRunning(true);
                } else {
                  setSessionCode(s.code);
                  setScreen("waiting");
                }
              })
              .catch(() => { localStorage.removeItem("wt_session_resume"); });
          } else {
            localStorage.removeItem("wt_session_resume");
          }
        } else {
          localStorage.removeItem("wt_session_resume");
        }
      }
    } catch { /* ignore */ }

    if (!resuming) {
      // ?code= → auto-join
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      if (codeParam) {
        setJoinCode(codeParam.toUpperCase());
        setScreen("join");
        window.setTimeout(() => joinSession(codeParam.toUpperCase()), 50);
      }
      // ?ref=match&title=X → personalisert intro-banner
      if (urlParams.get("ref") === "match" && urlParams.get("title")) {
        setRefMatchTitle(decodeURIComponent(urlParams.get("title")!));
      }
      // DEBUG: ?winner=1 → dev only
      if (process.env.NODE_ENV === "development" && urlParams.get("winner") === "1") {
        setFinalWinner({ tmdb_id: 550, title: "Fight Club", year: 1999, type: "movie", genre_ids: [18, 53], overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", vote_average: 8.4 });
        setScreen("together");
        setRoundPhase("winner");
      }
    }
  }, []);

  /* ── ritual timer cleanup ── */
  useEffect(() => {
    return () => { ritualTimers.current.forEach(clearTimeout); };
  }, []);

  /* locale now comes from useLocale() — no sync needed */

  /* ── card timing ── */
  useEffect(() => {
    if (screen === "together" && roundPhase === "swiping") {
      cardStartTime.current = Date.now();
    }
  }, [deckIndex, screen, roundPhase]);

  /* ── fetch actual providers for match title ── */
  useEffect(() => {
    if (!finalWinner) { setWinnerProviderIds([]); return; }
    fetchActualProviders(finalWinner.tmdb_id, finalWinner.type)
      .then(setWinnerProviderIds);
  }, [finalWinner]);

  /* ── hide swipe hint after first swipe ── */
  useEffect(() => {
    if (showSwipeHint && deckIndex > 0) {
      try {
        sessionStorage.setItem("wt_seen_swipe_hint", "1");
      } catch { /* ignore */ }
      setShowSwipeHint(false);
    }
  }, [deckIndex, showSwipeHint]);

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
    if (selectedMood) extendParams.set("mood", selectedMood);
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
    if (endedRoundRef.current >= r) return;  // round already finished
    if (endingRoundRef.current) return;      // another call is in-flight
    endingRoundRef.current = true;

    // Wait for round-specific swipes in queue (max 3s)
    const roundSwipesPending = () =>
      swipeQueue.current.some(
        (s) => s.round === round && s.status !== "ack"
      );

    if (roundSwipesPending()) {
      setSyncingBeforeEnd(true);
      const deadline = Date.now() + 3000;
      await new Promise<void>((resolve) => {
        const check = () => {
          if (!roundSwipesPending() || Date.now() >= deadline) {
            resolve();
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      });
      setSyncingBeforeEnd(false);
    }

    // Extra pause to let partner's last swipe land on server
    await new Promise((resolve) => setTimeout(resolve, 1500));

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
          endingRoundRef.current = false;
          return;
        }

        // Server already has a match — show it directly (avoids race condition).
        if (data.session.match_tmdb_id) {
          const mt = deckRef.current.find((t) => t.tmdb_id === data.session.match_tmdb_id);
          if (mt) {
            setTimerRunning(false);
            setFinalWinner(mt);
            setRoundPhase("winner");
            endedRoundRef.current = r;
            endingRoundRef.current = false;
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
          endingRoundRef.current = false;
          return;
        }
      } catch {
        // Network error — stay in waiting overlay, do not fall through to results.
        endingRoundRef.current = false;
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
        endedRoundRef.current = r;
        endingRoundRef.current = false;
        setRoundPhase("results");
      } else {
        // Smart compromise algorithm
        const allLikedIds = new Set([...myLikedIds, ...theirLikedIds]);
        let compromiseCandidate: WTTitle | null = null;

        if (allLikedIds.size > 0) {
          // Score each liked title
          const candidates = Array.from(allLikedIds)
            .map(id => {
              const title = d.find(t => t.tmdb_id === id);
              if (!title) return null;

              // Find position in deck (earlier = higher score)
              const deckIndex = d.findIndex(t => t.tmdb_id === id);
              const normalizedEarlyIndex = deckIndex >= 0 ? 1 - (deckIndex / d.length) : 0;

              // Normalize TMDB rating
              const tmdbRatingNormalized = (title.vote_average ?? 5) / 10;

              // Calculate weighted score
              const score = (normalizedEarlyIndex * 0.6) + (tmdbRatingNormalized * 0.4);

              return { title, score };
            })
            .filter((x): x is { title: WTTitle; score: number } => x !== null);

          // Select highest scoring title
          candidates.sort((a, b) => b.score - a.score);
          compromiseCandidate = candidates[0]?.title ?? null;
          setIsFallbackCompromise(false);
        }

        // Fallback: both swiped left on everything
        if (!compromiseCandidate) {
          const fallback = [...d].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
          compromiseCandidate = fallback[0] ?? null;
          setIsFallbackCompromise(true);
        }

        setCompromiseTitle(compromiseCandidate);
        if (mode === "paired" && !partnerIsDone) return;
        endedRoundRef.current = r;
        endingRoundRef.current = false;
        setRoundPhase("no-match");
        track("together_no_match", { mode, round: r });
      }
    } else {
      const candidates = mutualIds.length > 0 ? mutualIds : myLikedIds.length > 0 ? myLikedIds : theirLikedIds;
      const sorted = [...candidates].sort((a, b) => (swipeTimings.current[a] ?? Infinity) - (swipeTimings.current[b] ?? Infinity));
      const wid = sorted[0] ?? d[0]?.tmdb_id;
      setFinalWinner(wid != null ? d.find((t) => t.tmdb_id === wid) ?? d[0] ?? null : d[0] ?? null);
      if (mode === "paired" && !partnerIsDone) return;
      endedRoundRef.current = r;
      endingRoundRef.current = false;
      setRoundPhase("winner");
    }
  }

  function startFinalRound() {
    endedRoundRef.current = 0;
    endingRoundRef.current = false;
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
    endRound(roundRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  /* ── deckIndex passes limit OR deck exhausted → end round ── */
  useEffect(() => {
    if (screen !== "together" || roundPhase !== "swiping" || !!chosen) return;
    if (iAmDoneRef.current) return; // Already in waiting state — don't re-trigger

    // If we run out of cards before hitting the limit, end the round anyway.
    if (deck.length > 0 && deckIndex >= deck.length) {
      endRound(roundRef.current);
      return;
    }

    const r = roundRef.current;
    if (r === 1 && deckIndex >= ROUND1_LIMIT) endRound(1);
    if (r === 2 && deckIndex >= ROUND1_LIMIT + ROUND2_LIMIT) endRound(2);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckIndex]);

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
    if (screen === "waiting") {
      setWaitingFactIndex(0);
      track("invite_share_opened", { session_id: sessionId });
    }
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
      if (selectedMood) params.set("mood", selectedMood);
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
    sessionStartTime.current = Date.now();
    firstSwipeTrackedRef.current = false;
    track("together_session_started", { mode: "solo", locale });
    try { localStorage.setItem("ss_last_play_date", new Date().toISOString().slice(0, 10)); } catch { /* ignore */ }
    setTimer(ROUND1_DURATION);
    setTimerRunning(true);
    setChosen(null);
    setSuperLikesUsed(0);
    superLikedIdRef.current = null;
    swipeTimings.current = {};
    sessionSwipes.current = {};
    endedRoundRef.current = 0;
    endingRoundRef.current = false;
    setRound(1);
    setRoundPhase("swiping");
    setRoundMatches([]);
    setCompromiseTitle(null);
    setIsFallbackCompromise(false);
    setFinalWinner(null);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });
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
    endedRoundRef.current = 0;
    endingRoundRef.current = false;
    iAmDoneRef.current = false;
    firstSwipeTrackedRef.current = false;
    setIAmDone(false);
    setWaitingFactIndex(0);
    setRound(1);
    setRoundPhase("swiping");
    setRoundMatches([]);
    setCompromiseTitle(null);
    setIsFallbackCompromise(false);
    setFinalWinner(null);
    setMatchMoreOpen(false);
    setLastSwipedTitle(null);
    setUndoUsedThisRound(false);
    setTimerPaused(false);
    setWatchlistAdded(false);
    setWatchedLogged(false);
    resetReveal();
    setMode("solo");
    setSessionId(null);
    setSessionCode("");
    setJoinCode("");
    setPartnerJoined(false);
    setPartnerSwipeCount(0);
    setSessionError("");
    partnerRef.current = null;
    setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
    setFly({ active: false, x: 0, y: 0, rot: 0 });
    swipeQueue.current = [];
    inFlight.current = new Set();
    queueWorkerRunning.current = false;
    setSyncingBeforeEnd(false);
    forceQueueRender((x) => x + 1);
    try { localStorage.removeItem("wt_session_resume"); } catch {}
  }

  async function handleShare(titleName: string) {
    const fw = finalWinner;
    const shareUrl = fw
      ? `https://logflix.app/together?ref=match&title=${encodeURIComponent(fw.title)}&utm_source=share&utm_medium=together&utm_campaign=match`
      : "https://logflix.app/together";

    // Set og:image meta tag to the match card before sharing
    if (fw) {
      const ogImageUrl = `https://logflix.app/api/og/match?title=${encodeURIComponent(fw.title)}&poster=${encodeURIComponent(fw.poster_path || "")}&type=${fw.type || "movie"}&locale=${locale}`;
      const existingMeta = document.querySelector('meta[property="og:image"]');
      if (existingMeta) {
        existingMeta.setAttribute("content", ogImageUrl);
      } else {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:image");
        meta.setAttribute("content", ogImageUrl);
        document.head.appendChild(meta);
      }
    }

    const shareTexts: Record<string, string> = {
      no: `Vi ble enige om ${titleName} på under 3 min 🎬 Prøv selv:`,
      en: `We agreed on ${titleName} in under 3 min 🎬 Try it:`,
      dk: `Vi blev enige om ${titleName} på under 3 min 🎬 Prøv selv:`,
      se: `Vi kom överens om ${titleName} på under 3 min 🎬 Prova själv:`,
      fi: `Löysimme yhteisen elokuvan ${titleName} alle 3 min 🎬 Kokeile:`,
    };
    const shareText = shareTexts[locale] ?? shareTexts.en;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: titleName, text: shareText, url: shareUrl }); track("match_shared", { session_id: sessionId, tmdb_id: fw?.tmdb_id, method: "native_share" }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2000);
        track("match_shared", { session_id: sessionId, tmdb_id: fw?.tmdb_id, method: "copy" });
      } catch { /* ignore */ }
    }
  }

  async function handleShareStory() {
    if (!finalWinner) return;
    try {
      // Build time string from session start
      const elapsed = sessionStartTime.current > 0 ? Math.round((Date.now() - sessionStartTime.current) / 1000) : 0;
      const timeStr = elapsed > 0 && elapsed < 600 ? (elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`) : "";

      // Build names from auth user email prefix
      const userName = authUser?.email?.split("@")[0] || "";

      const params = new URLSearchParams({
        title: finalWinner.title,
        poster: finalWinner.poster_path || "",
        locale,
      });
      if (userName) params.set("names", userName);
      if (timeStr) params.set("time", timeStr);

      const res = await fetch(`/api/og/match-share?${params}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const file = new File([blob], "logflix-match.png", { type: "image/png" });
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: finalWinner.title });
        track("match_story_shared", { session_id: sessionId, tmdb_id: finalWinner.tmdb_id, method: "native_share", has_names: !!userName, has_time: !!timeStr });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "logflix-match.png";
        a.click();
        URL.revokeObjectURL(url);
        track("match_story_shared", { session_id: sessionId, tmdb_id: finalWinner.tmdb_id, method: "download", has_names: !!userName, has_time: !!timeStr });
      }
    } catch { /* ignore */ }
  }

  async function handleAddWatchlist() {
    if (!finalWinner || !authUser || watchlistAdded || watchlistLoading) return;
    setWatchlistLoading(true);
    try {
      await logTitle({ tmdb_id: finalWinner.tmdb_id, type: finalWinner.type, status: "watchlist" });
      setWatchlistAdded(true);
      track("match_watchlist_added", { tmdb_id: finalWinner.tmdb_id });
    } catch { /* silent */ }
    setWatchlistLoading(false);
  }

  async function handleMarkWatched() {
    if (!finalWinner || !authUser || watchedLogged || watchedLoading) return;
    setWatchedLoading(true);
    try {
      await logTitle({ tmdb_id: finalWinner.tmdb_id, type: finalWinner.type, status: "watched", sentiment: "liked" });
      setWatchedLogged(true);
      track("match_marked_watched", { tmdb_id: finalWinner.tmdb_id });
    } catch { /* silent */ }
    setWatchedLoading(false);
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
    // Warm up AudioContext on first user gesture (Safari requires this)
    warmAudio();
    if (!firstSwipeTrackedRef.current) {
      firstSwipeTrackedRef.current = true;
      track("swipe_started", { session_id: sessionId, is_guest: !authUser });
    }
    if (!(t.tmdb_id in swipeTimings.current)) {
      swipeTimings.current[t.tmdb_id] = Date.now() - cardStartTime.current;
    }
    sessionSwipes.current[t.tmdb_id] = action;
    setLastSwipedTitle({ title: t, index: deckIndex, action });
    if (mode === "paired") {
      enqueueSwipe(t.tmdb_id, t.type, action === "meh" ? "nope" : action);
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
    // Flash overlay
    if (superLikeFlashTimeoutRef.current) clearTimeout(superLikeFlashTimeoutRef.current);
    setShowSuperLikeFlash(true);
    superLikeFlashTimeoutRef.current = window.setTimeout(() => {
      setShowSuperLikeFlash(false);
      superLikeFlashTimeoutRef.current = null;
    }, 400);
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
      // Queue the superlike — doubleSuperMatch is detected via poll or endRound
      enqueueSwipe(t.tmdb_id, t.type, "superlike");
      setDeckIndex((i) => i + 1);
    }
  }

  /* ── exclude ("Ikke for oss") ── */
  function handleExclude() {
    const card = deck[deckIndex];
    if (!card || !authUser) return;
    fetch("/api/together/exclude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdb_id: card.tmdb_id, media_type: card.type }),
    }).catch(() => {});
    if (excludeToastRef.current) clearTimeout(excludeToastRef.current);
    setExcludeToast(true);
    excludeToastRef.current = window.setTimeout(() => { setExcludeToast(false); excludeToastRef.current = null; }, 1800);
    endSwipe("nope");
  }

  /* ── keyboard (desktop) ── */
  const kbEnabled = mounted && screen === "together" && roundPhase === "swiping" && !chosen && isDesktop && !!deckRef.current[deckIndex];
  useKeyboardSwipe(
    kbEnabled,
    () => { const top = deckRef.current[deckIndex]; if (top) commitChoice(top, "nope"); },
    () => { const top = deckRef.current[deckIndex]; if (top) commitChoice(top, "like"); },
    handleSuperLike,
  );

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
    const dy = e.clientY - ptr.current.sy;
    setSwipe({ x: dx, y: dy, rot: clamp(dx / 18, -14, 14), dragging: true });
  }

  function endSwipe(action?: SwipeAction) {
    const top = deck[deckIndex];
    if (!top) return;

    // Check for superlike via upward drag (not a SwipeAction — handled separately)
    if (!action && swipe.y < -80 && Math.abs(swipe.y) > Math.abs(swipe.x) && superLikesUsed < SUPERLIKES_PER_ROUND) {
      setFly({ active: true, x: 0, y: -window.innerHeight, rot: 0 });
      window.setTimeout(() => {
        setFly({ active: false, x: 0, y: 0, rot: 0 });
        setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
        handleSuperLike();
      }, 200);
      return;
    }

    let decided: SwipeAction | null = action || null;
    if (!decided) {
      if (swipe.x > 100) decided = "like";
      else if (swipe.x < -100) decided = "nope";
    }
    if (!decided) { setSwipe({ x: 0, y: 0, rot: 0, dragging: false }); return; }
    const outX = decided === "like" ? window.innerWidth * 1.1 : -window.innerWidth * 1.1;
    setFly({ active: true, x: outX, y: 0, rot: decided === "like" ? 20 : -20 });
    window.setTimeout(() => {
      setFly({ active: false, x: 0, y: 0, rot: 0 });
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
      const res = await fetch("/api/together/session", { method: "POST", headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current }, body: JSON.stringify({ providerIds: selectedProviders, region: userRegion, preference: preferenceMode, ...(selectedMood ? { mood: selectedMood } : {}) }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setSessionCode(data.session.code);
      setTitles(data.session.titles);
      try { localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify({ titles: data.session.titles, mood: "", ts: Date.now() })); } catch { /* ignore */ }
      try { localStorage.setItem("wt_session_resume", JSON.stringify({ sessionId: data.session.id, sessionCode: data.session.code, ts: Date.now() })); } catch {}
      endedRoundRef.current = 0; endingRoundRef.current = false;
      firstSwipeTrackedRef.current = false;
      setMode("paired"); setScreen("waiting");
      track("together_session_started", { mode: "duo", locale });
      track("duo_session_started", { session_id: data.session.id, provider_count: selectedProviders.length });
    } catch (e: unknown) {
      setSessionError(e instanceof Error ? e.message : "Kunne ikke opprette runde");
    }
    setTitlesLoading(false);
  }

  /* ── solo → duo: invite partner mid-swipe ── */
  async function handleInviteMidSolo() {
    if (mode !== "solo" || titlesLoading) return;
    setTimerRunning(false);
    // Snapshot current solo swipes with type info
    const snap: Record<number, { type: "movie" | "tv"; action: SwipeAction }> = {};
    for (const [id, action] of Object.entries(sessionSwipes.current)) {
      const t = deck.find((d) => d.tmdb_id === Number(id));
      if (t) snap[Number(id)] = { type: t.type, action };
    }
    savedSoloSwipes.current = snap;
    track("solo_to_duo_invite", { swipes_saved: Object.keys(snap).length, locale });
    await createSession();
  }

  /* ── paired: join session ── */
  async function joinSession(codeOverride?: string) {
    const code = (codeOverride ?? joinCode).trim();
    if (!code) return;
    setSessionError(""); setTitlesLoading(true);
    try {
      const res = await fetch("/api/together/session/join", { method: "POST", headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSessionId(data.session.id);
      setTitles(data.session.titles);
      setDeck([...data.session.titles]);
      setDeckIndex(0);
      try { localStorage.setItem(TITLES_CACHE_KEY, JSON.stringify({ titles: data.session.titles, mood: "", ts: Date.now() })); } catch {}
      try { localStorage.setItem("wt_session_resume", JSON.stringify({ sessionId: data.session.id, ts: Date.now() })); } catch {}
      endedRoundRef.current = 0; endingRoundRef.current = false;
      setMode("paired"); setScreen("together"); sessionStartTime.current = Date.now();
      setTimer(ROUND1_DURATION); setTimerRunning(true);
      setChosen(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "SESSION_EXPIRED") {
        const expired: Record<string, string> = {
          no: "Koden er utløpt — be om en ny",
          en: "This code has expired — ask for a new one",
          se: "Koden har gått ut — be om en ny",
          dk: "Koden er udløbet — bed om en ny",
          fi: "Koodi on vanhentunut — pyydä uusi",
        };
        setSessionError(expired[locale] || expired.en);
      } else {
        setSessionError(msg || "Kunne ikke bli med");
      }
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
          track("partner_joined", { session_id: sessionId, is_guest: !authUser });
          if (screen === "waiting") {
            const newDeck = [...titles];
            setDeck(newDeck);
            // Replay saved solo swipes into the new paired session
            const saved = savedSoloSwipes.current;
            const savedIds = Object.keys(saved).map(Number);
            if (savedIds.length > 0) {
              let skipCount = 0;
              for (const t of newDeck) {
                const s = saved[t.tmdb_id];
                if (!s) break; // stop at first un-swiped title
                const apiAction = s.action === "meh" ? "nope" : s.action;
                enqueueSwipe(t.tmdb_id, t.type, apiAction as "like" | "nope" | "superlike");
                sessionSwipes.current[t.tmdb_id] = s.action;
                skipCount++;
              }
              setDeckIndex(skipCount);
              track("solo_swipes_replayed", { replayed: skipCount, saved: savedIds.length });
              savedSoloSwipes.current = {};
            } else {
              setDeckIndex(0);
            }
            setScreen("together"); sessionStartTime.current = Date.now(); setTimer(ROUND1_DURATION); setTimerRunning(true);
          }
        }
        const partnerSwiped = Object.keys(data.session.partner_swipes || {}).length;
        setPartnerSwipeCount(partnerSwiped);

        // If we're in the iAmDone overlay and partner has now finished, trigger results.
        if (iAmDoneRef.current && !endingRoundRef.current) {
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
              setFinalWinner(myTitle); setRoundPhase("double-super"); setTimerRunning(false); track("match_created", { session_id: sessionId, title_id: myId, match_type: "superlike" }); return;
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
    <div className="h-dvh overflow-hidden flex flex-col" style={{ background: "#0a0a0f" }}>
      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)", zIndex: 0 }}
      />

      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* GuestHeader removed — together has its own auth CTAs in match/results screens */}

        {/* ── INTRO ── */}
        {screen === "intro" && (
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
              position: "relative",
              opacity: introFading ? 0.88 : 1,
              filter: ritualState !== "idle" ? "blur(1px)" : "none",
              transition: introFading ? "opacity 220ms ease-out" : ritualState !== "idle" ? "filter 250ms ease-out" : "opacity 0ms",
            }}
          >
            {/* Back to home */}
            <button
              onClick={() => router.push("/home")}
              style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 22, cursor: "pointer", zIndex: 10, lineHeight: 1 }}
              aria-label="Back"
            >
              ←
            </button>

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
              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 16px rgba(255,42,42,0.22); }
                50% { box-shadow: 0 0 32px rgba(255,42,42,0.39); }
              }
              .cta-btn { transition: filter 180ms ease, transform 140ms ease, opacity 150ms, box-shadow 180ms ease; animation: pulse-glow 2s ease-in-out infinite; }
              .cta-btn:hover:not(:disabled) { filter: brightness(1.08); transform: scale(1.03); box-shadow: 0 4px 30px rgba(255,42,42,0.5) !important; }
              .cta-btn:active:not(:disabled) { filter: brightness(0.96); }
              @media (min-width: 768px) {
                .intro-ribbon { height: 180px !important; clip-path: ellipse(70% 100% at 50% 0%); }
                .intro-ribbon img { height: 160px !important; }
                .intro-logo { height: 51px !important; }
                .intro-headline { font-size: 3rem !important; }
                .intro-content { max-width: 600px !important; margin-top: -20px !important; }
                .intro-card { min-height: 160px !important; }
                .intro-card-icon { height: 56px !important; }
                .intro-card-label { font-size: 1.1rem !important; }
                .intro-cta .cta-btn { font-size: 1.1rem !important; max-width: 480px !important; margin-left: auto !important; margin-right: auto !important; display: block !important; }
              }
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
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 0, flexShrink: 0, position: "relative", zIndex: 1 }}>
              <img
                src="/logo.png"
                alt="Logflix"
                className="intro-logo"
                style={{ height: 51, width: "auto", opacity: 0.85 }}
              />
            </div>

            {/* ── Trending poster strip — flat horizontal scroll ── */}
            <div
              className="intro-ribbon"
              style={{
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                marginTop: 6,
                overflow: "hidden",
                height: 70,
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {ribbonPosters.length > 0 ? (
                <div
                  className="ribbon-track"
                  style={{ display: "flex", gap: 13, width: "max-content", paddingTop: 6, paddingBottom: 6, filter: "blur(1.5px) brightness(0.6)" }}
                >
                  {[...ribbonPosters, ...ribbonPosters].map((poster, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={`https://image.tmdb.org/t/p/w185${poster}`}
                      alt=""
                      style={{ height: 62, width: "auto", borderRadius: 10, opacity: 0.65, flexShrink: 0, display: "block", objectFit: "cover" }}
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
                      style={{ height: 62, width: 42, borderRadius: 10, background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`, opacity: 0.18, flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Hero block — flex-1, no scroll ── */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "18px 24px 4px", position: "relative", zIndex: 1, overflow: "hidden" }}>
            <div className="intro-content" style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>

              {/* Match referral banner */}
              {refMatchTitle && (
                <div style={{ background: "rgba(255,42,42,0.08)", border: "0.5px solid rgba(255,42,42,0.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, textAlign: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                    🎬 {locale === "no" ? `Noen matchet på ${refMatchTitle}!` : `Someone matched on ${refMatchTitle}!`}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>
                    {locale === "no" ? "Klarer dere å finne kveldens film raskere?" : "Can you find tonight's movie faster?"}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    {locale === "no" ? "Start Se Sammen under ↓" : "Start Watch Together below ↓"}
                  </p>
                </div>
              )}

              {/* Headline */}
              <h1 className="intro-headline" style={{
                fontSize: "clamp(1.7rem, 7.2vw, 2.3rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1.1,
                margin: "0 auto 4px",
                maxWidth: "85%",
              }}>
                {t(locale, "intro", "headline")}
              </h1>

              {/* Subtext */}
              <div style={{ marginBottom: "4px" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, margin: "0 auto", maxWidth: "20rem", textAlign: "center" }}>
                  {t(locale, "intro", "subtext")}
                </p>
              </div>

              {/* ── PRIMÆR: Duo CTA — stor rød knapp ── */}
              <button
                className="cta-btn button"
                onClick={() => {
                  if (titlesLoading || ritualState !== "idle") return;
                  startRitual(() => { setMode("paired"); setSelectedProviders([]); setScreen("providers"); });
                }}
                disabled={titlesLoading || ritualState !== "idle"}
                style={{
                  width: "100%",
                  marginTop: 4,
                  cursor: titlesLoading ? "default" : "pointer",
                  opacity: titlesLoading ? 0.55 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="28" height="20" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="6" r="3"/><path d="M12 21v-1.5a3.5 3.5 0 0 0-3.5-3.5h-3A3.5 3.5 0 0 0 2 19.5V21"/><line x1="16" y1="10" x2="16" y2="14"/><line x1="14" y1="12" x2="18" y2="12"/><circle cx="25" cy="6" r="3"/><path d="M30 21v-1.5a3.5 3.5 0 0 0-3.5-3.5h-3A3.5 3.5 0 0 0 20 19.5V21"/></svg>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span>{titlesLoading ? t(locale, "intro", "loading") : t(locale, "intro", "startSwiping")}</span>
                  <span style={{ fontSize: "0.6rem", fontWeight: 400, opacity: 0.6 }}>{t(locale, "intro", "swipeWithPartner")}</span>
                </span>
              </button>
              {!authUser && (
                <p className="text-xs text-white/60 text-center" style={{ margin: "4px 0 0" }}>
                  {t(locale, "intro", "noAccountNeeded")}
                </p>
              )}

              {/* ── eller ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 4px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>{t(locale, "intro", "or")}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* ── SEKUNDÆR: Solo — liten knapp ── */}
              <button
                onClick={() => {
                  if (titlesLoading || ritualState !== "idle") return;
                  startRitual(() => { setMode("solo"); setSelectedProviders([]); setScreen("providers"); });
                }}
                disabled={titlesLoading || ritualState !== "idle"}
                style={{
                  width: "100%",
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.50)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                {t(locale, "intro", "soloInviteHint")}
              </button>

              {/* ── TERTIÆR: Code + Group — side by side buttons ── */}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setScreen("join")}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.55)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
                  {t(locale, "intro", "hasCode")}
                </button>
                <button
                  onClick={() => router.push("/group")}
                  style={{
                    flex: 1,
                    position: "relative",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.55)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <svg width="28" height="20" viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="7" r="3"/><path d="M10 21v-1.5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3V21"/><circle cx="15" cy="7" r="3"/><path d="M19 21v-1.5a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3V21"/><circle cx="24" cy="7" r="3"/><path d="M28 21v-1.5a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3V21"/><line x1="33" y1="9" x2="33" y2="15"/><line x1="30" y1="12" x2="36" y2="12"/></svg>
                  <span>{t(locale, "intro", "groupLabel")}</span>
                  <span style={{
                    fontSize: "0.5rem", fontWeight: 600,
                    padding: "1px 4px", borderRadius: 3,
                    background: "rgba(74,222,128,0.15)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    color: "#4ade80",
                    letterSpacing: "0.04em",
                  }}>{t(locale, "intro", "soon")}</span>
                </button>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 24 }}>
                {locale === "no" ? "Hundrevis av par har allerede funnet noe å se sammen" : "Hundreds of couples have already found something to watch"}
              </p>
              {sessionError && <p style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, textAlign: "center" }}>{sessionError}</p>}


              {/* Couple streak */}
              {streakData && streakData.current_streak > 0 && (
                <div style={{ marginTop: 14, textAlign: "center" }}>
                  {streakData.streak_at_risk ? (
                    <p style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600 }}>
                      ⚠️ {t(locale, "streak", "atRisk")}
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                      🔥 {streakData.current_streak} {t(locale, "streak", "weeks")}
                    </p>
                  )}
                  {streakData.unlocked_rewards.length > 0 && (() => {
                    const best = streakData.unlocked_rewards[streakData.unlocked_rewards.length - 1];
                    const region = locale === "no" ? "no" : locale === "se" ? "se" : locale === "dk" ? "dk" : locale === "fi" ? "fi" : "no";
                    const label = best.key === "klassikere" ? t(locale, "streak", "rewardKlassikere")
                      : best.key === "skjulte-perler" ? t(locale, "streak", "rewardSkjultePerler")
                      : t(locale, "streak", "rewardHelgevalg");
                    return (
                      <Link href={`/${region}/guides/${best.slug}`} style={{ display: "block", fontSize: "0.65rem", color: "rgba(255,200,100,0.7)", marginTop: 4, textDecoration: "none" }}>
                        🎁 {streakData.current_streak} {t(locale, "streak", "weeks")} — {label} →
                      </Link>
                    );
                  })()}
                </div>
              )}
              {/* SEO crawlable links — visible only on intro screen */}
              <nav className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs text-white/25 mb-3">Find something to watch together</p>
                <p className="text-[11px] text-white/20 mb-3">Not sure what to watch? These guides help you decide fast.</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  <Link href="/en/what-to-watch-together" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">What to watch together</Link>
                  <Link href="/en/cant-decide-what-to-watch" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Can&apos;t decide what to watch?</Link>
                  <Link href="/en/what-to-watch-with-girlfriend" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">What to watch with girlfriend</Link>
                  <Link href="/en/find-something-to-watch-fast" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Find something fast</Link>
                  <Link href="/no/filmer-a-se-med-kjaeresten" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Filmer å se med kjæresten</Link>
                </div>
              </nav>

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
              {/* Pulsing red dot + polling status */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: RED,
                  marginBottom: 8, animation: "dot-pulse 1.5s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                  {locale === "no" ? "Venter på partner..." : locale === "se" ? "Väntar på partner..." : locale === "dk" ? "Venter på partner..." : locale === "fi" ? "Odotetaan kumppania..." : "Waiting for partner..."}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t(locale, "waiting", "headline")}</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>{t(locale, "waiting", "ingress")}</p>
              {qrDataUrl && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12 }}>
                  <img src={qrDataUrl} alt="QR-kode" style={{ width: 180, height: 180 }} />
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                    {t(locale, "waiting", "scanOrShare")}
                  </p>
                </div>
              )}
              <div
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer mb-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  animation: "code-glow 2s ease-in-out infinite alternate",
                }}
                onClick={() => { navigator.clipboard.writeText(sessionCode).catch(() => {}); track("invite_copy_link", { session_id: sessionId, method: "copy" }); }}
              >
                <span className="text-3xl font-mono font-black tracking-[0.3em] text-white">{sessionCode}</span>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.4)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </div>
              <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.25)" }}>{t(locale, "waiting", "copyHint")}</p>
              <button
                onClick={() => {
                  const shareUrl = `https://logflix.app/together?code=${sessionCode}`;
                  const shareText = t(locale, "waiting", "shareText");
                  if (navigator.share) {
                    navigator.share({ title: "Logflix", text: shareText, url: shareUrl })
                      .then(() => { track("invite_shared", { session_id: sessionId, method: "native_share" }); })
                      .catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setShareState("copied");
                      track("invite_shared", { session_id: sessionId, method: "copy" });
                      setTimeout(() => setShareState("idle"), 2000);
                    }).catch(() => {});
                  }
                }}
                className="w-full mt-4 py-3 px-4 rounded-xl text-white font-medium text-sm transition-colors cursor-pointer"
                style={{ background: shareState === "copied" ? "#3f3f46" : RED, border: "none", marginBottom: 16 }}
              >
                {shareState === "copied" ? t(locale, "waiting", "copied") : t(locale, "waiting", "sendInvite")}
              </button>
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
              <button
                onClick={() => {
                  const msg = locale === "no" ? "Duo-sesjonen avsluttes. Vil du fortsette alene?" : locale === "se" ? "Duo-sessionen avslutas. Vill du fortsätta ensam?" : locale === "dk" ? "Duo-sessionen afsluttes. Vil du fortsætte alene?" : locale === "fi" ? "Duo-istunto päättyy. Haluatko jatkaa yksin?" : "The duo session will end. Continue solo?";
                  if (!window.confirm(msg)) return;
                  setMode("solo");
                  setPartnerJoined(false);
                  setRoundPhase("swiping");
                  setScreen("together");
                  setTimerRunning(true);
                  partnerRef.current = generateMockPartner(titles);
                }}
                className="block mx-auto mt-4 text-sm text-white/40 underline bg-transparent border-0 cursor-pointer"
              >
                {t(locale, "waiting", "startSolo")}
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
                <div className="flex items-center gap-2">
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
                  {typeof navigator !== "undefined" && navigator.clipboard?.readText && (
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          const clean = text.trim().toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 6);
                          if (clean.length > 0) setJoinCode(clean);
                        } catch { /* permission denied or empty */ }
                      }}
                      className="px-3 py-3 rounded-xl text-xs font-medium cursor-pointer transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                    >
                      {locale === "no" ? "Lim inn" : locale === "se" ? "Klistra in" : locale === "dk" ? "Indsæt" : locale === "fi" ? "Liitä" : "Paste"}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => joinSession()}
                  disabled={joinCode.length < 6 || titlesLoading}
                  className="button"
                  style={{ width: "100%", maxWidth: 320, opacity: (joinCode.length < 6 || titlesLoading) ? 0.4 : 1 }}
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
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `@keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }` }} />
            {ribbonPosters.length > 0 && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
                  {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.10, filter: "blur(3px)", flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            )}
            <div style={{ width: "100%", maxWidth: 340, position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 6, textAlign: "center" }}>
                {t(locale, "providers", "headline")}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.42)", marginBottom: 20, textAlign: "center" }}>
                {t(locale, "providers", "ingress")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 24 }}>
                {PROVIDERS
                  .filter((p) => {
                    if (NORDIC_ONLY_PROVIDERS.has(p.id)) return VIAPLAY_REGIONS.has(userRegion);
                    if (US_ONLY_PROVIDERS.has(p.id)) return userRegion === "US";
                    return true;
                  })
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
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

              {/* Mood selector */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                  {t(locale, "mood", "headline")}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {([
                    { key: "light", emoji: "\uD83C\uDF1F" },
                    { key: "dark", emoji: "\uD83C\uDF11" },
                    { key: "thriller", emoji: "\uD83D\uDD2A" },
                    { key: "action", emoji: "\uD83D\uDCA5" },
                    { key: "romance", emoji: "\u2764\uFE0F" },
                    { key: "horror", emoji: "\uD83D\uDC7B" },
                  ] as const).map(({ key, emoji }) => {
                    const active = selectedMood === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedMood(active ? null : key)}
                        style={{
                          padding: "8px 4px",
                          borderRadius: 10,
                          border: active ? "1px solid rgba(255,42,42,0.4)" : "1px solid rgba(255,255,255,0.06)",
                          background: active ? "rgba(255,42,42,0.12)" : "rgba(255,255,255,0.03)",
                          color: active ? "#fff" : "rgba(255,255,255,0.55)",
                          fontSize: "0.7rem",
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 140ms ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>{emoji}</span>
                        {t(locale, "mood", key)}
                      </button>
                    );
                  })}
                </div>
                {selectedMood ? (
                  <button
                    onClick={() => setSelectedMood(null)}
                    style={{ marginTop: 6, fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
                  >
                    {t(locale, "mood", "noPreference")}
                  </button>
                ) : (
                  <p style={{ marginTop: 6, fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
                    {locale === "no" ? "Ingen valgt = alle stemninger" : locale === "se" ? "Inget valt = alla stämningar" : locale === "dk" ? "Intet valgt = alle stemninger" : locale === "fi" ? "Ei valintaa = kaikki tunnelmat" : "No selection = all moods"}
                  </p>
                )}
              </div>

              <button
                onClick={async () => {
                  if (titlesLoading) return;
                  if (mode === "solo") await goTogether();
                  else await createSession();
                }}
                disabled={titlesLoading}
                className="button"
                style={{
                  width: "100%",
                  opacity: titlesLoading ? 0.55 : 1,
                  cursor: titlesLoading ? "default" : "pointer",
                  marginBottom: 14,
                }}
              >
                {titlesLoading ? t(locale, "providers", "loading") : selectedProviders.length > 0 ? t(locale, "providers", "continueBtn") : t(locale, "providers", "seeAll")}
              </button>
              <button
                onClick={() => setScreen("intro")}
                style={{
                  width: "100%", padding: "8px 0", background: "none", border: "none",
                  color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
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


            {/* Swipe queue status indicator */}
            {swipeQueueStatus !== "idle" && (
              <div
                className="fixed top-4 right-4 z-50"
                aria-label={swipeQueueStatus === "stuck" ? t(locale, "together", "connectionWeak") : t(locale, "together", "sendingSwipes")}
              >
                <div className={`w-2 h-2 rounded-full ${
                  swipeQueueStatus === "stuck"
                    ? "bg-red-500"
                    : "bg-yellow-400 animate-pulse"
                }`} />
              </div>
            )}

            {/* Syncing overlay — shown while endRound waits for queue drain */}
            {syncingBeforeEnd && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <p className="text-white/80 text-sm">{t(locale, "together", "syncing")}</p>
              </div>
            )}

            {/* ── RESULT SCREENS (fullscreen overlays) ── */}

            {/* Dere valgte det samme */}
            {roundPhase === "double-super" && finalWinner && (
              <div className="fixed inset-0 z-30 flex flex-col justify-end px-6 pb-16">
                <div className="absolute inset-0" style={{ background: getGenreColor(finalWinner.genre_ids) }} />
                {finalWinner.poster_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://image.tmdb.org/t/p/w780${finalWinner.poster_path}`} alt={finalWinner.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,1) 100%)" }} />
                <div className="relative z-10 w-full max-w-sm">
                  <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}>{t(locale, "doubleSuper", "label")}</div>
                  <h2 className="text-3xl font-black text-white leading-tight mb-1">{finalWinner.title}</h2>
                  <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>{finalWinner.year} &middot; {getGenreName(finalWinner.genre_ids, locale)}</p>
                  {finalWinner && (() => {
                    const wi = getWatchInfo(finalWinner.title, finalWinner.tmdb_id, finalWinner.type, selectedProviders, winnerProviderIds);
                    const label = wi.providerName
                      ? t(locale, "winner", "watchOn").replace("{provider}", wi.providerName)
                      : t(locale, "doubleSuper", "startWatching");
                    return (
                      <button onClick={() => { setRoundPhase("winner"); window.open(wi.url, "_blank", "noopener,noreferrer"); }} className="button" style={{ width: "100%", marginBottom: 8 }}>
                        {label}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => finalWinner && handleShare(finalWinner.title)}
                    className="w-full py-3 rounded-xl text-sm font-medium mb-2"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.72)", cursor: "pointer" }}
                  >
                    {shareState === "copied" ? t(locale, "winner", "copied") : t(locale, "winner", "share")}
                  </button>
                  <button
                    onClick={handleShareStory}
                    className="w-full py-2.5 rounded-xl text-xs font-medium mb-2 sm:hidden"
                    style={{ background: "rgba(255,42,42,0.08)", border: "1px solid rgba(255,42,42,0.15)", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}
                  >
                    {t(locale, "winner", "shareStory")}
                  </button>
                  {authUser && (
                    <div className="flex gap-2 mb-2 w-full">
                      <button
                        onClick={handleAddWatchlist}
                        disabled={watchlistAdded || watchlistLoading}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: watchlistAdded ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.5)" }}
                      >
                        {watchlistLoading ? "..." : watchlistAdded ? t(locale, "winner", "addedWatchlist") : t(locale, "winner", "addWatchlist")}
                      </button>
                      <button
                        onClick={handleMarkWatched}
                        disabled={watchedLogged || watchedLoading}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: watchedLogged ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.5)" }}
                      >
                        {watchedLoading ? "..." : watchedLogged ? t(locale, "winner", "markedWatched") : t(locale, "winner", "markWatched")}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => { setFinalWinner(null); setRoundPhase("swiping"); setSuperLikesUsed(0); superLikedIdRef.current = null; endedRoundRef.current = 0; endingRoundRef.current = false; setTimerRunning(true); }}
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
                      <img src={`https://image.tmdb.org/t/p/w342${roundMatches[0].title.poster_path}`} alt={roundMatches[0].title.title} className="w-full object-cover" style={{ aspectRatio: "2/3" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full flex items-center justify-center text-3xl font-black" style={{ aspectRatio: "2/3", background: getGenreColor(roundMatches[0].title.genre_ids), color: "rgba(255,255,255,0.15)" }}>{roundMatches[0].title.title.substring(0, 2)}</div>
                    )}
                    <div className="p-3">
                      <div className="font-bold text-white text-sm truncate">{roundMatches[0].title.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{roundMatches[0].title.year} &middot; {getGenreName(roundMatches[0].title.genre_ids, locale)}</div>
                    </div>
                  </div>
                  {(() => {
                    const m = roundMatches[0].title;
                    const wi = getWatchInfo(m.title, m.tmdb_id, m.type, selectedProviders);
                    const label = wi.providerName
                      ? t(locale, "winner", "watchOn").replace("{provider}", wi.providerName)
                      : t(locale, "results", "startWatching");
                    return (
                      <button onClick={() => { setFinalWinner(m); setRoundPhase("winner"); window.open(wi.url, "_blank", "noopener,noreferrer"); }} className="button" style={{ width: "100%", marginBottom: 12 }}>
                        {label}
                      </button>
                    );
                  })()}
                  {roundMatches.length > 1 && (
                    <div className="text-xs text-center mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {t(locale, "results", "seeAlternatives")} {roundMatches.slice(1).map((m) => m.title.title).join(" · ")}
                    </div>
                  )}
                  {round === 1 && (
                    <button onClick={startFinalRound} className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.28)" }}>
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
                  <div className="text-sm font-semibold text-white mb-1">
                    {isFallbackCompromise ? t(locale, "noMatch", "fallbackHeadline") : t(locale, "noMatch", "headline")}
                  </div>
                  <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {isFallbackCompromise ? t(locale, "noMatch", "fallbackIngress") : t(locale, "noMatch", "ingress")}
                  </div>
                  {compromiseTitle && (
                    <div className="rounded-2xl overflow-hidden mb-6 mx-auto" style={{ maxWidth: 180, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {compromiseTitle.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://image.tmdb.org/t/p/w342${compromiseTitle.poster_path}`} alt={compromiseTitle.title} className="w-full object-cover" style={{ aspectRatio: "2/3" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full flex items-center justify-center text-3xl font-black" style={{ aspectRatio: "2/3", background: getGenreColor(compromiseTitle.genre_ids), color: "rgba(255,255,255,0.15)" }}>{compromiseTitle.title.substring(0, 2)}</div>
                      )}
                      <div className="p-3">
                        <div className="font-bold text-white text-sm truncate">{compromiseTitle.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{compromiseTitle.year} &middot; {getGenreName(compromiseTitle.genre_ids, locale)}</div>
                      </div>
                    </div>
                  )}
                  {/* Round 2 explanation — no mutual match, fastest decision picked */}
                  {round === 2 && compromiseTitle && (
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 12, fontStyle: "italic" }}>
                      {locale === "no" ? "Ingen felles match — valgt basert på raskest avgjørelse"
                        : locale === "se" ? "Ingen gemensam match — vald baserat på snabbast beslut"
                        : locale === "dk" ? "Ingen fælles match — valgt baseret på hurtigste beslutning"
                        : locale === "fi" ? "Ei yhteistä osumaa — valittu nopeimman päätöksen perusteella"
                        : "No mutual match — picked based on fastest decision"}
                    </p>
                  )}
                  {compromiseTitle && (() => {
                    const wi = getWatchInfo(compromiseTitle.title, compromiseTitle.tmdb_id, compromiseTitle.type, selectedProviders);
                    const label = wi.providerName
                      ? t(locale, "winner", "watchOn").replace("{provider}", wi.providerName)
                      : t(locale, "winner", "startWatching");
                    return (
                      <button onClick={() => { setFinalWinner(compromiseTitle); setRoundPhase("winner"); window.open(wi.url, "_blank", "noopener,noreferrer"); }} className="button" style={{ width: "100%", marginBottom: 8 }}>
                        {label}
                      </button>
                    );
                  })()}
                  {round === 1 && (
                    <button onClick={startFinalRound} className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {t(locale, "noMatch", "lastRound")}
                    </button>
                  )}
                  <button onClick={reset} className="w-full py-2 mt-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.28)" }}>{t(locale, "noMatch", "playAgain")}</button>
                  {authUser && (
                    <Link
                      href="/home"
                      className="block w-full py-2.5 mt-2 rounded-xl text-sm font-semibold text-center transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
                    >
                      {locale === "no" ? "For deg — anbefalinger og Wrapped →" : locale === "se" ? "För dig — rekommendationer och Wrapped →" : locale === "dk" ? "For dig — anbefalinger og Wrapped →" : locale === "fi" ? "Sinulle — suositukset ja Wrapped →" : "For You — recommendations and Wrapped →"}
                    </Link>
                  )}
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
                    15%  { transform: scale(1.08); }
                    40%  { transform: scale(0.97); }
                    60%  { transform: scale(1.02); }
                    100% { transform: scale(1); }
                  }
                  @keyframes glow-overlay {
                    0%   { opacity: 0; }
                    20%  { opacity: 0.28; }
                    100% { opacity: 0; }
                  }
                  @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                  @keyframes poster-zoom { from { transform: scale(1.0); } to { transform: scale(1.06); } }
                  @keyframes match-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.2); opacity: 1; }
                    80% { transform: scale(0.95); }
                    100% { transform: scale(1); opacity: 1; }
                  }
                  @keyframes match-glow {
                    0%, 100% { text-shadow: 0 0 20px rgba(255,42,42,0.8); }
                    50% { text-shadow: 0 0 40px rgba(255,42,42,1), 0 0 80px rgba(255,42,42,0.4); }
                  }
                  @keyframes ring-expand {
                    from { transform: scale(0); opacity: 0.6; }
                    to { transform: scale(3); opacity: 0; }
                  }
                `}} />

                {/* Confetti canvas */}
                {matchRevealPhase >= 1 && (
                  <canvas
                    className="fixed inset-0 z-40 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                    ref={(canvas) => {
                      if (!canvas) return;
                      // Reset canvas for re-entry (new match)
                      if (canvas.dataset.started) {
                        const ctx = canvas.getContext("2d");
                        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.dataset.started = "";
                      }
                      canvas.dataset.started = "1";
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      canvas.width = window.innerWidth * window.devicePixelRatio;
                      canvas.height = window.innerHeight * window.devicePixelRatio;
                      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                      const W = window.innerWidth, H = window.innerHeight;
                      const colors = ["#ff2a2a", "#ff6b6b", "#ffd700", "#ffffff", "#ff9500"];
                      const particles = Array.from({ length: 150 }, () => ({
                        x: Math.random() * W, y: -10 - Math.random() * H * 0.3,
                        w: 4 + Math.random() * 6, h: 4 + Math.random() * 6,
                        vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
                        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.15,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        gravity: 0.08 + Math.random() * 0.04,
                      }));
                      const start = performance.now();
                      let rafId = 0;
                      const loop = (now: number) => {
                        const elapsed = now - start;
                        if (elapsed > 3500) { ctx.clearRect(0, 0, W, H); canvas.dataset.started = ""; return; }
                        ctx.clearRect(0, 0, W, H);
                        for (const p of particles) {
                          p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
                          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                          ctx.fillStyle = p.color;
                          ctx.globalAlpha = Math.max(0, 1 - elapsed / 3500);
                          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                          ctx.restore();
                        }
                        rafId = requestAnimationFrame(loop);
                      };
                      rafId = requestAnimationFrame(loop);
                      // Safety cleanup after 4s
                      setTimeout(() => { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); canvas.dataset.started = ""; }, 4000);
                    }}
                  />
                )}

                {/* Ring animations */}
                {matchRevealPhase >= 1 && [400, 600, 800].map((delay, i) => (
                  <div key={i} className="fixed pointer-events-none" style={{
                    top: "50%", left: "50%", width: "100vw", height: "100vw",
                    marginTop: "-50vw", marginLeft: "-50vw",
                    borderRadius: "50%", border: "2px solid rgba(255,42,42,0.5)",
                    background: "rgba(255,42,42,0.15)",
                    animation: `ring-expand 1.2s ease-out ${delay}ms both`,
                    zIndex: 35,
                  }} />
                ))}

                <div className="absolute inset-0" style={{ background: getGenreColor(finalWinner.genre_ids) }} />
                {/* Desktop-only poster mosaic background */}
                {isDesktop && ribbonPosters.length > 0 && (
                  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                    <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
                      {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.12, filter: "blur(3px)", flexShrink: 0 }} />
                      ))}
                    </div>
                  </div>
                )}
                {finalWinner.poster_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w780${finalWinner.poster_path}`}
                    alt={finalWinner.title}
                    className="absolute inset-0 w-full h-full object-cover md:object-contain"
                    style={{
                      animation: "poster-fadein 600ms ease-out forwards, poster-reveal 1s ease-out 600ms forwards, poster-zoom 4s ease-in-out 600ms forwards",
                      filter: matchRevealPhase >= 1 ? "brightness(0.95)" : "brightness(1)",
                      transition: "filter 600ms ease",
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {/* Red glow overlay — works on all screen sizes */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(255,42,42,1)", animation: "glow-overlay 1.2s ease-out 600ms both" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,1) 100%)" }} />
                <div className="relative z-10 w-full max-w-sm md:mx-auto">
                  {/* Phase 1: label with pop + glow */}
                  <div style={{
                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em",
                    color: "#fff", marginBottom: 4,
                    animation: matchRevealPhase >= 1 ? "match-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, match-glow 1.5s ease-in-out 0.6s infinite" : "none",
                    opacity: matchRevealPhase >= 1 ? undefined : 0,
                  }}>
                    {mode === "solo" ? t(locale, "winner", "soloPhase1") : t(locale, "winner", "phase1")}
                  </div>
                  {/* Match streak counter */}
                  {matchRevealPhase >= 1 && matchCount >= 2 && (
                    <div style={{
                      fontSize: "0.85rem", fontWeight: 700, color: "#ff9500", marginBottom: 12,
                      opacity: 0, animation: "poster-fadein 0.3s ease 0.7s forwards",
                    }}>
                      {matchCount}. match {locale === "no" || locale === "dk" ? "i kveld" : locale === "se" ? "ikväll" : locale === "fi" ? "tänä iltana" : "tonight"}! 🔥
                    </div>
                  )}
                  {matchCount < 2 && <div style={{ marginBottom: 12 }} />}
                  {/* Phase 2: title + meta */}
                  <div style={{ opacity: matchRevealPhase >= 2 ? 1 : 0, transition: "opacity 600ms ease" }}>
                    <h2 className="text-3xl font-black text-white leading-tight mb-1">{finalWinner.title}</h2>
                    <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {finalWinner.year} &middot; {getGenreName(finalWinner.genre_ids, locale)}
                    </p>
                    {selectedProviders.length > 0 && (
                      <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.28)" }}>
                        {PROVIDERS.filter((p) => selectedProviders.includes(p.id)).map((p) => p.name).join(" · ")}
                      </p>
                    )}
                    {/* Match time */}
                    {(() => {
                      const elapsed = sessionStartTime.current > 0 ? Math.round((Date.now() - sessionStartTime.current) / 1000) : 0;
                      return elapsed > 0 && elapsed < 300 ? (
                        <p className="text-sm font-semibold mb-2" style={{ color: "rgba(255,200,100,0.85)" }}>
                          {t(locale, "winner", "matchTime").replace("{x}", String(elapsed))}
                        </p>
                      ) : null;
                    })()}
                    {finalWinner.overview && (
                      <p className="text-sm mb-8 line-clamp-2" style={{ color: "rgba(255,255,255,0.58)", lineHeight: 1.5 }}>
                        {finalWinner.overview}
                      </p>
                    )}
                  </div>
                  {/* Phase 3: primary CTAs + collapsible */}
                  <div style={{ opacity: matchRevealPhase >= 3 ? 1 : 0, transition: "opacity 600ms ease" }}>
                    {/* PRIMARY: Share */}
                    <button
                      onClick={() => finalWinner && handleShare(finalWinner.title)}
                      className="w-full py-3 rounded-xl text-sm font-semibold mb-3"
                      style={{ background: "#ff2a2a", border: "none", color: "#fff", cursor: "pointer" }}
                    >
                      {shareState === "copied" ? t(locale, "winner", "copied") : t(locale, "winner", "shareMatch")}
                    </button>

                    {/* SECONDARY: Watch */}
                    {finalWinner && (() => {
                      const wi = getWatchInfo(finalWinner.title, finalWinner.tmdb_id, finalWinner.type, selectedProviders, winnerProviderIds);
                      const label = wi.providerName
                        ? t(locale, "winner", "watchOn").replace("{provider}", wi.providerName)
                        : t(locale, "winner", "startWatching");
                      return (
                        <button onClick={() => { track("together_watch_clicked", { provider: wi.providerName, tmdb_id: finalWinner.tmdb_id, title: finalWinner.title }); window.open(wi.url, "_blank", "noopener,noreferrer"); }} className="w-full py-3 rounded-xl text-sm font-semibold mb-4" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
                          {label}
                        </button>
                      );
                    })()}

                    {/* Guest signup CTA — before premium teaser */}
                    {!authUser && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "0.5px solid rgba(255,255,255,0.15)",
                          borderRadius: 12,
                          padding: "14px 16px",
                          marginBottom: 12,
                          textAlign: "center",
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 10px" }}>
                          {locale === "no" ? "Vil dere se denne igjen? Lagre matchen." : locale === "se" ? "Vill ni se den igen? Spara matchen." : locale === "dk" ? "Vil I se den igen? Gem matchen." : locale === "fi" ? "Haluatteko katsoa tämän uudelleen? Tallenna ottelu." : "Want to watch this again? Save the match."}
                        </p>
                        <Link
                          href="/login?mode=signup"
                          style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 0", borderRadius: 10, background: "#ff2a2a", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 4 }}
                        >
                          {locale === "no" ? "Opprett konto — gratis" : locale === "se" ? "Skapa konto — gratis" : locale === "dk" ? "Opret konto — gratis" : locale === "fi" ? "Luo tili — ilmainen" : "Create account — free"}
                        </Link>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 10px" }}>
                          {locale === "no" ? "Få 7 dager premium. Ingen kortinfo nødvendig." : locale === "se" ? "Få 7 dagars premium. Inget kortinfo behövs." : locale === "dk" ? "Få 7 dages premium. Ingen kortinfo nødvendig." : locale === "fi" ? "Saat 7 päivää premiumia. Ei korttitietoja tarvita." : "Get 7 days premium. No credit card needed."}
                        </p>
                        <Link
                          href="/login"
                          style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "block", marginBottom: 8 }}
                        >
                          {locale === "no" ? "Allerede bruker? Logg inn" : locale === "se" ? "Har du redan ett konto? Logga in" : locale === "dk" ? "Har du allerede en konto? Log ind" : locale === "fi" ? "Onko sinulla jo tili? Kirjaudu sisään" : "Already have an account? Log in"}
                        </Link>
                        <Link href="/together" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
                          {locale === "no" ? "Utfordre et annet par — kan de slå dere? →" : locale === "se" ? "Utmana ett annat par — kan de slå er? →" : locale === "dk" ? "Udfordr et andet par — kan de slå jer? →" : locale === "fi" ? "Haasta toinen pari — voivatko he voittaa teidät? →" : "Challenge another couple — can they beat you? →"}
                        </Link>
                      </div>
                    )}

                    {/* Separator with "More" toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                      <button
                        onClick={() => setMatchMoreOpen((o) => !o)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "2px 8px", transition: "color 0.2s" }}
                      >
                        {matchMoreOpen ? (locale === "no" ? "Mindre ↑" : "Less ↑") : (locale === "no" ? "Mer ↓" : "More ↓")}
                      </button>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                    </div>

                    {/* Collapsible section */}
                    {matchMoreOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {/* Facebook share */}
                        {finalWinner && (() => {
                          const locToReg: Record<string, string> = { nb: "no", sv: "se", da: "dk", fi: "fi", en: "no" };
                          const reg = locToReg[locale] ?? "no";
                          const sb = finalWinner.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                          const mt = finalWinner.type === "tv" ? "tv" : "movie";
                          const fbUrl = `https://logflix.app/${reg}/${mt}/${sb}-${finalWinner.tmdb_id}?match=1&utm_source=facebook&utm_medium=together&utm_campaign=match`;
                          const fbTexts: Record<string, string> = {
                            no: `Vi ble enige om ${finalWinner.title} på under 3 min 🎬 Prøv selv:`,
                            en: `We agreed on ${finalWinner.title} in under 3 min 🎬 Try it:`,
                            dk: `Vi blev enige om ${finalWinner.title} på under 3 min 🎬 Prøv selv:`,
                            se: `Vi kom överens om ${finalWinner.title} på under 3 min 🎬 Prova själv:`,
                            fi: `Löysimme yhteisen elokuvan ${finalWinner.title} alle 3 min 🎬 Kokeile:`,
                          };
                          const fbText = fbTexts[locale] ?? fbTexts.en;
                          return (
                            <button
                              onClick={() => {
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fbUrl)}&quote=${encodeURIComponent(fbText)}`, "_blank", "noopener,noreferrer");
                                track("match_facebook_shared", { session_id: sessionId, tmdb_id: finalWinner.tmdb_id, title: finalWinner.title });
                              }}
                              className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                              style={{ background: "rgba(24,119,242,0.1)", border: "1px solid rgba(24,119,242,0.3)", color: "#1877F2", cursor: "pointer" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              {locale === "no" ? "Del i Facebook-gruppe" : "Share to Facebook group"}
                            </button>
                          );
                        })()}

                        {/* Share as Story — mobile only */}
                        <button
                          onClick={handleShareStory}
                          className="w-full py-2.5 rounded-xl text-xs font-medium sm:hidden"
                          style={{ background: "rgba(255,42,42,0.08)", border: "1px solid rgba(255,42,42,0.15)", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}
                        >
                          {t(locale, "winner", "shareStory")}
                        </button>

                        {/* Email capture — guests only */}
                        {!emailCaptured && !(authUser?.email) && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const email = emailValue.trim();
                              if (!email) return;
                              setEmailCaptured(true);
                              track("together_email_captured", { tmdb_id: finalWinner.tmdb_id, title: finalWinner.title });
                              fetch("/api/email-capture", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email, tmdb_id: finalWinner.tmdb_id, title: finalWinner.title, type: finalWinner.type }),
                              }).catch(() => {});
                            }}
                            className="flex gap-2"
                          >
                            <input type="email" required placeholder={t(locale, "emailCapture", "placeholder")} value={emailValue} onChange={(e) => setEmailValue(e.target.value)}
                              className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", outline: "none" }} />
                            <button type="submit" className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
                              {t(locale, "emailCapture", "submit")}
                            </button>
                          </form>
                        )}
                        {!emailCaptured && !(authUser?.email) && (
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.32)" }}>{t(locale, "emailCapture", "prompt")}</p>
                        )}
                        {emailCaptured && (
                          <p className="text-xs" style={{ color: "rgba(255,200,100,0.7)" }}>{t(locale, "emailCapture", "confirmed")}</p>
                        )}

                        {/* Watchlist + Watched — auth only */}
                        {authUser && (
                          <div className="flex gap-2 w-full">
                            <button onClick={handleAddWatchlist} disabled={watchlistAdded || watchlistLoading}
                              className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: watchlistAdded ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.5)" }}>
                              {watchlistLoading ? "..." : watchlistAdded ? t(locale, "winner", "addedWatchlist") : t(locale, "winner", "addWatchlist")}
                            </button>
                            <button onClick={handleMarkWatched} disabled={watchedLogged || watchedLoading}
                              className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: watchedLogged ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.5)" }}>
                              {watchedLoading ? "..." : watchedLogged ? t(locale, "winner", "markedWatched") : t(locale, "winner", "markWatched")}
                            </button>
                          </div>
                        )}

                        {/* Guest signup */}
                        {!authUser && (
                          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 10 }}>
                              {locale === "no" ? "Vil dere se denne igjen? Lagre matchen." : locale === "se" ? "Vill ni se den igen? Spara matchen." : locale === "dk" ? "Vil I se den igen? Gem matchen." : locale === "fi" ? "Haluatteko katsoa tämän uudelleen? Tallenna ottelu." : "Want to watch this again? Save the match."}
                            </p>
                            <a href={`/login?from=together&mode=signup${sessionCode ? `&wt_code=${sessionCode}` : ""}`} style={{ display: "block", padding: "12px 0", background: "#ff2a2a", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 4 }}>
                              {locale === "no" ? "Opprett konto — gratis" : locale === "se" ? "Skapa konto — gratis" : locale === "dk" ? "Opret konto — gratis" : locale === "fi" ? "Luo tili — ilmainen" : "Create account — free"}
                            </a>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 8px" }}>
                              {locale === "no" ? "Få 7 dager premium. Ingen kortinfo nødvendig." : locale === "se" ? "Få 7 dagars premium. Inget kortinfo behövs." : locale === "dk" ? "Få 7 dages premium. Ingen kortinfo nødvendig." : locale === "fi" ? "Saat 7 päivää premiumia. Ei korttitietoja tarvita." : "Get 7 days premium. No credit card needed."}
                            </p>
                            <a href={`/login?from=together&mode=login${sessionCode ? `&wt_code=${sessionCode}` : ""}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "underline", textUnderlineOffset: 2 }}>{t(locale, "winner", "guestLoginBtn")}</a>
                          </div>
                        )}

                        {/* Match saved for logged in users */}
                        {authUser && (
                          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(52,211,153,0.8)", textAlign: "center", margin: "8px 0" }}>
                            {locale === "no" ? "Match lagret! ✓" : locale === "se" ? "Match sparad! ✓" : locale === "dk" ? "Match gemt! ✓" : locale === "fi" ? "Ottelu tallennettu! ✓" : "Match saved! ✓"}
                          </p>
                        )}

                        {/* Try another friend */}
                        <button
                          onClick={() => {
                            const titleName = finalWinner?.title ?? "en film";
                            const text = t(locale, "winner", "tryAnotherFriendShareText").replace("{title}", titleName);
                            const url = "https://logflix.app/together";
                            if (navigator.share) {
                              navigator.share({ title: "Logflix — Se Sammen", text, url }).then(() => { track("viral_try_another_friend", { session_id: sessionId, tmdb_id: finalWinner?.tmdb_id, method: "native_share" }); }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
                              track("viral_try_another_friend", { session_id: sessionId, tmdb_id: finalWinner?.tmdb_id, method: "copy" });
                            }
                          }}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                          {t(locale, "winner", "tryAnotherFriend")}
                        </button>

                        {/* Play again */}
                        <button onClick={reset} className="w-full py-2 text-xs font-medium bg-transparent border-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.28)" }}>
                          {t(locale, "winner", "playAgain")}
                        </button>

                        {/* Go to For deg */}
                        {authUser && (
                          <Link
                            href="/home"
                            className="block w-full py-2.5 mt-1 rounded-xl text-sm font-semibold text-center transition-all"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
                          >
                            {locale === "no" ? "For deg — anbefalinger og Wrapped →" : locale === "se" ? "För dig — rekommendationer och Wrapped →" : locale === "dk" ? "For dig — anbefalinger og Wrapped →" : locale === "fi" ? "Sinulle — suositukset ja Wrapped →" : "For You — recommendations and Wrapped →"}
                          </Link>
                        )}

                        {/* Solo invite */}
                        {mode === "solo" && (
                          <button
                            onClick={() => {
                              const text = t(locale, "winner", "soloInviteCta");
                              const url = `${window.location.origin}/together`;
                              if (navigator.share) {
                                navigator.share({ title: "Logflix — Se Sammen", text, url }).then(() => { track("invite_shared", { session_id: sessionId, method: "native_share" }); }).catch(() => {});
                              } else {
                                navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
                                track("invite_copy_link", { session_id: sessionId, method: "copy" });
                              }
                            }}
                            className="w-full py-3 rounded-xl text-sm font-medium"
                            style={{ background: "rgba(255,42,42,0.12)", border: "1px solid rgba(255,42,42,0.25)", color: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
                            {t(locale, "winner", "soloInviteCta")}
                          </button>
                        )}
                      </div>
                    )}
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

                  {/* Partner timeout — show "continue alone" after 45s of no partner progress */}
                  {timer <= (round === 1 ? ROUND1_DURATION - 45 : ROUND2_DURATION - 45) && partnerSwipeCount === 0 && (
                    <button
                      onClick={() => { endRound(round); }}
                      className="mt-6 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
                    >
                      {locale === "no" ? "Partner svarer ikke — fortsett alene" : locale === "se" ? "Partnern svarar inte — fortsätt ensam" : locale === "dk" ? "Partner svarer ikke — fortsæt alene" : locale === "fi" ? "Kumppani ei vastaa — jatka yksin" : "Partner not responding — continue alone"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Keyboard hint tooltip (desktop, first visit) */}
            {showKeyboardHint && (
              <div
                onClick={() => setShowKeyboardHint(false)}
                className="fixed top-20 left-1/2 z-50 cursor-pointer animate-fade-in-up"
                style={{ transform: "translateX(-50%)", background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 20px", backdropFilter: "blur(12px)" }}
              >
                <p className="text-xs text-white/70 text-center whitespace-nowrap">
                  💡 <span style={{ color: "rgba(255,255,255,0.4)" }}>←</span> {locale === "no" ? "Nei" : "No"}
                  <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 8px" }}>|</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>→</span> {locale === "no" ? "Ja" : "Yes"}
                  <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 8px" }}>|</span>
                  <span style={{ color: "#FFB800" }}>Space</span> = Superlike
                </p>
              </div>
            )}

            {/* ── SWIPING PHASE — centered card layout ── */}
            {roundPhase === "swiping" && !deckExhausted && !iAmDone && (
              <div className="flex-1 flex flex-col relative overflow-hidden" style={{ paddingTop: "2px" }}>
                {ribbonPosters.length > 0 && (
                  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                    <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
                      {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={`https://image.tmdb.org/t/p/w185${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.07, filter: "blur(3px)", flexShrink: 0 }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to intro */}
                <button
                  onClick={reset}
                  style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 22, cursor: "pointer", zIndex: 10, lineHeight: 1 }}
                  aria-label="Back"
                >
                  ←
                </button>

                {/* Top row: Undo + Runde label */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  {/* Undo button — 1 per round */}
                  {lastSwipedTitle && !undoUsedThisRound ? (
                    <button
                      onClick={() => {
                        setDeckIndex(lastSwipedTitle.index);
                        delete sessionSwipes.current[lastSwipedTitle.title.tmdb_id];
                        delete swipeTimings.current[lastSwipedTitle.title.tmdb_id];
                        if (mode === "paired") {
                          enqueueSwipe(lastSwipedTitle.title.tmdb_id, lastSwipedTitle.title.type, "nope");
                        }
                        setLastSwipedTitle(null);
                        setUndoUsedThisRound(true);
                      }}
                      className="text-xs font-medium cursor-pointer transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.5)" }}
                    >
                      ↩ {locale === "no" ? "Angre" : locale === "se" ? "Ångra" : locale === "dk" ? "Fortryd" : locale === "fi" ? "Kumoa" : "Undo"}
                    </button>
                  ) : <div style={{ width: 60 }} />}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
                    {round === 1 ? t(locale, "together", "round1") : t(locale, "together", "round2")}
                  </span>
                  <div style={{ width: 60 }} />
                </div>

                {/* Card area — centered */}
                <div className="flex-1 md:flex-none md:max-h-[60vh] flex flex-col items-center justify-center px-5" style={{ minHeight: 0 }}>
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
                        transform: `translate3d(${fly.active ? fly.x : swipe.x}px, ${fly.active ? fly.y : (swipe.dragging ? Math.min(0, swipe.y * 0.4) : 0)}px, 0) rotate(${fly.active ? fly.rot : swipe.rot}deg)`,
                        transition: swipe.dragging ? "none" : fly.active ? "transform 200ms cubic-bezier(.2,.9,.2,1)" : "transform 220ms cubic-bezier(.2,.9,.2,1)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        marginBottom: "8px",
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

                      {/* Drag direction glow overlays */}
                      {swipe.dragging && swipe.x > 20 && (
                        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: `rgba(74,222,128,${Math.min(0.25, Math.abs(swipe.x) / 400)})`, transition: "none" }} />
                      )}
                      {swipe.dragging && swipe.x < -20 && (
                        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: `rgba(239,68,68,${Math.min(0.25, Math.abs(swipe.x) / 400)})`, transition: "none" }} />
                      )}
                      {swipe.dragging && swipe.y < -20 && Math.abs(swipe.y) > Math.abs(swipe.x) && (
                        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: `rgba(255,184,0,${Math.min(0.25, Math.abs(swipe.y) / 320)})`, transition: "none" }} />
                      )}

                      {/* LIKE / NOPE / SUPER badges */}
                      {swipe.dragging && swipe.x > 30 && (
                        <div className="absolute top-6 left-5 z-30 pointer-events-none" style={{ opacity: Math.min(1, (swipe.x - 30) / 70), transform: "rotate(-15deg)" }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: "#4ade80", border: "3px solid #4ade80", borderRadius: 8, padding: "4px 14px", letterSpacing: "0.05em" }}>LIKE</span>
                        </div>
                      )}
                      {swipe.dragging && swipe.x < -30 && (
                        <div className="absolute top-6 right-5 z-30 pointer-events-none" style={{ opacity: Math.min(1, (Math.abs(swipe.x) - 30) / 70), transform: "rotate(15deg)" }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: "#ef4444", border: "3px solid #ef4444", borderRadius: 8, padding: "4px 14px", letterSpacing: "0.05em" }}>NOPE</span>
                        </div>
                      )}
                      {swipe.dragging && swipe.y < -30 && Math.abs(swipe.y) > Math.abs(swipe.x) && (
                        <div className="absolute top-6 left-1/2 z-30 pointer-events-none" style={{ opacity: Math.min(1, (Math.abs(swipe.y) - 30) / 50), transform: "translateX(-50%)" }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: "#FFB800", border: "3px solid #FFB800", borderRadius: 8, padding: "4px 14px", letterSpacing: "0.05em" }}>SUPER</span>
                        </div>
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
                        {top.overview && (
                          <div
                            className="mt-1.5 line-clamp-2"
                            style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.45 }}
                          >
                            {top.overview.length > 100 ? top.overview.slice(0, 100) + "..." : top.overview}
                          </div>
                        )}
                      </div>

                      {/* Superlike flash overlay */}
                      {showSuperLikeFlash && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold text-yellow-400 tracking-widest animate-pulse">
                            SUPER LIKE ⭐
                          </span>
                        </div>
                      )}

                      {/* Exclude toast */}
                      {excludeToast && (
                        <div className="absolute inset-0 z-30 flex items-end justify-center pointer-events-none" style={{ paddingBottom: 24 }}>
                          <span style={{ background: "rgba(0,0,0,0.8)", color: "rgba(255,255,255,0.7)", fontSize: 12, padding: "6px 14px", borderRadius: 8 }}>
                            {t(locale, "together", "hiddenToast")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress indicator + last cards warning */}
                  {deck.length > 0 && (
                    <p className={`text-xs text-center mt-2 ${deck.length - deckIndex <= 3 && deck.length - deckIndex > 0 ? "font-semibold" : ""}`}
                      style={{ color: deck.length - deckIndex <= 3 && deck.length - deckIndex > 0 ? "#FFB800" : "rgba(255,255,255,0.4)" }}>
                      {deck.length - deckIndex <= 3 && deck.length - deckIndex > 0
                        ? (locale === "no" ? `Siste ${deck.length - deckIndex} kort!` : locale === "se" ? `Sista ${deck.length - deckIndex} kort!` : locale === "dk" ? `Sidste ${deck.length - deckIndex} kort!` : locale === "fi" ? `Viimeiset ${deck.length - deckIndex} korttia!` : `Last ${deck.length - deckIndex} cards!`)
                        : cardsLeft(locale, round, Math.max(0, deck.length - deckIndex))}
                    </p>
                  )}

                  {/* Mobile swipe hint — first session only, fades after first swipe */}
                  {showSwipeHint && !isDesktop && (
                    <div
                      className="text-center"
                      style={{
                        fontSize: "0.75rem",
                        color: RED,
                        fontWeight: 500,
                        opacity: showSwipeHint ? 1 : 0,
                        transition: "opacity 400ms ease-out",
                        marginBottom: "2px",
                      }}
                    >
                      {t(locale, "together", "mobileSwipeHint")}
                    </div>
                  )}

                  {/* Bottom action buttons */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    .wt-action-btn {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      width: 90px;
                      height: 42px;
                      font-size: 13px;
                      font-weight: 700;
                      color: white;
                      border: 2px solid #ff2a2a;
                      cursor: pointer;
                      position: relative;
                      background-color: transparent;
                      text-decoration: none;
                      overflow: hidden;
                      z-index: 1;
                      font-family: inherit;
                      border-radius: 8px;
                      padding: 0;
                    }
                    @media (min-width: 640px) {
                      .wt-action-btn {
                        width: 120px;
                        height: 48px;
                        font-size: 16px;
                        border-width: 3px;
                      }
                    }
                    .wt-action-btn::before {
                      content: "";
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      height: 100%;
                      background-color: #ff2a2a;
                      transform: translateX(-100%);
                      transition: all .3s;
                      z-index: -1;
                    }
                    .wt-action-btn:hover::before {
                      transform: translateX(0);
                    }
                    @keyframes gold-shimmer {
                      0%, 100% { color: #d4af37; text-shadow: 0 0 6px rgba(212,175,55,0.3); }
                      50% { color: #f5e6a3; text-shadow: 0 0 12px rgba(245,230,163,0.5), 0 0 4px rgba(255,255,255,0.2); }
                    }
                    @keyframes superlike-glow {
                      0%, 100% { box-shadow: 0 0 12px rgba(255,184,0,0.3), inset 0 0 8px rgba(255,184,0,0.1); }
                      50% { box-shadow: 0 0 24px rgba(255,184,0,0.5), inset 0 0 12px rgba(255,184,0,0.15); }
                    }
                    .wt-superlike-btn {
                      position: relative;
                      width: 56px;
                      height: 56px;
                      background-color: #000;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      color: #FFB800;
                      justify-content: center;
                      gap: 2px;
                      border: 2px solid rgba(255,184,0,0.4);
                      padding: 0;
                      border-radius: 50%;
                      cursor: pointer;
                      font-family: inherit;
                      font-size: 10px;
                      font-weight: 700;
                      animation: superlike-glow 2s ease-in-out infinite;
                    }
                    @media (min-width: 640px) {
                      .wt-superlike-btn {
                        width: 64px;
                        height: 64px;
                        font-size: 11px;
                      }
                    }
                    .wt-superlike-btn::before {
                      content: '';
                      position: absolute;
                      inset: 0;
                      left: -4px;
                      top: -1px;
                      margin: auto;
                      width: calc(100% + 8px);
                      height: calc(100% + 8px);
                      border-radius: 10px;
                      background: linear-gradient(-45deg, rgba(255,255,255,0.9) 0%, rgba(200,200,210,0.6) 50%, rgba(255,255,255,0.9) 100%);
                      z-index: -10;
                      pointer-events: none;
                      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                    .wt-superlike-btn::after {
                      content: "";
                      z-index: -1;
                      position: absolute;
                      inset: 0;
                      background: rgba(252, 70, 100, 0.6);
                      transform: translate3d(0, 0, 0) scale(0.95);
                      filter: blur(20px);
                    }
                    .wt-superlike-btn:hover::after {
                      filter: blur(30px);
                    }
                    .wt-superlike-btn:hover::before {
                      transform: rotate(-180deg);
                    }
                    .wt-superlike-btn:active::before {
                      scale: 0.7;
                    }
                    .wt-superlike-btn:disabled {
                      opacity: 0.22;
                      cursor: default;
                    }
                    .wt-superlike-btn:disabled::before,
                    .wt-superlike-btn:disabled::after {
                      opacity: 0.3;
                    }
                  `}} />
                  <div className="flex items-center justify-center gap-3 sm:gap-5" style={{ paddingTop: "8px", paddingBottom: "12px" }}>
                  {/* Dislike */}
                  <button
                    onClick={() => endSwipe("nope")}
                    className="wt-action-btn"
                    aria-label="Dislike"
                  >
                    Dislike
                  </button>

                  {/* Super-like */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={handleSuperLike}
                      disabled={superLikesUsed >= SUPERLIKES_PER_ROUND}
                      className="wt-superlike-btn"
                      aria-label="Super-like"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFB800" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <span style={{ fontSize: 10, fontWeight: 600, color: superLikesUsed >= SUPERLIKES_PER_ROUND ? "rgba(255,255,255,0.15)" : "#FFB800" }}>
                      {superLikesUsed >= SUPERLIKES_PER_ROUND
                        ? (locale === "no" ? "Brukt opp" : locale === "se" ? "Slut" : locale === "dk" ? "Brugt op" : locale === "fi" ? "Käytetty" : "Used up")
                        : `⭐ ${SUPERLIKES_PER_ROUND - superLikesUsed} ${locale === "no" ? "igjen" : locale === "se" ? "kvar" : locale === "dk" ? "tilbage" : locale === "fi" ? "jäljellä" : "left"}`}
                    </span>
                  </div>

                  {/* Like */}
                  <button
                    onClick={() => endSwipe("like")}
                    className="wt-action-btn"
                    aria-label="Like"
                  >
                    Like
                  </button>
                  </div>

                  {/* Invite partner — solo only, after 3 swipes */}
                  {mode === "solo" && deckIndex >= 3 && (
                    <div className="flex justify-center animate-fade-in-up" style={{ marginTop: 6 }}>
                      <button
                        onClick={handleInviteMidSolo}
                        disabled={titlesLoading}
                        style={{
                          background: "none",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 20,
                          color: "rgba(255,255,255,0.70)",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          opacity: titlesLoading ? 0.4 : 1,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        {t(locale, "together", "invitePartner")}
                      </button>
                    </div>
                  )}

                  {/* Ikke for oss — logged-in only */}
                  {authUser && (
                    <div className="flex justify-center" style={{ marginTop: 4 }}>
                      <button
                        onClick={handleExclude}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.28)",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: "10px 16px",
                          minHeight: 44,
                          lineHeight: "24px",
                        }}
                      >
                        {t(locale, "together", "notForUs")}
                      </button>
                    </div>
                  )}

                  {/* Desktop arrow hint */}
                  {isDesktop && (
                    <div className="flex justify-center">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{t(locale, "together", "desktopHint")}</span>
                    </div>
                  )}

                </div>
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
          onClick={() => router.push(authUser ? "/together" : `/login?from=together&mode=signup${joinCode ? `&wt_code=${joinCode}` : ""}`)}
          className="fixed top-4 right-4 z-60 select-none cursor-pointer"
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
                fontWeight: 600,
                color: "#ffffff",
                padding: "6px 10px",
                borderRadius: 10,
                background: "transparent",
                border: "1px solid #ff2a2a",
              }}
            >
              {t(locale, "global", "login")}
            </span>
          )}
        </button>

      {/* ── Guest signup prompt (bottom-sheet after match) ── */}
      {showGuestSignup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={() => { setShowGuestSignup(false); track("guest_signup_dismissed", { method: "backdrop" }); }} />
          <div
            className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 animate-fade-in-up"
            style={{
              background: "linear-gradient(180deg, rgba(15,18,30,0.97) 0%, rgba(10,12,20,0.99) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
            }}
          >
            <button
              onClick={() => setShowGuestSignup(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "none" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff2a2a">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              {locale === "no" ? "Lagre matchen din" : locale === "se" ? "Spara din match" : locale === "dk" ? "Gem din match" : locale === "fi" ? "Tallenna osumasi" : "Save your match"}
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {locale === "no" ? "Opprett konto for å huske hva dere matchet på — og finn noe nytt neste fredag." : locale === "se" ? "Skapa konto för att komma ihåg vad ni matchade på — och hitta något nytt nästa fredag." : locale === "dk" ? "Opret konto for at huske hvad I matchede på — og find noget nyt næste fredag." : locale === "fi" ? "Luo tili muistaaksesi mihin osuitte — ja löytääksesi jotain uutta ensi perjantaina." : "Create an account to remember what you matched on — and find something new next Friday."}
            </p>

            <a
              href="/login?provider=google&from=together"
              onClick={() => track("guest_signup_cta_clicked", { method: "google", tmdb_id: finalWinner?.tmdb_id })}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-gray-800 transition-all hover:brightness-95"
              style={{ background: "white", textDecoration: "none", minHeight: 48 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {locale === "no" ? "Fortsett med Google" : locale === "se" ? "Fortsätt med Google" : locale === "dk" ? "Fortsæt med Google" : locale === "fi" ? "Jatka Googlella" : "Continue with Google"}
            </a>

            <div className="flex items-center justify-center gap-4 mt-4">
              <Link
                href="/login?from=together"
                onClick={() => track("guest_signup_cta_clicked", { method: "email", tmdb_id: finalWinner?.tmdb_id })}
                className="text-xs transition-colors hover:text-white/60"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              >
                {locale === "no" ? "Eller bruk e-post" : locale === "se" ? "Eller använd e-post" : locale === "dk" ? "Eller brug e-mail" : locale === "fi" ? "Tai käytä sähköpostia" : "Or use email"}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
              <button
                onClick={() => { setShowGuestSignup(false); track("guest_signup_dismissed", { method: "button" }); }}
                className="text-xs bg-transparent border-0 cursor-pointer transition-colors hover:text-white/60"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {locale === "no" ? "Kanskje senere" : locale === "se" ? "Kanske senare" : locale === "dk" ? "Måske senere" : locale === "fi" ? "Ehkä myöhemmin" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
