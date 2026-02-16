# LOGFLIX TRANSFORMATION — Bygg dette autonomt

Du skal transformere Logflix fra et sideprosjekt til en app folk vil betale for. Jeg er borte — IKKE spør meg noe. Ta egne avgjørelser basert på eksisterende kode. Kjør `npm run build` etter hver fase og fiks alle errors før du går videre.

---

## STEG 0: FORSTÅ PROSJEKTET (GJØR DETTE FØRST)

Før du skriver EN ENESTE linje kode, utforsk HELE prosjektet:

```
Les og forstå:
- Hele src/lib/ — alle helpers, typer, Supabase-klienter, API-abstraksjoner
- src/components/ — alle felleskomponenter, designpatterns, CSS-variabler
- src/app/(app)/library/page.tsx — forstå hvordan sider bygges
- src/app/(app)/recommendations/page.tsx — forstå AI-flyten
- src/components/Nav.tsx — navigasjonsstruktur
- src/components/TitleCard.tsx — kort-komponent pattern
- src/components/StreamingModal.tsx — modal-pattern
- src/middleware.ts — rutebeskyttelse og auth-flyt
- globals.css eller layout — designsystem og CSS-variabler
- .env / .env.local — environment variables
- Supabase-tabeller via eksisterende queries (user_titles, profiles, etc.)
- package.json — dependencies
```

Lag mentale notater om:
- Hvordan auth fungerer (getUser/requireUser pattern)
- Tabellnavn og kolonnestruktur i Supabase
- CSS-variabelnavn (--bg-base, --accent, etc.)
- Komponent-patterns som gjenbrukes
- Navigasjonsstruktur (sidebar desktop / bunnmeny mobil)

---

## FASE 1: ONBOARDING — DEN VIKTIGSTE FEATUREN SOM MANGLER

### Hvorfor dette er kritisk
Akkurat nå lander nye brukere på et tomt bibliotek. "For deg", "Smaksprofil", og "Statistikk" er alle verdiløse uten data. Onboarding fikser alt dette på én gang.

### Bygg: `/onboarding` (4-stegs flyt)

**Steg 1 — "Velkommen til Logflix"**
- Kort hero med animert tekst: "La oss bygge din filmprofil"
- Subtekst: "Velg titler du har sett, så lærer vi hva du liker"
- En "La oss starte →" knapp
- Clean, minimal, mørkt design som matcher appen

**Steg 2 — "Hva har du sett?"**
- Hent 60-80 populære titler fra TMDB (bland trending, top rated, populære fra ulike sjangre og tiår)
- Lag en API-route `/api/onboarding/titles` som returnerer en kuratert blanding
- Vis som et responsivt grid med poster-kort (3-4 kolonner mobil, 5-6 desktop)
- Hvert kort har 3 states: uvalgt (dimmet), 👍 likte (grønn border/glow), 👎 mislikte (rød border/glow)
- Klikk = likte, dobbelklikk eller long-press = mislikte, klikk igjen = fjern
- Teller øverst: "X av minimum 5 valgt" med progressbar
- "Fortsett →" knapp som aktiveres ved 5+ valg
- Søkefelt øverst: "Finner du ikke noe? Søk her" — inline TMDB-søk som legger til resultater i gridet
- VIKTIG: Bruk samme CSS-variabler og glass-estetikk som resten av appen

**Steg 3 — "Velg strømmetjenester"**
- Grid med logoer: Netflix, HBO Max, Disney+, Viaplay, TV 2 Play, Apple TV+, Amazon Prime, Paramount+
- Multi-select med check-badge
- Lagres i profiles-tabellen (legg til kolonne streaming_services jsonb[] hvis den ikke finnes)
- "Hopp over" og "Fortsett →" knapper
- Brukes senere til å filtrere anbefalinger til tjenester brukeren faktisk har

**Steg 4 — "Din profil er klar!"**
- Vis en rask smaksprofil-preview basert på valgene (kall taste-summary API)
- Konfetti eller subtle feiring-animasjon
- "Utforsk anbefalinger →" knapp som sender til /recommendations
- Eller "Gå til biblioteket →"

