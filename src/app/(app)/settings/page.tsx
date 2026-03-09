"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import PremiumModal from "@/components/PremiumModal";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useLocale } from "@/hooks/useLocale";
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

/* ── Locale strings ───────────────────────────────────── */

const strings = {
  no: {
    loadingSettings: "Laster innstillinger...",
    settings: "Innstillinger",
    error: "Feil:",
    profile: "Profil",
    profileDesc: "Visningsnavnet ditt brukes i Curator og Se Sammen.",
    displayName: "Visningsnavn",
    saving: "Lagrer...",
    save: "Lagre",
    cancel: "Avbryt",
    displayNameLabel: "Visningsnavn:",
    notSet: "Ikke satt",
    edit: "Rediger",
    premiumMember: "Premium-medlem",
    upgradeToPremium: "Oppgrader til Premium",
    region: "Region",
    regionDesc: "Bestemmer strømmetilgjengelighet, trender og anbefalinger.",
    contentFilters: "Innholdsfiltre",
    contentFiltersDesc: "Ekskluder innhold du ikke er interessert i fra anbefalinger og søk.",
    aiExploration: "AI-utforskning",
    whatDoesSliderDo: "Hva gjør slideren?",
    aiExplorationDesc: "Juster hvor dristige anbefalinger du vil ha fra Curator og Søk.",
    precise: "Presis",
    explore: "Utforsk",
    discovery: "Oppdagelse",
    preciseDesc: "Bruker kun din smaksprofil. Ingen trending-titler blandes inn.",
    discoveryDesc: "Blander inn trending-titler. Introduserer lett tilfeldig variasjon i rekkefølgen.",
    exploreDesc: "Booster populære titler og maksimerer tilfeldig variasjon for bredest mulig utvalg.",
    accountLinking: "Kontokobling",
    accountLinkingDesc: "Koble kontoen din med en partner for å dele lister og Se Sammen.",
    user: "Bruker",
    done: "Ferdig",
    sharing: "Deling",
    remove: "Fjern",
    shareTheseLists: "Del disse listene:",
    noListsYet: "Ingen lister ennå.",
    inviteCodeLabel: "Invitasjonskode (del med partner):",
    cancelInvite: "Avbryt invitasjon",
    generateInviteCode: "Generer invitasjonskode",
    haveInviteCode: "Har du en invitasjonskode?",
    accept: "Godta",
    linked: "Koblet!",
    traktSync: "Trakt-synkronisering",
    traktDesc: "Importer seerhistorikk og ønskeliste fra Trakt.tv-kontoen din.",
    connected: "Tilkoblet",
    connectTrakt: "Koble til Trakt",
    syncing: "Synkroniserer...",
    merge: "Flett",
    overwrite: "Overskriv",
    dataAndExport: "Data og eksport",
    dataAndExportDesc: "Last ned all data eller importer fra andre tjenester.",
    exportJson: "Eksporter data som JSON",
    timeMachineImport: "Tidsmaskinen / Import",
    legal: "Juridisk",
    legalDesc: "Personvern, vilkår og kontaktinformasjon.",
    privacy: "Personvern",
    terms: "Vilkår",
    contact: "Kontakt",
    dangerZone: "Faresone",
    dangerZoneDesc: "Logg ut av kontoen din. Du kan logge inn igjen når som helst.",
    signOut: "Logg ut",
  },
  en: {
    loadingSettings: "Loading settings...",
    settings: "Settings",
    error: "Error:",
    profile: "Profile",
    profileDesc: "Your display name is used in Curator and Watch Together.",
    displayName: "Display name",
    saving: "Saving...",
    save: "Save",
    cancel: "Cancel",
    displayNameLabel: "Display name:",
    notSet: "Not set",
    edit: "Edit",
    premiumMember: "Premium member",
    upgradeToPremium: "Upgrade to Premium",
    region: "Region",
    regionDesc: "Determines streaming availability, trends and recommendations.",
    contentFilters: "Content filters",
    contentFiltersDesc: "Exclude content you're not interested in from recommendations and search.",
    aiExploration: "AI exploration",
    whatDoesSliderDo: "What does the slider do?",
    aiExplorationDesc: "Adjust how adventurous you want recommendations from Curator and Search.",
    precise: "Precise",
    explore: "Explore",
    discovery: "Discovery",
    preciseDesc: "Uses only your taste profile. No trending titles mixed in.",
    discoveryDesc: "Mixes in trending titles. Introduces slight random variation in the order.",
    exploreDesc: "Boosts popular titles and maximizes random variation for the widest selection.",
    accountLinking: "Account linking",
    accountLinkingDesc: "Link your account with a partner to share lists and Watch Together.",
    user: "User",
    done: "Done",
    sharing: "Sharing",
    remove: "Remove",
    shareTheseLists: "Share these lists:",
    noListsYet: "No lists yet.",
    inviteCodeLabel: "Invite code (share with partner):",
    cancelInvite: "Cancel invite",
    generateInviteCode: "Generate invite code",
    haveInviteCode: "Have an invite code?",
    accept: "Accept",
    linked: "Linked!",
    traktSync: "Trakt sync",
    traktDesc: "Import watch history and watchlist from your Trakt.tv account.",
    connected: "Connected",
    connectTrakt: "Connect Trakt",
    syncing: "Syncing...",
    merge: "Merge",
    overwrite: "Overwrite",
    dataAndExport: "Data & export",
    dataAndExportDesc: "Download all your data or import from other services.",
    exportJson: "Export data as JSON",
    timeMachineImport: "Time Machine / Import",
    legal: "Legal",
    legalDesc: "Privacy, terms and contact information.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    dangerZone: "Danger zone",
    dangerZoneDesc: "Sign out of your account. You can sign back in anytime.",
    signOut: "Sign out",
  },
  dk: {
    loadingSettings: "Indlæser indstillinger...",
    settings: "Indstillinger",
    error: "Fejl:",
    profile: "Profil",
    profileDesc: "Dit visningsnavn bruges i Curator og Se Sammen.",
    displayName: "Visningsnavn",
    saving: "Gemmer...",
    save: "Gem",
    cancel: "Annuller",
    displayNameLabel: "Visningsnavn:",
    notSet: "Ikke angivet",
    edit: "Rediger",
    premiumMember: "Premium-medlem",
    upgradeToPremium: "Opgrader til Premium",
    region: "Region",
    regionDesc: "Bestemmer streamingtilgængelighed, trends og anbefalinger.",
    contentFilters: "Indholdsfiltre",
    contentFiltersDesc: "Ekskluder indhold, du ikke er interesseret i, fra anbefalinger og søgning.",
    aiExploration: "AI-udforskning",
    whatDoesSliderDo: "Hvad gør slideren?",
    aiExplorationDesc: "Juster hvor modige anbefalinger du vil have fra Curator og Søg.",
    precise: "Præcis",
    explore: "Udforsk",
    discovery: "Opdagelse",
    preciseDesc: "Bruger kun din smagsprofil. Ingen trending-titler blandes ind.",
    discoveryDesc: "Blander trending-titler ind. Introducerer let tilfældig variation i rækkefølgen.",
    exploreDesc: "Booster populære titler og maksimerer tilfældig variation for bredest muligt udvalg.",
    accountLinking: "Kontokobling",
    accountLinkingDesc: "Kobl din konto med en partner for at dele lister og Se Sammen.",
    user: "Bruger",
    done: "Færdig",
    sharing: "Deling",
    remove: "Fjern",
    shareTheseLists: "Del disse lister:",
    noListsYet: "Ingen lister endnu.",
    inviteCodeLabel: "Invitationskode (del med partner):",
    cancelInvite: "Annuller invitation",
    generateInviteCode: "Generer invitationskode",
    haveInviteCode: "Har du en invitationskode?",
    accept: "Accepter",
    linked: "Koblet!",
    traktSync: "Trakt-synkronisering",
    traktDesc: "Importer seerhistorik og ønskeliste fra din Trakt.tv-konto.",
    connected: "Tilsluttet",
    connectTrakt: "Tilslut Trakt",
    syncing: "Synkroniserer...",
    merge: "Flet",
    overwrite: "Overskriv",
    dataAndExport: "Data og eksport",
    dataAndExportDesc: "Download alle data eller importer fra andre tjenester.",
    exportJson: "Eksporter data som JSON",
    timeMachineImport: "Tidsmaskinen / Import",
    legal: "Juridisk",
    legalDesc: "Privatlivspolitik, vilkår og kontaktoplysninger.",
    privacy: "Privatlivspolitik",
    terms: "Vilkår",
    contact: "Kontakt",
    dangerZone: "Farezone",
    dangerZoneDesc: "Log ud af din konto. Du kan logge ind igen når som helst.",
    signOut: "Log ud",
  },
  se: {
    loadingSettings: "Laddar inställningar...",
    settings: "Inställningar",
    error: "Fel:",
    profile: "Profil",
    profileDesc: "Ditt visningsnamn används i Curator och Se Tillsammans.",
    displayName: "Visningsnamn",
    saving: "Sparar...",
    save: "Spara",
    cancel: "Avbryt",
    displayNameLabel: "Visningsnamn:",
    notSet: "Inte angett",
    edit: "Redigera",
    premiumMember: "Premium-medlem",
    upgradeToPremium: "Uppgradera till Premium",
    region: "Region",
    regionDesc: "Bestämmer streamingtillgänglighet, trender och rekommendationer.",
    contentFilters: "Innehållsfilter",
    contentFiltersDesc: "Exkludera innehåll du inte är intresserad av från rekommendationer och sök.",
    aiExploration: "AI-utforskning",
    whatDoesSliderDo: "Vad gör slidern?",
    aiExplorationDesc: "Justera hur djärva rekommendationer du vill ha från Curator och Sök.",
    precise: "Precis",
    explore: "Utforska",
    discovery: "Upptäckt",
    preciseDesc: "Använder bara din smakprofil. Inga trendande titlar blandas in.",
    discoveryDesc: "Blandar in trendande titlar. Introducerar lätt slumpmässig variation i ordningen.",
    exploreDesc: "Boostar populära titlar och maximerar slumpmässig variation för bredast möjliga urval.",
    accountLinking: "Kontolänkning",
    accountLinkingDesc: "Länka ditt konto med en partner för att dela listor och Se Tillsammans.",
    user: "Användare",
    done: "Klar",
    sharing: "Delning",
    remove: "Ta bort",
    shareTheseLists: "Dela dessa listor:",
    noListsYet: "Inga listor ännu.",
    inviteCodeLabel: "Inbjudningskod (dela med partner):",
    cancelInvite: "Avbryt inbjudan",
    generateInviteCode: "Generera inbjudningskod",
    haveInviteCode: "Har du en inbjudningskod?",
    accept: "Acceptera",
    linked: "Länkad!",
    traktSync: "Trakt-synkronisering",
    traktDesc: "Importera tittarhistorik och önskelista från ditt Trakt.tv-konto.",
    connected: "Ansluten",
    connectTrakt: "Anslut Trakt",
    syncing: "Synkroniserar...",
    merge: "Sammanfoga",
    overwrite: "Skriv över",
    dataAndExport: "Data och export",
    dataAndExportDesc: "Ladda ner all data eller importera från andra tjänster.",
    exportJson: "Exportera data som JSON",
    timeMachineImport: "Tidsmaskinen / Import",
    legal: "Juridiskt",
    legalDesc: "Integritet, villkor och kontaktinformation.",
    privacy: "Integritet",
    terms: "Villkor",
    contact: "Kontakt",
    dangerZone: "Farozon",
    dangerZoneDesc: "Logga ut från ditt konto. Du kan logga in igen när som helst.",
    signOut: "Logga ut",
  },
  fi: {
    loadingSettings: "Ladataan asetuksia...",
    settings: "Asetukset",
    error: "Virhe:",
    profile: "Profiili",
    profileDesc: "Näyttönimeäsi käytetään Curatorissa ja Katsotaan Yhdessä -toiminnossa.",
    displayName: "Näyttönimi",
    saving: "Tallennetaan...",
    save: "Tallenna",
    cancel: "Peruuta",
    displayNameLabel: "Näyttönimi:",
    notSet: "Ei asetettu",
    edit: "Muokkaa",
    premiumMember: "Premium-jäsen",
    upgradeToPremium: "Päivitä Premiumiin",
    region: "Alue",
    regionDesc: "Määrittää suoratoistosaatavuuden, trendit ja suositukset.",
    contentFilters: "Sisältösuodattimet",
    contentFiltersDesc: "Sulje pois sisältö, josta et ole kiinnostunut, suosituksista ja hausta.",
    aiExploration: "AI-tutkimus",
    whatDoesSliderDo: "Mitä liukusäädin tekee?",
    aiExplorationDesc: "Säädä kuinka rohkeita suosituksia haluat Curatorilta ja Hausta.",
    precise: "Tarkka",
    explore: "Tutustu",
    discovery: "Löytö",
    preciseDesc: "Käyttää vain makuprofiiliasi. Trendaavia nimikkeitä ei sekoiteta mukaan.",
    discoveryDesc: "Sekoittaa mukaan trendaavia nimikkeitä. Lisää lievää satunnaista vaihtelua järjestykseen.",
    exploreDesc: "Nostaa suosittuja nimikkeitä ja maksimoi satunnaisen vaihtelun laajimman valikoiman saamiseksi.",
    accountLinking: "Tilin linkitys",
    accountLinkingDesc: "Linkitä tilisi kumppanin kanssa jakaaksesi listoja ja Katsotaan Yhdessä.",
    user: "Käyttäjä",
    done: "Valmis",
    sharing: "Jakaminen",
    remove: "Poista",
    shareTheseLists: "Jaa nämä listat:",
    noListsYet: "Ei listoja vielä.",
    inviteCodeLabel: "Kutsukoodi (jaa kumppanille):",
    cancelInvite: "Peruuta kutsu",
    generateInviteCode: "Luo kutsukoodi",
    haveInviteCode: "Onko sinulla kutsukoodi?",
    accept: "Hyväksy",
    linked: "Linkitetty!",
    traktSync: "Trakt-synkronointi",
    traktDesc: "Tuo katseluhistoria ja toivelista Trakt.tv-tililtäsi.",
    connected: "Yhdistetty",
    connectTrakt: "Yhdistä Trakt",
    syncing: "Synkronoidaan...",
    merge: "Yhdistä",
    overwrite: "Korvaa",
    dataAndExport: "Data ja vienti",
    dataAndExportDesc: "Lataa kaikki tietosi tai tuo muista palveluista.",
    exportJson: "Vie data JSON-muodossa",
    timeMachineImport: "Aikakone / Tuonti",
    legal: "Oikeudelliset",
    legalDesc: "Tietosuoja, ehdot ja yhteystiedot.",
    privacy: "Tietosuoja",
    terms: "Ehdot",
    contact: "Yhteystiedot",
    dangerZone: "Vaaravyöhyke",
    dangerZoneDesc: "Kirjaudu ulos tililtäsi. Voit kirjautua takaisin milloin tahansa.",
    signOut: "Kirjaudu ulos",
  },
} as const;

