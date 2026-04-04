"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PremiumModal from "@/components/PremiumModal";
import StreamingModal from "@/components/StreamingModal";
import { track } from "@/lib/posthog";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/hooks/useLocale";

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
  reason: string;
  rottenTomatoes?: string;
  metacritic?: string;
  awards?: string;
}

const moreLikeTexts: Record<string, (title: string) => string> = {
  no: (t) => `Vis meg mer som ${t} — samme stemning og tema`,
  en: (t) => `Show me more like ${t} — same mood and theme`,
  dk: (t) => `Vis mig mere som ${t} — samme stemning og tema`,
  se: (t) => `Visa mig mer som ${t} — samma stämning och tema`,
  fi: (t) => `Näytä minulle lisää kuten ${t} — sama tunnelma ja teema`,
};

const moreLikeLabels: Record<string, string> = {
  no: "Mer som denne →",
  en: "More like this →",
  dk: "Mere som denne →",
  se: "Mer som denna →",
  fi: "Lisää tällaisia →",
};

interface Message {
  role: "bot" | "user";
  text: string;
  movies?: CuratorMovie[];
  loading?: boolean;
}

/* ── i18n ──────────────────────────────────────────── */

/* locale now comes from useLocale() hook */

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
    premiumTitle: "Curator stenger snart",
    premiumPerks: ["Du mister dypere emosjonell matching", "Du mister smaksbaserte anbefalinger", "Du mister tilgang til skjulte rariteter"],
    premiumBody: "Du har brukt opp dine gratis meldinger. Uten Premium mister du Curator helt.",
    premiumCta: "Behold Curator — 29 kr/mnd →",
    counterUsed: (n: number) => `${n} av 5 gratis meldinger brukt`,
    counterWarning: (n: number) => `Bare ${n} meldinger igjen — så mister du tilgang`,
    counterLast: "Siste gratis melding!",
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
    premiumTitle: "Curator is closing soon",
    premiumPerks: ["You'll lose deeper emotional matching", "You'll lose taste-based recommendations", "You'll lose access to hidden rarities"],
    premiumBody: "You've used your free messages. Without Premium you'll lose Curator entirely.",
    premiumCta: "Keep Curator — 29 NOK/mo →",
    counterUsed: (n: number) => `${n} of 5 free messages used`,
    counterWarning: (n: number) => `Only ${n} left — then you lose access`,
    counterLast: "Last free message!",
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
    premiumTitle: "Curator lukker snart",
    premiumPerks: ["Du mister dybere følelsesmæssig matching", "Du mister smagsbaserede anbefalinger", "Du mister adgang til skjulte rariteter"],
    premiumBody: "Du har brugt dine gratis beskeder. Uden Premium mister du Curator helt.",
    premiumCta: "Behold Curator — 29 NOK/md →",
    counterUsed: (n: number) => `${n} af 5 gratis beskeder brugt`,
    counterWarning: (n: number) => `Kun ${n} beskeder tilbage — så mister du adgang`,
    counterLast: "Sidste gratis besked!",
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
    premiumTitle: "Curator stänger snart",
    premiumPerks: ["Du förlorar djupare emotionell matchning", "Du förlorar smakbaserade rekommendationer", "Du förlorar tillgång till dolda rariteter"],
    premiumBody: "Du har använt dina gratismeddelanden. Utan Premium förlorar du Curator helt.",
    premiumCta: "Behåll Curator — 29 NOK/mån →",
    counterUsed: (n: number) => `${n} av 5 gratismeddelanden använda`,
    counterWarning: (n: number) => `Bara ${n} kvar — sen förlorar du tillgång`,
    counterLast: "Sista gratismeddelandet!",
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
    premiumTitle: "Curator sulkeutuu pian",
    premiumPerks: ["Menetät syvemmän tunnepohjaisen matchauksen", "Menetät makuun perustuvat suositukset", "Menetät pääsyn piilotettuihin harvinaisuuksiin"],
    premiumBody: "Ilmaiset viestisi on käytetty. Ilman Premiumia menetät Curatorin kokonaan.",
    premiumCta: "Säilytä Curator — 29 NOK/kk →",
    counterUsed: (n: number) => `${n} / 5 ilmaista viestiä käytetty`,
    counterWarning: (n: number) => `Vain ${n} jäljellä — sitten menetät pääsyn`,
    counterLast: "Viimeinen ilmainen viesti!",
  },
} as const;

/* ── Follow-up prompts (shown after each Curator response) ── */