### Auth-flyt endring
- I `/api/auth/callback/route.ts` eller der nye brukere redirectes: sjekk om brukeren har noen titler i user_titles. Hvis 0 → redirect til `/onboarding` i stedet for `/library`
- Legg til `onboarding_completed: boolean` i profiles eller sjekk user_titles count
- Brukere som allerede har titler (eksisterende) skal ALDRI se onboarding

### Middleware-endring
- `/onboarding` skal kreve auth men IKKE kreve fullført onboarding
- Alle andre (app)-ruter: hvis bruker er innlogget men har 0 titler og onboarding ikke er fullført → redirect til `/onboarding`

---

## FASE 2: DASHBOARD — ERSTATT TOM LIBRARY MED PERSONLIG HJEM

### Bygg: Ny hjemmeside som føles levende

Endre `/library` eller lag en ny `/home` som er landingssiden etter login. Denne skal ALDRI føles tom.

**Seksjon 1 — "Fortsett å se" (Watch Bank preview)**
- Horisontalt scrollbar rad med serier fra Watch Bank
- Vis sesong/episode-badge på hvert kort
- Bare synlig hvis brukeren har aktive serier
- Klikk → StreamingModal med progress-oppdatering

**Seksjon 2 — "For deg" (Quick recommendations)**
- 1 rad med 6-8 anbefalinger (horisontalt scroll)
- Hent fra cached recommendations eller generer on-the-fly
- Hvert kort: poster + AI-tagline (kort, 5-8 ord)
- Quick-actions: 👍 sett, + watchlist (direkte på kortet, ikke via modal)
- "Se alle →" lenke til /recommendations

**Seksjon 3 — "Venneaktivitet" (hvis brukeren har koblinger)**
- Feed med 5-10 siste handlinger fra koblede venner
- Format: "[Profilnavn] likte Breaking Bad" / "[Profilnavn] la til Dune i se-listen"
- Lag en API-route `/api/activity/friends` som henter fra user_titles JOIN account_links
- Mini-poster thumbnails, tidsstempel ("2 timer siden")
- Klikk på tittel → StreamingModal
- Bare synlig hvis brukeren har account_links

**Seksjon 4 — "Nylig logget" (siste 10 titler)**
- Horisontalt scroll med sist loggede titler
- Sentiment-badge (👍👎😐) på hvert kort

**Seksjon 5 — "Populært nå" (fallback for nye brukere)**
- Trending denne uken fra TMDB
- Alltid synlig — sikrer at dashboardet aldri er tomt

**Design:**
- Hver seksjon har en overskrift med eventuelt "Se alle →" lenke
- Horisontale scroll-rader med snap-scrolling
- Seksjonene skal animere inn med stagger (bruk eksisterende stagger-pattern)
- Mobil: fulle bredde-rader med horisontalt scroll
- Desktop: sidebar + innholdsområde som vanlig

---

## FASE 3: TIDSMASKINEN — IMPORT HUB

### Les `public/netflix-import-spec.txt` for Netflix-koden.

### Bygg: `/timemachine` — Import Hub

**Hub-side (`/timemachine/page.tsx`):**
- Overskrift: "Tidsmaskinen" med subtitle "Hent inn det du allerede har sett"
- Grid med import-kilder som kort:
  - **Netflix** — aktiv, klikk → `/timemachine/netflix`
  - **Trakt** — aktiv (du har allerede Trakt-integrasjon i settings, flytt/lenk den hit)
  - **HBO Max** — "Kommer snart" badge, greyed out
  - **Disney+** — "Kommer snart"
  - **TV 2 Play** — "Kommer snart"
- Hvert kort: tjeneste-logo/ikon, navn, kort beskrivelse, status-badge
- Design: glass-kort med subtle hover-lift

**Netflix import (`/timemachine/netflix/page.tsx`):**
- Bruk koden fra spec-filen, men TILPASS alt til prosjektets eksisterende patterns
- Tilpass: Supabase-klienter, tabellnavn (sannsynligvis user_titles ikke library), auth-pattern, CSS-variabler
- Den eksisterende `add`-routen i spec bruker `library`-tabell — endre til det faktiske tabellnavnet
- Bruk eksisterende `logTitle` eller lignende funksjon fra lib/api.ts hvis mulig
- Etter import: trigger smaksprofil-regenerering i bakgrunnen

**API-routes:**
- `/api/import/netflix/match/route.ts` — tilpass fra spec
- `/api/import/netflix/add/route.ts` — tilpass fra spec, bruk riktig tabell og kolonner

