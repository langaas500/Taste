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