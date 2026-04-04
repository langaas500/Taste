/**
 * Wikidata integration for director graph enrichment.
 *
 * Strategy:
 * 1. Use wbsearchentities to find the correct Wikidata entity for a director name
 * 2. Use SPARQL to fetch movements, nationality, awards, and (optional) influenced_by
 */

const WIKIDATA_SEARCH = "https://www.wikidata.org/w/api.php";
const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

export interface DirectorData {
  wikidataId: string;
  name: string;
  movements: string[];
  awards: string[];
  nationality: string | null;
  influencedBy: string[];
  activeDecades: string | null;
}

/**
 * Step 1: Search Wikidata for a film director entity by name.
 * Uses wbsearchentities API which handles fuzzy matching.
 */
async function findDirectorEntity(name: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "wbsearchentities",
    search: name,
    language: "en",
    type: "item",
    limit: "5",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${WIKIDATA_SEARCH}?${params}`, {
    signal: AbortSignal.timeout(5000),
    headers: { "User-Agent": "Logflix/1.0 (contact@logflix.app)" },
  });

  if (!res.ok) return null;
  const data = await res.json();

  // Return first result that has a description mentioning "director" or "filmmaker"
  for (const result of data.search ?? []) {
    const desc = (result.description || "").toLowerCase();
    if (desc.includes("director") || desc.includes("filmmaker") || desc.includes("screenwriter") || desc.includes("film")) {
      return result.id as string;
    }
  }

  // Fallback: return first result if any
  return data.search?.[0]?.id ?? null;
}

/**
 * Step 2: SPARQL query for director properties.
 * Focuses on movements (P135), nationality (P27), awards (P166).
 * Influenced_by (P737) is optional — often empty.
 */
async function queryDirectorProperties(wikidataId: string): Promise<Omit<DirectorData, "wikidataId" | "name"> | null> {
  const sparql = `
SELECT DISTINCT ?movementLabel ?nationalityLabel ?awardLabel ?influencedByLabel ?birthYear ?deathYear
WHERE {
  OPTIONAL { wd:${wikidataId} wdt:P135 ?movement. }
  OPTIONAL { wd:${wikidataId} wdt:P27 ?nationality. }
  OPTIONAL { wd:${wikidataId} wdt:P166 ?award. }
  OPTIONAL { wd:${wikidataId} wdt:P737 ?influencedBy. }
  OPTIONAL { wd:${wikidataId} wdt:P569 ?birthDate. BIND(YEAR(?birthDate) AS ?birthYear) }
  OPTIONAL { wd:${wikidataId} wdt:P570 ?deathDate. BIND(YEAR(?deathDate) AS ?deathYear) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 50`;

  const res = await fetch(`${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}&format=json`, {
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "Logflix/1.0 (contact@logflix.app)",
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const bindings = data.results?.bindings ?? [];

  if (bindings.length === 0) return { movements: [], awards: [], nationality: null, influencedBy: [], activeDecades: null };

  const movements = new Set<string>();
  const awards = new Set<string>();
  const influencedBy = new Set<string>();
  let nationality: string | null = null;
  let birthYear: number | null = null;
  let deathYear: number | null = null;

  for (const b of bindings) {
    if (b.movementLabel?.value) movements.add(b.movementLabel.value);
    if (b.nationalityLabel?.value) nationality = b.nationalityLabel.value;
    if (b.awardLabel?.value && awards.size < 10) awards.add(b.awardLabel.value);
    if (b.influencedByLabel?.value) influencedBy.add(b.influencedByLabel.value);
    if (b.birthYear?.value) birthYear = parseInt(b.birthYear.value);
    if (b.deathYear?.value) deathYear = parseInt(b.deathYear.value);
  }

  // Compute active decades
  let activeDecades: string | null = null;
  if (birthYear) {
    const startDecade = Math.floor((birthYear + 25) / 10) * 10; // assume career starts ~25
    const endDecade = deathYear ? Math.floor(deathYear / 10) * 10 : Math.floor(new Date().getFullYear() / 10) * 10;
    activeDecades = `${startDecade}s–${endDecade}s`;
  }

  return {
    movements: [...movements],
    awards: [...awards],
    nationality,
    influencedBy: [...influencedBy],
    activeDecades,
  };
}

/**
 * Main function: fetch full director data from Wikidata.
 * Returns null if director not found or on error.
 */
export async function fetchDirectorData(directorName: string): Promise<DirectorData | null> {
  try {
    const wikidataId = await findDirectorEntity(directorName);
    if (!wikidataId) return null;

    const props = await queryDirectorProperties(wikidataId);
    if (!props) return null;

    return {
      wikidataId,
      name: directorName,
      ...props,
    };
  } catch {
    return null;
  }
}

/**
 * Top 100 most influential film directors for seeding the graph.
 */
export const SEED_DIRECTORS = [
  // American
  "Steven Spielberg", "Martin Scorsese", "Stanley Kubrick", "Quentin Tarantino",
  "David Fincher", "Christopher Nolan", "Wes Anderson", "David Lynch",
  "Francis Ford Coppola", "Ridley Scott", "James Cameron", "Tim Burton",
  "Spike Lee", "Clint Eastwood", "Terrence Malick", "Paul Thomas Anderson",
  "Sofia Coppola", "Jordan Peele", "Greta Gerwig", "Barry Jenkins",
  "Damien Chazelle", "Ava DuVernay", "Denis Villeneuve",
  // Coen Brothers
  "Joel Coen", "Ethan Coen",
  // European
  "Alfred Hitchcock", "Ingmar Bergman", "Federico Fellini", "Andrei Tarkovsky",
  "Jean-Luc Godard", "François Truffaut", "Pedro Almodóvar", "Lars von Trier",
  "Michael Haneke", "Werner Herzog", "Wim Wenders", "Roman Polanski",
  "Ken Loach", "Danny Boyle", "Guy Ritchie", "Edgar Wright",
  "Céline Sciamma", "Yorgos Lanthimos", "Ruben Östlund", "Florian Henckel von Donnersmarck",
  // Asian
  "Akira Kurosawa", "Hayao Miyazaki", "Wong Kar-wai", "Park Chan-wook",
  "Bong Joon-ho", "Hirokazu Kore-eda", "Zhang Yimou", "Ang Lee",
  "Satoshi Kon", "Apichatpong Weerasethakul",
  // Australian/NZ
  "Peter Jackson", "George Miller", "Jane Campion", "Taika Waititi",
  // Latin American
  "Alfonso Cuarón", "Alejandro González Iñárritu", "Guillermo del Toro",
  // Scandinavian
  "Thomas Vinterberg", "Joachim Trier", "Bent Hamer", "Aki Kaurismäki",
  // Classic
  "Orson Welles", "Billy Wilder", "John Ford", "Howard Hawks",
  "Fritz Lang", "Charlie Chaplin", "Sergio Leone", "John Huston",
  // Modern blockbuster
  "Zack Snyder", "Michael Bay", "J.J. Abrams", "Sam Raimi",
  "Kathryn Bigelow", "Denis Villeneuve", "Chloé Zhao",
  // Horror
  "John Carpenter", "Wes Craven", "Ari Aster", "Robert Eggers",
  // Animation
  "Brad Bird", "Pete Docter", "Mamoru Hosoda", "Isao Takahata",
  // British
  "Christopher Nolan", "Ridley Scott", "Steve McQueen", "Sam Mendes",
  "Andrea Arnold", "Lynne Ramsay",
  // TV/crossover
  "David Chase", "Vince Gilligan", "Mike Flanagan",
  // Recent acclaimed
  "Sean Baker", "Kelly Reichardt", "Ryusuke Hamaguchi",
];
