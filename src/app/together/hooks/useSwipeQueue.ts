"use client";

import { useRef, useState, useCallback } from "react";
import type { QueuedSwipe } from "../lib/constants";

interface UseSwipeQueueOptions {
  sessionId: string | null;
  round: number;
  guestId: string;
}

function generateSwipeId(): string {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export default function useSwipeQueue({ sessionId, round, guestId }: UseSwipeQueueOptions) {
  const swipeQueue = useRef<QueuedSwipe[]>([]);
  const inFlight = useRef<Set<string>>(new Set());
  const queueWorkerRunning = useRef(false);
  const [, forceRender] = useState(0);

  function submitPairedSwipe(
    sid: string, tmdbId: number, mediaType: "movie" | "tv", action: string
  ): Promise<{ ok: boolean; data?: Record<string, unknown> }> {
    const body = JSON.stringify({ session_id: sid, tmdb_id: tmdbId, type: mediaType, action });
    const hdrs = { "Content-Type": "application/json", "X-WT-Guest-ID": guestId };
    return fetch("/api/together/session/swipe", { method: "POST", headers: hdrs, body })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d as Record<string, unknown> })))
      .catch(() => ({ ok: false }));
  }

  function requeueItem(item: QueuedSwipe) {
    const attempt = item.attempt + 1;
    const backoffMs = attempt <= 5 ? Math.pow(2, attempt - 1) * 1000 : 15000;
    const status: QueuedSwipe["status"] = attempt >= 5 ? "stuck" : "pending";

    swipeQueue.current = swipeQueue.current.map((s) =>
      s.clientSwipeId === item.clientSwipeId
        ? { ...s, status, attempt, nextRetryAt: Date.now() + backoffMs }
        : s
    );
    forceRender((x) => x + 1);

    if (status === "stuck") {
      queueWorkerRunning.current = false;
      setTimeout(startQueueWorker, 15000);
    }
  }

  function startQueueWorker() {
    if (queueWorkerRunning.current) return;
    queueWorkerRunning.current = true;

    async function tick() {
      const now = Date.now();
      const pending = swipeQueue.current.filter(
        (s) => s.status === "pending" && s.nextRetryAt <= now
      );

      for (const item of pending) {
        if (inFlight.current.has(item.clientSwipeId)) continue;

        inFlight.current.add(item.clientSwipeId);
        swipeQueue.current = swipeQueue.current.map((s) =>
          s.clientSwipeId === item.clientSwipeId ? { ...s, status: "inflight" as const } : s
        );

        submitPairedSwipe(item.sessionId, item.tmdbId, item.type, item.action)
          .then((result) => {
            inFlight.current.delete(item.clientSwipeId);
            if (result?.ok) {
              swipeQueue.current = swipeQueue.current.filter(
                (s) => s.clientSwipeId !== item.clientSwipeId
              );
            } else {
              requeueItem(item);
            }
            forceRender((x) => x + 1);
          })
          .catch(() => {
            inFlight.current.delete(item.clientSwipeId);
            requeueItem(item);
          });
      }

      const hasActive = swipeQueue.current.some(
        (s) => s.status === "pending" || s.status === "inflight" || s.status === "stuck"
      );
      if (hasActive) {
        setTimeout(tick, 1000);
      } else {
        queueWorkerRunning.current = false;
      }
    }

    tick();
  }

  const enqueue = useCallback((
    tmdbId: number,
    type: "movie" | "tv",
    action: "like" | "nope" | "superlike"
  ) => {
    if (!sessionId) return;

    const alreadyQueued = swipeQueue.current.some(
      (s) => s.tmdbId === tmdbId && s.round === round && s.sessionId === sessionId && s.status !== "ack"
    );
    if (alreadyQueued) return;

    const item: QueuedSwipe = {
      clientSwipeId: generateSwipeId(),
      sessionId,
      tmdbId,
      type,
      action,
      round,
      createdAt: Date.now(),
      attempt: 0,
      nextRetryAt: Date.now(),
      status: "pending",
    };

    swipeQueue.current = [...swipeQueue.current, item];
    forceRender((x) => x + 1);
    startQueueWorker();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, round]);

  const queueStatus: "idle" | "pending" | "stuck" =
    swipeQueue.current.some((s) => s.status === "stuck") ? "stuck" :
    swipeQueue.current.some((s) => s.status === "pending" || s.status === "inflight") ? "pending" :
    "idle";

  const hasPending = swipeQueue.current.some(
    (s) => s.status === "pending" || s.status === "inflight"
  );

  const drainQueue = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      function check() {
        const active = swipeQueue.current.some(
          (s) => s.status === "pending" || s.status === "inflight"
        );
        if (!active) { resolve(); return; }
        setTimeout(check, 200);
      }
      check();
    });
  }, []);

  return { enqueue, queueStatus, hasPending, drainQueue, swipeQueue, inFlight, queueWorkerRunning, forceRender, setSyncingBeforeEnd: forceRender };
}
