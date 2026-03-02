# CLAUDE.md — Logflix (Feb 2026)

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
- Anthropic API (AI)
- Trakt.tv (import)
- Deploy: Vercel (logflix.app)

---

## Struktur

src/
  app/
    (app)/        # Auth-beskyttede sider
    api/          # API-routes (kritisk kode)
    together/     # Se Sammen (guest-tilgang via X-WT-Guest-ID)
    page.tsx
  lib/            # tmdb.ts, ai.ts, auth.ts, supabase-server/browser
  components/
  hooks/
  middleware.ts

---

## Auth

Server:
- requireUser()  → kaster "Unauthorized"
- getUser()      → returnerer null

WT bruker `getWtUserId()` som aksepterer både auth-bruker og gjest (via `X-WT-Guest-ID` header).
Partner trenger ikke konto — senker terskel for deling.

---

## Supabase-klienter

- createSupabaseServer()   → cookies + anon key
- createSupabaseAdmin()    → service role (bypasser RLS)
- createSupabaseBrowser()  → klient

---

## Nøkkeltabeller

profiles
user_titles → UNIQUE(user_id, tmdb_id, type)
titles_cache → UNIQUE(tmdb_id, type)
wt_sessions → match_tmdb_id settes én gang
wt_session_swipes → UNIQUE(session_id, user_id, tmdb_id, media_type)

### Naming

- titles_cache bruker kolonnen "type"
- wt_session_swipes bruker kolonnen "media_type"
- Cache-dedupe key skal alltid være: `${tmdb_id}:${type}`

### Sentiment-verdier

DB bruker: `"liked"`, `"neutral"`, `"disliked"` — ALDRI `"ok"` (tidligere bug).

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
- `withConcurrency(items, n, fn)` i `lib/trakt/sync` — no-deps promise pool
- `safeParseJson<T>(raw)` i `lib/ai.ts` — aldri rå `JSON.parse()` på AI-output
- `requireUser()` i `lib/auth.ts` — kaster "Unauthorized" hvis ikke innlogget
- `createSupabaseAdmin()` — kun for server-side med service role

---

## Cache-regler

- titles_cache deduplikeres på (tmdb_id, type)
- Ingen cache-berikelse uten concurrency-limit
- Bulk upsert etter fetch

---

## Git

Commit gjerne underveis etter logiske enheter.
Push KUN når brukeren eksplisitt ber om det.

---

## Database-migrasjoner

Nye tabeller eller kolonner → lag fil `supabase/migrations/NNN_navn.sql`.
Bruk `IF NOT EXISTS` og `DO $$ BEGIN IF NOT EXISTS ... END $$` for policies.
Push til remote med: `npx supabase db push`

---

## Design

Mørkt filmtema.
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
