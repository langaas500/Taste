"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useLocale } from "@/hooks/useLocale";
import ConversionWall from "@/components/ConversionWall";

/* ── colors ─────────────────────────────────────────── */

const RED = "#ff2a2a";

/* ── locale strings ─────────────────────────────────── */

const strings = {
  no: { together: "Se sammen", search: "Søk", library: "Bibliotek", premium: "Premium", profile: "Profil", settings: "Innstillinger", guest: "Gjest", login: "Logg inn", filmelsker: "Filmelsker", togetherTagline: "Hva skal dere se?", togetherSub: "Finn noe å se sammen — på under 3 minutter", togetherCta: "Se sammen", guides: "Utforsk guider" },
  en: { together: "Watch Together", search: "Search", library: "Library", premium: "Premium", profile: "Profile", settings: "Settings", guest: "Guest", login: "Log in", filmelsker: "Film lover", togetherTagline: "What should you watch?", togetherSub: "Find something to watch together — in under 3 minutes", togetherCta: "Watch Together", guides: "Explore guides" },
  dk: { together: "Se sammen", search: "Søg", library: "Bibliotek", premium: "Premium", profile: "Profil", settings: "Indstillinger", guest: "Gæst", login: "Log ind", filmelsker: "Filmelsker", togetherTagline: "Hvad skal I se?", togetherSub: "Find noget at se sammen — på under 3 minutter", togetherCta: "Se sammen", guides: "Udforsk guider" },
  se: { together: "Se tillsammans", search: "Sök", library: "Bibliotek", premium: "Premium", profile: "Profil", settings: "Inställningar", guest: "Gäst", login: "Logga in", filmelsker: "Filmälskare", togetherTagline: "Vad ska ni se?", togetherSub: "Hitta något att se tillsammans — på under 3 minuter", togetherCta: "Se tillsammans", guides: "Utforska guider" },
  fi: { together: "Katso yhdessä", search: "Hae", library: "Kirjasto", premium: "Premium", profile: "Profiili", settings: "Asetukset", guest: "Vieras", login: "Kirjaudu", filmelsker: "Elokuvarakastaja", togetherTagline: "Mitä katsotte?", togetherSub: "Löydä jotain katsottavaa yhdessä — alle 3 minuutissa", togetherCta: "Katso yhdessä", guides: "Tutustu oppaisiin" },
} as const;

/* ── SVG paths ───────────────────────────────────────── */

const ICONS = {
  together: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z",
  search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  library: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z",
  premium: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  profile: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  settings: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z",
};

/* ── component ──────────────────────────────────────── */

