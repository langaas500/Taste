# Logflix — BRIEFING for Claude.ai

> Denne filen er IKKE for kode-agenten (se CLAUDE.md). Den er kun til ekstern AI-assistent for rask kontekst uten kodebase-tilgang.

## Sist oppdatert
**12.03.2026**

## Git-status
- **Siste push:** `31faba3 feat: dynamisk OG-image for tittelsider via @vercel/og` (12.03.2026)
- **Committed men ikke pushet:** ingen
- **Branch:** main

## Hva er gjort nylig (siste 10 endringer)

1. [pushet] **Dynamisk OG-image for tittelsider** — Ny edge API-route `/api/og/title` genererer 1200x630 OG-bilde med poster-bakgrunn, mørk overlay, tittel, år, TMDB-rating og Logflix-branding. Movie + TV page metadata peker nå hit istedenfor rå TMDB-poster.
2. [pushet] **Dynamisk OG-image for Wrapped** — Ny edge API-route `/api/og/wrapped` genererer 1200x630 OG-bilde med @vercel/og. Viser antall filmer, topp-sjanger, måned/år og brukernavn. Mørkt design med rød glow. layout.tsx injiserer og:image metadata for alle wrapped/[month]-sider.
2. [pushet] **WatchAction JSON-LD schema** — Alle tittelsider (movie + TV) har nå Movie/TVSeries schema med AggregateRating og WatchAction. Strømmetjenester mappes til availableChannel. Utelater potentialAction hvis ingen flatrate-providers. Gir potensielt Watch-knapp i Google-søkeresultater.
2. [pushet] **Personvern, curator rate limit, admin-email** — Personvernsiden nevner nå PostHog. Curator har rate limiting (10 req/60s). ADMIN_EMAILS i env.ts for API-ruter.
3. [pushet] **Sitemap-optimalisering** — Redusert fra 8 til 2 DB-queries for titles-index. Eliminerer timeout-risiko på Vercel cold-start.
4. [pushet] **Middleware rewrite alle 4 regioner** — Regex utvidet fra kun `/no/` til `(?:no|dk|fi|se)`. 75% av SEO-sider var 404.
5. [pushet] **Duplikatkode slettet (~506 linjer)** — Separate page-filer per region fjernet. Konsolidert til `[region]`-parameter under `/seo-titles/`.
6. [pushet] **Curator viser personlig grunn** — Hver anbefaling inkluderer personlig grunn tilpasset smak. Filmkortene forenklet.
7. [pushet] **Curator filtrerer utilgjengelige titler** — Kun titler med strømmetjeneste i brukerens region vises.
8. [pushet] **Påskekrim-guider i sitemap** — Full hreflang for alle 4 regioner.
9. [pushet] **tmdbSearch-fix** — Returnerte objekt istedenfor array, Curator filmkort krasjet.
10. [pushet] **Curator-modell oppdatert** — `claude-haiku-4-5-20251001` med korrekt anthropic-version header.

## Tilstand per modul

- **/together (Se Sammen):** ✅ Stabil. Tinder-sveip for par, Solo→Duo upgrade (CTA etter 3 swipes, solo-swipes replayed til par-sesjon), QR-deling, provider-filtrering. Ingen konto nødvendig.
- **/group:** ✅ Stabil. Multi-person avstemning (3+), flere runder.
- **/api:** ✅ Fungerer. Alle ruter har feilhåndtering. Backfill-endepunkter beskyttet med `BACKFILL_SECRET`.
- **/api/curator:** ✅ Fungerer. Rate limiting lagt til (10 req/60s).
- **SEO / middleware:** ✅ Fikset. Alle 4 regioner rewritet korrekt. ISR 24t. 3 JSON-LD schemas (FAQPage, BreadcrumbList, Movie/TVSeries+WatchAction). SeoPageTracker sender `seo_page_view` til PostHog.
- **Premium / Stripe:** ✅ Stabil. 29 kr/mnd Founding Member. Server-side enforcement: `FREE_REC_LIMIT = 5` i recommendations/route.ts, 5 Curator-meldinger, blurret smaksprofil.
- **Lokalisering:** ✅ 5 språk (no, se, dk, fi, en). 21 stemningsguider × 4 regioner = 84 lokaliserte guide-sider.
- **Analytics / PostHog:** ✅ Integrert app-wide via PostHogProvider i root layout. SeoPageTracker på alle titelsider. Personvernsiden oppdatert til å nevne PostHog.
- **Settings:** ✅ Stabil. Vennekoblinger, region, strømmetjenester, eksport, Trakt-kobling.

## Åpne TODOs

Ingen eksplisitte TODO/FIXME i kodebasen (kun `placeholder="XXXXXX"` i settings-input, som er tilsiktet).

## Kjente svakheter og teknisk gjeld

### Høy prioritet
- ~~**Personvernsiden** — ✅ Fikset (264a9aa)~~
- ~~**Curator rate limiting** — ✅ Fikset (264a9aa)~~
- ~~**Admin-email** — ✅ Delvis fikset (264a9aa) — API-ruter bruker env.ts, klient-side har fortsatt hardkoding~~

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

1. **Rydd console.log fra wt-titles.ts** — 9 debug-linjer som forurenser produksjonslogger ved hver sesjon.
2. **Legg til logging på fire-and-forget promises** — `.catch((e) => logger.error(...))` istedenfor `.catch(() => {})`.
3. **Flytt admin-email hardkoding i klient** — `admin/page.tsx` bruker fortsatt hardkodet email.
4. **Fjern localhost-fallback i trigger-cron** — Bør kaste error i produksjon.
5. **Type-safe providers i curator** — Fjern `as any` cast.
