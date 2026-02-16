# Logflix — Komplett Feature-rapport

## Om prosjektet
Logflix er en film- og seriedagbok bygget med Next.js 16 (App Router), Supabase (auth + database), TMDB API (filmdata), og AI (Anthropic Claude / OpenAI) for smarte anbefalinger. Designet er mørkt med glassmorfisme-estetikk, rødt aksent-tema, og PWA-støtte for mobil.

**Tech-stack:** Next.js 16.1.6, TypeScript, Tailwind CSS, Supabase, TMDB API, Anthropic/OpenAI API
**Hosting:** Vercel
**URL:** https://logflix.app

---

## Navigasjonsstruktur

Sidebar (desktop) / bunnmeny (mobil) med disse seksjonene:

**OPPDAG:** Søk, For deg (AI)
**SAMLING:** Bibliotek, Se-liste, Watch Bank, Lister
**SOSIALT:** Delt med meg, WT Beta
**INNSIKT:** Smaksprofil (AI), Statistikk
**Bunn:** Innstillinger

---

## Feature 1: Søk (`/search`)

**Hva det gjør:** Brukeren kan søke etter filmer og serier via TMDB. Har både enkelt søk og avansert søk med filtre.

**UI:**
- Søkefelt med type-filter (Alle/Film/TV)
- Avansert søk-panel (utvidbart) med: sjanger-knapper, strømmetjeneste-valg (Netflix, Viaplay, etc.), skuespiller-søk, årstall-range, sortering
- Resultatgrid: 2-6 kolonner responsivt
- Hvert kort har poster, tittel, år, rating-badge
- Desktop: hover-overlay med handlingsknapper
- Mobil: knapper under kortet
- Klikk på kort åpner StreamingModal med detaljer

**Handlinger per tittel:**
- 👍 Likte (logges som sett + liked)
- 👎 Mislikte (logges som sett + disliked)
- 😐 Nøytral (logges som sett + neutral)
- + Se-liste (legg til watchlist)
- List+ (legg til egendefinert liste)

**Gjeste-modus:** Uinnloggede brukere kan søke og se resultater. Etter X handlinger vises en "ConversionWall" som oppfordrer til registrering. Gjeste-handlinger migreres til konto ved registrering.

**Filer:**
- `src/app/(app)/search/page.tsx` — Søkesiden (UI + logikk)
- `src/components/AdvancedSearchPanel.tsx` — Avansert søk-panel
- `src/app/api/tmdb/search/route.ts` — Søk-API (proxy til TMDB)
- `src/app/api/tmdb/discover/route.ts` — Avansert søk-API (TMDB discover)
- `src/app/api/tmdb/person/route.ts` — Skuespiller-søk API

---

## Feature 2: Bibliotek (`/library`)

**Hva det gjør:** Brukerens hovedbibliotek med alle sette filmer og serier. Viser alt som er logget med status "watched".

**UI:**
- Overskrift "Mitt Bibliotek" med totaltall
- Filtertabs: Alle, ★ Favoritter, Likte, Nøytrale, Mislikte, Ekskluderte
- Sortering: Nyeste, A-Å, År
- Sjanger-dropdown + årstall-filter
- Responsivt grid (2-6 kolonner)
- TitleCard med sentiment-indikator, favoritt-stjerne, vennenes overlapp-badge
- "For deg"-karusell med horisontalt scrollbare anbefalinger øverst
- StreamingModal ved klikk

**Handlinger:**
- Favoritt-toggle
- Legg til liste
- Ekskluder fra anbefalinger
- Fjern fra bibliotek

**Filer:**
- `src/app/(app)/library/page.tsx` — Biblioteksiden
- `src/app/api/log/route.ts` — Logging/CRUD for titler
- `src/app/api/exclusions/route.ts` — Ekskluderinger

---

## Feature 3: Se-liste / Watchlist (`/watchlist`)

**Hva det gjør:** Titler brukeren vil se i fremtiden. Funksjonelt likt biblioteket, men med status "watchlist".

**UI:**
- "Se-liste" overskrift med antall
- Sjanger- og årstall-filtre
- Samme grid-layout som bibliotek
- Handlinger: merk som sett (liked/disliked/neutral), fjern, favoritt-toggle, legg til liste

