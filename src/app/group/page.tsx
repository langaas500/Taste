"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getLocale, type Locale } from "@/app/together/strings";

/* ── constants ──────────────────────────────────────────── */

const RED = "#ff2a2a";
const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w185";

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

/* ── i18n strings ─────────────────────────────────────── */
const ls = {
  group:        { no: "Gruppe",           en: "Group" },
  subtext:      { no: "Sveip. Stem. Se sammen.", en: "Swipe. Vote. Watch together." },
  createGroup:  { no: "Opprett gruppe",   en: "Create group" },
  joinGroup:    { no: "Bli med",          en: "Join group" },
  yourName:     { no: "Ditt navn",        en: "Your name" },
  namePlaceholder: { no: "Skriv navnet ditt…", en: "Enter your name…" },
  whatToWatch:  { no: "Hva vil dere se?", en: "What do you want to watch?" },
  all:          { no: "Alt",              en: "All" },
  movies:       { no: "Film",             en: "Movies" },
  series:       { no: "Serier",           en: "Series" },
  providers:    { no: "Strømmetjenester", en: "Streaming services" },
  optional:     { no: "valgfritt",        en: "optional" },
  creating:     { no: "Oppretter…",       en: "Creating…" },
  create:       { no: "Opprett",          en: "Create" },
  back:         { no: "Tilbake",          en: "Back" },
  enterName:    { no: "Skriv inn et navn", en: "Enter a name" },
  enterCode:    { no: "Skriv inn koden",  en: "Enter the code" },
  groupCode:    { no: "Gruppekode",       en: "Group code" },
  codePlaceholder: { no: "F.eks. AB3KM",  en: "e.g. AB3KM" },
  joining:      { no: "Blir med…",        en: "Joining…" },
  join:         { no: "Bli med",          en: "Join" },
  somethingWrong: { no: "Noe gikk galt", en: "Something went wrong" },
} as const;

