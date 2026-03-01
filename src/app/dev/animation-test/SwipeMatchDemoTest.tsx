"use client";

import { useState, useEffect } from "react";

type Locale = "no" | "en";

const RED = "#ff2a2a";
const MATCH_STEP = 13;

interface Film {
  title: string;
  year: number;
  overview: string;
  poster: string;
  genreColor: string;
}

const FILMS: Film[] = [
  {
    title: "Fallout",
    year: 2024,
    overview: "In a post-apocalyptic world, a woman leaves her vault to find her father.",
    poster: "https://image.tmdb.org/t/p/w500/c15BtJxCXMrISLVmysdsnZUPQft.jpg",
    genreColor: "#1a4a5a",
  },
  {
    title: "The Pitt",
    year: 2025,
    overview: "A day in the life of the staff at a Pittsburgh trauma center.",
    poster: "https://image.tmdb.org/t/p/w500/kvFSpESyBZMjaeOJDx7RS3P1jey.jpg",
    genreColor: "#2d1a3d",
  },
  {
    title: "Stranger Things",
    year: 2025,
    overview: "When a boy vanishes, a small town uncovers a mystery involving secret experiments.",
    poster: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    genreColor: "#1a1a2d",
  },
];

const STEP_TIMINGS = [
  1200, 600, 400, 700, 500, 600, 600, 500, 400, 500, 300, 400, 400, 0,
];

const HINTS = [
  "Scroller sammen...",
  "Kanskje denne?",
  "Hmm\u2026 ikke overbevist.",
  "Fortsatt ikke enige.",
  "Neste tittel.",
  "Nei.",
  "Ikke for meg.",
  "Ulik smak...",
  "Nærmer seg.",
  "Kanskje?",
  "Vent\u2026",
  "Begge vurderer...",
  "Ja.",
  "",
];

function useAutoStep(speedMultiplier = 1) {
  const [step, setStep] = useState(0);
  const [filmIdx] = useState(0);

  useEffect(() => {
    if (step >= MATCH_STEP) return;
    const delay = Math.round((STEP_TIMINGS[step] ?? 1000) * speedMultiplier);
    const timer = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(timer);
  }, [step, speedMultiplier]);

  return { step, filmIdx, setStep };
}

function SwipeCard({
  film, swipeX, likeVisible, nopeVisible, flyOut,
}: {
  film: Film; swipeX: number; likeVisible: boolean;
  nopeVisible: boolean; flyOut: number;
}) {
  const isFlying = flyOut !== 0;
  const isDragging = swipeX !== 0 && !isFlying;

  const transition = isFlying
    ? "transform 0.22s cubic-bezier(.2,.9,.2,1), opacity 0.22s ease"
    : isDragging ? "transform 0.45s ease-out" : "transform 0.3s ease";

  const transform = isFlying
    ? `translateX(${flyOut}px) rotate(${flyOut > 0 ? 16 : -16}deg)`
    : `translateX(${swipeX}px) rotate(${swipeX / 8}deg)`;

  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 12,
      overflow: "hidden", background: film.genreColor,
      boxShadow: "0 12px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)",
      transform, transition, opacity: isFlying ? 0 : 1, userSelect: "none",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={film.poster} alt={film.title} draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, transparent 48%, rgba(0,0,0,0.65) 72%, rgba(0,0,0,0.92) 100%)",
      }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 10px 10px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
          {film.title} &bull; {film.year}
        </div>
        <div style={{
          fontSize: "0.55rem", color: "rgba(255,255,255,0.68)", marginTop: 2,
          lineHeight: 1.4, display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
        }}>
          {film.overview}
        </div>
      </div>

      {/* LIKE stamp */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", opacity: likeVisible ? 1 : 0,
        transition: "opacity 0.35s ease", pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{
          background: "rgba(34,197,94,0.92)", color: "#fff", fontSize: 13,
          fontWeight: 900, padding: "4px 12px", borderRadius: 6,
          border: "2px solid #22c55e", transform: "rotate(-12deg)", letterSpacing: "0.08em",
        }}>LIKE</div>
      </div>

      {/* NOPE stamp */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", opacity: nopeVisible ? 1 : 0,
        transition: "opacity 0.35s ease", pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{
          background: "rgba(239,68,68,0.92)", color: "#fff", fontSize: 13,
          fontWeight: 900, padding: "4px 12px", borderRadius: 6,
          border: "2px solid #ef4444", transform: "rotate(12deg)", letterSpacing: "0.08em",
        }}>NOPE</div>
      </div>
    </div>
  );
}

