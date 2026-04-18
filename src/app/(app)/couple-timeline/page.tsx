"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

/* ── i18n ─────────────────────────────────────────── */

const strings = {
  no: {
    title: "Par-minne",
    subtitle: "De siste 90 dagene sammen",
    loading: "Henter tidslinje...",
    noPartner: "Koble til en partner for å se tidslinjen",
    connect: "Koble til partner",
    empty: "Ingen aktivitet ennå. Start med å se noe sammen!",
    myWatch: "Du så",
    partnerWatch: "så",
    bothWatch: "Dere så begge",
    wtMatch: "Se Sammen-match",
    linkedSince: "Par siden",
    backToReport: "Se par-rapporten →",
    today: "I dag",
    yesterday: "I går",
  },
  en: {
    title: "Couple Memories",
    subtitle: "The last 90 days together",
    loading: "Loading timeline...",
    noPartner: "Link a partner to see the timeline",
    connect: "Connect partner",
    empty: "No activity yet. Start watching something together!",
    myWatch: "You watched",
    partnerWatch: "watched",
    bothWatch: "You both watched",
    wtMatch: "Watch Together match",
    linkedSince: "Couple since",
    backToReport: "See couple report →",
    today: "Today",
    yesterday: "Yesterday",
  },
  dk: {
    title: "Parminder",
    subtitle: "De seneste 90 dage sammen",
    loading: "Henter tidslinje...",
    noPartner: "Forbind en partner for at se tidslinjen",
    connect: "Forbind partner",
    empty: "Ingen aktivitet endnu. Begynd med at se noget sammen!",
    myWatch: "Du så",
    partnerWatch: "så",
    bothWatch: "I så begge",
    wtMatch: "Se Sammen-match",
    linkedSince: "Par siden",
    backToReport: "Se parrapporten →",
    today: "I dag",
    yesterday: "I går",
  },
  se: {
    title: "Parminnen",
    subtitle: "De senaste 90 dagarna tillsammans",
    loading: "Hämtar tidslinje...",
    noPartner: "Koppla ihop med en partner för att se tidslinjen",
    connect: "Koppla partner",
    empty: "Ingen aktivitet ännu. Börja se något tillsammans!",
    myWatch: "Du såg",
    partnerWatch: "såg",
    bothWatch: "Ni såg båda",
    wtMatch: "Se Tillsammans-match",
    linkedSince: "Par sedan",
    backToReport: "Se parrapporten →",
    today: "Idag",
    yesterday: "Igår",
  },
  fi: {
    title: "Parimuistot",
    subtitle: "Viimeiset 90 päivää yhdessä",
    loading: "Ladataan aikajanaa...",
    noPartner: "Yhdistä kumppani nähdäksesi aikajanan",
    connect: "Yhdistä kumppani",
    empty: "Ei vielä aktiviteettia. Aloita katsomalla jotain yhdessä!",
    myWatch: "Katsoit",
    partnerWatch: "katsoi",
    bothWatch: "Molemmat katsoitte",
    wtMatch: "Katsotaan yhdessä -osuma",
    linkedSince: "Pariskunta alkaen",
    backToReport: "Katso pariraportti →",
    today: "Tänään",
    yesterday: "Eilen",
  },
} as const;

/* ── Types ────────────────────────────────────────── */

interface TimelineEvent {
  date: string;
  type: "my_watch" | "partner_watch" | "both_watch" | "wt_match";
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  mySentiment?: string | null;
  myRating?: number | null;
  partnerSentiment?: string | null;
  partnerRating?: number | null;
}

interface TimelineGroup {
  date: string;
  events: TimelineEvent[];
}

interface TimelineData {
  myName: string | null;
  partnerName: string | null;
  isPremium?: boolean;
  linkedSince: string | null;
  timeline: TimelineGroup[];
}

/* ── Helpers ──────────────────────────────────────── */

