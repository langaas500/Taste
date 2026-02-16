const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

// Wikidata properties for streaming services (for fremtidig bruk):
// P345  = IMDb ID
// P1874 = Netflix ID → https://www.netflix.com/title/{id}
// P7595 = Disney+ ID → https://www.disneyplus.com/video/{id}
// P9586 = HBO Max ID
// P12014 = Amazon Prime Video ID
// P10363 = Viaplay ID

export async function getNetflixIdFromWikidata(imdbId: string): Promise<string | null> {
  const sparql = `
    SELECT ?netflixId WHERE {
      ?item wdt:P345 "${imdbId}" .
      ?item wdt:P1874 ?netflixId .
    }
    LIMIT 1
  `;

  try {
    const res = await fetch(
      `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`,
      {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "Logflix/1.0 (https://logflix.app; kontakt@logflix.app)",
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.results?.bindings?.[0]?.netflixId?.value;
    return result || null;
  } catch {
    return null;
  }
}
