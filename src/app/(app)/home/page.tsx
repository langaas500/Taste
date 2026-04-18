"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import StreamingModal from "@/components/StreamingModal";
import { logTitle, toggleFavorite } from "@/lib/api";
import { createSupabaseBrowser, fetchCacheForTitles } from "@/lib/supabase-browser";
import { prefetchNetflixIds } from "@/lib/prefetch-netflix-ids";
import type { UserTitle, TitleCache, MediaType, Recommendation } from "@/lib/types";
import { track } from "@/lib/posthog";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

const strings = {
  no: {
    title: "For deg",
    titlesInCollection: "titler i samlingen din",
    titleSingular: "tittel",
    greetMorning: "God morgen",
    greetDay: "God dag",
    greetEvening: "God kveld",
    greetLate: "Sent ute",
    loggedCount: (n: number) => `Du har logget ${n} titler`,
    togetherLabel: "Se Sammen",
    togetherHeadline: "Slutt å scrolle.",
    togetherHeadline2: "Finn noe å se sammen.",
    togetherSub: "Swipe filmer og serier sammen og match på under 3 minutter.",
    togetherSwipe: "Swipe",
    togetherMatch: "Match",
    togetherWatch: "Se",
    togetherFree: "✓ Gratis",
    togetherNoAccount: "✓ Ingen konto nødvendig",
    togetherSocialProof: "70+ filmelskere bruker dette",
    togetherCta: "Start Se Sammen",
    importTitle: "Importer seerhistorikk",
    importSub: "Hent inn det du allerede har sett fra Netflix og andre tjenester",
    continueWatching: "Fortsett å se",
    forDeg: "For deg",
    recentlyLogged: "Nylig logget",
    trending: "Populært nå",
    seeAll: "Se alle",
    watched: "Sett og likte",
    watchlist: "Legg i se-liste",
    liked: "👍 Likte",
    disliked: "👎 Mislikte",
    watchlistAction: "📌 Lagre",
    recTitle: "Anbefalt for deg",
    recTitlePremium: "Anbefalt for deg i dag",
    recBased: "Basert på filmsmaken din",
    recCta: "Se dine anbefalinger",
    curatorText: "Hva vil du føle i kveld?",
    curatorSub: "Curator analyserer biblioteket ditt og finner noe perfekt.",
    curatorCta: "Åpne Curator",
    tpTitle: (name: string) => `Tonight's Pick for deg og ${name}`,
    tpTitleSolo: "Tonight's Pick for deg",
    tpMovie: "Film i kveld",
    tpSeries: "Serie i kveld",
    tpMatch: "match",
    tpReroll: "Ny pick",
    tpNoPartner: "Koble til en partner for å få Tonight's Pick",
    tpConnect: "Koble til partner",
    tpSeTogether: "Se Sammen",
    coupleReportLink: "Se par-rapporten →",
    returnDay3Title: "Filmsmaken din tar form",
    returnDay3Desc: "Du har logget titler — se hva det sier om deg.",
    returnDay3Cta: "Se smaksprofil",
    returnDay7Title: "Du har brukt Logflix i en uke 🎉",
    returnDay7Desc: "Nok data til å analysere filmsmaken din nå.",
    returnDay7Cta: "Analyser smaken min",
    wrappedReady: (month: string) => `Din ${month} Wrapped er klar`,
    wrappedCta: "Se den →",
    wrappedCount: (n: number) => `${n} titler logget`,
    wrappedMonths: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
    wrappedLocked: "Din Wrapped er klar — lås opp med Premium",
    importPopupTitle: "Importer Netflix-historikken din",
    importPopupDesc: "Få personlige anbefalinger med en gang — basert på hva du allerede har sett.",
    importPopupCta: "Importer nå →",
    importPopupDismiss: "Ikke vis igjen",
    trialBanner: (d: number) => `🔥 ${d} ${d === 1 ? "dag" : "dager"} igjen av prøveperioden din — ikke mist Tonight's Pick og Curator`,
    trialCta: "Behold Premium — 29 kr/mnd →",
    trialExpired: "Prøveperioden din er over. Du har mistet tilgang til Tonight's Pick, ubegrenset Curator og full smaksprofil.",
    trialExpiredCta: "Aktiver Premium →",
    tasteEvoCta: "🎬 Se hvordan filmsmaken din har utviklet seg →",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "dag" : "dager"} på rad!`,
    streakSub: "Logg en tittel i dag for å holde streaken gående",
    streakLost: "🔥 Streaken din ble brutt — logg noe i dag for å starte på nytt!",
  },
  en: {
    title: "For You",
    titlesInCollection: "titles in your collection",
    titleSingular: "title",
    greetMorning: "Good morning",
    greetDay: "Good afternoon",
    greetEvening: "Good evening",
    greetLate: "Up late",
    loggedCount: (n: number) => `You've logged ${n} titles`,
    togetherLabel: "Watch Together",
    togetherHeadline: "Stop scrolling.",
    togetherHeadline2: "Find something to watch.",
    togetherSub: "Swipe movies and shows together and match in under 3 minutes.",
    togetherSwipe: "Swipe",
    togetherMatch: "Match",
    togetherWatch: "Watch",
    togetherFree: "✓ Free",
    togetherNoAccount: "✓ No account needed",
    togetherSocialProof: "70+ film lovers use this",
    togetherCta: "Start Watch Together",
    importTitle: "Import watch history",
    importSub: "Import what you've already watched from Netflix and other services",
    continueWatching: "Continue watching",
    forDeg: "For You",
    recentlyLogged: "Recently logged",
    trending: "Trending now",
    seeAll: "See all",
    watched: "Watched & liked",
    watchlist: "Add to watchlist",
    liked: "👍 Liked",
    disliked: "👎 Disliked",
    watchlistAction: "📌 Save",
    recTitle: "Recommended for you",
    recTitlePremium: "Recommended for you today",
    recBased: "Based on your film taste",
    recCta: "See your recommendations",
    curatorText: "What do you want to feel tonight?",
    curatorSub: "Curator analyzes your library and finds something perfect.",
    curatorCta: "Open Curator",
    tpTitle: (name: string) => `Tonight's Pick for you and ${name}`,
    tpTitleSolo: "Tonight's Pick for you",
    tpMovie: "Movie tonight",
    tpSeries: "Series tonight",
    tpMatch: "match",
    tpReroll: "New pick",
    tpNoPartner: "Link a partner to get Tonight's Pick",
    tpConnect: "Connect partner",
    tpSeTogether: "Watch Together",
    coupleReportLink: "See couple report →",
    returnDay3Title: "Your film taste is taking shape",
    returnDay3Desc: "You've logged titles — see what it says about you.",
    returnDay3Cta: "See taste profile",
    returnDay7Title: "You've used Logflix for a week 🎉",
    returnDay7Desc: "Enough data to analyze your film taste now.",
    returnDay7Cta: "Analyze my taste",
    wrappedReady: (month: string) => `Your ${month} Wrapped is ready`,
    wrappedCta: "View it →",
    wrappedCount: (n: number) => `${n} titles logged`,
    wrappedMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    wrappedLocked: "Your Wrapped is ready — unlock with Premium",
    importPopupTitle: "Import your Netflix history",
    importPopupDesc: "Get personal recommendations instantly — based on what you've already watched.",
    importPopupCta: "Import now →",
    importPopupDismiss: "Don't show again",
    trialBanner: (d: number) => `🔥 ${d} ${d === 1 ? "day" : "days"} left in your trial — don't lose Tonight's Pick and Curator`,
    trialCta: "Keep Premium — 29 kr/month →",
    trialExpired: "Your trial has ended. You've lost access to Tonight's Pick, unlimited Curator and full taste profile.",
    trialExpiredCta: "Activate Premium →",
    tasteEvoCta: "🎬 See how your taste in film has evolved →",
    streak: (n: number) => `🔥 ${n}-day streak!`,
    streakSub: "Log a title today to keep your streak going",
    streakLost: "🔥 Your streak was broken — log something today to start fresh!",
  },
  dk: {
    title: "For dig",
    titlesInCollection: "titler i din samling",
    titleSingular: "titel",
    greetMorning: "God morgen",
    greetDay: "God dag",
    greetEvening: "God aften",
    greetLate: "Sent ude",
    loggedCount: (n: number) => `Du har logget ${n} titler`,
    togetherLabel: "Se Sammen",
    togetherHeadline: "Stop med at scrolle.",
    togetherHeadline2: "Find noget at se sammen.",
    togetherSub: "Swipe film og serier sammen og match på under 3 minutter.",
    togetherSwipe: "Swipe",
    togetherMatch: "Match",
    togetherWatch: "Se",
    togetherFree: "✓ Gratis",
    togetherNoAccount: "✓ Ingen konto nødvendig",
    togetherSocialProof: "70+ filmnerder bruger dette",
    togetherCta: "Start Se Sammen",
    importTitle: "Importer seerhistorik",
    importSub: "Hent det du allerede har set fra Netflix og andre tjenester",
    continueWatching: "Fortsæt med at se",
    forDeg: "For dig",
    recentlyLogged: "Nyligt logget",
    trending: "Populært nu",
    seeAll: "Se alle",
    watched: "Set og kunne lide",
    watchlist: "Tilføj til se-liste",
    liked: "👍 Kunne lide",
    disliked: "👎 Kunne ikke lide",
    watchlistAction: "📌 Lagre",
    recTitle: "Anbefalet til dig",
    recTitlePremium: "Anbefalet til dig i dag",
    recBased: "Baseret på din filmsmag",
    recCta: "Se dine anbefalinger",
    curatorText: "Hvad vil du føle i aften?",
    curatorSub: "Curator analyserer dit bibliotek og finder noget perfekt.",
    curatorCta: "Åbn Curator",
    tpTitle: (name: string) => `Tonight's Pick for dig og ${name}`,
    tpTitleSolo: "Tonight's Pick for dig",
    tpMovie: "Film i aften",
    tpSeries: "Serie i aften",
    tpMatch: "match",
    tpReroll: "Nyt pick",
    tpNoPartner: "Forbind en partner for at få Tonight's Pick",
    tpConnect: "Forbind partner",
    tpSeTogether: "Se Sammen",
    coupleReportLink: "Se parrapporten →",
    returnDay3Title: "Din filmsmag tager form",
    returnDay3Desc: "Du har logget titler — se hvad det siger om dig.",
    returnDay3Cta: "Se smagsprofil",
    returnDay7Title: "Du har brugt Logflix i en uge 🎉",
    returnDay7Desc: "Nok data til at analysere din filmsmag nu.",
    returnDay7Cta: "Analyser min smag",
    wrappedReady: (month: string) => `Din ${month} Wrapped er klar`,
    wrappedCta: "Se den →",
    wrappedCount: (n: number) => `${n} titler logget`,
    wrappedMonths: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
    wrappedLocked: "Din Wrapped er klar — lås op med Premium",
    importPopupTitle: "Importer din Netflix-historik",
    importPopupDesc: "Få personlige anbefalinger med det samme — baseret på hvad du allerede har set.",
    importPopupCta: "Importer nu →",
    importPopupDismiss: "Vis ikke igen",
    trialBanner: (d: number) => `🔥 ${d} ${d === 1 ? "dag" : "dage"} tilbage af din prøveperiode — mist ikke Tonight's Pick og Curator`,
    trialCta: "Behold Premium — 29 kr/md →",
    trialExpired: "Din prøveperiode er udløbet. Du har mistet adgang til Tonight's Pick, ubegrænset Curator og fuld smagsprofil.",
    trialExpiredCta: "Aktiver Premium →",
    tasteEvoCta: "🎬 Se hvordan din filmsmag har udviklet sig →",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "dag" : "dage"} i træk!`,
    streakSub: "Log en titel i dag for at holde din streak kørende",
    streakLost: "🔥 Din streak blev brudt — log noget i dag for at starte forfra!",
  },
  se: {
    title: "För dig",
    titlesInCollection: "titlar i din samling",
    titleSingular: "titel",
    greetMorning: "God morgon",
    greetDay: "God dag",
    greetEvening: "God kväll",
    greetLate: "Uppe sent",
    loggedCount: (n: number) => `Du har loggat ${n} titlar`,
    togetherLabel: "Se Tillsammans",
    togetherHeadline: "Sluta scrolla.",
    togetherHeadline2: "Hitta något att se tillsammans.",
    togetherSub: "Swipa filmer och serier tillsammans och matcha på under 3 minuter.",
    togetherSwipe: "Swipa",
    togetherMatch: "Matcha",
    togetherWatch: "Se",
    togetherFree: "✓ Gratis",
    togetherNoAccount: "✓ Inget konto behövs",
    togetherSocialProof: "70+ filmälskare använder detta",
    togetherCta: "Starta Se Tillsammans",
    importTitle: "Importera tittarhistorik",
    importSub: "Hämta det du redan har sett från Netflix och andra tjänster",
    continueWatching: "Fortsätt titta",
    forDeg: "För dig",
    recentlyLogged: "Nyligen loggat",
    trending: "Populärt nu",
    seeAll: "Se alla",
    watched: "Sett och gillade",
    watchlist: "Lägg i listan",
    liked: "👍 Gillade",
    disliked: "👎 Ogillade",
    watchlistAction: "📌 Spara",
    recTitle: "Rekommenderat för dig",
    recTitlePremium: "Rekommenderat för dig idag",
    recBased: "Baserat på din filmsmak",
    recCta: "Se dina rekommendationer",
    curatorText: "Vad vill du känna ikväll?",
    curatorSub: "Curator analyserar ditt bibliotek och hittar något perfekt.",
    curatorCta: "Öppna Curator",
    tpTitle: (name: string) => `Tonight's Pick för dig och ${name}`,
    tpTitleSolo: "Tonight's Pick för dig",
    tpMovie: "Film ikväll",
    tpSeries: "Serie ikväll",
    tpMatch: "match",
    tpReroll: "Nytt pick",
    tpNoPartner: "Koppla ihop med en partner för att få Tonight's Pick",
    tpConnect: "Koppla partner",
    tpSeTogether: "Se Tillsammans",
    coupleReportLink: "Se parrapporten →",
    returnDay3Title: "Din filmsmak tar form",
    returnDay3Desc: "Du har loggat titlar — se vad det säger om dig.",
    returnDay3Cta: "Se smakprofil",
    returnDay7Title: "Du har använt Logflix i en vecka 🎉",
    returnDay7Desc: "Tillräckligt med data för att analysera din filmsmak nu.",
    returnDay7Cta: "Analysera min smak",
    wrappedReady: (month: string) => `Din ${month} Wrapped är klar`,
    wrappedCta: "Se den →",
    wrappedCount: (n: number) => `${n} titlar loggade`,
    wrappedMonths: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
    wrappedLocked: "Din Wrapped är klar — lås upp med Premium",
    importPopupTitle: "Importera din Netflix-historik",
    importPopupDesc: "Få personliga rekommendationer direkt — baserat på vad du redan har sett.",
    importPopupCta: "Importera nu →",
    importPopupDismiss: "Visa inte igen",
    trialBanner: (d: number) => `🔥 ${d} ${d === 1 ? "dag" : "dagar"} kvar av din provperiod — förlora inte Tonight's Pick och Curator`,
    trialCta: "Behåll Premium — 29 kr/mån →",
    trialExpired: "Din provperiod har gått ut. Du har förlorat tillgång till Tonight's Pick, obegränsad Curator och full smakprofil.",
    trialExpiredCta: "Aktivera Premium →",
    tasteEvoCta: "🎬 Se hur din filmsmak har utvecklats →",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "dag" : "dagar"} i rad!`,
    streakSub: "Logga en titel idag för att hålla din streak igång",
    streakLost: "🔥 Din streak bröts — logga något idag för att börja om!",
  },
  fi: {
    title: "Sinulle",
    titlesInCollection: "nimikettä kokoelmassasi",
    titleSingular: "nimike",
    greetMorning: "Hyvää huomenta",
    greetDay: "Hyvää päivää",
    greetEvening: "Hyvää iltaa",
    greetLate: "Myöhäinen ilta",
    loggedCount: (n: number) => `Olet kirjannut ${n} nimikettä`,
    togetherLabel: "Katsotaan Yhdessä",
    togetherHeadline: "Lopeta selaaminen.",
    togetherHeadline2: "Löydä jotain katsottavaa yhdessä.",
    togetherSub: "Selaa elokuvia ja sarjoja yhdessä ja sovi alle 3 minuutissa.",
    togetherSwipe: "Selaa",
    togetherMatch: "Sovi",
    togetherWatch: "Katso",
    togetherFree: "✓ Ilmainen",
    togetherNoAccount: "✓ Ei tiliä tarvita",
    togetherSocialProof: "70+ elokuvaharrastajaa käyttää tätä",
    togetherCta: "Aloita Katsotaan Yhdessä",
    importTitle: "Tuo katseluhistoria",
    importSub: "Tuo jo katsomasi Netflixistä ja muista palveluista",
    continueWatching: "Jatka katsomista",
    forDeg: "Sinulle",
    recentlyLogged: "Äskettäin kirjattu",
    trending: "Suosittua nyt",
    seeAll: "Näytä kaikki",
    watched: "Katsottu ja pidetty",
    watchlist: "Lisää katselulistalle",
    liked: "👍 Pidin",
    disliked: "👎 En pitänyt",
    watchlistAction: "📌 Tallenna",
    recTitle: "Suositeltu sinulle",
    recTitlePremium: "Suositeltu sinulle tänään",
    recBased: "Makusi perusteella",
    recCta: "Katso suosituksesi",
    curatorText: "Mitä haluat tuntea tänä iltana?",
    curatorSub: "Curator analysoi kirjastosi ja löytää jotain täydellistä.",
    curatorCta: "Avaa Curator",
    tpTitle: (name: string) => `Tonight's Pick sinulle ja ${name}`,
    tpTitleSolo: "Tonight's Pick sinulle",
    tpMovie: "Elokuva tänään",
    tpSeries: "Sarja tänään",
    tpMatch: "osuma",
    tpReroll: "Uusi valinta",
    tpNoPartner: "Yhdistä kumppani saadaksesi Tonight's Pick",
    tpConnect: "Yhdistä kumppani",
    tpSeTogether: "Katsotaan Yhdessä",
    coupleReportLink: "Katso pariraportti →",
    returnDay3Title: "Elokuvamakusi muotoutuu",
    returnDay3Desc: "Olet kirjannut nimikkeitä — katso mitä se kertoo sinusta.",
    returnDay3Cta: "Katso makuprofiili",
    returnDay7Title: "Olet käyttänyt Logflixiä viikon 🎉",
    returnDay7Desc: "Tarpeeksi dataa elokuvamakusi analysoimiseen.",
    returnDay7Cta: "Analysoi makuni",
    wrappedReady: (month: string) => `Sinun ${month} Wrapped on valmis`,
    wrappedCta: "Katso se →",
    wrappedCount: (n: number) => `${n} nimikettä kirjattu`,
    wrappedMonths: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
    wrappedLocked: "Wrapped on valmis — avaa Premiumilla",
    importPopupTitle: "Tuo Netflix-historiaasi",
    importPopupDesc: "Saa henkilökohtaisia suosituksia heti — perustuen siihen mitä olet jo katsonut.",
    importPopupCta: "Tuo nyt →",
    importPopupDismiss: "Älä näytä uudelleen",
    trialBanner: (d: number) => `🔥 ${d} ${d === 1 ? "päivä" : "päivää"} jäljellä kokeilujaksossasi — älä menetä Tonight's Pickiä ja Curatoria`,
    trialCta: "Pidä Premium — 29 kr/kk →",
    trialExpired: "Kokeilujaksosi on päättynyt. Olet menettänyt pääsyn Tonight's Pickiin, rajattomaan Curatoriin ja täyteen makuprofiiliin.",
    trialExpiredCta: "Aktivoi Premium →",
    tasteEvoCta: "🎬 Katso miten elokuvamaustusi on kehittynyt →",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "päivä" : "päivää"} putkeen!`,
    streakSub: "Kirjaa nimike tänään pitääksesi putkesi voimassa",
    streakLost: "🔥 Putkesi katkesi — kirjaa jotain tänään aloittaaksesi alusta!",
  },
} as const;

interface DashboardData {
  watching: (UserTitle & { cache?: TitleCache })[];
  recentlyLogged: (UserTitle & { cache?: TitleCache })[];
  recommendations: Recommendation[];
  trending: { tmdb_id: number; type: MediaType; title: string; poster_path: string | null; year: string }[];
  totalTitles: number;
  bannerPosters: string[];
}

interface TonightPickItem {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  match_score: number | null;
}

interface TonightPickData {
  movie: TonightPickItem | null;
  series: TonightPickItem | null;
  reroll_count: number;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const locale = useLocale();
  const isPremium = true;
  const [hasTaste, setHasTaste] = useState(false);
  const [homeRecs, setHomeRecs] = useState<Recommendation[]>(() => {
    try {
      const cached = localStorage.getItem("logflix_home_recs");
      if (cached) return JSON.parse(cached) as Recommendation[];
    } catch { /* ignore */ }
    return [];
  });
  const [tonightPick, setTonightPick] = useState<TonightPickData | null>(null);
  const [tpLoading, setTpLoading] = useState(true);
  const [tpRerolling, setTpRerolling] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState<boolean | null>(null);
  const [returningBanner, setReturningBanner] = useState<{ type: "day3" | "day7" } | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [wrappedCount, setWrappedCount] = useState(0);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [logStreak, setLogStreak] = useState(0);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [importDismissChecked, setImportDismissChecked] = useState(false);
  const [showTasteHint, setShowTasteHint] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    loadDashboard();
    loadTasteAndRecs();
  }, []);

  /* locale now comes from useLocale() */

  // Returning user hook — day 3/7 banner
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const first = localStorage.getItem("logflix_first_visit");
      if (!first) {
        localStorage.setItem("logflix_first_visit", today);
        localStorage.setItem("logflix_last_visit", today);
        return;
      }
      localStorage.setItem("logflix_last_visit", today);
      const bannerDate = localStorage.getItem("logflix_returning_banner_date");
      if (bannerDate === today) return;
      const daysSince = Math.floor((Date.now() - new Date(first).getTime()) / 86400000);
      if (daysSince >= 7) {
        setReturningBanner({ type: "day7" });
        localStorage.setItem("logflix_returning_banner_date", today);
      } else if (daysSince >= 3) {
        setReturningBanner({ type: "day3" });
        localStorage.setItem("logflix_returning_banner_date", today);
      }
    } catch { /* ignore */ }
  }, []);

  const s = strings[locale] ?? strings.en;

  async function loadTasteAndRecs() {
    try {
      const [tasteRes, profileRes] = await Promise.all([
        fetch("/api/taste-summary").then((r) => r.json()).catch(() => ({})),
        fetch("/api/profile").then((r) => r.json()).catch(() => ({})),
      ]);
      // Lazy onboarding hint — show if not completed and has swipe data
      if (!profileRes?.profile?.onboarding_completed && !tasteRes?.summary) {
        try {
          const { count } = await createSupabaseBrowser()
            .from("wt_session_swipes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profileRes?.profile?.id || "");
          if (count && count >= 5) {
            setSwipeCount(count);
            if (!localStorage.getItem("logflix_taste_hint_dismissed")) {
              setShowTasteHint(true);
            }
          }
        } catch { /* ignore */ }
      }
      if (tasteRes?.summary) {
        setHasTaste(true);
        try {
          const recRes = await fetch("/api/recommendations");
          const recData = await recRes.json();
          if (recData.recommendations) {
            const recs = recData.recommendations.slice(0, 8);
            setHomeRecs(recs);
            try { localStorage.setItem("logflix_home_recs", JSON.stringify(recs)); } catch { /* ignore */ }
          }
        } catch { /* ignore */ }
      }
      loadTonightPick();
    } catch { /* ignore */ }
  }

  async function loadTonightPick() {
    setTpLoading(true);
    try {
      const res = await fetch("/api/tonight-pick");
      if (!res.ok) { setTpLoading(false); return; }
      const data = await res.json();
      setTonightPick(data);
      setHasPartner(!data.solo);
      if (!data.solo) {
        try {
          const friendsRes = await fetch("/api/friends/titles");
          const friendsData = await friendsRes.json();
          if (friendsData.friendName) setPartnerName(friendsData.friendName);
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setTpLoading(false);
  }

  async function handleReroll() {
    setTpRerolling(true);
    try {
      const res = await fetch("/api/tonight-pick", { method: "POST" });
      const data = await res.json();
      if (res.ok && data) { setTonightPick(data); }
    } catch { /* ignore */ }
    setTpRerolling(false);
  }

  async function loadDashboard() {
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    setUserName(profile?.display_name || user.email?.split("@")[0] || null);

    const [titlesRes, trendingRes, bannersRes] = await Promise.all([
      supabase.from("user_titles").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      fetch("/api/tmdb/discover?type=movie&sort_by=popularity.desc&page=1").then((r) => r.json()).catch(() => ({ results: [] })),
      supabase.from("titles_cache").select("poster_path").not("poster_path", "is", null).limit(4),
    ]);

    const userTitles = (titlesRes.data || []) as UserTitle[];

    // Count titles logged this month for Wrapped card
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const thisMonthCount = userTitles.filter((t) => t.status === "watched" && (t.updated_at || "") >= monthStart).length;
    setWrappedCount(thisMonthCount);

    // Build favorites map
    const favMap: Record<string, boolean> = {};
    for (const t of userTitles) if (t.favorite) favMap[`${t.tmdb_id}:${t.type}`] = true;
    setFavs(favMap);

    // Logging streak: count consecutive days with at least one logged title
    {
      const dates = new Set<string>();
      for (const t of userTitles) {
        if (t.status === "watched" && t.updated_at) dates.add(t.updated_at.slice(0, 10));
      }
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (dates.has(today) || dates.has(yesterday)) {
        let streak = 0;
        let checkDate = dates.has(today) ? new Date() : new Date(Date.now() - 86400000);
        while (dates.has(checkDate.toISOString().slice(0, 10))) {
          streak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        }
        setLogStreak(streak);
      }
    }

    const cacheMap = await fetchCacheForTitles(supabase, userTitles.map((t) => ({ tmdb_id: t.tmdb_id, type: t.type })));

    const allTitles = userTitles.map((t) => ({
      ...t,
      cache: cacheMap.get(`${t.tmdb_id}:${t.type}`),
    }));

    const watching = allTitles.filter((t) => t.status === "watching");
    const recentlyLogged = allTitles.filter((t) => t.status === "watched").slice(0, 7);

    const trendingItems = ((trendingRes.results || []) as Record<string, unknown>[])
      .filter((r) => r.poster_path)
      .slice(0, 7)
      .map((r) => ({
        tmdb_id: r.id as number,
        type: "movie" as MediaType,
        title: (r.title || r.name) as string,
        poster_path: r.poster_path as string,
        year: ((r.release_date || r.first_air_date) as string || "").slice(0, 4),
      }));

    const bannerPosters = (bannersRes.data || [])
      .map((r: { poster_path: string }) => r.poster_path)
      .filter(Boolean)
      .slice(0, 4);

    setData({
      watching,
      recentlyLogged,
      recommendations: [],
      trending: trendingItems,
      totalTitles: allTitles.length,
      bannerPosters,
    });
    setLoading(false);

    // Show import popup for new users with < 5 titles (once, unless dismissed)
    if (allTitles.length < 5 && !localStorage.getItem("import_prompt_dismissed")) {
      setShowImportPopup(true);
    }
    track("home_viewed", { has_library: allTitles.length > 0 });

    const prefetchItems = watching.map((t) => ({ id: t.tmdb_id, type: t.type }));
    if (prefetchItems.length > 0) prefetchNetflixIds(prefetchItems);
  }

  async function handleQuickAction(tmdb_id: number, type: MediaType, action: string) {
    try {
      if (action === "watchlist") {
        await logTitle({ tmdb_id, type, status: "watchlist" });
      } else if (action === "liked") {
        await logTitle({ tmdb_id, type, status: "watched", sentiment: "liked" });
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="animate-fade-in-up space-y-10">
        <div>
          <div className="skeleton h-8 w-48 rounded-lg mb-2" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton h-5 w-32 rounded mb-4" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[130px]">
                  <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                  <div className="skeleton h-3 w-20 mt-2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const showImportBanner = data.totalTitles < 20;

  const hour = new Date().getHours();
  const greeting = hour >= 23 || hour < 6 ? s.greetLate
    : hour < 11 ? s.greetMorning
    : hour < 17 ? s.greetDay
    : s.greetEvening;

  return (
    <div className="animate-fade-in-up space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {greeting}{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
          {s.loggedCount(data.totalTitles)}
        </p>
      </div>

      {/* Logging streak */}
      {logStreak >= 2 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.15)" }}>
          <span className="text-2xl">{logStreak >= 7 ? "🔥" : logStreak >= 3 ? "🔥" : "✨"}</span>
          <div>
            <p className="text-sm font-bold text-white">{s.streak(logStreak)}</p>
            <p className="text-[11px] text-white/35">{s.streakSub}</p>
          </div>
        </div>
      )}

      {/* Lazy onboarding — taste hint */}
      {showTasteHint && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up"
          style={{ background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,42,42,0.15)" }}
        >
          <span className="text-xl flex-shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/80">
              {locale === "no" ? `Du har sveipet ${swipeCount} titler — vil du se smaksprofilen din?`
                : locale === "se" ? `Du har svajpat ${swipeCount} titlar — vill du se din smakprofil?`
                : locale === "dk" ? `Du har swipet ${swipeCount} titler — vil du se din smagsprofil?`
                : locale === "fi" ? `Olet swaipannut ${swipeCount} nimikettä — haluatko nähdä makuprofiilisi?`
                : `You've swiped ${swipeCount} titles — want to see your taste profile?`}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#ff2a2a", textDecoration: "none" }}
          >
            {locale === "no" ? "Ja, vis meg" : locale === "se" ? "Ja, visa mig" : locale === "dk" ? "Ja, vis mig" : locale === "fi" ? "Kyllä, näytä" : "Yes, show me"}
          </Link>
          <button
            onClick={() => { setShowTasteHint(false); try { localStorage.setItem("logflix_taste_hint_dismissed", "1"); } catch {} }}
            className="flex-shrink-0 text-white/25 hover:text-white/50 transition-colors cursor-pointer bg-transparent border-0 p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Returning user hook — day 3/7 */}
      {returningBanner && !hasTaste && (
        <Link
          href="/taste"
          className="block rounded-[var(--radius-lg)] p-4 border border-white/[0.08] hover:border-white/[0.14] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">🎬</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {returningBanner.type === "day7" ? s.returnDay7Title : s.returnDay3Title}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {returningBanner.type === "day7" ? s.returnDay7Desc : s.returnDay3Desc}
              </p>
            </div>
            <span className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 bg-white/[0.08]">
              {returningBanner.type === "day7" ? s.returnDay7Cta : s.returnDay3Cta}
            </span>
          </div>
        </Link>
      )}

      {/* Se Sammen — cinematisk banner med filmpostere */}
      <div className="relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.02]">
        {/* Rotating red border */}
        <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute inset-[-100%]"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(255,42,42,0.5) 72%, rgba(229,9,20,0.8) 80%, rgba(255,42,42,0.5) 88%, transparent 100%)",
              animation: "border-rotate 4s linear infinite",
            }}
          />
          <div className="absolute inset-[2px] rounded-[14px]" style={{ background: "#0a0a0c" }} />
        </div>
        <div className="absolute -inset-4 rounded-full pointer-events-none" style={{ background: "rgba(220,38,38,0.1)", filter: "blur(48px)" }} />
      <Link href="/together" style={{ display: "block", borderRadius: 14, overflow: "hidden", position: "relative", zIndex: 1, minHeight: 180, textDecoration: "none", margin: 2 }}>
        {/* Poster bakgrunner */}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2 }}>
          {data.bannerPosters.length > 0
            ? data.bannerPosters.map((p, i) => (
                <div key={i} style={{ position: "relative", overflow: "hidden" }}>
                  <Image src={`https://image.tmdb.org/t/p/w200${p}`} alt="" fill sizes="25vw" className="object-cover" />
                </div>
              ))
            : [
                "linear-gradient(160deg,#1a2e3a,#0d1f2e)",
                "linear-gradient(160deg,#2e1a2e,#1f0d1f)",
                "linear-gradient(160deg,#1a3a1a,#0d1f0d)",
                "linear-gradient(160deg,#3a2a1a,#1f160d)",
              ].map((bg, i) => (
                <div key={i} style={{ background: bg }} />
              ))
          }
        </div>
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.85) 50%,rgba(0,0,0,0.45) 100%)" }} />
        {/* Innhold */}
        <div style={{ position: "relative", padding: "24px 20px" }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff2a2a" }}>{s.togetherLabel}</p>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {s.togetherHeadline}<br />{s.togetherHeadline2}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,120,120,0.7)", lineHeight: 1.5 }}>{s.togetherSub}</p>
            <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              {[["❤️", s.togetherSwipe], ["🎬", s.togetherMatch], ["🍿", s.togetherWatch]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
                </div>
              ))}
            </div>
            <span
              className="transition-all duration-200"
              style={{ background: "#ff2a2a", color: "#fff", borderRadius: 12, padding: "12px 18px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,42,42,0.4)", display: "inline-block" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 0 30px rgba(255,42,42,0.6)"; el.style.background = "#e02424"; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 0 20px rgba(255,42,42,0.4)"; el.style.background = "#ff2a2a"; el.style.transform = "translateY(0)"; }}
            >
              {s.togetherCta}
            </span>
          </div>
        </div>
      </Link>
      </div>

      {/* Wrapped card */}
      {wrappedCount >= 3 && (() => {
        const now = new Date();
        const monthIdx = now.getMonth();
        const year = now.getFullYear();
        const monthName = s.wrappedMonths[monthIdx];
        const slug = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;

        const wrappedInner = (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.2)" }}>
              <span style={{ fontSize: 18 }}>🎬</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white/90 truncate">{s.wrappedReady(monthName)}</p>
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,42,42,0.15)", color: "#ff2a2a", border: "1px solid rgba(255,42,42,0.3)" }}>NY</span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{s.wrappedCount(wrappedCount)}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold" style={{ color: "#ff2a2a" }}>{s.wrappedCta}</span>
          </div>
        );

        const glassStyle = {
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        };

        return (
          <Link
            href={`/wrapped/${slug}`}
            onClick={() => track("wrapped_card_clicked", { month: slug, count: wrappedCount })}
            className="block rounded-2xl p-4 transition-all hover:scale-[1.02] duration-200"
            style={glassStyle}
          >
            {wrappedInner}
          </Link>
        );
      })()}

      {/* Taste evolution card — 10+ titles */}
      {data.totalTitles >= 10 && (
        <Link
          href="/taste-evolution"
          className="block rounded-[var(--radius-lg)] p-4 border border-white/[0.08] hover:border-white/[0.14] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <p className="text-sm font-medium text-white/70">{s.tasteEvoCta}</p>
        </Link>
      )}

      {/* Tonight's Pick + Recommendations — side by side on desktop */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Tonight's Pick — venstre kolonne */}
        {(isPremium || tpLoading) && (
          <div className="w-full md:w-[320px] md:flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,200,66,0.12)", border: "0.5px solid rgba(245,200,66,0.3)", color: "#F5C842" }}>Premium</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">
              {hasPartner ? s.tpTitle(partnerName || "Partner") : s.tpTitleSolo}
            </h2>
            {tpLoading && !tonightPick && (
              <div className="flex gap-3">
                {[s.tpMovie, s.tpSeries].map((_, i) => (
                  <div key={i} className="w-[140px] rounded-xl border border-white/[0.06] p-3 flex flex-col flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className="skeleton h-3 w-20 rounded mb-2" />
                    <div className="skeleton w-full rounded-lg mb-2" style={{ aspectRatio: "2/3" }} />
                    <div className="skeleton h-3 w-24 rounded mb-1" />
                    <div className="skeleton h-2.5 w-16 rounded" />
                  </div>
                ))}
              </div>
            )}
            {tonightPick && (
              <>
                <div className="flex gap-3">
                  {tonightPick.movie && (
                    <div className="w-[140px] rounded-xl border border-white/[0.06] p-3 flex flex-col flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">🎬 {s.tpMovie}</p>
                      {tonightPick.movie.poster_path && (
                        <div className="relative w-full rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "2/3" }}>
                          <Image src={`https://image.tmdb.org/t/p/w185${tonightPick.movie.poster_path}`} alt={tonightPick.movie.title} fill className="object-cover" sizes="140px" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-white/85 truncate">{tonightPick.movie.title}</p>
                      {tonightPick.movie.match_score != null && (
                        <p className="text-[10px] text-[var(--accent-light)] mt-0.5">★ {tonightPick.movie.match_score}% {s.tpMatch}</p>
                      )}
                      <Link href="/together" className="mt-2 text-center py-1 rounded-md text-[10px] font-semibold text-white/70 bg-white/[0.06] hover:bg-white/[0.1] transition-colors">{s.tpSeTogether}</Link>
                    </div>
                  )}
                  {tonightPick.series && (
                    <div className="w-[140px] rounded-xl border border-white/[0.06] p-3 flex flex-col flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">📺 {s.tpSeries}</p>
                      {tonightPick.series.poster_path && (
                        <div className="relative w-full rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "2/3" }}>
                          <Image src={`https://image.tmdb.org/t/p/w185${tonightPick.series.poster_path}`} alt={tonightPick.series.title} fill className="object-cover" sizes="140px" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-white/85 truncate">{tonightPick.series.title}</p>
                      {tonightPick.series.match_score != null && (
                        <p className="text-[10px] text-[var(--accent-light)] mt-0.5">★ {tonightPick.series.match_score}% {s.tpMatch}</p>
                      )}
                      <Link href="/together" className="mt-2 text-center py-1 rounded-md text-[10px] font-semibold text-white/70 bg-white/[0.06] hover:bg-white/[0.1] transition-colors">{s.tpSeTogether}</Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 mt-3">
                  <button onClick={handleReroll} disabled={tpRerolling} className="px-4 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] transition-all disabled:opacity-40 cursor-pointer">
                    {tpRerolling ? "..." : `↻ ${s.tpReroll}`}
                  </button>
                  {hasPartner && (
                    <Link href="/couple-report" className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}>
                      {s.coupleReportLink}
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Recommendations — høyre kolonne */}
        {homeRecs.length > 0 && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {s.recTitlePremium}
              </h2>
              <Link href="/recommendations" className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] font-medium transition-colors">{s.seeAll}</Link>
            </div>
            <HorizontalScroll>
              {homeRecs.map((rec) => (
                <PosterCard
                  key={`hr-${rec.tmdb_id}:${rec.type}`}
                  title={rec.title}
                  posterPath={rec.poster_path || null}
                  subtitle={rec.tags?.[0]}
                  onClick={() => setSelectedItem({ id: rec.tmdb_id, type: rec.type, title: rec.title, poster_path: rec.poster_path || null })}
                />
              ))}
            </HorizontalScroll>
          </div>
        )}

      </div>

      {/* Curator promo */}
      {hasTaste && (
        <div>
        {isPremium && (
          <div className="mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,200,66,0.12)", border: "0.5px solid rgba(245,200,66,0.3)", color: "#F5C842" }}>Premium</span>
          </div>
        )}
        <div className="relative rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: isPremium ? "0.5px solid rgba(245,200,66,0.25)" : "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <style>{`
            @keyframes border-rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          {isPremium && (
            <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
              <div
                className="absolute inset-[-100%]"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(252,211,77,0.6) 72%, rgba(252,196,44,0.9) 80%, rgba(252,211,77,0.6) 88%, transparent 100%)",
                  animation: "border-rotate 4s linear infinite",
                }}
              />
              <div className="absolute inset-[2px] rounded-[14px]" style={{ background: "#0a0a0c" }} />
            </div>
          )}
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isPremium ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.05)",
                  border: isPremium ? "0.5px solid rgba(245,200,66,0.3)" : "0.5px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={isPremium ? "#F5C842" : "rgba(255,255,255,0.5)"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: isPremium ? "#F5C842" : "rgba(255,255,255,0.8)", margin: 0 }}>{s.curatorText}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>{s.curatorSub}</p>
              </div>
              <div className="flex-shrink-0 rounded-full px-2.5 py-1"
                style={{
                  background: isPremium ? "rgba(245,200,66,0.1)" : "rgba(255,42,42,0.1)",
                  border: isPremium ? "0.5px solid rgba(245,200,66,0.25)" : "0.5px solid rgba(255,42,42,0.25)",
                }}
              >
                <span className="text-[11px] font-semibold"
                  style={{ color: isPremium ? "#F5C842" : "#ff6b6b" }}
                >
                  {isPremium ? (locale === "no" ? "Ubegrenset" : locale === "se" ? "Obegränsat" : locale === "dk" ? "Ubegrænset" : "Unlimited") : `3 ${locale === "no" || locale === "dk" ? "igjen" : locale === "se" ? "kvar" : "left"}`}
                </span>
              </div>
            </div>
            <div className="mb-3" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                locale === "no" ? "Mørk og intens" : locale === "se" ? "Mörk och intensiv" : locale === "dk" ? "Mørk og intens" : "Dark and intense",
                locale === "no" ? `Ligner ${data.recentlyLogged[0]?.cache?.title || "noe du likte"}` : locale === "se" ? `Liknande ${data.recentlyLogged[0]?.cache?.title || "något du gillade"}` : locale === "dk" ? `Ligner ${data.recentlyLogged[0]?.cache?.title || "noget du kunne lide"}` : `Similar to ${data.recentlyLogged[0]?.cache?.title || "something you liked"}`,
                locale === "no" ? "Overrask meg" : locale === "se" ? "Överraska mig" : locale === "dk" ? "Overrask mig" : "Surprise me",
              ].map((pill) => (
                <Link
                  key={pill}
                  href={`/curator?prompt=${encodeURIComponent(pill)}`}
                  className="rounded-full text-xs px-3 py-1.5 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.75)",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = isPremium ? "rgba(252,180,50,0.15)" : "rgba(255,255,255,0.1)"; el.style.transform = "translateY(-1px)"; el.style.borderColor = isPremium ? "rgba(255,120,40,0.4)" : "rgba(255,255,255,0.2)"; el.style.color = isPremium ? "#fcd34d" : "rgba(255,255,255,0.9)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.transform = "translateY(0)"; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.color = "rgba(255,255,255,0.75)"; }}
                >
                  {pill}
                </Link>
              ))}
            </div>
            <Link
              href="/curator"
              className="block w-full text-center rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                background: isPremium ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.05)",
                border: isPremium ? "0.5px solid rgba(245,200,66,0.35)" : "0.5px solid rgba(255,255,255,0.1)",
                color: isPremium ? "#F5C842" : "rgba(255,255,255,0.7)",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = isPremium ? "rgba(252,180,50,0.18)" : "rgba(255,255,255,0.1)"; el.style.borderColor = isPremium ? "rgba(255,120,40,0.5)" : "rgba(255,255,255,0.2)"; el.style.color = isPremium ? "#fcd34d" : "rgba(255,255,255,0.9)"; el.style.boxShadow = isPremium ? "0 0 20px rgba(252,180,50,0.15)" : "none"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = isPremium ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.05)"; el.style.borderColor = isPremium ? "rgba(245,200,66,0.35)" : "rgba(255,255,255,0.1)"; el.style.color = isPremium ? "#F5C842" : "rgba(255,255,255,0.7)"; el.style.boxShadow = "none"; }}
            >
              {s.curatorCta}
            </Link>
          </div>
        </div>
        </div>
      )}

      {/* Import banner */}
      {showImportBanner && (
        <Link href="/timemachine" className="block glass rounded-[var(--radius-lg)] p-4 border border-[var(--accent)]/20 hover:border-[var(--accent)]/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{s.importTitle}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{s.importSub}</p>
            </div>
            <svg className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      )}

      {/* Fortsett å se */}
      {data.watching.length > 0 && (
        <DashboardSection title={s.continueWatching} href="/watch-bank" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.watching.map((t) => (
              <PosterCard
                key={`w-${t.tmdb_id}:${t.type}`}
                title={t.cache?.title || `TMDB:${t.tmdb_id}`}
                posterPath={t.cache?.poster_path || null}
                subtitle={t.last_season && t.last_episode ? `S${t.last_season} E${t.last_episode}` : undefined}
                onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* For deg */}
      {data.recommendations.length > 0 && (
        <DashboardSection title={s.forDeg} href="/recommendations" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.recommendations.map((rec) => (
              <PosterCard
                key={`r-${rec.tmdb_id}:${rec.type}`}
                title={rec.title}
                posterPath={rec.poster_path || null}
                subtitle={rec.tags?.[0]}
                onClick={() => setSelectedItem({ id: rec.tmdb_id, type: rec.type, title: rec.title, poster_path: rec.poster_path || null })}
                quickActions={[{ label: "+", action: "liked", title: s.watched }, { label: "Se", action: "watchlist", title: s.watchlist }]}
                onQuickAction={(action) => handleQuickAction(rec.tmdb_id, rec.type, action)}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Nylig logget */}
      {data.recentlyLogged.length > 0 && (
        <DashboardSection title={s.recentlyLogged} href="/library" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.recentlyLogged.map((t) => (
              <PosterCard
                key={`l-${t.tmdb_id}:${t.type}`}
                title={t.cache?.title || `TMDB:${t.tmdb_id}`}
                posterPath={t.cache?.poster_path || null}
                sentiment={t.sentiment as "liked" | "disliked" | "neutral" | null}
                onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.cache?.title || `TMDB:${t.tmdb_id}`, poster_path: t.cache?.poster_path || null })}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {/* Populært nå */}
      {data.trending.length > 0 && (
        <DashboardSection title={s.trending} href="/search" seeAll={s.seeAll}>
          <HorizontalScroll>
            {data.trending.map((t) => (
              <PosterCard
                key={`t-${t.tmdb_id}:${t.type}`}
                title={t.title}
                posterPath={t.poster_path}
                subtitle={t.year}
                onClick={() => setSelectedItem({ id: t.tmdb_id, type: t.type, title: t.title, poster_path: t.poster_path })}
                quickActions={[{ label: "+", action: "liked", title: s.watched }, { label: "Se", action: "watchlist", title: s.watchlist }]}
                onQuickAction={(action) => handleQuickAction(t.tmdb_id, t.type, action)}
              />
            ))}
          </HorizontalScroll>
        </DashboardSection>
      )}

      {selectedItem && (
        <StreamingModal
          tmdbId={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.poster_path}
          onClose={() => setSelectedItem(null)}
          isFavorite={!!favs[`${selectedItem.id}:${selectedItem.type}`]}
          onToggleFavorite={() => {
            const key = `${selectedItem.id}:${selectedItem.type}`;
            const newVal = !favs[key];
            setFavs((p) => ({ ...p, [key]: newVal }));
            toggleFavorite(selectedItem.id, selectedItem.type, newVal);
          }}
          actions={[
            { label: s.liked, action: "liked", variant: "green" },
            { label: s.disliked, action: "disliked", variant: "red" },
            { label: s.watchlistAction, action: "watchlist", variant: "default" },
          ]}
          onAction={(action) => handleQuickAction(selectedItem.id, selectedItem.type, action)}
        />
      )}

      {/* Import prompt popup for new users */}
      {showImportPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={() => { if (importDismissChecked) localStorage.setItem("import_prompt_dismissed", "1"); setShowImportPopup(false); }} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-5 animate-fade-in-up"
            style={{
              background: "rgba(15,18,30,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <button
              onClick={() => { if (importDismissChecked) localStorage.setItem("import_prompt_dismissed", "1"); setShowImportPopup(false); }}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.15)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#E50914">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{s.importPopupTitle}</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>{s.importPopupDesc}</p>

            <Link
              href="/timemachine"
              onClick={() => { localStorage.setItem("import_prompt_dismissed", "1"); track("import_popup_cta_clicked"); }}
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #B00000, #E50914)", minHeight: 40 }}
            >
              {s.importPopupCta}
            </Link>

            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={importDismissChecked}
                onChange={(e) => setImportDismissChecked(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 accent-[#E50914]"
              />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.importPopupDismiss}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSection({ title, href, seeAll, children }: { title: string; href: string; seeAll: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h2>
        <Link href={href} className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] font-medium transition-colors">{seeAll}</Link>
      </div>
      {children}
    </section>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 pb-1" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", touchAction: "pan-x", overscrollBehaviorX: "contain" }}>
        {children}
      </div>
    </div>
  );
}

function PosterCard({ title, posterPath, subtitle, sentiment, onClick, quickActions, onQuickAction }: {
  title: string;
  posterPath: string | null;
  subtitle?: string;
  sentiment?: "liked" | "disliked" | "neutral" | null;
  onClick: () => void;
  quickActions?: { label: string; action: string; title: string }[];
  onQuickAction?: (action: string) => void;
}) {
  const imgSrc = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null;
  const sentimentColor = sentiment === "liked" ? "var(--green)" : sentiment === "disliked" ? "var(--red)" : sentiment === "neutral" ? "var(--yellow)" : null;

  return (
    <div className="group flex-shrink-0 w-[120px] sm:w-[140px] cursor-pointer" style={{ scrollSnapAlign: "start" }}>
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.14] group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] transition-all duration-300" onClick={onClick}>
        {imgSrc ? (
          <Image src={imgSrc} alt={title} fill sizes="140px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><rect x="2" y="3" width="20" height="18" rx="2" /></svg>
          </div>
        )}
        {sentimentColor && (
          <div className="absolute top-1.5 left-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentimentColor, boxShadow: `0 0 6px ${sentimentColor}` }} />
          </div>
        )}
        {quickActions && quickActions.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent pt-6">
            {quickActions.map((qa) => (
              <button key={qa.action} title={qa.title} onClick={(e) => { e.stopPropagation(); onQuickAction?.(qa.action); }} className="flex-1 py-1.5 text-[10px] font-semibold text-white/80 hover:text-white bg-white/[0.1] hover:bg-white/[0.2] rounded-lg transition-all backdrop-blur-sm">
                {qa.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-[11px] font-medium text-white/60 leading-tight truncate group-hover:text-white/80 transition-colors">{title}</p>
        {subtitle && <p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}