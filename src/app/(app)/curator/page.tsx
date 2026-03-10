"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import PremiumModal from "@/components/PremiumModal";
import { track } from "@/lib/posthog";
import type { Locale } from "@/lib/i18n";

/* ── Types ─────────────────────────────────────────── */

interface WatchProvider {
  name: string;
  logo: string;
  type: "flatrate" | "rent" | "buy";
}

interface CuratorMovie {
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
  role: "bot" | "user";
  text: string;
  movies?: CuratorMovie[];
  loading?: boolean;
}

/* ── i18n ──────────────────────────────────────────── */

function getUserLanguage(): Locale {
  if (typeof window === "undefined") return "no";
  const lang = navigator.language || "";
  if (lang.startsWith("nb") || lang.startsWith("no") || lang.startsWith("nn")) return "no";
  if (lang.startsWith("da")) return "dk";
  if (lang.startsWith("sv")) return "se";
  if (lang.startsWith("fi")) return "fi";
  return "en";
}

const i18n = {
  no: {
    greeting: (name: string) => `God kveld, ${name}.\n\nKinomørket har senket seg. Hva skal vi fylle lerretet med i kveld?`,
    fallback: "MAXI",
    prompts: [
      "Finn en film som gir meg samme følelse som Interstellar",
      "Planlegg en skrekkfilmnatt for to",
      "Vis meg skjulte perler jeg aldri har hørt om",
      "En film som endrer verdenssynet mitt",
    ],
    placeholder: "Beskriv en film, en følelse eller en skuespiller...",
    subtitle: "AI Filmekspert",
    error: "Noe gikk galt. Prøv igjen.",
    thinking: "Curator henter frem perlene...",
    premiumTitle: "Lås opp full filmkunnskap",
    premiumPerks: ["Dypere emosjonell matching", "Smaksbaserte anbefalinger", "Tilgang til skjulte rariteter"],
    premiumBody: "Curator har mye mer å by på — dypere innsikt og anbefalinger du ikke finner ellers.",
    premiumCta: "Oppgrader til Premium →",
  },
  en: {
    greeting: (name: string) => `Good evening, ${name}.\n\nThe theater lights have dimmed. What shall we fill the screen with tonight?`,
    fallback: "MAXI",
    prompts: [
      "Find a movie that gives me the same feeling as Interstellar",
      "Plan a horror movie night for two",
      "Show me hidden gems I've never heard of",
      "A movie that changes my worldview",
    ],
    placeholder: "Describe a movie, a feeling, or an actor...",
    subtitle: "AI Film Expert",
    error: "Something went wrong. Please try again.",
    thinking: "Curator is finding the gems...",
    premiumTitle: "Unlock full cinematic knowledge",
    premiumPerks: ["Deeper emotional matching", "Taste-based recommendations", "Access to hidden rarities"],
    premiumBody: "Curator has much more to offer — deeper insights and recommendations you won't find elsewhere.",
    premiumCta: "Upgrade to Premium →",
  },
  dk: {
    greeting: (name: string) => `God aften, ${name}.\n\nBiografmørket har sænket sig. Hvad skal vi fylde lærredet med i aften?`,
    fallback: "MAXI",
    prompts: [
      "Find en film der giver mig samme følelse som Interstellar",
      "Planlæg en gyserfilmaften for to",
      "Vis mig skjulte perler jeg aldrig har hørt om",
      "En film der ændrer mit verdenssyn",
    ],
    placeholder: "Beskriv en film, en følelse eller en skuespiller...",
    subtitle: "AI Filmekspert",
    error: "Noget gik galt. Prøv igen.",
    thinking: "Curator finder perlerne...",
    premiumTitle: "Lås op for fuld filmviden",
    premiumPerks: ["Dybere følelsesmæssig matching", "Smagsbaserede anbefalinger", "Adgang til skjulte rariteter"],
    premiumBody: "Curator har meget mere at byde på — dybere indsigt og anbefalinger du ikke finder andre steder.",
    premiumCta: "Opgrader til Premium →",
  },
  se: {
    greeting: (name: string) => `God kväll, ${name}.\n\nBiomörkret har sänkt sig. Vad ska vi fylla duken med ikväll?`,
    fallback: "MAXI",
    prompts: [
      "Hitta en film som ger mig samma känsla som Interstellar",
      "Planera en skräckfilmskväll för två",
      "Visa mig dolda pärlor jag aldrig hört talas om",
      "En film som förändrar min världsbild",
    ],
    placeholder: "Beskriv en film, en känsla eller en skådespelare...",
    subtitle: "AI Filmexpert",
    error: "Något gick fel. Försök igen.",
    thinking: "Curator letar fram pärlorna...",
    premiumTitle: "Lås upp full filmkunskap",
    premiumPerks: ["Djupare emotionell matchning", "Smakbaserade rekommendationer", "Tillgång till dolda rariteter"],
    premiumBody: "Curator har mycket mer att erbjuda — djupare insikter och rekommendationer du inte hittar annars.",
    premiumCta: "Uppgradera till Premium →",
  },
  fi: {
    greeting: (name: string) => `Hyvää iltaa, ${name}.\n\nElokuvateatterin valot ovat himmenneet. Mitä täytämme valkokankaalle tänä iltana?`,
    fallback: "MAXI",
    prompts: [
      "Etsi elokuva joka antaa saman tunteen kuin Interstellar",
      "Suunnittele kauhuelokuvailta kahdelle",
      "Näytä piilotettuja helmiä joista en ole kuullut",
      "Elokuva joka muuttaa maailmankuvaani",
    ],
    placeholder: "Kuvaile elokuvaa, tunnetta tai näyttelijää...",
    subtitle: "AI-elokuvaasiantuntija",
    error: "Jokin meni pieleen. Yritä uudelleen.",
    thinking: "Curator etsii helmiä...",
    premiumTitle: "Avaa täysi elokuvatietämys",
    premiumPerks: ["Syvempi tunnepohjainen matchaus", "Makuun perustuvat suositukset", "Pääsy piilotettuihin harvinaisuuksiin"],
    premiumBody: "Curatorilla on paljon enemmän tarjottavaa — syvempiä oivalluksia ja suosituksia joita et löydä muualta.",
    premiumCta: "Päivitä Premiumiin →",
  },
} as const;

