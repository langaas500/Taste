"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";

/* ── Gold padlock icon ────────────────────────────────── */

function PadlockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/* ── Feature card ─────────────────────────────────────── */

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  badge?: string;
}

function FeatureCard({ href, title, description, icon, isPremium, badge }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:translate-y-[-4px]"
      style={{
        background: "rgba(10,10,10,0.65)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
            style={{ background: "linear-gradient(135deg, rgba(176,0,0,0.3), rgba(229,9,20,0.15))" }}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/90">{title}</h3>
              {!isPremium && <PadlockIcon size={14} />}
            </div>
            {badge && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">{badge}</span>
            )}
          </div>
        </div>
        <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      <p className="text-xs text-white/40 leading-relaxed relative z-10">{description}</p>
    </Link>
  );
}

/* ── Main page ────────────────────────────────────────── */

export default function PremiumHubPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setIsPremium(!!d.profile?.is_premium))
      .catch(() => setIsPremium(false));
  }, []);

  const features: FeatureCardProps[] = [
    {
      href: "/curator",
      title: "Curator",
      description: "Din personlige AI-filmekspert. Beskriv en stemning, en følelse eller en skuespiller — og få skreddersydde anbefalinger.",
      icon: <SparklesIcon />,
      isPremium: isPremium ?? false,
      badge: "AI",
    },
    {
      href: "/taste",
      title: "Smaksprofil",
      description: "AI-generert analyse av filmsmaken din. Hva du liker, hva du unngår, og dine foretrukne temaer og stemninger.",
      icon: <ProfileIcon />,
      isPremium: isPremium ?? false,
    },
    {
      href: "/recommendations",
      title: "For deg",
      description: "Personlige anbefalinger basert på biblioteket og smaksprofilen din. Oppdag filmer og serier du aldri visste du trengte.",
      icon: <StarIcon />,
      isPremium: isPremium ?? false,
      badge: "AI",
    },
    {
      href: "/stats",
      title: "Statistikk",
      description: "Dyptgående statistikk over filmvanene dine. Sjangre, vurderinger og trender over tid.",
      icon: <ChartIcon />,
      isPremium: true, // stats is free
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #B00000, #E50914)" }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white/90 tracking-tight">Premium</h1>
          <p className="text-[11px] text-white/35 font-medium">
            {isPremium ? "Du har full tilgang" : "Lås opp alle Pro-funksjoner"}
          </p>
        </div>
      </div>

      {/* Upgrade banner for non-premium */}
      {isPremium === false && (
        <button
          onClick={() => setShowModal(true)}
          className="w-full mt-4 mb-6 p-4 rounded-2xl border border-red-600/30 text-left cursor-pointer transition-all hover:translate-y-[-4px] hover:border-red-600/50"
          style={{ background: "linear-gradient(135deg, rgba(176,0,0,0.15), rgba(229,9,20,0.08))" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white/90">Logflix Pro — 29 kr/mnd</p>
              <p className="text-xs text-white/40 mt-1">Founding Member-pris for de 500 første</p>
            </div>
            <div className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(#B00000, #E50914)" }}>
              Oppgrader
            </div>
          </div>
        </button>
      )}

      {/* Feature grid */}
      <div className="flex flex-col gap-3 mt-4">
        {features.map((f) => (
          <FeatureCard key={f.href} {...f} />
        ))}
      </div>

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" />
    </div>
  );
}

/* ── Inline icons ─────────────────────────────────────── */

function SparklesIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#E50914" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
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
