"use client";

import { useState, useEffect } from "react";
import { getLocale, type Locale } from "../strings";

export default function useRibbon() {
  const [ribbonPosters, setRibbonPosters] = useState<string[]>([]);
  const [userRegion, setUserRegion] = useState("US");
  const [ribbonLocale, setRibbonLocale] = useState<Locale | null>(null);

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) setUserRegion(data.region as string);
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get("lang");
        if (langParam === "no" || langParam === "en" || langParam === "dk" || langParam === "se" || langParam === "fi") {
          setRibbonLocale(langParam as Locale);
        } else if (data.region) {
          setRibbonLocale(getLocale(data.region as string));
        }
        if (Array.isArray(data.posters) && data.posters.length > 0) {
          setRibbonPosters(data.posters as string[]);
        }
      })
      .catch(() => {});
  }, []);

  return { ribbonPosters, userRegion, ribbonLocale };
}
