"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── constants ──────────────────────────────────────────── */

const RED = "#ff2a2a";

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 9, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 1899, name: "Max" },
  { id: 350, name: "Apple TV+" },
  { id: 531, name: "Paramount+" },
  { id: 15, name: "Hulu" },
  { id: 386, name: "Peacock" },
  { id: 76, name: "Viaplay" },
  { id: 439, name: "TV 2 Play" },
];

const NORDIC_ONLY_PROVIDERS = new Set([76, 439]);
const US_ONLY_PROVIDERS = new Set([15, 386]);

/* ── component ──────────────────────────────────────────── */

export default function GroupPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"choose" | "create" | "join">("choose");
  const [displayName, setDisplayName] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"both" | "movie" | "tv">("both");
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRegion, setUserRegion] = useState("US");

  const guestIdRef = useRef("");

  useEffect(() => {
    // Guest ID setup (same pattern as together/page.tsx)
    let gid = "";
    try { gid = localStorage.getItem("wt_guest_id") ?? ""; } catch { /* ignore */ }
    if (!gid) {
      gid = crypto.randomUUID();
      try { localStorage.setItem("wt_guest_id", gid); } catch { /* incognito */ }
    }
    guestIdRef.current = gid;

    // Detect region
    fetch("/api/tmdb/region").then(r => r.json()).then(d => {
      if (d.region) setUserRegion(d.region);
    }).catch(() => {});
  }, []);

  const visibleProviders = PROVIDERS.filter((p) => {
    if (NORDIC_ONLY_PROVIDERS.has(p.id) && !["NO", "SE", "DK", "FI", "IS"].includes(userRegion)) return false;
    if (US_ONLY_PROVIDERS.has(p.id) && userRegion !== "US") return false;
    return true;
  });

  function toggleProvider(id: number) {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!displayName.trim()) { setError("Skriv inn et navn"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/group/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current },
        body: JSON.stringify({
          display_name: displayName.trim(),
          media_filter: mediaFilter,
          provider_ids: selectedProviders,
          provider_region: userRegion,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Persist session identity for refresh survival
      try {
        const payload = { sessionId: data.session.id, guestId: guestIdRef.current, code: data.code };
        localStorage.setItem("logflix_group_session", JSON.stringify(payload));
        sessionStorage.setItem("logflix_group_session", JSON.stringify(payload));
      } catch { /* ignore */ }
      router.push(`/group/${data.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt");
    }
    setLoading(false);
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setError("Skriv inn koden"); return; }
    if (!displayName.trim()) { setError("Skriv inn et navn"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/group/session/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WT-Guest-ID": guestIdRef.current },
        body: JSON.stringify({
          code,
          display_name: displayName.trim(),
          provider_ids: selectedProviders,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Persist session identity for refresh survival
      try {
        const payload = { sessionId: data.session.id, guestId: guestIdRef.current, code: data.session.code };
        localStorage.setItem("logflix_group_session", JSON.stringify(payload));
        sessionStorage.setItem("logflix_group_session", JSON.stringify(payload));
      } catch { /* ignore */ }
      router.push(`/group/${data.session.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt");
    }
    setLoading(false);
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
    opacity: loading ? 0.6 : 1,
  };

  const btnGlass: React.CSSProperties = {
    ...glass,
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
    width: "100%",
    textAlign: "center" as const,
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 16,
    width: "100%",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <Image src="/logo.png" alt="Logflix" width={130} height={41} style={{ height: "auto" }} priority />
      </div>

      {/* Choose screen */}
      {screen === "choose" && (
        <div style={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>
            Gruppe
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 15, marginBottom: 16 }}>
            Sveip med venner. Stem på favorittene. Finn noe alle liker.
          </p>

          <button onClick={() => setScreen("create")} style={btnPrimary}>
            Opprett gruppe
          </button>
          <button onClick={() => setScreen("join")} style={btnGlass}>
            Bli med i gruppe
          </button>

          <button onClick={() => router.push("/together")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", marginTop: 8 }}>
            ← Tilbake til Se Sammen
          </button>
        </div>
      )}

      {/* Create screen */}
      {screen === "create" && (
        <div style={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center" }}>Opprett gruppe</h2>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Ditt navn</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Skriv navnet ditt..."
              style={inputStyle}
              maxLength={30}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Hva vil dere se?</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["both", "movie", "tv"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMediaFilter(f)}
                  style={{
                    ...glass,
                    flex: 1,
                    padding: "10px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: mediaFilter === f ? RED : "rgba(255,255,255,0.6)",
                    border: mediaFilter === f ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    borderRadius: 10,
                    textAlign: "center" as const,
                  }}
                >
                  {f === "both" ? "Alt" : f === "movie" ? "Film" : "Serier"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Strømmetjenester (valgfritt)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {visibleProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleProvider(p.id)}
                  style={{
                    ...glass,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: selectedProviders.includes(p.id) ? RED : "rgba(255,255,255,0.6)",
                    border: selectedProviders.includes(p.id) ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    borderRadius: 8,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: RED, fontSize: 14, textAlign: "center" }}>{error}</p>}

          <button onClick={handleCreate} disabled={loading} style={btnPrimary}>
            {loading ? "Oppretter..." : "Opprett"}
          </button>

          <button onClick={() => { setScreen("choose"); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>
            ← Tilbake
          </button>
        </div>
      )}

      {/* Join screen */}
      {screen === "join" && (
        <div style={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center" }}>Bli med i gruppe</h2>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Ditt navn</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Skriv navnet ditt..."
              style={inputStyle}
              maxLength={30}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Gruppekode</label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="F.eks. AB3KM"
              style={{ ...inputStyle, textAlign: "center", fontSize: 24, fontWeight: 700, letterSpacing: 6 }}
              maxLength={5}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Strømmetjenester (valgfritt)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {visibleProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleProvider(p.id)}
                  style={{
                    ...glass,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: selectedProviders.includes(p.id) ? RED : "rgba(255,255,255,0.6)",
                    border: selectedProviders.includes(p.id) ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    borderRadius: 8,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: RED, fontSize: 14, textAlign: "center" }}>{error}</p>}

          <button onClick={handleJoin} disabled={loading} style={btnPrimary}>
            {loading ? "Blir med..." : "Bli med"}
          </button>

          <button onClick={() => { setScreen("choose"); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>
            ← Tilbake
          </button>
        </div>
      )}
    </div>
  );
}