**Filer:**
- `src/app/(app)/watchlist/page.tsx` — Watchlist-siden
- `src/lib/api.ts` → `fetchWatchlist()` — Henter watchlist-data

---

## Feature 4: Watch Bank (`/watch-bank`)

**Hva det gjør:** Serier brukeren ser på akkurat nå, med fremdriftssporing (sesong/episode).

**UI:**
- Glass-kort header med "Watch Bank" tittel og forklaring
- Sjanger- og årstall-filtre
- Grid med TitleCard som viser sesong/episode-badge
- Inne i StreamingModal: knapper for å oppdatere sesong/episode
- Handlinger: oppdater fremdrift, merk som ferdig, fjern

**Filer:**
- `src/app/(app)/watch-bank/page.tsx` — Watch Bank-siden
- `src/lib/api.ts` → `updateProgress()` — Oppdater sesong/episode

---

## Feature 5: Anbefalinger / For deg (`/recommendations`)

**Hva det gjør:** AI-drevne personlige anbefalinger basert på brukerens bibliotek, smaksprofil, og TMDB-data.

**Hvordan det fungerer (backend):**
1. Henter brukerens likte/mislikte titler og smaksprofil
2. Bygger kandidatpool fra: TMDB discover (basert på topp-sjangre, tilfeldig side 1-5), lignende titler til 5 tilfeldig valgte likte titler, trending denne uken
3. Filtrerer bort: allerede logget, ekskludert, "ikke for meg"-feedback, ekskluderte språk/sjangre
4. Scorer kandidater: sjangeroverlapp (+10), TMDB-rating (+5/+10), popularitet, utforskning-noise
5. Topp 20 sendes til AI (Claude/GPT) som genererer personlige forklaringer ("why") og 3 tags per anbefaling
6. Returnerer til klienten med poster, tittel, forklaring, tags

**UI:**
- "For deg" overskrift med "Hent anbefalinger" / "Oppdater" knapp
- AIThinkingScreen mens AI jobber
- 2-kolonne grid (1 på mobil) med glass-kort per anbefaling
- Hvert kort viser: mini-poster, tittel, år, type, AI-forklaring, tags
- Handlingsknapper: 👍 Sett, 👎 Sett, + Se-liste, List+
- Feedback-knapper: Bra forslag, Ikke for meg, Ikke anbefal
- Kort forsvinner med undo-mulighet etter handling
- Tom-tilstand: "Alt gjennomgått! Trykk Oppdater for å få flere."

**Filer:**
- `src/app/(app)/recommendations/page.tsx` — Anbefalingssiden
- `src/app/api/recommendations/route.ts` — Anbefalingsalgoritmen
- `src/lib/ai.ts` → `explainRecommendations()` — AI-forklaringer
- `src/app/api/feedback/route.ts` — Feedback-lagring

---

## Feature 6: Smaksprofil (`/taste`)

**Hva det gjør:** AI analyserer brukerens sette titler og genererer en tekstlig smaksprofil.

**Hvordan det fungerer:**
1. Samler brukerens likte, mislikte, nøytrale titler med sjanger-info
2. Sender til AI med prompt: "Analyser smaken og returner JSON med youLike, avoid, pacing"
3. Lagrer resultatet i profilen for gjenbruk i anbefalinger

**UI:**
- "Din smaksprofil" overskrift med "Analyser min smak" / "Generer på nytt" knapp
- 3 glass-kort:
  - "Du liker..." (grønn indikator) — 2-3 setninger om preferanser
  - "Du unngår gjerne..." (rød indikator) — 1-2 setninger om hva brukeren ikke liker
  - "Tempo, tone og temaer" (aksent-indikator) — 1-2 setninger om stil-preferanser
- Sist oppdatert-tidsstempel

**Filer:**
- `src/app/(app)/taste/page.tsx` — Smaksprofil-siden
- `src/app/api/taste-summary/route.ts` — Generering av smaksprofil
- `src/lib/ai.ts` → `generateTasteSummary()` — AI-analyse

---

## Feature 7: Egendefinerte lister (`/lists` + `/lists/[id]`)

**Hva det gjør:** Brukeren kan lage egne lister for å organisere titler (f.eks. "Filmkveld", "Må se med venner").

