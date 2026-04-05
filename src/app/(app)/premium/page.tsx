"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import PremiumModal from "@/components/PremiumModal";
import StreamingModal from "@/components/StreamingModal";
import { toggleFavorite } from "@/lib/api";
import { useLocale } from "@/hooks/useLocale";
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
    hook: "Slutt å scrolle. Begynn å se.",
    socialProof: "Over 100 filmkvelder reddet siden mars.",
    foundingTitle: "De som starter tidlig betaler aldri mer.",
    foundingSub: "29 kr/mnd — låst for alltid. Prisen går opp. Din gjør ikke.",
    foundingActive: "Du er Founding Member",
    trialCta: "Start gratis prøveperiode — 7 dager",
    trialSub: "Ingen kortinfo nødvendig. Avslutt når som helst.",
    isPremiumLabel: "Du er Premium ✓",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personlige filmrådgiver som lærer hva dere liker — og blir bedre for hver match.",
    curatorCta: "Åpne Curator →",
    curatorCtaFree: "Prøv gratis →",
    tonightPick: "Tonight's Pick",
    newPick: "Ny pick",
    watchNow: "Se nå →",
    match: "match",
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
    partnerBanner: "Partneren din får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Inviter partner",
  },
  en: {
    hook: "Stop scrolling. Start watching.",
    socialProof: "Over 100 movie nights saved since March.",
    foundingTitle: "Early members never pay more.",
    foundingSub: "29 NOK/month — locked forever. The price goes up. Yours doesn't.",
    foundingActive: "You are a Founding Member",
    trialCta: "Start free trial — 7 days",
    trialSub: "No credit card needed. Cancel anytime.",
    isPremiumLabel: "You are Premium ✓",
    curatorTitle: "Curator AI",
    curatorDesc: "Your personal film advisor that learns what you love — and gets better with every match.",
    curatorCta: "Open Curator →",
    curatorCtaFree: "Try free →",
    tonightPick: "Tonight's Pick",
    newPick: "New pick",
    watchNow: "Watch now →",
    match: "match",
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
    partnerBanner: "Your partner gets Premium free",
    partnerHas: (name: string) => `${name} has Premium`,
    invitePartner: "Invite partner",
  },
  dk: {
    hook: "Stop med at scrolle. Begynd at se.",
    socialProof: "Over 100 filmaftener reddet siden marts.",
    foundingTitle: "De der starter tidligt betaler aldrig mere.",
    foundingSub: "29 kr/md — låst for altid. Prisen stiger. Din gør ikke.",
    foundingActive: "Du er Founding Member",
    trialCta: "Start gratis prøveperiode — 7 dage",
    trialSub: "Ingen kortinfo nødvendig. Opsig når som helst.",
    isPremiumLabel: "Du er Premium ✓",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personlige filmrådgiver der lærer hvad I kan lide — og bliver bedre for hver match.",
    curatorCta: "Åbn Curator →",
    curatorCtaFree: "Prøv gratis →",
    tonightPick: "Tonight's Pick",
    newPick: "Nyt pick",
    watchNow: "Se nu →",
    match: "match",
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
    partnerBanner: "Din partner får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Inviter partner",
  },
  se: {
    hook: "Sluta scrolla. Börja titta.",
    socialProof: "Över 100 filmkvällar räddade sedan mars.",
    foundingTitle: "De som börjar tidigt betalar aldrig mer.",
    foundingSub: "29 kr/mån — låst för alltid. Priset går upp. Ditt gör inte det.",
    foundingActive: "Du är Founding Member",
    trialCta: "Starta gratis provperiod — 7 dagar",
    trialSub: "Inget kortinfo behövs. Avsluta när som helst.",
    isPremiumLabel: "Du är Premium ✓",
    curatorTitle: "Curator AI",
    curatorDesc: "Din personliga filmrådgivare som lär sig vad ni gillar — och blir bättre med varje match.",
    curatorCta: "Öppna Curator →",
    curatorCtaFree: "Testa gratis →",
    tonightPick: "Tonight's Pick",
    newPick: "Nytt pick",
    watchNow: "Se nu →",
    match: "match",
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
    partnerBanner: "Din partner får Premium gratis",
    partnerHas: (name: string) => `${name} har Premium`,
    invitePartner: "Bjud in partner",
  },
  fi: {
    hook: "Lopeta selaaminen. Aloita katsominen.",
    socialProof: "Yli 100 elokuvailtaa pelastettu maaliskuusta lähtien.",
    foundingTitle: "Varhaiset jäsenet eivät koskaan maksa enemmän.",
    foundingSub: "29 kr/kk — lukittu ikuisesti. Hinta nousee. Sinun ei.",
    foundingActive: "Olet Founding Member",
    trialCta: "Aloita ilmainen kokeilujakso — 7 päivää",
    trialSub: "Ei korttitietoja tarvita. Peruuta milloin tahansa.",
    isPremiumLabel: "Olet Premium ✓",
    curatorTitle: "Curator AI",
    curatorDesc: "Henkilökohtainen elokuvaneuvojasi joka oppii mistä pidätte — ja paranee joka osumalla.",
    curatorCta: "Avaa Curator →",
    curatorCtaFree: "Kokeile ilmaiseksi →",
    tonightPick: "Tonight's Pick",
    newPick: "Uusi valinta",
    watchNow: "Katso nyt →",
    match: "osuma",
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
    partnerBanner: "Kumppanisi saa Premiumin ilmaiseksi",
    partnerHas: (name: string) => `${name} on Premium`,
    invitePartner: "Kutsu kumppani",
  },
} as const;