const followUpPrompts: Record<string, string[]> = {
  no: [
    "Noe lignende men lysere",
    "Vis meg serier i stedet",
    "Noe kortere å se i kveld",
    "Finn noe for oss begge",
    "Noe eldre — en klassiker",
    "Mer action, mindre drama",
  ],
  en: [
    "Something similar but lighter",
    "Show me series instead",
    "Something shorter for tonight",
    "Find something for both of us",
    "Something older — a classic",
    "More action, less drama",
  ],
  se: [
    "Något liknande men lättare",
    "Visa mig serier istället",
    "Något kortare för ikväll",
    "Hitta något för oss båda",
    "Något äldre — en klassiker",
    "Mer action, mindre drama",
  ],
  dk: [
    "Noget lignende men lettere",
    "Vis mig serier i stedet",
    "Noget kortere til i aften",
    "Find noget til os begge",
    "Noget ældre — en klassiker",
    "Mere action, mindre drama",
  ],
  fi: [
    "Jotain samankaltaista mutta kevyempää",
    "Näytä sarjoja sen sijaan",
    "Jotain lyhyempää tänä iltana",
    "Löydä jotain meille molemmille",
    "Jotain vanhempaa — klassikko",
    "Enemmän toimintaa, vähemmän draamaa",
  ],
};

