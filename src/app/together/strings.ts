export type Locale = "no" | "en" | "dk" | "se" | "fi";

export function getLocale(country?: string | null): Locale {
  if (country === "NO") return "no";
  if (country === "DK") return "dk";
  if (country === "SE") return "se";
  if (country === "FI") return "fi";
  return "en";
}

const strings = {
  // ============================================
  // INTRO
  // ============================================
  intro: {
    headlineEvening: { no: "Hva skal vi se i kveld?", en: "What are we watching tonight?", dk: "Hvad skal vi se i aften?", se: "Vad ska vi se ikväll?", fi: "Mitä katsotaan tänä iltana?" },
    headlineDay: { no: "Hva skal vi se i dag?", en: "What are we watching today?", dk: "Hvad skal vi se i dag?", se: "Vad ska vi se idag?", fi: "Mitä katsotaan tänään?" },
    returnedSubtitle: { no: "En runde til?", en: "One more round?", dk: "En runde til?", se: "En runda till?", fi: "Yksi kierros lisää?" },
    subtitle1: { no: "Sveip hver for dere.", en: "Swipe separately.", dk: "Swipe hver for sig.", se: "Svajpa var för sig.", fi: "Swaippaa erikseen." },
    subtitle2: { no: "Vi bestemmer.", en: "We decide.", dk: "Vi bestemmer.", se: "Vi bestämmer.", fi: "Me päätämme." },
    soloLabel: { no: "Solo", en: "Solo", dk: "Solo", se: "Solo", fi: "Solo" },
    soloDesc: { no: "Øv deg alene", en: "Practice alone", dk: "Øv dig alene", se: "Öva ensam", fi: "Harjoittele yksin" },
    pairedLabel: { no: "Duo", en: "Duo", dk: "Duo", se: "Duo", fi: "Duo" },
    pairedDesc: { no: "Sveip sammen", en: "Swipe together", dk: "Swipe sammen", se: "Svajpa tillsammans", fi: "Swaippaa yhdessä" },
    loading: { no: "Laster…", en: "Loading…", dk: "Indlæser…", se: "Laddar…", fi: "Ladataan…" },
    startSolo: { no: "Kjør", en: "Let's go", dk: "Kør", se: "Kör", fi: "Aloita" },
    startPaired: { no: "Start sammen", en: "Start together", dk: "Start sammen", se: "Starta tillsammans", fi: "Aloita yhdessä" },
    groupLabel: { no: "Group", en: "Group", dk: "Group", se: "Group", fi: "Group" },
    groupDesc: { no: "Nyhet · 3–7 spillere", en: "New · 3–7 players", dk: "Nyt · 3–7 spillere", se: "Nytt · 3–7 spelare", fi: "Uusi · 3–7 pelaajaa" },
    hasCode: { no: "Jeg har en kode", en: "I have a code", dk: "Jeg har en kode", se: "Jag har en kod", fi: "Minulla on koodi" },
    headline: { no: "Finn noe å se sammen", en: "Find something to watch together", dk: "Find noget at se sammen", se: "Hitta något att se tillsammans", fi: "Löydä jotain katsottavaa yhdessä" },
    subtext: { no: "Ingen diskusjon. Bare match.", en: "No debate. Just match.", dk: "Ingen diskussion. Bare match.", se: "Ingen diskussion. Bara match.", fi: "Ei väittelyä. Vain match." },
    pairedExplainer: { no: "Begge swiper. Kun felles liker gir match.", en: "Both swipe. Only mutual likes become a match.", dk: "Begge swiper. Kun fælles likes giver match.", se: "Båda svajpar. Bara gemensamma likes blir en match.", fi: "Molemmat swaippaavat. Vain yhteiset tykkäykset tuottavat matchin." },
    recommended: { no: "Anbefalt", en: "Recommended", dk: "Anbefalet", se: "Rekommenderad", fi: "Suositeltu" },
    soon: { no: "BETA", en: "BETA", dk: "BETA", se: "BETA", fi: "BETA" },
    noAccountNeeded: { no: "Ingen konto nødvendig", en: "No account needed", dk: "Ingen konto nødvendig", se: "Inget konto behövs", fi: "Ei tiliä tarvita" },
    otherWays: { no: "Andre måter", en: "Other ways", dk: "Andre måder", se: "Andra sätt", fi: "Muita tapoja" },
    startSwiping: { no: "Start swiping", en: "Start swiping", dk: "Begynd at swipe", se: "Börja swipa", fi: "Aloita swippaus" },
    swipeWithPartner: { no: "Swipe med partner", en: "Swipe with partner", dk: "Swipe med partner", se: "Swipa med partner", fi: "Swippaa kumppanin kanssa" },
    or: { no: "eller", en: "or", dk: "eller", se: "eller", fi: "tai" },
    soloInviteHint: { no: "Swipe alene — inviter partner når du er klar", en: "Swipe solo — invite partner when ready", dk: "Swipe solo — inviter partner når du er klar", se: "Swipa solo — bjud in partner när du är redo", fi: "Swippaa solo — kutsu kumppani kun olet valmis" },
    socialProof: { no: "Hundrevis av par har allerede testet", en: "Hundreds of couples have already tried", dk: "Hundredvis af par har allerede prøvet", se: "Hundratals par har redan testat", fi: "Sadat parit ovat jo kokeilleet" },
    seoText: { no: "Begge swiper hver for seg på filmer og serier. Når dere matcher, har dere funnet noe dere begge faktisk vil se.", en: "Each of you swipes on movies and shows separately. When you match, you have found something you both actually want to watch.", dk: "I swiper hver for sig på film og serier. Når I matcher, har I fundet noget, I begge faktisk vil se.", se: "Ni svajpar var för sig på filmer och serier. När ni matchar har ni hittat något ni båda faktiskt vill se.", fi: "Molemmat swaippaavat elokuvia ja sarjoja erikseen. Kun matchäätte, olette löytäneet jotain mitä molemmat haluavat katsoa." },
    movieNightTips: { no: "Tips til filmkveld", en: "Movie night tips", dk: "Tips til filmaften", se: "Tips till filmkväll", fi: "Vinkkejä leffailtaan" },
  },

  // ============================================
  // PROVIDERS
  // ============================================
  providers: {
    headline: { no: "Hvor ser dere?", en: "Where are you watching?", dk: "Hvor ser I?", se: "Var tittar ni?", fi: "Missä katsotte?" },
    ingress: { no: "Velg tjenestene dine — eller hopp over for å se alt.", en: "Pick your services — or skip to see everything.", dk: "Vælg dine tjenester — eller spring over for at se alt.", se: "Välj dina tjänster — eller hoppa över för att se allt.", fi: "Valitse palvelusi — tai ohita nähdäksesi kaiken." },
    tonightLabel: { no: "I kveld:", en: "Tonight:", dk: "I aften:", se: "Ikväll:", fi: "Tänä iltana:" },
    series: { no: "Serier", en: "Series", dk: "Serier", se: "Serier", fi: "Sarjat" },
    movies: { no: "Filmer", en: "Movies", dk: "Film", se: "Filmer", fi: "Elokuvat" },
    mix: { no: "Miks", en: "Mix", dk: "Mix", se: "Mix", fi: "Sekoitus" },
    loading: { no: "Laster…", en: "Loading…", dk: "Indlæser…", se: "Laddar…", fi: "Ladataan…" },
    continueBtn: { no: "Fortsett", en: "Continue", dk: "Fortsæt", se: "Fortsätt", fi: "Jatka" },
    seeAll: { no: "Se alt", en: "See everything", dk: "Se alt", se: "Se allt", fi: "Näytä kaikki" },
    back: { no: "Tilbake", en: "Back", dk: "Tilbage", se: "Tillbaka", fi: "Takaisin" },
  },

  // ============================================
  // WAITING (host venter på partner)
  // ============================================
  waiting: {
    headline: { no: "Inviter partneren din", en: "Invite your partner", dk: "Inviter din partner", se: "Bjud in din partner", fi: "Kutsu kumppanisi" },
    ingress: { no: "Del koden med den andre.", en: "Share the code with your partner.", dk: "Del koden med den anden.", se: "Dela koden med den andra.", fi: "Jaa koodi kumppanillesi." },
    copyHint: { no: "Trykk for å kopiere", en: "Tap to copy", dk: "Tryk for at kopiere", se: "Tryck för att kopiera", fi: "Napauta kopioidaksesi" },
    scanOrShare: { no: "Skann eller del koden", en: "Scan or share the code", dk: "Skan eller del koden", se: "Skanna eller dela koden", fi: "Skannaa tai jaa koodi" },
    sendInvite: { no: "Send invitasjon", en: "Send invitation", dk: "Send invitation", se: "Skicka inbjudan", fi: "Lähetä kutsu" },
    copied: { no: "Kopiert!", en: "Copied!", dk: "Kopieret!", se: "Kopierat!", fi: "Kopioitu!" },
    cancel: { no: "Avbryt", en: "Cancel", dk: "Annuller", se: "Avbryt", fi: "Peruuta" },
    startSolo: { no: "Start alene i stedet", en: "Start solo instead", dk: "Start alene i stedet", se: "Starta solo istället", fi: "Aloita yksin sen sijaan" },
    shareText: { no: "Swipe filmer med meg og se hva vi matcher på 🎬", en: "Swipe movies with me and see what we match on 🎬", dk: "Swipe film med mig og se hvad vi matcher på 🎬", se: "Svajpa filmer med mig och se vad vi matchar på 🎬", fi: "Swaippaa elokuvia kanssani ja katso mihin matchaamme 🎬" },
  },

  // ============================================
  // JOIN
  // ============================================
  join: {
    headline: { no: "Bli med i runde", en: "Join round", dk: "Deltag i runde", se: "Gå med i runda", fi: "Liity kierrokselle" },
    ingress: { no: "Skriv inn koden du fikk.", en: "Enter the code you received.", dk: "Indtast koden du fik.", se: "Ange koden du fick.", fi: "Syötä saamasi koodi." },
    placeholder: { no: "KODE", en: "CODE", dk: "KODE", se: "KOD", fi: "KOODI" },
    connecting: { no: "Kobler til…", en: "Connecting…", dk: "Forbinder…", se: "Ansluter…", fi: "Yhdistetään…" },
    joinBtn: { no: "Bli med", en: "Join", dk: "Deltag", se: "Gå med", fi: "Liity" },
    back: { no: "Tilbake", en: "Back", dk: "Tilbage", se: "Tillbaka", fi: "Takaisin" },
  },

  // ============================================
  // TOGETHER (swiping)
  // ============================================
  together: {
    round1: { no: "Runde 1", en: "Round 1", dk: "Runde 1", se: "Runda 1", fi: "Kierros 1" },
    round2: { no: "Runde 2", en: "Round 2", dk: "Runde 2", se: "Runda 2", fi: "Kierros 2" },
    desktopHint: { no: "← → Space", en: "← → Space", dk: "← → Space", se: "← → Space", fi: "← → Space" },
    mobileSwipeHint: { no: "← Dislike   Like →", en: "← Dislike   Like →", dk: "← Dislike   Like →", se: "← Dislike   Like →", fi: "← Dislike   Like →" },
    genreFallback: { no: "Film/Serie", en: "Movie/Series", dk: "Film/Serie", se: "Film/Serie", fi: "Elokuva/Sarja" },
    invitePartner: { no: "Inviter partner", en: "Invite partner", dk: "Inviter partner", se: "Bjud in partner", fi: "Kutsu kumppani" },
    notForUs: { no: "Ikke for oss", en: "Not for us", dk: "Ikke for os", se: "Inte för oss", fi: "Ei meille" },
    hiddenToast: { no: "Skjult — vises ikke igjen", en: "Hidden — won't show again", dk: "Skjult — vises ikke igen", se: "Dold — visas inte igen", fi: "Piilotettu — ei näytetä uudelleen" },
    syncing: { no: "Synker…", en: "Syncing…", dk: "Synkroniserer…", se: "Synkar…", fi: "Synkronoidaan…" },
    connectionWeak: { no: "Tilkobling svak", en: "Connection weak", dk: "Forbindelse svag", se: "Anslutning svag", fi: "Yhteys heikko" },
    sendingSwipes: { no: "Sender swipes", en: "Sending swipes", dk: "Sender swipes", se: "Skickar swipes", fi: "Lähetetään swaippeja" },
  },

  // ============================================
  // iAmDone overlay
  // ============================================
  iAmDone: {
    statusLine: { no: "Venter på partneren din.", en: "Waiting for your partner.", dk: "Venter på din partner.", se: "Väntar på din partner.", fi: "Odotetaan kumppaniasi." },
    partnerProgress: { no: "Partneren din har sveipet {count} kort", en: "Your partner has swiped {count} cards", dk: "Din partner har swipet {count} kort", se: "Din partner har svajpat {count} kort", fi: "Kumppanisi on swaipannut {count} korttia" },
  },

  // ============================================
  // DECK EXHAUSTED
  // ============================================
  exhausted: {
    message: { no: "Ingen flere forslag.", en: "No more suggestions.", dk: "Ingen flere forslag.", se: "Inga fler förslag.", fi: "Ei enempää ehdotuksia." },
    retry: { no: "Prøv igjen", en: "Try again", dk: "Prøv igen", se: "Försök igen", fi: "Yritä uudelleen" },
  },

  // ============================================
  // RESULTS (felles like, runde 1)
  // ============================================
  results: {
    label: { no: "Dere er enige.", en: "You both agreed.", dk: "I er enige.", se: "Ni är överens.", fi: "Olette samaa mieltä." },
    startWatching: { no: "Start å se", en: "Start watching", dk: "Begynd at se", se: "Börja titta", fi: "Aloita katsominen" },
    seeAlternatives: { no: "Se alternativer:", en: "See alternatives:", dk: "Se alternativer:", se: "Se alternativ:", fi: "Katso vaihtoehdot:" },
    continueBtn: { no: "Fortsett og finn flere", en: "Keep looking for more", dk: "Fortsæt og find flere", se: "Fortsätt och hitta fler", fi: "Jatka ja etsi lisää" },
  },

  // ============================================
  // NO-MATCH
  // ============================================
  noMatch: {
    headline: { no: "Kvelden trenger et valg.", en: "The evening needs a choice.", dk: "Aftenen kræver et valg.", se: "Kvällen behöver ett val.", fi: "Ilta tarvitsee valinnan." },
    ingress: { no: "Basert på valgene deres, er dette kveldens sterkeste kandidat.", en: "Based on your choices, this is tonight's strongest candidate.", dk: "Baseret på jeres valg er dette aftenens stærkeste kandidat.", se: "Baserat på era val är detta kvällens starkaste kandidat.", fi: "Valintojenne perusteella tämä on illan vahvin ehdokas." },
    lastRound: { no: "Gi oss én runde til", en: "Give us one more round", dk: "Giv os én runde til", se: "Ge oss en runda till", fi: "Anna meille vielä yksi kierros" },
    acceptThis: { no: "La oss se denne", en: "Let's watch this", dk: "Lad os se denne", se: "Låt oss se denna", fi: "Katsotaan tämä" },
    playAgain: { no: "Spill igjen", en: "Play again", dk: "Spil igen", se: "Spela igen", fi: "Pelaa uudelleen" },
    fallbackHeadline: { no: "Utfordring akseptert.", en: "Challenge accepted.", dk: "Udfordring accepteret.", se: "Utmaning accepterad.", fi: "Haaste hyväksytty." },
    fallbackIngress: { no: "Her er noe dere kanskje ikke forventet.", en: "Here's something you might not expect.", dk: "Her er noget I måske ikke forventede.", se: "Här är något ni kanske inte förväntar er.", fi: "Tässä jotain mitä ette ehkä odottaneet." },
    fallbackCta: { no: "La oss teste denne", en: "Let's try this one", dk: "Lad os prøve denne", se: "Låt oss testa denna", fi: "Kokeillaan tätä" },
  },

  // ============================================
  // WINNER (match-moment)
  // ============================================
  winner: {
    phase1: { no: "Det er en match! 🎉", en: "It's a Match! 🎉", dk: "Det er et match! 🎉", se: "Det är en match! 🎉", fi: "Se on match! 🎉" },
    soloPhase1: { no: "Det er en match! 🎉", en: "It's a Match! 🎉", dk: "Det er et match! 🎉", se: "Det är en match! 🎉", fi: "Se on match! 🎉" },
    startWatching: { no: "▶︎ Start å se", en: "▶︎ Start watching", dk: "▶︎ Begynd at se", se: "▶︎ Börja titta", fi: "▶︎ Aloita katsominen" },
    watchOn: { no: "▶︎ Se på {provider}", en: "▶︎ Watch on {provider}", dk: "▶︎ Se på {provider}", se: "▶︎ Titta på {provider}", fi: "▶︎ Katso palvelussa {provider}" },
    keepLooking: { no: "Fortsett å lete →", en: "Keep looking →", dk: "Fortsæt med at lede →", se: "Fortsätt leta →", fi: "Jatka etsimistä →" },
    playAgain: { no: "Spill en runde til", en: "Play another round", dk: "Spil en runde til", se: "Spela en runda till", fi: "Pelaa uusi kierros" },
    share: { no: "Del resultatet", en: "Share result", dk: "Del resultatet", se: "Dela resultatet", fi: "Jaa tulos" },
    shareText: { no: "Vi fant noe å se! 🎬", en: "We found something to watch! 🎬", dk: "Vi fandt noget at se! 🎬", se: "Vi hittade något att se! 🎬", fi: "Löysimme jotain katsottavaa! 🎬" },
    copied: { no: "Kopiert!", en: "Copied!", dk: "Kopieret!", se: "Kopierat!", fi: "Kopioitu!" },
    soloInviteCta: { no: "Matchen er bedre med noen! Inviter en venn →", en: "Matches are better together! Invite a friend →", dk: "Matchet er bedre med nogen! Inviter en ven →", se: "Matchen är bättre med någon! Bjud in en vän →", fi: "Match on parempi yhdessä! Kutsu ystävä →" },
  },

  // ============================================
  // EMAIL CAPTURE (winner screen)
  // ============================================
  emailCapture: {
    placeholder: { no: "din@epost.no", en: "your@email.com", dk: "din@email.dk", se: "din@epost.se", fi: "sinun@sposti.fi" },
    submit: { no: "Send meg påminnelse", en: "Send me a reminder", dk: "Send mig en påmindelse", se: "Skicka mig en påminnelse", fi: "Lähetä muistutus" },
    prompt: { no: "Få påminnelse om å se den i kveld?", en: "Get a reminder to watch tonight?", dk: "Få en påmindelse om at se den i aften?", se: "Få en påminnelse att titta ikväll?", fi: "Saa muistutus katsoa tänä iltana?" },
    confirmed: { no: "✓ Vi sender deg en påminnelse!", en: "✓ We'll send you a reminder!", dk: "✓ Vi sender dig en påmindelse!", se: "✓ Vi skickar dig en påminnelse!", fi: "✓ Lähetämme sinulle muistutuksen!" },
  },

  // ============================================
  // DOUBLE-SUPER
  // ============================================
  doubleSuper: {
    label: { no: "Dere valgte det samme.", en: "You both picked the same.", dk: "I valgte det samme.", se: "Ni valde samma.", fi: "Valitsitte saman." },
    startWatching: { no: "Start å se", en: "Start watching", dk: "Begynd at se", se: "Börja titta", fi: "Aloita katsominen" },
    continueBtn: { no: "Fortsett", en: "Continue", dk: "Fortsæt", se: "Fortsätt", fi: "Jatka" },
  },

  // ============================================
  // RITUAL OVERLAY
  // ============================================
  ritual: {
    timer: { no: "2:00", en: "2:00", dk: "2:00", se: "2:00", fi: "2:00" },
    ready: { no: "Klar?", en: "Ready?", dk: "Klar?", se: "Redo?", fi: "Valmis?" },
    go: { no: "Kjør.", en: "Go.", dk: "Kør.", se: "Kör.", fi: "Aloita." },
    subtitle1: { no: "Legg bort telefonene.", en: "Phones apart.", dk: "Læg telefonerne væk.", se: "Lägg undan telefonerna.", fi: "Puhelimet erilleen." },
    subtitle2: { no: "Sveip hver for dere. Vi bestemmer.", en: "Swipe separately. We decide.", dk: "Swipe hver for sig. Vi bestemmer.", se: "Svajpa var för sig. Vi bestämmer.", fi: "Swaippaa erikseen. Me päätämme." },
  },

  // ============================================
  // GLOBAL
  // ============================================
  global: {
    myProfile: { no: "Min profil", en: "My profile", dk: "Min profil", se: "Min profil", fi: "Oma profiili" },
    login: { no: "Logg inn", en: "Log in", dk: "Log ind", se: "Logga in", fi: "Kirjaudu" },
  },
} as const;

export function cardsLeft(locale: Locale, round: number, n: number): string {
  if (locale === "dk") return `Runde ${round} \u2022 ${n} kort tilbage`;
  if (locale === "se") return `Runda ${round} \u2022 ${n} kort kvar`;
  if (locale === "fi") return `Kierros ${round} \u2022 ${n} korttia jäljellä`;
  if (locale === "no") return `Runde ${round} \u2022 ${n} kort igjen`;
  return `Round ${round} \u2022 ${n} cards left`;
}

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
