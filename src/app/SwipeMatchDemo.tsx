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

/* Model B: Disagreement → Disagreement → Agreement → MATCH
   Film 1: P1 Like, P2 Nope
   Film 2: P1 Nope, P2 Like
   Film 3: Both Like → MATCH (holds indefinitely) */
const STEP_TIMINGS = [
  1200, // Step 0  – both browsing same title
  600,  // Step 1  – P1 drags right (considering)
  400,  // Step 2  – P1 Like + fly out
  700,  // Step 3  – P2 drags left (disagrees)
  500,  // Step 4  – P2 Nope + fly out
  600,  // Step 5  – new title loads
  600,  // Step 6  – P1 drags left
  500,  // Step 7  – P1 Nope + fly out
  400,  // Step 8  – P2 drags right
  500,  // Step 9  – P2 Like + fly out
  300,  // Step 10 – instant new title
  400,  // Step 11 – both drag right together
  400,  // Step 12 – BOTH Like + fly
  0,    // Step 13 – MATCH (frozen — holds indefinitely)
];

const HINTS = [
  "Scrolling together...",
  "Maybe this one?",
  "Hmm\u2026 not convinced.",
  "Still not aligned.",
  "Next title.",
  "Nope.",
  "Not feeling it.",
  "Different tastes...",
  "Getting closer.",
  "Maybe?",
  "Wait\u2026",
  "Both considering...",
  "Yes.",
  "",
];

function useAutoStep() {
  const [step, setStep] = useState(0);
  const [filmIdx, setFilmIdx] = useState(0);

  useEffect(() => {
    // Freeze at MATCH_STEP — hold indefinitely
    if (step >= MATCH_STEP) return;

    const delay = STEP_TIMINGS[step] ?? 1000;
    const timer = setTimeout(() => {
      setStep((s) => s + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [step, filmIdx]);

  return { step, filmIdx, setStep };
}

function SwipeCard({
  film,
  swipeX,
  likeVisible,
  nopeVisible,
  flyOut,
}: {
  film: Film;
  swipeX: number;
  likeVisible: boolean;
  nopeVisible: boolean;
  flyOut: number;
}) {
  const isFlying = flyOut !== 0;
  const isDragging = swipeX !== 0 && !isFlying;

  const transition = isFlying
    ? "transform 0.22s cubic-bezier(.2,.9,.2,1), opacity 0.22s ease"
    : isDragging
    ? "transform 0.45s ease-out"
    : "transform 0.3s ease";

  const transform = isFlying
    ? `translateX(${flyOut}px) rotate(${flyOut > 0 ? 16 : -16}deg)`
    : `translateX(${swipeX}px) rotate(${swipeX / 8}deg)`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 12,
        overflow: "hidden",
        background: film.genreColor,
        boxShadow: "0 12px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)",
        transform,
        transition,
        opacity: isFlying ? 0 : 1,
        userSelect: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={film.poster}
        alt={film.title}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent 48%, rgba(0,0,0,0.65) 72%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 10px 10px",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          {film.title} {"\u2022"} {film.year}
        </div>
        <div
          style={{
            fontSize: "0.6rem",
            color: "rgba(255,255,255,0.68)",
            marginTop: 3,
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {film.overview}
        </div>
      </div>

      {/* LIKE stamp */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: likeVisible ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(34,197,94,0.92)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            padding: "4px 12px",
            borderRadius: 6,
            border: "2px solid #22c55e",
            transform: "rotate(-12deg)",
            letterSpacing: "0.08em",
          }}
        >
          LIKE
        </div>
      </div>

      {/* NOPE stamp */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: nopeVisible ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(239,68,68,0.92)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            padding: "4px 12px",
            borderRadius: 6,
            border: "2px solid #ef4444",
            transform: "rotate(12deg)",
            letterSpacing: "0.08em",
          }}
        >
          NOPE
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  /*
   * Layout: aspect-ratio gives a real computed height (not paddingBottom trick)
   * so percentage-based top/bottom on absolute children work correctly.
   *
   * PNG is 443×960. Content sits ON TOP (z-2) of the frame (z-1)
   * because the PNG's screen area is opaque (Mockuuups placeholder).
   * The content div is clipped to the screen area via insets + overflow:hidden.
   *
   * iPhone 15 Pro bezel at 160px render width:
   *   physical bezel ≈ 10px → scaled = 10 * (160/443) ≈ 3.6px
   *   top/bottom ≈ 1–2%, sides ≈ 2–3%
   *   screen corner radius ≈ 55pt → scaled ≈ 20px
   */
  return (
    <div
      style={{
        position: "relative",
        width: 160,
        aspectRatio: "443 / 960",
      }}
    >
      {/* iPhone PNG frame — on top of content */}
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
        }}
      />

      {/* Screen content — on top, clipped to exact screen area */}
      <div
        style={{
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
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ActionButtons({ showLike, showNope }: { showLike: boolean; showNope: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 3,
        padding: "0 4px 4px",
        flexShrink: 0,
      }}
    >
      <button className={`demo-action-btn${showNope ? " active" : ""}`}>Nope</button>
      <button className="demo-superlike-btn">{"\u2605"}</button>
      <button className={`demo-action-btn${showLike ? " active" : ""}`}>Like</button>
    </div>
  );
}

function MatchOverlay({ film }: { film: Film }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      {/* Matched film poster — dimmed + desaturated behind blur */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={film.poster}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.75) saturate(0.9)",
          transform: "scale(0.98)",
        }}
      />
      {/* Dark blur backdrop — no content here, just the blur + glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          boxShadow: "inset 0 0 16px rgba(255,42,42,0.18)",
        }}
      />
      {/* Content layer — sits above blur, text stays crisp */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          animation: "match-pop 0.22s cubic-bezier(.2,.9,.2,1) forwards",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: RED,
            letterSpacing: "0.08em",
          }}
        >
          {"\u2713"} MATCH
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center" as const,
            padding: "0 8px",
            lineHeight: 1.4,
          }}
        >
          {film.title}
        </div>
        <div
          style={{
            marginTop: 6,
            background: RED,
            color: "#fff",
            fontSize: 8.5,
            fontWeight: 800,
            padding: "6px 12px",
            borderRadius: 6,
            letterSpacing: "0.08em",
            WebkitFontSmoothing: "antialiased" as const,
            animation: "cta-appear 0.26s ease-out 0.2s both, cta-breathe 2.4s ease-in-out 0.5s infinite",
            opacity: 0,
            boxShadow:
              "0 0 16px rgba(255,42,42,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            pointerEvents: "none" as const,
            cursor: "default",
          }}
        >
          START WATCHING
        </div>
      </div>
    </div>
  );
}

