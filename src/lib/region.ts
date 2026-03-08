// Supported regions for Logflix global platform
// Used for TMDB watch providers, trending, discovery, and Curator suggestions.

export const SUPPORTED_REGIONS = [
  "NO", "SE", "DK", "FI", "GB", "DE", "FR", "ES", "IT", "PL", "US", "CA", "AU",
] as const;

export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];

/** Display labels for region picker (settings UI) */
export const REGION_LABELS: Record<SupportedRegion, string> = {
  NO: "Norge",
  SE: "Sverige",
  DK: "Danmark",
  FI: "Finland",
  GB: "United Kingdom",
  DE: "Deutschland",
  FR: "France",
  ES: "España",
  IT: "Italia",
  PL: "Polska",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
};

/** Flag emoji for each supported region */
export const REGION_FLAGS: Record<SupportedRegion, string> = {
  NO: "🇳🇴", SE: "🇸🇪", DK: "🇩🇰", FI: "🇫🇮", GB: "🇬🇧",
  DE: "🇩🇪", FR: "🇫🇷", ES: "🇪🇸", IT: "🇮🇹", PL: "🇵🇱",
  US: "🇺🇸", CA: "🇨🇦", AU: "🇦🇺",
};

/** Check if a string is a supported region code */
export function isSupportedRegion(code: string | null | undefined): code is SupportedRegion {
  return !!code && (SUPPORTED_REGIONS as readonly string[]).includes(code.toUpperCase());
}

/**
 * Resolve the effective region from multiple sources (priority order):
 * 1. User's stored preferred_region (from profile)
 * 2. Vercel IP-detected country header
 * 3. Fallback "US"
 *
 * All sources are validated against SUPPORTED_REGIONS.
 */
export function resolveRegion(
  preferredRegion: string | null | undefined,
  ipCountry: string | null | undefined,
): SupportedRegion {
  const pref = preferredRegion?.toUpperCase();
  if (pref && isSupportedRegion(pref)) return pref;

  const ip = ipCountry?.toUpperCase();
  if (ip && isSupportedRegion(ip)) return ip;

  return "US";
}
