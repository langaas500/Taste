# Implementer "Åpne i Netflix" med Smart Deep Linking

Du skal bygge et to-lags deep link-system: direkte tittel-link via Wikidata Netflix-IDer, med søke-URL som fallback. Jeg er borte — IKKE spør meg noe.

---

## STEG 0: FORSTÅ PROSJEKTET

Før du skriver kode, les og forstå:
- `src/components/StreamingModal.tsx` — her vises strømmeleverandører. DETTE er hovedstedet for knappen.
- `src/app/api/tmdb/providers/route.ts` — hvordan TMDB watch providers hentes
- `src/app/api/tmdb/details/route.ts` — hvordan titteldetaljer hentes (sjekk om IMDB-ID allerede hentes her)
- `src/components/TitleCard.tsx` — se om providers vises på kortet
- `src/lib/types.ts` — eksisterende typer
- `src/lib/cache-title.ts` — eksisterende caching-logikk for TMDB-data
- Supabase `titles_cache`-tabellen — kolonnestruktur, her skal netflix_id caches
- CSS-variabler og designsystem

---

## STEG 1: Bygg Wikidata Netflix-ID lookup

### Ny fil: `src/lib/netflix-id.ts`

Denne filen har én jobb: gitt en IMDB-ID, hent Netflix-ID fra Wikidata.

```typescript
// Konseptuell logikk — tilpass til prosjektets patterns:

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'

export async function getNetflixIdFromWikidata(imdbId: string): Promise<string | null> {
  // Wikidata properties:
  // P345 = IMDb ID
  // P1874 = Netflix ID
  
  const sparql = `
    SELECT ?netflixId WHERE {
      ?item wdt:P345 "${imdbId}" .
      ?item wdt:P1874 ?netflixId .
    }
    LIMIT 1
  `

  try {
    const res = await fetch(
      `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`,
      {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'Logflix/1.0 (https://logflix.app; kontakt@logflix.app)'
        }
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    const result = data?.results?.bindings?.[0]?.netflixId?.value
    return result || null
  } catch {
    return null
  }
}
```

**VIKTIG om Wikidata:**
- Wikidata SPARQL API er gratis og åpen — ingen API-nøkkel
- MÅ ha en `User-Agent` header med appnavn og kontaktinfo (deres policy)
- Rate limit: vær høflig, ikke spam. Maks 1 request per tittel, cache resultatet
- Netflix-ID er en 6-8 sifret tall-streng (f.eks. "80057281" for Stranger Things)
- Ikke alle titler har Netflix-ID i Wikidata — fallback er nødvendig
- Dekningen er best for populære vestlige titler, svakere for lokalt/nytt innhold

### Ny fil: `src/lib/streaming-links.ts`

URL-byggere for alle strømmetjenester:

```typescript
// Direkte Netflix-link (når vi har Netflix-ID)
export function getNetflixTitleUrl(netflixId: string): string {
  return `https://www.netflix.com/title/${netflixId}`
}

// Netflix søke-URL (fallback når vi IKKE har Netflix-ID)
export function getNetflixSearchUrl(title: string): string {
  return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
}