**UI — Listeoversikt (`/lists`):**
- "Mine lister" overskrift med "+ Ny liste" knapp
- Opprett-skjema: tekstfelt + opprett/avbryt
- Grid med listekort (1-3 kolonner responsivt)
- Hvert kort viser: 4x4 thumbnail-grid av poster, listenavn, antall titler, slett-knapp

**UI — Listedetalj (`/lists/[id]`):**
- Tilbake-knapp + listenavn + antall
- Grid med TitleCard-komponenter
- Handling: fjern fra liste, åpne StreamingModal

**Filer:**
- `src/app/(app)/lists/page.tsx` — Listeoversikt
- `src/app/(app)/lists/[id]/page.tsx` — Listedetalj
- `src/app/api/lists/route.ts` — Liste CRUD
- `src/app/api/lists/[id]/items/route.ts` — Legge til/fjerne titler
- `src/components/AddToListModal.tsx` — Modal for å velge liste

---

## Feature 8: Delt med meg (`/shared`)

**Hva det gjør:** Viser lister som venner har delt med brukeren gjennom kontokoblinger.

**UI:**
- "Delt med meg" overskrift
- Gruppert etter eier (vennens navn som seksjonstittel)
- Listenavn med antall titler
- Grid med TitleCard (kun visning, ingen handlinger)
- StreamingModal ved klikk

**Filer:**
- `src/app/(app)/shared/page.tsx` — Delt med meg-siden
- `src/app/api/shared-lists/route.ts` — Henter delte lister
- `src/app/api/friends/titles/route.ts` — Venners tittel-overlapp

---

## Feature 9: Statistikk (`/stats`)

**Hva det gjør:** Viser statistikk over brukerens seerhistorikk.

**UI:**
- "Statistikk" overskrift
- 4 oversiktskort (2x2 grid): Totalt sett, Se-liste, Filmer, Serier
- Sentiment-fordeling: stolpediagram (likte/nøytral/mislikte/ingen)
- Topp sjangre: horisontalt stolpediagram med prosentandel
- Nylig sett: liste med tittel, type, dato

**Filer:**
- `src/app/(app)/stats/page.tsx` — Statistikksiden (klient-side Supabase-spørringer)

---

## Feature 10: Innstillinger (`/settings`)

**Hva det gjør:** Profilhåndtering, kontokoblinger, integrasjoner, innholdsfiltre.

**UI-seksjoner:**
1. **Profil:** Visningsnavn (inline-redigering)
2. **Kontokoblinger:** Invitasjonskoder, aksepter kode, liste over koblinger med delingsvalg
3. **Trakt-integrasjon:** Koble til Trakt, synkroniser seerhistorikk (merge/overwrite)
4. **Utforskning-slider:** 0-100 range (Presis ↔ Utforsk) — påvirker anbefalingsvariasjon
5. **Innholdsfiltre:** Toggle-knapper for forhåndsinstilte filtre (ekskluder anime, asiatisk innhold, bollywood, etc.)
6. **AI-test:** Test tilkobling til AI-leverandør
7. **Dataeksport:** Last ned brukerdata som JSON
8. **Juridisk:** Lenker til personvern, vilkår, kontakt
9. **Logg ut:** Rød knapp

**Filer:**
- `src/app/(app)/settings/page.tsx` — Innstillingssiden
- `src/app/api/profile/route.ts` — Profilhåndtering
- `src/app/api/links/route.ts` — Kontokoblinger
- `src/app/api/trakt/connect/route.ts` — Trakt OAuth
- `src/app/api/trakt/sync/route.ts` — Trakt-synkronisering
- `src/app/api/export/route.ts` — Dataeksport
- `src/lib/filter-presets.ts` — Filterdefinisjoner

---

## Feature 11: WT Beta (`/wt-beta`)

**Hva det gjør:** "Watch Together" beta-funksjon — et swipe-basert grensesnitt der brukere kan matche filmsmak med venner. Tinder-lignende kort-swiping for å finne felles filmer.

**UI:**
- Intro-skjerm med forklaring
- Onboarding: velg sjangre
- Swipe-kort med filmposters
- Match-overlay når begge liker samme tittel
- Smaksprofil-sammendrag

**Filer:**
- `src/app/wt-beta/page.tsx` — WT Beta-siden (frittstående, ikke i (app)-gruppen)
- `src/app/api/wt-beta/posters/route.ts` — Poster-data

---