/* ── Page ────────────────────────────────────────────── */

export default function PremiumHubPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tonightPick, setTonightPick] = useState<TonightPickData | null>(null);
  const [tpRerolling, setTpRerolling] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [foundingDate, setFoundingDate] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileTitleCount, setProfileTitleCount] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<{ id: number; type: "movie" | "tv"; title: string; poster_path: string | null } | null>(null);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
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
        setIsFoundingMember(!!d.profile?.founding_member);
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

  if (isPremium === null) {
    return (
      <div className="animate-fade-in-up mx-auto px-4 space-y-4" style={{ maxWidth: 540 }}>
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const now = new Date();
  const wrappedSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const pick = tonightPick?.movie || tonightPick?.series || null;

  return (
    <div className="animate-fade-in-up mx-auto px-4 pb-10" style={{ maxWidth: 540 }}>

      {/* ── SEKSJON 1: Hook ── */}
      <div className="text-center pt-2 pb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2" style={{ lineHeight: 1.15 }}>
          {s.hook}
        </h1>
        <p className="text-[11px] text-white/30">{s.socialProof}</p>
      </div>

      {/* ── SEKSJON 2: Founding Member banner ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fm-shimmer { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(250%) skewX(-15deg); } }
        @keyframes fm-star-pulse { 0%,100% { filter: drop-shadow(0 0 4px rgba(255,184,0,0.4)); } 50% { filter: drop-shadow(0 0 10px rgba(255,184,0,0.8)); } }
        .fm-banner { position: relative; overflow: hidden; }
        .fm-banner::after { content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,184,0,0.08), transparent); animation: fm-shimmer 3s ease-in-out infinite; pointer-events: none; }
        .fm-star { animation: fm-star-pulse 2s ease-in-out infinite; }
        @keyframes curator-shimmer { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(250%) skewX(-15deg); } }
        .curator-card { position: relative; overflow: hidden; }
        .curator-card::after { content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,42,42,0.06), transparent); animation: curator-shimmer 3s ease-in-out infinite; pointer-events: none; }
      `}} />
      {isPremium && isFoundingMember ? (
        <div className="fm-banner rounded-2xl p-4 sm:p-5 mb-5 text-center" style={{ background: "linear-gradient(135deg, #1a1400 0%, #2a1f00 50%, #1a1400 100%)", border: "1.5px solid #FFB800" }}>
          <p className="text-base sm:text-lg font-extrabold" style={{ color: "#FFB800" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB800" stroke="none" className="fm-star inline-block mr-2 -mt-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {s.foundingActive}
          </p>
          {foundingDate && <p className="text-[11px] mt-1.5" style={{ color: "#CC9900" }}>{foundingDate}</p>}
        </div>
      ) : (
        <div className="fm-banner rounded-2xl p-4 sm:p-5 mb-5" style={{ background: "linear-gradient(135deg, #1a1400 0%, #2a1f00 50%, #1a1400 100%)", border: "1.5px solid rgba(255,184,0,0.3)" }}>
          <p className="text-sm sm:text-base font-bold text-white/90 mb-1.5">{s.foundingTitle}</p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,184,0,0.5)" }}>{s.foundingSub}</p>
        </div>
      )}

      {/* ── SEKSJON 3: Primær CTA ── */}
      {isPremium ? (
        <div className="text-center mb-6">
          <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>{s.isPremiumLabel}</p>
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3.5 rounded-xl text-sm sm:text-base font-bold text-white cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
            style={{ background: "#ff2a2a", boxShadow: "0 0 20px rgba(255,42,42,0.3)" }}
          >
            {s.trialCta}
          </button>
          <p className="text-[11px] text-white/30 text-center mt-2">{s.trialSub}</p>
        </div>
      )}

      {/* ── SEKSJON 4: Curator AI (full bredde hero-kort) ── */}
      <Link href="/curator" className="curator-card block rounded-2xl p-4 sm:p-5 mb-4 transition-all hover:scale-[1.02] duration-200" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,42,42,0.15)", borderLeft: "3px solid #ff2a2a", boxShadow: "0 0 20px rgba(255,42,42,0.1)", textDecoration: "none" }}>
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,42,42,0.15)", border: "1px solid rgba(255,42,42,0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c.5 0 2.5 4 2.5 4s4.5.5 4.5 1-3 3.5-3 3.5.5 4.5 0 4.5-3.5-2.5-4-2.5-3.5 3-4 2.5.5-4.5 0-4.5-3-3-3-3.5 4.5-1 4.5-1S11.5 3 12 3z"/>
              <circle cx="12" cy="12" r="3" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white/90 mb-1">{s.curatorTitle}</p>
            <p className="text-xs text-white/45 leading-relaxed mb-3">{s.curatorDesc}</p>
            <span className="text-xs font-semibold" style={{ color: "#ff2a2a" }}>{isPremium ? s.curatorCta : s.curatorCtaFree}</span>
          </div>
        </div>
      </Link>

      {/* ── SEKSJON 5: Tonight's Pick (kompakt) ── */}
      {isPremium && pick && (
        <div className="rounded-2xl mb-4 flex items-center gap-3 p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {pick.poster_path && (
            <div className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer" style={{ width: 48, height: 72 }}
              onClick={() => setSelectedTitle({ id: pick.tmdb_id, type: pick.type as "movie" | "tv", title: pick.title, poster_path: pick.poster_path })}>
              <Image src={`https://image.tmdb.org/t/p/w185${pick.poster_path}`} alt={pick.title} fill className="object-cover" sizes="48px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/25 mb-0.5">{s.tonightPick}</p>
            <p className="text-xs font-bold text-white/85 truncate">{pick.title}</p>
            {pick.match_score != null && (
              <p className="text-[10px] mt-0.5" style={{ color: "#FFB800" }}>★ {pick.match_score}% {s.match}</p>
            )}
            <div className="flex gap-2 mt-1.5">
              <button onClick={() => setSelectedTitle({ id: pick.tmdb_id, type: pick.type as "movie" | "tv", title: pick.title, poster_path: pick.poster_path })} className="px-2 py-1 rounded-md text-[10px] font-semibold text-white transition-transform duration-200 hover:scale-110" style={{ background: "#ff2a2a" }}>{s.watchNow}</button>
              <button onClick={handleReroll} disabled={tpRerolling} className="px-2 py-1 rounded-md text-[10px] text-white/35 transition-transform duration-200 hover:scale-110" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{tpRerolling ? "..." : `↻ ${s.newPick}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEKSJON 6: Feature grid (2x2) ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {([
          { href: "/recommendations", icon: "✦", title: s.recTitle, desc: s.recDesc, cta: s.recCta },
          { href: `/wrapped/${wrappedSlug}`, icon: "🎁", title: s.wrappedTitle, desc: s.wrappedDesc, cta: s.wrappedCta },
          { href: "/taste-evolution", icon: "📈", title: s.tasteTitle, desc: s.tasteDesc, cta: s.tasteCta },
          { href: "/couple-report", icon: "💑", title: s.coupleTitle, desc: s.coupleDesc, cta: s.coupleCta },
        ] as const).map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="block rounded-xl p-3 sm:p-4 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = "translateY(-2px)"; el.style.borderColor = "rgba(255,255,255,0.14)"; el.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = "translateY(0)"; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.background = "rgba(255,255,255,0.03)"; }}
          >
            <span className="text-lg block mb-2">{f.icon}</span>
            <p className="text-xs font-bold text-white/80 mb-0.5">{f.title}</p>
            <p className="text-[10px] text-white/30 leading-relaxed mb-2">{f.desc}</p>
            <span className="text-[10px] font-semibold" style={{ color: "#ff2a2a" }}>{f.cta}</span>
          </Link>
        ))}
      </div>

      {/* ── SEKSJON 7: Partner banner ── */}
      <div className="rounded-xl p-3 flex items-center justify-between gap-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">💑</span>
          <p className="text-xs text-white/50 truncate">{partnerName ? s.partnerHas(partnerName) : s.partnerBanner}</p>
        </div>
        {!partnerName && isPremium && (
          <Link href="/settings" className="text-[10px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0 transition-transform duration-200 hover:scale-110" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
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
          isFavorite={!!favs[`${selectedTitle.id}:${selectedTitle.type}`]}
          onToggleFavorite={() => {
            const key = `${selectedTitle.id}:${selectedTitle.type}`;
            const newVal = !favs[key];
            setFavs((p) => ({ ...p, [key]: newVal }));
            toggleFavorite(selectedTitle.id, selectedTitle.type, newVal);
          }}
        />
      )}
    </div>
  );
}
