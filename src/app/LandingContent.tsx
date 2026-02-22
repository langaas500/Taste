"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SwipeMatchDemo from "./SwipeMatchDemo";

type Locale = "no" | "en";

const strings = {
  no: {
    hero: "Bli enige om hva dere skal se. Nå.",
    sub: "Bestem dere på minutter, ikke 30.",
    cta: "Start Swiping",
    trust: "Gratis. Ingen konto nødvendig.",
    support: "Laget for to. Fungerer live på hver sin telefon.",
    steps: "Opprett rom · Swipe hver for dere · Match med en gang",
    login: "Har du konto? Logg inn",
    streaming: "Fungerer på tvers av de største strømmetjenestene",
    cta2: "Bli med via kode",
    cta2Helper: "Bruk kode eller skann QR",
    social: "Perfekt for fredagskvelder.",
    micro1: "Bestem dere raskere",
    micro2: "Swipe privat",
    micro3: "Mindre krangling. Mer filmkveld.",
  },
  en: {
    hero: "Agree on what to watch. Instantly.",
    sub: "Decide in minutes, not 30.",
    cta: "Start Swiping",
    trust: "Free. No account needed.",
    support: "Built for two people. Works live on separate phones.",
    steps: "Create room · Swipe separately · Match instantly",
    login: "Have an account? Log in",
    streaming: "Works across major streaming services",
    cta2: "Join with Code",
    cta2Helper: "Use code or scan QR",
    social: "Perfect for Friday nights.",
    micro1: "Decide faster",
    micro2: "Swipe privately",
    micro3: "Less debating. More watching.",
  },
};

const PLACEHOLDER_COLORS: [string, string][] = [
  ["#8b1a1a", "#4a0a0a"],
  ["#1a1a8b", "#0a0a4a"],
  ["#1a6b25", "#0a3d14"],
  ["#6b1a8b", "#3d0a4a"],
  ["#8b5a1a", "#4a300a"],
  ["#1a8b6b", "#0a4a3d"],
  ["#8b3a1a", "#4a1e0a"],
  ["#1a3a8b", "#0a1e4a"],
  ["#4a8b1a", "#274a0a"],
  ["#8b1a4a", "#4a0a27"],
  ["#1a8b8b", "#0a4a4a"],
  ["#5a3a8b", "#2d1e4a"],
];

const SERVICES = ["Netflix", "Prime Video", "Disney+", "Max", "Apple TV+"];

