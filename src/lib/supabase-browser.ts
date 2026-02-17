import { createBrowserClient } from "@supabase/ssr";
import type { TitleCache } from "./types";

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fetch titles_cache rows matching the given (tmdb_id, type) pairs.
 * Dedupes by composite key before querying, then batches .in() calls
 * in chunks of 200 to stay within URL-length limits.
 */
export async function fetchCacheForTitles(
  supabase: ReturnType<typeof createSupabaseBrowser>,
  keys: { tmdb_id: number; type: string }[]
): Promise<Map<string, TitleCache>> {
  const cacheMap = new Map<string, TitleCache>();
  if (keys.length === 0) return cacheMap;

  // Dedupe by composite key (tmdb_id + type) first, then extract unique IDs for the query
  const dedupedPairs = [...new Map(keys.map((k) => [`${k.tmdb_id}:${k.type}`, k])).values()];
  const dedupedIds = [...new Set(dedupedPairs.map((k) => k.tmdb_id))];

  const CHUNK = 200;
  for (let i = 0; i < dedupedIds.length; i += CHUNK) {
    const chunk = dedupedIds.slice(i, i + CHUNK);
    const { data } = await supabase
      .from("titles_cache")
      .select("*")
      .in("tmdb_id", chunk);

    for (const c of (data || []) as TitleCache[]) {
      cacheMap.set(`${c.tmdb_id}:${c.type}`, c);
    }
  }

  return cacheMap;
}
