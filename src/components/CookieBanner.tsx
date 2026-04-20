"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

export const CONSENT_KEY = "cookie_consent";
export type ConsentValue = "all" | "necessary";

const strings: Record<Locale, { msg: string; accept: string; necessary: string; policy: string }> = {
  no: {
    msg: "Vi bruker nødvendige cookies til innlogging og valgfrie analysecookies (PostHog) for å forstå hvordan tjenesten brukes. Les mer i vår",
    accept: "Godta alle",
    necessary: "Kun nødvendige",
    policy: "cookiepolicy",
  },
  en: {
    msg: "We use necessary cookies for login and optional analytics cookies (PostHog) to understand how the service is used. Read more in our",
    accept: "Accept all",
    necessary: "Necessary only",
    policy: "cookie policy",
  },
  dk: {
    msg: "Vi bruger nødvendige cookies til login og valgfrie analysecookies (PostHog) til at forstå, hvordan tjenesten bruges. Læs mere i vores",
    accept: "Accepter alle",
    necessary: "Kun nødvendige",
    policy: "cookiepolitik",
  },
  se: {
    msg: "Vi använder nödvändiga cookies för inloggning och valfria analyticscookies (PostHog) för att förstå hur tjänsten används. Läs mer i vår",
    accept: "Acceptera alla",
    necessary: "Endast nödvändiga",
    policy: "cookiepolicy",
  },
  fi: {
    msg: "Käytämme välttämättömiä evästeitä kirjautumiseen ja valinnaisia analytiikkaevästeitä (PostHog) palvelun käytön ymmärtämiseen. Lue lisää",
    accept: "Hyväksy kaikki",
    necessary: "Vain välttämättömät",
    policy: "evästekäytännöstämme",
  },
};

export default function CookieBanner() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function choose(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie_consent_updated", { detail: value }));
  }

  if (!visible) return null;

  const t = strings[locale] ?? strings.en;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(12, 12, 18, 0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, margin: 0 }}>
        {t.msg}{" "}
        <Link href="/privacy#cookies" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>
          {t.policy}
        </Link>.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => choose("all")}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "#E50914",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.accept}
        </button>
        <button
          onClick={() => choose("necessary")}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {t.necessary}
        </button>
      </div>
    </div>
  );
}
