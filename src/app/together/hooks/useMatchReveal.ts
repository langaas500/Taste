"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function useMatchReveal(trigger: boolean, onStart?: () => void) {
  const [matchRevealPhase, setMatchRevealPhase] = useState<0 | 1 | 2 | 3>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!trigger) { setMatchRevealPhase(0); return; }

    onStart?.();

    const t1 = window.setTimeout(() => setMatchRevealPhase(1), 400);
    const t2 = window.setTimeout(() => setMatchRevealPhase(2), 700);
    const t3 = window.setTimeout(() => setMatchRevealPhase(3), 1000);
    const t4 = window.setTimeout(() => {
      navigator.vibrate?.([100, 50, 200]);
      try {
        const ctx = audioCtxRef.current ?? new AudioContext();
        if (ctx.state === "suspended") ctx.resume();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch { /* ignore */ }
    }, 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const resetReveal = useCallback(() => setMatchRevealPhase(0), []);

  /** Warm up AudioContext on first user gesture (call from any pointer/click handler). */
  const warmAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new AudioContext(); } catch { /* ignore */ }
    }
  }, []);

  return { matchRevealPhase, resetReveal, warmAudio, audioCtxRef };
}