export default function LandingContent({ locale }: { locale: Locale }) {
  const s = strings[locale];
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.posters) && data.posters.length > 0) {
          setPosters(data.posters);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes landing-ribbon-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .landing-ribbon-track { animation: landing-ribbon-scroll 40s linear infinite; }

        @keyframes landing-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .landing-fade-1 { animation: landing-fade-in 0.5s ease 0.05s both; }
        .landing-fade-2 { animation: landing-fade-in 0.5s ease 0.12s both; }
        .landing-fade-3 { animation: landing-fade-in 0.5s ease 0.20s both; }
        .landing-fade-4 { animation: landing-fade-in 0.5s ease 0.28s both; }
        .landing-fade-5 { animation: landing-fade-in 0.5s ease 0.36s both; }
        .landing-fade-6 { animation: landing-fade-in 0.5s ease 0.44s both; }
        .landing-login-link { transition: transform 0.2s ease, color 0.2s ease; }
        .landing-login-link:hover { transform: scale(1.1); color: #ff2a2a !important; }

        @keyframes signal-nudge {
          0%, 85%, 100% { transform: translateX(0); }
          90% { transform: translateX(4px); }
          95% { transform: translateX(3px); }
        }
        @keyframes signal-nudge-r {
          0%, 85%, 100% { transform: translateX(0); }
          90% { transform: translateX(-4px); }
          95% { transform: translateX(-3px); }
        }
        @keyframes signal-check {
          0%, 88% { opacity: 0; transform: scale(0.6); }
          93% { opacity: 1; transform: scale(1.1); }
          96%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes signal-pulse {
          0%, 88%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          93% { box-shadow: 0 0 10px 3px rgba(220,38,38,0.20); }
        }
        .signal-l { animation: signal-nudge 7s ease-in-out infinite; }
        .signal-r { animation: signal-nudge-r 7s ease-in-out infinite; }
        .signal-check { animation: signal-check 7s ease-in-out infinite; }
        .signal-dot { animation: signal-pulse 7s ease-in-out infinite; }

        .landing-cta-v2 {
          transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .landing-cta-v2:hover {
          background-color: #e02424 !important;
          box-shadow: 0 2px 16px rgba(220,38,38,0.18);
          transform: translateY(-1px);
        }
        .landing-cta-v2:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .landing-warm-spot {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,220,180,0.07) 0%, rgba(255,200,150,0.03) 50%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .landing-cta-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .landing-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 24px;
          background: transparent;
          color: rgba(255,255,255,0.50);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.01em;
          border-radius: 10px;
          text-decoration: none;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.10);
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .landing-cta-secondary:hover {
          border-color: rgba(255,255,255,0.20);
          color: rgba(255,255,255,0.70);
        }

        @media (min-width: 640px) {
          .landing-cta-row {
            flex-direction: row;
            justify-content: center;
            align-items: stretch;
          }
        }

        .landing-main {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 32px;
        }
        .landing-grid {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        @media (min-width: 768px) {
          .landing-ribbon { height: 150px !important; }
          .landing-ribbon img { height: 130px !important; }
          .landing-hero-title { font-size: 2.4rem !important; }
          .landing-hero-sub { font-size: 17px !important; }
        }

        .landing-mobile-demo-clip {
          width: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .demo-scaler {
          width: 420px;
          flex-shrink: 0;
          transform-origin: top center;
        }
        @media (max-width: 460px) {
          .demo-scaler {
            transform: scale(0.85);
            margin-bottom: -50px;
          }
        }
        @media (max-width: 400px) {
          .demo-scaler {
            transform: scale(0.75);
            margin-bottom: -80px;
          }
        }
        @media (max-width: 360px) {
          .demo-scaler {
            transform: scale(0.68);
            margin-bottom: -100px;
          }
        }

        @media (max-width: 1023px) {
          .landing-logo-wrap {
            margin-top: -30px !important;
          }
          .landing-logo-img {
            height: 44px !important;
          }
          .landing-ribbon {
            height: 80px !important;
          }
          .landing-ribbon img {
            height: 70px !important;
          }
          .landing-main {
            padding: 0 16px !important;
          }
          .landing-grid {
            gap: 12px !important;
          }
          .landing-hero-title {
            font-size: clamp(1.4rem, 5vw, 1.8rem) !important;
            margin-bottom: 8px !important;
          }
          .landing-hero-sub {
            font-size: 0.8rem !important;
            margin-bottom: 12px !important;
          }
          .landing-cta-v2 {
            width: 100% !important;
            height: 52px !important;
            font-size: 18px !important;
            padding: 0 24px !important;
            position: relative;
            z-index: 10;
          }
          .landing-trust-text {
            font-size: 0.75rem !important;
            margin-top: 8px !important;
          }
          .landing-login-link {
            font-size: 0.75rem !important;
            margin-top: 6px !important;
            padding: 2px 0 !important;
          }
          .landing-floor-divider {
            display: none !important;
          }
        }

        @media (min-width: 1024px) {
          .landing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: center;
            flex: 1;
            padding-top: 0 !important;
          }

          .landing-hero-wrap {
            max-width: 560px !important;
            align-items: flex-start !important;
            text-align: left !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .landing-hero-title {
            font-size: 3rem !important;
          }

          .landing-cta-v2 {
            width: auto !important;
            max-width: none !important;
            min-width: 280px;
          }

          .landing-divider {
            display: none !important;
          }
        }
      `,
        }}
      />

      {/* ── SECTION 1: HERO ── */}

      {/* Poster ribbon */}
      <div
        className="landing-ribbon"
        style={{
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          marginTop: 10,
          overflow: "hidden",
          height: 105,
          width: "100%",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {posters.length > 0 ? (
          <div
            className="landing-ribbon-track"
            style={{
              display: "flex",
              gap: 10,
              width: "max-content",
              paddingTop: 4,
              paddingBottom: 4,
              filter: "blur(0.8px)",
            }}
          >
            {[...posters, ...posters].map((poster, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={`https://image.tmdb.org/t/p/w185${poster}`}
                alt=""
                style={{
                  height: 96,
                  width: "auto",
                  borderRadius: 10,
                  opacity: 0.4,
                  flexShrink: 0,
                  display: "block",
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className="landing-ribbon-track"
            style={{
              display: "flex",
              gap: 10,
              width: "max-content",
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            {[...PLACEHOLDER_COLORS, ...PLACEHOLDER_COLORS].map(
              ([from, to], i) => (
                <div
                  key={i}
                  style={{
                    height: 96,
                    width: 64,
                    borderRadius: 10,
                    background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
                    opacity: 0.1,
                    flexShrink: 0,
                  }}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Logo — overlaps ribbon */}
      <div
        className="landing-fade-1 landing-logo-wrap"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -100,
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Logflix"
          className="landing-logo-img"
          style={{ height: 128, width: "auto", opacity: 0.9, position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.6))" }}
        />
        <p className="hidden lg:block" style={{
          fontSize: 11,
          fontWeight: 400,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          marginTop: 8,
          marginBottom: 0,
        }}>
          {s.streaming}
        </p>
        <p className="hidden lg:block" style={{
          fontSize: 13,
          fontWeight: 400,
          color: "rgba(255,255,255,0.40)",
          letterSpacing: "0.02em",
          margin: "4px 0 0",
        }}>
          {SERVICES.join(" · ")}
        </p>
      </div>

      {/* Main max-width container */}
      <div className="landing-main" style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Warm spotlight */}
        <div className="landing-warm-spot" />
        {/* Desktop grid: hero left, benefits right */}
        <div className="landing-grid" style={{ paddingTop: 6, flex: 1 }}>
          {/* Hero content */}
          <div
            className="landing-hero-wrap"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0",
              width: "100%",
              maxWidth: 480,
              textAlign: "center",
            }}
          >
            {/* Two-device signal */}
            <div
              className="landing-fade-2 hidden lg:flex"
              style={{
                alignItems: "center",
                gap: 6,
                marginBottom: 14,
              }}
            >
              <div
                className="signal-l signal-dot"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                }}
              />
              <div
                className="signal-check"
                style={{
                  fontSize: 10,
                  lineHeight: 1,
                  color: "#dc2626",
                  opacity: 0,
                }}
              >
                ✓
              </div>
              <div
                className="signal-r signal-dot"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            <h1
              className="landing-hero-title landing-fade-2"
              style={{
                fontSize: "clamp(1.65rem, 6.2vw, 2.15rem)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                lineHeight: 1.12,
                margin: "0 0 12px",
                maxWidth: 560,
              }}
            >
              {s.hero}
            </h1>

            <p
              className="landing-fade-3 landing-hero-sub"
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.55,
                margin: "0 0 22px",
                maxWidth: 560,
              }}
            >
              {s.sub}
            </p>

            {/* ── SWIPE DEMO (mobile only) ── */}
            <div className="lg:hidden landing-mobile-demo-clip landing-fade-3">
              <div className="demo-scaler">
                <SwipeMatchDemo locale={locale} />
              </div>
            </div>

            <div className="landing-cta-row landing-fade-3">
              <Link
                href="/together"
                className="landing-cta-v2"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "15px 32px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  borderRadius: 10,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                {s.cta}
              </Link>
            </div>

            <p
              className="landing-fade-4 landing-trust-text"
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "rgba(255,255,255,0.45)",
                marginTop: 10,
              }}
            >
              {s.trust}
            </p>

            <p
              className="landing-fade-4 hidden lg:block"
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontStyle: "italic",
                color: "rgba(255,200,150,0.50)",
                marginTop: 14,
              }}
            >
              {s.social}
            </p>

            <p
              className="landing-fade-4 hidden lg:block"
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255,255,255,0.50)",
                marginTop: 12,
                lineHeight: 1.55,
                maxWidth: 560,
              }}
            >
              {s.support}
            </p>

            <p
              className="landing-fade-5 hidden lg:block"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255,255,255,0.40)",
                letterSpacing: "0.04em",
                marginTop: 10,
              }}
            >
              {s.steps}
            </p>

            <Link
              href="/login"
              className="landing-fade-5 landing-login-link"
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255,255,255,0.24)",
                marginTop: 18,
                textDecoration: "none",
                padding: "6px 0",
                display: "inline-block",
              }}
            >
              {s.login}
            </Link>

            {/* Streaming list — mobile only (under login) */}
            <div className="lg:hidden landing-fade-5" style={{ textAlign: "center", marginTop: 14 }}>
              <p style={{
                fontSize: 10,
                fontWeight: 400,
                color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                {s.streaming}
              </p>
              <p style={{
                fontSize: 12,
                fontWeight: 400,
                color: "rgba(255,255,255,0.36)",
                letterSpacing: "0.02em",
                margin: 0,
              }}>
                {SERVICES.join(" · ")}
              </p>
            </div>
          </div>

          {/* ── SWIPE DEMO (desktop only) ── */}
          <div className="hidden lg:flex landing-fade-6" style={{ alignSelf: "center", justifyContent: "center" }}>
            <SwipeMatchDemo locale={locale} />
          </div>
        </div>

        {/* Visual floor — grounding divider */}
        <div
          className="landing-floor-divider"
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.08)",
            marginTop: 12,
          }}
        />

      </div>
    </div>
  );
}
