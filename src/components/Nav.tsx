"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ── colors ─────────────────────────────────────────────── */

const RED = "#ff2a2a";

/* ── route config ───────────────────────────────────────── */

const mobileBottomLinks = [
  { href: "/search", label: "Søk", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { href: "/library", label: "Bibliotek", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
  { href: "/recommendations", label: "For deg", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" },
  { href: "/lists", label: "Lister", icon: "M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { href: "/settings", label: "Mer", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" },
];

const mobileTopLinks = [
  { href: "/watchlist", label: "Se-liste", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/watch-bank", label: "Watch Bank", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
  { href: "/shared", label: "Delt", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
  { href: "/taste", label: "Smak", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { href: "/stats", label: "Statistikk", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
];

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  badge?: string | null;
}

interface SidebarSection {
  section: string | null;
  links: SidebarLink[];
}

const sidebarLinks: SidebarSection[] = [
  {
    section: "OPPDAG",
    links: [
      { href: "/search", label: "Søk", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
      { href: "/recommendations", label: "For deg", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z", badge: "AI" },
    ],
  },
  {
    section: "SAMLING",
    links: [
      { href: "/library", label: "Bibliotek", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
      { href: "/watchlist", label: "Se-liste", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
      { href: "/watch-bank", label: "Watch Bank", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
      { href: "/lists", label: "Lister", icon: "M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
    ],
  },
  {
    section: "SOSIALT",
    links: [
      { href: "/shared", label: "Delt med meg", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
    ],
  },
  {
    section: "INNSIKT",
    links: [
      { href: "/taste", label: "Smaksprofil", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z", badge: "AI" },
      { href: "/stats", label: "Statistikk", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
    ],
  },
];

/* ── component ──────────────────────────────────────────── */

export default function Nav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const { data } = await supabase.from("user_profiles").select("display_name").eq("user_id", user.id).single();
        setDisplayName(data?.display_name || null);
      }
    })();
  }, []);

  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail
      ? userEmail[0].toUpperCase()
      : "?";

  const userName = displayName || userEmail?.split("@")[0] || "Bruker";

  return (
    <>
      {/* ==================== MOBILE TOP NAV ==================== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{ background: "rgba(6,8,15,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {mobileTopLinks.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={{ background: active ? "rgba(255,42,42,0.1)" : "transparent" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={active ? 2 : 1.5}
                  stroke="currentColor"
                  style={{ color: active ? RED : "rgba(255,255,255,0.6)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? RED : "rgba(255,255,255,0.55)" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        />
        <div className="relative flex items-center justify-around" style={{ padding: "4px 4px 14px" }}>
          {mobileBottomLinks.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={active ? 2 : 1.5}
                  stroke="currentColor"
                  style={{
                    color: active ? RED : "rgba(255,255,255,0.6)",
                    transition: "color 0.2s",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span
                  className="text-[9px] font-medium"
                  style={{
                    color: active ? RED : "rgba(255,255,255,0.55)",
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside
        className={`hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:flex-shrink-0 relative transition-all duration-300 ${
          collapsed ? "md:w-[72px]" : "md:w-[240px]"
        }`}
      >
        {/* Floating sidebar container */}
        <div
          className="flex flex-col h-[calc(100vh-24px)] m-3 rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, rgba(13,13,13,0.75) 0%, rgba(10,10,14,0.8) 100%)",
            backdropFilter: "blur(6px) saturate(1.1)",
            WebkitBackdropFilter: "blur(6px) saturate(1.1)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Brand + Profile ── */}
          <div className={`px-3 pt-4 pb-3 ${collapsed ? "px-2" : ""}`}>
            {/* Logo */}
            <div
              className="flex items-center justify-center mb-3"
            >
              {collapsed ? (
                <div
                  className="w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,42,42,0.12)",
                    border: "1px solid rgba(255,42,42,0.2)",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 900, color: RED }}>L</span>
                </div>
              ) : (
                <Image
                  src="/logo.png"
                  alt="Logflix"
                  width={120}
                  height={40}
                  className="object-contain"
                  style={{ height: "auto" }}
                  priority
                />
              )}
            </div>

            {/* Profile row */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
              {/* Avatar */}
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 relative"
                style={{
                  background: "rgba(255,42,42,0.1)",
                  border: "1.5px solid rgba(255,42,42,0.2)",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: RED }}>{initials}</span>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "#22c55e",
                    border: "2px solid #0d0d0d",
                  }}
                />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {userName}
                  </p>
                  <p className="text-[10px]" style={{ color: "rgba(255,42,42,0.4)" }}>
                    Filmelsker
                  </p>
                </div>
              )}

              {/* Collapse toggle */}
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="flex-shrink-0 w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <svg className="w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.35)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>

            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="mt-2.5 w-full flex items-center justify-center bg-transparent border-0 cursor-pointer"
              >
                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.25)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="mx-3" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* ── Nav sections ── */}
          <nav className="flex-1 px-2 pt-2 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sidebarLinks.map(({ section, links }, sectionIdx) => (
              <div key={sectionIdx}>
                {section && !collapsed && (
                  <p
                    className="px-2 mb-1 mt-2.5 text-[10px] font-bold tracking-[0.14em]"
                    style={{ color: "rgba(255,42,42,0.35)" }}
                  >
                    {section}
                  </p>
                )}

                {section && collapsed && sectionIdx > 0 && (
                  <div className="my-1.5 mx-2" style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />
                )}

                <div className="flex flex-col" style={{ gap: 1 }}>
                  {links.map(({ href, label, icon, badge }) => {
                    const active = pathname === href;

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`group flex items-center gap-2.5 py-[7px] rounded-[10px] text-[13px] font-medium relative overflow-hidden transition-all duration-150 ${
                          collapsed ? "justify-center px-2.5" : "px-2.5"
                        }`}
                        title={collapsed ? label : undefined}
                        style={{
                          background: active ? "rgba(255,42,42,0.08)" : "transparent",
                        }}
                      >
                        {/* Hover bg */}
                        {!active && (
                          <div
                            className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          />
                        )}

                        {/* Active left accent */}
                        {active && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                            style={{
                              height: "55%",
                              background: RED,
                            }}
                          />
                        )}

                        {/* Icon */}
                        <svg
                          className="w-[18px] h-[18px] flex-shrink-0 relative"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={active ? 2 : 1.5}
                          stroke="currentColor"
                          style={{
                            color: active ? RED : "rgba(255,255,255,0.4)",
                            transition: "color 0.15s",
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>

                        {/* Label */}
                        {!collapsed && (
                          <span
                            className="relative transition-colors duration-150"
                            style={{
                              color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {label}
                          </span>
                        )}

                        {/* Badge */}
                        {badge && !collapsed && (
                          <span
                            className="relative ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-[5px]"
                            style={{
                              background: "rgba(255,42,42,0.1)",
                              color: RED,
                              border: "1px solid rgba(255,42,42,0.15)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Settings - separated */}
            <div className="mt-1.5">
              <Link
                href="/settings"
                className={`group flex items-center gap-2.5 py-[7px] rounded-[10px] text-[13px] font-medium relative overflow-hidden transition-all duration-150 ${
                  collapsed ? "justify-center px-2.5" : "px-2.5"
                }`}
                title={collapsed ? "Innstillinger" : undefined}
                style={{
                  background: pathname === "/settings" ? "rgba(255,42,42,0.08)" : "transparent",
                }}
              >
                {pathname !== "/settings" && (
                  <div className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ background: "rgba(255,255,255,0.04)" }} />
                )}
                {pathname === "/settings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full" style={{ height: "55%", background: RED }} />
                )}
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={pathname === "/settings" ? 2 : 1.5} stroke="currentColor" style={{ color: pathname === "/settings" ? RED : "rgba(255,255,255,0.4)", transition: "color 0.15s" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {!collapsed && (
                  <span className="relative transition-colors duration-150" style={{ color: pathname === "/settings" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                    Innstillinger
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* ── Bottom CTA card ── */}
          {!collapsed && (
            <div className="px-2.5 pb-2.5 mt-auto">
              <div
                className="rounded-[10px] p-3 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[12px] font-bold mb-1" style={{ color: RED }}>
                  Kom i gang!
                </p>
                <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Legg til filmer og serier for personlige anbefalinger
                </p>

                <Link
                  href="/search"
                  className="flex items-center justify-center gap-1.5 w-full py-[7px] rounded-lg text-[11px] font-semibold transition-opacity duration-150 hover:opacity-90"
                  style={{
                    background: RED,
                    color: "white",
                  }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Søk etter titler
                </Link>

                <div className="flex items-center justify-center gap-1.5 mt-2.5" style={{ fontSize: 9, color: "rgba(255,255,255,0.18)" }}>
                  <span>Logflix v0.1</span>
                  <span className="w-1 h-1 rounded-full inline-block" style={{ background: "#22c55e" }} />
                  <span>Koblet til</span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed bottom icon */}
          {collapsed && (
            <div className="pb-3 mt-auto flex justify-center">
              <Link
                href="/search"
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
                style={{ background: RED }}
              >
                <svg className="w-[15px] h-[15px] text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
