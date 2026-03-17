"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

/* ── locale strings ──────────────────────────────────── */

const partnerStrings = {
  no: {
    title: "Inviter partneren din \u{1F491}",
    desc: "Du har betalt \u2014 n\u00e5 kan partneren din ogs\u00e5 f\u00e5 premium gratis. Del lenken:",
    imessage: "Send iMessage",
    whatsapp: "Send WhatsApp",
    copy: "Kopier lenke",
    copied: "Kopiert!",
    dismiss: "Gj\u00f8r dette senere",
    loading: "Genererer lenke...",
  },
  en: {
    title: "Invite your partner \u{1F491}",
    desc: "You\u2019ve paid \u2014 now your partner can get premium for free too. Share the link:",
    imessage: "Send iMessage",
    whatsapp: "Send WhatsApp",
    copy: "Copy link",
    copied: "Copied!",
    dismiss: "Do this later",
    loading: "Generating link...",
  },
  dk: {
    title: "Inviter din partner \u{1F491}",
    desc: "Du har betalt \u2014 nu kan din partner ogs\u00e5 f\u00e5 premium gratis. Del linket:",
    imessage: "Send iMessage",
    whatsapp: "Send WhatsApp",
    copy: "Kopier link",
    copied: "Kopieret!",
    dismiss: "G\u00f8r dette senere",
    loading: "Genererer link...",
  },
  se: {
    title: "Bjud in din partner \u{1F491}",
    desc: "Du har betalat \u2014 nu kan din partner ocks\u00e5 f\u00e5 premium gratis. Dela l\u00e4nken:",
    imessage: "Skicka iMessage",
    whatsapp: "Skicka WhatsApp",
    copy: "Kopiera l\u00e4nk",
    copied: "Kopierad!",
    dismiss: "G\u00f6r detta senare",
    loading: "Genererar l\u00e4nk...",
  },
  fi: {
    title: "Kutsu kumppanisi \u{1F491}",
    desc: "Olet maksanut \u2014 nyt kumppanisi voi saada premiumin ilmaiseksi. Jaa linkki:",
    imessage: "L\u00e4het\u00e4 iMessage",
    whatsapp: "L\u00e4het\u00e4 WhatsApp",
    copy: "Kopioi linkki",
    copied: "Kopioitu!",
    dismiss: "Tee t\u00e4m\u00e4 my\u00f6hemmin",
    loading: "Luodaan linkki\u00e4...",
  },
} as const;

