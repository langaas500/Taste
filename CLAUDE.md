# CLAUDE.md — Logflix (Mars 2026)

## 🎯 Fokus
Se Sammen er hovedproduktet.
Stabilitet, kostkontroll og dataintegritet går foran nye features.
Ingen redesign eller feature creep uten eksplisitt beskjed.
Foretrekk minimal diff – endre så lite som mulig.

---

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (Auth, Postgres, RLS)
- TMDB API (filmdata)
- Anthropic API (AI) — bruk claude-sonnet-4-5-20250929
  - Note: ai.ts also references gpt-4o-mini as a cheap fallback for specific low-stakes calls — this is intentional.
- Trakt.tv (import)
- Deploy: Vercel (logflix.app)

---

## Struktur

src/
  app/
    (app)/        # Auth-beskyttede sider
      admin/      # Admin dashboard (kun martinrlangaas@protonmail.com)
      wrapped/    # Yearly wrapped (eksisterende)
      profile/    # Brukerprofil
    api/          # API-routes (kritisk kode)
      admin/      # Admin stats + cron trigger
      backfill-slugs/
      backfill-providers/
      cron/generate-metadata/
      wrapped-monthly/
      sitemap/titles/
    together/     # Se Sammen (guest-tilgang via X-WT-Guest-ID)
    wrapped/      # Monthly wrapped (public, shareable)
    seo-titles/   # Nordic SEO title pages (public)
      [region]/movie/[slug]/
      [region]/tv/[slug]/
    [region]/     # Region layout + static SEO guides
    page.tsx
  lib/
    tmdb.ts       # tmdbFetch, parseTitleFromTMDB, tmdbWatchProviders
    ai.ts         # callAI, safeParseJson
    auth.ts       # requireUser, getUser
    slug.ts       # buildSlug, parseSlug
    supabase-server/browser
  components/
    TitlePageContent.tsx  # REGION_TEXT map — all Nordic UI strings
  hooks/
  middleware.ts

---

## Auth

Server:
- requireUser()  → kaster "Unauthorized"
- getUser()      → returnerer null

WT bruker `getWtUserId()` som aksepterer både auth-bruker og gjest (via `X-WT-Guest-ID` header).
Partner trenger ikke konto — senker terskel for deling.

Admin: hardkodet email-sjekk mot `martinrlangaas@protonmail.com`

---

## Supabase-klienter

- createSupabaseServer()   → cookies + anon key (auth-beskyttede sider)
- createSupabaseAdmin()    → service role (bypasser RLS) — bruk i SEO-sider og backfill
- createSupabaseBrowser()  → klient

⚠️ ALDRI bruk createSupabaseServer() i seo-titles/ eller backfill-routes — disse er statiske/public og cookies() vil krasje ISR.

---

## Nøkkeltabeller

profiles
user_titles → UNIQUE(user_id, tmdb_id, type)
titles_cache → UNIQUE(tmdb_id, type)
  - slug TEXT (UNIQUE per type)
  - curator_hook, curator_body, curator_verdict TEXT
  - mood_tags TEXT[]
  - backfill_status TEXT ('pending'|'processing'|'completed'|'failed')
wt_sessions → match_tmdb_id settes én gang
wt_session_swipes → UNIQUE(session_id, user_id, tmdb_id, media_type)
watch_providers_cache → UNIQUE(tmdb_id, type, country)

### Naming

- titles_cache bruker kolonnen "type"
- wt_session_swipes bruker kolonnen "media_type"
- Cache-dedupe key skal alltid være: `${tmdb_id}:${type}`

### Sentiment-verdier

DB bruker: `"liked"`, `"neutral"`, `"disliked"` — ALDRI `"ok"` (tidligere bug).

---

## SEO Title Pages

- Gyldige regioner: `["no", "dk", "fi", "se"]`
- Middleware rewriter `/no/(movie|tv)/[slug]` → `/seo-titles/no/...` (unngår kollisjon med statisk /no/ mappe)
- ISR: `revalidate = 86400` (24 timer)
- All UI-tekst bruker `REGION_TEXT` map i `TitlePageContent.tsx`
- FAQ-schema, metadata og provider-tekst er fullt lokalisert per region
- Bruk ALLTID `createSupabaseAdmin()` i disse sidene — aldri `createSupabaseServer()`

### Mood Tags Whitelist (25 tags)
Håndheves i cron-ruten. Se `src/app/api/cron/generate-metadata/route.ts` for full liste.
Kategorier: Stemning, Sesong, SEO/nisje (inkl. "Nordic Noir", "Skjult skatt", "Påskekrim" etc.)

---

## Backfill Endpoints

Alle beskyttet med `x-backfill-secret` header (BACKFILL_SECRET env var).