// Generisk: returnerer beste tilgjengelige URL for en provider
// netflixId er valgfritt — brukes kun for Netflix
export function getStreamingUrl(
  providerName: string,
  title: string,
  netflixId?: string | null
): { url: string; isDirect: boolean } | null {
  const name = providerName.toLowerCase()

  if (name.includes('netflix')) {
    if (netflixId) {
      return { url: getNetflixTitleUrl(netflixId), isDirect: true }
    }
    return { url: getNetflixSearchUrl(title), isDirect: false }
  }

  // Andre tjenester — alltid søke-URL (ingen Wikidata-mapping for disse ennå)
  if (name.includes('hbo') || name.includes('max'))
    return { url: `https://play.max.com/search?q=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('disney'))
    return { url: `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('viaplay'))
    return { url: `https://viaplay.no/search?query=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('apple'))
    return { url: `https://tv.apple.com/search?term=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('amazon') || name.includes('prime'))
    return { url: `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('paramount'))
    return { url: `https://www.paramountplus.com/search?q=${encodeURIComponent(title)}`, isDirect: false }
  if (name.includes('tv 2') || name.includes('tv2'))
    return { url: `https://play.tv2.no/search?query=${encodeURIComponent(title)}`, isDirect: false }

  return null
}
```

Legg merke til at `getStreamingUrl` returnerer `{ url, isDirect }` — dette brukes i UI for å vise riktig tekst ("Åpne direkte" vs "Søk i Netflix").

---

## STEG 2: API-route for Netflix-ID lookup + caching

### Ny fil: `src/app/api/netflix-id/route.ts`

Denne routen:
1. Tar imot TMDB-ID og media_type
2. Sjekker om Netflix-ID allerede er cachet i Supabase
3. Hvis ikke: henter IMDB-ID fra TMDB, så Netflix-ID fra Wikidata
4. Cacher resultatet (selv null-resultater, for å unngå gjentatte lookups)
5. Returnerer Netflix-ID eller null

```
GET /api/netflix-id?tmdb_id=12345&type=movie

Response: { "netflix_id": "80057281" } eller { "netflix_id": null }
```

**Caching-strategi:**
- Sjekk `titles_cache`-tabellen for en `netflix_id`-kolonne
- Hvis kolonnen ikke finnes, lag en Supabase-migrering som legger til:
  - `netflix_id TEXT` (nullable)
  - `netflix_id_checked BOOLEAN DEFAULT false` (for å skille "aldri sjekket" fra "sjekket men ikke funnet")
- Når Wikidata returnerer null: sett `netflix_id_checked = true` og `netflix_id = null`
- Ikke sjekk Wikidata på nytt for titler der `netflix_id_checked = true`
- Valgfritt: re-sjekk etter 30 dager (nye titler kan bli lagt til i Wikidata)

**IMDB-ID fra TMDB:**
- TMDB har et `/movie/{id}/external_ids` og `/tv/{id}/external_ids` endpoint
- Disse returnerer `imdb_id` blant annet
- Sjekk om dette allerede hentes et sted i prosjektet (f.eks. i details-routen)
- Bruk eksisterende TMDB-token fra env

Pseudokode for API-routen:
```
1. Parse query params: tmdb_id, type (movie/tv)
2. Sjekk titles_cache for netflix_id der tmdb_id matcher
3. Hvis netflix_id finnes → return { netflix_id }
4. Hvis netflix_id_checked = true og netflix_id = null → return { netflix_id: null }
5. Hent IMDB-ID fra TMDB external_ids endpoint
6. Hvis ingen IMDB-ID → sett netflix_id_checked = true, return null
7. Kall getNetflixIdFromWikidata(imdbId)
8. Oppdater titles_cache med netflix_id (eller null) og netflix_id_checked = true
9. Return { netflix_id } eller { netflix_id: null }
```

---

## STEG 3: Oppdater StreamingModal med "Åpne i [tjeneste]"-knapper

I `StreamingModal.tsx`, der providers vises (flatrate/rent/buy seksjoner):

### For flatrate-providers (inkludert i abonnement):

**For Netflix spesifikt:**
- Kall `/api/netflix-id` når modalen åpnes og Netflix er i provider-listen
- Vis en "Åpne i Netflix"-knapp med Netflix-rød farge (#E50914)
- Hvis `isDirect` (har Netflix-ID): knappetekst = "Åpne i Netflix"
- Hvis ikke `isDirect` (fallback søk): knappetekst = "Søk i Netflix"
- Liten undertekst under knappen:
  - Direkte: "Åpner tittelen direkte i Netflix"
  - Søk: "Åpner Netflix og søker etter tittelen"

**For andre tjenester:**
- Vis "Åpne i [tjeneste]" med nøytral farge
- Alltid søke-URL (isDirect = false)
- Undertekst: "Søker etter tittelen i [tjeneste]"

### Knapp-design:
```
┌─────────────────────────────────┐
│  [Netflix-logo]  Åpne i Netflix │  ← stor, tydelig knapp
│  Åpner tittelen direkte         │  ← liten undertekst, dimmet
└─────────────────────────────────┘
```

- Knappen er en `<a>` tag med `href={url}`, `target="_blank"`, `rel="noopener noreferrer"`
- Ikke bruk window.open() — la nettleseren/OS håndtere universal links naturlig
- Min-høyde 44px for touch-targets
- Provider-logo fra TMDB (logo_path) som ikon i knappen
- Bruk CSS-variabler fra prosjektet for alt annet
- Loading-state mens Netflix-ID hentes (liten spinner, ikke blokkerende)

### Plassering i StreamingModal:
- Vis "Åpne i [tjeneste]"-knappene OVER provider-logoene, som primær handling
- Gjør det tydelig at dette er den enkleste måten å se tittelen på
- Provider-logoer under kan fortsatt vises som informasjon

### Mobil-spesifikt:
- Knappene skal stables vertikalt, full bredde
- Touch-friendly størrelse (min 48px høyde med padding)
- Universal links fungerer automatisk: netflix.com-lenker åpner Netflix-appen på iOS/Android hvis installert, ellers nettleseren

---

## STEG 4: Bakgrunns-prefetch av Netflix-IDer

For å gjøre UX raskere, prefetch Netflix-IDer for titler der Netflix er tilgjengelig:

### I anbefalinger og bibliotek:
- Når du laster titler som har Netflix som provider: fire off Netflix-ID lookups i bakgrunnen
- Bruk en enkel Promise.all med rate-limiting (maks 3 samtidige Wikidata-kall)
- Cache resultatene slik at StreamingModal åpner instant

### Implementer dette som en utility:
```typescript
// src/lib/prefetch-netflix-ids.ts
export async function prefetchNetflixIds(tmdbIds: { id: number; type: string }[]) {
  // Hent i batches av 3 med 500ms delay mellom batches
  // for å respektere Wikidata rate limits
  for (let i = 0; i < tmdbIds.length; i += 3) {
    const batch = tmdbIds.slice(i, i + 3)
    await Promise.all(
      batch.map(({ id, type }) =>
        fetch(`/api/netflix-id?tmdb_id=${id}&type=${type}`)
          .catch(() => null) // Ignorer feil, dette er best-effort
      )
    )
    if (i + 3 < tmdbIds.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }
}
```

Kall dette fra:
- Dashboard-siden når den laster (for "Fortsett å se" og "For deg" seksjoner)
- Anbefalingssiden etter anbefalinger er hentet
- IKKE fra søkeresultater (for mange titler, brukeren klikker bare på 1-2)

---

## STEG 5: Supabase-migrering

Lag en fil `supabase/migrations/add_netflix_id_to_cache.sql`:

```sql
-- Legg til Netflix-ID kolonner i titles_cache
ALTER TABLE titles_cache
  ADD COLUMN IF NOT EXISTS netflix_id TEXT,
  ADD COLUMN IF NOT EXISTS netflix_id_checked BOOLEAN DEFAULT false;

-- Index for raskere lookups
CREATE INDEX IF NOT EXISTS idx_titles_cache_netflix_id
  ON titles_cache (netflix_id) WHERE netflix_id IS NOT NULL;
```

IKKE kjør denne automatisk — bare lag filen. Skriv en kommentar øverst om at denne må kjøres manuelt i Supabase dashboard.

---

## STEG 6: Utvid til andre tjenester (fremtidig)

Wikidata har også IDer for andre tjenester. Ikke implementer disse nå, men legg til kommentarer i koden for fremtidig utvidelse:

```
// Wikidata properties for streaming services (for fremtidig bruk):
// P1874 = Netflix ID → https://www.netflix.com/title/{id}
// P7595 = Disney+ ID → https://www.disneyplus.com/video/{id}  
// P9586 = HBO Max ID
// P12014 = Amazon Prime Video ID
// P10363 = Viaplay ID
```

---

## REGLER

1. **ALDRI spør meg noe.** Ta egne avgjørelser basert på eksisterende kode.
2. **Tilpass ALT** til prosjektets eksisterende patterns: imports, Supabase-klienter, auth, CSS-variabler.
3. **Kjør `npm run build`** og fiks alle errors.
4. **Norsk UI-tekst** på alle knapper og labels.
5. **Ikke lyv til brukeren:**
   - Vis "Åpne i Netflix" KUN når Netflix er i provider-listen for den tittelen
   - Vis "Søk i Netflix" (ikke "Se nå") når du bruker søke-URL fallback
   - Vis "Åpne i Netflix" (ikke "Spill av") når du har direkte link
6. **Wikidata-etikette:**
   - Sett `User-Agent: Logflix/1.0 (https://logflix.app)` på alle Wikidata-requests
   - Cache alle resultater (inkludert null) for å unngå gjentatte kall
   - Maks 3 samtidige requests, 500ms mellom batches
7. **Netflix-ID er IKKE TMDB-ID.** Bland disse aldri. Netflix-ID er en 6-8 sifret streng.
8. **Test at URL-encoding fungerer** for norske tegn (æøå) og spesialtegn i titler.
9. **`<a href>` ikke `window.open()`** — la OS håndtere universal links naturlig.

## OPPSUMMERT FILSTRUKTUR

```
Nye filer:
├── src/lib/netflix-id.ts          ← Wikidata SPARQL lookup
├── src/lib/streaming-links.ts     ← URL-byggere for alle tjenester
├── src/lib/prefetch-netflix-ids.ts ← Bakgrunns-prefetch utility
├── src/app/api/netflix-id/route.ts ← API-route med caching
└── supabase/migrations/add_netflix_id_to_cache.sql

Endrede filer:
├── src/components/StreamingModal.tsx  ← Hovedendring: "Åpne i [tjeneste]"-knapper
└── src/lib/cache-title.ts            ← Evt. oppdater for netflix_id-feltet
```

Bygg det. 🚀