const strings = {
  no: {
    foundingLabel: "Founding Member",
    priceLabel: "/ mnd",
    heroSub: "Vær med fra starten. Founding Members låser inn 29 kr for alltid — prisen øker når vi åpner for alle.",
    lockin: "\u{1F512} Du låser inn 29 kr for alltid. Prisen øker snart for nye medlemmer.",
    premiumHeading: "Du er med.",
    premiumSub: "Full tilgang til alle Pro-funksjoner. Takk for at du er en Founding Member.",
    cta: "Bli Founding Member",
    curatorTitle: "Din personlige AI-filmekspert",
    curatorDesc: "Beskriv en stemning, en følelse eller en skuespiller — og få skreddersydde anbefalinger tilpasset deg. Curator kjenner smaken din og finner alltid noe nytt.",
    openCurator: "Åpne Curator",
    open: "Åpne",
    tasteTitle: "Smaksprofil",
    tasteDesc: "AI-generert analyse av filmsmaken din. Hva du liker, hva du unngår, og dine foretrukne temaer.",
    recTitle: "For deg",
    recDesc: "Personlige anbefalinger basert på biblioteket og smaksprofilen din.",
    statsTitle: "Statistikk",
    statsDesc: "Dyptgående statistikk over filmvanene dine. Sjangre, vurderinger og trender.",
  },
  en: {
    foundingLabel: "Founding Member",
    priceLabel: "/ mo",
    heroSub: "Be part of it from the start. Founding Members lock in 29 NOK forever — price increases when we open to everyone.",
    lockin: "\u{1F512} Lock in 29 NOK forever. Price increases soon for new members.",
    premiumHeading: "You're in.",
    premiumSub: "Full access to all Pro features. Thank you for being a Founding Member.",
    cta: "Become a Founding Member",
    curatorTitle: "Your personal AI film expert",
    curatorDesc: "Describe a mood, a feeling or an actor — and get tailored recommendations just for you. Curator knows your taste and always finds something new.",
    openCurator: "Open Curator",
    open: "Open",
    tasteTitle: "Taste Profile",
    tasteDesc: "AI-generated analysis of your film taste. What you like, what you avoid, and your preferred themes.",
    recTitle: "For You",
    recDesc: "Personal recommendations based on your library and taste profile.",
    statsTitle: "Statistics",
    statsDesc: "In-depth statistics on your viewing habits. Genres, ratings and trends.",
  },
  dk: {
    foundingLabel: "Founding Member",
    priceLabel: "/ md",
    heroSub: "Vær med fra starten. Founding Members låser 29 NOK for altid — prisen stiger når vi åbner for alle.",
    lockin: "\u{1F512} Lås 29 NOK for altid. Prisen stiger snart for nye medlemmer.",
    premiumHeading: "Du er med.",
    premiumSub: "Fuld adgang til alle Pro-funktioner. Tak fordi du er en Founding Member.",
    cta: "Bliv Founding Member",
    curatorTitle: "Din personlige AI-filmekspert",
    curatorDesc: "Beskriv en stemning, en følelse eller en skuespiller — og få skræddersyede anbefalinger tilpasset dig. Curator kender din smag og finder altid noget nyt.",
    openCurator: "Åbn Curator",
    open: "Åbn",
    tasteTitle: "Smagsprofil",
    tasteDesc: "AI-genereret analyse af din filmsmag. Hvad du kan lide, hvad du undgår, og dine foretrukne temaer.",
    recTitle: "For dig",
    recDesc: "Personlige anbefalinger baseret på dit bibliotek og din smagsprofil.",
    statsTitle: "Statistik",
    statsDesc: "Dybdegående statistik over dine filmvaner. Genrer, vurderinger og tendenser.",
  },
  se: {
    foundingLabel: "Founding Member",
    priceLabel: "/ mån",
    heroSub: "Var med från början. Founding Members låser in 29 NOK för alltid — priset höjs när vi öppnar för alla.",
    lockin: "\u{1F512} Lås in 29 NOK för alltid. Priset höjs snart för nya medlemmar.",
    premiumHeading: "Du är med.",
    premiumSub: "Full tillgång till alla Pro-funktioner. Tack för att du är en Founding Member.",
    cta: "Bli Founding Member",
    curatorTitle: "Din personliga AI-filmexpert",
    curatorDesc: "Beskriv en stämning, en känsla eller en skådespelare — och få skräddarsydda rekommendationer anpassade till dig. Curator känner din smak och hittar alltid något nytt.",
    openCurator: "Öppna Curator",
    open: "Öppna",
    tasteTitle: "Smakprofil",
    tasteDesc: "AI-genererad analys av din filmsmak. Vad du gillar, vad du undviker och dina föredragna teman.",
    recTitle: "För dig",
    recDesc: "Personliga rekommendationer baserade på ditt bibliotek och din smakprofil.",
    statsTitle: "Statistik",
    statsDesc: "Djupgående statistik över dina filmvanor. Genrer, betyg och trender.",
  },
  fi: {
    foundingLabel: "Founding Member",
    priceLabel: "/ kk",
    heroSub: "Ole mukana alusta asti. Founding Memberit lukitsevat 29 NOK ikuisesti — hinta nousee kun avaamme kaikille.",
    lockin: "\u{1F512} Lukitse 29 NOK ikuisesti. Hinta nousee pian uusille jäsenille.",
    premiumHeading: "Olet mukana.",
    premiumSub: "Täysi pääsy kaikkiin Pro-ominaisuuksiin. Kiitos että olet Founding Member.",
    cta: "Liity Founding Memberiksi",
    curatorTitle: "Henkilökohtainen AI-elokuvaasiantuntijasi",
    curatorDesc: "Kuvaile tunnelma, tunne tai näyttelijä — ja saa räätälöityjä suosituksia juuri sinulle. Curator tuntee makusi ja löytää aina jotain uutta.",
    openCurator: "Avaa Curator",
    open: "Avaa",
    tasteTitle: "Makuprofiili",
    tasteDesc: "AI:n luoma analyysi elokuvamustasi. Mitä pidät, mitä vältät ja suosikkiteemasi.",
    recTitle: "Sinulle",
    recDesc: "Henkilökohtaiset suositukset kirjastosi ja makuprofiilisi perusteella.",
    statsTitle: "Tilastot",
    statsDesc: "Syvälliset tilastot katselutottumuksistasi. Genret, arvosanat ja trendit.",
  },
} as const;

