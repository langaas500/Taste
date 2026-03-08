"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/posthog";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export default function PremiumModal({ isOpen, onClose, source }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError("Noe gikk galt, prøv igjen");
      }
    } catch {
      setError("Noe gikk galt, prøv igjen");
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  const features = [
    "Ubegrensede AI-anbefalinger",
    "Personlig smaksprofil (refresh når du vil)",
  ];

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

        {/* Heading */}
        <h2 className="text-lg font-bold text-white mb-3">Logflix Premium</h2>

        {/* Founding member badge */}
        <div
          className="rounded-xl px-3.5 py-2.5 mb-4"
          style={{
            background: "rgba(255,42,42,0.08)",
            border: "1px solid rgba(255,42,42,0.15)",
          }}
        >
          <p className="text-sm font-semibold text-white/90 mb-0.5">
            Founding Member-pris — eksklusivt for de første 500
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Lås inn 29,-/mnd for alltid
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-white">29 kr</span>
          <span
            className="text-sm ml-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            /mnd
          </span>
        </div>

        {/* Feature list */}
        <ul className="space-y-2 mb-5">
          {features.map((f) => (
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
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90 hover:-translate-y-[2px] disabled:opacity-50"
          style={{ background: "linear-gradient(#B00000, #E50914)", minHeight: 44 }}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {loading ? "Venter..." : "Bli Premium-medlem"}
        </button>

        {/* Subtext */}
        <p
          className="text-xs text-center mt-3"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Avslutt når som helst. Betaling via Stripe.
        </p>
      </div>
    </div>
  );
}