export default function Nav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const [isPremium, setIsPremium] = useState(true);
  const locale = useLocale();
  const [region, setRegion] = useState<string>("no");
  const [showAuthWall, setShowAuthWall] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        const { data } = await supabase.from("profiles").select("display_name, founding_member, is_premium").eq("id", user.id).single();
        setDisplayName(data?.display_name || null);
        setIsFoundingMember(!!data?.founding_member);
        setIsPremium(!!data?.is_premium);
      } else {
        setIsGuest(true);
      }
    })();
  }, []);

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => { if (data.region) { const r = data.region as string; setRegion(["no", "se", "dk", "fi"].includes(r) ? r : "no"); } })
      .catch(() => {});
  }, []);

  const s = strings[locale] ?? strings.en;

  const initials = isGuest ? "G" : displayName ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : userEmail ? userEmail[0].toUpperCase() : "?";
  const userName = isGuest ? s.guest : displayName || userEmail?.split("@")[0] || "User";

  /* ── Nav items ── */
  const navItems = [
    { href: "/together", label: s.together, icon: ICONS.together },
    { href: "/search", label: s.search, icon: ICONS.search },
    { href: "/library", label: s.library, icon: ICONS.library, authRequired: true },
    { href: "/premium", label: s.premium, icon: ICONS.premium, badge: isPremium ? "PRO" : "✨", authRequired: true },
    { href: "/settings", label: s.settings, icon: ICONS.settings, authRequired: true },
  ];

  const bottomNavItems = [
    { href: "/together", label: s.together, icon: ICONS.together },
    { href: "/search", label: s.search, icon: ICONS.search },
    { href: "/library", label: s.library, icon: ICONS.library, authRequired: true },
    { href: "/premium", label: s.premium, icon: ICONS.premium, authRequired: true },
    { href: "/taste", label: s.profile, icon: ICONS.profile, authRequired: true, isProfile: true },
  ];

  function isActive(href: string) {
    return pathname === href || (href === "/library" && pathname?.startsWith("/library"));
  }

  return (
    <>
      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const blocked = isGuest && item.authRequired;
            return (
              <Link
                key={item.href}
                href={blocked ? "#" : item.href}
                onClick={blocked ? (e) => { e.preventDefault(); setShowAuthWall(true); } : undefined}
                className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px]"
                style={{ textDecoration: "none" }}
              >
                {item.isProfile && avatarUrl && !isGuest ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden" style={{ border: active ? `2px solid ${RED}` : "2px solid transparent" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke={active ? RED : "#666"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                )}
                <span className="text-[9px] mt-0.5 font-medium" style={{ color: active ? RED : "#666" }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ==================== MOBILE TOP BAR (logo only) ==================== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{ background: "rgba(10,10,12,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-center px-2 py-1.5">
          <Image src="/logo.png" alt="Logflix" width={80} height={25} className="object-contain" style={{ height: "auto" }} priority />
        </div>
      </nav>

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside
        className={`hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:flex-shrink-0 relative transition-all duration-300 ${collapsed ? "md:w-[72px]" : "md:w-[240px]"}`}
      >
        <div
          className="flex flex-col h-[calc(100vh-24px)] m-3 rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, rgba(15,15,18,0.88) 0%, rgba(10,10,12,0.92) 100%)",
            backdropFilter: "blur(20px) saturate(1.15)",
            WebkitBackdropFilter: "blur(20px) saturate(1.15)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* ── Brand + Profile ── */}
          <div className={`px-3 pt-4 pb-3 ${collapsed ? "px-2" : ""}`}>
            <div className="flex items-center justify-center mb-3">
              {collapsed ? (
                <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center" style={{ background: "rgba(255,42,42,0.12)", border: "1px solid rgba(255,42,42,0.2)" }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: RED }}>L</span>
                </div>
              ) : (
                <Image src="/logo.png" alt="Logflix" width={130} height={41} className="object-contain" style={{ height: "auto" }} priority />
              )}
            </div>

            {/* Profile row → links to /taste */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-1.5"}`}>
              <Link
                href={isGuest ? "/login" : "/taste"}
                className={`flex items-center flex-1 min-w-0 ${collapsed ? "justify-center" : "gap-2.5"} rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.04] cursor-pointer`}
              >
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: "rgba(255,42,42,0.1)", border: "1.5px solid rgba(255,42,42,0.2)" }}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: RED }}>{initials}</span>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e", border: "2px solid rgba(10,10,12,0.95)" }} />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
                      {userName}{isFoundingMember && <span style={{ color: "rgba(229,9,20,0.7)", marginLeft: 4 }}>⭐</span>}
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,42,42,0.4)" }}>
                      {isGuest ? s.login : s.filmelsker}
                    </p>
                  </div>
                )}
              </Link>
              {!collapsed && (
                <button onClick={() => setCollapsed(true)} className="flex-shrink-0 w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-all duration-200" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <svg className="w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.35)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
            {collapsed && (
              <button onClick={() => setCollapsed(false)} className="mt-2.5 w-full flex items-center justify-center bg-transparent border-0 cursor-pointer">
                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.25)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          <div className="mx-3" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* ── Nav links ── */}
          <nav className="flex-1 px-2 pt-3 pb-2 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(({ href, label, icon, badge, authRequired }) => {
              const active = isActive(href);
              const blocked = isGuest && authRequired;
              return (
                <Link
                  key={href}
                  href={blocked ? "#" : href}
                  onClick={blocked ? (e) => { e.preventDefault(); setShowAuthWall(true); } : undefined}
                  className={`group flex items-center gap-2.5 py-2 rounded-[10px] text-[13px] font-medium relative overflow-hidden transition-all duration-200 ease-out ${collapsed ? "justify-center px-2.5" : "px-2.5"}`}
                  title={collapsed ? label : undefined}
                  style={{ background: active ? "rgba(255,42,42,0.05)" : "transparent" }}
                >
                  {!active && <div className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ background: "rgba(255,255,255,0.06)" }} />}
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full" style={{ height: "60%", background: RED, boxShadow: "0 0 8px rgba(255,42,42,0.4)" }} />}
                  <svg className="w-[18px] h-[18px] flex-shrink-0 relative" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor" style={{ color: active ? "rgba(255,42,42,0.95)" : "rgba(255,255,255,0.45)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  {!collapsed && <span className="relative" style={{ color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)" }}>{label}</span>}
                  {badge && !collapsed && (
                    <span className="relative ml-auto text-[8px] font-semibold px-1.5 py-[3px] rounded-full" style={isPremium ? { background: "rgba(255,42,42,0.08)", color: "rgba(255,42,42,0.75)", border: "1px solid rgba(255,42,42,0.12)" } : { background: "rgba(245,200,66,0.12)", color: "#F5C842", border: "1px solid rgba(245,200,66,0.25)" }}>{badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Bottom CTA ── */}
          {!collapsed && (
            <div className="px-2.5 pb-2.5 mt-auto">
              <div className="rounded-[12px] p-3 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[12px] font-bold mb-1" style={{ color: RED }}>{s.togetherTagline}</p>
                <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.togetherSub}</p>
                <Link href="/together" className="flex items-center justify-center gap-1.5 w-full py-[7px] rounded-lg text-[11px] font-semibold" style={{ background: RED, color: "white", textDecoration: "none" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.together} />
                  </svg>
                  {s.togetherCta}
                </Link>
              </div>
              <Link href={`/${region}/guides`} className="group flex items-center gap-2 w-full mt-1.5 px-3 py-[9px] rounded-[10px] text-[12px] font-medium transition-all duration-200 hover:bg-white/[0.04]" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                <svg className="w-[16px] h-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                {s.guides}
              </Link>
            </div>
          )}
        </div>
      </aside>

      <ConversionWall open={showAuthWall} onClose={() => setShowAuthWall(false)} />
    </>
  );
}