/* ── Main ─────────────────────────────────────────────── */

function SettingsContent() {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
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
      setAcceptMsg(s.linked);
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

  if (loading) return <LoadingSpinner text={s.loadingSettings} />;

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      {/* Page header */}
      <h2
        className="mb-6"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}
      >
        {s.settings}
      </h2>

      {errorMsg && (
        <div className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20 mb-6">
          {s.error} {errorMsg}
        </div>
      )}

      {/* ── Profile row (full width) ──────────────────── */}
      <div className={glassCard} style={glassCardStyle}>
        <p className={sectionLabel}>{s.profile}</p>
        <p className={sectionDesc}>{s.profileDesc}</p>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
              maxLength={50}
              placeholder={s.displayName}
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[rgba(229,9,20,0.4)] transition-all duration-200"
            />
            <GhostButton onClick={saveName} disabled={savingName}>
              {savingName ? s.saving : s.save}
            </GhostButton>
            <button onClick={() => setEditingName(false)} className="px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors cursor-pointer">
              {s.cancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {s.displayNameLabel} <span className="text-white font-medium">{displayName || s.notSet}</span>
            </p>
            <button
              onClick={() => { setNameInput(displayName); setEditingName(true); }}
              className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium cursor-pointer"
            >
              {s.edit}
            </button>
          </div>
        )}

        {/* Premium badge */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          {isPremium ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <span className="text-xs font-medium text-emerald-400">{s.premiumMember}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPremium(true)}
              className="text-xs font-semibold text-white/70 border border-white/[0.1] rounded-xl px-4 py-2 hover:bg-[rgba(229,9,20,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:text-white transition-all cursor-pointer"
            >
              {s.upgradeToPremium}
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
            <p className={sectionLabel}>{s.region}</p>
            <p className={sectionDesc}>{s.regionDesc}</p>
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
            {savingRegion && <p className="text-[10px] text-white/40 mt-2">{s.saving}</p>}
          </div>

          {/* Content Filters (Streaming Preferences) */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>{s.contentFilters}</p>
            <p className={sectionDesc}>{s.contentFiltersDesc}</p>
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
            {savingFilters && <p className="text-[10px] text-white/40 mt-2">{s.saving}</p>}
          </div>

          {/* AI Exploration Slider */}
          <div className={glassCard} style={glassCardStyle}>
            <div className="flex items-center justify-between">
              <p className={sectionLabel}>{s.aiExploration}</p>
              <button
                onClick={() => setShowSliderInfo(!showSliderInfo)}
                className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                title={s.whatDoesSliderDo}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
            </div>
            <p className={sectionDesc}>{s.aiExplorationDesc}</p>
            <div className="flex items-center gap-3">
              <div className="text-white/50" title={s.precise}>
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
              <div className="text-white/50" title={s.explore}>
                <CompassIcon size={18} />
              </div>
              <span className="text-xs font-mono w-7 text-center text-white/60">{explorationSlider}</span>
            </div>
            {savingSlider && <p className="text-[10px] text-white/40 mt-2">{s.saving}</p>}

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
                      <span className="text-xs font-semibold text-white/80">{s.precise}</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{s.preciseDesc}</p>
                  </div>
                  <div className={`px-4 py-3 ${explorationSlider > 30 && explorationSlider <= 50 ? "bg-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}>31–50</span>
                      <span className="text-xs font-semibold text-white/80">{s.discovery}</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{s.discoveryDesc}</p>
                  </div>
                  <div className={`px-4 py-3 ${explorationSlider > 50 ? "bg-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}>51–100</span>
                      <span className="text-xs font-semibold text-white/80">{s.explore}</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{s.exploreDesc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Linking */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>{s.accountLinking}</p>
            <p className={sectionDesc}>{s.accountLinkingDesc}</p>

            {/* Active links */}
            {links.filter((l) => l.status === "accepted").map((link) => (
              <div key={link.id} className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white/80 font-medium">{link.partner_name || s.user}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setManagingLinkId(managingLinkId === link.id ? null : link.id)}
                      className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium cursor-pointer"
                    >
                      {managingLinkId === link.id ? s.done : s.sharing}
                    </button>
                    <button
                      onClick={() => handleUnlink(link.id)}
                      className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-medium cursor-pointer"
                    >
                      {s.remove}
                    </button>
                  </div>
                </div>
                {managingLinkId === link.id && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
                    <p className="text-[10px] text-white/45 uppercase tracking-wider font-semibold mb-2">{s.shareTheseLists}</p>
                    {myLists.length === 0 ? (
                      <p className="text-xs text-white/20">{s.noListsYet}</p>
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
                <p className="text-[10px] text-white/45 mb-2">{s.inviteCodeLabel}</p>
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
                  {s.cancelInvite}
                </button>
              </div>
            ))}

            {/* Generate / Accept */}
            <div className="flex flex-col gap-3">
              {!inviteCode && (
                <GhostButton onClick={handleGenerateInvite}>{s.generateInviteCode}</GhostButton>
              )}
              <div>
                <p className="text-[10px] text-white/45 mb-2">{s.haveInviteCode}</p>
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
                  <GhostButton onClick={handleAcceptInvite} disabled={acceptCode.length < 6}>{s.accept}</GhostButton>
                </div>
                {acceptMsg && (
                  <p className={`text-xs mt-2 font-medium ${acceptMsg === s.linked ? "text-emerald-400" : "text-red-400"}`}>
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
            <p className={sectionLabel}>{s.traktSync}</p>
            <p className={sectionDesc}>{s.traktDesc}</p>

            {traktConnected ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span className="text-xs text-emerald-400 font-medium">{s.connected}</span>
              </div>
            ) : (
              <a
                href="/api/trakt/connect"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-white/[0.08] text-white/65 hover:bg-[rgba(229,9,20,0.08)] hover:text-white hover:border-[rgba(229,9,20,0.3)] transition-all mb-4"
              >
                {s.connectTrakt}
              </a>
            )}

            <div className="flex gap-2">
              <GhostButton onClick={() => handleSync("merge")} disabled={syncing}>
                <RefreshIcon />
                {syncing ? s.syncing : s.merge}
              </GhostButton>
              <GhostButton onClick={() => handleSync("overwrite")} disabled={syncing} danger>
                <RefreshIcon />
                {s.overwrite}
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
            <p className={sectionLabel}>{s.dataAndExport}</p>
            <p className={sectionDesc}>{s.dataAndExportDesc}</p>
            <div className="flex flex-col gap-2">
              <a href="/api/export" download>
                <GhostButton className="w-full">
                  <DownloadIcon />
                  {s.exportJson}
                </GhostButton>
              </a>
              <Link href="/timemachine">
                <GhostButton className="w-full">
                  {s.timeMachineImport}
                </GhostButton>
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className={glassCard} style={glassCardStyle}>
            <p className={sectionLabel}>{s.legal}</p>
            <p className={sectionDesc}>{s.legalDesc}</p>
            <div className="flex gap-3">
              <a href="/privacy" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">{s.privacy}</a>
              <a href="/terms" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">{s.terms}</a>
              <a href="/contact" className="text-xs text-white/50 hover:text-[rgba(229,9,20,0.8)] transition-colors font-medium">{s.contact}</a>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="rounded-2xl border border-red-500/15 p-5 transition-all duration-200"
            style={{ ...glassCardStyle, background: "rgba(229,9,20,0.02)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400/50 mb-1">{s.dangerZone}</p>
            <p className="text-[12px] text-red-400/30 leading-relaxed mb-4">{s.dangerZoneDesc}</p>
            <GhostButton onClick={handleSignOut} danger>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {s.signOut}
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
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsContent />
    </Suspense>
  );
}
