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
      { title: "Ubegrensede AI-anbefalinger", desc: "Få nye filmanbefalinger hver dag — ikke bare 5" },
      { title: "Full smaksprofil", desc: "Se hele analysen av filmsmaken din, ikke bare et glimt" },
      { title: "Curator uten grenser", desc: "Chat med AI om film og serier så mye du vil" },
    ],
    cta: "Bli Founding Member — 29 kr/mnd",
    lockin: "\u{1F512} Du låser inn 29 kr for alltid. Prisen øker snart for nye medlemmer.",
    footer: "Ingen binding. Avslutt når du vil.",
    error: "Noe gikk galt, prøv igjen",
    loading: "Venter...",
  },
  en: {
    heading: "Become a Founding Member",
    sub: "Find your next binge-worthy show – without the debate. First 500 only.",
    features: [
      { title: "Unlimited AI recommendations", desc: "Get new movie recommendations every day — not just 5" },
      { title: "Full taste profile", desc: "See your complete film taste analysis, not just a preview" },
      { title: "Unlimited Curator", desc: "Chat with AI about movies and shows as much as you want" },
    ],
    cta: "Become a Founding Member — 29 kr/mo",
    lockin: "\u{1F512} You lock in 29 kr forever. Price increases soon for new members.",
    footer: "No commitment. Cancel anytime.",
    error: "Something went wrong, try again",
    loading: "Please wait...",
  },
  dk: {
    heading: "Bliv Founding Member",
    sub: "Find jeres næste serie at binge – uden diskussionen. Kun for de første 500.",
    features: [
      { title: "Ubegrænsede AI-anbefalinger", desc: "Få nye filmanbefalinger hver dag — ikke kun 5" },
      { title: "Fuld smagsprofil", desc: "Se hele analysen af din filmsmag, ikke kun et glimt" },
      { title: "Curator uden grænser", desc: "Chat med AI om film og serier så meget du vil" },
    ],
    cta: "Bliv Founding Member — 29 kr/md",
    lockin: "\u{1F512} Du låser 29 kr for altid. Prisen stiger snart for nye medlemmer.",
    footer: "Ingen binding. Opsig når du vil.",
    error: "Noget gik galt, prøv igen",
    loading: "Vent venligst...",
  },
  se: {
    heading: "Bli en Founding Member",
    sub: "Hitta nästa serie ni ska binga – utan diskussionen. Bara för de första 500.",
    features: [
      { title: "Obegränsade AI-rekommendationer", desc: "Få nya filmrekommendationer varje dag — inte bara 5" },
      { title: "Fullständig smakprofil", desc: "Se hela analysen av din filmsmak, inte bara ett smakprov" },
      { title: "Curator utan gränser", desc: "Chatta med AI om film och serier hur mycket du vill" },
    ],
    cta: "Bli Founding Member — 29 kr/mån",
    lockin: "\u{1F512} Du låser in 29 kr för alltid. Priset höjs snart för nya medlemmar.",
    footer: "Ingen bindningstid. Avsluta när du vill.",
    error: "Något gick fel, försök igen",
    loading: "Vänta...",
  },
  fi: {
    heading: "Liity Founding Memberiksi",
    sub: "Löydä seuraava sarjanne – ilman väittelyä. Vain ensimmäisille 500:lle.",
    features: [
      { title: "Rajattomat AI-suositukset", desc: "Saa uusia elokuvasuosituksia joka päivä — ei vain 5" },
      { title: "Täydellinen makuprofiili", desc: "Näe koko elokuvamakusi analyysi, ei vain esikatselu" },
      { title: "Curator ilman rajoja", desc: "Keskustele AI:n kanssa elokuvista niin paljon kuin haluat" },
    ],
    cta: "Liity Founding Memberiksi — 29 kr/kk",
    lockin: "\u{1F512} Lukitset 29 kr ikuisesti. Hinta nousee pian uusille jäsenille.",
    footer: "Ei sitoutumista. Peru milloin vain.",
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
        <ul className="space-y-3 mb-5">
          {s.features.map((f) => (
            <li key={f.title} className="flex gap-2.5">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
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
              <div>
                <span className="text-sm font-medium text-white/90">{f.title}</span>
                <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
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

        {/* Lock-in text */}
        <p
          className="text-[11px] text-center mt-3 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {s.lockin}
        </p>

        {/* Footer */}
        <p
          className="text-xs text-center mt-2"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {s.footer}
        </p>
      </div>
    </div>
  );
}
