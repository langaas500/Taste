"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mobileLinks = [
  { href: "/search", label: "Search", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { href: "/library", label: "Library", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
  { href: "/recommendations", label: "For You", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" },
  { href: "/lists", label: "Lists", icon: "M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { href: "/settings", label: "More", icon: "M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" },
];

const sidebarLinks = [
  {
    section: "Discover",
    links: [
      { href: "/search", label: "Search", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z", badge: null },
      { href: "/recommendations", label: "For You", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z", badge: "AI" },
    ],
  },
  {
    section: "Collection",
    links: [
      { href: "/library", label: "Library", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z", badge: null },
      { href: "/watchlist", label: "Watchlist", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", badge: null },
      { href: "/lists", label: "Lists", icon: "M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", badge: null },
    ],
  },
  {
    section: "Social",
    links: [
      { href: "/shared", label: "Shared with Me", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", badge: null },
    ],
  },
  {
    section: "Insights",
    links: [
      { href: "/taste", label: "Taste Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z", badge: "AI" },
      { href: "/stats", label: "Statistics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", badge: null },
    ],
  },
  {
    section: null,
    links: [
      { href: "/settings", label: "Settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z", badge: null },
    ],
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  return (
    <>
      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {/* Rainbow top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 5%, rgba(124,92,252,0.25) 25%, rgba(229,9,20,0.2) 50%, rgba(245,197,24,0.2) 75%, transparent 95%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(10,10,18,0.93) 0%, rgba(6,6,14,0.98) 100%)",
          }}
        />

        <div className="relative flex items-stretch">
          {mobileLinks.map(({ href, label, icon }) => {
            const active =
              pathname === href ||
              (href === "/settings" &&
                ["/settings", "/stats", "/watchlist", "/taste", "/shared"].includes(pathname));
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 relative"
                style={{ transition: "all 0.2s ease" }}
              >
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                    style={{
                      width: "24px",
                      background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                      boxShadow: "0 0 12px var(--accent)",
                    }}
                  />
                )}

                <div className="relative">
                  {active && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)",
                        transform: "scale(2.5)",
                      }}
                    />
                  )}
                  <svg
                    className="w-5 h-5 relative"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={active ? 2.2 : 1.5}
                    stroke="currentColor"
                    style={{
                      color: active ? "var(--accent-light)" : "rgba(255,255,255,0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>

                <span
                  className="text-[10px] font-semibold relative"
                  style={{
                    color: active ? "var(--accent-light)" : "rgba(255,255,255,0.3)",
                    transition: "color 0.2s ease",
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
        className="hidden md:flex md:flex-col md:w-[240px] md:min-h-screen md:flex-shrink-0 relative"
        style={{
          background: "linear-gradient(180deg, rgba(12,12,22,0.97) 0%, rgba(8,8,16,0.99) 100%)",
        }}
      >
        {/* Right border - rainbow gradient */}
        <div
          className="absolute top-0 right-0 bottom-0 w-px"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(124,92,252,0.2) 20%, rgba(229,9,20,0.15) 50%, rgba(245,197,24,0.1) 80%, transparent 100%)",
          }}
        />

        {/* Ambient glow */}
        <div
          className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top left, rgba(124,92,252,0.05) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, rgba(124,92,252,0.6) 100%)",
                boxShadow: "0 0 20px rgba(124,92,252,0.25)",
              }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.125 8.25C3.504 8.25 3 8.754 3 9.375v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 7.125v1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
                WatchLedger
              </h1>
              <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
                Your film journal
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="mx-4 mb-4">
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {[
              { value: "—", label: "Seen", color: "#22c55e" },
              { value: "—", label: "Liked", color: "#f5c518" },
              { value: "—", label: "Queue", color: "var(--accent-light)" },
            ].map(({ value, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[15px] font-bold" style={{ color }}>{value}</span>
                <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {sidebarLinks.map(({ section, links }, sectionIdx) => (
            <div key={sectionIdx} className="mb-1">
              {section && (
                <p
                  className="px-3 mb-1.5 mt-3 text-[10px] font-semibold tracking-[0.2em] uppercase"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                >
                  {section}
                </p>
              )}

              {!section && (
                <div
                  className="my-2 mx-2"
                  style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }}
                />
              )}

              <div className="space-y-0.5">
                {links.map(({ href, label, icon, badge }) => {
                  const active = pathname === href;
                  const hovered = hoveredIndex === href;

                  return (
                    <Link
                      key={href}
                      href={href}
                      onMouseEnter={() => setHoveredIndex(href)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative overflow-hidden"
                      style={{ transition: "all 0.2s ease" }}
                    >
                      {/* Bg layer */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(124,92,252,0.14) 0%, rgba(124,92,252,0.04) 100%)"
                            : hovered
                              ? "rgba(255,255,255,0.025)"
                              : "transparent",
                          transition: "all 0.2s ease",
                        }}
                      />

                      {/* Active accent bar */}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                          style={{
                            height: "20px",
                            background: "linear-gradient(180deg, var(--accent), var(--accent-light))",
                            boxShadow: "0 0 10px var(--accent)",
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative">
                        {active && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: "radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)",
                              transform: "scale(2.5)",
                            }}
                          />
                        )}
                        <svg
                          className="w-[18px] h-[18px] flex-shrink-0 relative"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={active ? 2.2 : 1.5}
                          stroke="currentColor"
                          style={{
                            color: active
                              ? "var(--accent-light)"
                              : hovered
                                ? "rgba(255,255,255,0.65)"
                                : "rgba(255,255,255,0.3)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>
                      </div>

                      {/* Label */}
                      <span
                        className="relative"
                        style={{
                          color: active
                            ? "rgba(255,255,255,0.95)"
                            : hovered
                              ? "rgba(255,255,255,0.65)"
                              : "rgba(255,255,255,0.38)",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {label}
                      </span>

                      {/* Badge */}
                      {badge && (
                        <span
                          className="relative ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: "linear-gradient(135deg, rgba(124,92,252,0.18) 0%, rgba(229,9,20,0.1) 100%)",
                            color: "var(--accent-light)",
                            border: "1px solid rgba(124,92,252,0.15)",
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
        </nav>

        {/* Bottom: Powered by AI note */}
        <div className="px-4 pb-4">
          <div
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(229,9,20,0.04) 100%)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            {/* Shimmer accent top */}
            <div
              className="absolute top-0 left-[15%] right-[15%] h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.2), transparent)",
              }}
            />
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "rgba(124,92,252,0.15)" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--accent-light)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                AI-Powered
              </span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.22)" }}>
              Recommendations & taste analysis powered by your watch history
            </p>
          </div>

          {/* Version row */}
          <div className="mt-3 flex items-center justify-between px-1">
            <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.1)" }}>
              WatchLedger v0.1
            </p>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }}
              />
              <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.12)" }}>
                Synced
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}