function ActionButtons({ showLike, showNope }: { showLike: boolean; showNope: boolean }) {
  return (
    <div style={{ display: "flex", gap: 3, padding: "0 4px 4px", flexShrink: 0 }}>
      <button className={`demo-action-btn${showNope ? " active" : ""}`}>Nope</button>
      <button className="demo-superlike-btn">&#9733;</button>
      <button className={`demo-action-btn${showLike ? " active" : ""}`}>Like</button>
    </div>
  );
}

function MatchOverlay({ film }: { film: Film }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={film.poster} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", filter: "brightness(0.75) saturate(0.9)",
      }} />
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.50)",
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 6,
        animation: "match-pop 0.22s cubic-bezier(.2,.9,.2,1) forwards",
      }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: RED, letterSpacing: "0.08em" }}>
          &#10003; Treff
        </div>
        <div style={{
          fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)",
          textAlign: "center", padding: "0 8px", lineHeight: 1.4,
        }}>{film.title}</div>
        <div style={{
          marginTop: 4, background: RED, color: "#fff", fontSize: 8,
          fontWeight: 800, padding: "5px 10px", borderRadius: 5,
          letterSpacing: "0.08em",
          animation: "cta-appear 0.26s ease-out 0.2s both, cta-breathe 2.4s ease-in-out 0.5s infinite",
          opacity: 0, pointerEvents: "none",
          boxShadow: "0 0 16px rgba(255,42,42,0.35)",
        }}>Se nå</div>
      </div>
    </div>
  );
}

/*
 * CSS 3D-boks: flat iphone-frame.png + ekte sidekant.
 * preserve-3d lar sidepanelet stå vinkelrett på frontflaten.
 * Venstre telefon rotateY(35deg) → høyre sidekant synlig.
 * Høyre telefon rotateY(-35deg) → venstre sidekant synlig.
 */