- `POST /api/backfill-slugs?limit=500` — genererer slugs for titles_cache
- `POST /api/backfill-providers?type=movie|tv&fromPage=1&toPage=5` — henter Nordic provider-data fra TMDB
- `POST /api/cron/generate-metadata` — genererer curator-innhold via Anthropic Sonnet (20 titler per kjøring, lock-mekanisme)

---

## API-regler (kritisk)

1️⃣ Ingen N+1
- Ingen per-row SELECT i loops
- Ingen per-row DB upsert i loops
- Bruk bulk upsert i chunks (25–100)

2️⃣ Ingen full-table scans i API-routes
- Bruk limit, range eller cursor
- Clamp alltid input

3️⃣ Bounded runtime
- API-routes må returnere raskt
- Ingen "prosessér hele databasen" i én request

4️⃣ Ekstern API-kall
- Bruk concurrency-limit
- TMDB 429 håndteres i tmdbFetch()

5️⃣ Feilhåndtering (standard pattern)

catch (e: unknown) {
  const msg = e instanceof Error ? e.message : "Error";
  if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
  return NextResponse.json({ error: msg }, { status: 500 });
}

Ingen API-route skal krasje på JSON.parse.

---

## Nøkkelhelpers (bruk disse — ikke finn opp egne)

- `tmdbFetch(url)` i `lib/tmdb.ts` — validerer TMDB_API_KEY, retry på 429 med backoff
- `parseTitleFromTMDB(raw, type)` i `lib/tmdb.ts` — parser TMDB data til DB-format
- `buildSlug(title, tmdbId)` i `lib/slug.ts` — genererer URL-safe slug
- `parseSlug(slug)` i `lib/slug.ts` — ekstraherer tmdb_id fra slug
- `withConcurrency(items, n, fn)` i `lib/trakt/sync` — no-deps promise pool
- `safeParseJson<T>(raw)` i `lib/ai.ts` — aldri rå `JSON.parse()` på AI-output
- `requireUser()` i `lib/auth.ts` — kaster "Unauthorized" hvis ikke innlogget
- `createSupabaseAdmin()` — kun for server-side med service role
- `REGION_TEXT` i `components/TitlePageContent.tsx` — all lokalisert UI-tekst for no/dk/fi/se

---

## Cache-regler

- titles_cache deduplikeres på (tmdb_id, type)
- watch_providers_cache deduplikeres på (tmdb_id, type, country)
- Ingen cache-berikelse uten concurrency-limit
- Bulk upsert etter fetch

---

## Git

Commit gjerne underveis etter logiske enheter.
Push KUN når brukeren eksplisitt ber om det.

---

## Database-migrasjoner

Nye tabeller eller kolonner → lag fil `supabase/migrations/NNN_navn.sql`.
Neste migrasjon: `021_...`
Bruk `IF NOT EXISTS` og `DO $$ BEGIN IF NOT EXISTS ... END $$` for policies.
Push til remote med: `npx supabase db push`

---

## Design

Mørkt filmtema. Logflix Red: #E50914.
Glassmorphism: `bg-white/5 backdrop-blur-3xl border border-white/10`
Ingen redesign uten eksplisitt beskjed.

---

## Environment

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TMDB_API_KEY
ANTHROPIC_API_KEY
TRAKT_CLIENT_ID
TRAKT_CLIENT_SECRET
BACKFILL_SECRET

---

## Output-formattering

**Copyable content rule:**
Whenever you produce content that the user is meant to copy, use, or reference — including file contents, reports, lists, configurations, scripts, prompts, or any structured output — always wrap it in a fenced code block in the chat. Never use file downloads or present_files for this. The code block must contain the complete content so the user can copy it directly. Do not split content across multiple blocks unless absolutely necessary. This applies to all output types, not just code.

---

## Viktig

Hvis en endring:
- kan påvirke produksjonsdata
- kan bryte API-kontrakter
- kan skape timeout-risiko
- eller endrer auth-modellen

→ STOPP og forklar før implementering.

---

## Logflix — Produktoversikt for samarbeidspartnere (11.03.2026)

**logflix.app** — Nordisk plattform for filmlogging, AI-anbefalinger og sosial filmoppdagelse.

### 1. Se Sammen (Watch Together)
- **URL:** /together — Krever ikke innlogging
- Tinder-stil sveipematch for par og venner
- Opprett sesjon → del QR/lenke → sveip uavhengig → gjensidig like = match
- Runde 1: 25 titler (2 min), Runde 2: 15 titler (1 min), 3 superlikes per runde
- Filtrer på strømmetjeneste (Netflix, HBO Max, Disney+, Viaplay, TV 2 Play m.fl.)
- **Solo → Duo:** Start alene, sveip solo, inviter partner underveis (CTA etter 3 swipes). Solo-swipes overføres automatisk til par-sesjonen.
- **Gratis:** Ubegrenset, ingen konto nødvendig

