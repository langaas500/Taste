// Shared locale type + helpers
// Each file defines its own strings, imports Locale + getLocale from here

export type Locale = "no" | "en" | "dk" | "se" | "fi";

export function getLocale(country?: string | null): Locale {
  if (country === "NO") return "no";
  if (country === "DK") return "dk";
  if (country === "SE") return "se";
  if (country === "FI") return "fi";
  return "en";
}

// Generic t() for inline string maps
export function t<K extends string>(
  locale: Locale,
  strings: Record<K, Record<Locale, string>>,
  key: K,
): string {
  const entry = strings[key];
  return entry[locale] ?? entry.en;
}
