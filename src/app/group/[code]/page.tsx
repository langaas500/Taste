"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useGroupSession } from "@/hooks/useGroupSession";
import type { GroupPoolItem, GroupStateResponse } from "@/types/group";

/* ── constants ──────────────────────────────────────────── */

const RED = "#ff2a2a";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const STORAGE_KEY = "logflix_group_session";

function clamp(v: number, min: number, max: number) { return Math.min(Math.max(v, min), max); }

function readStoredSession(): { sessionId: string; guestId: string; code: string } | null {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed?.sessionId && parsed?.guestId && parsed?.code) return parsed;
    } catch { /* ignore */ }
  }
  return null;
}

function clearStoredSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/* ── component ──────────────────────────────────────────── */

export default function GroupSessionPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Swipe state
  const [deckIndex, setDeckIndex] = useState(0);
  const [swipe, setSwipe] = useState({ x: 0, y: 0, rot: 0, dragging: false });
  const [fly, setFly] = useState({ active: false, x: 0, rot: 0 });
  const ptr = useRef<{ id: number | null; sx: number; sy: number; target: HTMLElement | null }>({ id: null, sx: 0, sy: 0, target: null });

  // Final vote state
  const [selectedFinalist, setSelectedFinalist] = useState<number | null>(null);

  const guestIdRef = useRef("");

  // Restore identity on mount: sessionStorage → localStorage → redirect
  useEffect(() => {
    if (sessionId) return; // already resolved

    // 1. Try restoring from storage
    const stored = readStoredSession();
    if (stored && stored.code === code) {
      guestIdRef.current = stored.guestId;
      setSessionId(stored.sessionId);
      return;
    }

    // 2. No match — ensure we have a guest ID, then try joining (lobby case)
    let gid = "";
    try { gid = localStorage.getItem("wt_guest_id") ?? ""; } catch { /* ignore */ }
    if (!gid) {
      gid = crypto.randomUUID();
      try { localStorage.setItem("wt_guest_id", gid); } catch { /* incognito */ }
    }
    guestIdRef.current = gid;

    // If we had stored data for a different code, clear it
    if (stored && stored.code !== code) clearStoredSession();

    // 3. Try joining (works for lobby sessions; idempotent if already joined)
    const resolve = async () => {
      try {
        const name = localStorage.getItem("wt_group_name") || "Gjest";
        const res = await fetch("/api/group/session/join", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-WT-Guest-ID": gid },
          body: JSON.stringify({ code, display_name: name }),
        });
        const data = await res.json();
        if (data.session?.id) {
          setSessionId(data.session.id);
          // Persist for future refreshes
          try {
            const payload = { sessionId: data.session.id, guestId: gid, code };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          } catch { /* ignore */ }
        } else if (data.error) {
          // Can't join (session past lobby or not found) — redirect to /group
          router.replace("/group");
        }
      } catch {
        setActionError("Kunne ikke koble til");
      }
    };
    resolve();
  }, [code, sessionId, router]);

  const { state, loading, error: pollError } = useGroupSession(sessionId, guestIdRef.current);

  const isHost = state?.is_host === true;
  const pool = state?.pool || [];
  const participants = state?.participants || [];
  const sessionStatus = state?.session?.status;

  // Clear stored session when completed or cancelled
  useEffect(() => {
    if (sessionStatus === "completed") {
      clearStoredSession();
    }
  }, [sessionStatus]);

  /* ── actions ── */

  async function apiCall(url: string, body: Record<string, unknown>) {
    setActionLoading(true); setActionError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Noe gikk galt";
      setActionError(msg);
      return null;
    } finally {
      setActionLoading(false);
    }
  }

  async function startPoolBuild() {
    if (!sessionId) return;
    await apiCall("/api/group/pool/build", { session_id: sessionId });
  }

  async function submitVote(item: GroupPoolItem, vote: "liked" | "neutral" | "disliked") {
    if (!sessionId) return;
    await apiCall("/api/group/vote", {
      session_id: sessionId,
      tmdb_id: item.tmdb_id,
      media_type: item.media_type,
      vote,
    });
    setDeckIndex((i) => i + 1);
  }

  async function computeFinalists() {
    if (!sessionId) return;
    await apiCall("/api/group/compute-finalists", { session_id: sessionId });
  }

  async function submitFinalVote() {
    if (!sessionId || selectedFinalist == null) return;
    await apiCall("/api/group/final-vote", { session_id: sessionId, tmdb_id: selectedFinalist });
  }

  async function finalize() {
    if (!sessionId) return;
    await apiCall("/api/group/finalize", { session_id: sessionId });
  }

  /* ── swipe handlers (same pattern as together/page.tsx) ── */

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (fly.active || !pool[deckIndex]) return;
    ptr.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, target: e.currentTarget };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSwipe({ x: 0, y: 0, rot: 0, dragging: true });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (ptr.current.id !== e.pointerId || !swipe.dragging) return;
    const dx = e.clientX - ptr.current.sx;
    setSwipe({ x: dx, y: 0, rot: clamp(dx / 18, -14, 14), dragging: true });
  }

  function endSwipe() {
    const top = pool[deckIndex];
    if (!top) return;
    let vote: "liked" | "disliked" | null = null;
    if (swipe.x > 100) vote = "liked";
    else if (swipe.x < -100) vote = "disliked";
    if (!vote) { setSwipe({ x: 0, y: 0, rot: 0, dragging: false }); return; }
    const outX = vote === "liked" ? window.innerWidth * 1.1 : -window.innerWidth * 1.1;
    setFly({ active: true, x: outX, rot: vote === "liked" ? 20 : -20 });
    const decidedVote = vote;
    window.setTimeout(() => {
      setFly({ active: false, x: 0, rot: 0 });
      setSwipe({ x: 0, y: 0, rot: 0, dragging: false });
      submitVote(top, decidedVote);
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

  /* ── styles ── */

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    backdropFilter: "blur(12px)",
  };

  const btnPrimary: React.CSSProperties = {
    background: RED,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    opacity: actionLoading ? 0.6 : 1,
  };

  /* ── loading / error ── */

  if (!sessionId && !actionError) {
    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Kobler til...</p>
      </div>
    );
  }

  if (actionError && !state) {
    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <p style={{ color: RED }}>{actionError}</p>
        <button onClick={() => router.push("/group")} style={{ ...btnPrimary, maxWidth: 300 }}>Tilbake</button>
      </div>
    );
  }

  /* ── LOBBY ── */
  if (sessionStatus === "lobby" || sessionStatus === "pool_ready") {
    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", gap: 24 }}>
        <Image src="/logo.png" alt="Logflix" width={110} height={35} style={{ height: "auto" }} priority />

        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Gruppe</h1>

        {/* Code display */}
        <div style={{ ...glass, padding: "20px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Kode</p>
          <p style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: RED }}>{code}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Del koden med vennene dine</p>
        </div>

        {/* Participants */}
        <div style={{ ...glass, padding: 20, width: "100%", maxWidth: 400 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Deltakere ({participants.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {participants.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                  {(p.display_name || "?")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  {p.display_name || "Anonym"}
                  {p.user_id === state?.session?.host_user_id && (
                    <span style={{ color: RED, fontSize: 12, marginLeft: 6 }}>Vert</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {actionError && <p style={{ color: RED, fontSize: 14 }}>{actionError}</p>}

        {isHost ? (
          <div style={{ width: "100%", maxWidth: 400 }}>
            <button
              onClick={startPoolBuild}
              disabled={actionLoading || participants.length < (state?.session?.min_participants || 2)}
              style={{
                ...btnPrimary,
                opacity: actionLoading || participants.length < (state?.session?.min_participants || 2) ? 0.5 : 1,
              }}
            >
              {sessionStatus === "pool_ready" ? "Bygger..." : actionLoading ? "Starter..." : "Start sveipingen"}
            </button>
            {participants.length < (state?.session?.min_participants || 2) && (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
                Venter på minst {state?.session?.min_participants || 2} deltakere
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Venter på at verten starter...</p>
        )}
      </div>
    );
  }

  /* ── SWIPING ── */
  if (sessionStatus === "swiping") {
    const doneSwiping = deckIndex >= pool.length;
    const currentItem = pool[deckIndex];
    const myVoteCount = state?.my_vote_count || 0;
    const allParticipantsDone = participants.every((p) => {
      const count = state?.votes_per_participant?.[p.user_id] || 0;
      return count >= pool.length;
    });

    if (doneSwiping) {
      return (
        <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", gap: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Ferdig!</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
            Du har sveipet alle {pool.length} titler.
          </p>

          {/* Progress per participant */}
          <div style={{ ...glass, padding: 20, width: "100%", maxWidth: 400 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Fremgang</p>
            {participants.map((p) => {
              const count = state?.votes_per_participant?.[p.user_id] || 0;
              const pct = pool.length > 0 ? Math.round((count / pool.length) * 100) : 0;
              return (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>{p.display_name || "Anonym"}</span>
                    <span style={{ color: pct >= 100 ? "#4ade80" : "rgba(255,255,255,0.4)" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? "#4ade80" : RED, borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {isHost && allParticipantsDone && (
            <button onClick={computeFinalists} disabled={actionLoading} style={{ ...btnPrimary, maxWidth: 400 }}>
              {actionLoading ? "Beregner..." : "Vis finalister"}
            </button>
          )}

          {isHost && !allParticipantsDone && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Venter på at alle er ferdige...</p>
          )}

          {!isHost && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Venter på at verten avslutter runden...</p>
          )}
        </div>
      );
    }

    // Card stack
    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 24px" }}>
        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 400, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            <span>{deckIndex + 1} / {pool.length}</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${((deckIndex + 1) / pool.length) * 100}%`, background: RED, borderRadius: 2, transition: "width 0.2s" }} />
          </div>
        </div>

        {/* Card */}
        {currentItem && (
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 340,
              aspectRatio: "2/3",
              borderRadius: 20,
              overflow: "hidden",
              touchAction: "none",
              userSelect: "none",
              transform: fly.active
                ? `translateX(${fly.x}px) rotate(${fly.rot}deg)`
                : `translateX(${swipe.x}px) rotate(${swipe.rot}deg)`,
              transition: fly.active ? "transform 0.2s ease-out" : swipe.dragging ? "none" : "transform 0.3s ease-out",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {/* Poster */}
            {currentItem.poster_path ? (
              <img
                src={`${TMDB_IMG}${currentItem.poster_path}`}
                alt={currentItem.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                draggable={false}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>{currentItem.title}</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)" }} />

            {/* Title info */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px" }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{currentItem.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                {currentItem.year}{currentItem.vote_average ? ` · ★ ${currentItem.vote_average.toFixed(1)}` : ""}
                {" · "}{currentItem.media_type === "movie" ? "Film" : "Serie"}
              </p>
            </div>

            {/* Swipe indicators */}
            {swipe.x > 40 && (
              <div style={{ position: "absolute", top: 24, left: 24, background: "#4ade80", color: "#000", padding: "6px 16px", borderRadius: 8, fontWeight: 700, fontSize: 16, transform: `rotate(-12deg)` }}>
                LIKER
              </div>
            )}
            {swipe.x < -40 && (
              <div style={{ position: "absolute", top: 24, right: 24, background: RED, color: "#fff", padding: "6px 16px", borderRadius: 8, fontWeight: 700, fontSize: 16, transform: `rotate(12deg)` }}>
                NEI
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
          <button
            onClick={() => currentItem && submitVote(currentItem, "disliked")}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: RED, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
          <button
            onClick={() => currentItem && submitVote(currentItem, "neutral")}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            —
          </button>
          <button
            onClick={() => currentItem && submitVote(currentItem, "liked")}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#4ade80", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ♥
          </button>
        </div>
      </div>
    );
  }

  /* ── FINAL VOTING ── */
  if (sessionStatus === "final_voting") {
    const finalists = state?.finalists || [];
    const finalVotes = state?.session?.final_votes as Record<string, string> | undefined;
    const myFinalVote = finalVotes?.[guestIdRef.current];
    const allVoted = participants.every((p) => finalVotes?.[p.user_id]);

    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", gap: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Velg favoritt</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center" }}>
          Stem på den dere vil se
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 400 }}>
          {finalists.map((item) => {
            const isSelected = selectedFinalist === item.tmdb_id || myFinalVote === String(item.tmdb_id);
            const voteCount = finalVotes
              ? Object.values(finalVotes).filter((v) => v === String(item.tmdb_id)).length
              : 0;

            return (
              <button
                key={item.tmdb_id}
                onClick={() => !myFinalVote && setSelectedFinalist(item.tmdb_id)}
                disabled={!!myFinalVote}
                style={{
                  ...glass,
                  padding: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "stretch",
                  cursor: myFinalVote ? "default" : "pointer",
                  border: isSelected ? `2px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
                  textAlign: "left" as const,
                }}
              >
                {item.poster_path && (
                  <img
                    src={`${TMDB_IMG}${item.poster_path}`}
                    alt={item.title}
                    style={{ width: 80, minHeight: 120, objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: "12px 16px", flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#fff" }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {item.year}{item.vote_average ? ` · ★ ${item.vote_average.toFixed(1)}` : ""}
                  </p>
                  {myFinalVote && voteCount > 0 && (
                    <p style={{ fontSize: 12, color: RED, marginTop: 6 }}>
                      {voteCount} {voteCount === 1 ? "stemme" : "stemmer"}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div style={{ display: "flex", alignItems: "center", paddingRight: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>✓</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {actionError && <p style={{ color: RED, fontSize: 14 }}>{actionError}</p>}

        {!myFinalVote && selectedFinalist != null && (
          <button onClick={submitFinalVote} disabled={actionLoading} style={{ ...btnPrimary, maxWidth: 400 }}>
            {actionLoading ? "Stemmer..." : "Stem"}
          </button>
        )}

        {myFinalVote && !allVoted && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Du har stemt! Venter på de andre...
          </p>
        )}

        {/* Participant vote status */}
        <div style={{ ...glass, padding: 16, width: "100%", maxWidth: 400 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Stemmer</p>
          {participants.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: finalVotes?.[p.user_id] ? "#4ade80" : "rgba(255,255,255,0.15)" }} />
              <span style={{ fontSize: 14 }}>{p.display_name || "Anonym"}</span>
            </div>
          ))}
        </div>

        {isHost && allVoted && (
          <button onClick={finalize} disabled={actionLoading} style={{ ...btnPrimary, maxWidth: 400 }}>
            {actionLoading ? "Avslutter..." : "Vis vinneren"}
          </button>
        )}
      </div>
    );
  }

  /* ── COMPLETED ── */
  if (sessionStatus === "completed") {
    const pick = state?.final_pick;
    return (
      <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", gap: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Dere skal se</h2>

        {pick ? (
          <div style={{ ...glass, overflow: "hidden", maxWidth: 340, width: "100%", textAlign: "center" as const }}>
            {pick.poster_path && (
              <img
                src={`${TMDB_IMG}${pick.poster_path}`}
                alt={pick.title}
                style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "20px 16px" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{pick.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                {pick.year}{pick.vote_average ? ` · ★ ${pick.vote_average.toFixed(1)}` : ""}
                {" · "}{pick.media_type === "movie" ? "Film" : "Serie"}
              </p>
              {pick.overview && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 12, lineHeight: 1.5 }}>
                  {pick.overview.slice(0, 200)}{pick.overview.length > 200 ? "..." : ""}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Ingen vinner funnet</p>
        )}

        <button onClick={() => { clearStoredSession(); router.push("/group"); }} style={{ ...btnPrimary, maxWidth: 340 }}>
          Ny runde
        </button>
      </div>
    );
  }

  /* ── fallback ── */
  return (
    <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.5)" }}>{loading ? "Laster..." : pollError || "Ukjent status"}</p>
    </div>
  );
}