/* ── Inline icons ─────────────────────────────────────── */

function SparklesIcon({ size = 18, color = "#E50914" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#E50914" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#E50914" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#E50914" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

/* ── Feature card (grid item) ─────────────────────────── */

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  openLabel: string;
}

function FeatureCard({ href, title, description, icon, badge, openLabel }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.06] hover:border-[rgba(229,9,20,0.3)] hover:shadow-[0_0_25px_rgba(229,9,20,0.2)] transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-[rgba(229,9,20,0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* PRO badge */}
      {badge && (
        <span
          className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-[0.12em] px-2 py-[3px] rounded-md z-10"
          style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}
        >
          {badge}
        </span>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05))",
            border: "1px solid rgba(229,9,20,0.15)",
            boxShadow: "0 0 12px rgba(229,9,20,0.1)",
          }}
        >
          {icon}
        </div>
        <h3 className="text-sm font-bold text-white/90">{title}</h3>
      </div>

      <p className="text-[11px] text-white/45 leading-relaxed relative z-10">{description}</p>

      <div className="flex items-center gap-1 mt-auto relative z-10">
        <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors">{openLabel}</span>
        <svg className="w-3 h-3 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

/* ── Main page ────────────────────────────────────────── */

export default function PremiumHubPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPartnerInvite, setShowPartnerInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const locale = useLocale();
  const s = strings[locale as keyof typeof strings] ?? strings.en;
  const ps = partnerStrings[locale as keyof typeof partnerStrings] ?? partnerStrings.en;

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const premium = !!d.profile?.is_premium;
        setIsPremium(premium);
        if (premium && !localStorage.getItem("logflix_partner_invite_shown")) {
          setShowPartnerInvite(true);
          localStorage.setItem("logflix_partner_invite_shown", "1");
        }
      })
      .catch(() => setIsPremium(false));
  }, []);

  // Generate invite code when partner invite is shown
  useEffect(() => {
    if (!showPartnerInvite || inviteCode) return;
    setInviteLoading(true);
    fetch("/api/links", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.link?.invite_code) setInviteCode(d.link.invite_code);
      })
      .catch(() => {})
      .finally(() => setInviteLoading(false));
  }, [showPartnerInvite, inviteCode]);

  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto relative">

      {/* ── Ambient red glow (background) ───────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(229,9,20,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ── Pricing Hero Card ───────────────────────── */}
      <div className="relative mb-8 z-10">
        {/* Animated gradient line on top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden rounded-t-2xl z-20">
          <div
            className="h-full w-[200%]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6), transparent)",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
        </div>

        <div
          className="relative rounded-2xl overflow-hidden p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "0.5px solid rgba(229,9,20,0.3)",
          }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(229,9,20,0.08) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: "rgba(229,9,20,0.85)" }}
              >
                {s.foundingLabel}
              </p>
              {isPremium ? (
                <>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {s.premiumHeading}
                  </p>
                  <p className="text-sm text-white/50 mt-2">
                    {s.premiumSub}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    29 kr <span className="text-lg font-medium text-white/40">{s.priceLabel}</span>
                  </p>
                  <p className="text-sm text-white/40 mt-2 max-w-sm leading-relaxed">
                    {s.heroSub}
                  </p>
                  <p className="text-[11px] text-white/30 mt-3">
                    {s.lockin}
                  </p>
                </>
              )}
            </div>

            {!isPremium && isPremium !== null && (
              <button
                onClick={() => setShowModal(true)}
                className="relative flex-shrink-0 px-6 py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200 hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(135deg, #E50914, #82060c)",
                  boxShadow: "0 0 30px rgba(229,9,20,0.3), 0 0 60px rgba(229,9,20,0.1)",
                  animation: "pulse-cta 2.5s ease-in-out infinite",
                }}
              >
                {s.cta}
                <span className="ml-1.5 inline-block">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Curator Hero Feature ────────────────────── */}
      <Link
        href="/curator"
        className="group relative block mb-6 z-10 rounded-2xl overflow-hidden"
      >
        <div
          className="relative p-6 md:p-8 rounded-2xl border border-white/[0.06] group-hover:border-[rgba(229,9,20,0.4)] group-hover:shadow-[0_0_25px_rgba(229,9,20,0.2)] transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(80,3,8,0.4) 0%, rgba(0,0,0,0.6) 100%)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-[rgba(229,9,20,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

          <div className="relative z-10 flex items-start gap-5">
            {/* Large sparkles icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(229,9,20,0.2), rgba(229,9,20,0.05))",
                border: "1px solid rgba(229,9,20,0.2)",
                boxShadow: "0 0 24px rgba(229,9,20,0.15)",
              }}
            >
              <SparklesIcon size={26} color="#E50914" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "rgba(229,9,20,0.85)" }}
                >
                  Curator
                </p>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.12em] px-2 py-[3px] rounded-md"
                  style={{ background: "rgba(229,9,20,0.15)", color: "rgba(229,9,20,0.85)" }}
                >
                  AI
                </span>
              </div>
              <h2 className="text-lg font-bold text-white/90 mb-2">{s.curatorTitle}</h2>
              <p className="text-xs text-white/40 leading-relaxed max-w-md">
                {s.curatorDesc}
              </p>

              <div className="flex items-center gap-1.5 mt-4">
                <span className="text-[11px] text-white/25 group-hover:text-white/50 transition-colors font-medium">{s.openCurator}</span>
                <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Feature Grid (3-col) ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 z-10 relative">
        <FeatureCard
          href="/taste"
          title={s.tasteTitle}
          description={s.tasteDesc}
          icon={<ProfileIcon />}
          badge="PRO"
          openLabel={s.open}
        />
        <FeatureCard
          href="/recommendations"
          title={s.recTitle}
          description={s.recDesc}
          icon={<StarIcon />}
          badge="PRO"
          openLabel={s.open}
        />
        <FeatureCard
          href="/stats"
          title={s.statsTitle}
          description={s.statsDesc}
          icon={<ChartIcon />}
          openLabel={s.open}
        />
      </div>

      {/* ── CSS animations ──────────────────────────── */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes pulse-cta {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(229,9,20,0.3), 0 0 60px rgba(229,9,20,0.1); }
          50% { transform: scale(1.03); box-shadow: 0 0 40px rgba(229,9,20,0.4), 0 0 80px rgba(229,9,20,0.15); }
        }
      `}</style>

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" />

      {/* ── Partner Invite Modal ──────────────────────── */}
      {showPartnerInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPartnerInvite(false)} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 text-center"
            style={{
              background: "rgba(20,20,20,0.95)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "0.5px solid rgba(229,9,20,0.3)",
              boxShadow: "0 0 60px rgba(229,9,20,0.15)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-2">{ps.title}</h3>
            <p className="text-sm text-white/50 mb-6">{ps.desc}</p>

            {inviteLoading ? (
              <p className="text-xs text-white/30 mb-6">{ps.loading}</p>
            ) : inviteCode ? (
              <div className="flex flex-col gap-3 mb-6">
                {(() => {
                  const inviteUrl = `https://logflix.app/settings?invite=${inviteCode}`;
                  const shareText = locale === "no"
                    ? `Jeg har Logflix Premium! Bruk denne lenken for å koble kontoen din og få premium gratis: ${inviteUrl}`
                    : locale === "dk"
                    ? `Jeg har Logflix Premium! Brug dette link for at tilslutte din konto og få premium gratis: ${inviteUrl}`
                    : locale === "se"
                    ? `Jag har Logflix Premium! Använd denna länk för att koppla ditt konto och få premium gratis: ${inviteUrl}`
                    : locale === "fi"
                    ? `Minulla on Logflix Premium! Käytä tätä linkkiä yhdistääksesi tilisi ja saadaksesi premiumin ilmaiseksi: ${inviteUrl}`
                    : `I have Logflix Premium! Use this link to connect your account and get premium for free: ${inviteUrl}`;

                  return (
                    <>
                      <a
                        href={`sms:?body=${encodeURIComponent(shareText)}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #34C759, #28a745)" }}
                      >
                        <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        {ps.imessage}
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                      >
                        <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.613.613l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.514-.807-6.228-2.157l-.355-.293-3.68 1.233 1.233-3.68-.293-.355A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                        {ps.whatsapp}
                      </a>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(inviteUrl);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white/80 border border-white/10 hover:border-white/20 transition-all"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                        {linkCopied ? ps.copied : ps.copy}
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : null}

            <button
              onClick={() => setShowPartnerInvite(false)}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              {ps.dismiss}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
