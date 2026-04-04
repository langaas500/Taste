"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIThinkingScreen from "@/components/AIThinkingScreen";
import GlowButton from "@/components/GlowButton";
import PremiumModal from "@/components/PremiumModal";

import { useLocale } from "@/hooks/useLocale";
import type { TasteSummary } from "@/lib/types";

const BLUR_CHAR_LIMIT = 100;
const MIN_TITLES = 10;
const TMDB_IMG = "https://image.tmdb.org/t/p/w200";

const strings = {
  no: {
    pageTitle: "Din smaksprofil",
    filmsmaken: "Filmsmaken din",
    analyze: "Analyser min smak",
    refresh: "Oppdater smaksprofil",
    upgradeRefresh: "Oppdater krever Premium",
    blurHint: "Smaksprofilen din er klar — du mister innsikten uten Premium",
    lastUpdated: "Sist oppdatert",
    youLike: "Du liker",
    avoid: "Du unngår gjerne",
    pacing: "Tempo, tone og temaer",
    strongSignals: "Sterke signaler",
    weakSignals: "Svake signaler",
    basedOn: "Basert på smaken din nå:",
    vsUsers: "Din smak sammenlignet med andre",
    darkerThan: "Du liker mørkere innhold enn",
    lessRomance: "Du ser mindre romantikk enn",
    fasterTempo: "Du foretrekker raskere tempo enn",
    ofUsers: "av brukerne",
    aiUpdated: "AI-analyse oppdatert i dag",
    basedOnTitles: (n: number) => `Basert på ${n} titler`,
    confidence: "confidence",
    dominantGenres: "Dominante sjangre",
    tempoLabel: "Tempo",
    toneLabel: "Tone",
    themesLabel: "Temaer",
    parReport: "Se par-rapporten",
    parReportDesc: "Hvordan matcher smaken din med en partner?",
    emptyIcon: "🎬",
    emptyTitle: "Vi trenger litt mer å jobbe med",
    emptyDesc: "Legg til minst 10 titler i biblioteket for å analysere filmsmaken din",
    emptyCta: "Legg til titler",
    emptyImport: "Importer fra Netflix eller Trakt",
    progressText: (n: number) => `${n} av ${MIN_TITLES} titler lagt til — nesten klar!`,
    progressCta: "Legg til flere titler",
    generating: "Analyserer filmsmaken din...",
    loading: "Laster smaksprofil...",
    avoidsLabel: "Unngår",
  },
  en: {
    pageTitle: "Your taste profile",
    filmsmaken: "Your film taste",
    analyze: "Analyze my taste",
    refresh: "Refresh taste profile",
    upgradeRefresh: "Refresh requires Premium",
    blurHint: "Your taste profile is ready — you'll lose this insight without Premium",
    lastUpdated: "Last updated",
    youLike: "You like",
    avoid: "You tend to avoid",
    pacing: "Pacing, tone and themes",
    strongSignals: "Strong signals",
    weakSignals: "Weak signals",
    basedOn: "Based on your taste:",
    vsUsers: "Your taste vs other users",
    darkerThan: "You like darker content than",
    lessRomance: "You watch less romance than",
    fasterTempo: "You prefer faster pacing than",
    ofUsers: "of users",
    aiUpdated: "AI analysis updated today",
    basedOnTitles: (n: number) => `Based on ${n} titles`,
    confidence: "confidence",
    dominantGenres: "Dominant genres",
    tempoLabel: "Tempo",
    toneLabel: "Tone",
    themesLabel: "Themes",
    parReport: "See couple report",
    parReportDesc: "How does your taste match with a partner?",
    emptyIcon: "🎬",
    emptyTitle: "We need a bit more to work with",
    emptyDesc: "Add at least 10 titles to your library to analyze your film taste",
    emptyCta: "Add titles",
    emptyImport: "Import from Netflix or Trakt",
    progressText: (n: number) => `${n} of ${MIN_TITLES} titles added — almost there!`,
    progressCta: "Add more titles",
    generating: "Analyzing your film taste...",
    loading: "Loading taste profile...",
    avoidsLabel: "Avoids",
  },
  se: {
    pageTitle: "Din smakprofil",
    filmsmaken: "Din filmsmak",
    analyze: "Analysera min smak",
    refresh: "Uppdatera smakprofil",
    upgradeRefresh: "Uppdatering kräver Premium",
    blurHint: "Din smakprofil är klar — du förlorar insikten utan Premium",
    lastUpdated: "Senast uppdaterad",
    youLike: "Du gillar",
    avoid: "Du undviker gärna",
    pacing: "Tempo, ton och teman",
    strongSignals: "Starka signaler",
    weakSignals: "Svaga signaler",
    basedOn: "Baserat på din smak:",
    vsUsers: "Din smak jämfört med andra",
    darkerThan: "Du gillar mörkare innehåll än",
    lessRomance: "Du ser mindre romantik än",
    fasterTempo: "Du föredrar snabbare tempo än",
    ofUsers: "av användarna",
    aiUpdated: "AI-analys uppdaterad idag",
    basedOnTitles: (n: number) => `Baserat på ${n} titlar`,
    confidence: "confidence",
    dominantGenres: "Dominanta genrer",
    tempoLabel: "Tempo",
    toneLabel: "Ton",
    themesLabel: "Teman",
    parReport: "Se parrapport",
    parReportDesc: "Hur matchar din smak med en partner?",
    emptyIcon: "🎬",
    emptyTitle: "Vi behöver lite mer att jobba med",
    emptyDesc: "Lägg till minst 10 titlar i ditt bibliotek för att analysera din filmsmak",
    emptyCta: "Lägg till titlar",
    emptyImport: "Importera från Netflix eller Trakt",
    progressText: (n: number) => `${n} av ${MIN_TITLES} titlar tillagda — nästan klar!`,
    progressCta: "Lägg till fler titlar",
    generating: "Analyserar din filmsmak...",
    loading: "Laddar smakprofil...",
    avoidsLabel: "Undviker",
  },
  dk: {
    pageTitle: "Din smagsprofil",
    filmsmaken: "Din filmsmag",
    analyze: "Analysér min smag",
    refresh: "Opdater smagsprofil",
    upgradeRefresh: "Opdatering kræver Premium",
    blurHint: "Din smagsprofil er klar — du mister indsigten uden Premium",
    lastUpdated: "Sidst opdateret",
    youLike: "Du kan lide",
    avoid: "Du undgår gerne",
    pacing: "Tempo, tone og temaer",
    strongSignals: "Stærke signaler",
    weakSignals: "Svage signaler",
    basedOn: "Baseret på din smag:",
    vsUsers: "Din smag sammenlignet med andre",
    darkerThan: "Du kan lide mørkere indhold end",
    lessRomance: "Du ser mindre romantik end",
    fasterTempo: "Du foretrækker hurtigere tempo end",
    ofUsers: "af brugerne",
    aiUpdated: "AI-analyse opdateret i dag",
    basedOnTitles: (n: number) => `Baseret på ${n} titler`,
    confidence: "confidence",
    dominantGenres: "Dominante genrer",
    tempoLabel: "Tempo",
    toneLabel: "Tone",
    themesLabel: "Temaer",
    parReport: "Se parrapport",
    parReportDesc: "Hvordan matcher din smag med en partner?",
    emptyIcon: "🎬",
    emptyTitle: "Vi har brug for lidt mere at arbejde med",
    emptyDesc: "Tilføj mindst 10 titler til dit bibliotek for at analysere din filmsmag",
    emptyCta: "Tilføj titler",
    emptyImport: "Importér fra Netflix eller Trakt",
    progressText: (n: number) => `${n} af ${MIN_TITLES} titler tilføjet — næsten klar!`,
    progressCta: "Tilføj flere titler",
    generating: "Analyserer din filmsmag...",
    loading: "Indlæser smagsprofil...",
    avoidsLabel: "Undgår",
  },
  fi: {
    pageTitle: "Makuprofiilisi",
    filmsmaken: "Elokuvamakusi",
    analyze: "Analysoi makuni",
    refresh: "Päivitä makuprofiili",
    upgradeRefresh: "Päivitys vaatii Premiumin",
    blurHint: "Makuprofiilisi on valmis — menetät tämän tiedon ilman Premiumia",
    lastUpdated: "Viimeksi päivitetty",
    youLike: "Pidät",
    avoid: "Vältät mielellään",
    pacing: "Tempo, sävy ja teemat",
    strongSignals: "Vahvat signaalit",
    weakSignals: "Heikot signaalit",
    basedOn: "Makusi perusteella:",
    vsUsers: "Makusi verrattuna muihin",
    darkerThan: "Pidät tummemmasta sisällöstä kuin",
    lessRomance: "Katsot vähemmän romantiikkaa kuin",
    fasterTempo: "Pidät nopeammasta temposta kuin",
    ofUsers: "käyttäjistä",
    aiUpdated: "AI-analyysi päivitetty tänään",
    basedOnTitles: (n: number) => `Perustuu ${n} nimikkeeseen`,
    confidence: "confidence",
    dominantGenres: "Hallitsevat genret",
    tempoLabel: "Tempo",
    toneLabel: "Sävy",
    themesLabel: "Teemat",
    parReport: "Katso pariraportti",
    parReportDesc: "Miten makusi sopii yhteen kumppanin kanssa?",
    emptyIcon: "🎬",
    emptyTitle: "Tarvitsemme hieman enemmän",
    emptyDesc: "Lisää vähintään 10 nimikettä kirjastoosi analysoidaksemme elokuvamakuasi",
    emptyCta: "Lisää nimikkeitä",
    emptyImport: "Tuo Netflixistä tai Traktista",
    progressText: (n: number) => `${n}/${MIN_TITLES} nimikettä lisätty — melkein valmis!`,
    progressCta: "Lisää nimikkeitä",
    generating: "Analysoidaan elokuvamakuasi...",
    loading: "Ladataan makuprofiilia...",
    avoidsLabel: "Välttää",
  },
} as const;