function PhoneFrame({ children, side = "left" }: {
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  const isRight = side === "right";
  const DEPTH = 10; // telefon-tykkelse i px
  const CORNER = 22; // matcher iPhone-rammens hjørneradius

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      perspective: 600,
    }}>
      {/* Hele telefonen — 3D-boks */}
      <div style={{
        position: "relative",
        width: 170,
        aspectRatio: "443 / 960",
        transform: isRight ? "rotateY(-35deg)" : "rotateY(35deg)",
        transformOrigin: isRight ? "right center" : "left center",
        transformStyle: "preserve-3d",
      }}>
        {/* FRONT: iPhone PNG frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/iphone-frame.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 3,
            objectFit: "contain",
            // Front-flaten skyves litt fram i Z så sidekanten kobler korrekt
            transform: `translateZ(${DEPTH / 2}px)`,
            backfaceVisibility: "hidden",
          }}
        />

        {/* FRONT: Screen content */}
        <div style={{
          position: "absolute",
          top: "2%",
          left: "3%",
          right: "3%",
          bottom: "2%",
          borderRadius: 20,
          overflow: "hidden",
          background: "#0a0a0f",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          transform: `translateZ(${DEPTH / 2}px)`,
          backfaceVisibility: "hidden",
        }}>
          {children}
        </div>

        {/* BACK: mørk bakside */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: CORNER,
          background: "linear-gradient(135deg, #2a2a2e 0%, #1a1a1e 50%, #111113 100%)",
          transform: `translateZ(${-DEPTH / 2}px) rotateY(180deg)`,
          backfaceVisibility: "hidden",
        }} />

        {/* SIDE: høyre kant (synlig for venstre telefon) */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: DEPTH,
          height: "100%",
          transformOrigin: "right center",
          transform: `translateX(${DEPTH / 2}px) rotateY(90deg)`,
          background: "linear-gradient(to bottom, #4a4a50 0%, #3a3a40 15%, #2d2d32 50%, #3a3a40 85%, #4a4a50 100%)",
          borderRadius: `0 ${CORNER * 0.3}px ${CORNER * 0.3}px 0`,
          // Lys-highlight på kanten
          boxShadow: "inset 0 0 1px rgba(255,255,255,0.15), inset -1px 0 3px rgba(0,0,0,0.4)",
        }} />

        {/* SIDE: venstre kant (synlig for høyre telefon) */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: DEPTH,
          height: "100%",
          transformOrigin: "left center",
          transform: `translateX(${-DEPTH / 2}px) rotateY(-90deg)`,
          background: "linear-gradient(to bottom, #4a4a50 0%, #3a3a40 15%, #2d2d32 50%, #3a3a40 85%, #4a4a50 100%)",
          borderRadius: `${CORNER * 0.3}px 0 0 ${CORNER * 0.3}px`,
          boxShadow: "inset 0 0 1px rgba(255,255,255,0.15), inset 1px 0 3px rgba(0,0,0,0.4)",
        }} />

        {/* TOP edge */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: DEPTH,
          transformOrigin: "center top",
          transform: `translateY(${-DEPTH / 2}px) rotateX(90deg)`,
          background: "linear-gradient(to right, #4a4a50, #3a3a40, #4a4a50)",
          borderRadius: `${CORNER * 0.3}px ${CORNER * 0.3}px 0 0`,
        }} />

        {/* BOTTOM edge */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: DEPTH,
          transformOrigin: "center bottom",
          transform: `translateY(${DEPTH / 2}px) rotateX(-90deg)`,
          background: "linear-gradient(to right, #4a4a50, #3a3a40, #4a4a50)",
          borderRadius: `0 0 ${CORNER * 0.3}px ${CORNER * 0.3}px`,
        }} />
      </div>

      {/* Speiling (reflection) */}
      <div style={{
        width: 170,
        height: 55,
        overflow: "hidden",
        pointerEvents: "none",
        perspective: 600,
      }}>
        <div style={{
          width: "100%",
          height: 170 * (960 / 443), // full phone height for reflection source
          transform: isRight
            ? `scaleY(-1) rotateY(-35deg)`
            : `scaleY(-1) rotateY(35deg)`,
          transformOrigin: isRight ? "right top" : "left top",
          transformStyle: "preserve-3d",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 15%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 15%)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/iphone-frame.png" alt=""
            style={{
              width: "100%", height: "auto", display: "block", opacity: 0.2,
              transform: `translateZ(${DEPTH / 2}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SwipeMatchDemo({
  locale: _locale,
  speedMultiplier = 1,
}: {
  locale: Locale;
  speedMultiplier?: number;
}) {
  const { step, filmIdx, setStep } = useAutoStep(speedMultiplier);
  const [hasAutoReplayed, setHasAutoReplayed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const currentFilm = step <= 4
    ? FILMS[filmIdx % FILMS.length]
    : step <= 9
    ? FILMS[(filmIdx + 1) % FILMS.length]
    : FILMS[(filmIdx + 2) % FILMS.length];

  const filmPhase = step <= 4 ? 0 : step <= 9 ? 1 : 2;
  const cardKey = `${filmIdx}-${filmPhase}`;

  const p1SwipeX = step === 1 ? 100 : step === 6 ? -100 : step === 11 ? 100 : 0;
  const p1FlyOut = (step >= 2 && step <= 4) ? 350 : (step >= 7 && step <= 9) ? -350 : step >= 12 ? 350 : 0;
  const p1LikeVisible = step === 1 || step === 11;
  const p1NopeVisible = step === 6;
  const p1BtnLike = step === 1 || step === 2 || step === 11 || step === 12;
  const p1BtnNope = step === 6 || step === 7;

  const p2SwipeX = step === 3 ? -100 : step === 8 ? 100 : step === 11 ? 100 : 0;
  const p2FlyOut = step === 4 ? -350 : step === 9 ? 350 : step >= 12 ? 350 : 0;
  const p2LikeVisible = step === 8 || step === 11;
  const p2NopeVisible = step === 3;
  const p2BtnLike = step === 8 || step === 9 || step === 11 || step === 12;
  const p2BtnNope = step === 3 || step === 4;

  const match = step >= MATCH_STEP;
  const matchFilm = FILMS[(filmIdx + 2) % FILMS.length];

  useEffect(() => {
    if (!match || hasAutoReplayed) return;
    const t = setTimeout(() => setFadingOut(true), 20000);
    return () => clearTimeout(t);
  }, [match, hasAutoReplayed]);

  useEffect(() => {
    if (!fadingOut) return;
    const t = setTimeout(() => {
      setStep(0);
      setFadingOut(false);
      setHasAutoReplayed(true);
    }, 400);
    return () => clearTimeout(t);
  }, [fadingOut, setStep]);

  const hint = HINTS[step] ?? "";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", maxWidth: 480, margin: "0 auto",
    }}>
      <style>{`
        @keyframes match-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cta-appear {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cta-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        @keyframes phone-jitter {
          0%  { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100%{ transform: translateX(0); }
        }
        @keyframes replay-fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        .demo-action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 22px; font-size: 8px; font-weight: 700;
          color: white; border: 1px solid ${RED}; cursor: default;
          background-color: transparent; font-family: inherit;
          border-radius: 4px; padding: 0; transition: background 0.3s;
        }
        .demo-action-btn.active { background: ${RED}; }
        .demo-superlike-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 22px; font-size: 8px; font-weight: 700;
          color: #d4af37; background: #000; border: none;
          border-radius: 4px; font-family: inherit; cursor: default;
        }
      `}</style>

      <div style={{
        display: "flex", alignItems: "flex-end", gap: 12,
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}>
        {/* Person 1 — venstre */}
        <div style={{
          animation: match ? "phone-jitter 0.3s ease forwards" : "none",
        }}>
          <PhoneFrame side="left">
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <SwipeCard key={cardKey} film={currentFilm}
                swipeX={p1SwipeX} likeVisible={p1LikeVisible}
                nopeVisible={p1NopeVisible} flyOut={p1FlyOut}
              />
              {match && <MatchOverlay film={matchFilm} />}
            </div>
            <ActionButtons showLike={p1BtnLike} showNope={p1BtnNope} />
          </PhoneFrame>
        </div>

        {/* Match-indikator mellom telefonene */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minWidth: 32, flexShrink: 0,
          paddingBottom: 60, position: "relative",
        }}>
          {match && (
            <div style={{
              position: "absolute",
              width: 80, height: 200,
              background: "radial-gradient(ellipse at center, rgba(255,42,42,0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          )}
          {match ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, animation: "match-pop 0.22s cubic-bezier(.2,.9,.2,1) forwards",
              position: "relative",
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: RED, lineHeight: 1 }}>
                &#10003;
              </div>
              <div style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                color: RED, textTransform: "uppercase",
              }}>Treff</div>
            </div>
          ) : (
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.15)" }}>·</div>
          )}
        </div>

        {/* Person 2 — høyre */}
        <div style={{
          animation: match ? "phone-jitter 0.3s ease forwards" : "none",
        }}>
          <PhoneFrame side="right">
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <SwipeCard key={cardKey} film={currentFilm}
                swipeX={p2SwipeX} likeVisible={p2LikeVisible}
                nopeVisible={p2NopeVisible} flyOut={p2FlyOut}
              />
              {match && <MatchOverlay film={matchFilm} />}
            </div>
            <ActionButtons showLike={p2BtnLike} showNope={p2BtnNope} />
          </PhoneFrame>
        </div>
      </div>

      {/* Hint + replay */}
      <div style={{
        marginTop: 8, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, minHeight: 16,
      }}>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.4)", fontStyle: "italic",
          opacity: fadingOut ? 0 : hint ? 0.7 : 0, transition: "opacity 0.3s ease",
        }}>{hint}</div>
        {match && !fadingOut && (
          <button onClick={() => { setStep(0); setHasAutoReplayed(true); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,42,42,0.4)", fontSize: 13, padding: "2px 4px",
              opacity: 0, animation: "replay-fade-in 0.4s ease 0.5s forwards",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,42,42,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,42,42,0.4)")}
            title="Replay"
          >↻</button>
        )}
      </div>
    </div>
  );
}
