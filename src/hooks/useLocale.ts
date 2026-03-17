"use client";

import type { Locale } from "@/lib/i18n";

const VALID: string[] = ["no", "en", "dk", "se", "fi"];

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "no";
  const match = document.cookie.match(/(?:^|; )x-locale=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : "no";
  return VALID.includes(value) ? (value as Locale) : "no";
}

export function useLocale(): Locale {
  return getCookieLocale();
}