**Navigasjon:**
- Legg til "Tidsmaskinen" i sidebar/nav under en passende seksjon (f.eks. under SAMLING)
- Eller: legg til en "Importer historikk" knapp/banner på dashboard for brukere med < 20 titler

---

## FASE 4: SOSIAL JUICE — DET SOM SKAPER RETENTION

### 4A: Venneaktivitet-feed

Hvis ikke allerede bygget i Fase 2, lag:

**API: `/api/activity/friends/route.ts`**
```
Hent siste 20 handlinger fra koblede venner:
- JOIN user_titles med account_links og profiles
- Returner: bruker-navn, handling (watched/watchlisted/liked), tittel-info, tidsstempel
- Sorter nyeste først
- Cache i 5 minutter
```

**Vis på dashboard og eventuelt som egen side `/activity`**

### 4B: "Delt med meg" forbedring

Gjør "Delt med meg" mer interaktivt:
- Vis vennens sentiment på hver tittel (hva synes DE om den?)
- Legg til "Enig" / "Uenig" knapper som logger tittelen med ditt eget sentiment
- Badge i nav når du har nye delte lister du ikke har sett

### 4C: Overlapp-feature

Legg til en "Sammenlign smak"-funksjon mellom to koblede brukere:
- Side eller modal: `/compare/[friendId]` eller inline
- Vis: "Dere er 73% enige", felles likte titler, titler bare du har sett, titler bare vennen har sett
- Lag API: `/api/compare/[userId]/route.ts`
- Delbart resultat

---

## FASE 5: MICRO-UX SOM GJØR APPEN PREMIUM

### 5A: Quick-log forbedring

Endre handlingsknappene fra 5 separate knapper til en smartere flyt:

**Ny interaksjon på TitleCard og i søkeresultater:**
- Primær handling: en stor "Logg" knapp som åpner en liten inline-panel
- Panelet viser: 👍 Bra | 😐 Ok | 👎 Dårlig — tre tydelige valg med tekst-labels
- Under: "Legg i se-liste i stedet" tekst-lenke
- List+-ikon bare synlig i expanded state

Gjør IKKE dette hvis det krever massive endringer i TitleCard som kan brekke alt. Vurder scope og gjør det bare hvis du kan gjøre det trygt. Om det er for risikabelt, hopp over dette steget.

### 5B: Toast-notifikasjoner

Bygg en enkel toast-komponent:
- Vis toast ved: logging av tittel, import ferdig, anbefaling-feedback, feil
- Posisjon: bottom-center på mobil, bottom-right på desktop
- Auto-dismiss etter 3 sekunder
- Undo-knapp i toasten for logginger

### 5C: Skeleton loading overalt

Sørg for at ALLE sider som henter data viser skeleton-loading (bruk eksisterende SkeletonCard/SkeletonGrid).
Sjekk at dette allerede er implementert — hvis ja, hopp over.

### 5D: Empty states

Sørg for at ALLE tomme tilstander har god UX (bruk eksisterende EmptyState-komponent):
- Tomt bibliotek → "Start med å logge noe du har sett, eller importer fra Netflix" + lenke til Tidsmaskinen og søk
- Tom watchlist → "Legg til filmer og serier du vil se" + lenke til søk og anbefalinger
- Tom Watch Bank → "Ingen pågående serier. Finn noe nytt!" + lenke
- Ingen venner → "Inviter en venn for å dele filmsmak" + invitasjonskode-visning
- Sjekk eksisterende empty states og forbedre teksten hvis den er generisk

---

## FASE 6: LOGFLIX WRAPPED — VIRAL DELINGSMASKIN

### Bygg: `/wrapped` — Personlig filmårsoppsummering

**Side: `/wrapped/page.tsx`**

Generer en serie "slides" basert på brukerens data:

**Slide 1: "Ditt år i tall"**
- X filmer sett, Y serier, Z timer totalt (estimer: film ~2t, serie-episode ~45min)
- Animerte tellere som teller opp

**Slide 2: "Din topp-sjanger"**
- Mest sette sjanger med prosentandel
- "Du er en [sjanger]-entusiast" tekst

**Slide 3: "Dine favoritter"**
- Top 5 titler (basert på liked + favorite) med postere

