"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";
import StreamingModal from "@/components/StreamingModal";
import { useLocale } from "@/hooks/useLocale";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/i18n";

/* ── Types ───────────────────────────────────────────── */

interface TonightPickItem {
  tmdb_id: number;
  type: string;
  title: string;
  poster_path: string | null;
  match_score: number | null;
}

interface TonightPickData {
  movie: TonightPickItem | null;
  series: TonightPickItem | null;
  reroll_count: number;
  solo: boolean;
}

/* ── i18n ─────────────────────────────────────────────── */

const strings = {
  no: {
    pageTitle: "Premium",
    tonightPick: "Tonight's Pick",
    newPick: "Ny pick",
    watchNow: "Se nå →",
    match: "match",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personlige filmrådgiver",
    curatorCta: "Åpne Curator →",
    recTitle: "Anbefalinger",
    recDesc: "Filmer tilpasset din smak",
    recCta: "Se anbefalinger →",
    wrappedTitle: "Wrapped",
    wrappedDesc: "Din månedlige filmoppsummering",
    wrappedCta: "Se Wrapped →",
    tasteTitle: "Smaksreise",
    tasteDesc: "Se hvordan smaken din utvikler seg",
    tasteCta: "Se reisen →",
    coupleTitle: "Par-rapport",
    coupleDesc: "Kompatibilitet og matchhistorikk",
    coupleCta: "Se rapport →",
    foundingTitle: "Founding Member",
    foundingDesc: (d: string) => `Medlem siden ${d}`,
    foundingFallback: "Takk for at du er tidlig ute",
    partnerBanner: "Partneren din får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Inviter partner",
    upgradeCta: "Lås opp →",
    lockedDesc: "Oppgrader for å få tilgang",
    heroTitle: "Slutt å krangle om hva dere skal se.",
    heroCta: "Bli Founding Member",
    startPremium: "Start Premium",
    forBoth: "for dere begge.",
    spotsLeft: (n: number) => `Kun ${n} plasser igjen`,
  },
  en: {
    pageTitle: "Premium",
    tonightPick: "Tonight's Pick",
    newPick: "New pick",
    watchNow: "Watch now →",
    match: "match",
    curatorTitle: "Curator AI",
    curatorDesc: "Your personal film advisor",
    curatorCta: "Open Curator →",
    recTitle: "Recommendations",
    recDesc: "Movies matched to your taste",
    recCta: "See recommendations →",
    wrappedTitle: "Wrapped",
    wrappedDesc: "Your monthly film summary",
    wrappedCta: "See Wrapped →",
    tasteTitle: "Taste Evolution",
    tasteDesc: "See how your taste evolves",
    tasteCta: "See journey →",
    coupleTitle: "Couple Report",
    coupleDesc: "Compatibility and match history",
    coupleCta: "See report →",
    foundingTitle: "Founding Member",
    foundingDesc: (d: string) => `Member since ${d}`,
    foundingFallback: "Thanks for being early",
    partnerBanner: "Your partner gets Premium free",
    partnerHas: (name: string) => `${name} has Premium`,
    invitePartner: "Invite partner",
    upgradeCta: "Unlock →",
    lockedDesc: "Upgrade to access",
    heroTitle: "Stop arguing about what to watch.",
    heroCta: "Become Founding Member",
    startPremium: "Start Premium",
    forBoth: "for both of you.",
    spotsLeft: (n: number) => `Only ${n} spots left`,
  },
  dk: {
    pageTitle: "Premium",
    tonightPick: "Tonight's Pick",
    newPick: "Nyt pick",
    watchNow: "Se nu →",
    match: "match",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personlige filmrådgiver",
    curatorCta: "Åbn Curator →",
    recTitle: "Anbefalinger",
    recDesc: "Film tilpasset din smag",
    recCta: "Se anbefalinger →",
    wrappedTitle: "Wrapped",
    wrappedDesc: "Din månedlige filmoversigt",
    wrappedCta: "Se Wrapped →",
    tasteTitle: "Smagsrejse",
    tasteDesc: "Se hvordan din smag udvikler sig",
    tasteCta: "Se rejsen →",
    coupleTitle: "Parrapport",
    coupleDesc: "Kompatibilitet og matchhistorik",
    coupleCta: "Se rapport →",
    foundingTitle: "Founding Member",
    foundingDesc: (d: string) => `Medlem siden ${d}`,
    foundingFallback: "Tak fordi du var tidligt ude",
    partnerBanner: "Din partner får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Inviter partner",
    upgradeCta: "Lås op →",
    lockedDesc: "Opgrader for adgang",
    heroTitle: "Stop med at skændes om hvad I skal se.",
    heroCta: "Bliv Founding Member",
    startPremium: "Start Premium",
    forBoth: "for jer begge.",
    spotsLeft: (n: number) => `Kun ${n} pladser tilbage`,
  },
  se: {
    pageTitle: "Premium",
    tonightPick: "Tonight's Pick",
    newPick: "Nytt pick",
    watchNow: "Se nu →",
    match: "match",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personliga filmrådgivare",
    curatorCta: "Öppna Curator →",
    recTitle: "Rekommendationer",
    recDesc: "Filmer anpassade till din smak",
    recCta: "Se rekommendationer →",
    wrappedTitle: "Wrapped",
    wrappedDesc: "Din månatliga filmsammanfattning",
    wrappedCta: "Se Wrapped →",
    tasteTitle: "Smakresa",
    tasteDesc: "Se hur din smak utvecklas",
    tasteCta: "Se resan →",
    coupleTitle: "Parrapport",
    coupleDesc: "Kompatibilitet och matchhistorik",
    coupleCta: "Se rapport →",
    foundingTitle: "Founding Member",
    foundingDesc: (d: string) => `Medlem sedan ${d}`,
    foundingFallback: "Tack för att du var tidig",
    partnerBanner: "Din partner får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Bjud in partner",
    upgradeCta: "Lås upp →",
    lockedDesc: "Uppgradera för tillgång",
    heroTitle: "Sluta bråka om vad ni ska se.",
    heroCta: "Bli Founding Member",
    startPremium: "Starta Premium",
    forBoth: "för er båda.",
    spotsLeft: (n: number) => `Endast ${n} platser kvar`,
  },
  fi: {
    pageTitle: "Premium",
    tonightPick: "Tonight's Pick",
    newPick: "Uusi valinta",
    watchNow: "Katso nyt →",
    match: "osuma",
    curatorTitle: "Curator AI",
    curatorDesc: "Henkilökohtainen elokuvaneuvojasi",
    curatorCta: "Avaa Curator →",
    recTitle: "Suositukset",
    recDesc: "Elokuvat makuusi sopiviksi",
    recCta: "Katso suositukset →",
    wrappedTitle: "Wrapped",
    wrappedDesc: "Kuukausittainen elokuvayhteenveto",
    wrappedCta: "Katso Wrapped →",
    tasteTitle: "Makumatka",
    tasteDesc: "Katso miten makusi kehittyy",
    tasteCta: "Katso matka →",
    coupleTitle: "Pariraportti",
    coupleDesc: "Yhteensopivuus ja osumahistoria",
    coupleCta: "Katso raportti →",
    foundingTitle: "Founding Member",
    foundingDesc: (d: string) => `Jäsen alkaen ${d}`,
    foundingFallback: "Kiitos että olit ajoissa",
    partnerBanner: "Kumppanisi saa Premiumin ilmaiseksi",
    partnerHas: (name: string) => `${name} on Premium`,
    invitePartner: "Kutsu kumppani",
    upgradeCta: "Avaa →",
    lockedDesc: "Päivitä pääsyä varten",
    heroTitle: "Lopeta riitely siitä mitä katsotte.",
    heroCta: "Liity Founding Memberiksi",
    startPremium: "Aloita Premium",
    forBoth: "teille molemmille.",
    spotsLeft: (n: number) => `Vain ${n} paikkaa jäljellä`,
  },
} as const;

