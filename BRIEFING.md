# Logflix — BRIEFING for Claude.ai

> Denne filen er IKKE for kode-agenten (se CLAUDE.md). Den er kun til ekstern AI-assistent for rask kontekst uten kodebase-tilgang.

## Sist oppdatert
**03.04.2026**

## Git-status
- **Siste push:** `fix: mobile UX — stack WT banner, horizontal scroll touch isolation, premium 2x2 grid` (03.04.2026)
- **Committed men ikke pushet:** ingen
- **Branch:** main

## Hva er gjort nylig (siste 10 endringer)

1. [pushet] **Mobile UX-fikser** — (a) Watch Together-banner på home stacker nå vertikalt på mobil så CTA-knappen ikke kuttes av. (b) Alle horisontale scroll-rader (home, library, search, compare, StreamingModal, AnimatedTabs) har nå `touchAction: pan-x` + `overscrollBehaviorX: contain` slik at horisontale swipes kun scroller kortene, ikke hele siden. (c) Premium feature-grid er nå 2×2 på mobil, 4 kolonner på desktop. (d) Dev-server eksponert på LAN med `--hostname 0.0.0.0 --webpack`.
2. [pushet] **VSCode extensions config** — `.vscode/extensions.json` med ESLint, Tailwind, Prettier, GitLens.
3. [pushet] **Cache-buster på icon-URLer i manifest** — Fikser manifest.json icon-caching.
4. [pushet] **Screenshots i manifest.json** — For PWABuilder/App Store.
5. [pushet] **Oppdaterte app-ikoner** — Ny farge.
6. [pushet] **Manifest.json synlig for PWABuilder** — Middleware bypass + headers + relative paths.
7. [pushet] **Apple Store compatible manifest.json** — Spec-compliant.
8. [pushet] **PWA screenshots i manifest.json**.
9. [pushet] **Manifest.json spec-compliant per MDN** — Separate purpose, add id/scope.
10. [pushet] **Manifest.json for PWABuilder og App Store**.

## Tilstand per modul

- **/together (Se Sammen):** ✅ Stabil. Tinder-sveip for par, Solo→Duo upgrade (CTA etter 3 swipes, solo-swipes replayed til par-sesjon), QR-deling, provider-filtrering, match-deling med rik OG-image. Ingen konto nødvendig.
- **/group:** ✅ Stabil. Multi-person avstemning (3+), flere runder.
- **/api:** ✅ Fungerer. Alle ruter har feilhåndtering. Backfill-endepunkter beskyttet med `BACKFILL_SECRET`.
- **/api/curator:** ✅ Fungerer. Rate limiting (10 req/60s).
- **SEO / middleware:** ✅ Fikset. Alle 4 regioner rewritet korrekt. ISR 24t. 3 JSON-LD schemas. SeoPageTracker → PostHog.
- **Premium / Stripe:** ✅ Stabil. 29 kr/mnd Founding Member. Server-side enforcement.
- **Lokalisering:** ✅ 5 språk (no, se, dk, fi, en). 22 stemningsguider × 4 regioner = 88 guide-sider + 4 hub-sider.
- **Analytics / PostHog:** ✅ Integrert app-wide.
- **Settings:** ✅ Stabil.
- **Mobile UX:** ✅ Forbedret — horisontal scroll touch-isolert, WT-banner stacker på mobil, premium-grid responsive.

## Åpne TODOs

Ingen eksplisitte TODO/FIXME i kodebasen.

## Kjente svakheter og teknisk gjeld

### Høy prioritet
- **Turbopack kræsjer på Windows** — Dev-server bruker `--webpack` som workaround. Turbopack gir "failed to create whole tree" panic.

### Medium prioritet
- **13+ console.log i produksjonskode** — Spesielt `buildWtDeck()` i `wt-titles.ts` har 9 stk. Bør fjernes.
- **Fire-and-forget promises uten logging** — `sendWelcomeEmail().catch(() => {})` etc. Feiler lydløst.
- **Localhost-fallback i trigger-cron** — Bør kaste error i produksjon.
- **Unsafe `any` type** — `(providersData as any)` i curator/route.ts.

### Lav prioritet
- **Ingen øvre grense på paginering** — Admin-sider godtar vilkårlig høy `page`.
- **PostHog hardkodet dato** — `defaults: '2026-01-30'` i `lib/posthog.ts`.
- **Error boundaries bruker `console.error`** — 3 error.tsx-filer.
- **Cache-invalidering udokumentert**.
- **Supabase CLI ikke installert** — Trengs via Scoop/Winget for migrasjoner.

## Neste prioriteter

1. **Rydd console.log fra wt-titles.ts** — 9 debug-linjer i produksjon.
2. **Legg til logging på fire-and-forget promises**.
3. **Flytt admin-email hardkoding i klient**.
4. **Fjern localhost-fallback i trigger-cron**.
5. **Type-safe providers i curator**.
