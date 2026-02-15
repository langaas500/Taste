import { useState, useEffect } from "react";

const messages = [
  { text: "Spolerer ingen filmer...", emoji: "🤫" },
  { text: "Blar gjennom samlingen din...", emoji: "🎬" },
  { text: "Finner mønster i galskapen...", emoji: "🔍" },
  { text: "Bedømmer smaken din (litt)...", emoji: "👀" },
  { text: "Sjekker guilty pleasures...", emoji: "🍿" },
  { text: "Analyserer binge-vanene...", emoji: "📺" },
  { text: "Teller explosjoner vs. tårer...", emoji: "💥" },
  { text: "Kalibrerer cringe-toleransen...", emoji: "😬" },
  { text: "Noterer at du likte den filmen...", emoji: "📝" },
  { text: "Nesten ferdig, bare én episode til...", emoji: "⏳" },
];

const filmStrip = () => {
  const holes = [];
  for (let i = 0; i < 20; i++) holes.push(i);
  return holes;
};

export default function AIThinkingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 250);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const currentMsg = messages[msgIndex];

  return (
    <div style={{
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: "70vh", overflow: "hidden", borderRadius: 16,
    }}>
      {/* Subtle ambient light */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(255,42,42,0.04) 0%, transparent 60%)",
      }} />

      {/* Film strip left */}
      <div style={{
        position: "absolute", left: 40, top: 0, bottom: 0, width: 32, opacity: 0.04,
        display: "flex", flexDirection: "column", gap: 4, paddingTop: 20,
        animation: "stripScroll 20s linear infinite",
      }}>
        {filmStrip().map((i) => (
          <div key={`l${i}`} style={{
            width: 32, height: 24, borderRadius: 3,
            border: "2px solid rgba(255,255,255,0.8)",
          }} />
        ))}
      </div>

      {/* Film strip right */}
      <div style={{
        position: "absolute", right: 40, top: 0, bottom: 0, width: 32, opacity: 0.04,
        display: "flex", flexDirection: "column", gap: 4, paddingTop: 40,
        animation: "stripScroll 25s linear infinite reverse",
      }}>
        {filmStrip().map((i) => (
          <div key={`r${i}`} style={{
            width: 32, height: 24, borderRadius: 3,
            border: "2px solid rgba(255,255,255,0.8)",
          }} />
        ))}
      </div>

      {/* Main content */}
      <div style={{
        position: "relative", textAlign: "center", maxWidth: 360, padding: "0 24px",
      }}>
        {/* Icon circle */}
        <div style={{
          width: 72, height: 72, margin: "0 auto 28px", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Pulsing rings */}
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: "1px solid rgba(255,42,42,0.15)",
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
          }} />
          <div style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: "1px solid rgba(255,42,42,0.08)",
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            animationDelay: "0.5s",
          }} />

          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,42,42,0.08)",
            border: "1px solid rgba(255,42,42,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
            animation: "breathe 3s ease-in-out infinite",
          }}>
            <span style={{
              transition: "opacity 0.25s",
              opacity: fade ? 1 : 0,
            }}>
              {currentMsg.emoji}
            </span>
          </div>
        </div>

        {/* Message */}
        <div style={{
          fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)",
          marginBottom: 8, minHeight: 24,
          transition: "opacity 0.25s",
          opacity: fade ? 1 : 0,
        }}>
          {currentMsg.text}
        </div>

        {/* Three dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6, marginBottom: 0,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: "50%",
              background: "rgba(255,42,42,0.5)",
              animation: "dotPulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>

        {/* Time estimate */}
        <div style={{
          marginTop: 24,
          fontSize: 12, color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.02em",
        }}>
          Dette kan ta 10–20 sekunder
        </div>

        {/* Bottom emoji row */}
        <div style={{
          marginTop: 56, display: "flex", justifyContent: "center", gap: 20,
        }}>
          {["🎬", "🎭", "🎞️", "📽️", "🍿"].map((e, i) => (
            <span key={i} style={{
              fontSize: 28,
              animation: "float 3s ease-in-out infinite",
              animationDelay: `${i * 0.4}s`,
            }}>{e}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes stripScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-280px); }
        }
      `}</style>
    </div>
  );
}
