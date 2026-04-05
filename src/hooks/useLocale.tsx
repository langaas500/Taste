"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const VALID: string[] = ["no", "en", "dk", "se", "fi"];

/** Read locale from cookie (fallback while profile loads) */
function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )x-locale=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : "en";
  return VALID.includes(value) ? (value as Locale) : "en";
}

/** Map DB values (nb, sv, da) to app Locale values (no, se, dk) */
function normalizeDbLocale(dbLocale: string | null | undefined): Locale | null {
  if (!dbLocale) return null;
  const map: Record<string, Locale> = { nb: "no", no: "no", sv: "se", se: "se", da: "dk", dk: "dk", fi: "fi", en: "en" };
  return map[dbLocale] ?? (VALID.includes(dbLocale) ? (dbLocale as Locale) : null);
}

/* ── Context ── */

const LocaleContext = createContext<Locale | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [dbLocale, setDbLocale] = useState<Locale | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const pref = normalizeDbLocale(d.profile?.preferred_locale);
        if (pref) {
          setDbLocale(pref);
          // Sync cookie so middleware and SSR stay consistent
          document.cookie = `x-locale=${pref}; path=/; max-age=31536000; samesite=lax`;
          document.cookie = `x-locale-manual=1; path=/; max-age=31536000; samesite=lax`;
        }
      })
      .catch(() => {});
  }, []);

  return (
    <LocaleContext.Provider value={dbLocale}>
      {children}
    </LocaleContext.Provider>
  );
}

/* ── Hook ── */

export function useLocale(): Locale {
  const dbLocale = useContext(LocaleContext);
  // DB value takes priority, cookie is fallback (loading / guest / no profile)
  return dbLocale ?? getCookieLocale();
}