## Feature 12: Login / Registrering (`/login`)

**Hva det gjør:** Autentisering med e-post/passord via Supabase Auth.

**UI:**
- Split-layout: venstre side med hero (desktop), høyre side med auth-kort
- Mobil: kompakt hero + auth-kort
- Tab-basert login/registrering
- Registrering krever godkjenning av brukervilkår
- "Utforsk uten konto" lenke for gjeste-modus
- E-postbekreftelse via Supabase → callback → redirect til /wt-beta (nye brukere) eller /library

**Filer:**
- `src/app/login/page.tsx` — Login-siden
- `src/app/api/auth/callback/route.ts` — Auth callback
- `src/middleware.ts` — Rutebeskyttelse

---

## Feature 13: StreamingModal (komponent)

**Hva det gjør:** Modal som viser detaljert info om en film/serie, inkludert hvor den kan strømmes.

**UI:**
- Fullskjerm backdrop med blur
- Stor poster/backdrop
- Tittel, år, sjangre, oversikt
- YouTube trailer (hvis tilgjengelig)
- Strømmetjenester: flatrate, leie, kjøp — med leverandør-logoer
- Handlingsknapper (kontekstavhengig)
- Lukk-knapp

**Filer:**
- `src/components/StreamingModal.tsx` — Selve modalen
- `src/app/api/tmdb/details/route.ts` — Titteldetaljer fra TMDB
- `src/app/api/tmdb/providers/route.ts` — Strømmeleverandører

---

## Felleskomponenter

| Komponent | Fil | Beskrivelse |
|-----------|-----|-------------|
| Nav | `src/components/Nav.tsx` | Sidebar (desktop) + bunnmeny (mobil), brukerinfo, navigasjon |
| TitleCard | `src/components/TitleCard.tsx` | Poster-kort med handlingsknapper, badges, hover-effekter |
| GlassCard | `src/components/GlassCard.tsx` | Glassmorfisme-kort med valgfri hover-effekt |
| GlowButton | `src/components/GlowButton.tsx` | Knapp med glow-effekt i aksentfarge |
| EmptyState | `src/components/EmptyState.tsx` | Tom-tilstand med ikon, tittel, beskrivelse, CTA |
| LoadingSpinner | `src/components/LoadingSpinner.tsx` | Spinner med valgfri tekst |
| SkeletonGrid | `src/components/SkeletonCard.tsx` | Skeleton-loading grid |
| AIThinkingScreen | `src/components/AIThinkingScreen.tsx` | AI-laste-animasjon |
| AddToListModal | `src/components/AddToListModal.tsx` | Modal for å velge hvilken liste å legge til |
| ConversionWall | `src/components/ConversionWall.tsx` | Oppfordring til registrering for gjester |
| AnimatedTabs | `src/components/AnimatedTabs.tsx` | Tab-komponent med animasjon |

---

## Backend-arkitektur

### Lib-filer

| Fil | Beskrivelse |
|-----|-------------|
| `src/lib/tmdb.ts` | TMDB API-wrapper: search, discover, details, similar, trending, providers, person, genres, keywords |
| `src/lib/ai.ts` | AI-abstraksjon: callAI() støtter Anthropic Claude og OpenAI. Funksjoner: generateTasteSummary(), explainRecommendations() |
| `src/lib/api.ts` | Klient-side API-helpers: logTitle, removeTitle, toggleFavorite, updateProgress, fetchLists, createList, addToList, submitFeedback, addExclusion, fetchLinks, createInvite, etc. |
| `src/lib/auth.ts` | Auth-helpers: getUser(), requireUser() |
| `src/lib/types.ts` | Alle TypeScript-typer: UserTitle, TitleCache, Recommendation, SharedList, ContentFilters, etc. |
| `src/lib/supabase-server.ts` | Server-side Supabase: createSupabaseServer(), createSupabaseAdmin() |
| `src/lib/supabase-browser.ts` | Klient-side Supabase: createSupabaseBrowser() |
| `src/lib/cache-title.ts` | Automatisk caching av TMDB-data i Supabase |
| `src/lib/filter-presets.ts` | Forhåndsinstilte innholdsfiltre (ekskluder anime, asiatisk, bollywood, etc.) |
| `src/lib/guest-actions.ts` | Sporing av gjeste-handlinger i localStorage |
| `src/lib/guest-migration.ts` | Migrering av gjeste-data til bruker ved registrering |

