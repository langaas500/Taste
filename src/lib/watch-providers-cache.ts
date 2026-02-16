// Server-only utility: cached TMDB watch providers per (tmdb_id, type, country)
// Uses Supabase table watch_providers_cache with 24h TTL and stale fallback.

import { createSupabaseAdmin } from "./supabase-server";
import { tmdbWatchProviders } from "./tmdb";

const PROVIDERS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheRow {
  tmdb_id: number;
  type: string;
  country: string;
  providers: Record<string, unknown> | null;
  cached_at: string;
}

export interface CachedProviderResult {
  providers: Record<string, unknown> | null;
  stale: boolean;
  cache: "hit" | "refreshed" | "stale" | "miss";
}

export interface CachedProviderResultSingle extends CachedProviderResult {
  allCountries: string[];
}

function isFresh(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < PROVIDERS_TTL_MS;
}

// ---------------------------------------------------------------------------
// Single-title cached provider fetch
// Returns allCountries from fresh TMDB call (empty on cache hit/stale).
// ---------------------------------------------------------------------------
export async function getWatchProvidersCached({
  tmdbId,
  type,
  country,
}: {
  tmdbId: number;
  type: "movie" | "tv";
  country: string;
}): Promise<CachedProviderResultSingle> {
  const admin = createSupabaseAdmin();

  // 1. Check cache
  const { data: row } = await admin
    .from("watch_providers_cache")
    .select("providers, cached_at")
    .eq("tmdb_id", tmdbId)
    .eq("type", type)
    .eq("country", country)
    .single();

  const cached = row as CacheRow | null;

  // CASE 1 — Fresh cache hit
  if (cached && isFresh(cached.cached_at)) {
    return { providers: cached.providers, stale: false, cache: "hit", allCountries: [] };
  }

  // CASE 2/3/4 — Need to call TMDB (expired or missing)
  try {
    const tmdbData = await tmdbWatchProviders(tmdbId, type);
    const countryData = tmdbData.results?.[country] || null;
    const allCountries = Object.keys(tmdbData.results || {});

    // Upsert into cache
    await admin.from("watch_providers_cache").upsert(
      {
        tmdb_id: tmdbId,
        type,
        country,
        providers: countryData,
        cached_at: new Date().toISOString(),
      },
      { onConflict: "tmdb_id,type,country" }
    );

    return { providers: countryData, stale: false, cache: "refreshed", allCountries };
  } catch {
    // CASE 3 — TMDB failed but we have stale cache
    if (cached) {
      return { providers: cached.providers, stale: true, cache: "stale", allCountries: [] };
    }
    // CASE 4 — TMDB failed, no cache at all
    return { providers: null, stale: false, cache: "miss", allCountries: [] };
  }
}

// ---------------------------------------------------------------------------
// Batch cached provider fetch — for similar-available
// ONE Supabase query, minimal TMDB calls, batch upsert.
// ---------------------------------------------------------------------------
export async function getWatchProvidersCachedBatch({
  items,
  country,
}: {
  items: { tmdbId: number; type: "movie" | "tv" }[];
  country: string;
}): Promise<Map<string, CachedProviderResult>> {
  const admin = createSupabaseAdmin();
  const results = new Map<string, CachedProviderResult>();

  if (items.length === 0) return results;

  const ids = items.map((i) => i.tmdbId);

  // 1. Single batch DB query
  const { data: rows } = await admin
    .from("watch_providers_cache")
    .select("tmdb_id, type, providers, cached_at")
    .in("tmdb_id", ids)
    .eq("country", country);

  const cacheMap = new Map<string, CacheRow>();
  for (const r of (rows || []) as CacheRow[]) {
    cacheMap.set(`${r.tmdb_id}:${r.type}`, r);
  }

  // 2. Categorise: fresh / expired / missing
  const needsFetch: { tmdbId: number; type: "movie" | "tv" }[] = [];

  for (const item of items) {
    const key = `${item.tmdbId}:${item.type}`;
    const cached = cacheMap.get(key);

    if (cached && isFresh(cached.cached_at)) {
      // Fresh — use directly
      results.set(key, { providers: cached.providers, stale: false, cache: "hit" });
    } else {
      // Expired or missing — need TMDB call
      needsFetch.push(item);
    }
  }

  // 3. Fetch from TMDB only for expired/missing (parallel, settled)
  if (needsFetch.length > 0) {
    const fetchResults = await Promise.allSettled(
      needsFetch.map((item) =>
        tmdbWatchProviders(item.tmdbId, item.type).then((data) => ({
          tmdbId: item.tmdbId,
          type: item.type,
          countryData: data.results?.[country] || null,
        }))
      )
    );

    // 4. Process results + prepare batch upsert rows
    const upsertRows: {
      tmdb_id: number;
      type: string;
      country: string;
      providers: Record<string, unknown> | null;
      cached_at: string;
    }[] = [];

    for (let i = 0; i < needsFetch.length; i++) {
      const item = needsFetch[i];
      const key = `${item.tmdbId}:${item.type}`;
      const result = fetchResults[i];
      const staleCache = cacheMap.get(key);

      if (result.status === "fulfilled") {
        const { countryData } = result.value;
        results.set(key, { providers: countryData, stale: false, cache: "refreshed" });
        upsertRows.push({
          tmdb_id: item.tmdbId,
          type: item.type,
          country,
          providers: countryData,
          cached_at: new Date().toISOString(),
        });
      } else if (staleCache) {
        // TMDB failed but we have stale data
        results.set(key, { providers: staleCache.providers, stale: true, cache: "stale" });
      } else {
        // TMDB failed, no cache
        results.set(key, { providers: null, stale: false, cache: "miss" });
      }
    }

    // 5. Single batch upsert for all refreshed entries
    if (upsertRows.length > 0) {
      await admin
        .from("watch_providers_cache")
        .upsert(upsertRows, { onConflict: "tmdb_id,type,country" })
        .then(() => {});
    }
  }

  return results;
}