/* ── Page ────────────────────────────────────────────── */

export default function PremiumHubPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [priceLabel, setPriceLabel] = useState("");
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isFoundingAvailable, setIsFoundingAvailable] = useState(true);
  const [tonightPick, setTonightPick] = useState<TonightPickData | null>(null);
  const [tpRerolling, setTpRerolling] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [foundingDate, setFoundingDate] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileTitleCount, setProfileTitleCount] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<{ id: number; type: "movie" | "tv"; title: string; poster_path: string | null } | null>(null);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    document.body.classList.add("premium-bg-override");
    return () => { document.body.classList.remove("premium-bg-override"); };
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const premium = !!d.profile?.is_premium;
        setIsPremium(premium);
        if (d.profile?.display_name) setProfileName(d.profile.display_name);
        if (d.profile?.title_count != null) setProfileTitleCount(d.profile.title_count);
        if (d.profile?.premium_since) {
          const date = new Date(d.profile.premium_since);
          const dateLocale = locale === "no" ? "nb-NO" : locale === "se" ? "sv-SE" : locale === "dk" ? "da-DK" : locale === "fi" ? "fi-FI" : "en-US";
          setFoundingDate(date.toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }));
        }
        if (premium) loadPremiumData();
      })
      .catch(() => setIsPremium(false));

    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => {
        const period = d.periods?.[locale] || d.periods?.en || "/mo";
        setPriceLabel(`${d.price}${period}`);
        setSpotsLeft(d.spots_left ?? null);
        setIsFoundingAvailable(d.is_founding_available ?? true);
      })
      .catch(() => {});
  }, []);

  async function loadPremiumData() {
    const [tpRes, friendsRes] = await Promise.all([
      fetch("/api/tonight-pick").then(r => r.json()).catch(() => null),
      fetch("/api/friends/titles").then(r => r.json()).catch(() => null),
    ]);
    if (tpRes && !tpRes.error) setTonightPick(tpRes);
    if (friendsRes?.friendName) setPartnerName(friendsRes.friendName);
  }

  async function handleReroll() {
    setTpRerolling(true);
    try {
      const res = await fetch("/api/tonight-pick", { method: "POST" });
      if (res.ok) setTonightPick(await res.json());
    } catch { /* ignore */ }
    setTpRerolling(false);
  }

  // Loading skeleton
  if (isPremium === null) {
    return (
      <div className="animate-fade-in-up max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── Feature card helper ── */
  function FeatureCard({ href, icon, title, desc, cta, locked, gold }: {
    href: string; icon: React.ReactNode; title: string; desc: string; cta: string; locked?: boolean; gold?: boolean;
  }) {
    const content = (
      <div
        className="group relative rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 h-full"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: gold ? "1px solid rgba(255,184,0,0.25)" : "1px solid rgba(255,255,255,0.06)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
          background: gold ? "rgba(255,184,0,0.1)" : "rgba(255,42,42,0.08)",
          border: gold ? "1px solid rgba(255,184,0,0.25)" : "1px solid rgba(255,42,42,0.15)",
        }}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white/90 mb-1">{title}</p>
          <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
        </div>
        <p className="text-xs font-semibold" style={{ color: gold ? "#FFB800" : "#ff2a2a" }}>{cta}</p>
        {locked && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}>
            <div className="text-center">
              <span className="text-lg">🔒</span>
              <p className="text-[10px] text-white/40 mt-1">{s.lockedDesc}</p>
            </div>
          </div>
        )}
      </div>
    );
    if (locked) return <div className="cursor-pointer" onClick={() => setShowModal(true)}>{content}</div>;
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }

  const isLocked = !isPremium;

  // Get current month for wrapped link
  const now = new Date();
  const wrappedSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="animate-fade-in-up mx-auto pb-8" style={{ maxWidth: 720 }}>

      {/* ── NON-PREMIUM: Upgrade hero ── */}
      {!isPremium && (
        <div className="rounded-2xl overflow-hidden mb-6 relative" style={{ border: "1px solid rgba(229,9,20,0.25)", background: "rgba(255,255,255,0.02)" }}>
          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#E50914" }}>Logflix Premium</p>
            <h1 className="text-xl font-extrabold text-white tracking-tight mb-2">{s.heroTitle}</h1>
            <p className="text-sm text-white/40 mb-4">{priceLabel ? `${priceLabel} — ${s.forBoth}` : "\u00A0"}</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #E50914, #82060c)" }}>
              {isFoundingAvailable ? `${s.heroCta} — ${priceLabel || "..."} →` : `${s.startPremium} — ${priceLabel || "..."} →`}
            </button>
            {isFoundingAvailable && spotsLeft !== null && spotsLeft <= 100 && (
              <p className="mt-2 text-xs font-semibold" style={{ color: "rgba(255,42,42,0.7)" }}>{s.spotsLeft(spotsLeft)}</p>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 1: Tonight's Pick (compact) ── */}
      {isPremium && tonightPick && (tonightPick.movie || tonightPick.series) && (() => {
        const pick = tonightPick.movie || tonightPick.series;
        if (!pick) return null;
        return (
          <div className="rounded-2xl mb-6 flex items-center gap-4 p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", maxHeight: 120 }}>
            {/* Poster */}
            {pick.poster_path && (
              <div className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer" style={{ width: 60, height: 90 }}
                onClick={() => setSelectedTitle({ id: pick.tmdb_id, type: pick.type as "movie" | "tv", title: pick.title, poster_path: pick.poster_path })}>
                <Image src={`https://image.tmdb.org/t/p/w185${pick.poster_path}`} alt={pick.title} fill className="object-cover" sizes="60px" />
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1">{s.tonightPick}</p>
              <p className="text-sm font-bold text-white/90 truncate">{pick.title}</p>
              {pick.match_score != null && (
                <p className="text-[11px] mt-0.5" style={{ color: "#FFB800" }}>★ {pick.match_score}% {s.match}</p>
              )}
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedTitle({ id: pick.tmdb_id, type: pick.type as "movie" | "tv", title: pick.title, poster_path: pick.poster_path })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#ff2a2a" }}
              >{s.watchNow}</button>
              <button onClick={handleReroll} disabled={tpRerolling}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 transition-all hover:text-white/60"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >{tpRerolling ? "..." : `↻ ${s.newPick}`}</button>
            </div>
          </div>
        );
      })()}

      {/* Non-premium: blurred Tonight's Pick */}
      {!isPremium && (
        <div className="rounded-2xl mb-6 flex items-center gap-4 p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", maxHeight: 120 }}>
          <div className="flex-shrink-0 rounded-lg" style={{ width: 60, height: 90, background: "rgba(255,255,255,0.05)", filter: "blur(4px)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1">{s.tonightPick}</p>
            <div className="h-3 rounded bg-white/10 mb-1 w-3/4" style={{ filter: "blur(3px)" }} />
            <div className="h-2 rounded bg-white/5 w-1/2" style={{ filter: "blur(3px)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
            <button onClick={() => setShowModal(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.3)", color: "#FFB800" }}>
              🔒 {s.upgradeCta}
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 2: Feature grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <FeatureCard
          href="/curator"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c.5 0 2.5 4 2.5 4s4.5.5 4.5 1-3 3.5-3 3.5.5 4.5 0 4.5-3.5-2.5-4-2.5-3.5 3-4 2.5.5-4.5 0-4.5-3-3-3-3.5 4.5-1 4.5-1S11.5 3 12 3z"/><circle cx="12" cy="12" r="3" strokeWidth="1.2"/></svg>}
          title={s.curatorTitle}
          desc={s.curatorDesc}
          cta={s.curatorCta}
          locked={isLocked}
        />
        <FeatureCard
          href="/recommendations"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path d="M18 5l.5 1.5L20 7l-1.5.5L18 9l-.5-1.5L16 7l1.5-.5L18 5z" strokeWidth="1.2"/></svg>}
          title={s.recTitle}
          desc={s.recDesc}
          cta={s.recCta}
          locked={isLocked}
        />
        <FeatureCard
          href={`/wrapped/${wrappedSlug}`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12M3 12h18M12 8c-2 0-4-2.5-4-4s2-2 4 0 4-2 4 0-2 4-4 4z"/></svg>}
          title={s.wrappedTitle}
          desc={s.wrappedDesc}
          cta={s.wrappedCta}
          locked={isLocked}
        />
        <FeatureCard
          href="/taste-evolution"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          title={s.tasteTitle}
          desc={s.tasteDesc}
          cta={s.tasteCta}
          locked={isLocked}
        />
        <FeatureCard
          href="/couple-report"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          title={s.coupleTitle}
          desc={s.coupleDesc}
          cta={s.coupleCta}
          locked={isLocked}
        />
        {/* Founding Member — gold accent, no lock */}
        <div className="rounded-2xl p-5 flex flex-col gap-3 h-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,184,0,0.2)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.25)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB800" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: "#FFB800" }}>{s.foundingTitle}</p>
            <p className="text-xs text-white/40 leading-relaxed">
              {isPremium && foundingDate ? s.foundingDesc(foundingDate) : isPremium ? s.foundingFallback : s.lockedDesc}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Partner banner ── */}
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg">💑</span>
          <p className="text-sm text-white/60">
            {partnerName ? s.partnerHas(partnerName) : s.partnerBanner}
          </p>
        </div>
        {!partnerName && isPremium && (
          <Link href="/settings" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
            {s.invitePartner}
          </Link>
        )}
      </div>

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" userName={profileName} titleCount={profileTitleCount} />

      {selectedTitle && (
        <StreamingModal
          tmdbId={selectedTitle.id}
          type={selectedTitle.type}
          title={selectedTitle.title}
          posterPath={selectedTitle.poster_path}
          onClose={() => setSelectedTitle(null)}
        />
      )}
    </div>
  );
}
