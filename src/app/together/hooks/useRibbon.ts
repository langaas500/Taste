"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";

export default function useRibbon() {
  const [ribbonPosters, setRibbonPosters] = useState<string[]>([]);
  const [userRegion, setUserRegion] = useState("US");
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (data.region) setUserRegion(data.region as string);
        if (Array.isArray(data.posters) && data.posters.length > 0) {
          setRibbonPosters(data.posters as string[]);
        }
      })
      .catch(() => {});
  }, []);

  return { ribbonPosters, userRegion, locale };
}
