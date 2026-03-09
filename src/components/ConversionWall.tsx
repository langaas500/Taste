"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PremiumModal from "@/components/PremiumModal";
import { track } from "@/lib/posthog";
import { useLocale } from "@/hooks/useLocale";

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    upgradePremium: "Oppgrader til Premium",
    saveTaste: "Lagre smaken din",
    premiumDesc: "Få ubegrenset tilgang til AI-anbefalinger, smaksprofil-oppdateringer og mer.",
    signupDesc: "Du har allerede begynt å forme anbefalingene dine. Opprett gratis konto for å lagre fremgangen og få bedre treff.",
    createAccount: "Opprett gratis konto",
    login: "Logg inn",
  },
  en: {
    upgradePremium: "Upgrade to Premium",
    saveTaste: "Save your taste",
    premiumDesc: "Get unlimited access to AI recommendations, taste profile updates and more.",
    signupDesc: "You've already started shaping your recommendations. Create a free account to save your progress and get better matches.",
    createAccount: "Create free account",
    login: "Log in",
  },
  dk: {
    upgradePremium: "Opgrader til Premium",
    saveTaste: "Gem din smag",
    premiumDesc: "Få ubegrænset adgang til AI-anbefalinger, smagsprofil-opdateringer og mere.",
    signupDesc: "Du er allerede begyndt at forme dine anbefalinger. Opret gratis konto for at gemme din fremgang og få bedre matches.",
    createAccount: "Opret gratis konto",
    login: "Log ind",
  },
  se: {
    upgradePremium: "Uppgradera till Premium",
    saveTaste: "Spara din smak",
    premiumDesc: "Få obegränsad tillgång till AI-rekommendationer, smakprofiluppdateringar och mer.",
    signupDesc: "Du har redan börjat forma dina rekommendationer. Skapa gratis konto för att spara dina framsteg och få bättre matchningar.",
    createAccount: "Skapa gratis konto",
    login: "Logga in",
  },
  fi: {
    upgradePremium: "Päivitä Premiumiin",
    saveTaste: "Tallenna makusi",
    premiumDesc: "Saa rajaton pääsy AI-suosituksiin, makuprofiilipäivityksiin ja muuhun.",
    signupDesc: "Olet jo alkanut muokata suosituksiasi. Luo ilmainen tili tallentaaksesi edistymisesi ja saadaksesi parempia osumia.",
    createAccount: "Luo ilmainen tili",
    login: "Kirjaudu",
  },
} as const;

interface ConversionWallProps {
  open: boolean;
  onClose: () => void;
  /** If true, show "Upgrade to Premium" instead of signup/login */
  premium?: boolean;
}

export default function ConversionWall({ open, onClose, premium }: ConversionWallProps) {
  const [showPremium, setShowPremium] = useState(false);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    if (!open) return;
    track("conversion_wall_viewed", { type: premium ? "recommendation_limit" : "auth_required" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, premium]);

  if (!open) return null;

  return (
    <>
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,42,42,0.1)", border: "1px solid rgba(255,42,42,0.15)" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff2a2a">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-white mb-2">
            {premium ? s.upgradePremium : s.saveTaste}
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            {premium ? s.premiumDesc : s.signupDesc}
          </p>

          <div className="flex flex-col gap-2.5">
            {premium ? (
              <button
                onClick={() => { track("conversion_wall_cta_clicked", { target: "premium" }); setShowPremium(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90 hover:-translate-y-[2px]"
                style={{ background: "linear-gradient(#B00000, #E50914)", minHeight: 44 }}
              >
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {s.upgradePremium}
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="conversion_wall" />
    </>
  );
}
