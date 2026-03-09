"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/posthog";
import { useLocale } from "@/hooks/useLocale";

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    heading: "Bli en Founding Member",
    sub: "Finn neste serie dere skal binge – uten diskusjonen. Kun for de første 500.",
    features: [
      "Match på tvers av serier og filmer på alle strømmetjenester",
      "Se nøyaktig hvilken sjanger som dominerer i deres stue",
      "Full tilgang til AI-Curator for både film og serier",
    ],
    cta: "Sikre din plass — 29 kr",
    footer: "Ingen binding. Avslutt når du vil med ett klikk.",
    error: "Noe gikk galt, prøv igjen",
    loading: "Venter...",
  },
  en: {
    heading: "Become a Founding Member",
    sub: "Find your next binge-worthy show – without the debate. First 500 only.",
    features: [
      "Match across shows and movies on all streaming services",
      "See exactly which genre dominates your watch habits",
      "Full access to AI Curator for both movies and shows",
    ],
    cta: "Secure your spot — 29 kr",
    footer: "No commitment. Cancel anytime with one click.",
    error: "Something went wrong, try again",
    loading: "Please wait...",
  },
  dk: {
    heading: "Bliv Founding Member",
    sub: "Find jeres næste serie at binge – uden diskussionen. Kun for de første 500.",
    features: [
      "Match på tværs af serier og film på alle streamingtjenester",
      "Se præcis hvilken genre der dominerer i jeres stue",
      "Fuld adgang til AI-Curator for både film og serier",
    ],
    cta: "Sikr din plads — 29 kr",
    footer: "Ingen binding. Opsig når du vil med ét klik.",
    error: "Noget gik galt, prøv igen",
    loading: "Vent venligst...",
  },
  se: {
    heading: "Bli en Founding Member",
    sub: "Hitta nästa serie ni ska binga – utan diskussionen. Bara för de första 500.",
    features: [
      "Matcha serier och filmer på alla streamingtjänster",
      "Se exakt vilken genre som dominerar i ert vardagsrum",
      "Full tillgång till AI-Curator för både film och serier",
    ],
    cta: "Säkra din plats — 29 kr",
    footer: "Ingen bindningstid. Avsluta när du vill med ett klick.",
    error: "Något gick fel, försök igen",
    loading: "Vänta...",
  },
  fi: {
    heading: "Liity Founding Memberiksi",
    sub: "Löydä seuraava sarjanne – ilman väittelyä. Vain ensimmäisille 500:lle.",
    features: [
      "Yhdistä sarjat ja elokuvat kaikista suoratoistopalveluista",
      "Näe tarkalleen mikä genre hallitsee katselutottumuksianne",
      "Täysi pääsy AI-kuraattoriin elokuville ja sarjoille",
    ],
    cta: "Varaa paikkasi — 29 kr",
    footer: "Ei sitoutumista. Peru milloin vain yhdellä klikkauksella.",
    error: "Jokin meni pieleen, yritä uudelleen",
    loading: "Odota...",
  },
} as const;

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export default function PremiumModal({ isOpen, onClose, source }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    if (!isOpen) return;
    track("premium_modal_viewed", { source });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, source]);

  async function handleCheckout() {
    track("premium_checkout_initiated", { source });
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(s.error);
      }
    } catch {
      setError(s.error);
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{
        background: "rgba(0,0,0,0.70)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,18,30,0.95) 0%, rgba(10,12,20,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Heading + sub */}
        <h2 className="text-xl font-bold text-white mb-1.5">{s.heading}</h2>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
          {s.sub}
        </p>

        {/* Feature list */}
        <ul className="space-y-2 mb-5">
          {s.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="#ff2a2a"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-sm text-white/70">{f}</span>
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
        )}

        {/* CTA */}
        <style>{`@keyframes ctaGlow{0%,100%{box-shadow:0 0 20px rgba(229,9,20,0.35)}50%{box-shadow:0 0 32px rgba(229,9,20,0.55)}}`}</style>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90 hover:-translate-y-[2px] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #B00000, #E50914)",
            minHeight: 44,
            animation: "ctaGlow 2s ease-in-out infinite",
          }}
        >
          {loading ? s.loading : s.cta}
        </button>

        {/* Subtext */}
        <p
          className="text-xs text-center mt-3"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {s.footer}
        </p>
      </div>
    </div>
  );
}
