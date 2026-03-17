"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import GlowButton from "@/components/GlowButton";
import StreamingModal from "@/components/StreamingModal";
import Link from "next/link";
import type { MediaType } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

const DATE_LOCALE: Record<Locale, string> = { no: "nb-NO", en: "en-US", dk: "da-DK", se: "sv-SE", fi: "fi-FI" };

const strings: Record<Locale, {
  loading: string; title: string; subtitle: string; emptyTitle: string;
  emptyDesc: string; goToSettings: string; unknown: string; unknownTitle: string;
  liked: string; disliked: string; saw: string; addedToList: string; watching: string;
  justNow: string; mAgo: string; hAgo: string; dAgo: string;
}> = {
  no: { loading: "Laster aktivitet...", title: "Venneaktivitet", subtitle: "Se hva vennene dine ser og liker.", emptyTitle: "Ingen aktivitet ennå", emptyDesc: "Koble deg til venner for å se hva de ser på. Del koblingskoden din fra innstillinger.", goToSettings: "Gå til innstillinger", unknown: "Ukjent", unknownTitle: "Ukjent tittel", liked: "likte", disliked: "likte ikke", saw: "så", addedToList: "la til i se-listen", watching: "følger med på", justNow: "akkurat nå", mAgo: "m siden", hAgo: "t siden", dAgo: "d siden" },
  en: { loading: "Loading activity...", title: "Friend activity", subtitle: "See what your friends are watching and liking.", emptyTitle: "No activity yet", emptyDesc: "Connect with friends to see what they watch. Share your connect code from settings.", goToSettings: "Go to settings", unknown: "Unknown", unknownTitle: "Unknown title", liked: "liked", disliked: "disliked", saw: "watched", addedToList: "added to watchlist", watching: "watching", justNow: "just now", mAgo: "m ago", hAgo: "h ago", dAgo: "d ago" },
  dk: { loading: "Indlæser aktivitet...", title: "Venneaktivitet", subtitle: "Se hvad dine venner ser og kan lide.", emptyTitle: "Ingen aktivitet endnu", emptyDesc: "Forbind dig med venner for at se hvad de ser. Del din forbindelseskode fra indstillinger.", goToSettings: "Gå til indstillinger", unknown: "Ukendt", unknownTitle: "Ukendt titel", liked: "kunne lide", disliked: "kunne ikke lide", saw: "så", addedToList: "tilføjede til se-listen", watching: "følger med på", justNow: "lige nu", mAgo: "m siden", hAgo: "t siden", dAgo: "d siden" },
  se: { loading: "Laddar aktivitet...", title: "Vänaktivitet", subtitle: "Se vad dina vänner tittar på och gillar.", emptyTitle: "Ingen aktivitet ännu", emptyDesc: "Anslut till vänner för att se vad de tittar på. Dela din anslutningskod från inställningar.", goToSettings: "Gå till inställningar", unknown: "Okänd", unknownTitle: "Okänd titel", liked: "gillade", disliked: "ogillade", saw: "såg", addedToList: "lade till i att se-listan", watching: "tittar på", justNow: "just nu", mAgo: "m sedan", hAgo: "t sedan", dAgo: "d sedan" },
  fi: { loading: "Ladataan toimintaa...", title: "Ystävien toiminta", subtitle: "Katso mitä ystäväsi katsovat ja pitävät.", emptyTitle: "Ei toimintaa vielä", emptyDesc: "Yhdistä ystäviin nähdäksesi mitä he katsovat. Jaa yhdistämiskoodisi asetuksista.", goToSettings: "Siirry asetuksiin", unknown: "Tuntematon", unknownTitle: "Tuntematon nimike", liked: "piti", disliked: "ei pitänyt", saw: "katsoi", addedToList: "lisäsi katselulistalle", watching: "seuraa", justNow: "juuri nyt", mAgo: "m sitten", hAgo: "t sitten", dAgo: "pv sitten" },
};

