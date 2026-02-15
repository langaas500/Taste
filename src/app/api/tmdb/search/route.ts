import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { tmdbSearch, tmdbSearchKeywords, tmdbDiscover } from "@/lib/tmdb";

// Norwegian topic terms → English search terms for title + keyword search
const TOPIC_MAP: Record<string, string[]> = {
  // Bolig & oppussing
  oppussing: ["renovation", "home improvement", "house flipping", "fixer upper", "home makeover"],
  oppuss: ["renovation", "home improvement", "home makeover"],
  renovering: ["renovation", "remodel", "restore"],
  snekker: ["carpenter", "woodworking", "construction", "building"],
  snekkeri: ["carpentry", "woodworking"],
  "interiør": ["interior design", "home decoration", "home design"],
  "interiørdesign": ["interior design"],
  hage: ["garden", "gardening", "garden makeover"],
  hagearbeid: ["gardening", "landscape"],
  bolig: ["real estate", "house", "home improvement", "property"],
  eiendom: ["real estate", "property", "house hunting"],

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
    await requireUser();
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
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