interface LikeExample {
  tmdb_id: number;
  title: string;
  genre: string;
  poster_path: string;
  match_score: number;
}

interface AvoidExample {
  tmdb_id: number;
  title: string;
  genre: string;
  poster_path: string;
}

interface TasteEnrichment {
  confidence_score: number;
  title_count: number;
  dominant_genres: string[];
  like_examples: LikeExample[];
  avoid_examples: AvoidExample[];
  recommendations: { tmdb_id: number; title: string; poster_path: string; match_score: number }[];
  percentiles: { darker_than: number; less_romance_than: number; faster_tempo_than: number };
  tempo: string;
  tone: string[];
  themes: string[];
}

const EMPTY_ENRICHMENT: TasteEnrichment = {
  confidence_score: 0,
  title_count: 0,
  dominant_genres: [],
  like_examples: [],
  avoid_examples: [],
  recommendations: [],
  percentiles: { darker_than: 50, less_romance_than: 50, faster_tempo_than: 50 },
  tempo: "Medium",
  tone: [],
  themes: [],
};

/* ── PosterCard ─────────────────────────────────────── */
function PosterCard({ title, genre, posterPath, score, variant = "like" }: {
  title: string;
  genre: string;
  posterPath: string;
  score?: number;
  variant?: "like" | "avoid";
}) {
  const scoreColor = variant === "avoid" ? "#ff2a2a" : score && score >= 85 ? "#4ade80" : "#facc15";
  const bg = posterPath
    ? `url(${TMDB_IMG}${posterPath})`
    : variant === "like"
    ? "linear-gradient(160deg,#1a2e1a,#0d1f0d)"
    : "linear-gradient(160deg,#2e1a1a,#1f0d0d)";

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        aspectRatio: "2/3",
        backgroundImage: bg,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.2) 55%,transparent 100%)" }} />
      {variant === "like" && (
        <div style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="#4ade80"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 8px" }}>
        <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>{title}</p>
        <p style={{ margin: "0 0 5px", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{genre}</p>
        {score !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>{score}%</span>
        )}
        {variant === "avoid" && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#ff2a2a" }}>Unngår</span>
        )}
      </div>
    </div>
  );
}