function lt(locale: Locale, key: keyof typeof ls): string {
  return ls[key][locale];
}

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
  const [locale, setLocale] = useState<Locale>("en");
  const [ribbonPosters, setRibbonPosters] = useState<string[]>([]);

  const guestIdRef = useRef("");

  useEffect(() => {
    // Guest ID setup
    let gid = "";
    try { gid = localStorage.getItem("wt_guest_id") ?? ""; } catch { /* ignore */ }
    if (!gid) {
      gid = crypto.randomUUID();
      try { localStorage.setItem("wt_guest_id", gid); } catch { /* incognito */ }
    }
    guestIdRef.current = gid;

    // Restore name from previous session
    try {
      const saved = localStorage.getItem("wt_group_name");
      if (saved) setDisplayName(saved);
    } catch { /* ignore */ }

    // Fetch posters + region
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) {
          setUserRegion(data.region as string);
          const params = new URLSearchParams(window.location.search);
          const langParam = params.get("lang");
          if (langParam === "no" || langParam === "en") {
            setLocale(langParam as Locale);
          } else {
            setLocale(getLocale(data.region as string));
          }
        }
        if (Array.isArray(data.posters) && data.posters.length > 0) {
          setRibbonPosters(data.posters as string[]);
        }
      })
      .catch(() => {});
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
    if (!displayName.trim()) { setError(lt(locale, "enterName")); return; }
    setLoading(true); setError("");
    // Save name for next time
    try { localStorage.setItem("wt_group_name", displayName.trim()); } catch { /* ignore */ }
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
      try {
        const payload = { sessionId: data.session.id, guestId: guestIdRef.current, code: data.code };
        localStorage.setItem("logflix_group_session", JSON.stringify(payload));
        sessionStorage.setItem("logflix_group_session", JSON.stringify(payload));
      } catch { /* ignore */ }
      router.push(`/group/${data.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : lt(locale, "somethingWrong"));
    }
    setLoading(false);
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setError(lt(locale, "enterCode")); return; }
    if (!displayName.trim()) { setError(lt(locale, "enterName")); return; }
    setLoading(true); setError("");
    try { localStorage.setItem("wt_group_name", displayName.trim()); } catch { /* ignore */ }
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
      try {
        const payload = { sessionId: data.session.id, guestId: guestIdRef.current, code: data.session.code };
        localStorage.setItem("logflix_group_session", JSON.stringify(payload));
        sessionStorage.setItem("logflix_group_session", JSON.stringify(payload));
      } catch { /* ignore */ }
      router.push(`/group/${data.session.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : lt(locale, "somethingWrong"));
    }
    setLoading(false);
  }

  /* ── shared styles ── */
  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
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

  /* ── poster-drift background ── */
  const posterBg = ribbonPosters.length > 0 && (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
        {[...ribbonPosters, ...ribbonPosters].map((url, i) => (
          <img key={i} src={`${TMDB_IMG_SM}${url}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.5, filter: "blur(2px)", flexShrink: 0 }} />
        ))}
      </div>
      {/* Edge fade + darken center slightly */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #06080f 0%, rgba(6,8,15,0.55) 15%, rgba(6,8,15,0.55) 85%, #06080f 100%)", pointerEvents: "none" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#06080f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}} />

      {posterBg}

      {/* Back arrow (on create/join screens) */}
      <button
        onClick={() => {
          if (screen === "choose") { router.push("/together"); }
          else { setScreen("choose"); setError(""); }
        }}
        style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 22, cursor: "pointer", zIndex: 10, lineHeight: 1 }}
        aria-label={lt(locale, "back")}
      >
        ←
      </button>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <Image src="/logo.png" alt="Logflix" width={110} height={35} style={{ height: "auto" }} priority />
        </div>

        {/* Choose screen */}
        {screen === "choose" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center" }}>
              {lt(locale, "group")}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", fontSize: 15, marginBottom: 8, maxWidth: 300 }}>
              {lt(locale, "subtext")}
            </p>

            {/* Name input always visible */}
            <div style={{ width: "100%", maxWidth: 320 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "yourName")}
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={lt(locale, "namePlaceholder")}
                style={inputStyle}
                maxLength={30}
              />
            </div>

            {/* Glass cards side by side */}
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button
                onClick={() => setScreen("create")}
                style={{
                  ...glass,
                  flex: 1,
                  padding: "20px 16px",
                  minHeight: 130,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <span style={{ fontSize: 32, lineHeight: 1, color: "rgba(255,255,255,0.8)" }}>+</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                  {lt(locale, "createGroup")}
                </span>
              </button>

              <button
                onClick={() => setScreen("join")}
                style={{
                  ...glass,
                  flex: 1,
                  padding: "20px 16px",
                  minHeight: 130,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <span style={{ fontSize: 32, lineHeight: 1, color: "rgba(255,255,255,0.8)" }}>→</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                  {lt(locale, "joinGroup")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Create screen */}
        {screen === "create" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center" }}>{lt(locale, "createGroup")}</h2>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "yourName")}
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={lt(locale, "namePlaceholder")}
                style={inputStyle}
                maxLength={30}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "whatToWatch")}
              </label>
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
                      border: mediaFilter === f ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.10)",
                      cursor: "pointer",
                      borderRadius: 10,
                      textAlign: "center" as const,
                    }}
                  >
                    {f === "both" ? lt(locale, "all") : f === "movie" ? lt(locale, "movies") : lt(locale, "series")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "providers")} <span style={{ textTransform: "lowercase", letterSpacing: 0 }}>({lt(locale, "optional")})</span>
              </label>
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
                      border: selectedProviders.includes(p.id) ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.10)",
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
              {loading ? lt(locale, "creating") : lt(locale, "create")}
            </button>
          </div>
        )}

        {/* Join screen */}
        {screen === "join" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center" }}>{lt(locale, "joinGroup")}</h2>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "yourName")}
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={lt(locale, "namePlaceholder")}
                style={inputStyle}
                maxLength={30}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "groupCode")}
              </label>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={lt(locale, "codePlaceholder")}
                style={{ ...inputStyle, textAlign: "center", fontSize: 24, fontWeight: 700, letterSpacing: 6 }}
                maxLength={5}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                {lt(locale, "providers")} <span style={{ textTransform: "lowercase", letterSpacing: 0 }}>({lt(locale, "optional")})</span>
              </label>
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
                      border: selectedProviders.includes(p.id) ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.10)",
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
              {loading ? lt(locale, "joining") : lt(locale, "join")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
