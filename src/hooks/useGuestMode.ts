"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const GUEST_ACTIONS_KEY = "logflix_guest_actions";
const GUEST_WT_KEY = "logflix_guest_wt_used";
const GUEST_ACTION_LIMIT = 4;

interface GuestMode {
  isGuest: boolean;
  guestActionCount: number;
  guestWtUsed: boolean;
  shouldShowWall: boolean;
  trackAction: () => boolean; // returns true if action allowed
  trackWtUse: () => boolean; // returns true if WT allowed
  showWall: boolean;
  setShowWall: (v: boolean) => void;
}

export function useGuestMode(): GuestMode {
  const [isGuest, setIsGuest] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [guestActionCount, setGuestActionCount] = useState(0);
  const [guestWtUsed, setGuestWtUsed] = useState(false);
  const [showWall, setShowWall] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsGuest(true);
        try {
          const count = parseInt(localStorage.getItem(GUEST_ACTIONS_KEY) || "0", 10);
          setGuestActionCount(count);
          setGuestWtUsed(localStorage.getItem(GUEST_WT_KEY) === "true");
        } catch { /* ignore */ }
      }
      setLoaded(true);
    })();
  }, []);

  const shouldShowWall = isGuest && guestActionCount >= GUEST_ACTION_LIMIT;

  const trackAction = useCallback(() => {
    if (!isGuest) return true;
    const next = guestActionCount + 1;
    if (next > GUEST_ACTION_LIMIT) {
      setShowWall(true);
      return false;
    }
    setGuestActionCount(next);
    try { localStorage.setItem(GUEST_ACTIONS_KEY, String(next)); } catch { /* ignore */ }
    if (next >= GUEST_ACTION_LIMIT) {
      setShowWall(true);
    }
    return true;
  }, [isGuest, guestActionCount]);

  const trackWtUse = useCallback(() => {
    if (!isGuest) return true;
    if (guestWtUsed) {
      setShowWall(true);
      return false;
    }
    setGuestWtUsed(true);
    try { localStorage.setItem(GUEST_WT_KEY, "true"); } catch { /* ignore */ }
    return true;
  }, [isGuest, guestWtUsed]);

  return {
    isGuest: loaded ? isGuest : false,
    guestActionCount,
    guestWtUsed,
    shouldShowWall,
    trackAction,
    trackWtUse,
    showWall,
    setShowWall,
  };
}
