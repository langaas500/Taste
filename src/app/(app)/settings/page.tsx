"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchLinks, createInvite, acceptInvite, updateLinkSharing, revokeLink, fetchLists } from "@/lib/api";
import { FILTER_PRESETS, presetsToFilters, filtersToPresets } from "@/lib/filter-presets";
import type { AccountLinkDisplay, CustomList, ContentFilters } from "@/lib/types";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [traktConnected, setTraktConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ ok: boolean; provider: string; error?: string } | null>(null);
  const [testingAi, setTestingAi] = useState(false);
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
        const filters = (data.profile.content_filters || {}) as ContentFilters;
        setActivePresets(filtersToPresets(filters));
      }
    } catch {}

    // Load links and lists in parallel
    try {
      const [linksData, listsData] = await Promise.all([
        fetchLinks(),
        fetchLists(),
      ]);
      setLinks(linksData.links);
      setMyLists(listsData.lists as CustomList[]);
    } catch {}

    if (traktMsg === "connected") {
      setTraktConnected(true);
    }
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

  async function testAI() {
    setTestingAi(true);
    try {
      const res = await fetch("/api/ai-test");
      const data = await res.json();
      setAiStatus(data);
    } catch {
      setAiStatus({ ok: false, provider: "unknown", error: "Connection failed" });
    }
    setTestingAi(false);
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
    if (!trimmed || trimmed === displayName) {
      setEditingName(false);
      return;
    }
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
    } catch {
      setActivePresets(activePresets);
    }
    setSavingFilters(false);
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
    <div className="animate-fade-in-up space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Innstillinger</h2>

      {errorMsg && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[rgba(248,113,113,0.1)]">
          Feil: {errorMsg}
        </div>
      )}

      {/* Profile */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Profil</h3>
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
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder-white/25 focus:outline-none focus:border-[var(--accent)]/40 transition-all duration-200"
            />
            <GlowButton onClick={saveName} disabled={savingName} size="sm">
              {savingName ? "Lagrer..." : "Lagre"}
            </GlowButton>
            <button
              onClick={() => setEditingName(false)}
              className="px-3 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Avbryt
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Visningsnavn: <span className="text-[var(--text-primary)] font-medium">{displayName || "Ikke satt"}</span>
            </p>
            <button
              onClick={() => { setNameInput(displayName); setEditingName(true); }}
              className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              Rediger
            </button>
          </div>
        )}
      </GlassCard>

      {/* Account Linking */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Kontokobling</h3>

        {/* Active links */}
        {links.filter((l) => l.status === "accepted").map((link) => (
          <div key={link.id} className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80 font-medium">
                  {link.partner_name || "Bruker"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setManagingLinkId(managingLinkId === link.id ? null : link.id)}
                  className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium"
                >
                  {managingLinkId === link.id ? "Ferdig" : "Deling"}
                </button>
                <button
                  onClick={() => handleUnlink(link.id)}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors font-medium"
                >
                  Fjern kobling
                </button>
              </div>
            </div>

            {/* Sharing controls */}
            {managingLinkId === link.id && (
              <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">Del disse listene:</p>
                {myLists.length === 0 ? (
                  <p className="text-xs text-white/20">Ingen lister ennå. Lag noen først.</p>
                ) : myLists.map((list) => {
                  const isShared = (link.shared_list_ids || []).includes(list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => handleToggleShare(link.id, list.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-sm ${
                        isShared
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/[0.02] text-white/50 border border-white/[0.04] hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>{list.name}</span>
                      {isShared && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
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
            <p className="text-xs text-white/30 mb-2">Invitasjonskode (del med partner):</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-[var(--accent-light)] tracking-[0.3em] select-all">
                {link.invite_code}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(link.invite_code)}
                className="p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-white/70 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => handleUnlink(link.id)}
              className="mt-2 text-xs text-red-400/60 hover:text-red-400 transition-colors"
            >
              Avbryt invitasjon
            </button>
          </div>
        ))}

        {/* Generate invite / Accept invite */}
        <div className="flex flex-col gap-3">
          {!inviteCode && (
            <GlowButton onClick={handleGenerateInvite} variant="ghost" size="sm">
              Generer invitasjonskode
            </GlowButton>
          )}

          <div>
            <p className="text-xs text-white/30 mb-2">Har du en invitasjonskode?</p>
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
              <GlowButton onClick={handleAcceptInvite} disabled={acceptCode.length < 6} size="sm">
                Godta
              </GlowButton>
            </div>
            {acceptMsg && (
              <p className={`text-xs mt-2 font-medium ${acceptMsg === "Koblet!" ? "text-emerald-400" : "text-red-400"}`}>
                {acceptMsg}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Trakt */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Trakt-integrasjon</h3>

        {traktConnected ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--green)]" />
            <span className="text-sm text-[var(--green)] font-medium">Tilkoblet</span>
          </div>
        ) : (
          <a
            href="/api/trakt/connect"
            className="btn-press inline-block px-4 py-2 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 mb-4"
          >
            Koble til Trakt
          </a>
        )}

        <div className="flex gap-2">
          <GlowButton onClick={() => handleSync("merge")} disabled={syncing} variant="ghost" size="sm">
            {syncing ? "Synkroniserer..." : "Synkroniser (Flett)"}
          </GlowButton>
          <GlowButton onClick={() => handleSync("overwrite")} disabled={syncing} variant="danger" size="sm">
            Synkroniser (Overskriv)
          </GlowButton>
        </div>

        {syncResult && (
          <p className={`text-sm mt-3 font-medium ${syncResult.startsWith("Error") ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
            {syncResult}
          </p>
        )}
      </GlassCard>

      {/* Exploration Slider */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Utforskningsnivå</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4 leading-relaxed">
          Lavt = presise anbefalinger som matcher smaken din. Høyt = mer varierte, utforskende forslag.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">Presis</span>
          <input
            type="range"
            min={0}
            max={100}
            value={explorationSlider}
            onChange={(e) => setExplorationSlider(parseInt(e.target.value))}
            onPointerUp={() => saveSlider(explorationSlider)}
            className="flex-1"
          />
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">Utforsk</span>
          <span className="text-sm font-mono w-8 text-center text-[var(--accent-light)]">{explorationSlider}</span>
        </div>
        {savingSlider && <p className="text-xs text-[var(--text-tertiary)] mt-1">Lagrer...</p>}
      </GlassCard>

      {/* Content Filters */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Innholdsfiltre
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4 leading-relaxed">
          Velg hva du vil ekskludere fra anbefalinger og søk. Filtrene gjelder automatisk.
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTER_PRESETS.map((preset) => {
            const isActive = activePresets.includes(preset.id);
            return (
              <button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                disabled={savingFilters}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-[var(--accent-glow)] text-[var(--accent-light)] border-[var(--accent)]/30"
                    : "bg-white/[0.04] text-[var(--text-tertiary)] border-white/[0.08] hover:bg-white/[0.08] hover:text-[var(--text-secondary)]"
                } disabled:opacity-40`}
                title={preset.description}
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
        {savingFilters && <p className="text-xs text-[var(--text-tertiary)] mt-2">Lagrer...</p>}
      </GlassCard>

      {/* AI Provider */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">AI-leverandør</h3>
        <GlowButton onClick={testAI} disabled={testingAi} variant="ghost">
          {testingAi ? "Tester..." : "Test AI-tilkobling"}
        </GlowButton>
        {aiStatus && (
          <div className={`mt-3 text-sm ${aiStatus.ok ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            <p>Leverandør: <span className="font-medium">{aiStatus.provider}</span></p>
            <p>Status: <span className="font-medium">{aiStatus.ok ? "Tilkoblet" : `Feil: ${aiStatus.error}`}</span></p>
          </div>
        )}
      </GlassCard>

      {/* Export */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">Data og eksport</h3>
        <a href="/api/export" download>
          <GlowButton variant="ghost">Eksporter data som JSON</GlowButton>
        </a>
      </GlassCard>

      {/* Legal */}
      <GlassCard hover={false} className="p-5">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Juridisk</h3>
        <div className="flex gap-4">
          <a href="/privacy" className="text-sm text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium">
            Personvern
          </a>
          <a href="/terms" className="text-sm text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium">
            Vilkår for bruk
          </a>
          <a href="/contact" className="text-sm text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium">
            Kontakt
          </a>
        </div>
      </GlassCard>

      {/* Sign out */}
      <GlassCard hover={false} className="p-5">
        <GlowButton onClick={handleSignOut} variant="danger">
          Logg ut
        </GlowButton>
      </GlassCard>
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