**Slide 4: "Din smak i et nøtteskall"**
- Hent fra taste-summary
- Vis de tre kategoriene visuelt

**Slide 5: "Del din smak"**
- Generer et delbart bilde/kort (bruk html2canvas eller en server-side bilde-generator)
- Eller: en shareable URL som viser wrapped-dataen som en offentlig side
- Share-knapper for: kopier lenke

**API: `/api/wrapped/route.ts`**
- Samle alle stats fra user_titles for sist 12 måneder
- Beregn: totalt sett, timer, topp-sjangre, topp-titler, sentiment-fordeling, mest aktive måned
- Returner som JSON

**Design:**
- Fullskjerm slides med swipe/klikk navigasjon
- Mørk bakgrunn med fargerike aksenter per slide
- Smooth overganger mellom slides
- Mobiloptimalisert — dette deles fra mobil

**Viktig:** Hvis brukeren har < 10 titler, vis en "Logg flere titler for å få din Wrapped!" melding.

---

## FASE 7: GAMIFICATION — STREAKS OG MILEPÆLER

### 7A: Logg-streak

- Track daglig logging i profiles (legg til `current_streak: int`, `longest_streak: int`, `last_logged_date: date`)
- Oppdater ved hver logging via API
- Vis streak-badge i sidebar/nav: 🔥 7 (dager)
- Vis på dashboard: "Du har logget 7 dager på rad!"
- Streak brytes hvis brukeren ikke logger på 48 timer (gi dem litt slack)

### 7B: Milepæler

Vis notifikasjon/toast ved:
- 10, 25, 50, 100, 250, 500 titler logget
- Første anbefaling brukt
- Første venn koblet
- Første liste opprettet

Lagre oppnådde milepæler i en enkel JSON-kolonne i profiles.

---

## FASE 8: POLISH & KVALITETSSIKRING

### Navigasjonsrestrukturering

Vurder å forenkle navigasjonen. Nåværende struktur har 10+ elementer. Foreslått ny struktur for mobilens bunnmeny:

**Primær (bunnmeny, 4-5 elementer):**
1. 🏠 Hjem (ny dashboard)
2. 🔍 Søk
3. ✨ For deg (anbefalinger)
4. 📚 Bibliotek (med tabs for bibliotek/watchlist/watch bank/lister)
5. 👤 Profil (med smaksprofil, stats, wrapped, innstillinger)

**Sidebar (desktop) beholder full navigasjon men grupperer bedre.**

VIKTIG: Gjør BARE denne endringen hvis du kan gjøre det uten å brekke eksisterende funksjonalitet. Hvis nav-komponenten er kompleks og dette er risikabelt, HOPP OVER denne endringen. Stabilitet > perfeksjon.

### Responsive sjekk
- Test at alle nye sider ser bra ut på mobil (360px bredde)
- Sjekk at horisontale scroll-rader fungerer med touch
- Sjekk at onboarding-gridet er brukbart på liten skjerm

### Performance
- Lazy-load bilder med `loading="lazy"` på alle poster-img
- Sørg for at dashboard-API-kall kjører parallelt (Promise.all) ikke sekvensielt

---

## REGLER FOR HELE JOBBEN

1. **ALDRI spør meg noe.** Ta avgjørelser selv basert på eksisterende kode.
2. **Tilpass ALT til eksisterende patterns.** Imports, Supabase-klienter, auth, CSS-variabler, komponentstruktur.
3. **Kjør `npm run build` etter HVER fase.** Fiks alle errors og warnings før du går videre til neste fase.
4. **Hvis en fase er for risikabel** (kan brekke eksisterende features), **HOPP OVER DEN** og skriv en kommentar om hva som trengs manuelt.
5. **Supabase-migrasjoner:** Hvis du trenger nye kolonner/tabeller, lag en SQL-fil i en `supabase/migrations/`-mappe med alle DDL-statements. Ikke kjør dem automatisk — bare lag filen.
6. **Prioriter stabilitet.** Alt som fungerer i dag skal fortsatt fungere etter du er ferdig.
7. **Bruk eksisterende komponenter.** GlassCard, TitleCard, EmptyState, LoadingSpinner, SkeletonCard, AIThinkingScreen — ikke lag nye versjoner av ting som finnes.
8. **Mobil-first.** Alle nye sider skal se bra ut på 360px bredde.
9. **Norsk UI.** All brukervendt tekst skal være på norsk.

