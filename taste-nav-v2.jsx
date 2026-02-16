import { useState } from "react";

const RED = "#ff2a2a";
const RED_DIM = "#cc1a1a";

const mobileLinks = [
  { href: "/search", label: "Søk", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { href: "/library", label: "Bibliotek", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
  { href: "/recommendations", label: "For deg", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" },
  { href: "/lists", label: "Lister", icon: "M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { href: "/settings", label: "Mer", icon: "M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" },
];

const sidebarLinks = [
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

const settingsIcon = "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z";
const settingsIcon2 = "M15 12a3 3 0 11-6 0 3 3 0 016 0z";

export default function TasteNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePath, setActivePath] = useState("/library");
  const [mobileActive, setMobileActive] = useState("/library");
  const [view, setView] = useState("desktop");

  const initials = "MX";
  const userName = "martinlangaas";

  const NavIcon = ({ d, active, size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5} stroke="currentColor"
      style={{
        width: size, height: size, flexShrink: 0, transition: "color 0.2s",
        color: active ? RED : "rgba(255,255,255,0.4)",
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#080808",
      display: "flex", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* View toggle */}
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 100,
        display: "flex", gap: 4, padding: 3, borderRadius: 10,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {["desktop", "mobile"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, transition: "all 0.2s",
            background: view === v ? RED : "transparent",
            color: view === v ? "#fff" : "rgba(255,255,255,0.4)",
          }}>
            {v === "desktop" ? "Desktop" : "Mobil"}
          </button>
        ))}
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      {view === "desktop" && (
        <>
          <aside style={{
            display: "flex", flexDirection: "column", position: "relative",
            width: collapsed ? 72 : 240, flexShrink: 0,
            padding: "12px 0 12px 12px", transition: "width 0.3s ease-out",
          }}>
            <div style={{
              position: "relative", display: "flex", flexDirection: "column",
              height: "100%", borderRadius: 16, overflow: "hidden",
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>

              {/* ── Brand + Profile ── */}
              <div style={{ padding: "16px 12px 12px" }}>
                {/* TASTE brand */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 10, marginBottom: 14,
                }}>
                  <div style={{
                    flexShrink: 0, width: 34, height: 34, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,42,42,0.12)",
                    border: "1px solid rgba(255,42,42,0.2)",
                  }}>
                    <span style={{
                      fontSize: 15, fontWeight: 900, color: RED,
                    }}>T</span>
                  </div>
                  {!collapsed && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{
                        fontSize: 15, fontWeight: 800, letterSpacing: "0.06em", lineHeight: 1,
                        color: RED,
                      }}>TASTE</span>
                      <span style={{
                        fontSize: 9, letterSpacing: "0.1em", marginTop: 2,
                        color: "rgba(255,255,255,0.3)", fontWeight: 500,
                      }}>TRACK YOUR TITLES</span>
                    </div>
                  )}
                </div>

                {/* Profile row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 10,
                }}>
                  <div style={{
                    position: "relative", flexShrink: 0, width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,42,42,0.1)",
                    border: "1.5px solid rgba(255,42,42,0.2)",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: RED }}>{initials}</span>
                    <div style={{
                      position: "absolute", bottom: -1, right: -1, width: 10, height: 10,
                      borderRadius: "50%", background: "#22c55e", border: "2px solid #0d0d0d",
                    }} />
                  </div>
                  {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{userName}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,42,42,0.4)" }}>Filmelsker</div>
                    </div>
                  )}
                  {!collapsed && (
                    <button onClick={() => setCollapsed(true)} style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={1.5} stroke="rgba(255,255,255,0.35)" style={{ width: 13, height: 13 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                  )}
                </div>
                {collapsed && (
                  <button onClick={() => setCollapsed(false)} style={{
                    marginTop: 10, width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", background: "none", border: "none", cursor: "pointer",
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={1.5} stroke="rgba(255,255,255,0.25)" style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Separator - simple */}
              <div style={{
                margin: "0 12px", height: 1,
                background: "rgba(255,255,255,0.06)",
              }} />

              {/* ── Nav sections ── */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "8px 8px",
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                {sidebarLinks.map(({ section, links }, sectionIdx) => (
                  <div key={section || sectionIdx}>
                    {section && !collapsed && (
                      <div style={{
                        padding: "10px 8px 4px", fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.14em", color: "rgba(255,42,42,0.35)",
                      }}>{section}</div>
                    )}
                    {section && collapsed && sectionIdx > 0 && (
                      <div style={{
                        margin: "6px 8px", height: 1, background: "rgba(255,255,255,0.04)",
                      }} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {links.map(({ href, label, icon, badge }) => {
                        const active = activePath === href;
                        return (
                          <button key={href} onClick={() => setActivePath(href)} style={{
                            position: "relative", display: "flex", alignItems: "center",
                            gap: 10, borderRadius: 10, border: "none", cursor: "pointer",
                            background: active ? "rgba(255,42,42,0.08)" : "transparent",
                            textAlign: "left",
                            justifyContent: collapsed ? "center" : "flex-start",
                            padding: collapsed ? 10 : "7px 10px",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Active left bar */}
                            {active && (
                              <div style={{
                                position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                                width: 3, height: "55%", borderRadius: "0 3px 3px 0",
                                background: RED,
                              }} />
                            )}
                            <NavIcon d={icon} active={active} />
                            {!collapsed && (
                              <span style={{
                                fontSize: 13, fontWeight: 500,
                                color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                                transition: "color 0.15s",
                              }}>{label}</span>
                            )}
                            {badge && !collapsed && (
                              <span style={{
                                marginLeft: "auto", fontSize: 9, fontWeight: 700,
                                padding: "1px 5px", borderRadius: 5,
                                color: RED, background: "rgba(255,42,42,0.1)",
                                border: "1px solid rgba(255,42,42,0.15)",
                              }}>{badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Settings */}
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => setActivePath("/settings")} style={{
                    position: "relative", display: "flex", alignItems: "center",
                    gap: 10, borderRadius: 10, border: "none", cursor: "pointer",
                    background: activePath === "/settings" ? "rgba(255,42,42,0.08)" : "transparent",
                    textAlign: "left",
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? 10 : "7px 10px",
                    transition: "background 0.15s", width: "100%",
                  }}
                  onMouseEnter={e => { if (activePath !== "/settings") e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (activePath !== "/settings") e.currentTarget.style.background = "transparent"; }}
                  >
                    {activePath === "/settings" && (
                      <div style={{
                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                        width: 3, height: "55%", borderRadius: "0 3px 3px 0", background: RED,
                      }} />
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={activePath === "/settings" ? 2 : 1.5} stroke="currentColor"
                      style={{
                        width: 18, height: 18, flexShrink: 0, transition: "color 0.2s",
                        color: activePath === "/settings" ? RED : "rgba(255,255,255,0.4)",
                      }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={settingsIcon} />
                      <path strokeLinecap="round" strokeLinejoin="round" d={settingsIcon2} />
                    </svg>
                    {!collapsed && (
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        color: activePath === "/settings" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                      }}>Innstillinger</span>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Bottom CTA ── */}
              {!collapsed && (
                <div style={{ padding: "4px 10px 10px" }}>
                  <div style={{
                    borderRadius: 10, padding: 12, overflow: "hidden",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, marginBottom: 4, color: RED,
                    }}>Kom i gang!</div>
                    <div style={{
                      fontSize: 11, lineHeight: 1.5, marginBottom: 10,
                      color: "rgba(255,255,255,0.35)",
                    }}>Legg til filmer og serier for personlige anbefalinger</div>
                    <button onClick={() => setActivePath("/search")} style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 6, width: "100%", padding: "7px 0", borderRadius: 8,
                      fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                      background: RED, color: "white",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12 }}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Søk etter titler
                    </button>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 6, marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.18)",
                    }}>
                      <span>Taste v0.1</span>
                      <span style={{
                        display: "inline-block", width: 4, height: 4, borderRadius: "50%",
                        background: "#22c55e",
                      }} />
                      <span>Koblet til</span>
                    </div>
                  </div>
                </div>
              )}

              {collapsed && (
                <div style={{ padding: "0 8px 12px", display: "flex", justifyContent: "center" }}>
                  <button onClick={() => setActivePath("/search")} style={{
                    width: 34, height: 34, borderRadius: 10, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: RED,
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={2} stroke="white" style={{ width: 15, height: 15 }}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main content placeholder */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            paddingLeft: 12,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 36, fontWeight: 900, letterSpacing: "0.1em",
                color: RED,
                textShadow: `0 0 7px ${RED}, 0 0 20px rgba(255,42,42,0.5), 0 0 40px rgba(255,42,42,0.2), 0 0 80px rgba(255,42,42,0.1)`,
                marginBottom: 6,
              }}>TASTE</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                Track your titles
              </div>
              <div style={{
                marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.2)",
                padding: "8px 16px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                Aktiv side: <span style={{ color: RED }}>{activePath}</span>
              </div>
              <div style={{
                marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.15)",
                maxWidth: 260, lineHeight: 1.5,
              }}>
                Sidebar = rolig og solid · Content-area = neon glow
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== MOBILE VIEW ==================== */}
      {view === "mobile" && (
        <div style={{
          width: "100%", maxWidth: 390, margin: "0 auto", position: "relative",
          height: "100%", display: "flex", flexDirection: "column",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, overflow: "hidden",
        }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 30, fontWeight: 900, letterSpacing: "0.1em", color: RED,
                textShadow: `0 0 7px ${RED}, 0 0 20px rgba(255,42,42,0.5), 0 0 40px rgba(255,42,42,0.2)`,
                marginBottom: 6,
              }}>TASTE</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
                Track your titles
              </div>
              <div style={{
                marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)",
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                Aktiv: <span style={{ color: RED }}>{mobileActive}</span>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <nav style={{
            position: "relative",
            background: "#0a0a0a",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-around",
              padding: "8px 8px 20px",
            }}>
              {mobileLinks.map(({ href, label, icon }) => {
                const active = mobileActive === href;
                return (
                  <button key={href} onClick={() => setMobileActive(href)} style={{
                    position: "relative", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 3, padding: "6px 12px", borderRadius: 12,
                    background: "transparent", border: "none", cursor: "pointer",
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={active ? 2 : 1.5} stroke="currentColor"
                      style={{
                        width: 24, height: 24, transition: "color 0.2s",
                        color: active ? RED : "rgba(255,255,255,0.4)",
                      }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    <span style={{
                      fontSize: 10, fontWeight: 500, transition: "color 0.2s",
                      color: active ? RED : "rgba(255,255,255,0.35)",
                    }}>{label}</span>
                    {/* Active dot */}
                    {active && (
                      <div style={{
                        position: "absolute", bottom: 0, width: 4, height: 4,
                        borderRadius: "50%", background: RED,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
