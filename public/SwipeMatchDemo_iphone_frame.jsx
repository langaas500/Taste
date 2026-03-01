import { useState, useEffect } from "react";

const RED = "#ff2a2a";

const FILMS = [
  {
    title: "Fallout",
    year: 2024,
    genre: "Sci-Fi · Drama",
    overview: "In a post-apocalyptic world, a woman leaves her vault to find her father.",
    poster: "https://image.tmdb.org/t/p/w500/AnsSKR4e0KFKGf93v6tGGGm4OCj.jpg",
    genreColor: "#1a4a5a",
  },
  {
    title: "The Pitt",
    year: 2025,
    genre: "Drama · Thriller",
    overview: "A day in the life of the staff at a Pittsburgh trauma center.",
    poster: "https://image.tmdb.org/t/p/w500/ugHWnBp4HQTUrBHOdHGFVGRjBo.jpg",
    genreColor: "#2d1a3d",
  },
  {
    title: "Stranger Things",
    year: 2025,
    genre: "Sci-Fi · Horror",
    overview: "When a boy vanishes, a small town uncovers a mystery involving secret experiments.",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    genreColor: "#1a1a2d",
  },
];

// Step timings in ms
// 0: show card, 1: p1 like, 2: p2 like, 3: match reveal, 4: hold match, 5: fade out
const STEP_TIMINGS = [2000, 1200, 1200, 3000, 1200, 800];

