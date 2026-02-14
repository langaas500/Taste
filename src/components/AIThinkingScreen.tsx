"use client";

import { useState, useEffect } from "react";

const messages = [
  "Analyzing your taste...",
  "Mapping patterns...",
  "Finding unexpected connections...",
  "Scanning hidden gems...",
  "Weighing your preferences...",
  "Curating your picks...",
];

export default function AIThinkingScreen({ text }: { text?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[var(--bg-base)]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124, 92, 252, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 30% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 70% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)
            `,
            animation: "glow-pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Orbiting particles */}
      <div className="absolute" style={{ width: 160, height: 160 }}>
        <div
          className="absolute w-2 h-2 rounded-full bg-[var(--accent)] opacity-60"
          style={{ animation: "orbit 6s linear infinite", top: "50%", left: "50%" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] opacity-40"
          style={{ animation: "orbit-reverse 8s linear infinite", top: "50%", left: "50%" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-purple-400 opacity-50"
          style={{ animation: "orbit 10s linear infinite", top: "50%", left: "50%", animationDelay: "-3s" }}
        />
      </div>

      {/* Glass card */}
      <div className="relative glass-strong rounded-[var(--radius-xl)] p-8 max-w-xs mx-4 text-center">
        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[var(--accent-glow)] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)] opacity-80" style={{ animation: "glow-pulse 2s ease-in-out infinite" }} />
        </div>

        <p
          className={`text-sm font-medium text-[var(--text-primary)] transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
        >
          {text || messages[msgIndex]}
        </p>

        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-[var(--accent)]"
              style={{
                animation: "glow-pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
