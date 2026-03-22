"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";
import { track } from "@/lib/posthog";

type MediaType = "movie" | "tv";

interface OnboardingTitle {
  tmdb_id: number;
  type: MediaType;
  title: string;
  poster_path: string | null;
  year: string;
}

interface Selection {
  tmdb_id: number;
  type: MediaType;
  sentiment: "liked" | "disliked";
}

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    headline: "La oss bygge din",
    headlineGradient: "filmprofil",
    subtitle: "Velg titler du har sett, så vi kan lære hva du liker og gi deg personlige anbefalinger.",
    cta: "La oss starte",
    timeHint: "Tar bare 2 minutter",
    step2Title: "Hva har du sett?",
    step2Hint: "Trykk = likte, hold inne = mislikte",
    searchPlaceholder: "Finner du ikke noe? Søk her...",
    liked: "likte",
    disliked: "mislikte",
    minSelected: "av minimum 5 valgt",
    back: "Tilbake",
    continue: "Fortsett",
    step3Title: "Hvilke tjenester bruker du?",
    step3Subtitle: "Vi filtrerer anbefalinger til tjenester du har",
    finish: "Fullfør",
    skip: "Hopp over",
    saving: "Lagrer...",
    doneTitle: "Profilen din er klar!",
    doneSubtitle: (n: number) =>
      `Vi logget ${n} titler og bygget smaksprofilen din. Nå kan vi gi deg personlige anbefalinger.`,
    tasteTitle: "Din smaksprofil",
    youLike: "Du liker",
    youAvoid: "Du unngår",
    pacing: "Tempo",
    exploreRec: "Utforsk anbefalinger",
    goLibrary: "Gå til biblioteket",
    startTogether: "Start Se Sammen",
    shareTaste: "Del smaksprofilen din",
    copied: "Lenke kopiert!",
    parTitle: "Har du en filmpartner?",
    parDesc: "Koble dere sammen og se hva dere egentlig liker — Taste Compatibility, felles favoritter og Tonight's Pick.",
    parCta: "Se Logflix Par →",
  },
  en: {
    headline: "Let's build your",
    headlineGradient: "movie profile",
    subtitle: "Pick titles you've seen so we can learn your taste and give you personal recommendations.",
    cta: "Let's go",
    timeHint: "Takes just 2 minutes",
    step2Title: "What have you seen?",
    step2Hint: "Tap = liked, hold = disliked",
    searchPlaceholder: "Can't find something? Search here...",
    liked: "liked",
    disliked: "disliked",
    minSelected: "of minimum 5 selected",
    back: "Back",
    continue: "Continue",
    step3Title: "Which services do you use?",
    step3Subtitle: "We'll filter recommendations to services you have",
    finish: "Finish",
    skip: "Skip",
    saving: "Saving...",
    doneTitle: "Your profile is ready!",
    doneSubtitle: (n: number) =>
      `We logged ${n} titles and built your taste profile. Now we can give you personal recommendations.`,
    tasteTitle: "Your taste profile",
    youLike: "You like",
    youAvoid: "You avoid",
    pacing: "Pacing",
    exploreRec: "Explore recommendations",
    goLibrary: "Go to library",
    startTogether: "Start Watch Together",
    shareTaste: "Share your taste profile",
    copied: "Link copied!",
    parTitle: "Got a movie partner?",
    parDesc: "Link up and see what you actually like — Taste Compatibility, shared favorites and Tonight's Pick.",
    parCta: "See Logflix Par →",
  },
  dk: {
    headline: "Lad os bygge din",
    headlineGradient: "filmprofil",
    subtitle: "Vælg titler du har set, så vi kan lære din smag at kende og give dig personlige anbefalinger.",
    cta: "Lad os starte",
    timeHint: "Tager kun 2 minutter",
    step2Title: "Hvad har du set?",
    step2Hint: "Tryk = kunne lide, hold inde = kunne ikke lide",
    searchPlaceholder: "Kan du ikke finde noget? Søg her...",
    liked: "kunne lide",
    disliked: "kunne ikke lide",
    minSelected: "af minimum 5 valgt",
    back: "Tilbage",
    continue: "Fortsæt",
    step3Title: "Hvilke tjenester bruger du?",
    step3Subtitle: "Vi filtrerer anbefalinger til tjenester du har",
    finish: "Færdig",
    skip: "Spring over",
    saving: "Gemmer...",
    doneTitle: "Din profil er klar!",
    doneSubtitle: (n: number) =>
      `Vi loggede ${n} titler og byggede din smagsprofil. Nu kan vi give dig personlige anbefalinger.`,
    tasteTitle: "Din smagsprofil",
    youLike: "Du kan lide",
    youAvoid: "Du undgår",
    pacing: "Tempo",
    exploreRec: "Udforsk anbefalinger",
    goLibrary: "Gå til biblioteket",
    startTogether: "Start Se Sammen",
    shareTaste: "Del din smagsprofil",
    copied: "Link kopieret!",
    parTitle: "Har du en filmpartner?",
    parDesc: "Forbind jer og se hvad I egentlig kan lide — Taste Compatibility, fælles favoritter og Tonight's Pick.",
    parCta: "Se Logflix Par →",
  },
  se: {
    headline: "Låt oss bygga din",
    headlineGradient: "filmprofil",
    subtitle: "Välj titlar du har sett så vi kan lära oss din smak och ge dig personliga rekommendationer.",
    cta: "Låt oss börja",
    timeHint: "Tar bara 2 minuter",
    step2Title: "Vad har du sett?",
    step2Hint: "Tryck = gillade, håll inne = ogillade",
    searchPlaceholder: "Hittar du inte något? Sök här...",
    liked: "gillade",
    disliked: "ogillade",
    minSelected: "av minimum 5 valda",
    back: "Tillbaka",
    continue: "Fortsätt",
    step3Title: "Vilka tjänster använder du?",
    step3Subtitle: "Vi filtrerar rekommendationer till tjänster du har",
    finish: "Slutför",
    skip: "Hoppa över",
    saving: "Sparar...",
    doneTitle: "Din profil är klar!",
    doneSubtitle: (n: number) =>
      `Vi loggade ${n} titlar och byggde din smakprofil. Nu kan vi ge dig personliga rekommendationer.`,
    tasteTitle: "Din smakprofil",
    youLike: "Du gillar",
    youAvoid: "Du undviker",
    pacing: "Tempo",
    exploreRec: "Utforska rekommendationer",
    goLibrary: "Gå till biblioteket",
    startTogether: "Starta Se Tillsammans",
    shareTaste: "Dela din smakprofil",
    copied: "Länk kopierad!",
    parTitle: "Har du en filmpartner?",
    parDesc: "Koppla ihop er och se vad ni egentligen gillar — Taste Compatibility, gemensamma favoriter och Tonight's Pick.",
    parCta: "Se Logflix Par →",
  },
  fi: {
    headline: "Rakennetaan sinun",
    headlineGradient: "elokuvaprofiilisi",
    subtitle: "Valitse nähtyjen nimikkeiden joukosta, jotta opimme makusi ja voimme antaa henkilökohtaisia suosituksia.",
    cta: "Aloitetaan",
    timeHint: "Kestää vain 2 minuuttia",
    step2Title: "Mitä olet nähnyt?",
    step2Hint: "Napauta = pidin, pidä pohjassa = en pitänyt",
    searchPlaceholder: "Etkö löydä? Hae täältä...",
    liked: "pidin",
    disliked: "en pitänyt",
    minSelected: "vähintään 5 valittu",
    back: "Takaisin",
    continue: "Jatka",
    step3Title: "Mitä palveluja käytät?",
    step3Subtitle: "Suodatamme suositukset palveluihisi",
    finish: "Valmis",
    skip: "Ohita",
    saving: "Tallennetaan...",
    doneTitle: "Profiilisi on valmis!",
    doneSubtitle: (n: number) =>
      `Kirjasimme ${n} nimikettä ja rakensimme makuprofiilisi. Nyt voimme antaa sinulle henkilökohtaisia suosituksia.`,
    tasteTitle: "Makuprofiilisi",
    youLike: "Pidät",
    youAvoid: "Vältät",
    pacing: "Tempo",
    exploreRec: "Tutustu suosituksiin",
    goLibrary: "Siirry kirjastoon",
    startTogether: "Aloita Katsotaan Yhdessä",
    shareTaste: "Jaa makuprofiilisi",
    copied: "Linkki kopioitu!",
    parTitle: "Onko sinulla elokuvakumppani?",
    parDesc: "Yhdistäkää ja katsokaa mitä oikeasti pidätte — Taste Compatibility, yhteiset suosikit ja Tonight's Pick.",
    parCta: "Katso Logflix Par →",
  },
} as const;

