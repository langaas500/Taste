"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";
import StreamingModal from "@/components/StreamingModal";
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

function StarIcon({ color = "#E8A830", size = 16 }: { color?: string; size?: number }) {
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
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileTitleCount, setProfileTitleCount] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<{ id: number; type: "movie" | "tv"; title: string; poster_path: string | null } | null>(null);
  const locale = useLocale();

  useEffect(() => {
    createSupabaseBrowser().from("titles_cache").select("poster_path").not("poster_path", "is", null).limit(30)
      .then(({ data }) => { if (data) setHeroPosters(data.map((r: { poster_path: string }) => r.poster_path)); });
  }, []);

  // Override global bg-taste.jpg on premium page
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
              style={{ background: "rgba(255,255,255,0.03)", border: item.gold ? "0.5px solid rgba(232,168,48,0.2)" : "0.5px solid rgba(255,255,255,0.06)" }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold text-white/90 mb-1">{item.title}</p>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
              {item.gold && <StarIcon color="#E8A830" size={14} />}
            </div>
          ))}
        </div>

        {/* Blurret Tonight's Pick preview */}
        <div className="relative rounded-2xl overflow-hidden p-6 mb-8"
          style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(232,168,48,0.15)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(232,168,48,0.6)" }}>
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
                style={{ background: "rgba(232,168,48,0.15)", border: "0.5px solid rgba(232,168,48,0.4)", color: "#E8A830" }}>
                {locale === "no" ? "Lås opp — 29 kr/mnd" : "Unlock — 29 NOK/mo"}
              </button>
            </div>
          </div>
        </div>

        <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} source="premium_hub" userName={profileName} titleCount={profileTitleCount} />
      </div>
    );
  }

  /* ── PREMIUM VIEW ──────────────────────────────────── */
  return (
    <div className="animate-fade-in-up mx-auto relative" style={{ maxWidth: 960 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@1&display=swap');
        @keyframes poster-drift-p { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes card-shine { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
        .premium-card { position: relative; overflow: hidden; border: 1px solid rgba(212,168,83,0.2); }
        .premium-card::after { content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(212,168,83,0.08), transparent); animation: card-shine 4s ease-in-out infinite; pointer-events: none; }
        @keyframes poster-shine { 0%,60% { transform: translateX(-100%) skewX(-15deg); } 80% { transform: translateX(200%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
        .poster-shine { position: relative; overflow: hidden; border: 1px solid rgba(212,168,83,0.25); }
        .poster-shine::after { content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(212,168,83,0.12), transparent); animation: poster-shine 5s ease-in-out infinite; pointer-events: none; z-index: 1; }
      `}</style>


      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 28 }}>

        {/* 1. Hero image with Tonight's Pick overlay */}
        <div style={{ position: "relative" }}>
          <Link href="/together" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 20, overflow: "hidden" }}>
              <Image src="/couple-hero.jpg" alt="Par som ser film" fill className="object-cover" sizes="100vw" priority />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)" }} />
              {/* Tonight's Pick heading on image */}
              {/* Tonight's Pick heading + film/serie cards overlay */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "20px 24px 24px", gap: 12 }}>
                {/* Tonight's Pick heading — top */}
                <h1 style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(32px, 6vw, 52px)",
                  textAlign: "center",
                  lineHeight: 1.1,
                  margin: 0,
                  color: "#fff",
                  textShadow: "0 0 20px rgba(212,168,83,0.4), 0 0 60px rgba(212,168,83,0.2), 0 4px 12px rgba(0,0,0,0.8)",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                }}>
                  Tonight&apos;s Pick
                </h1>

                {/* Film + Pick again + Serie cards — under heading */}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                  {tonightPick?.movie && (
                    <div style={{ textAlign: "center", maxWidth: 120, cursor: "pointer" }}
                      onClick={(e) => { e.preventDefault(); setSelectedTitle({ id: tonightPick.movie!.tmdb_id, type: tonightPick.movie!.type as "movie" | "tv", title: tonightPick.movie!.title, poster_path: tonightPick.movie!.poster_path }); }}>
                      {tonightPick.movie.poster_path && (
                        <div style={{ position: "relative", width: 80, height: 120, borderRadius: 8, margin: "0 auto 8px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} className="poster-shine">
                          <Image src={`https://image.tmdb.org/t/p/w185${tonightPick.movie.poster_path}`} alt={tonightPick.movie.title} fill className="object-cover" sizes="80px" />
                        </div>
                      )}
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }} className="truncate">{tonightPick.movie.title}</p>
                      {tonightPick.movie.match_score != null && (
                        <p style={{ fontSize: 10, color: "#D4A853", fontWeight: 600, margin: "2px 0 0", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>★ {tonightPick.movie.match_score}%</p>
                      )}
                    </div>
                  )}

                  {/* Pick again button */}
                  <button onClick={(e) => { e.preventDefault(); handleReroll(); }} disabled={tpRerolling}
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 40, transition: "all 0.2s", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                    {tpRerolling ? "..." : `↻ ${locale === "no" ? "Ny pick" : "New pick"}`}
                  </button>

                  {tonightPick?.series && (
                    <div style={{ textAlign: "center", maxWidth: 120, cursor: "pointer" }}
                      onClick={(e) => { e.preventDefault(); setSelectedTitle({ id: tonightPick.series!.tmdb_id, type: tonightPick.series!.type as "movie" | "tv", title: tonightPick.series!.title, poster_path: tonightPick.series!.poster_path }); }}>
                      {tonightPick.series.poster_path && (
                        <div style={{ position: "relative", width: 80, height: 120, borderRadius: 8, margin: "0 auto 8px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} className="poster-shine">
                          <Image src={`https://image.tmdb.org/t/p/w185${tonightPick.series.poster_path}`} alt={tonightPick.series.title} fill className="object-cover" sizes="80px" />
                        </div>
                      )}
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }} className="truncate">{tonightPick.series.title}</p>
                      {tonightPick.series.match_score != null && (
                        <p style={{ fontSize: 10, color: "#D4A853", fontWeight: 600, margin: "2px 0 0", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>★ {tonightPick.series.match_score}%</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Partner invite button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setShowPartnerInvite(true)}
            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(212,168,83,0.25)", borderRadius: 999, padding: "10px 24px", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(212,168,83,0.1)"; el.style.borderColor = "rgba(212,168,83,0.4)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.borderColor = "rgba(212,168,83,0.25)"; }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              {partnerName
                ? <>{partnerName} {locale === "no" ? "har" : "has"} <span style={{ color: "#D4A853" }}>Premium</span></>
                : <>{locale === "no" ? "Partneren får" : "Partner gets"} <span style={{ color: "#D4A853" }}>Premium</span> {locale === "no" ? "gratis" : "free"}</>
              }
            </span>
          </button>
        </div>

        {/* 3. 4-column feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="sm:grid-cols-4!">

          {/* Curator AI */}
          <Link href="/curator" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.2s ease", cursor: "pointer", height: "100%" }} className="premium-card"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))", border: "0.5px solid rgba(212,168,83,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#gold1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs><linearGradient id="gold1" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#E8C86A"/><stop offset="100%" stopColor="#C4944A"/></linearGradient></defs>
                  <path d="M12 3c.5 0 2.5 4 2.5 4s4.5.5 4.5 1-3 3.5-3 3.5.5 4.5 0 4.5-3.5-2.5-4-2.5-3.5 3-4 2.5.5-4.5 0-4.5-3-3-3-3.5 4.5-1 4.5-1S11.5 3 12 3z"/>
                  <circle cx="12" cy="12" r="3" strokeWidth="1.2"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Curator AI</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.4 }}>
                  {locale === "no" ? "Ubegrenset AI-filmrådgiver som kjenner smaken din." : "Unlimited AI film advisor that knows your taste."}
                </p>
              </div>
            </div>
          </Link>

          {/* Smaksprofil */}
          <Link href="/taste" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.2s ease", cursor: "pointer", height: "100%" }} className="premium-card"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))", border: "0.5px solid rgba(212,168,83,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#gold2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs><linearGradient id="gold2" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#E8C86A"/><stop offset="100%" stopColor="#C4944A"/></linearGradient></defs>
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v4l2.5 1.5"/>
                  <path d="M8.5 3.5L7 2M15.5 3.5L17 2" strokeWidth="1.2"/>
                  <path d="M16.5 16.5l1.5 1.5M7.5 16.5L6 18" opacity="0.4"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{locale === "no" ? "Smaksprofil" : "Taste Profile"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.4 }}>
                  {locale === "no" ? "AI-analyse av din filmsmak og foretrekkinger." : "AI analysis of your film taste and preferences."}
                </p>
              </div>
            </div>
          </Link>

          {/* Par-rapport */}
          <Link href="/couple-report" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.2s ease", cursor: "pointer", height: "100%" }} className="premium-card"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))", border: "0.5px solid rgba(212,168,83,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs><linearGradient id="gold3" x1="4" y1="4" x2="20" y2="20"><stop offset="0%" stopColor="#E8C86A"/><stop offset="100%" stopColor="#C4944A"/></linearGradient></defs>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="url(#gold3)" fill="url(#gold3)" fillOpacity="0.15"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{locale === "no" ? "Par-rapport" : "Couple Report"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.4 }}>
                  {locale === "no" ? "Kompatibilitet og matchhistorikk for dere." : "Compatibility and match history for you both."}
                </p>
              </div>
            </div>
          </Link>

          {/* Founding Member */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.2s ease", cursor: "pointer", height: "100%" }} className="premium-card"
            onClick={() => setShowPartnerInvite(true)}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(212,168,83,0.2), rgba(212,168,83,0.08))", border: "0.5px solid rgba(212,168,83,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs><linearGradient id="gold4" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#F0D67B"/><stop offset="100%" stopColor="#C4944A"/></linearGradient></defs>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" stroke="url(#gold4)" fill="url(#gold4)" fillOpacity="0.2"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Founding Member</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.4 }}>
                {foundingDate
                  ? (locale === "no" ? `Medlem siden ${foundingDate}` : `Member since ${foundingDate}`)
                  : (locale === "no" ? "Inviter partneren din." : "Invite your partner.")}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Partner invite modal */}
      {showPartnerInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPartnerInvite(false)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "rgba(20,20,20,0.98)", backdropFilter: "blur(30px)", border: "0.5px solid rgba(232,168,48,0.3)", boxShadow: "0 0 60px rgba(232,168,48,0.1)" }}>
            <p className="text-lg font-bold text-white mb-2">
              {locale === "no" ? "Inviter partneren din 💑" : "Invite your partner 💑"}
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              {locale === "no" ? "Du har betalt — nå kan partneren din få premium gratis. Del lenken:" : "You've paid — now your partner can get premium for free. Share the link:"}
            </p>
            {inviteLoading ? (
              <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>{locale === "no" ? "Genererer lenke..." : "Generating link..."}</p>
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
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                        {linkCopied ? (locale === "no" ? "Kopiert!" : "Copied!") : (locale === "no" ? "Kopier lenke" : "Copy link")}
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : null}
            <button onClick={() => setShowPartnerInvite(false)} className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
              {locale === "no" ? "Gjør dette senere" : "Do this later"}
            </button>
          </div>
        </div>
      )}

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