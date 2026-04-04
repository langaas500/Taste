"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/posthog";
import { useLocale } from "@/hooks/useLocale";

/* ── personalized sub ───────────────────────────────────── */
const personalizedSub = {
  no: (name: string, count: number) =>
    `${name}, du har logget ${count} titler. Curator kjenner smaken din — lås opp for å få perfekte anbefalinger.`,
  en: (name: string, count: number) =>
    `${name}, you've logged ${count} titles. Curator knows your taste — unlock it for perfect recommendations.`,
  da: (name: string, count: number) =>
    `${name}, du har logget ${count} titler. Curator kender din smag — lås op for perfekte anbefalinger.`,
  dk: (name: string, count: number) =>
    `${name}, du har logget ${count} titler. Curator kender din smag — lås op for perfekte anbefalinger.`,
  se: (name: string, count: number) =>
    `${name}, du har loggat ${count} titlar. Curator känner din smak — lås upp för perfekta rekommendationer.`,
  fi: (name: string, count: number) =>
    `${name}, olet kirjannut ${count} nimikettä. Curator tuntee makusi — avaa se täydellisiä suosituksia varten.`,
} as const;

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    heading: "29 kr/mnd — for dere begge",
    sub: "Én betaler. Begge får premium.",
    features: [
      { title: "Tonight's Pick daglig", desc: "Film og serie — kuratert for dere begge hver dag" },
      { title: "Par-rapport", desc: "Se hva dere egentlig liker sammen. Vokser over tid." },
      { title: "Ikke mist Curator & AI", desc: "Uten Premium mister du tilgang etter 5 meldinger og 5 anbefalinger" },
    ],
    cta: "Start Logflix Par — 29 kr/mnd",
    lockin: "🔒 29 kr låses for alltid. Partner får også premium. Ingen binding.",
    footer: "Ingen binding. Avslutt når du vil.",
    error: "Noe gikk galt, prøv igjen",
    loading: "Venter...",
  },
  en: {
    heading: "29 NOK/mo (~€2.50) — for both of you",
    sub: "One pays. Both get premium.",
    features: [
      { title: "Tonight's Pick daily", desc: "Movie and series — curated for both of you every day" },
      { title: "Couple report", desc: "See what you actually like together. Grows over time." },
      { title: "Don't lose Curator & AI", desc: "Without Premium you lose access after 5 messages and 5 recommendations" },
    ],
    cta: "Start Logflix Par — 29 NOK/mo (~€2.50)",
    lockin: "🔒 29 NOK locked forever. Your partner gets premium too. No commitment.",
    footer: "No commitment. Cancel anytime.",
    error: "Something went wrong, try again",
    loading: "Please wait...",
  },
  dk: {
    heading: "29 NOK/md (~€2,50) — for jer begge",
    sub: "Én betaler. Begge får premium.",
    features: [
      { title: "Tonight's Pick dagligt", desc: "Film og serie — kurateret for jer begge hver dag" },
      { title: "Par-rapport", desc: "Se hvad I egentlig kan lide sammen. Vokser over tid." },
      { title: "Mist ikke Curator & AI", desc: "Uden Premium mister du adgang efter 5 beskeder og 5 anbefalinger" },
    ],
    cta: "Start Logflix Par — 29 NOK/md (~€2,50)",
    lockin: "🔒 29 NOK låses for altid. Din partner får også premium. Ingen binding.",
    footer: "Ingen binding. Opsig når du vil.",
    error: "Noget gik galt, prøv igen",
    loading: "Vent venligst...",
  },
  se: {
    heading: "29 NOK/mån (~€2,50) — för er båda",
    sub: "En betalar. Båda får premium.",
    features: [
      { title: "Tonight's Pick dagligen", desc: "Film och serie — kuraterat för er båda varje dag" },
      { title: "Par-rapport", desc: "Se vad ni faktiskt gillar tillsammans. Växer över tid." },
      { title: "Förlora inte Curator & AI", desc: "Utan Premium förlorar du tillgång efter 5 meddelanden och 5 rekommendationer" },
    ],
    cta: "Starta Logflix Par — 29 NOK/mån (~€2,50)",
    lockin: "🔒 29 NOK låses för alltid. Din partner får också premium. Ingen bindningstid.",
    footer: "Ingen bindningstid. Avsluta när du vill.",
    error: "Något gick fel, försök igen",
    loading: "Vänta...",
  },
  fi: {
    heading: "29 NOK/kk (~€2,50) — teille molemmille",
    sub: "Yksi maksaa. Molemmat saavat premiumin.",
    features: [
      { title: "Tonight's Pick päivittäin", desc: "Elokuva ja sarja — kuratoitu teille molemmille joka päivä" },
      { title: "Pariraportti", desc: "Näe mistä oikeasti pidätte yhdessä. Kasvaa ajan myötä." },
      { title: "Älä menetä Curatoria & AI:ta", desc: "Ilman Premiumia menetät pääsyn 5 viestin ja 5 suosituksen jälkeen" },
    ],
    cta: "Aloita Logflix Par — 29 NOK/kk (~€2,50)",
    lockin: "🔒 29 NOK lukitaan ikuisesti. Kumppanisi saa myös premiumin. Ei sitoutumista.",
    footer: "Ei sitoutumista. Peru milloin vain.",
    error: "Jokin meni pieleen, yritä uudelleen",
    loading: "Odota...",
  },
} as const;

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  /** User's first name or display_name for personalized text */
  userName?: string | null;
  /** Number of titles the user has logged */
  titleCount?: number | null;
}

