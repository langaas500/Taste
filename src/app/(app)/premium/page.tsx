"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";
import { useLocale } from "@/hooks/useLocale";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

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

interface CoupleReport {
  compatibility_score: number | null;
  total_matches: number;
  top_genre: string | null;
  streak: number;
}

/* ── Inline icons ─────────────────────────────────────── */

function StarIcon({ color = "#F5C842", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/* ── Main page ────────────────────────────────────────── */

export default function PremiumHubPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tonightPick, setTonightPick] = useState<TonightPickData | null>(null);
  const [tpRerolling, setTpRerolling] = useState(false);
  const [coupleReport, setCoupleReport] = useState<CoupleReport | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [foundingDate, setFoundingDate] = useState<string | null>(null);
  const [showPartnerInvite, setShowPartnerInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [heroPosters, setHeroPosters] = useState<string[]>([]);
  const locale = useLocale();

  useEffect(() => {
    createSupabaseBrowser().from("titles_cache").select("poster_path").not("poster_path", "is", null).limit(30)
      .then(({ data }) => { if (data) setHeroPosters(data.map((r: { poster_path: string }) => r.poster_path)); });
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const premium = !!d.profile?.is_premium;
        setIsPremium(premium);
        if (d.profile?.premium_since) {
          const date = new Date(d.profile.premium_since);
          setFoundingDate(date.toLocaleDateString(locale === "no" ? "nb-NO" : locale === "se" ? "sv-SE" : locale === "dk" ? "da-DK" : "en-US", { day: "numeric", month: "long", year: "numeric" }));
        }
        if (premium && !localStorage.getItem("logflix_partner_invite_shown")) {
          setShowPartnerInvite(true);
          localStorage.setItem("logflix_partner_invite_shown", "1");
        }
        if (premium) {
          loadPremiumData();
        }
      })
      .catch(() => setIsPremium(false));
  }, []);

  async function loadPremiumData() {
    const [tpRes, reportRes, friendsRes] = await Promise.all([
      fetch("/api/tonight-pick").then(r => r.json()).catch(() => null),
      fetch("/api/couple-report").then(r => r.json()).catch(() => null),
      fetch("/api/friends/titles").then(r => r.json()).catch(() => null),
    ]);
    if (tpRes && !tpRes.error) setTonightPick(tpRes);
    if (reportRes && !reportRes.error) setCoupleReport(reportRes);
    if (friendsRes?.friendName) setPartnerName(friendsRes.friendName);
  }

  useEffect(() => {
    if (!showPartnerInvite || inviteCode) return;
    setInviteLoading(true);
    fetch("/api/links", { method: "POST" })
      .then(r => r.json())
      .then(d => { if (d.link?.invite_code) setInviteCode(d.link.invite_code); })
      .catch(() => {})
      .finally(() => setInviteLoading(false));
  }, [showPartnerInvite, inviteCode]);

  async function handleReroll() {
    setTpRerolling(true);
    try {
      const res = await fetch("/api/tonight-pick", { method: "POST" });
      if (res.ok) setTonightPick(await res.json());
    } catch {}
    setTpRerolling(false);
  }

  if (isPremium === null) {
    return (
      <div className="animate-fade-in-up max-w-3xl mx-auto space-y-6">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── NON-PREMIUM VIEW ──────────────────────────────── */
  if (!isPremium) {
    return (
      <div className="animate-fade-in-up max-w-2xl mx-auto relative">
        <style>{`
          @keyframes border-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse-cta { 0%,100% { box-shadow: 0 0 30px rgba(229,9,20,0.3); } 50% { box-shadow: 0 0 50px rgba(229,9,20,0.5); } }
          @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        `}</style>

        {/* Animated poster drift background — fullscreen behind everything */}
        {heroPosters.length > 0 && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift 60s linear infinite" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {[...heroPosters, ...heroPosters].map((p, i) => (
                <img key={i} src={`https://image.tmdb.org/t/p/w185${p}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.08, filter: "blur(3px)", flexShrink: 0 }} />
              ))}
            </div>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(10,10,15,0.95) 100%)" }} />
          </div>
        )}

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8"
          style={{ border: "1px solid rgba(229,9,20,0.3)", boxShadow: "0 0 40px rgba(229,9,20,0.15)" }}>
          <div className="relative z-10 p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(229,9,20,0.85)" }}>Logflix Par</p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {locale === "no" ? "Slutt å krangle om hva dere skal se." : "Stop arguing about what to watch."}
            </h1>
            <p className="text-base text-white/50 mb-6">
              {locale === "no" ? "29 kr/mnd — for dere begge." : "29 NOK/mo — for both of you."}
            </p>
            <button onClick={() => setShowModal(true)}
              className="px-8 py-4 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #E50914, #82060c)", animation: "pulse-cta 2.5s ease-in-out infinite" }}>
              {locale === "no" ? "Bli Founding Member — 29 kr/mnd" : "Become Founding Member — 29 NOK/mo"} →
            </button>
          </div>
        </div>

        {/* Verdi-punkter */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {[
            {
              icon: "🎬",
              title: locale === "no" ? "Tonight's Pick — hver kveld" : "Tonight's Pick — every evening",
              desc: locale === "no" ? "Én film og én serie, kuratert for smaken din. Klar hver dag." : "One movie and one series, curated for your taste. Ready every day.",
              gold: true,
            },
            {
              icon: "🤖",
              title: locale === "no" ? "Curator kjenner smaken din" : "Curator knows your taste",
              desc: locale === "no" ? "Spør om hva som helst — stemning, skuespiller, sjanger. Ubegrenset." : "Ask anything — mood, actor, genre. Unlimited.",
              gold: false,
            },
            {
              icon: "💑",
              title: locale === "no" ? "Partneren din får det gratis" : "Your partner gets it for free",
              desc: locale === "no" ? "Én betaler. Begge har full tilgang. 14,50 kr per person." : "One pays. Both get full access. 7 NOK per person.",
              gold: false,
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: item.gold ? "0.5px solid rgba(245,200,66,0.2)" : "0.5px solid rgba(255,255,255,0.06)" }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold text-white/90 mb-1">{item.title}</p>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
              {item.gold && <StarIcon color="#F5C842" size={14} />}
            </div>
          ))}
        </div>

        {/* Blurret Tonight's Pick preview */}
        <div className="relative rounded-2xl overflow-hidden p-6 mb-8"
          style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(245,200,66,0.15)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(245,200,66,0.6)" }}>
            {locale === "no" ? "Tonight's Pick — forhåndsvisning" : "Tonight's Pick — preview"}
          </p>
          <div className="flex gap-4">
            {[{ label: locale === "no" ? "🎬 Film i kveld" : "🎬 Movie tonight" }, { label: locale === "no" ? "📺 Serie i kveld" : "📺 Series tonight" }].map((item) => (
              <div key={item.label} className="flex-1 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">{item.label}</p>
                <div className="w-full rounded-lg mb-2" style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.05)", filter: "blur(4px)" }} />
                <div className="h-2 rounded bg-white/10 mb-1" style={{ filter: "blur(3px)" }} />
                <div className="h-2 rounded bg-white/5 w-2/3" style={{ filter: "blur(3px)" }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
            <div className="text-center">
              <p className="text-sm font-bold text-white mb-1">🔒 {locale === "no" ? "Låst for Founding Members" : "Locked for Founding Members"}</p>
              <button onClick={() => setShowModal(true)}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(245,200,66,0.15)", border: "0.5px solid rgba(245,200,66,0.4)", color: "#F5C842" }}>
                {locale === "no" ? "Lås opp — 29 kr/mnd" : "Unlock — 29 NOK/mo"}
              </button>
            </div>
          </div>
        </div>

        <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" />
      </div>
    );
  }

  /* ── PREMIUM VIEW ──────────────────────────────────── */
  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto space-y-6 relative">
      <style>{`
        @keyframes border-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes poster-drift-p { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* Animated poster drift background */}
      {heroPosters.length > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <div style={{ display: "flex", gap: 8, height: "100%", width: "max-content", animation: "poster-drift-p 60s linear infinite" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {[...heroPosters, ...heroPosters].map((p, i) => (
              <img key={i} src={`https://image.tmdb.org/t/p/w185${p}`} alt="" style={{ width: 80, height: "100%", objectFit: "cover", opacity: 0.10, filter: "blur(2px)", flexShrink: 0 }} />
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0.7) 100%)" }} />
        </div>
      )}

      {/* Founding Member kort */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-[-100%]"
            style={{ background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(252,211,77,0.6) 72%, rgba(252,196,44,0.9) 80%, rgba(252,211,77,0.6) 88%, transparent 100%)", animation: "border-rotate 4s linear infinite" }} />
          <div className="absolute inset-[2px] rounded-[14px]" style={{ background: "#0a0a0c" }} />
        </div>
        <div className="relative z-10 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(245,200,66,0.1)", border: "0.5px solid rgba(245,200,66,0.3)" }}>
            <StarIcon color="#F5C842" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#F5C842" }}>Founding Member</p>
            <p className="text-lg font-black text-white">
              {locale === "no" ? "Du er med." : "You're in."}
            </p>
            {foundingDate && (
              <p className="text-xs text-white/40 mt-0.5">
                {locale === "no" ? `Medlem siden ${foundingDate}` : `Member since ${foundingDate}`}
              </p>
            )}
            {partnerName && (
              <p className="text-xs mt-1" style={{ color: "rgba(245,200,66,0.7)" }}>
                💑 {locale === "no" ? `${partnerName} har også tilgang` : `${partnerName} also has access`}
              </p>
            )}
          </div>
          {!partnerName && (
            <button onClick={() => setShowPartnerInvite(true)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(245,200,66,0.1)", border: "0.5px solid rgba(245,200,66,0.3)", color: "#F5C842" }}>
              {locale === "no" ? "Inviter partner" : "Invite partner"}
            </button>
          )}
        </div>
      </div>

      {/* Tonight's Pick */}
      {tonightPick && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(245,200,66,0.15)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(245,200,66,0.7)" }}>
                {locale === "no" ? "Tonight's Pick" : "Tonight's Pick"}
              </p>
              <p className="text-base font-bold text-white">
                {partnerName
                  ? (locale === "no" ? `For deg og ${partnerName}` : `For you and ${partnerName}`)
                  : (locale === "no" ? "For deg i kveld" : "For you tonight")}
              </p>
            </div>
            <button onClick={handleReroll} disabled={tpRerolling}
              className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] transition-all disabled:opacity-40">
              {tpRerolling ? "..." : `↻ ${locale === "no" ? "Ny pick" : "New pick"}`}
            </button>
          </div>
          <div className="flex gap-4">
            {tonightPick.movie && (
              <Link href="/together" className="flex-1 rounded-xl border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all group">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">🎬 {locale === "no" ? "Film i kveld" : "Movie tonight"}</p>
                {tonightPick.movie.poster_path && (
                  <div className="relative w-full rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "2/3" }}>
                    <Image src={`https://image.tmdb.org/t/p/w342${tonightPick.movie.poster_path}`} alt={tonightPick.movie.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" sizes="200px" />
                  </div>
                )}
                <p className="text-xs font-semibold text-white/85 truncate">{tonightPick.movie.title}</p>
                {tonightPick.movie.match_score != null && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#F5C842" }}>★ {tonightPick.movie.match_score}% match</p>
                )}
              </Link>
            )}
            {tonightPick.series && (
              <Link href="/together" className="flex-1 rounded-xl border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all group">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">📺 {locale === "no" ? "Serie i kveld" : "Series tonight"}</p>
                {tonightPick.series.poster_path && (
                  <div className="relative w-full rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "2/3" }}>
                    <Image src={`https://image.tmdb.org/t/p/w342${tonightPick.series.poster_path}`} alt={tonightPick.series.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" sizes="200px" />
                  </div>
                )}
                <p className="text-xs font-semibold text-white/85 truncate">{tonightPick.series.title}</p>
                {tonightPick.series.match_score != null && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#F5C842" }}>★ {tonightPick.series.match_score}% match</p>
                )}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Par-rapport widget */}
        <Link href="/couple-report" className="group rounded-2xl p-5 hover:border-white/[0.12] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(245,200,66,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">💑</span>
            <p className="text-xs font-bold text-white">
              {locale === "no" ? "Par-rapport" : "Couple Report"}
            </p>
          </div>
          {coupleReport ? (
            <>
              {coupleReport.compatibility_score != null && (
                <p className="text-2xl font-black mb-1" style={{ color: "#F5C842" }}>
                  {coupleReport.compatibility_score}%
                </p>
              )}
              <p className="text-xs text-white mb-1">
                {locale === "no" ? `${coupleReport.total_matches} matcher totalt` : `${coupleReport.total_matches} total matches`}
              </p>
              {coupleReport.top_genre && (
                <p className="text-xs text-white/80">
                  {locale === "no" ? `Toppsjanger: ${coupleReport.top_genre}` : `Top genre: ${coupleReport.top_genre}`}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-white/80">
              {locale === "no" ? "Du mangler en partner-kobling. Finn ut nøyaktig hva dere matcher på." : "No partner connected yet. Find out exactly what you match on."}
            </p>
          )}
          <p className="text-[10px] text-white/50 group-hover:text-white/80 mt-3 transition-colors">
            {locale === "no" ? "Se full rapport →" : "See full report →"}
          </p>
        </Link>

        {/* Smaksprofil widget */}
        <Link href="/taste" className="group rounded-2xl p-5 hover:border-white/[0.12] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🎭</span>
            <p className="text-xs font-bold text-white">
              {locale === "no" ? "Smaksprofil" : "Taste Profile"}
            </p>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {locale === "no" ? "Din AI-smaksprofil er klar. Klikk for å se hva biblioteket ditt sier om deg." : "Your AI taste profile is ready. Click to see what your library says about you."}
          </p>
          <p className="text-[10px] text-white/50 group-hover:text-white/80 mt-3 transition-colors">
            {locale === "no" ? "Se profilen →" : "See profile →"}
          </p>
        </Link>

        {/* Curator widget */}
        <Link href="/curator" className="group rounded-2xl p-5 hover:border-white/[0.12] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🤖</span>
            <p className="text-xs font-bold text-white">Curator AI</p>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(245,200,66,0.1)", color: "#F5C842", border: "0.5px solid rgba(245,200,66,0.2)" }}>
              {locale === "no" ? "Ubegrenset" : "Unlimited"}
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {locale === "no" ? "Curator venter. Hva har du lyst til å føle i kveld?" : "Curator is ready. What do you want to feel tonight?"}
          </p>
          <p className="text-[10px] text-white/50 group-hover:text-white/80 mt-3 transition-colors">
            {locale === "no" ? "Åpne Curator →" : "Open Curator →"}
          </p>
        </Link>
      </div>

      {/* Partner invite modal */}
      {showPartnerInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPartnerInvite(false)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "rgba(20,20,20,0.95)", backdropFilter: "blur(30px)", border: "0.5px solid rgba(245,200,66,0.3)", boxShadow: "0 0 60px rgba(245,200,66,0.1)" }}>
            <p className="text-lg font-bold text-white mb-2">
              {locale === "no" ? "Inviter partneren din 💑" : "Invite your partner 💑"}
            </p>
            <p className="text-sm text-white/50 mb-6">
              {locale === "no" ? "Du har betalt — nå kan partneren din få premium gratis. Del lenken:" : "You've paid — now your partner can get premium for free. Share the link:"}
            </p>
            {inviteLoading ? (
              <p className="text-xs text-white/30 mb-6">{locale === "no" ? "Genererer lenke..." : "Generating link..."}</p>
            ) : inviteCode ? (
              <div className="flex flex-col gap-3 mb-6">
                {(() => {
                  const inviteUrl = `https://logflix.app/settings?invite=${inviteCode}`;
                  const shareText = locale === "no"
                    ? `Jeg har Logflix Premium! Bruk denne lenken for å koble kontoen din og få premium gratis: ${inviteUrl}`
                    : `I have Logflix Premium! Use this link to connect your account and get premium for free: ${inviteUrl}`;
                  return (
                    <>
                      <a href={`sms:?body=${encodeURIComponent(shareText)}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #34C759, #28a745)" }}>
                        {locale === "no" ? "Send iMessage" : "Send iMessage"}
                      </a>
                      <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                        {locale === "no" ? "Send WhatsApp" : "Send WhatsApp"}
                      </a>
                      <button onClick={async () => { await navigator.clipboard.writeText(inviteUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white/80 border border-white/10"
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        {linkCopied ? (locale === "no" ? "Kopiert!" : "Copied!") : (locale === "no" ? "Kopier lenke" : "Copy link")}
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : null}
            <button onClick={() => setShowPartnerInvite(false)} className="text-xs text-white/30 hover:text-white/50 transition-colors">
              {locale === "no" ? "Gjør dette senere" : "Do this later"}
            </button>
          </div>
        </div>
      )}

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" />
    </div>
  );
}