/* ── streaming providers ─────────────────────────────────── */
const VIAPLAY_REGIONS = new Set(["NO", "SE", "DK", "FI", "IS"]);
const NORDIC_ONLY_IDS = new Set([76, 439]);  // Viaplay, TV 2 Play
const US_ONLY_IDS = new Set([15, 386]);      // Hulu, Peacock

interface StreamingService { id: number; name: string; color: string; }

const STREAMING_SERVICES: StreamingService[] = [
  { id: 8,    name: "Netflix",     color: "#e50914" },
  { id: 9,    name: "Prime Video", color: "#00a8e1" },
  { id: 337,  name: "Disney+",     color: "#113ccf" },
  { id: 1899, name: "Max",         color: "#002be7" },
  { id: 350,  name: "Apple TV+",   color: "#555555" },
  { id: 531,  name: "Paramount+",  color: "#0064ff" },
  { id: 15,   name: "Hulu",        color: "#1ce783" },
  { id: 386,  name: "Peacock",     color: "#E4551B" },
  { id: 76,   name: "Viaplay",     color: "#f12b24" },
  { id: 439,  name: "TV 2 Play",   color: "#e4002b" },
];

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTogether = searchParams.get("from") === "together";
  const minTitles = isTogether ? 3 : 5;
  const [step, setStep] = useState(1); // 1=titles, 2=services, 3=done
  const [titles, setTitles] = useState<OnboardingTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OnboardingTitle[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [tasteSummary, setTasteSummary] = useState<{ youLike: string; avoid: string; pacing: string } | null>(null);
  const [tasteLoading, setTasteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRegion, setUserRegion] = useState("US");
  const [locale, setLocale] = useState<Locale>("en");
  const [isPremium, setIsPremium] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [trialActivated, setTrialActivated] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const trialActivating = useRef(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const loadingTexts = locale === "no"
    ? ["Analyserer sjangerne dine...", "Finner mønstre i smaken din...", "Bygger filmprofilen din...", "Nesten klar..."]
    : ["Analysing your genres...", "Finding patterns in your taste...", "Building your film profile...", "Almost ready..."];

  useEffect(() => {
    if (!tasteLoading) return;
    const iv = setInterval(() => setLoadingTextIdx((i) => (i + 1) % 4), 2000);
    return () => clearInterval(iv);
  }, [tasteLoading]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bug 5: localStorage backup for selections
  useEffect(() => {
    try {
      const stored = localStorage.getItem("logflix_onboarding_selections");
      if (stored) {
        const parsed = JSON.parse(stored) as [string, Selection][];
        if (parsed.length > 0) setSelections(new Map(parsed));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (selections.size > 0) {
      try { localStorage.setItem("logflix_onboarding_selections", JSON.stringify(Array.from(selections.entries()))); } catch { /* ignore */ }
    }
  }, [selections]);

  // Fetch isPremium + activate trial when reaching step 3
  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      if (d.profile?.is_premium) setIsPremium(true);
      if (d.profile?.trial_ends_at) {
        const daysLeft = Math.ceil((new Date(d.profile.trial_ends_at).getTime() - Date.now()) / 86400000);
        if (daysLeft > 0) { setTrialActivated(true); setTrialDays(daysLeft); setIsPremium(true); }
      }
    }).catch(() => {});
  }, []);

  // Auto-activate trial on step 3 for non-premium users
  useEffect(() => {
    if (step !== 3 || isPremium || trialActivated || trialActivating.current) return;
    trialActivating.current = true;
    fetch("/api/trial/activate", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setTrialActivated(true); setTrialDays(7); setIsPremium(true); }
      })
      .catch(() => {});
  }, [step, isPremium, trialActivated]);

  // Detect region + locale via the ribbon endpoint (same as Se Sammen)
  useEffect(() => {
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
      })
      .catch(() => {});
  }, []);

  // Load curated titles when entering step 1 (title selection)
  useEffect(() => {
    if (step === 1 && titles.length === 0) {
      setLoading(true);
      fetch("/api/onboarding/titles")
        .then((r) => r.json())
        .then((data) => setTitles(data.titles || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [step, titles.length]);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=multi`);
        const data = await res.json();
        const results: OnboardingTitle[] = (data.results || [])
          .filter((r: Record<string, unknown>) => r.poster_path && (r.media_type === "movie" || r.media_type === "tv"))
          .slice(0, 12)
          .map((r: Record<string, unknown>) => ({
            tmdb_id: r.id as number,
            type: r.media_type as MediaType,
            title: (r.title || r.name) as string,
            poster_path: r.poster_path as string,
            year: ((r.release_date || r.first_air_date) as string || "").slice(0, 4),
          }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  function toggleSelection(title: OnboardingTitle, forceSentiment?: "liked" | "disliked") {
    const key = `${title.tmdb_id}:${title.type}`;
    setSelections((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);

      if (forceSentiment) {
        if (existing?.sentiment === forceSentiment) {
          next.delete(key);
        } else {
          next.set(key, { tmdb_id: title.tmdb_id, type: title.type, sentiment: forceSentiment });
        }
      } else {
        if (existing) {
          next.delete(key);
        } else {
          next.set(key, { tmdb_id: title.tmdb_id, type: title.type, sentiment: "liked" });
        }
      }
      return next;
    });
  }

  function handlePointerDown(title: OnboardingTitle) {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleSelection(title, "disliked");
    }, 500);
  }

  function handlePointerUp(title: OnboardingTitle) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressTriggered.current) {
      toggleSelection(title, "liked");
    }
  }

  function handlePointerCancel() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function toggleService(id: number) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      const titleData = Array.from(selections.values());
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: titleData,
          streaming_services: Array.from(selectedServices),
        }),
      });
      const data = await res.json();

      // Bug 3: check for profile update error
      if (!res.ok || data.error) {
        setSaveError(true);
        setSaving(false);
        return;
      }

      // Bug 1: track only on success
      track("onboarding_completed", { selection_count: selections.size, services_count: selectedServices.size });
      setStep(3);
      setTasteLoading(true);

      // Bug 5: clear localStorage after successful save
      try { localStorage.removeItem("logflix_onboarding_selections"); } catch { /* ignore */ }

      // Bug 2: poll taste summary every 1.5s instead of 5s hard delay
      let attempts = 0;
      const pollTaste = async () => {
        while (attempts < 10) {
          attempts++;
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const tasteRes = await fetch("/api/taste-summary");
            const tasteData = await tasteRes.json();
            if (tasteData.summary?.youLike) {
              setTasteSummary(tasteData.summary);
              break;
            }
          } catch { /* retry */ }
        }
        setTasteLoading(false);
      };
      pollTaste();
    } catch {
      setSaveError(true);
    }
    setSaving(false);
  }

  const s = strings[locale] ?? strings.en;
  const selectionCount = selections.size;
  const displayTitles = searchQuery.trim() ? searchResults : titles;
  const likedCount = Array.from(selections.values()).filter((v) => v.sentiment === "liked").length;
  const dislikedCount = Array.from(selections.values()).filter((v) => v.sentiment === "disliked").length;
  const visibleServices = STREAMING_SERVICES.filter((service) => {
    if (NORDIC_ONLY_IDS.has(service.id)) return VIAPLAY_REGIONS.has(userRegion);
    if (US_ONLY_IDS.has(service.id)) return userRegion === "US";
    return true;
  });

  return (
    <div className="min-h-dvh relative" style={{ background: "var(--bg-base)" }}>
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255, 42, 42, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Progress bar */}
      {step < 3 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--bg-surface)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* ───── STEP 1: Title Selection ───── */}
        {step === 1 && (
          <div className="py-6 pb-28 animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">
                {s.step2Title}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {s.step2Hint}
              </p>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={s.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] input-glow focus:outline-none transition-all"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                )}
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-xs">
                {likedCount > 0 && (
                  <span className="text-[var(--green)]">
                    {likedCount} {s.liked}
                  </span>
                )}
                {dislikedCount > 0 && (
                  <span className="text-[var(--red)]">
                    {dislikedCount} {s.disliked}
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: selectionCount >= minTitles ? "var(--green)" : "var(--text-tertiary)" }}>
                {selectionCount} {locale === "no" ? "av" : "of"} {minTitles} {locale === "no" ? "valgt" : "selected"}
              </span>
            </div>

            {/* Segmented progress */}
            <div className="flex gap-1.5 mb-5">
              {Array.from({ length: minTitles }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: i < selectionCount
                      ? selectionCount >= minTitles ? "var(--green)" : "var(--accent)"
                      : "var(--bg-surface)",
                  }}
                />
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] skeleton rounded-[var(--radius-md)]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {displayTitles.map((title) => {
                  const key = `${title.tmdb_id}:${title.type}`;
                  const selection = selections.get(key);
                  const isLiked = selection?.sentiment === "liked";
                  const isDisliked = selection?.sentiment === "disliked";

                  return (
                    <div
                      key={key}
                      className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden cursor-pointer select-none transition-all duration-200"
                      style={{
                        boxShadow: isLiked
                          ? "0 0 20px rgba(52, 211, 153, 0.3), inset 0 0 0 2px var(--green)"
                          : isDisliked
                          ? "0 0 20px rgba(248, 113, 113, 0.3), inset 0 0 0 2px var(--red)"
                          : "none",
                        opacity: selection ? 1 : 0.7,
                        transform: selection ? "scale(0.97)" : "scale(1)",
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handlePointerDown(title);
                      }}
                      onPointerUp={() => handlePointerUp(title)}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {title.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${title.poster_path}`}
                          alt={title.title}
                          fill
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                          className="object-cover"
                          draggable={false}
                        />
                      )}

                      {/* Selection badge */}
                      {selection && (
                        <div className="absolute top-1.5 right-1.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              background: isLiked ? "var(--green)" : "var(--red)",
                              color: "white",
                              boxShadow: isLiked
                                ? "0 0 12px rgba(52, 211, 153, 0.5)"
                                : "0 0 12px rgba(248, 113, 113, 0.5)",
                            }}
                          >
                            {isLiked ? "+" : "-"}
                          </div>
                        </div>
                      )}

                      {/* Title label at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-[10px] font-medium text-white/90 truncate">{title.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky bottom bar — all screen sizes */}
            <div
              className="fixed bottom-0 left-0 right-0 z-40"
              style={{
                padding: "16px 24px",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                background: "rgba(10,10,12,0.9)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectionCount < minTitles}
                  className="btn-press w-full py-3.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {s.continue} ({selectionCount}/{minTitles})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───── STEP 2: Streaming Services ───── */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center min-h-dvh py-10 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
              {s.step3Title}
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-8 text-center">
              {s.step3Subtitle}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-10">
              {visibleServices.map((service) => {
                const selected = selectedServices.has(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className="btn-press relative flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border transition-all duration-200"
                    style={{
                      background: selected ? `${service.color}15` : "var(--glass)",
                      borderColor: selected ? `${service.color}40` : "var(--glass-border)",
                      boxShadow: selected ? `0 0 20px ${service.color}20` : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: service.color }}
                    >
                      {service.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {service.name}
                    </span>
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: service.color }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-lg">
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {s.back}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-press flex-1 py-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all disabled:opacity-40"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {s.saving}
                    </span>
                  ) : (
                    s.finish
                  )}
                </button>
                {selectedServices.size === 0 && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {s.skip}
                  </button>
                )}
              </div>
              {saveError && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-red-400 mb-2">{locale === "no" ? "Noe gikk galt — prøv igjen" : "Something went wrong — try again"}</p>
                  <button onClick={handleSave} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                    {locale === "no" ? "Prøv igjen" : "Try again"}
                  </button>
                </div>
              )}
              {isTogether && (
                <button
                  onClick={() => router.push("/together")}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                >
                  {s.skip} — {s.startTogether}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ───── STEP 3: Done ───── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center min-h-dvh py-10 text-center animate-fade-in-up">
            {/* Celebration / Loading */}
            <div className="relative mb-6">
              {tasteLoading ? (
                <div className="w-20 h-20 rounded-full bg-[rgba(255,42,42,0.08)] flex items-center justify-center">
                  <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-[var(--green-glow)] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--green)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>
                    &#x2728;
                  </div>
                  <div className="absolute -bottom-1 -left-3 text-lg animate-bounce" style={{ animationDelay: "0.5s" }}>
                    &#x1F3AC;
                  </div>
                </>
              )}
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {tasteLoading ? s.saving : s.doneTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm transition-opacity duration-300" key={tasteLoading ? loadingTextIdx : "done"}>
              {tasteLoading ? loadingTexts[loadingTextIdx] : s.doneSubtitle(selectionCount)}
            </p>

            {/* Taste summary preview */}
            {!tasteLoading && tasteSummary && (
              <div className="glass rounded-[var(--radius-lg)] p-5 mb-8 text-left w-full max-w-md">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{s.tasteTitle}</h3>
                <div className="space-y-2.5">
                  {tasteSummary.youLike && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--green)] font-bold">{s.youLike}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.youLike.length > 120 ? tasteSummary.youLike.slice(0, 120) + "..." : tasteSummary.youLike}</p>
                    </div>
                  )}
                  {tasteSummary.avoid && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--red)] font-bold">{s.youAvoid}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.avoid.length > 120 ? tasteSummary.avoid.slice(0, 120) + "..." : tasteSummary.avoid}</p>
                    </div>
                  )}
                  {tasteSummary.pacing && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--yellow)] font-bold">{s.pacing}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.pacing.length > 120 ? tasteSummary.pacing.slice(0, 120) + "..." : tasteSummary.pacing}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trial activated banner */}
            {!tasteLoading && trialActivated && (
              <div
                className="w-full max-w-md rounded-xl px-4 py-3 mb-4 text-center"
                style={{ background: "rgba(245,200,66,0.08)", border: "0.5px solid rgba(245,200,66,0.25)" }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: "#F5C842", margin: "0 0 2px" }}>
                  🎁 {locale === "no" ? "7 dager gratis Premium aktivert!" : locale === "se" ? "7 dagars gratis Premium aktiverat!" : locale === "dk" ? "7 dages gratis Premium aktiveret!" : locale === "fi" ? "7 päivän ilmainen Premium aktivoitu!" : "7 days free Premium activated!"}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
                  {locale === "no" ? "Tonight's Pick, Curator ubegrenset + partneren får det gratis" : "Tonight's Pick, unlimited Curator + your partner gets it free"}
                </p>
                <p style={{ fontSize: 10, color: "rgba(245,200,66,0.6)", margin: 0 }}>
                  {trialDays} {locale === "no" ? "dager gjenstår" : locale === "se" ? "dagar kvar" : locale === "dk" ? "dage tilbage" : locale === "fi" ? "päivää jäljellä" : "days remaining"}
                </p>
              </div>
            )}

            {/* Email capture */}
            {!tasteLoading && !emailOptIn && (
              <div
                className="w-full max-w-md rounded-xl px-4 py-3 mb-4 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: "0 0 2px" }}>
                  📬 {locale === "no" ? "Få Tonight's Pick kl 18:00 hver dag" : locale === "se" ? "Få Tonight's Pick kl 18:00 varje dag" : locale === "dk" ? "Få Tonight's Pick kl 18:00 hver dag" : locale === "fi" ? "Saat Tonight's Pick klo 18:00 joka päivä" : "Get Tonight's Pick at 6 PM every day"}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 10px" }}>
                  {locale === "no" ? "Vi sender deg dagens film + serie direkte på e-post" : "We'll send you today's movie + series directly to your email"}
                </p>
                <button
                  onClick={async () => {
                    setEmailSaving(true);
                    try {
                      await fetch("/api/email-preferences", { method: "POST" });
                      setEmailOptIn(true);
                    } catch { /* ignore */ }
                    setEmailSaving(false);
                  }}
                  disabled={emailSaving}
                  className="px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                >
                  {emailSaving ? "..." : (locale === "no" ? "Ja takk!" : locale === "se" ? "Ja tack!" : locale === "dk" ? "Ja tak!" : "Yes please!")}
                </button>
                <button
                  onClick={() => setEmailOptIn(true)}
                  style={{ display: "block", margin: "6px auto 0", fontSize: 10, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
                >
                  {locale === "no" ? "Hopp over" : locale === "se" ? "Hoppa över" : locale === "dk" ? "Spring over" : locale === "fi" ? "Ohita" : "Skip"}
                </button>
              </div>
            )}
            {!tasteLoading && emailOptIn && !trialActivated && (
              <p style={{ fontSize: 11, color: "rgba(245,200,66,0.7)", margin: "0 0 12px", textAlign: "center" }}>
                ✅ {locale === "no" ? "Du får Tonight's Pick på e-post!" : "You'll get Tonight's Pick by email!"}
              </p>
            )}

            {!tasteLoading && (
              <div className="flex flex-col gap-3 w-full max-w-md">
                <button
                  onClick={() => router.push(isTogether ? "/together" : "/recommendations")}
                  className="btn-press w-full py-3 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all"
                >
                  {isTogether ? s.startTogether : s.exploreRec}
                </button>
                {!isTogether && (
                  <button
                    onClick={() => router.push("/together")}
                    className="btn-press w-full py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] font-medium text-xs transition-all"
                  >
                    {s.startTogether}
                  </button>
                )}

                {/* Premium trial teaser */}
                {!isPremium && (
                  <Link
                    href="/premium"
                    style={{ display: "block", fontSize: 11, color: "rgba(245,200,66,0.8)", textAlign: "center", marginTop: 8, textDecoration: "none" }}
                  >
                    ✨ {locale === "no" || locale === "dk" ? "Du får 7 dager gratis Premium når du inviterer partneren din" : locale === "se" ? "Du får 7 dagars gratis Premium när du bjuder in din partner" : locale === "fi" ? "Saat 7 päivää ilmaista Premiumia kun kutsut kumppanisi" : "Get 7 days free Premium when you invite your partner"}
                  </Link>
                )}

                {/* Par teaser — only for non-premium */}
                {!isPremium && (
                  <button
                    onClick={() => router.push("/premium")}
                    className="w-full mt-6 rounded-[var(--radius-lg)] p-4 text-left transition-all hover:border-[var(--accent)]/30"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(229,9,20,0.15)", cursor: "pointer" }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">💑</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{s.parTitle}</p>
                        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-2">{s.parDesc}</p>
                        <span className="text-xs font-semibold" style={{ color: "#E50914" }}>{s.parCta}</span>
                        <p style={{ fontSize: 11, color: "rgba(245,200,66,0.7)", marginTop: 4 }}>
                          💑 {locale === "no" || locale === "dk" ? "Partneren din får det gratis — 14,50 kr per person" : locale === "se" ? "Din partner får det gratis — 14,50 kr per person" : locale === "fi" ? "Kumppanisi saa sen ilmaiseksi — 14,50 kr per henkilö" : "Your partner gets it for free — 7 NOK per person"}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
