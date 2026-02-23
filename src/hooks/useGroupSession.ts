"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { GroupStateResponse } from "@/types/group";

const POLL_INTERVAL = 2000;

export function useGroupSession(sessionId: string | null, guestId: string) {
  const [state, setState] = useState<GroupStateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/group/session/${sessionId}`, {
        headers: { "X-WT-Guest-ID": guestId },
      });
      if (!mountedRef.current) return;
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Network error" }));
        setError(data.error || "Error");
        return;
      }
      const data: GroupStateResponse = await res.json();
      setState(data);
      setError(null);
    } catch {
      if (mountedRef.current) setError("Network error");
    }
  }, [sessionId, guestId]);

  useEffect(() => {
    mountedRef.current = true;
    if (!sessionId) return;
    setLoading(true);
    poll().finally(() => { if (mountedRef.current) setLoading(false); });
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [sessionId, poll]);

  return { state, loading, error, refetch: poll };
}
