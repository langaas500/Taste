"use client";

import { useEffect } from "react";

export default function useKeyboardSwipe(
  enabled: boolean,
  onLeft: () => void,
  onRight: () => void,
  onSuperLike: () => void,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); onLeft(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onRight(); }
      else if (e.key === " ") { e.preventDefault(); onSuperLike(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onLeft, onRight, onSuperLike]);
}
