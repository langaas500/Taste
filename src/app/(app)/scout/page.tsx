"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import PremiumModal from "@/components/PremiumModal";
import { track } from "@/lib/posthog";

interface WatchProvider {
  name: string;
  logo: string;
  type: "flatrate" | "rent" | "buy";
}

interface ScoutMovie {
  tmdb_id: number;
  title: string;
  type: "movie" | "tv";
  year: number | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  providers: WatchProvider[];
}

interface Message {
  role: "scout" | "user";
  text: string;
  movies?: ScoutMovie[];
  loading?: boolean;
}

const INITIAL_MESSAGE: Message = {
  role: "scout",
  text: "Hei! Beskriv en film eller serie du leter etter, sa hjelper jeg deg a finne den.",
};

export default function ScoutPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.profile) setIsPremium(!!d.profile.is_premium); })
      .catch(() => setIsPremium(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    if (!isPremium) {
      track("scout_premium_gate", { action: "blocked" });
      setShowPremium(true);
      return;
    }

    setInput("");
    track("scout_message_sent");

    // Add user message + loading placeholder
    const loadingMsg: Message = { role: "scout", text: "Scout graver i filmarkivet...", loading: true };
    setMessages((prev) => [...prev, { role: "user", text }, loadingMsg]);

    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setIsPremium(false);
        setShowPremium(true);
        setMessages((prev) => prev.filter((m) => !m.loading));
        return;
      }

      if (!res.ok) throw new Error(data.error || "Noe gikk galt");

      // Replace loading with real response
      setMessages((prev) => {
        const without = prev.filter((m) => !m.loading);
        return [...without, {
          role: "scout",
          text: data.message || "Fant dessverre ingenting...",
          movies: data.movies || [],
        }];
      });
    } catch {
      setMessages((prev) => {
        const without = prev.filter((m) => !m.loading);
        return [...without, { role: "scout", text: "Beklager, noe gikk galt. Prov igjen!" }];
      });
    }

    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isLoading = messages.some((m) => m.loading);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg-base)",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(6,8,15,0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(255,42,42,0.08)",
              border: "1px solid rgba(255,42,42,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="var(--accent)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.2 }}>
              Scout
            </h1>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.3 }}>
              AI-drevet filmsok
            </p>
          </div>
          {isPremium && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.06em",
                padding: "3px 7px",
                borderRadius: 6,
                background: "rgba(255,42,42,0.08)",
                color: "rgba(255,42,42,0.55)",
                border: "1px solid rgba(255,42,42,0.12)",
              }}
            >
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingBottom: 96,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            {/* Chat bubble */}
            <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "rgba(255,42,42,0.12)" : "var(--glass)",
                  border: msg.role === "user" ? "1px solid rgba(255,42,42,0.18)" : "1px solid var(--glass-border)",
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                  color: msg.loading
                    ? "rgba(255,255,255,0.3)"
                    : msg.role === "user"
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.75)",
                  fontStyle: msg.loading ? "italic" : "normal",
                }}
              >
                {msg.text}
              </div>
            </div>

            {/* Movie cards */}
            {msg.movies && msg.movies.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10, paddingLeft: 4 }}>
                {msg.movies.map((movie) => (
                  <MovieCard key={`${movie.tmdb_id}:${movie.type}`} movie={movie} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Premium gate banner for free users */}
        {isPremium === false && messages.length <= 1 && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 16,
              background: "rgba(255,42,42,0.06)",
              border: "1px solid rgba(255,42,42,0.15)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 12 }}>
              Scout er en Premium-funksjon. Oppgrader for a fa tilgang til AI-drevet filmsok.
            </p>
            <button
              onClick={() => setShowPremium(true)}
              style={{
                background: "#ff2a2a",
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Oppgrader til Premium
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: "calc(70px + env(safe-area-inset-bottom, 0px))",
          background: "linear-gradient(to top, var(--bg-base) 65%, transparent)",
          zIndex: 20,
        }}
        className="md:static md:pb-0 md:bg-none md:z-auto"
      >
        <div
          style={{
            margin: "0 12px 12px",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            padding: "10px 10px 10px 14px",
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPremium === false ? "Krever Premium..." : "Beskriv hva du ser etter..."}
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "0.9375rem",
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.85)",
              caretColor: "var(--accent)",
              fontFamily: "inherit",
              maxHeight: 120,
              overflowY: "auto",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: input.trim() && !isLoading ? "var(--accent)" : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: input.trim() && !isLoading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms ease",
            }}
            aria-label="Send"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={input.trim() && !isLoading ? "white" : "rgba(255,255,255,0.25)"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="scout" />
    </div>
  );
}

/* ── MovieCard ───────────────────────────────────────── */

function MovieCard({ movie }: { movie: ScoutMovie }) {
  const imgSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null;
  const flatrate = movie.providers.filter((p) => p.type === "flatrate");
  const rentBuy = movie.providers.filter((p) => p.type === "rent" || p.type === "buy");

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Poster */}
      {imgSrc && (
        <div style={{ width: 70, height: 105, borderRadius: 8, overflow: "hidden", flexShrink: 0, position: "relative" }}>
          <Image src={imgSrc} alt={movie.title} fill sizes="70px" style={{ objectFit: "cover" }} />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
            {movie.title}
          </span>
          {movie.year && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>({movie.year})</span>
          )}
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {movie.type === "tv" ? "Serie" : "Film"}
          </span>
        </div>

        {movie.vote_average > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#facc15" }}>&#9733;</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {movie.overview && (
          <p style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {movie.overview}
          </p>
        )}

        {/* Streaming providers */}
        {(flatrate.length > 0 || rentBuy.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {flatrate.map((p) => (
              <ProviderBadge key={p.name} provider={p} highlight />
            ))}
            {rentBuy.map((p) => (
              <ProviderBadge key={p.name} provider={p} />
            ))}
          </div>
        )}

        {flatrate.length === 0 && rentBuy.length === 0 && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            Ingen strommetjenester funnet for Norge
          </span>
        )}
      </div>
    </div>
  );
}

/* ── ProviderBadge ───────────────────────────────────── */

function ProviderBadge({ provider, highlight }: { provider: WatchProvider; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px 2px 2px",
        borderRadius: 6,
        background: highlight ? "rgba(255,42,42,0.08)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${highlight ? "rgba(255,42,42,0.15)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {provider.logo && (
        <Image
          src={provider.logo}
          alt={provider.name}
          width={18}
          height={18}
          style={{ borderRadius: 4 }}
        />
      )}
      <span style={{
        fontSize: 10,
        fontWeight: 500,
        color: highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
      }}>
        {provider.name}
      </span>
    </div>
  );
}
