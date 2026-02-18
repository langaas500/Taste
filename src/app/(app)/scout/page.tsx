"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "scout" | "user";
  text: string;
}

const INITIAL_MESSAGE: Message = {
  role: "scout",
  text: "Hei! Beskriv en film eller serie du leter etter, så hjelper jeg deg å finne den. 🔍",
};

export default function ScoutPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "scout", text: "Kommer snart..." },
    ]);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

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
      {/* ── Header ── */}
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
              AI-drevet filmsøk
            </p>
          </div>
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
            KOMMER SNART
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          /* Extra bottom padding so last message clears the input bar */
          paddingBottom: 96,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background:
                  msg.role === "user"
                    ? "rgba(255,42,42,0.12)"
                    : "var(--glass)",
                border:
                  msg.role === "user"
                    ? "1px solid rgba(255,42,42,0.18)"
                    : "1px solid var(--glass-border)",
                fontSize: "0.875rem",
                lineHeight: 1.55,
                color:
                  msg.text === "Kommer snart..."
                    ? "rgba(255,255,255,0.3)"
                    : msg.role === "user"
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.75)",
                fontStyle: msg.text === "Kommer snart..." ? "italic" : "normal",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          /* Push above mobile bottom nav — mobile nav is ~70px, desktop has no bottom nav */
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
            placeholder="Beskriv hva du ser etter…"
            rows={1}
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
            disabled={!input.trim()}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: input.trim() ? "var(--accent)" : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms ease",
            }}
            aria-label="Send"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={input.trim() ? "white" : "rgba(255,255,255,0.25)"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