### 2. Gruppevalg (Group Watch)
- **URL:** /group — Krever ikke innlogging
- Samme konsept som Se Sammen, men for 3+ personer med flere avstemningsrunder
- **Gratis**

### 3. Bibliotek & Logg
- **URL:** /library — Krever innlogging
- Sett (med sentiment ★/likt/nøytral/mislikt), Filmebank (episode-tracking), Watchlist, Lister
- Filtrering: genre, år, type, sortering
- **Gratis**

### 4. Søk & Oppdagelse
- **URL:** /search — Gjest-tilgang (begrenset)
- Tekstsøk mot TMDB (800 000+ titler)
- Avansert: genre, strømmetjeneste, årstall, skuespiller-filmografi
- Discovery-rader (trending, populært)
- **Gratis**

### 5. AI-anbefalinger
- **URL:** /recommendations — Krever innlogging
- Personaliserte AI-anbefalinger basert på bibliotek, sveip-gjennom
- **Gratis: 5 stk (server-side enforced) | Premium: Ubegrenset**

### 6. Curator (AI Film-rådgiver)
- **URL:** /curator — Krever innlogging
- Chat-basert AI-filmekspert med filmkort, personlig grunn, strømmeinfo per land
- Filtrerer bort titler uten tilgjengelig strømmetjeneste i brukerens region
- **Gratis: 5 meldinger | Premium: Ubegrenset**

### 7. Smaksprofil
- **URL:** /taste — Krever innlogging
- AI-generert analyse: "Du liker", "Du unngår", "Tempo & Tone"
- **Gratis: Forhåndsvisning (blurret) | Premium: Full profil**

### 8. Import
- **URL:** /timemachine — Krever innlogging
- Netflix CSV, Trakt.tv OAuth — bulk-import til bibliotek
- **Gratis**

### 9. Wrapped (Månedsrapport)
- **URL:** /wrapped — Offentlig, delbar
- Månedlig oppsummering: titler, genre, sentiment, skuespiller/regissør
- **Gratis**

### 10. Venner & Sosialt
- Aktivitetsstrøm (/activity), Sammenlign smak (/compare), Delte lister (/shared)
- Vennekoblinger via /settings
- **Gratis**

### 11. Statistikk
- **URL:** /stats — Krever innlogging
- Totalt sett, film vs. serie, sentiment, topp genre, gjennomsnittsvurdering
- **Gratis**

### 12. Strømmetjeneste-info
- Integrert overalt: søk, bibliotek, Curator, SEO-sider
- Viser hvor du kan se hver tittel per nordisk land
- Netflix, HBO Max, Disney+, Apple TV+, Prime Video, Viaplay, TV 2 Play, Paramount+
- **Gratis**

### 13. SEO-titelsider (Nordisk)
- **URL:** /no/movie/[slug], /se/tv/[slug], /dk/..., /fi/...
- Offentlige, ISR (24t), fullt lokalisert (nb/sv/da/fi)
- Handling, cast, strømmetjenester, mood tags, FAQ-schema, curator-hooks
- **PostHog-tracking:** SeoPageTracker sender `seo_page_view` med tittel-ID, slug, region og referrer
- **Gratis**

### 14. Stemningsguider (21 guider × 4 regioner = 84 sider)
- **URL:** /no/guides/[slug] (+ /se/, /dk/, /fi/)
- Perfekt for fredagskveld, Se alene i mørket, Filmkveld for to, Krever full oppmerksomhet, Lett og morsom, Tung og tankevekkende, Bra for hele familien, Sen kveld alene, Imponér gjestene, Hyttekveld, Sommerkveld, Reisefilm, Halloweenkveld, Grøssere, Familiekos, Barnefilm, Basert på en sann historie, Kort og konsist, Visuelt mesterverk, Nostalgisk perle, Skjult skatt, Påskekrim
- **Gratis**

### 15. Premium-modell
- **Pris:** 29 kr/mnd (Founding Member) via Stripe
- Alt gratis unntatt: AI-anbefalinger (5 → ubegrenset), Curator (5 → ubegrenset), Smaksprofil (blurret → full)

### 16. Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind
- Supabase (PostgreSQL + RLS + Auth)
- TMDB API, Anthropic Claude Sonnet, Trakt.tv OAuth, Stripe
- Vercel hosting, PostHog analytics
- 5 språk (no, se, dk, fi, en), 4 nordiske regioner

---

## BRIEFING.md — Rapport til Claude.ai

BRIEFING.md er en kontekstfil i rooten som holdes oppdatert for bruk i Claude.ai-samtaler.
Claude Code skal IKKE lese denne filen selv — den er kun for ekstern bruk.

### Regler:
- Oppdater BRIEFING.md automatisk etter hver arbeidsøkt
- Oppdater den også etter hver commit og hver push
- Filen skal alltid reflektere faktisk tilstand — ikke planer eller antagelser
- Skill tydelig mellom hva som er live (pushet) og hva som er committed men ikke pushet