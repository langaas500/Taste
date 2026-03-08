"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";

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
}

function FeatureCard({ href, title, description, icon, badge }: FeatureCardProps) {
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
        <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors">Åpne</span>
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

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setIsPremium(!!d.profile?.is_premium))
      .catch(() => setIsPremium(false));
  }, []);

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
                Founding Member
              </p>
              {isPremium ? (
                <>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Du er med.
                  </p>
                  <p className="text-sm text-white/50 mt-2">
                    Full tilgang til alle Pro-funksjoner. Takk for at du er en Founding Member.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    29 kr <span className="text-lg font-medium text-white/40">/ mnd</span>
                  </p>
                  <p className="text-sm text-white/40 mt-2">
                    Kun for de første 500 medlemmene
                  </p>
                </>
              )}

              {/* Founding Member tracker */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                    Founding Members
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white/50">
                    412 <span className="text-white/25">/ 500</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(412 / 500) * 100}%`,
                      background: "linear-gradient(90deg, #E50914, #ff4d56)",
                      boxShadow: "0 0 10px rgba(229,9,20,0.4)",
                    }}
                  />
                </div>
                <p className="text-[9px] text-white/25 mt-1">88 plasser igjen</p>
              </div>
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
                Bli Founding Member
                <span className="ml-1.5 inline-block">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Social proof ────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mb-8 z-10 relative">
        {/* Overlapping avatar circles */}
        <div className="flex -space-x-2">
          {[
            "rgba(229,9,20,0.3)",
            "rgba(180,40,40,0.3)",
            "rgba(229,9,20,0.2)",
            "rgba(200,20,20,0.3)",
            "rgba(150,30,30,0.3)",
          ].map((bg, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white/60"
              style={{
                background: bg,
                border: "2px solid rgba(0,0,0,0.8)",
              }}
            >
              {["ML", "KS", "ER", "JB", "AH"][i]}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width={12} height={12} viewBox="0 0 24 24" fill="rgba(229,9,20,0.85)" stroke="none">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            ))}
          </div>
          <p className="text-[10px] text-white/30 font-medium">Bli med 1 200+ filmnerder</p>
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
              <h2 className="text-lg font-bold text-white/90 mb-2">Din personlige AI-filmekspert</h2>
              <p className="text-xs text-white/40 leading-relaxed max-w-md">
                Beskriv en stemning, en følelse eller en skuespiller — og få skreddersydde anbefalinger tilpasset deg. Curator kjenner smaken din og finner alltid noe nytt.
              </p>

              <div className="flex items-center gap-1.5 mt-4">
                <span className="text-[11px] text-white/25 group-hover:text-white/50 transition-colors font-medium">Åpne Curator</span>
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
          title="Smaksprofil"
          description="AI-generert analyse av filmsmaken din. Hva du liker, hva du unngår, og dine foretrukne temaer."
          icon={<ProfileIcon />}
          badge="PRO"
        />
        <FeatureCard
          href="/recommendations"
          title="For deg"
          description="Personlige anbefalinger basert på biblioteket og smaksprofilen din."
          icon={<StarIcon />}
          badge="PRO"
        />
        <FeatureCard
          href="/stats"
          title="Statistikk"
          description="Dyptgående statistikk over filmvanene dine. Sjangre, vurderinger og trender."
          icon={<ChartIcon />}
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
    </div>
  );
}
