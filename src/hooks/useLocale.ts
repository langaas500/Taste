"use client";

import { useState, useEffect } from "react";
import { getLocale, type Locale } from "@/lib/i18n";

let cached: Locale | null = null;

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(cached ?? "en");

  useEffect(() => {
    if (cached) { setLocale(cached); return; }
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) {
          cached = getLocale(data.region as string);
          setLocale(cached);
        }
      })
      .catch(() => {});
  }, []);

  return locale;
}
