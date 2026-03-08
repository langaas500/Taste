/**
 * Slug utilities for SEO title pages.
 *
 * Format: {slugified-english-title}-{tmdb_id}
 * Example: "dune-part-two-693134"
 *
 * The tmdb_id suffix guarantees uniqueness and allows reverse lookup
 * without a DB query on the slug column.
 */

/**
 * Convert a title string + tmdb_id into a URL-safe slug.
 * Uses en-US title so slugs are identical across all regions.
 */
export function buildSlug(title: string, tmdbId: number): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip diacritics (ü→u, é→e)
    .replace(/[^a-z0-9]+/g, "-")        // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "")            // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-");            // collapse multiple hyphens

  return base ? `${base}-${tmdbId}` : `${tmdbId}`;
}

/**
 * Extract tmdb_id from a slug string.
 * The ID is always the last hyphen-separated segment (guaranteed numeric).
 *
 * "dune-part-two-693134" → 693134
 * "693134"               → 693134
 * "bad-slug"             → null
 */
export function parseSlug(slug: string): number | null {
  const lastHyphen = slug.lastIndexOf("-");
  const idPart = lastHyphen >= 0 ? slug.slice(lastHyphen + 1) : slug;
  const id = parseInt(idPart, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}
