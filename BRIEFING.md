# Logflix — BRIEFING for Claude.ai

> Denne filen er IKKE for kode-agenten (se CLAUDE.md). Den er kun til ekstern AI-assistent for rask kontekst uten kodebase-tilgang.

## Sist oppdatert
**11.03.2026 ca. 15:00**

## Git-status
- **Siste push:** `a7ea5b8 perf: sitemap titles-index — 2 DB-queries istedenfor 8` (11.03.2026)
- **Committed men ikke pushet:** ingen
- **Branch:** main

## Hva er gjort nylig (siste 10 endringer)

1. [pushet] **Sitemap-optimalisering** — Redusert fra 8 til 2 DB-queries for titles-index. Tidligere kjørte sitemap én query per region × type (4×2=8), nå telles titler én gang per type og gjenbrukes. Eliminerer timeout-risiko på Vercel cold-start.
2. [pushet] **Middleware rewrite alle 4 regioner** — Regex utvidet fra kun `/no/` til `(?:no|dk|fi|se)`. Før denne fixen var 75% av SEO-titelsider (dk, fi, se) 404 — kun norske sider fungerte.
3. [pushet] **Duplikatkode slettet (~506 linjer)** — Separate page-filer per region (`[region]/movie/[slug]/page.tsx` + `[region]/tv/[slug]/page.tsx`) fjernet. Alt konsolidert til én dynamisk `[region]`-parameter under `/seo-titles/`.
4. [pushet] **Curator viser personlig grunn** — Hver anbefaling i Curator-chatten inkluderer nå en personlig grunn tilpasset brukerens smak. Filmkortene er forenklet.
5. [pushet] **Curator filtrerer utilgjengelige titler** — Kun titler med minst én strømmetjeneste i brukerens region returneres. Brukere ser ikke lenger anbefalinger de ikke kan se.
6. [pushet] **Påskekrim-guider i sitemap** — Full hreflang for alle 4 regioner med regionsspesifikke slugs (paskekrim/paskkrim/paasiainen-dekkari).
7. [pushet] **robots.ts → /api/sitemap** — Peker nå til dynamisk API-endepunkt istedenfor statisk fil.
8. [pushet] **tmdbSearch-fix** — `tmdbSearch()` returnerte `{results:[]}` men ble brukt som array. Curator filmkort krasjet. Fikset til å returnere array direkte.
9. [pushet] **parseAIResponse-fix** — Håndterer nå både `string[]` og `{query,type}[]` fra AI-svar, da modellen var inkonsistent i output-format.
10. [pushet] **Curator-modell oppdatert** — Byttet til `claude-haiku-4-5-20251001` med korrekt `anthropic-version: 2023-06-01` header.

## Tilstand per modul

- **/together (Se Sammen):** ✅ Stabil. Tinder-sveip for par, Solo→Duo upgrade (CTA etter 3 swipes, solo-swipes replayed til par-sesjon), QR-deling, provider-filtrering. Ingen konto nødvendig.
- **/group:** ✅ Stabil. Multi-person avstemning (3+), flere runder.
- **/api:** ✅ Fungerer. Alle ruter har feilhåndtering. Backfill-endepunkter beskyttet med `BACKFILL_SECRET`.
- **/api/curator:** ⚠️ Fungerer, men mangler rate limiting (alle andre AI-endepunkter har det).
- **SEO / middleware:** ✅ Fikset. Alle 4 regioner rewritet korrekt. ISR 24t. FAQ-schema + mood tags + curator-hooks. SeoPageTracker sender `seo_page_view` til PostHog.
- **Premium / Stripe:** ✅ Stabil. 29 kr/mnd Founding Member. Server-side enforcement: `FREE_REC_LIMIT = 5` i recommendations/route.ts, 5 Curator-meldinger, blurret smaksprofil.
- **Lokalisering:** ✅ 5 språk (no, se, dk, fi, en). 21 stemningsguider × 4 regioner = 84 lokaliserte guide-sider.
- **Analytics / PostHog:** ⚠️ Integrert app-wide via PostHogProvider i root layout. SeoPageTracker på alle titelsider. MEN: Personvernsiden (`privacy/page.tsx`) hevder "Bruker ingen analyseverktøy" — dette er utdatert/feil.
- **Settings:** ✅ Stabil. Vennekoblinger, region, strømmetjenester, eksport, Trakt-kobling.

## Åpne TODOs

Ingen eksplisitte TODO/FIXME i kodebasen (kun `placeholder="XXXXXX"` i settings-input, som er tilsiktet).

## Kjente svakheter og teknisk gjeld

### Høy prioritet
- **Personvernsiden lyver om analytics** — `privacy/page.tsx` sier "Bruker ingen analyseverktøy" mens PostHog er aktiv på hele appen. Må oppdateres eller PostHog fjernes. Juridisk risiko.
- **Curator mangler rate limiting** — `/api/curator` gjør Anthropic API-kall uten `applyRateLimit()`. Alle andre AI-endepunkter (recommendations, taste-summary) har dette. Risiko: API-kvote kan brennes.
- **Hardkodet admin-email i 3 filer** — `martinrlangaas@protonmail.com` er definert separat i `admin/page.tsx`, `trigger-cron/route.ts` og `stats/route.ts`. Bør flyttes til env-variabel.

### Medium prioritet
- **13+ console.log i produksjonskode** — Spesielt `buildWtDeck()` i `wt-titles.ts` har 9 stk som kjører for hver Se Sammen-sesjon. Bør fjernes eller gå via logger.
- **Fire-and-forget promises uten logging** — `sendWelcomeEmail().catch(() => {})` i auth callback, `sendMatchReminderEmail().catch(() => {})` i email-capture. Feiler lydløst uten spor.
- **Localhost-fallback i trigger-cron** — `"http://localhost:3000"` som fallback hvis env-variabler mangler. Bør kaste error i produksjon.
- **Unsafe `any` type** — `(providersData as any)` i curator/route.ts med eslint-disable. Bør types korrekt mot TMDB-respons.

### Lav prioritet
- **Ingen øvre grense på paginering** — Admin-sider godtar vilkårlig høy `page`-parameter (kan gi tung OFFSET-query).
- **PostHog hardkodet dato** — `defaults: '2026-01-30'` i `lib/posthog.ts`, uklar hensikt.
- **Error boundaries bruker `console.error`** — 3 error.tsx-filer (root, together, group) går utenom logger-abstraksjonen.
- **Cache-invalidering udokumentert** — titles_cache oppdateres via fire-and-forget upsert, ingen eksplisitt invalidering ved dataendringer. ISR 24t dekker de fleste tilfeller.

## Neste prioriteter

Basert på faktisk kode og åpne svakheter:

1. **Fiks personvernsiden** — Enten oppdater teksten til å nevne PostHog, eller fjern PostHog. Juridisk risiko.
2. **Legg til rate limiting på Curator** — 2 linjer kode (`applyRateLimit("curator", user.id)`), beskytter Anthropic-kvote.
3. **Flytt ADMIN_EMAILS til env.ts** — Fjern hardkoding fra 3 filer, bruk `env.ADMIN_EMAILS`.
4. **Rydd console.log fra wt-titles.ts** — 9 debug-linjer som forurenser produksjonslogger ved hver sesjon.
5. **Legg til logging på fire-and-forget promises** — `.catch((e) => logger.error(...))` istedenfor `.catch(() => {})`.