export default function SwipeMatchDemo({
  locale: _locale,
}: {
  locale: Locale;
}) {
  const { step, filmIdx, setStep } = useAutoStep();
  const [hasAutoReplayed, setHasAutoReplayed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Film per step range (3 films per cycle)
  const currentFilm = step <= 4
    ? FILMS[filmIdx % FILMS.length]
    : step <= 9
    ? FILMS[(filmIdx + 1) % FILMS.length]
    : FILMS[(filmIdx + 2) % FILMS.length];

  // Key forces re-mount on film change (prevents stale flyOut transitions)
  const filmPhase = step <= 4 ? 0 : step <= 9 ? 1 : 2;
  const cardKey = `${filmIdx}-${filmPhase}`;

  // P1 state
  const p1SwipeX = step === 1 ? 120 : step === 6 ? -120 : step === 11 ? 120 : 0;
  const p1FlyOut =
    (step >= 2 && step <= 4) ? 420 :
    (step >= 7 && step <= 9) ? -420 :
    step >= 12 ? 420 : 0;
  const p1LikeVisible = step === 1 || step === 11;
  const p1NopeVisible = step === 6;
  const p1BtnLike = step === 1 || step === 2 || step === 11 || step === 12;
  const p1BtnNope = step === 6 || step === 7;

  // P2 state
  const p2SwipeX = step === 3 ? -120 : step === 8 ? 120 : step === 11 ? 120 : 0;
  const p2FlyOut =
    step === 4 ? -420 :
    step === 9 ? 420 :
    step >= 12 ? 420 : 0;
  const p2LikeVisible = step === 8 || step === 11;
  const p2NopeVisible = step === 3;
  const p2BtnLike = step === 8 || step === 9 || step === 11 || step === 12;
  const p2BtnNope = step === 3 || step === 4;

  // Match (frozen)
  const match = step >= MATCH_STEP;

  // Auto-replay once after 20s if user hasn't interacted
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

  // Match film is always the 3rd film in the cycle
  const matchFilm = FILMS[(filmIdx + 2) % FILMS.length];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes match-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
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
          0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(255,42,42,0.35), inset 0 1px 0 rgba(255,255,255,0.2); }
          50% { transform: scale(1.04); box-shadow: 0 0 22px rgba(255,42,42,0.45), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
        @keyframes phone-jitter {
          0%   { transform: translateX(0); }
          15%  { transform: translateX(-3px); }
          30%  { transform: translateX(3px); }
          45%  { transform: translateX(-2px); }
          60%  { transform: translateX(2px); }
          75%  { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        @keyframes phone-settle {
          from { transform: scale(1.02); }
          to   { transform: scale(1); }
        }
        @keyframes replay-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .demo-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 24px;
          font-size: 9px;
          font-weight: 700;
          color: white;
          border: 1px solid ${RED};
          cursor: default;
          background-color: transparent;
          overflow: hidden;
          font-family: inherit;
          border-radius: 4px;
          padding: 0;
          transition: background 0.3s;
        }
        .demo-action-btn.active {
          background: ${RED};
        }
        .demo-superlike-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 24px;
          font-size: 9px;
          font-weight: 700;
          color: #d4af37;
          background: #000;
          border: none;
          border-radius: 4px;
          font-family: inherit;
          cursor: default;
        }
      `}</style>

      {/* Two phones + match indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          opacity: fadingOut ? 0 : 1,
          transition: "opacity 0.4s ease, filter 0.3s ease",
          filter: match ? "brightness(0.92)" : "none",
        }}
      >
        {/* Person 1 */}
        <div
          style={{
            borderRadius: 26,
            willChange: match ? "transform" : "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
            animation: match
              ? "phone-jitter 0.18s ease forwards, phone-settle 0.12s ease-out 0.18s forwards"
              : "none",
          }}
        >
          <PhoneFrame>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <SwipeCard
                key={cardKey}
                film={currentFilm}
                swipeX={p1SwipeX}
                likeVisible={p1LikeVisible}
                nopeVisible={p1NopeVisible}
                flyOut={p1FlyOut}
              />
              {match && <MatchOverlay film={matchFilm} />}
            </div>
            <ActionButtons showLike={p1BtnLike} showNope={p1BtnNope} />
          </PhoneFrame>
        </div>

        {/* Match indicator between phones */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "40%",
            minWidth: 32,
            flexShrink: 0,
          }}
        >
          {match ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                animation: "match-pop 0.22s cubic-bezier(.2,.9,.2,1) forwards",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: RED,
                  lineHeight: 1,
                }}
              >
                {"\u2713"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: RED,
                  textTransform: "uppercase" as const,
                }}
              >
                MATCH
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.15)",
                lineHeight: 1,
              }}
            >
              {"\u00B7"}
            </div>
          )}
        </div>

        {/* Person 2 */}
        <div
          style={{
            borderRadius: 26,
            willChange: match ? "transform" : "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
            animation: match
              ? "phone-jitter 0.18s ease forwards, phone-settle 0.12s ease-out 0.18s forwards"
              : "none",
          }}
        >
          <PhoneFrame>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <SwipeCard
                key={cardKey}
                film={currentFilm}
                swipeX={p2SwipeX}
                likeVisible={p2LikeVisible}
                nopeVisible={p2NopeVisible}
                flyOut={p2FlyOut}
              />
              {match && <MatchOverlay film={matchFilm} />}
            </div>
            <ActionButtons showLike={p2BtnLike} showNope={p2BtnNope} />
          </PhoneFrame>
        </div>
      </div>

      {/* Hint text + replay button */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontStyle: "italic",
            transition: "opacity 0.3s ease",
            opacity: fadingOut ? 0 : hint ? 0.7 : 0,
          }}
        >
          {hint}
        </div>
        {match && !fadingOut && (
          <button
            onClick={() => {
              setStep(0);
              setHasAutoReplayed(true);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,42,42,0.4)",
              fontSize: 13,
              padding: "2px 4px",
              lineHeight: 1,
              transition: "color 0.2s ease",
              opacity: 0,
              animation: "replay-fade-in 0.4s ease 0.5s forwards",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,42,42,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,42,42,0.4)")}
            title="Replay"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}