/* ── RecommendationRow ──────────────────────────────── */
function RecommendationRow({ title, posterPath, score }: { title: string; posterPath: string; score: number }) {
  const bg = posterPath ? `url(${TMDB_IMG}${posterPath})` : "linear-gradient(135deg,#1a1a2e,#16213e)";
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", position: "relative", height: 80, backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.92) 0%,transparent 60%)" }} />
      <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{title}</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>{score}%</span>
      </div>
    </div>
  );
}

/* ── BlurText ───────────────────────────────────────── */
function BlurText({ text, isPremium, blurHint }: { text: string; isPremium: boolean; blurHint: string }) {
  const needsBlur = !isPremium && text.length > BLUR_CHAR_LIMIT;
  const visible = needsBlur ? text.slice(0, BLUR_CHAR_LIMIT) : text;
  const blurred = needsBlur ? text.slice(BLUR_CHAR_LIMIT) : "";
  return (
    <div>
      <p style={{ margin: "0 0 needsBlur ? 12px : 0", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
        {visible}
        {needsBlur && <span style={{ filter: "blur(10px)", opacity: 0.6, userSelect: "none" }}>{blurred}</span>}
      </p>
      {needsBlur && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{blurHint}</span>
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function TastePage() {
  const [summary, setSummary] = useState<TasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  const [showPremium, setShowPremium] = useState(false);
  const [titleCount, setTitleCount] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [enrichment, setEnrichment] = useState<TasteEnrichment>(EMPTY_ENRICHMENT);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  function applyApiData(data: Record<string, unknown>) {
    if (data.is_premium !== undefined) setIsPremium(!!data.is_premium);
    if (data.title_count !== undefined) setTitleCount(data.title_count as number);
    setEnrichment({
      confidence_score: (data.confidence_score as number) ?? 0,
      title_count: (data.title_count as number) ?? 0,
      dominant_genres: (data.dominant_genres as string[]) ?? [],
      like_examples: (data.like_examples as LikeExample[]) ?? [],
      avoid_examples: (data.avoid_examples as AvoidExample[]) ?? [],
      recommendations: (data.recommendations as TasteEnrichment["recommendations"]) ?? [],
      percentiles: (data.percentiles as TasteEnrichment["percentiles"]) ?? EMPTY_ENRICHMENT.percentiles,
      tempo: (data.tempo as string) ?? "Medium",
      tone: (data.tone as string[]) ?? [],
      themes: (data.themes as string[]) ?? [],
    });
  }

  useEffect(() => {
    loadSummary();
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      if (d.profile?.display_name) setProfileName(d.profile.display_name);
    }).catch(() => {});
  }, []);

  async function loadSummary() {
    try {
      const res = await fetch("/api/taste-summary");
      const data = await res.json();
      applyApiData(data);
      if (data.summary && (data.summary.youLike || data.summary.avoid || data.summary.pacing)) {
        setSummary(data.summary);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/taste-summary", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      applyApiData(data);
      if (data.summary && (data.summary.youLike || data.summary.avoid || data.summary.pacing)) {
        setSummary(data.summary);
      } else {
        setError("Smaksprofilen kunne ikke genereres. Prøv igjen.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate taste summary");
    }
    setGenerating(false);
  }

  useEffect(() => {
    if (!loading && !summary && titleCount !== null && titleCount >= MIN_TITLES && !generating) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, summary, titleCount]);

  if (loading || titleCount === null) return <LoadingSpinner text={s.loading} />;
  if (generating) return <AIThinkingScreen />;

  if (!summary && titleCount === 0) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-5xl mb-4">{s.emptyIcon}</span>
        <h2 className="text-xl font-bold text-white mb-2">{s.emptyTitle}</h2>
        <p className="text-sm text-white/50 mb-6 max-w-sm">{s.emptyDesc}</p>
        <Link href="/search" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "#dc2626" }}>{s.emptyCta}</Link>
        <Link href="/timemachine" className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors">{s.emptyImport}</Link>
      </div>
    );
  }

  if (!summary && titleCount < MIN_TITLES) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-5xl mb-4">{s.emptyIcon}</span>
        <p className="text-sm font-medium text-white/70 mb-4">{s.progressText(titleCount)}</p>
        <div className="w-full max-w-xs h-2 rounded-full bg-white/[0.08] mb-6 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(titleCount / MIN_TITLES) * 100}%`, background: "#dc2626" }} />
        </div>
        <Link href="/search" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "#dc2626" }}>{s.progressCta}</Link>
        <Link href="/timemachine" className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors">{s.emptyImport}</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ position: "relative", textAlign: "center", padding: "8px 0 24px" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 260, height: 160, background: "radial-gradient(ellipse,rgba(255,42,42,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,42,42,0.9)" }}>{s.pageTitle}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>{s.filmsmaken}</h1>
          {!summary && (
            <GlowButton onClick={generate} disabled={generating}>{s.analyze}</GlowButton>
          )}
          {summary && isPremium && (
            <GlowButton onClick={generate} disabled={generating}>{s.refresh}</GlowButton>
          )}
          {summary && !isPremium && (
            <button onClick={() => setShowPremium(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 cursor-pointer" style={{ background: "linear-gradient(#B00000,#E50914)" }}>
              <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              {s.upgradeRefresh}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 mb-4 border border-[rgba(248,113,113,0.1)]">{error}</div>
      )}

      {summary && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Confidence card */}
          <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.aiUpdated}</span>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.basedOnTitles(enrichment.title_count || titleCount || 0)}</span>
              {enrichment.dominant_genres.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {enrichment.dominant_genres.map(g => (
                    <span key={g} style={{ background: "rgba(255,42,42,0.12)", border: "1px solid rgba(255,42,42,0.25)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "#ff8080", fontWeight: 600 }}>{g}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{enrichment.confidence_score}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>%</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.confidence}</div>
            </div>
          </div>

          {/* You like */}
          {summary.youLike && (
            <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#4ade80" }}>{s.youLike}</span>
              </div>
              <BlurText text={summary.youLike} isPremium={isPremium} blurHint={s.blurHint} />
              {enrichment.like_examples.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{s.strongSignals}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {enrichment.like_examples.map(ex => (
                      <PosterCard key={ex.tmdb_id} title={ex.title} genre={ex.genre} posterPath={ex.poster_path} score={ex.match_score} variant="like" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Avoid */}
          {summary.avoid && (
            <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#ff2a2a"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#ff4444" }}>{s.avoid}</span>
              </div>
              <BlurText text={summary.avoid} isPremium={isPremium} blurHint={s.blurHint} />
              {enrichment.avoid_examples.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{s.weakSignals}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                    {enrichment.avoid_examples.map(ex => (
                      <PosterCard key={ex.tmdb_id} title={ex.title} genre={ex.genre} posterPath={ex.poster_path} variant="avoid" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pacing */}
          {summary.pacing && (
            <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{s.pacing}</span>
              </div>
              {(enrichment.tempo || enrichment.tone.length > 0 || enrichment.themes.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
                  {enrichment.tempo && (
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.tempoLabel}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{enrichment.tempo}</p>
                    </div>
                  )}
                  {enrichment.tone.length > 0 && (
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.toneLabel}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{enrichment.tone.join(" · ")}</p>
                    </div>
                  )}
                  {enrichment.themes.length > 0 && (
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.themesLabel}</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {enrichment.themes.map(t => (
                          <span key={t} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <BlurText text={summary.pacing} isPremium={isPremium} blurHint={s.blurHint} />
            </div>
          )}

          {/* Recommendations */}
          {enrichment.recommendations.length > 0 && (
            <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
              <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{s.basedOn}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {enrichment.recommendations.map(r => (
                  <RecommendationRow key={r.tmdb_id} title={r.title} posterPath={r.poster_path} score={r.match_score} />
                ))}
              </div>
            </div>
          )}

          {/* Percentiles */}
          <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{s.vsUsers}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{s.darkerThan}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{enrichment.percentiles.darker_than}% {s.ofUsers}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{s.lessRomance}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{enrichment.percentiles.less_romance_than}% {s.ofUsers}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{s.fasterTempo}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{enrichment.percentiles.faster_tempo_than}% {s.ofUsers}</span>
              </div>
            </div>
          </div>

          {/* Couple report CTA */}
          <div style={{ background: "rgba(255,42,42,0.07)", border: "1px solid rgba(255,42,42,0.2)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{s.parReportDesc}</p>
            <Link href="/couple-report" style={{ background: "#ff2a2a", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{s.parReport} →</Link>
          </div>

          {summary.updatedAt && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
              {s.lastUpdated}: {new Date(summary.updatedAt).toLocaleString("nb-NO")}
            </p>
          )}
        </div>
      )}

      {/* Taste evolution link */}
      {titleCount !== null && titleCount >= 10 && (
        <Link
          href="/taste-evolution"
          className="block text-center text-xs font-medium mt-6 transition-colors hover:text-[#ff2a2a]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {locale === "no" ? "Se hvordan smaken din har utviklet seg →" : locale === "dk" ? "Se hvordan din smag har udviklet sig →" : locale === "se" ? "Se hur din smak har utvecklats →" : locale === "fi" ? "Katso miten makusi on kehittynyt →" : "See how your taste has evolved →"}
        </Link>
      )}

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="taste_refresh" userName={profileName} titleCount={titleCount} />
    </div>
  );
}