interface Activity {
  user_name: string;
  user_id: string;
  action: string;
  sentiment: string | null;
  favorite: boolean | null;
  tmdb_id: number;
  type: MediaType;
  title: string | null;
  poster_path: string | null;
  year: number | null;
  updated_at: string;
}

function actionLabel(action: string, sentiment: string | null, s: typeof strings["no"]): string {
  if (action === "watched") {
    if (sentiment === "liked") return s.liked;
    if (sentiment === "disliked") return s.disliked;
    return s.saw;
  }
  if (action === "watchlist") return s.addedToList;
  if (action === "watching") return s.watching;
  return action;
}

function actionIcon(action: string, sentiment: string | null): string {
  if (action === "watched") {
    if (sentiment === "liked") return "👍";
    if (sentiment === "disliked") return "👎";
    return "✅";
  }
  if (action === "watchlist") return "📋";
  if (action === "watching") return "📺";
  return "🎬";
}

function timeAgo(dateStr: string, s: typeof strings["no"], dateLoc: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return s.justNow;
  if (minutes < 60) return `${minutes}${s.mAgo}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${s.hAgo}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}${s.dAgo}`;
  return new Date(dateStr).toLocaleDateString(dateLoc, { day: "numeric", month: "short" });
}

export default function ActivityPage() {
  const locale = useLocale();
  const s = strings[locale] ?? strings.en;
  const dateLoc = DATE_LOCALE[locale];
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTitle, setModalTitle] = useState<{ tmdb_id: number; type: MediaType; title: string; poster_path: string | null } | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isFoundingMember, setIsFoundingMember] = useState(false);

  useEffect(() => {
    fetch("/api/activity/friends")
      .then((r) => r.json())
      .then((d) => setActivities(d.activities || []))
      .finally(() => setLoading(false));
    // Fetch own profile for founding member badge
    import("@/lib/supabase-browser").then(({ createSupabaseBrowser }) => {
      const sb = createSupabaseBrowser();
      sb.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setMyUserId(user.id);
          sb.from("profiles").select("founding_member").eq("id", user.id).single()
            .then(({ data }) => setIsFoundingMember(!!data?.founding_member));
        }
      });
    });
  }, []);

  if (loading) return <LoadingSpinner text={s.loading} />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{s.title}</h2>
        <p className="text-sm text-[var(--text-tertiary)]">{s.subtitle}</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title={s.emptyTitle}
          description={s.emptyDesc}
          action={
            <Link href="/settings">
              <GlowButton>{s.goToSettings}</GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => (
            <button
              key={`${a.tmdb_id}-${a.type}-${a.user_id}-${i}`}
              onClick={() => setModalTitle({ tmdb_id: a.tmdb_id, type: a.type, title: a.title || s.unknown, poster_path: a.poster_path })}
              className="w-full glass rounded-[var(--radius-lg)] p-4 flex items-center gap-4 text-left hover:border-[var(--glass-hover)] transition-colors btn-press"
            >
              {/* Poster */}
              <div className="w-12 h-[72px] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-surface)] flex-shrink-0">
                {a.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${a.poster_path}`}
                    alt={a.title || ""}
                    width={48}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-lg">🎬</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {a.user_name}{isFoundingMember && a.user_id === myUserId && <span style={{ color: "rgba(229,9,20,0.7)", marginLeft: 3, fontSize: 10 }}>⭐</span>}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {actionLabel(a.action, a.sentiment, s)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">
                  {a.title || s.unknownTitle}
                  {a.year ? ` (${a.year})` : ""}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                  {timeAgo(a.updated_at, s, dateLoc)}
                </p>
              </div>

              {/* Action emoji */}
              <span className="text-lg flex-shrink-0">{actionIcon(a.action, a.sentiment)}</span>
            </button>
          ))}
        </div>
      )}

      {modalTitle && (
        <StreamingModal
          tmdbId={modalTitle.tmdb_id}
          type={modalTitle.type}
          title={modalTitle.title}
          posterPath={modalTitle.poster_path}
          onClose={() => setModalTitle(null)}
        />
      )}
    </div>
  );
}