/* ── Inline SVG icons ──────────────────────────────── */

function SparklesIcon({ size = 18, color = "#E50914" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function FilmIcon({ size = 14, color = "#E50914" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
    </svg>
  );
}

function SendIcon({ size = 15, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={color}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="#FFD700" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/* ── Sub-components ────────────────────────────────── */

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2">
      <BotAvatar />
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-red-600"
            style={{ animation: `curator-breathe 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10">
      <FilmIcon size={14} />
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "bot";

  // Split bot greeting: first line = greeting, rest = question
  let content: React.ReactNode = msg.text;
  if (isBot && msg.text.includes("\n\n")) {
    const parts = msg.text.split("\n\n");
    content = (
      <>
        <span>{parts[0]}</span>
        <span style={{ display: "block", marginTop: 6 }}>{parts.slice(1).join("\n\n")}</span>
      </>
    );
  }

  return (
    <div className={`flex gap-3 items-start ${isBot ? "flex-row" : "flex-row-reverse"}`}>
      {isBot && <BotAvatar />}
      <div
        className={`max-w-xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "bg-white/5 border border-white/10 text-white/85 backdrop-blur-sm"
            : "bg-red-600/15 border border-red-600/25 text-white/95 rounded-xl"
        }`}
        style={isBot ? { borderRadius: "4px 18px 18px 18px" } : undefined}
      >
        {content}
      </div>
    </div>
  );
}

/* ── Premium unlock (inline, subtle) ───────────────── */

function PremiumUnlock({ lang, onUpgrade }: { lang: Locale; onUpgrade: () => void }) {
  const t = i18n[lang] ?? i18n.en;
  return (
    <div className="flex gap-3 items-start relative group" style={{ maxWidth: "75%" }}>
      {/* Ambient Red Glow for the Gate */}
      <div className="absolute -inset-4 bg-red-600/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <BotAvatar />
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <LockIcon size={10} />
            <span className="text-[10px] font-bold tracking-[0.18em] text-red-500 uppercase">Curator Premium</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="bg-white/[0.03] border border-red-600/20 px-5 py-5 backdrop-blur-xl shadow-2xl" style={{ borderRadius: "4px 18px 18px 18px" }}>
          <h3 className="text-lg font-semibold text-white/90 mb-2">{t.premiumTitle}</h3>
          <p className="text-xs text-white/50 mb-4 leading-relaxed">
            {t.premiumBody}
          </p>
          <div className="flex flex-col gap-2 mb-6">
            {t.premiumPerks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600/60 shadow-[0_0_8px_rgba(229,9,20,0.4)] flex-shrink-0" />
                <span className="text-xs text-white/40">{perk}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer hover:-translate-y-1 active:translate-y-0 hover:opacity-90"
            style={{ background: "linear-gradient(#B00000, #E50914)", boxShadow: "0 10px 20px rgba(229,9,20,0.3)" }}
          >
            <LockIcon size={14} />
            {t.premiumCta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────── */

export default function CuratorPage() {
  const [lang] = useState<Locale>(getUserLanguage);
  const [username, setUsername] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const FREE_MESSAGE_LIMIT = 5;
  const t = i18n[lang] ?? i18n.en;
  const isLoading = messages.some((m) => m.loading);
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setIsPremium(!!d.profile.is_premium);
          const name = d.profile.display_name || t.fallback;
          setUsername(d.profile.display_name || null);
          setMessages([{ role: "bot", text: t.greeting(name) }]);
        } else {
          setIsPremium(false);
          setMessages([{ role: "bot", text: t.greeting(t.fallback) }]);
        }
      })
      .catch(() => {
        setIsPremium(false);
        setMessages([{ role: "bot", text: t.greeting(t.fallback) }]);
      });
  }, [lang, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(promptText?: string) {
    const text = promptText || input.trim();
    if (!text || isLoading) return;

    if (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT) {
      track("curator_premium_gate", { action: "blocked", messages_sent: userMessageCount });
      setShowPremium(true);
      return;
    }

    setInput("");
    track("curator_message_sent");

    const loadingMsg: Message = { role: "bot", text: t.thinking, loading: true };
    setMessages((prev) => [...prev, { role: "user", text }, loadingMsg]);

    try {
      // Build chat history for API (exclude loading messages and greeting)
      const history = messages
        .filter((m) => !m.loading)
        .slice(1) // skip greeting
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/curator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang, username, messageCount: userMessageCount, history }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setIsPremium(false);
        setShowPremium(true);
        setMessages((prev) => prev.filter((m) => !m.loading));
        return;
      }

      if (!res.ok) throw new Error(data.error || "Error");

      setMessages((prev) => {
        const without = prev.filter((m) => !m.loading);
        return [...without, {
          role: "bot" as const,
          text: data.message || t.error,
          movies: data.movies || [],
        }];
      });
    } catch (e) {
      const isTimeout = e instanceof DOMException && (e.name === "AbortError" || e.name === "TimeoutError");
      const errorText = isTimeout
        ? (lang === "no" ? "Forespørselen tok for lang tid. Prøv igjen." : "The request timed out. Please try again.")
        : t.error;
      setMessages((prev) => {
        const without = prev.filter((m) => !m.loading);
        return [...without, { role: "bot" as const, text: errorText }];
      });
    }

    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full -mx-4 -my-4 md:-mx-6 md:-my-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/5 blur-[120px] pointer-events-none" />

      {/* Main Glass chat window */}
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto mt-6 md:mt-8 backdrop-blur-[25px] border border-white/[0.08] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative z-10" style={{ background: "rgba(10,10,10,0.45)" }}>
        
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/[0.06] bg-black/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 border border-white/10 flex items-center justify-center shadow-lg">
            <SparklesIcon size={18} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-white leading-tight">
              Curator
            </h1>
            <p className="text-[10px] font-medium tracking-wide text-white/35">{t.subtitle}</p>
          </div>
        </div>

        {/* Messages Container */}
        <div
          aria-live="polite"
          className="flex-1 overflow-y-auto px-6 pt-6 pb-6 flex flex-col gap-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
        >
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.loading ? (
                <ThinkingIndicator />
              ) : (
                <MessageBubble msg={msg} />
              )}

              {msg.movies && msg.movies.length > 0 && (
                <div className="flex flex-col gap-3.5 mt-4 pl-11">
                  {msg.movies.map((movie) => (
                    <MovieCard key={`${movie.tmdb_id}:${movie.type}`} movie={movie} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Suggested prompts */}
          {messages.length <= 1 && !isLoading && (
            <div className="flex flex-wrap gap-2.5 pl-11">
              {t.prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white/50 hover:bg-red-600/10 hover:text-white/90 hover:border-red-600/30 transition-all cursor-pointer focus-visible:outline-red-600 max-w-[200px] truncate"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Premium unlock — Inline (after free limit hit) */}
          {isPremium === false && userMessageCount >= FREE_MESSAGE_LIMIT && (
            <div className="mt-2">
              <PremiumUnlock
                lang={lang}
                onUpgrade={() => { track("curator_premium_gate", { action: "cta_click" }); setShowPremium(true); }}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 pt-3 bg-gradient-to-t from-black/40 to-transparent" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-4 bg-white/[0.03] rounded-2xl px-5 py-4 transition-all focus-within:border-red-600/40 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_30px_rgba(229,9,20,0.15)]" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/20 font-inherit"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                input.trim() && !isLoading
                  ? "bg-red-600 hover:bg-red-500 shadow-lg cursor-pointer scale-100 active:scale-95"
                  : "bg-white/5 cursor-default scale-100"
              }`}
            >
              <SendIcon size={16} color={input.trim() && !isLoading ? "#fff" : "rgba(255,255,255,0.2)"} />
            </button>
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="curator" />

      <style>{`
        @keyframes curator-breathe {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        input:focus-visible {
          outline: none !important;
        }
      `}</style>
    </div>
  );
}

/* ── MovieCard ───────────────────────────────────────── */

function MovieCard({ movie, lang }: { movie: CuratorMovie; lang: Locale }) {
  const imgSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null;
  const flatrate = movie.providers.filter((p) => p.type === "flatrate");
  const rentBuy = movie.providers.filter((p) => p.type === "rent" || p.type === "buy");

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all group">
      {imgSrc && (
        <div className="w-[85px] h-[125px] rounded-xl overflow-hidden flex-shrink-0 relative shadow-2xl group-hover:scale-[1.02] transition-transform">
          <Image src={imgSrc} alt={movie.title} fill sizes="85px" style={{ objectFit: "cover" }} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-white/90">{movie.title}</span>
          {movie.year && <span className="text-xs text-white/30 font-medium">({movie.year})</span>}
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50 border border-white/5">
            {movie.type === "tv" ? "Serie" : "Film"}
          </span>
        </div>
        {movie.vote_average > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-yellow-500">★</span>
            <span className="text-xs font-semibold text-white/40">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
        {movie.overview && (
          <p className="text-[13px] leading-relaxed text-white/45 m-0 line-clamp-2 italic">
            "{movie.overview}"
          </p>
        )}
        {(flatrate.length > 0 || rentBuy.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-1.5">
            {flatrate.map((p) => <ProviderBadge key={p.name} provider={p} highlight />)}
            {rentBuy.map((p) => <ProviderBadge key={p.name} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ProviderBadge ───────────────────────────────────── */

function ProviderBadge({ provider, highlight }: { provider: WatchProvider; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-lg ${
      highlight ? "bg-red-600/10 border border-red-600/20" : "bg-white/5 border border-white/[0.06]"
    }`}>
      {provider.logo && (
        <Image src={provider.logo} alt={provider.name} width={18} height={18} className="rounded-md shadow-sm" />
      )}
      <span className={`text-[10px] font-bold tracking-tight ${highlight ? "text-white/80" : "text-white/30"}`}>
        {provider.name}
      </span>
    </div>
  );
}