function useAutoStep() {
  const [step, setStep] = useState(0);
  const [filmIdx, setFilmIdx] = useState(0);

  useEffect(() => {
    const delay = STEP_TIMINGS[step] ?? 1200;
    const timer = setTimeout(() => {
      if (step < STEP_TIMINGS.length - 1) {
        setStep((s) => s + 1);
      } else {
        setStep(0);
        setFilmIdx((i) => (i + 1) % FILMS.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [step]);

  return { step, filmIdx };
}

// Exact card replica from together/page.tsx
function SwipeCard({ film, swipeX, likeVisible, dislikeVisible, flyOut }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "2/3",
        borderRadius: 18,
        overflow: "hidden",
        background: film.genreColor,
        boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
        transform: flyOut
          ? `translateX(${flyOut}px) rotate(${flyOut > 0 ? 20 : -20}deg)`
          : `translateX(${swipeX}px) rotate(${swipeX / 18}deg)`,
        transition: flyOut
          ? "transform 200ms cubic-bezier(.2,.9,.2,1)"
          : swipeX !== 0
          ? "none"
          : "transform 220ms cubic-bezier(.2,.9,.2,1)",
        userSelect: "none",
      }}
    >
      <img
        src={film.poster}
        alt={film.title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { e.target.style.display = "none"; }}
      />
      {/* Bottom gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 48%, rgba(0,0,0,0.65) 72%, rgba(0,0,0,0.92) 100%)" }} />

      {/* Card text */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 20px" }}>
        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
          {film.title} · {film.year}
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", marginTop: 4, lineHeight: 1.4 }}>
          {film.overview}
        </div>
      </div>

      {/* LIKE overlay — exact style from together */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: likeVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <div style={{
          background: "rgba(34,197,94,0.92)",
          color: "#fff",
          fontSize: "clamp(20px, 5vw, 28px)",
          fontWeight: 900,
          padding: "6px 20px",
          borderRadius: 10,
          border: "3px solid #22c55e",
          transform: "rotate(-8deg)",
          letterSpacing: "0.05em",
        }}>
          LIKE
        </div>
      </div>

      {/* NOPE overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: dislikeVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <div style={{
          background: "rgba(239,68,68,0.92)",
          color: "#fff",
          fontSize: "clamp(20px, 5vw, 28px)",
          fontWeight: 900,
          padding: "6px 20px",
          borderRadius: 10,
          border: "3px solid #ef4444",
          transform: "rotate(8deg)",
          letterSpacing: "0.05em",
        }}>
          NOPE
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children, label }) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 180 }}>
      <div style={{ position: "relative", width: "100%", borderRadius: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
        {/* Screen content */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", margin: "10% 6%", background: "#0a0a0f" }}>
          <div style={{ padding: "8px 8px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
            {children}
          </div>
        </div>
        {/* iPhone frame overlay */}
        <img
          src="https://your-hosted-iphone-frame.png"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 20 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
      {label && (
        <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Action buttons — exact replica from together/page.tsx CSS
function ActionButtons({ showLike, showDislike, disabled }) {
  return (
    <>
      <style>{`
        .demo-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 32px;
          font-size: 11px;
          font-weight: 700;
          color: white;
          border: 2px solid #ff2a2a;
          cursor: default;
          position: relative;
          background-color: transparent;
          overflow: hidden;
          z-index: 1;
          font-family: inherit;
          border-radius: 8px;
          padding: 0;
          transition: background 0.3s;
        }
        .demo-action-btn.active {
          background: #ff2a2a;
        }
        .demo-superlike-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 32px;
          font-size: 11px;
          font-weight: 700;
          color: #d4af37;
          background: #000;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          position: relative;
          cursor: default;
        }
        .demo-superlike-btn::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 9px;
          background: linear-gradient(-45deg, rgba(255,255,255,0.8) 0%, rgba(200,200,210,0.5) 50%, rgba(255,255,255,0.8) 100%);
          z-index: -1;
        }
      `}</style>
      <div style={{ display: "flex", gap: 4, padding: "0 2px 4px" }}>
        <button className={`demo-action-btn${showDislike ? " active" : ""}`}>Dislike</button>
        <button className="demo-superlike-btn">★ 3</button>
        <button className={`demo-action-btn${showLike ? " active" : ""}`}>Like</button>
      </div>
    </>
  );
}

const HINTS = [
  "Both viewing the same title...",
  "Person 1 swipes Like 👍",
  "Person 2 swipes Like 👍",
  "It's a MATCH! 🔥",
  "Time to watch together!",
  "Next title loading...",
];

export default function SwipeMatchDemo() {
  const { step, filmIdx } = useAutoStep();
  const film = FILMS[filmIdx % FILMS.length];

  const p1Like = step >= 1;
  const p2Like = step >= 2;
  const match = step >= 3 && step < 5;
  const fading = step >= 5;

  // Animate swipe: card moves right on like
  const p1SwipeX = step === 1 ? 60 : 0;
  const p2SwipeX = step === 2 ? 60 : 0;
  const p1FlyOut = step >= 2 && !match ? 300 : 0;
  const p2FlyOut = step >= 3 && !match ? 300 : 0;

  return (
    <div style={{
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px 48px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#fff",
    }}>
      <style>{`
        @keyframes match-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(255,42,42,0.5)); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 20px rgba(255,42,42,0.8)); }
        }
        @keyframes match-badge {
          from { opacity: 0; transform: translateY(6px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hint-rise {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Section label */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 6 }}>
          How it works
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
          See it in action
        </div>
      </div>

      {/* Two phones */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        width: "100%",
        maxWidth: 420,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        position: "relative",
      }}>
        <PhoneFrame label="Person 1">
          <SwipeCard
            film={film}
            swipeX={p1SwipeX}
            likeVisible={p1Like && !p1FlyOut}
            dislikeVisible={false}
            flyOut={p1FlyOut}
          />
          <ActionButtons showLike={p1Like} showDislike={false} />
        </PhoneFrame>

        {/* Match indicator between phones */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingTop: "35%",
          minWidth: 44,
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: match ? 32 : 20,
            transition: "font-size 0.3s ease",
            animation: match ? "match-pulse 1.4s ease-in-out infinite" : "none",
          }}>
            {match ? "❤️" : "·"}
          </div>
          {match && (
            <div style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: RED,
              textTransform: "uppercase",
              animation: "match-badge 0.4s ease forwards",
            }}>
              MATCH
            </div>
          )}
        </div>

        <PhoneFrame label="Person 2">
          <SwipeCard
            film={film}
            swipeX={p2SwipeX}
            likeVisible={p2Like && !p2FlyOut}
            dislikeVisible={false}
            flyOut={p2FlyOut}
          />
          <ActionButtons showLike={p2Like} showDislike={false} />
        </PhoneFrame>
      </div>

      {/* Hint text */}
      <div
        key={step}
        style={{
          marginTop: 24,
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          textAlign: "center",
          minHeight: 20,
          animation: "hint-rise 0.4s ease forwards",
        }}
      >
        {HINTS[step] || ""}
      </div>

      {/* Progress dots — same style as together */}
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 7,
            height: 7,
            borderRadius: 99,
            background: i === step ? RED : i < step ? "rgba(255,42,42,0.25)" : "rgba(255,255,255,0.12)",
            transition: "all 0.35s ease",
          }} />
        ))}
      </div>
    </div>
  );
}
