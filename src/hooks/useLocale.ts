"use client";

import type { Locale } from "@/lib/i18n";

const VALID: string[] = ["no", "en", "dk", "se", "fi"];

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "no";
  const match = document.cookie.match(/(?:^|; )x-locale=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : "en";
  return VALID.includes(value) ? (value as Locale) : "en";
}

export function useLocale(): Locale {
  return getCookieLocale();
}
