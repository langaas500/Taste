export type Locale = "no" | "en";

export function getLocale(country?: string | null): Locale {
  return country === "NO" ? "no" : "en";
}

const strings = {
  // ============================================
  // INTRO
  // ============================================
  intro: {
    headlineEvening: { no: "Hva skal vi se i kveld?", en: "What are we watching tonight?" },
    headlineDay: { no: "Hva skal vi se i dag?", en: "What are we watching today?" },
    returnedSubtitle: { no: "En runde til?", en: "One more round?" },
    subtitle1: { no: "Sveip hver for dere.", en: "Swipe separately." },
    subtitle2: { no: "Vi bestemmer.", en: "We decide." },
    soloLabel: { no: "Solo", en: "Solo" },
    soloDesc: { no: "Kan ikke bestemme deg?", en: "Can't decide?" },
    pairedLabel: { no: "Duo", en: "Duo" },
    pairedDesc: { no: "Sveip sammen", en: "Swipe together" },
    loading: { no: "Laster…", en: "Loading…" },
    startSolo: { no: "Kjør", en: "Let's go" },
    startPaired: { no: "Start sammen", en: "Start together" },
    groupLabel: { no: "Gruppe", en: "Group" },
    groupDesc: { no: "Kommer snart", en: "Coming soon" },
    hasCode: { no: "Jeg har en kode", en: "I have a code" },
  },

  // ============================================
  // PROVIDERS
  // ============================================
  providers: {
    headline: { no: "Hvor ser dere?", en: "Where are you watching?" },
    ingress: { no: "Velg tjenestene dine — eller hopp over for å se alt.", en: "Pick your services — or skip to see everything." },
    tonightLabel: { no: "I kveld:", en: "Tonight:" },
    series: { no: "Serier", en: "Series" },
    movies: { no: "Filmer", en: "Movies" },
    mix: { no: "Miks", en: "Mix" },
    loading: { no: "Laster…", en: "Loading…" },
    continueBtn: { no: "Fortsett", en: "Continue" },
    seeAll: { no: "Se alt", en: "See everything" },
    back: { no: "Tilbake", en: "Back" },
  },

  // ============================================
  // WAITING (host venter på partner)
  // ============================================
  waiting: {
    headline: { no: "Venter på partner…", en: "Waiting for partner…" },
    ingress: { no: "Del koden med den andre.", en: "Share the code with your partner." },
    copyHint: { no: "Trykk for å kopiere", en: "Tap to copy" },
    scanOrShare: { no: "Skann eller del koden", en: "Scan or share the code" },
    cancel: { no: "Avbryt", en: "Cancel" },
  },

  // ============================================
  // JOIN
  // ============================================
  join: {
    headline: { no: "Bli med i runde", en: "Join round" },
    ingress: { no: "Skriv inn koden du fikk.", en: "Enter the code you received." },
    placeholder: { no: "KODE", en: "CODE" },
    connecting: { no: "Kobler til…", en: "Connecting…" },
    joinBtn: { no: "Bli med", en: "Join" },
    back: { no: "Tilbake", en: "Back" },
  },

  // ============================================
  // TOGETHER (swiping)
  // ============================================
  together: {
    round1: { no: "Runde 1", en: "Round 1" },
    round2: { no: "Runde 2", en: "Round 2" },
    desktopHint: { no: "← →", en: "← →" },
  },

  // ============================================
  // iAmDone overlay
  // ============================================
  iAmDone: {
    statusLine: { no: "Venter på partneren din.", en: "Waiting for your partner." },
    partnerProgress: { no: "Partneren din har sveipet {count} kort", en: "Your partner has swiped {count} cards" },
  },

  // ============================================
  // DECK EXHAUSTED
  // ============================================
  exhausted: {
    message: { no: "Ingen flere forslag.", en: "No more suggestions." },
    retry: { no: "Prøv igjen", en: "Try again" },
  },

  // ============================================
  // RESULTS (felles like, runde 1)
  // ============================================
  results: {
    label: { no: "Dere er enige.", en: "You both agreed." },
    startWatching: { no: "Start å se", en: "Start watching" },
    seeAlternatives: { no: "Se alternativer:", en: "See alternatives:" },
    continueBtn: { no: "Fortsett og finn flere", en: "Keep looking for more" },
  },

  // ============================================
  // NO-MATCH
  // ============================================
  noMatch: {
    headline: { no: "Ingen full match.", en: "No full match." },
    ingress: { no: "Dette er det beste kompromisset.", en: "This is the best compromise." },
    lastRound: { no: "En siste runde", en: "One last round" },
    acceptThis: { no: "Godta dette", en: "Accept this" },
    playAgain: { no: "Spill igjen", en: "Play again" },
  },

  // ============================================
  // WINNER (match-moment)
  // ============================================
  winner: {
    phase1: { no: "Dere sa begge ja.", en: "You both said yes." },
    soloPhase1: { no: "Vi bestemte.", en: "We decided." },
    startWatching: { no: "▶︎ Start å se", en: "▶︎ Start watching" },
    watchOn: { no: "▶︎ Se på {provider}", en: "▶︎ Watch on {provider}" },
    keepLooking: { no: "Fortsett å lete →", en: "Keep looking →" },
    share: { no: "Del resultatet", en: "Share result" },
    shareText: { no: "Vi fant noe å se! 🎬", en: "We found something to watch! 🎬" },
    copied: { no: "Kopiert!", en: "Copied!" },
  },

  // ============================================
  // DOUBLE-SUPER
  // ============================================
  doubleSuper: {
    label: { no: "Dere valgte det samme.", en: "You both picked the same." },
    startWatching: { no: "Start å se", en: "Start watching" },
    continueBtn: { no: "Fortsett", en: "Continue" },
  },

  // ============================================
  // RITUAL OVERLAY
  // ============================================
  ritual: {
    timer: { no: "2:00", en: "2:00" },
    ready: { no: "Klar?", en: "Ready?" },
    go: { no: "Kjør.", en: "Go." },
    subtitle1: { no: "Legg bort telefonene.", en: "Phones apart." },
    subtitle2: { no: "Sveip hver for dere. Vi bestemmer.", en: "Swipe separately. We decide." },
  },

  // ============================================
  // GLOBAL
  // ============================================
  global: {
    myProfile: { no: "Min profil", en: "My profile" },
    login: { no: "Logg inn", en: "Log in" },
  },
} as const;

// Helper: hent streng for gitt locale
export function t(locale: Locale, screen: keyof typeof strings, key: string): string {
  const screenStrings = strings[screen] as Record<string, Record<Locale, string>>;
  const entry = screenStrings[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en;
}

// Alternativ: hent hele screen-objektet for gitt locale
export function screenStrings(locale: Locale, screen: keyof typeof strings): Record<string, string> {
  const s = strings[screen] as Record<string, Record<Locale, string>>;
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(s)) {
    result[key] = val[locale] ?? val.en;
  }
  return result;
}

export default strings;
