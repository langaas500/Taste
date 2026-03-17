"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function useCountdown() {
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(0);
  timerRef.current = timer;

  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { setTimerRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timer]);

  const startTimer = useCallback((seconds: number) => {
    setTimer(seconds);
    setTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback((seconds: number = 0) => {
    setTimerRunning(false);
    setTimer(seconds);
  }, []);

  return { timer, timerRunning, timerRef, setTimer, setTimerRunning, startTimer, stopTimer, resetTimer };
}
