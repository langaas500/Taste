"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/posthog";
import { useLocale } from "@/hooks/useLocale";

const strings = {
  no: {
    authTitle: "Krever gratis konto",
    authDesc: "For å bruke dette trenger vi å vite hva du har sett og hva du liker. Opprett en gratis konto — det tar under ett minutt.",
    createAccount: "Opprett gratis konto",
    login: "Har allerede konto? Logg inn",
  },
  en: {
    authTitle: "Free account required",
    authDesc: "To use this, we need to know what you've watched and what you like. Create a free account — it takes less than a minute.",
    createAccount: "Create free account",
    login: "Already have an account? Log in",
  },
  dk: {
    authTitle: "Kræver gratis konto",
    authDesc: "For at bruge dette skal vi vide hvad du har set og hvad du kan lide. Opret en gratis konto — det tager under et minut.",
    createAccount: "Opret gratis konto",
    login: "Har allerede konto? Log ind",
  },
  se: {
    authTitle: "Kräver gratis konto",
    authDesc: "För att använda detta behöver vi veta vad du har sett och vad du gillar. Skapa ett gratis konto — det tar under en minut.",
    createAccount: "Skapa gratis konto",
    login: "Har redan konto? Logga in",
  },
  fi: {
    authTitle: "Vaatii ilmaisen tilin",
    authDesc: "Käyttääksesi tätä meidän täytyy tietää mitä olet katsonut ja mistä pidät. Luo ilmainen tili — se vie alle minuutin.",
    createAccount: "Luo ilmainen tili",
    login: "Onko jo tili? Kirjaudu",
  },
} as const;

interface ConversionWallProps {
  open: boolean;
  onClose: () => void;
}

export default function ConversionWall({ open, onClose }: ConversionWallProps) {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    if (!open) return;
    track("conversion_wall_viewed", { type: "auth_required" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "linear-gradient(180deg, rgba(15,18,30,0.95) 0%, rgba(10,12,20,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff2a2a">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-white mb-2">{s.authTitle}</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {s.authDesc}
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/login?mode=signup"
            onClick={() => track("conversion_wall_cta_clicked", { target: "signup" })}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
            style={{ background: "#ff2a2a", minHeight: 44 }}
          >
            {s.createAccount}
          </Link>
          <Link
            href="/login"
            onClick={() => track("conversion_wall_cta_clicked", { target: "login" })}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 44,
            }}
          >
            {s.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
