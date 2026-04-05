import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { tmdbSearch, tmdbSearchKeywords, tmdbDiscover } from "@/lib/tmdb";

// Nordic topic terms → English search terms for title + keyword search
// Covers: Norwegian (no), Danish (dk), Swedish (se), Finnish (fi)
const TOPIC_MAP: Record<string, string[]> = {
  // Bolig & oppussing
  oppussing: ["renovation", "home improvement", "house flipping", "fixer upper", "home makeover", "property brothers", "grand designs"],
  oppuss: ["renovation", "home improvement", "home makeover"],
  renovering: ["renovation", "remodel", "restore", "home renovation"],
  snekker: ["carpenter", "woodworking", "construction", "building"],
  snekkeri: ["carpentry", "woodworking"],
  "interiør": ["interior design", "home decoration", "home design", "interior"],
  "interiørdesign": ["interior design", "home decor"],
  hage: ["garden", "gardening", "garden makeover", "landscape"],
  hagearbeid: ["gardening", "landscape", "garden rescue"],
  bolig: ["real estate", "house", "home improvement", "property", "tiny house"],
  eiendom: ["real estate", "property", "house hunting", "million dollar listing"],
  livsstil: ["lifestyle", "home improvement", "cooking", "makeover", "reality"],
  "hjemme hos": ["home makeover", "celebrity home", "house tour"],
  "rom for": ["room makeover", "home renovation"],
  bygge: ["building", "construction", "home renovation"],
  ombygging: ["renovation", "remodel", "home makeover", "extreme makeover"],

  // Bil & mekanikk
  bil: ["car", "automobile", "car restoration", "car show"],
  biler: ["car", "automobile", "racing", "car show"],
  bilmekaniker: ["mechanic", "car mechanic", "car restoration", "garage"],
  mekaniker: ["mechanic", "car repair", "automobile", "garage"],
  motor: ["engine", "motor", "racing", "motorsport"],
  motorsport: ["motorsport", "racing", "formula one", "nascar"],
  verksted: ["garage", "workshop", "mechanic"],

  // Mat & drikke
  matlaging: ["cooking", "chef", "culinary", "kitchen", "masterchef"],
  kokk: ["chef", "cooking", "culinary", "kitchen"],
  baking: ["baking", "pastry", "bakery", "bake off"],
  baker: ["baker", "baking", "pastry"],
  restaurant: ["restaurant", "chef", "cooking competition", "kitchen"],
  mat: ["food", "cooking", "culinary", "chef"],
  vin: ["wine", "winery", "sommelier"],

  // Natur & dyr
  natur: ["nature", "wildlife", "wilderness", "planet earth"],
  dyr: ["animal", "wildlife", "pet", "zoo"],
  hund: ["dog", "canine", "puppy"],
  katt: ["cat", "feline", "kitten"],
  hav: ["ocean", "sea", "marine", "deep sea"],
  fjell: ["mountain", "climbing", "hiking", "everest"],
  fiske: ["fishing", "angling"],
  jakt: ["hunting", "hunter"],

  // Vitenskap & teknologi
  vitenskap: ["science", "scientific", "discovery"],
  teknologi: ["technology", "tech", "innovation"],
  romfart: ["space", "nasa", "astronaut", "cosmos"],
  robot: ["robot", "artificial intelligence", "ai"],

  // Sport & trening
  fotball: ["football", "soccer", "premier league"],
  trening: ["fitness", "workout", "training", "gym"],
  boksing: ["boxing", "fighter"],
  kampsport: ["martial arts", "mma", "ufc"],
  sjakk: ["chess"],

  // Krim & true crime
  krim: ["crime", "true crime", "murder", "criminal"],
  "true crime": ["true crime", "murder mystery", "crime documentary"],
  mord: ["murder", "homicide", "killer"],
  etterforskning: ["investigation", "detective", "forensic"],
  politi: ["police", "law enforcement", "cop"],

  // Musikk & kunst
  musikk: ["music", "musician", "band", "concert"],
  kunst: ["art", "artist", "painting", "gallery"],
  dans: ["dance", "dancing", "ballet", "dancer"],
  teater: ["theater", "theatre", "broadway", "musical"],

  // Reise & eventyr
  reise: ["travel", "journey", "adventure", "destination"],
  eventyr: ["adventure", "expedition", "explorer"],
  overlevelse: ["survival", "wilderness", "survivor"],

  // Helse & medisin
  lege: ["doctor", "medical", "hospital"],
  sykehus: ["hospital", "medical", "emergency"],
  medisin: ["medicine", "medical"],
  psykologi: ["psychology", "mental health", "therapy"],

  // Økonomi & business
  business: ["business", "entrepreneur", "startup"],
  startup: ["startup", "entrepreneur", "business"],
  "økonomi": ["finance", "economy", "wall street"],
  investering: ["investment", "stock market", "trading"],

  // Historie
  historie: ["history", "historical", "ancient"],
  krig: ["war", "military", "world war", "battle"],
  viking: ["viking", "norse", "vikings"],
  egypten: ["egypt", "ancient egypt", "pharaoh"],
  rom: ["ancient rome", "roman empire", "gladiator"],

  // ── Danish (dk) ──────────────────────────────────────
  // Bolig & oppussing
  istandsættelse: ["renovation", "home improvement", "home makeover"],
  boligindretning: ["interior design", "home decoration", "home design"],
  "gør det selv": ["diy", "home improvement", "renovation"],
  håndværker: ["carpenter", "construction", "building"],
  havepleje: ["gardening", "garden makeover", "landscape"],
  "bolig til salg": ["real estate", "property", "house hunting"],
  ombygning: ["renovation", "remodel", "home makeover"],
  // Bil
  bilværksted: ["garage", "mechanic", "car repair"],
  // Mat
  madlavning: ["cooking", "chef", "culinary", "kitchen"],
  bagning: ["baking", "pastry", "bake off"],
  // Natur & dyr
  dyreliv: ["wildlife", "animal", "nature"],
  // Vitenskap
  videnskab: ["science", "scientific", "discovery"],
  rumfart: ["space", "nasa", "astronaut"],
  // Sport
  fodbold: ["football", "soccer"],
  træning: ["fitness", "workout", "training"],
  boksning: ["boxing", "fighter"],
  // Krim
  forbrydelse: ["crime", "true crime", "criminal"],
  efterforskning: ["investigation", "detective", "forensic"],
  // Musikk & kunst
  musik: ["music", "musician", "band", "concert"],
  // Reise
  rejse: ["travel", "journey", "adventure"],
  // Helse
  læge: ["doctor", "medical", "hospital"],
  sygehus: ["hospital", "medical", "emergency"],

  // ── Swedish (se) ─────────────────────────────────────
  // Bolig & oppussing
  renovera: ["renovation", "home improvement", "home makeover"],
  uppfräschning: ["renovation", "home makeover", "remodel"],
  inredning: ["interior design", "home decoration", "home design"],
  inredningsdesign: ["interior design", "home decor"],
  trädgård: ["garden", "gardening", "garden makeover", "landscape"],
  "trädgårdsarbete": ["gardening", "landscape"],
  bostad: ["real estate", "house", "home improvement", "property"],
  fastighet: ["real estate", "property", "house hunting"],
  snickare: ["carpenter", "woodworking", "construction"],
  bygga: ["building", "construction", "home renovation"],
  // Bil
  bilverkstad: ["garage", "mechanic", "car repair"],
  bilar: ["car", "automobile", "racing", "car show"],
  // Mat
  matlagning: ["cooking", "chef", "culinary", "kitchen"],
  bakning: ["baking", "pastry", "bake off"],
  kock: ["chef", "cooking", "culinary"],
  // Natur & dyr
  djur: ["animal", "wildlife", "pet", "zoo"],
  berg: ["mountain", "climbing", "hiking"],
  fiska: ["fishing", "angling"],
  // Vitenskap
  vetenskap: ["science", "scientific", "discovery"],
  teknik: ["technology", "tech", "innovation"],
  rymd: ["space", "nasa", "astronaut", "cosmos"],
  // Sport
  fotboll: ["football", "soccer", "premier league"],
  träning: ["fitness", "workout", "training"],
  boxning: ["boxing", "fighter"],
  kampsporter: ["martial arts", "mma", "ufc"],
  schack: ["chess"],
  // Krim
  brott: ["crime", "true crime", "criminal"],
  utredning: ["investigation", "detective", "forensic"],
  // Musikk & kunst
  konst: ["art", "artist", "painting", "gallery"],
  // Reise
  resa: ["travel", "journey", "adventure", "destination"],
  äventyr: ["adventure", "expedition", "explorer"],
  // Helse
  läkare: ["doctor", "medical", "hospital"],
  sjukhus: ["hospital", "medical", "emergency"],
  // Økonomi
  ekonomi: ["finance", "economy", "wall street"],

  // ── Finnish (fi) ──────────────────────────────────────
  // Bolig & oppussing
  remontti: ["renovation", "home improvement", "home makeover"],
  remontointi: ["renovation", "remodel", "home renovation"],
  sisustus: ["interior design", "home decoration", "home design"],
  sisustussuunnittelu: ["interior design", "home decor"],
  puutarha: ["garden", "gardening", "garden makeover", "landscape"],
  puutarhanhoito: ["gardening", "landscape"],
  asunto: ["real estate", "house", "home improvement", "property"],
  kiinteistö: ["real estate", "property", "house hunting"],
  rakentaminen: ["building", "construction", "home renovation"],
  nikkarointi: ["carpentry", "woodworking", "diy"],
  // Bil
  autokorjaamo: ["garage", "mechanic", "car repair"],
  auto: ["car", "automobile", "car show"],
  autot: ["car", "automobile", "racing", "car show"],
  moottoriurheilu: ["motorsport", "racing", "formula one"],
  // Mat
  ruoanlaitto: ["cooking", "chef", "culinary", "kitchen"],
  kokki: ["chef", "cooking", "culinary"],
  leipominen: ["baking", "pastry", "bake off"],
  ravintola: ["restaurant", "chef", "cooking competition"],
  ruoka: ["food", "cooking", "culinary"],
  viini: ["wine", "winery", "sommelier"],
  // Natur & dyr
  luonto: ["nature", "wildlife", "wilderness", "planet earth"],
  eläin: ["animal", "wildlife", "pet", "zoo"],
  eläimet: ["animal", "wildlife", "pet", "zoo"],
  koira: ["dog", "canine", "puppy"],
  kissa: ["cat", "feline", "kitten"],
  meri: ["ocean", "sea", "marine", "deep sea"],
  vuori: ["mountain", "climbing", "hiking"],
  kalastus: ["fishing", "angling"],
  metsästys: ["hunting", "hunter"],
  // Vitenskap
  tiede: ["science", "scientific", "discovery"],
  teknologia: ["technology", "tech", "innovation"],
  avaruus: ["space", "nasa", "astronaut", "cosmos"],
  // Sport
  jalkapallo: ["football", "soccer"],
  harjoittelu: ["fitness", "workout", "training"],
  nyrkkeily: ["boxing", "fighter"],
  kamppailulaji: ["martial arts", "mma", "ufc"],
  shakki: ["chess"],
  // Krim
  rikos: ["crime", "true crime", "criminal"],
  murha: ["murder", "homicide", "killer"],
  tutkinta: ["investigation", "detective", "forensic"],
  poliisi: ["police", "law enforcement", "cop"],
  // Musikk & kunst
  musiikki: ["music", "musician", "band", "concert"],
  taide: ["art", "artist", "painting", "gallery"],
  tanssi: ["dance", "dancing", "ballet"],
  teatteri: ["theater", "theatre", "broadway", "musical"],
  // Reise
  matka: ["travel", "journey", "adventure", "destination"],
  seikkailu: ["adventure", "expedition", "explorer"],
  selviytyminen: ["survival", "wilderness", "survivor"],
  // Helse
  lääkäri: ["doctor", "medical", "hospital"],
  sairaala: ["hospital", "medical", "emergency"],
  lääketiede: ["medicine", "medical"],
  psykologia: ["psychology", "mental health", "therapy"],
  // Økonomi
  talous: ["finance", "economy", "wall street"],
  sijoittaminen: ["investment", "stock market", "trading"],
  // Historie
  historia: ["history", "historical", "ancient"],
  sota: ["war", "military", "world war", "battle"],
};

