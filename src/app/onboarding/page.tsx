"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  const [tasteSummary, setTasteSummary] = useState<{ youLike: string; avoid: string; pacing: string } | null>(null);
  const [tasteLoading, setTasteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRegion, setUserRegion] = useState("US");
  const [locale, setLocale] = useState<Locale>("en");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    try {
      const titleData = Array.from(selections.values());
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: titleData,
          streaming_services: Array.from(selectedServices),
        }),
      });

      track("onboarding_completed", { selection_count: selections.size, services_count: selectedServices.size });
      setStep(3);
      setTasteLoading(true);

      // Fetch taste summary in background after showing done screen
      try {
        await new Promise((r) => setTimeout(r, 5000));
        const res = await fetch("/api/taste-summary");
        const data = await res.json();
        if (data.taste_summary) setTasteSummary(data.taste_summary);
      } catch {
        // Not critical
      }
      setTasteLoading(false);
    } catch {
      track("onboarding_completed", { selection_count: selections.size, services_count: selectedServices.size });
      setStep(3);
      setTasteLoading(false);
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
              <span className="text-xs text-[var(--text-tertiary)]">
                {selectionCount} / {minTitles}
              </span>
            </div>

            {/* Progress */}
            <div className="h-1 bg-[var(--bg-surface)] rounded-full mb-5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((selectionCount / minTitles) * 100, 100)}%`,
                  background: selectionCount >= minTitles ? "var(--green)" : "var(--accent)",
                }}
              />
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

            {/* Fixed bottom bar */}
            <div
              className="fixed bottom-0 left-0 right-0 z-40 p-4"
              style={{
                background: "linear-gradient(to top, var(--bg-base) 70%, transparent)",
                paddingBottom: "calc(var(--safe-bottom) + 16px)",
              }}
            >
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={() => setStep(2)}
                  disabled={selectionCount < minTitles}
                  className="btn-press w-full py-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
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
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm">
              {tasteLoading
                ? (locale === "no" ? "Bygger smaksprofilen din..." : locale === "dk" ? "Bygger din smagsprofil..." : locale === "se" ? "Bygger din smakprofil..." : locale === "fi" ? "Rakennetaan makuprofiiliasi..." : "Building your taste profile...")
                : s.doneSubtitle(selectionCount)}
            </p>

            {/* Taste summary preview */}
            {!tasteLoading && tasteSummary && (
              <div className="glass rounded-[var(--radius-lg)] p-5 mb-8 text-left w-full max-w-md">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{s.tasteTitle}</h3>
                <div className="space-y-2.5">
                  {tasteSummary.youLike && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--green)] font-bold">{s.youLike}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.youLike}</p>
                    </div>
                  )}
                  {tasteSummary.avoid && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--red)] font-bold">{s.youAvoid}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.avoid}</p>
                    </div>
                  )}
                  {tasteSummary.pacing && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--yellow)] font-bold">{s.pacing}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tasteSummary.pacing}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!tasteLoading && (
              <div className="flex flex-col gap-3 w-full max-w-md">
                {isTogether ? (
                  <button
                    onClick={() => router.push("/together")}
                    className="btn-press w-full py-3 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all"
                  >
                    {s.startTogether}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/recommendations")}
                      className="btn-press w-full py-3 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-semibold text-sm transition-all"
                    >
                      {s.exploreRec}
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push("/together")}
                        className="btn-press flex-1 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] font-medium text-xs transition-all"
                      >
                        {s.startTogether}
                      </button>
                      <button
                        onClick={() => router.push("/library")}
                        className="btn-press flex-1 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] font-medium text-xs transition-all"
                      >
                        {s.goLibrary}
                      </button>
                    </div>
                  </>
                )}

                {/* Share taste profile link */}
                {tasteSummary && (
                  <button
                    onClick={async () => {
                      const shareUrl = "https://logflix.app/taste";
                      const firstSentence = tasteSummary.youLike?.split(/[.!]/).filter(Boolean)[0]?.trim() || "";
                      const shareTitle = locale === "no" ? "Filmsmaken min på Logflix"
                        : locale === "dk" ? "Min filmsmag på Logflix"
                        : locale === "se" ? "Min filmsmak på Logflix"
                        : locale === "fi" ? "Elokuvamakuni Logflixissä"
                        : "My movie taste on Logflix";

                      if (navigator.share) {
                        try {
                          await navigator.share({ title: shareTitle, text: firstSentence, url: shareUrl });
                        } catch {
                          // User cancelled share
                        }
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mt-2"
                  >
                    {copied ? s.copied : s.shareTaste}
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