### API-ruter

| Rute | Metode | Beskrivelse |
|------|--------|-------------|
| `/api/auth/callback` | GET | Supabase auth callback etter e-postbekreftelse |
| `/api/log` | POST/PATCH/DELETE | Logg, oppdater, slett titler |
| `/api/recommendations` | GET | AI-anbefalinger basert på bibliotek |
| `/api/taste-summary` | GET/POST | Hent/generer smaksprofil |
| `/api/feedback` | POST | Lagre feedback på anbefalinger |
| `/api/exclusions` | GET/POST/DELETE | Håndter ekskluderinger |
| `/api/lists` | GET/POST | Hent/opprett lister |
| `/api/lists/[id]` | GET/DELETE/PATCH | Håndter enkeltliste |
| `/api/lists/[id]/items` | POST/DELETE | Legg til/fjern titler fra liste |
| `/api/shared-lists` | GET | Hent delte lister fra venner |
| `/api/friends/titles` | GET | Vennenes tittel-overlapp |
| `/api/links` | GET/POST/PATCH/DELETE | Kontokoblinger |
| `/api/profile` | GET/PATCH | Brukerprofil |
| `/api/export` | GET | Eksporter brukerdata |
| `/api/trakt/connect` | GET | Start Trakt OAuth |
| `/api/trakt/callback` | GET | Trakt OAuth callback |
| `/api/trakt/sync` | POST | Synkroniser med Trakt |
| `/api/tmdb/search` | GET | TMDB søk |
| `/api/tmdb/discover` | GET | TMDB discover + sjangre + leverandører |
| `/api/tmdb/details` | GET | TMDB titteldetaljer |
| `/api/tmdb/providers` | GET | Strømmeleverandører |
| `/api/tmdb/person` | GET | Skuespiller-søk og credits |
| `/api/wt-beta/posters` | GET | WT Beta poster-data |
| `/api/guest/migrate` | POST | Migrer gjeste-data |
| `/api/ai-test` | POST | Test AI-tilkobling |

---

## Designsystem (CSS-variabler)

**Bakgrunn:** `--bg-base: #06080f`, `--bg-elevated: #0c1022`, `--bg-surface: #111627`
**Aksent:** `--accent: #ff2a2a` (rød), `--accent-light: #ff6b6b`
**Glass:** `rgba(15, 20, 40, 0.6)` med 20px blur, 6% hvit border
**Tekst:** Primary `#eef0f6`, Secondary `#8b8fa8`, Tertiary `#565b73`
**Status:** Grønn `#34d399`, Rød `#f87171`, Gul `#fbbf24`
**Border-radius:** sm 8px, md 12px, lg 16px, xl 20px
**Animasjoner:** fade-in-up, stagger (50ms mellom barn), shimmer (skeleton), glow-pulse
**Utility-klasser:** `.glass`, `.glass-strong`, `.btn-press`, `.card-lift`, `.skeleton`, `.gradient-text`, `.stagger`, `.no-scrollbar`

---

## Supabase-tabeller (utledet fra kode)

| Tabell | Beskrivelse |
|--------|-------------|
| `profiles` | Brukerprofil: display_name, exploration_slider, taste_summary, content_filters |
| `user_titles` | Brukerens titler: tmdb_id, type, status, sentiment, rating, note, favorite, progress |
| `user_exclusions` | Ekskluderte titler fra anbefalinger |
| `user_feedback` | Feedback på anbefalinger (like_suggestion, not_for_me) |
| `titles_cache` | TMDB-data cache: tittel, sjangre, poster, rating, etc. |
| `custom_lists` | Egendefinerte lister |
| `custom_list_items` | Titler i lister |
| `account_links` | Kontokoblinger mellom brukere (invitasjonskoder) |

---

## Rutebeskyttelse (middleware.ts)

- **Offentlig (ingen auth):** `/login`, `/privacy`, `/terms`, `/contact`, `/api/auth/*`
- **Gjeste-tilgang:** `/search`, `/wt-beta`, `/api/tmdb/*`, `/api/wt-beta/posters`
- **Beskyttet (krever innlogging):** Alt annet
- Innloggede brukere som besøker `/login` → redirect til `/library`