function sentimentDot(sentiment: string | null | undefined): string {
  if (sentiment === "liked") return "#4ade80";
  if (sentiment === "disliked") return "#ef4444";
  if (sentiment === "neutral") return "#facc15";
  return "rgba(255,255,255,0.15)";
}

function formatDate(dateStr: string, s: { today: string; yesterday: string }): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return s.today;
  if (dateStr === yesterday) return s.yesterday;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/* ── Component ───────────────────────────────────── */

export default function CoupleTimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;

  useEffect(() => {
    fetch("/api/couple-timeline")
      .then((r) => r.json())
      .then((d) => {
        if (d.error === "No linked partner") setError("no_partner");
        else if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;

  if (error === "no_partner") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">💑</span>
        <p className="text-sm text-white/50 mb-4">{s.noPartner}</p>
        <Link href="/settings" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#E50914" }}>{s.connect}</Link>
      </div>
    );
  }

  if (!data || data.timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">🎬</span>
        <p className="text-sm text-white/50">{s.empty}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#E50914" }}>{s.title}</p>
        <h1 className="text-xl font-extrabold tracking-tight">
          {data.myName || "?"} & {data.partnerName || "?"}
        </h1>
        <p className="text-xs text-white/30 mt-1">{s.subtitle}</p>
        {data.linkedSince && (
          <p className="text-[10px] text-white/20 mt-1">{s.linkedSince} {new Date(data.linkedSince).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {data.timeline.map((group) => (
          <div key={group.date} className="mb-6">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3 -ml-6">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.3)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: "#E50914" }} />
              </div>
              <p className="text-xs font-bold text-white/50">{formatDate(group.date, s)}</p>
            </div>

            {/* Events for this date */}
            <div className="flex flex-col gap-2">
              {group.events.map((ev, i) => (
                <div
                  key={`${ev.tmdb_id}-${ev.type}-${i}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                  style={{
                    background: ev.type === "wt_match" ? "rgba(229,9,20,0.06)" : ev.type === "both_watch" ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
                    border: ev.type === "wt_match" ? "1px solid rgba(229,9,20,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Poster thumbnail */}
                  <div className="w-9 h-13 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.03]" style={{ aspectRatio: "2/3", width: 36 }}>
                    {ev.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w92${ev.poster_path}`} alt="" width={36} height={54} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">?</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{ev.title}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {ev.type === "wt_match" && (
                        <span style={{ color: "#E50914" }}>{s.wtMatch}</span>
                      )}
                      {ev.type === "both_watch" && s.bothWatch}
                      {ev.type === "my_watch" && s.myWatch}
                      {ev.type === "partner_watch" && `${data.partnerName || "Partner"} ${s.partnerWatch}`}
                    </p>
                  </div>

                  {/* Sentiment dots */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {(ev.type === "my_watch" || ev.type === "both_watch") && (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentimentDot(ev.mySentiment) }} />
                        {ev.myRating && <span className="text-[8px] text-white/30">{ev.myRating}</span>}
                      </div>
                    )}
                    {(ev.type === "partner_watch" || ev.type === "both_watch") && (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentimentDot(ev.partnerSentiment), border: "1px solid rgba(0,0,0,0.2)" }} />
                        {ev.partnerRating && <span className="text-[8px] text-white/30">{ev.partnerRating}</span>}
                      </div>
                    )}
                    {ev.type === "wt_match" && (
                      <span className="text-sm">🎬</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="flex justify-center gap-6 mt-6">
        <Link href="/couple-report" className="text-xs text-white/30 hover:text-white/50 transition-colors">{s.backToReport}</Link>
        <Link href="/couple-wrapped" className="text-xs text-white/30 hover:text-white/50 transition-colors">
          {locale === "no" ? "Par-Wrapped →" : locale === "se" ? "Par-Wrapped →" : locale === "dk" ? "Par-Wrapped →" : locale === "fi" ? "Pari-Wrapped →" : "Couple Wrapped →"}
        </Link>
      </div>
    </div>
  );
}
