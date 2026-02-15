import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { tmdbSearch, tmdbSearchKeywords, tmdbDiscover } from "@/lib/tmdb";

// Norwegian topic terms → English TMDB keyword searches
const TOPIC_MAP: Record<string, string[]> = {
  // Bolig & oppussing
  oppussing: ["renovation", "home improvement", "house flipping"],
  oppuss: ["renovation", "home improvement"],
  renovering: ["renovation", "remodel"],
  snekker: ["carpenter", "woodworking", "construction"],
  snekkeri: ["carpentry", "woodworking"],
  "interiør": ["interior design", "home decoration"],
  "interiørdesign": ["interior design"],
  hage: ["garden", "gardening"],
  hagearbeid: ["gardening", "landscape"],
  bolig: ["real estate", "house", "home improvement"],
  eiendom: ["real estate", "property"],

  // Bil & mekanikk
  bil: ["car", "automobile", "car restoration"],
  biler: ["car", "automobile", "racing"],
  bilmekaniker: ["mechanic", "car mechanic", "automobile repair"],
  mekaniker: ["mechanic", "car repair", "automobile"],
  motor: ["engine", "motor", "racing"],
  motorsport: ["motorsport", "racing", "formula one"],
  verksted: ["garage", "workshop", "mechanic"],

  // Mat & drikke
  matlaging: ["cooking", "chef", "culinary"],
  kokk: ["chef", "cooking", "culinary"],
  baking: ["baking", "pastry", "bakery"],
  baker: ["baker", "baking", "pastry"],
  restaurant: ["restaurant", "chef", "cooking competition"],
  mat: ["food", "cooking", "culinary"],
  vin: ["wine", "winery", "sommelier"],

  // Natur & dyr
  natur: ["nature", "wildlife", "wilderness"],
  dyr: ["animal", "wildlife", "pet"],
  hund: ["dog", "canine"],
  katt: ["cat", "feline"],
  hav: ["ocean", "sea", "marine"],
  fjell: ["mountain", "climbing", "hiking"],
  fiske: ["fishing"],
  jakt: ["hunting"],

  // Vitenskap & teknologi
  vitenskap: ["science", "scientific"],
  teknologi: ["technology", "tech"],
  romfart: ["space", "nasa", "astronaut"],
  robot: ["robot", "artificial intelligence"],

  // Sport & trening
  fotball: ["football", "soccer"],
  trening: ["fitness", "workout", "training"],
  boksing: ["boxing"],
  kampsport: ["martial arts", "mma"],
  sjakk: ["chess"],

  // Krim & true crime
  krim: ["crime", "true crime", "murder"],
  "true crime": ["true crime", "murder mystery"],
  mord: ["murder", "homicide"],
  etterforskning: ["investigation", "detective"],
  politi: ["police", "law enforcement"],

  // Musikk & kunst
  musikk: ["music", "musician", "band"],
  kunst: ["art", "artist", "painting"],
  dans: ["dance", "dancing", "ballet"],
  teater: ["theater", "theatre", "broadway"],

  // Reise & eventyr
  reise: ["travel", "journey", "adventure"],
  eventyr: ["adventure", "expedition"],
  overlevelse: ["survival", "wilderness"],

  // Helse & medisin
  lege: ["doctor", "medical", "hospital"],
  sykehus: ["hospital", "medical"],
  medisin: ["medicine", "medical"],
  psykologi: ["psychology", "mental health"],

  // Økonomi & business
  business: ["business", "entrepreneur"],
  startup: ["startup", "entrepreneur", "business"],
  "økonomi": ["finance", "economy", "wall street"],
  investering: ["investment", "stock market"],

  // Historie
  historie: ["history", "historical"],
  krig: ["war", "military", "world war"],
  viking: ["viking", "norse"],
  egypten: ["egypt", "ancient egypt", "pharaoh"],
  rom: ["ancient rome", "roman empire"],
};

async function searchKeywordsForTerms(terms: string[]): Promise<number[]> {
  const keywordIds: Set<number> = new Set();
  const searches = terms.slice(0, 5).map((term) => tmdbSearchKeywords(term));
  const results = await Promise.all(searches);
  for (const keywords of results) {
    for (const kw of keywords.slice(0, 3)) {
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

    // Collect English keyword terms from topic map
    const englishTerms: string[] = [];
    for (const [norsk, english] of Object.entries(TOPIC_MAP)) {
      if (queryLower === norsk || queryLower.includes(norsk)) {
        englishTerms.push(...english);
      }
    }

    // Always also search keywords with the original query
    const allSearchTerms = [...new Set([q, ...englishTerms])];

    // Run title search and keyword search in parallel
    const [titleResults, keywordIds] = await Promise.all([
      tmdbSearch(q, type),
      searchKeywordsForTerms(allSearchTerms),
    ]);

    // If we found keywords, run discover queries for extra results
    let topicResults: Record<string, unknown>[] = [];
    if (keywordIds.length > 0) {
      const keywordStr = keywordIds.join(",");
      const types: ("movie" | "tv")[] =
        type === "multi" ? ["movie", "tv"] : [type as "movie" | "tv"];

      const discovers = types.map((t) =>
        tmdbDiscover(t, {
          with_keywords: keywordStr,
          sort_by: "popularity.desc",
          "vote_count.gte": "10",
        })
      );

      const discoverResults = await Promise.all(discovers);
      for (let i = 0; i < types.length; i++) {
        const t = types[i];
        for (const item of discoverResults[i].results || []) {
          topicResults.push({ ...item, media_type: t });
        }
      }
    }

    // Merge: title matches first, then topic results (deduplicated)
    const seen = new Set<string>();
    const merged: Record<string, unknown>[] = [];

    for (const item of titleResults) {
      const mt = item.media_type || (item.title ? "movie" : "tv");
      const key = `${item.id}:${mt}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    for (const item of topicResults) {
      const key = `${item.id}:${item.media_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    return NextResponse.json({
      results: merged,
      topicMatch: englishTerms.length > 0 || keywordIds.length > 0,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
