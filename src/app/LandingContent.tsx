"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SwipeMatchDemo from "./SwipeMatchDemo";

export type Locale = "no" | "en" | "sv" | "da" | "fi";

const strings = {
  no: {
    hero: "Enig om filmen på 3 minutter",
    sub: "Sveip filmer hver for dere. Kun felles likes gir match. Gratis, ingen konto.",
    cta: "Start nå — gratis →",
    noFriction: "Ingen konto. Ingen nedlasting. Bare sveip.",
    socialProof: "Hundrevis av par har allerede funnet noe å se",
    step1: "Del lenke med partneren din",
    step2: "Sveip filmer uavhengig av hverandre",
    step3: "Match = dere er enige. Se i kveld.",
    howTitle: "Slik fungerer det",
    streaming: "Netflix · Prime Video · Disney+ · Max · Apple TV+",
    login: "Har du konto? Logg inn",
    also: "Også:",
    alsoAI: "AI-anbefalinger",
    alsoLibrary: "Bibliotek",
    alsoTaste: "Smaksprofil",
  },
  en: {
    hero: "Agree on a movie in 3 minutes",
    sub: "Swipe movies independently. Only mutual likes match. Free, no account needed.",
    cta: "Start now — free →",
    noFriction: "No account. No download. Just swipe.",
    socialProof: "Hundreds of couples have already found something to watch",
    step1: "Share a link with your partner",
    step2: "Swipe movies independently",
    step3: "Match = you agree. Watch tonight.",
    howTitle: "How it works",
    streaming: "Netflix · Prime Video · Disney+ · Max · Apple TV+",
    login: "Have an account? Log in",
    also: "Also:",
    alsoAI: "AI recommendations",
    alsoLibrary: "Library",
    alsoTaste: "Taste profile",
  },
  sv: {
    hero: "Överens om filmen på 3 minuter",
    sub: "Svep filmer var för sig. Bara gemensamma likes matchar. Gratis, inget konto.",
    cta: "Börja nu — gratis →",
    noFriction: "Inget konto. Ingen nedladdning. Bara svep.",
    socialProof: "Hundratals par har redan hittat något att se",
    step1: "Dela en länk med din partner",
    step2: "Svep filmer var för sig",
    step3: "Match = ni är överens. Se ikväll.",
    howTitle: "Så funkar det",
    streaming: "Netflix · Prime Video · Disney+ · Max · Apple TV+",
    login: "Har du konto? Logga in",
    also: "Också:",
    alsoAI: "AI-rekommendationer",
    alsoLibrary: "Bibliotek",
    alsoTaste: "Smakprofil",
  },
  da: {
    hero: "Enige om filmen på 3 minutter",
    sub: "Swipe film hver for jer. Kun fælles likes giver match. Gratis, ingen konto.",
    cta: "Start nu — gratis →",
    noFriction: "Ingen konto. Ingen download. Bare swipe.",
    socialProof: "Hundredvis af par har allerede fundet noget at se",
    step1: "Del et link med din partner",
    step2: "Swipe film uafhængigt af hinanden",
    step3: "Match = I er enige. Se i aften.",
    howTitle: "Sådan virker det",
    streaming: "Netflix · Prime Video · Disney+ · Max · Apple TV+",
    login: "Har du konto? Log ind",
    also: "Også:",
    alsoAI: "AI-anbefalinger",
    alsoLibrary: "Bibliotek",
    alsoTaste: "Smagsprofil",
  },
  fi: {
    hero: "Yhtä mieltä elokuvasta 3 minuutissa",
    sub: "Pyyhkäise elokuvia erikseen. Vain yhteiset tykkäykset täsmäävät. Ilmainen, ei tiliä.",
    cta: "Aloita nyt — ilmainen →",
    noFriction: "Ei tiliä. Ei latausta. Vain pyyhkäisy.",
    socialProof: "Sadat parit ovat jo löytäneet katsottavaa",
    step1: "Jaa linkki kumppanillesi",
    step2: "Pyyhkäise elokuvia erikseen",
    step3: "Osuma = olette samaa mieltä. Katsokaa tänään.",
    howTitle: "Näin se toimii",
    streaming: "Netflix · Prime Video · Disney+ · Max · Apple TV+",
    login: "Onko sinulla tili? Kirjaudu",
    also: "Myös:",
    alsoAI: "AI-suositukset",
    alsoLibrary: "Kirjasto",
    alsoTaste: "Makuprofiili",
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

export default function LandingContent({ locale }: { locale: Locale }) {
  const s = strings[locale];
  const [posters, setPosters] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.posters) && data.posters.length > 0) setPosters(data.posters);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", background: "#0a0a0a" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-ribbon-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .landing-ribbon-track { animation: landing-ribbon-scroll 40s linear infinite; }

        @keyframes landing-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lf-1 { animation: landing-fade-in 0.5s ease 0.05s both; }
        .lf-2 { animation: landing-fade-in 0.5s ease 0.15s both; }
        .lf-3 { animation: landing-fade-in 0.5s ease 0.25s both; }
        .lf-4 { animation: landing-fade-in 0.5s ease 0.35s both; }
        .lf-5 { animation: landing-fade-in 0.5s ease 0.45s both; }

        @keyframes cta-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,42,42,0.4); }
          50% { box-shadow: 0 0 32px rgba(255,42,42,0.6); }
        }
        .landing-cta {
          transition: background-color 0.2s, box-shadow 0.2s, transform 0.15s;
          animation: cta-pulse 2s ease-in-out infinite;
        }
        .landing-cta:hover { background-color: #e02424 !important; transform: translateY(-1px); }
        .landing-cta:active { transform: translateY(0); box-shadow: none; }

        .landing-hero-section { min-height: 100dvh; }
        @media (min-width: 1024px) { .landing-hero-section { min-height: auto; } }

        .landing-main { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .landing-grid { display: flex; flex-direction: column; gap: 28px; }

        @media (max-width: 1023px) {
          .landing-main { padding: 0 16px !important; }
          .landing-hero-title { font-size: clamp(1.5rem, 6vw, 2rem) !important; }
          .landing-hero-sub { font-size: 0.85rem !important; }
          .landing-cta { width: 100% !important; font-size: 18px !important; }
          .landing-ribbon { height: 80px !important; }
          .landing-ribbon img { height: 70px !important; }
        }
        @media (min-width: 768px) {
          .landing-ribbon { height: 150px !important; }
          .landing-ribbon img { height: 130px !important; }
          .landing-hero-title { font-size: 2.4rem !important; }
        }
        @media (min-width: 1024px) {
          .landing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; flex: 1; }
          .landing-hero-wrap { max-width: 560px !important; align-items: flex-start !important; text-align: left !important; }
          .landing-hero-title { font-size: 3rem !important; }
          .landing-cta { width: auto !important; min-width: 280px; }
        }

        .landing-mobile-demo-clip { width: 100%; overflow: hidden; justify-content: center; pointer-events: none; }
        .demo-scaler { width: 420px; flex-shrink: 0; transform-origin: top center; }
        @media (max-width: 1023px) {
          .landing-mobile-demo-clip { display: flex; }
          .demo-scaler { transform: scale(0.72); margin-bottom: -70px; }
        }
        @media (max-width: 460px) { .demo-scaler { transform: scale(0.65); margin-bottom: -90px; } }
        @media (max-width: 400px) { .demo-scaler { transform: scale(0.58); margin-bottom: -110px; } }
        @media (max-width: 360px) { .demo-scaler { transform: scale(0.52); margin-bottom: -130px; } }
        @media (max-width: 1023px) {
          .landing-logo-wrap { margin-top: -30px !important; }
          .landing-logo-img { height: 44px !important; }
        }
      `}} />

      {/* ── HERO SECTION ── */}
      <div
        className="landing-hero-section"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,42,42,0.08) 0%, transparent 70%)",
        }}
      >
        {/* Poster ribbon */}
        <div
          className="landing-ribbon"
          style={{ flexShrink: 0, position: "relative", zIndex: 1, marginTop: 10, overflow: "hidden", height: 105, width: "100%", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", pointerEvents: "none", userSelect: "none" }}
        >
          {posters.length > 0 ? (
            <div className="landing-ribbon-track" style={{ display: "flex", gap: 10, width: "max-content", paddingTop: 4, paddingBottom: 4, filter: "blur(0.8px)" }}>
              {[...posters, ...posters].map((poster, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`https://image.tmdb.org/t/p/w185${poster}`} alt="" style={{ height: 96, width: "auto", borderRadius: 10, opacity: 0.4, flexShrink: 0, display: "block", objectFit: "cover" }} />
              ))}
            </div>
          ) : (
            <div className="landing-ribbon-track" style={{ display: "flex", gap: 10, width: "max-content", paddingTop: 4, paddingBottom: 4 }}>
              {[...PLACEHOLDER_COLORS, ...PLACEHOLDER_COLORS].map(([from, to], i) => (
                <div key={i} style={{ height: 96, width: 64, borderRadius: 10, background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`, opacity: 0.1, flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="lf-1 landing-logo-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: -100, flexShrink: 0, position: "relative", zIndex: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logflix" className="landing-logo-img" style={{ height: 102, width: "auto", opacity: 0.9, position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.6))" }} />
        </div>

        {/* Main content */}
        <div className="landing-main" style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="landing-grid" style={{ paddingTop: 6, flex: 1 }}>
            {/* Hero text */}
            <div className="landing-hero-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 0, width: "100%", maxWidth: 480, textAlign: "center" }}>

              <h1
                className="landing-hero-title lf-2"
                style={{ fontSize: "clamp(1.65rem, 6.2vw, 2.15rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, margin: "0 0 14px", maxWidth: 560 }}
              >
                {s.hero}
              </h1>

              <p className="lf-3 landing-hero-sub" style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.65)", lineHeight: 1.55, margin: "0 0 24px", maxWidth: 560 }}>
                {s.sub}
              </p>

              {/* Primary CTA — full width on mobile */}
              <Link
                href="/together"
                className="landing-cta lf-3"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, minHeight: 52, padding: "14px 36px", background: "#ff2a2a", color: "#ffffff", fontSize: 18, fontWeight: 700, letterSpacing: "0.01em", borderRadius: 12, textDecoration: "none", textAlign: "center" }}
              >
                {locale === "no" ? "Prøv gratis — ingen konto →" : locale === "sv" ? "Testa gratis — inget konto →" : locale === "da" ? "Prøv gratis — ingen konto →" : locale === "fi" ? "Kokeile ilmaiseksi — ei tiliä →" : "Try it free — no signup →"}
              </Link>

              {/* No friction text */}
              <p className="lf-4" style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.35)", marginTop: 10, textAlign: "center" }}>
                {s.noFriction}
              </p>

              {/* Social proof */}
              <p className="lf-4" style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,42,42,0.5)", marginTop: 6, textAlign: "center" }}>
                {s.socialProof}
              </p>

              {/* Login link */}
              <Link
                href="/login"
                className="lf-5"
                style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginTop: 14, textDecoration: "none" }}
              >
                {s.login}
              </Link>

              {/* Streaming — mobile */}
              <p className="lg:hidden lf-5" style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", marginTop: 14, textAlign: "center" }}>
                {s.streaming}
              </p>

              {/* SwipeMatchDemo — mobile, below the fold */}
              <div className="lg:hidden landing-mobile-demo-clip lf-5" style={{ filter: "brightness(1.2) contrast(1.1)", marginTop: 8 }}>
                <div className="demo-scaler">
                  <SwipeMatchDemo locale={locale === "no" ? "no" : "en"} />
                </div>
              </div>
            </div>

            {/* SwipeMatchDemo — desktop */}
            <div className="hidden lg:flex lf-5" style={{ alignSelf: "center", justifyContent: "center", transform: "scale(1.15)", transformOrigin: "center center", filter: "brightness(1.2) contrast(1.1)" }}>
              <SwipeMatchDemo locale={locale === "no" ? "no" : "en"} />
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS — 3 steps ── */}
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "48px 24px 32px" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textAlign: "center", marginBottom: 32 }}>
          {s.howTitle}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "📱", text: s.step1, num: "1" },
            { icon: "👆", text: s.step2, num: "2" },
            { icon: "🎬", text: s.step3, num: "3" },
          ].map((step) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,42,42,0.08)", border: "1px solid rgba(255,42,42,0.15)", flexShrink: 0, fontSize: 20 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Steg {step.num}</span>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: "2px 0 0", lineHeight: 1.4 }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Streaming — desktop */}
        <p className="hidden lg:block" style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", textAlign: "center", marginTop: 32 }}>
          {s.streaming}
        </p>
      </div>

      {/* ── ALSO (subtle, bottom) ── */}
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "16px 24px 48px", textAlign: "center" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>{s.also}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Link href="/curator" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            {s.alsoAI}
          </Link>
          <Link href="/library" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            {s.alsoLibrary}
          </Link>
          <Link href="/taste" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            {s.alsoTaste}
          </Link>
        </div>
      </div>
    </div>
  );
}