async function searchKeywordsForTerms(terms: string[]): Promise<number[]> {
  const keywordIds: Set<number> = new Set();
  const searches = terms.slice(0, 8).map((term) => tmdbSearchKeywords(term));
  const results = await Promise.all(searches);
  for (const keywords of results) {
    for (const kw of keywords.slice(0, 5)) {
      keywordIds.add(kw.id);
    }
  }
  return Array.from(keywordIds);
}

export async function GET(req: NextRequest) {
  try {
    await getUser(); // allow guest access — no auth required
    const q = req.nextUrl.searchParams.get("q");
    const type = (req.nextUrl.searchParams.get("type") as "movie" | "tv" | "multi") || "multi";
    if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const queryLower = q.toLowerCase().trim();

    // Collect English terms from topic map
    const englishTerms: string[] = [];
    for (const [norsk, english] of Object.entries(TOPIC_MAP)) {
      if (queryLower === norsk || queryLower.includes(norsk)) {
        englishTerms.push(...english);
      }
    }
    const uniqueEnglish = [...new Set(englishTerms)];

    // === Strategy 1: Title search with original query ===
    const titleSearchPromise = tmdbSearch(q, type);

    // === Strategy 2: Title searches with English translations (the big win) ===
    // Search TMDB titles with each English term — this finds "Fixer Upper", "Grand Designs", etc.
    const englishSearchPromises = uniqueEnglish.slice(0, 5).map((term) =>
      tmdbSearch(term, type).catch(() => [])
    );

    // === Strategy 3: Keyword-based discover (supplementary) ===
    const keywordSearchPromise = searchKeywordsForTerms([q, ...uniqueEnglish.slice(0, 4)]);

    // Run all in parallel
    const [titleResults, keywordIds, ...englishResults] = await Promise.all([
      titleSearchPromise,
      keywordSearchPromise,
      ...englishSearchPromises,
    ]);

    // Keyword discover (if any keywords found)
    let discoverResults: Record<string, unknown>[] = [];
    if (keywordIds.length > 0) {
      const keywordStr = keywordIds.join(",");
      const types: ("movie" | "tv")[] =
        type === "multi" ? ["movie", "tv"] : [type as "movie" | "tv"];

      const discovers = await Promise.all(
        types.map((t) =>
          tmdbDiscover(t, {
            with_keywords: keywordStr,
            sort_by: "popularity.desc",
          })
        )
      );

      for (let i = 0; i < types.length; i++) {
        for (const item of discovers[i].results || []) {
          discoverResults.push({ ...item, media_type: types[i] });
        }
      }
    }

    // === Merge all results (deduplicated) ===
    // Priority: 1) original title search, 2) english title searches, 3) keyword discover
    const seen = new Set<string>();
    const merged: Record<string, unknown>[] = [];

    function addItems(items: Record<string, unknown>[]) {
      for (const item of items) {
        const mt = (item.media_type as string) || (item.title ? "movie" : "tv");
        const key = `${item.id}:${mt}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push({ ...item, media_type: mt });
        }
      }
    }

    // 1) Original query results first
    addItems(titleResults);

    // 2) English translation results (sorted by popularity across all searches)
    const allEnglish: Record<string, unknown>[] = [];
    for (const results of englishResults) {
      allEnglish.push(...(results as Record<string, unknown>[]));
    }
    allEnglish.sort((a, b) => ((b.popularity as number) || 0) - ((a.popularity as number) || 0));
    addItems(allEnglish);

    // 3) Keyword discover results
    addItems(discoverResults);

    return NextResponse.json({
      results: merged,
      topicMatch: uniqueEnglish.length > 0,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