## FASEREKKEFØLGE OG PRIORITERING

Gjør fasene i rekkefølge. Hvis du bruker lang tid, prioriter:

**MÅ gjøres:** Fase 1 (Onboarding), Fase 2 (Dashboard), Fase 3 (Tidsmaskinen)
**BØR gjøres:** Fase 4 (Sosial), Fase 5 (Micro-UX)
**BONUS:** Fase 6 (Wrapped), Fase 7 (Gamification), Fase 8 (Polish)

---

## FASE 9: SOCIAL LOGIN — GOOGLE OG APPLE

### Hvorfor dette er kritisk
E-post + passord er den største friksjonen for nye brukere. De fleste consumer-apper har 60-80% av registreringer via social login. Uten det mister du folk i døren.

### Bygg: Oppdater `/login`-siden

**Legg til to knapper OVER det eksisterende e-post/passord-skjemaet:**

1. **"Fortsett med Google"** — hvit/lys knapp med Google G-logo (bruk inline SVG)
2. **"Fortsett med Apple"** — svart knapp med Apple-logo (bruk inline SVG)

**Layout:**
- Google-knapp først (mest brukt i Norge)
- Apple-knapp under
- Deretter en divider: linje — "eller" — linje (subtle, text-tertiary farge)
- Eksisterende e-post/passord-skjema under divideren
- Knappene skal være full bredde, samme bredde som skjemaet
- Border-radius som matcher resten av designet
- Høyde ~48px, font-weight medium

**Kode for knappene:**
```tsx
// Google login
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
  if (error) console.error('Google login error:', error);
};

// Apple login
const handleAppleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
  if (error) console.error('Apple login error:', error);
};
```

**Viktig:**
- Bruk SAMME Supabase-klient som eksisterende login bruker (sjekk om det er browser-client)
- `redirectTo` skal peke til eksisterende `/api/auth/callback` — den håndterer allerede code exchange
- Sjekk at callback-routen fungerer med OAuth providers (den skal allerede håndtere `code` parameter fra URL)
- Behold HELE eksisterende e-post/passord-funksjonaliteten uendret — social login er et tillegg, ikke en erstatning
- Registrering-tab og login-tab skal BEGGE vise social login-knappene øverst (det er samme flyt for OAuth)

**Auth callback-sjekk:**
- Verifiser at `/api/auth/callback/route.ts` bruker `exchangeCodeForSession` eller lignende
- OAuth-providers redirecter tilbake med `code` i URL — dette skal allerede håndteres
- Hvis callback sjekker om bruker er ny (for onboarding-redirect fra Fase 1), sørg for at dette også fungerer for OAuth-brukere

**SVG-logoer (bruk disse inline, IKKE eksterne bilder):**

Google G-logo (forenklet):
```tsx
<svg width="20" height="20" viewBox="0 0 24 24">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
</svg>
```

Apple-logo (forenklet):
```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.24-3.74 4.25z"/>
</svg>
```

**Etter implementering:**
- Lag en kommentar/README-seksjon som forklarer hva som må settes opp manuelt i Supabase Dashboard:
  1. Gå til Supabase Dashboard → Authentication → Providers
  2. Aktiver Google: legg inn Client ID og Client Secret fra Google Cloud Console
  3. Aktiver Apple: legg inn Service ID, Team ID, Key ID, og Private Key fra Apple Developer
  4. Sett Authorized redirect URL i begge providers til: `https://[SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
  5. I Google Cloud Console: legg til `https://logflix.app` og `http://localhost:3000` som authorized origins

Denne fasen er lav-risiko og høy-verdi. Gjør den ETTER Fase 1-3, men FØR Fase 6-8.

**OPPDATERT PRIORITERING:**

**MÅ gjøres:** Fase 1 (Onboarding), Fase 2 (Dashboard), Fase 3 (Tidsmaskinen)
**BØR gjøres:** Fase 9 (Social Login), Fase 4 (Sosial), Fase 5 (Micro-UX)
**BONUS:** Fase 6 (Wrapped), Fase 7 (Gamification), Fase 8 (Polish)

Lykke til. Bygg noe sykt. 🚀
