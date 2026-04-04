/**
 * Affiliate link builder.
 *
 * Uses NEXT_PUBLIC_AFFILIATE_* env vars for client components.
 * Falls back to AFFILIATE_* (server-only) for SSR/API routes.
 * If no affiliate ID is set for a provider, returns the original URL unchanged.
 *
 * URL format is configurable per provider. Default: Adtraction.
 * When Adtraction is active: https://track.adtraction.com/t/t?a={ID}&as={PROGRAM}&b={encodedUrl}
 */

const PROVIDER_KEY_MAP: Record<string, string> = {
  netflix: "NETFLIX",
  "hbo max": "HBO",
  hbo: "HBO",
  "max": "HBO",
  viaplay: "VIAPLAY",
  "disney+": "DISNEY",
  disney: "DISNEY",
  "apple tv+": "APPLETV",
  "apple tv": "APPLETV",
  "amazon prime video": "PRIME",
  "prime video": "PRIME",
  "tv 2 play": "TV2",
  "paramount+": "PARAMOUNT",
  paramount: "PARAMOUNT",
};

function getAffiliateId(providerName: string): string {
  const key = PROVIDER_KEY_MAP[providerName.toLowerCase()];
  if (!key) return "";

  // Client-side: NEXT_PUBLIC_ prefix
  const clientKey = `NEXT_PUBLIC_AFFILIATE_${key}`;
  if (typeof window !== "undefined") {
    // Next.js inlines NEXT_PUBLIC_* at build time via process.env
    const val = (process.env as Record<string, string | undefined>)[clientKey];
    return val || "";
  }

  // Server-side: try both
  return process.env[clientKey] || process.env[`AFFILIATE_${key}`] || "";
}

/**
 * Per-provider URL format builders.
 * Each provider can have its own affiliate system.
 * Default: Adtraction tracking URL.
 */
type UrlBuilder = (affiliateId: string, originalUrl: string) => string;

const PROVIDER_URL_BUILDERS: Record<string, UrlBuilder> = {
  PRIME: (tag) => `https://www.amazon.com/primevideo?tag=${tag}`,
};

const DEFAULT_BUILDER: UrlBuilder = (id, url) =>
  `https://track.adtraction.com/t/t?a=${id}&b=${encodeURIComponent(url)}`;

/**
 * Build an affiliate-tracked URL for a streaming provider.
 * Returns the original URL unchanged if no affiliate ID is configured.
 */
export function buildAffiliateUrl(providerName: string, originalUrl: string): string {
  const key = PROVIDER_KEY_MAP[providerName.toLowerCase()];
  const affiliateId = getAffiliateId(providerName);
  if (!affiliateId) return originalUrl;

  const builder = (key && PROVIDER_URL_BUILDERS[key]) || DEFAULT_BUILDER;
  return builder(affiliateId, originalUrl);
}

/**
 * Check if a provider has an affiliate program configured.
 */
export function hasAffiliate(providerName: string): boolean {
  return !!getAffiliateId(providerName);
}
