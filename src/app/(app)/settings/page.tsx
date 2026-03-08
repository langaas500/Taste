"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import PremiumModal from "@/components/PremiumModal";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchLinks, createInvite, acceptInvite, updateLinkSharing, revokeLink, fetchLists } from "@/lib/api";
import { FILTER_PRESETS, presetsToFilters, filtersToPresets } from "@/lib/filter-presets";
import { SUPPORTED_REGIONS, REGION_LABELS, type SupportedRegion } from "@/lib/region";
import type { AccountLinkDisplay, CustomList, ContentFilters } from "@/lib/types";

/* ── Shared glass card style ──────────────────────────── */

const glassCard = "rounded-2xl border border-white/[0.06] p-5 transition-all duration-200 hover:border-white/[0.1]";
const glassCardStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
};

const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 mb-1";
const sectionDesc = "text-[12px] text-white/60 leading-relaxed mb-4";

/* ── SVG Icons (inline, no dependencies) ─────────────── */

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CompassIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

function RefreshIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

/* ── Ghost button (shared) ────────────────────────────── */

function GhostButton({
  children,
  onClick,
  disabled,
  danger,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  const base = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer disabled:opacity-40 disabled:pointer-events-none";
  const color = danger
    ? "border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40"
    : "border-white/[0.08] text-white/65 hover:bg-[rgba(229,9,20,0.08)] hover:text-white hover:border-[rgba(229,9,20,0.3)]";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${color} ${className}`}>
      {children}
    </button>
  );
}

/* ── Main ─────────────────────────────────────────────── */

function SettingsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [traktConnected, setTraktConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [explorationSlider, setExplorationSlider] = useState(50);
  const [savingSlider, setSavingSlider] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [links, setLinks] = useState<AccountLinkDisplay[]>([]);
  const [myLists, setMyLists] = useState<CustomList[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [acceptCode, setAcceptCode] = useState("");
  const [acceptMsg, setAcceptMsg] = useState("");
  const [managingLinkId, setManagingLinkId] = useState<string | null>(null);
  const [activePresets, setActivePresets] = useState<string[]>([]);
  const [savingFilters, setSavingFilters] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<SupportedRegion>("US");
  const [savingRegion, setSavingRegion] = useState(false);
  const [showSliderInfo, setShowSliderInfo] = useState(false);

  const traktMsg = searchParams.get("trakt");
  const errorMsg = searchParams.get("error");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setExplorationSlider(data.profile.exploration_slider ?? 50);
        setDisplayName(data.profile.display_name || "");
        setIsPremium(!!data.profile.is_premium);
        if (data.profile.preferred_region) setSelectedRegion(data.profile.preferred_region);
        const filters = (data.profile.content_filters || {}) as ContentFilters;
        setActivePresets(filtersToPresets(filters));
      }
    } catch {}

    try {
      const [linksData, listsData] = await Promise.all([fetchLinks(), fetchLists()]);
      setLinks(linksData.links);
      setMyLists(listsData.lists as CustomList[]);
    } catch {}

    if (traktMsg === "connected") setTraktConnected(true);
    setLoading(false);
  }

  async function handleSync(mode: "merge" | "overwrite" = "merge") {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/trakt/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncResult(`Synced! ${data.watched} watched, ${data.watchlist} watchlist items. (${data.cached} titles cached)`);
    } catch (e: unknown) {
      setSyncResult(`Error: ${e instanceof Error ? e.message : "Sync failed"}`);
    }
    setSyncing(false);
  }

  async function saveSlider(value: number) {
    setSavingSlider(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exploration_slider: value }),
      });
    } catch {}
    setSavingSlider(false);
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === displayName) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: trimmed }),
      });
      setDisplayName(trimmed);
    } catch {}
    setSavingName(false);
    setEditingName(false);
  }

  async function togglePreset(presetId: string) {
    const newActive = activePresets.includes(presetId)
      ? activePresets.filter((id) => id !== presetId)
      : [...activePresets, presetId];
    setActivePresets(newActive);
    setSavingFilters(true);
    try {
      const newFilters = presetsToFilters(newActive);
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_filters: newFilters }),
      });
    } catch { setActivePresets(activePresets); }
    setSavingFilters(false);
  }

  async function saveRegion(region: SupportedRegion) {
    setSelectedRegion(region);
    setSavingRegion(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_region: region }),
      });
    } catch {}
    setSavingRegion(false);
  }

  async function handleGenerateInvite() {
    try {
      const data = await createInvite();
      setInviteCode(data.link.invite_code);
      setLinks((prev) => [data.link as AccountLinkDisplay, ...prev]);
    } catch {}
  }

  async function handleAcceptInvite() {
    if (!acceptCode.trim()) return;
    setAcceptMsg("");
    try {
      await acceptInvite(acceptCode.trim());
      setAcceptMsg("Koblet!");
      setAcceptCode("");
      const data = await fetchLinks();
      setLinks(data.links);
    } catch (e: unknown) {
      setAcceptMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function handleToggleShare(linkId: string, listId: string) {
    const link = links.find((l) => l.id === linkId);
    if (!link) return;
    const current = link.shared_list_ids || [];
    const next = current.includes(listId)
      ? current.filter((id) => id !== listId)
      : [...current, listId];
    try {
      await updateLinkSharing(linkId, next);
      setLinks((prev) => prev.map((l) => l.id === linkId ? { ...l, shared_list_ids: next } : l));
    } catch {}
  }

  async function handleUnlink(linkId: string) {
    try {
      await revokeLink(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch {}
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) return <LoadingSpinner text="Laster innstillinger..." />;

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      {/* Page header */}
      <h2
        className="mb-6"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}
      >
        Innstillinger
      </h2>

      {errorMsg && (
        <div className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20 mb-6">
          Feil: {errorMsg}
        </div>
      )}

      {/* ── Profile row (full width) ──────────────────── */}
      <div className={glassCard} style={glassCardStyle}>
        <p className={sectionLabel}>Profil</p>
        <p className={sectionDesc}>Visningsnavnet ditt brukes i Curator og Se Sammen.</p>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
              maxLength={50}
              placeholder="Visningsnavn"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[rgba(229,9,20,0.4)] transition-all duration-200"
            />
            <GhostButton onClick={saveName} disabled={savingName}>
              {savingName ? "Lagrer..." : "Lagre"}
            </GhostButton>
            <button onClick={() => setEditingName(false)} className="px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors cursor-pointer">
              Avbryt
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              Visningsnavn: <span className="text-white font-medium">{displayName || "Ikke satt"}</span>
            </p>
            <button
              onClick={() => { setNameInput(displayName); setEditingName(true); }}
              className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium cursor-pointer"
            >
              Rediger
            </button>
          </div>
        )}

        {/* Premium badge */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          {isPremium ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <span className="text-xs font-medium text-emerald-400">Premium-medlem</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPremium(true)}
              className="text-xs font-semibold text-white/70 border border-white/[0.1] rounded-xl px-4 py-2 hover:bg-[rgba(229,9,20,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:text-white transition-all cursor-pointer"
            >
              Oppgrader til Premium
            </button>
          )}
        </div>
      </div>

      {/* ── 2-column grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        {/* ═══ COLUMN 1 — Core Configuration ═══════════ */}
        <div className="flex flex-col gap-4">

          {/* Region */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Region</p>
            <p className={sectionDesc}>Bestemmer strømmetilgjengelighet, trender og anbefalinger.</p>
            <div className="flex items-center gap-3">
              <select
                value={selectedRegion}
                onChange={(e) => saveRegion(e.target.value as SupportedRegion)}
                disabled={savingRegion}
                className="flex-1 px-3 py-2.5 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-[rgba(229,9,20,0.4)] transition-all duration-200 disabled:opacity-40 appearance-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {SUPPORTED_REGIONS.map((code) => (
                  <option key={code} value={code} style={{ background: "#0a0a0a", color: "#fff" }}>
                    {REGION_LABELS[code]} ({code})
                  </option>
                ))}
              </select>
              <span
                className="flex-shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md"
                style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}
              >
                {selectedRegion}
              </span>
            </div>
            {savingRegion && <p className="text-[10px] text-white/40 mt-2">Lagrer...</p>}
          </div>

          {/* Content Filters (Streaming Preferences) */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Innholdsfiltre</p>
            <p className={sectionDesc}>Ekskluder innhold du ikke er interessert i fra anbefalinger og søk.</p>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => {
                const isActive = activePresets.includes(preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => togglePreset(preset.id)}
                    disabled={savingFilters}
                    title={preset.description}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer disabled:opacity-40 ${
                      isActive
                        ? "bg-[rgba(229,9,20,0.12)] text-[rgba(229,9,20,0.85)] border-[rgba(229,9,20,0.3)]"
                        : "bg-white/[0.04] text-white/55 border-white/[0.08] hover:bg-white/[0.08] hover:text-white/60"
                    }`}
                  >
                    {isActive && (
                      <svg className="w-3 h-3 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {savingFilters && <p className="text-[10px] text-white/40 mt-2">Lagrer...</p>}
          </div>

          {/* AI Exploration Slider */}
          <div className={glassCard} style={glassCardStyle}>
            <div className="flex items-center justify-between">
              <p className={sectionLabel}>AI-utforskning</p>
              <button
                onClick={() => setShowSliderInfo(!showSliderInfo)}
                className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                title="Hva gjør slideren?"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
            </div>
            <p className={sectionDesc}>Juster hvor dristige anbefalinger du vil ha fra Curator og Søk.</p>
            <div className="flex items-center gap-3">
              <div className="text-white/50" title="Presis">
                <ShieldIcon size={18} />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={explorationSlider}
                onChange={(e) => setExplorationSlider(parseInt(e.target.value))}
                onPointerUp={() => saveSlider(explorationSlider)}
                className="flex-1 accent-[#E50914]"
              />
              <div className="text-white/50" title="Utforsk">
                <CompassIcon size={18} />
              </div>
              <span className="text-xs font-mono w-7 text-center text-white/60">{explorationSlider}</span>
            </div>
            {savingSlider && <p className="text-[10px] text-white/40 mt-2">Lagrer...</p>}

            {/* Algorithm transparency */}
            {showSliderInfo && (
              <div
                className="mt-4 rounded-xl border border-white/[0.06] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="divide-y divide-white/[0.04]">
                  <div className={`px-4 py-3 ${explorationSlider <= 30 ? "bg-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}>0–30</span>
                      <span className="text-xs font-semibold text-white/80">Presis</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">Bruker kun din smaksprofil. Ingen trending-titler blandes inn.</p>
                  </div>
                  <div className={`px-4 py-3 ${explorationSlider > 30 && explorationSlider <= 50 ? "bg-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}>31–50</span>
                      <span className="text-xs font-semibold text-white/80">Oppdagelse</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">Blander inn trending-titler. Introduserer lett tilfeldig variasjon i rekkefølgen.</p>
                  </div>
                  <div className={`px-4 py-3 ${explorationSlider > 50 ? "bg-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}>51–100</span>
                      <span className="text-xs font-semibold text-white/80">Utforsk</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">Booster populære titler og maksimerer tilfeldig variasjon for bredest mulig utvalg.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Linking */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Kontokobling</p>
            <p className={sectionDesc}>Koble kontoen din med en partner for å dele lister og Se Sammen.</p>

            {/* Active links */}
            {links.filter((l) => l.status === "accepted").map((link) => (
              <div key={link.id} className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white/80 font-medium">{link.partner_name || "Bruker"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setManagingLinkId(managingLinkId === link.id ? null : link.id)}
                      className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium cursor-pointer"
                    >
                      {managingLinkId === link.id ? "Ferdig" : "Deling"}
                    </button>
                    <button
                      onClick={() => handleUnlink(link.id)}
                      className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-medium cursor-pointer"
                    >
                      Fjern
                    </button>
                  </div>
                </div>
                {managingLinkId === link.id && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
                    <p className="text-[10px] text-white/45 uppercase tracking-wider font-semibold mb-2">Del disse listene:</p>
                    {myLists.length === 0 ? (
                      <p className="text-xs text-white/20">Ingen lister ennå.</p>
                    ) : myLists.map((list) => {
                      const isShared = (link.shared_list_ids || []).includes(list.id);
                      return (
                        <button
                          key={list.id}
                          onClick={() => handleToggleShare(link.id, list.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs cursor-pointer ${
                            isShared
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/[0.02] text-white/55 border border-white/[0.04] hover:bg-white/[0.04]"
                          }`}
                        >
                          <span>{list.name}</span>
                          {isShared && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Pending invites */}
            {links.filter((l) => l.status === "pending" && !l.invitee_id).map((link) => (
              <div key={link.id} className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/45 mb-2">Invitasjonskode (del med partner):</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-[rgba(229,9,20,0.7)] tracking-[0.3em] select-all">
                    {link.invite_code}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(link.invite_code)}
                    className="p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/50 hover:text-white/70 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => handleUnlink(link.id)}
                  className="mt-2 text-xs text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Avbryt invitasjon
                </button>
              </div>
            ))}

            {/* Generate / Accept */}
            <div className="flex flex-col gap-3">
              {!inviteCode && (
                <GhostButton onClick={handleGenerateInvite}>Generer invitasjonskode</GhostButton>
              )}
              <div>
                <p className="text-[10px] text-white/45 mb-2">Har du en invitasjonskode?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={acceptCode}
                    onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAcceptInvite(); }}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-28 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white font-mono tracking-[0.2em] text-center placeholder-white/15 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <GhostButton onClick={handleAcceptInvite} disabled={acceptCode.length < 6}>Godta</GhostButton>
                </div>
                {acceptMsg && (
                  <p className={`text-xs mt-2 font-medium ${acceptMsg === "Koblet!" ? "text-emerald-400" : "text-red-400"}`}>
                    {acceptMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ COLUMN 2 — Integrations & Account ══════ */}
        <div className="flex flex-col gap-4">

          {/* Trakt */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Trakt-synkronisering</p>
            <p className={sectionDesc}>Importer seerhistorikk og ønskeliste fra Trakt.tv-kontoen din.</p>

            {traktConnected ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span className="text-xs text-emerald-400 font-medium">Tilkoblet</span>
              </div>
            ) : (
              <a
                href="/api/trakt/connect"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-white/[0.08] text-white/65 hover:bg-[rgba(229,9,20,0.08)] hover:text-white hover:border-[rgba(229,9,20,0.3)] transition-all mb-4"
              >
                Koble til Trakt
              </a>
            )}

            <div className="flex gap-2">
              <GhostButton onClick={() => handleSync("merge")} disabled={syncing}>
                <RefreshIcon />
                {syncing ? "Synkroniserer..." : "Flett"}
              </GhostButton>
              <GhostButton onClick={() => handleSync("overwrite")} disabled={syncing} danger>
                <RefreshIcon />
                Overskriv
              </GhostButton>
            </div>

            {syncResult && (
              <p className={`text-xs mt-3 font-medium ${syncResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
                {syncResult}
              </p>
            )}
          </div>

          {/* Data Export & Import */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Data og eksport</p>
            <p className={sectionDesc}>Last ned all data eller importer fra andre tjenester.</p>
            <div className="flex flex-col gap-2">
              <a href="/api/export" download>
                <GhostButton className="w-full">
                  <DownloadIcon />
                  Eksporter data som JSON
                </GhostButton>
              </a>
              <Link href="/timemachine">
                <GhostButton className="w-full">
                  Tidsmaskinen / Import
                </GhostButton>
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>Juridisk</p>
            <p className={sectionDesc}>Personvern, vilkår og kontaktinformasjon.</p>
            <div className="flex gap-3">
              <a href="/privacy" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">Personvern</a>
              <a href="/terms" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">Vilkår</a>
              <a href="/contact" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">Kontakt</a>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="rounded-2xl border border-red-500/15 p-5 transition-all duration-200"
            style={{ ...glassCardStyle, background: "rgba(229,9,20,0.02)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400/50 mb-1">Faresone</p>
            <p className="text-[12px] text-red-400/30 leading-relaxed mb-4">Logg ut av kontoen din. Du kan logge inn igjen når som helst.</p>
            <GhostButton onClick={handleSignOut} danger>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logg ut
            </GhostButton>
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="settings" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Laster innstillinger..." />}>
      <SettingsContent />
    </Suspense>
  );
}