export default function PremiumModal({ isOpen, onClose, source, userName, titleCount }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => {
        const period = d.periods?.[locale] || d.periods?.en || "/mo";
        setPriceLabel(`${d.price}${period}`);
        setSpotsLeft(d.spots_left ?? null);
      })
      .catch(() => {});
  }, [isOpen, locale]);
  const pFn = personalizedSub[locale as keyof typeof personalizedSub] ?? personalizedSub.en;
  const subText = userName && titleCount != null && titleCount > 0
    ? pFn(userName, titleCount)
    : s.sub;

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
        <h2 className="text-xl font-bold text-white mb-1.5">
          {priceLabel
            ? `${priceLabel} — ${locale === "no" ? "for dere begge" : locale === "dk" ? "for jer begge" : locale === "se" ? "för er båda" : locale === "fi" ? "teille molemmille" : "for both of you"}`
            : s.heading}
        </h2>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
          {subText}
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
          {loading ? s.loading : priceLabel
            ? `${locale === "no" ? "Start Logflix Par" : locale === "dk" ? "Start Logflix Par" : locale === "se" ? "Starta Logflix Par" : locale === "fi" ? "Aloita Logflix Par" : "Start Logflix Par"} — ${priceLabel}`
            : s.cta}
        </button>

        {/* Spots left */}
        {spotsLeft !== null && spotsLeft <= 100 && (
          <p className="text-xs text-center mt-2 font-semibold" style={{ color: "rgba(255,42,42,0.7)" }}>
            {locale === "no" ? `Kun ${spotsLeft} plasser igjen` : locale === "dk" ? `Kun ${spotsLeft} pladser tilbage` : locale === "se" ? `Endast ${spotsLeft} platser kvar` : locale === "fi" ? `Vain ${spotsLeft} paikkaa jäljellä` : `Only ${spotsLeft} spots left`}
          </p>
        )}

        {/* Lock-in text */}
        <p
          className="text-[11px] text-center mt-3 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {priceLabel
            ? `🔒 ${priceLabel} ${locale === "no" ? "låses for alltid. Partner får også premium. Ingen binding." : locale === "dk" ? "låses for altid. Din partner får også premium. Ingen binding." : locale === "se" ? "låses för alltid. Din partner får också premium. Ingen bindningstid." : locale === "fi" ? "lukitaan ikuisesti. Kumppanisi saa myös premiumin. Ei sitoutumista." : "locked forever. Your partner gets premium too. No commitment."}`
            : s.lockin}
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