/** Pick 3 random follow-up prompts for the current language */
function pickFollowUps(locale: string): string[] {
  const pool = followUpPrompts[locale] ?? followUpPrompts.en;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

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
  const lang = useLocale() as Locale;
  const [username, setUsername] = useState<string | null>(null);
  const [profileTitleCount, setProfileTitleCount] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{ tmdb_id: number; type: "movie" | "tv"; title: string; poster_path: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);
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
          if (d.profile.title_count != null) setProfileTitleCount(d.profile.title_count);
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
    setFollowUps([]);
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

      if (res.status === 403) {
        setIsPremium(false);
        setShowPremium(true);
        setMessages((prev) => prev.filter((m) => !m.loading));
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(data.error || "Error");
      }

      // Stream reading: message text comes first, then [CARDS]json
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let accumulated = "";
      let messageShown = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Check for [CARDS] delimiter (and optional [PILLS] after it)
        const cardsIdx = accumulated.indexOf("\n[CARDS]");
        if (cardsIdx !== -1) {
          const msgText = accumulated.slice(0, cardsIdx);
          const afterCards = accumulated.slice(cardsIdx + 8); // skip "\n[CARDS]"
          const pillsIdx = afterCards.indexOf("\n[PILLS]");
          const cardsJson = pillsIdx !== -1 ? afterCards.slice(0, pillsIdx) : afterCards;
          let movies: CuratorMovie[] = [];
          try { movies = JSON.parse(cardsJson); } catch { /* ignore parse error */ }
          // Parse dynamic pills from server
          let serverPills: string[] = [];
          if (pillsIdx !== -1) {
            try { serverPills = JSON.parse(afterCards.slice(pillsIdx + 8)); } catch { /* ignore */ }
          }
          setMessages((prev) => {
            const without = prev.filter((m) => !m.loading);
            return [...without, { role: "bot" as const, text: msgText || t.error, movies }];
          });
          setFollowUps(serverPills.length > 0 ? serverPills : pickFollowUps(lang));
          messageShown = true;
          break;
        }

        // Check for [ERROR] delimiter
        const errIdx = accumulated.indexOf("\n[ERROR]");
        if (errIdx !== -1) {
          throw new Error(accumulated.slice(errIdx + 8) || "Error");
        }

        // Show message text progressively (before cards arrive)
        if (!messageShown && accumulated.length > 0) {
          setMessages((prev) => {
            const without = prev.filter((m) => !m.loading);
            const existing = without[without.length - 1];
            if (existing?.role === "bot" && !existing.movies) {
              // Update existing streaming message
              return [...without.slice(0, -1), { role: "bot" as const, text: accumulated }];
            }
            return [...without, { role: "bot" as const, text: accumulated }];
          });
        }
      }

      // If stream ended without [CARDS] (e.g. no searches), finalize
      if (!messageShown) {
        const cardsIdx = accumulated.indexOf("\n[CARDS]");
        const msgText = cardsIdx !== -1 ? accumulated.slice(0, cardsIdx) : accumulated;
        let movies: CuratorMovie[] = [];
        let serverPills: string[] = [];
        if (cardsIdx !== -1) {
          const afterCards = accumulated.slice(cardsIdx + 8);
          const pillsIdx = afterCards.indexOf("\n[PILLS]");
          const cardsJson = pillsIdx !== -1 ? afterCards.slice(0, pillsIdx) : afterCards;
          try { movies = JSON.parse(cardsJson); } catch { /* ignore */ }
          if (pillsIdx !== -1) {
            try { serverPills = JSON.parse(afterCards.slice(pillsIdx + 8)); } catch { /* ignore */ }
          }
        }
        setMessages((prev) => {
          const without = prev.filter((m) => !m.loading);
          const lastBot = without[without.length - 1];
          const base = lastBot?.role === "bot" && !lastBot.movies ? without.slice(0, -1) : without;
          return [...base, { role: "bot" as const, text: msgText || t.error, movies }];
        });
        setFollowUps(serverPills.length > 0 ? serverPills : pickFollowUps(lang));
      }
    } catch (e) {
      const isTimeout = e instanceof DOMException && (e.name === "AbortError" || e.name === "TimeoutError");
      const errorText = isTimeout
        ? (lang === "no" ? "Forespørselen tok for lang tid. Prøv igjen." : "The request timed out. Please try again.")
        : t.error;
      setMessages((prev) => {
        const without = prev.filter((m) => !m.loading);
        // Remove partial streaming message if present
        const lastBot = without[without.length - 1];
        const base = lastBot?.role === "bot" && !lastBot.movies ? without.slice(0, -1) : without;
        return [...base, { role: "bot" as const, text: errorText }];
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
                    <MovieCard key={`${movie.tmdb_id}:${movie.type}`} movie={movie} locale={lang} onMoreLike={(title) => send((moreLikeTexts[lang] ?? moreLikeTexts.en)(title))} onClick={() => setSelectedMovie({ tmdb_id: movie.tmdb_id, type: movie.type, title: movie.title, poster_path: movie.poster_path })} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Follow-up prompt pills — after last bot response */}
          {followUps.length > 0 && !isLoading && !input.trim() && messages.length > 1 && (
            <div className="flex flex-wrap gap-2 pl-11">
              {followUps.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setFollowUps([]); send(p); }}
                  className="rounded-full px-3.5 py-1.5 text-[11px] text-white/50 hover:text-white/90 hover:border-red-600/30 hover:bg-red-600/10 transition-all cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

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

          {/* Taste evolution link */}
          {profileTitleCount !== null && profileTitleCount >= 10 && messages.length > 1 && !isLoading && (
            <div className="pl-11 mt-1">
              <Link
                href="/taste-evolution"
                className="text-[11px] transition-colors hover:text-[#ff2a2a]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {lang === "no" ? "Nysgjerrig på hvordan smaken din har endret seg? Se smaksreisen din →" : lang === "dk" ? "Nysgerrig på hvordan din smag har ændret sig? Se din smagsrejse →" : lang === "se" ? "Nyfiken på hur din smak har förändrats? Se din smakresa →" : lang === "fi" ? "Utelias miten makusi on muuttunut? Katso makumatkasi →" : "Curious how your taste has changed? See your taste journey →"}
              </Link>
            </div>
          )}

          {/* Premium unlock — Inline (after free limit hit) + last response smakebit */}
          {isPremium === false && userMessageCount >= FREE_MESSAGE_LIMIT && (
            <div className="mt-2">
              {/* Show last bot response as a "taste" of what premium gives */}
              {(() => {
                const lastBot = [...messages].reverse().find((m) => m.role === "bot" && !m.loading);
                if (!lastBot) return null;
                return (
                  <div
                    className="rounded-xl mb-3 px-4 py-3"
                    style={{ background: "rgba(245,200,66,0.06)", border: "0.5px solid rgba(245,200,66,0.15)" }}
                  >
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>
                      {lang === "no" ? "Siste smakebit fra Curator:" : lang === "se" ? "Sista smakbit från Curator:" : lang === "dk" ? "Sidste smagsprøve fra Curator:" : "Last taste from Curator:"}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "0 0 10px", lineHeight: 1.5 }} className="line-clamp-3">
                      {lastBot.text}
                    </p>
                    <button
                      onClick={() => { track("curator_premium_gate", { action: "smakebit_cta" }); setShowPremium(true); }}
                      style={{ fontSize: 12, fontWeight: 700, color: "#F5C842", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {lang === "no" ? "Behold Curator →" : lang === "se" ? "Behåll Curator →" : lang === "dk" ? "Behold Curator →" : lang === "fi" ? "Säilytä Curator →" : "Keep Curator →"}
                    </button>
                  </div>
                );
              })()}
              <PremiumUnlock
                lang={lang}
                onUpgrade={() => { track("curator_premium_gate", { action: "cta_click" }); setShowPremium(true); }}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Message counter + upgrade banner */}
        {isPremium === false && userMessageCount > 0 && userMessageCount < FREE_MESSAGE_LIMIT && (
          <div className="px-6 pb-1">
            <div
              className="rounded-xl px-4 py-2.5"
              style={{ background: userMessageCount >= 3 ? "rgba(245,200,66,0.08)" : "rgba(255,255,255,0.03)", border: userMessageCount >= 3 ? "0.5px solid rgba(245,200,66,0.2)" : "0.5px solid rgba(255,255,255,0.06)" }}
            >
              {/* Progress bar */}
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${(userMessageCount / FREE_MESSAGE_LIMIT) * 100}%`, background: userMessageCount >= 4 ? "#ef4444" : userMessageCount >= 3 ? "#F5C842" : "rgba(255,255,255,0.25)", transition: "width 0.3s ease" }} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p style={{ fontSize: 11, fontWeight: 500, color: userMessageCount >= 3 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", margin: 0 }}>
                  {userMessageCount >= 4 ? t.counterLast : userMessageCount >= 3 ? t.counterWarning(FREE_MESSAGE_LIMIT - userMessageCount) : t.counterUsed(userMessageCount)}
                </p>
                {userMessageCount >= 3 && (
                  <button
                    onClick={() => setShowPremium(true)}
                    style={{ fontSize: 11, fontWeight: 700, color: "#F5C842", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {lang === "no" ? "Behold tilgang →" : lang === "se" ? "Behåll tillgång →" : lang === "dk" ? "Behold adgang →" : lang === "fi" ? "Säilytä pääsy →" : "Keep access →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} source="curator" userName={username} titleCount={profileTitleCount} />

      {selectedMovie && (
        <StreamingModal
          tmdbId={selectedMovie.tmdb_id}
          type={selectedMovie.type}
          title={selectedMovie.title}
          posterPath={selectedMovie.poster_path}
          onClose={() => setSelectedMovie(null)}
        />
      )}

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

function MovieCard({ movie, onClick, onMoreLike, locale }: { movie: CuratorMovie; onClick?: () => void; onMoreLike?: (title: string) => void; locale?: string }) {
  const [fb, setFb] = useState<"liked" | "disliked" | null>(null);
  const imgSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null;
  const flatrate = movie.providers.filter((p) => p.type === "flatrate");
  const rentBuy = movie.providers.filter((p) => p.type === "rent" || p.type === "buy");

  function sendFeedback(feedback: "liked" | "disliked") {
    if (fb) return;
    setFb(feedback);
    fetch("/api/curator/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdb_id: movie.tmdb_id, type: movie.type, feedback }),
    }).catch(() => {});
    track("curator_feedback", { tmdb_id: movie.tmdb_id, title: movie.title, feedback });
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all group">
      <div onClick={onClick} className="flex gap-4 p-4 cursor-pointer">
        {imgSrc && (
          <div className="w-[85px] h-[125px] rounded-xl overflow-hidden flex-shrink-0 relative shadow-2xl group-hover:scale-[1.02] transition-transform">
            <Image src={imgSrc} alt={movie.title} fill sizes="85px" style={{ objectFit: "cover" }} />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white/90">{movie.title}</span>
            {movie.vote_average > 0 && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                ★ <span className="text-white/40 font-semibold">{movie.vote_average.toFixed(1)}</span>
              </span>
            )}
          </div>
          {movie.reason && (
            <p className="text-sm leading-relaxed text-white/60 m-0 italic">
              {movie.reason}
            </p>
          )}
          {(flatrate.length > 0 || rentBuy.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {flatrate.map((p) => <ProviderBadge key={p.name} provider={p} highlight />)}
              {rentBuy.map((p) => <ProviderBadge key={p.name} provider={p} />)}
            </div>
          )}
        </div>
      </div>
      {/* OMDB ratings + awards */}
      {(movie.rottenTomatoes || movie.metacritic || movie.awards) && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2 -mt-1">
          {movie.rottenTomatoes && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)" }}>🍅 {movie.rottenTomatoes}</span>
          )}
          {movie.metacritic && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(100,200,100,0.1)", color: "rgba(130,220,130,0.9)" }}>MC {movie.metacritic}</span>
          )}
          {movie.awards && (
            <span className="text-[10px] text-white/30 truncate max-w-[200px]">🏆 {movie.awards}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1 px-4 pb-3 -mt-1">
        {fb ? (
          <span className="text-xs" style={{ color: fb === "liked" ? "rgba(52,211,153,0.8)" : "rgba(248,113,113,0.8)" }}>
            {fb === "liked" ? "✓ Likte" : "✗ Ikke for meg"}
          </span>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); sendFeedback("liked"); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
            >
              👍
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); sendFeedback("disliked"); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
            >
              👎
            </button>
          </>
        )}
        {onMoreLike && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoreLike(movie.title); }}
            className="ml-auto text-[10px] font-medium transition-all hover:text-[#ff2a2a]"
            style={{ color: "rgba(255,255,255,0.3)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
          >
            {(locale && moreLikeLabels[locale]) || moreLikeLabels.en}
          </button>
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