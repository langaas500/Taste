"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

const s = {
  no: {
    back: "Tilbake",
    title: "Personvern – Logflix",
    updated: "Sist oppdatert: 20. april 2026",
    intro: "Logflix er laget for filmelskere som vil ha bedre oversikt og smartere anbefalinger. Vi samler inn så lite data som mulig, og bruker kun informasjon som er nødvendig for at tjenesten skal fungere.",
    s1t: "1. Konto og innlogging",
    s1p1: "Logflix bruker Supabase Auth for autentisering. Du kan logge inn med e-post og passord, eller via Google eller Apple (OAuth).",
    s1p2: "Ved opprettelse av konto lagrer vi:",
    s1list: ["E-postadresse", "Kryptert passord (bcrypt-hashet av Supabase)", "Visningsnavn (fra OAuth-leverandør eller e-post)", "Tidspunkt og versjon for godkjenning av brukervilkår"],
    s1p3: "Innlogging håndteres via sikre HTTP-only session-cookies satt av Supabase. Vi bruker ingen andre tracking-cookies.",
    s2t: "2. Data lagret i kontoen din",
    s2p1: "For at Logflix skal fungere lagres følgende i vår database (Supabase PostgreSQL med Row Level Security):",
    s2list: ["Profil: visningsnavn, språk, foretrukne strømmetjenester, innholdsfiltre (ekskluderte sjangre og språk)", "Seerhistorikk: titler du har sett eller vurdert, med vurdering, notater og dato", "Ekskluderinger: titler du har fjernet fra anbefalinger", "Tilbakemeldinger på anbefalinger (liker / ikke for meg)", "Egne lister og innholdet i dem", "Kontokoblinger: forbindelser til andre brukere (krever samtykke fra begge parter, gir tilgang til delte lister)", "Smaksanalyse: generert av AI basert på dine titler (ingen personopplysninger sendes til AI)", "Trakt.tv OAuth-token (kun dersom du aktivt kobler til Trakt, lagres kun på server)"],
    s2p2: "Vi bruker Row Level Security (RLS) slik at kun du har tilgang til dine egne data. Ingen andre brukere kan se dine titler, lister eller preferanser med mindre du eksplisitt deler via kontokoblinger.",
    s3t: "3. Se Sammen og gruppeøkter",
    s3h1: "Se Sammen (2 personer)",
    s3p1: "Når du bruker Se Sammen lagres følgende på serveren:",
    s3list1: ["Titteldekk (60 titler fra TMDB)", "Sveipebeslutninger (liker / nei / meh / superliker)", "Eventuelt matchresultat"],
    s3p2: "All sesjonsdata slettes automatisk etter 24 timer. Se Sammen kan brukes uten innlogging. Gjester identifiseres med en tilfeldig UUID generert i nettleseren.",
    s3h2: "Gruppeøkter (3+ personer)",
    s3p3: "Gruppeøkter lagrer:",
    s3list2: ["Tittelpool, stemmer og finalister", "Deltakernavn og strømmetjenester"],
    s3p4: "All data for gruppeøkter slettes automatisk etter 4 timer. Gruppeøkter krever innlogging for alle deltakere.",
    s4t: "4. Gjestemodus",
    s4p1: "Logflix kan brukes uten konto. I gjestemodus:",
    s4list: ["All data lagres kun lokalt i nettleseren din (localStorage)", "Gjestehandlinger (opptil 100 titler med vurderinger) lagres på din enhet", "Se Sammen-gjester identifiseres med en tilfeldig UUID generert i nettleseren"],
    s4p2: "Hvis du senere oppretter en konto, migreres gjestehandlingene dine til kontoen din, og de lokale dataene slettes.",
    s4p3: "Ingen gjestedata lagres permanent på serveren. Sesjonsdata slettes automatisk som beskrevet i punkt 3.",
    s5t: "5. Lokal lagring på din enhet",
    s5p1: "Logflix bruker localStorage i nettleseren for å lagre:",
    s5list: ["Sesjonsstatus og gjenopptakingsdata for Se Sammen", "Gjestehandlinger og gjeste-UUID", "Visningsnavn for gruppeøkter", "Innholdspreferanser (film/serie/begge)", "Poster-cache og titteldekk-cache", "Innloggingspreferanser (husk meg)", "Ditt samtykkevalg for cookies (cookie_consent)"],
    s5p2: "Denne informasjonen lagres kun på din enhet og sendes ikke til tredjeparter. Du kan slette den ved å tømme nettleserens lagring.",
    s6t: "6. Tredjepartstjenester",
    s6p1: "Logflix bruker følgende eksterne tjenester:",
    s6h1: "TMDB (The Movie Database)",
    s6tmdb1: "Brukes for søk, tittelmetadata, plakatbilder og strømmetjenesteinformasjon.",
    s6tmdb2: "Kun søkestrenger, sjanger-/årstallfiltre og regionkode sendes. Ingen personopplysninger deles.",
    s6h2: "Anthropic Claude (AI)",
    s6ai1: "Brukes for smaksanalyse og anbefalingsforklaringer. Data som sendes:",
    s6aiList: ["Tittelnavn, sjanger, årstall og dine vurderinger"],
    s6ai2: "Vi sender ingen personidentifiserende informasjon (PII) til AI-leverandør. Ingen bruker-ID, e-postadresse eller navn inkluderes. OpenAI kan brukes som fallback med identisk dataminimering.",
    s6h3: "Trakt.tv (valgfritt)",
    s6trakt1: "Hvis du kobler til Trakt-kontoen din:",
    s6traktList: ["OAuth-token lagres på serveren for å importere seerhistorikk", "Du kan når som helst koble fra, og tokenet slettes", "Ingen personopplysninger sendes til Trakt utover autentisering"],
    s6h4: "Vercel (hosting)",
    s6vercel: "Logflix hostes på Vercel. Vi leser Vercels x-vercel-ip-country-header for å bestemme språk og strømmeregion. Denne verdien lagres ikke og brukes ikke til sporing.",
    s7t: "7. Hva vi ikke gjør",
    s7p1: "Logflix:",
    s7list: [
      "Bruker PostHog for anonym produktanalyse – kun dersom du har samtykket til analysecookies",
      "Har ingen annonser",
      "Selger ikke data",
      "Sender ingen markedsførings-e-post",
      "Samler ikke inn IP-adresser (PostHog er konfigurert med ip: false)",
      "Bruker ingen tracking cookies utover autentisering og samtykkebasert analyse",
      "Bruker ingen feilrapporteringstjenester (ingen Sentry, Datadog e.l.)",
    ],
    s7p2: "Kun autentiseringscookies fra Supabase brukes for innlogging.",
    sct: "8. Informasjonskapsler (cookies)",
    sc_intro: "Logflix bruker to kategorier informasjonskapsler og lokal lagring:",
    sch1: "Nødvendige – krever ikke samtykke",
    sclist1: [
      "sb-* (Supabase) – HTTP-only session-cookies for autentisering. Kreves for innlogging.",
      "cookie_consent – lagrer ditt samtykkevalg i localStorage.",
      "x-locale – lagrer språkvalg i localStorage.",
      "wt-guest-id – tilfeldig UUID for Se Sammen-gjester (localStorage).",
    ],
    sch2: "Analysecookies – krever samtykke",
    sclist2: [
      "PostHog (ph_*) – produktanalyse (sidevisninger, klikk, funksjonsbruk). Initialiseres kun dersom du godtar analysecookies i samtykkebanneret. IP-adresser samles ikke inn.",
    ],
    sc_p: "Første gang du besøker Logflix vises et samtykkebanner der du velger. Du kan endre valget ved å tømme nettleserens lokale lagring, f.eks. via nettleserinnstillinger → Fjern nettstedsdata.",
    s8t: "9. Dataeksport",
    s8p: "Du kan eksportere dine data som JSON via innebygd eksportfunksjon i Innstillinger.",
    s9t: "10. Sletting av konto",
    s9p1: "Du kan slette kontoen din direkte i appen via Innstillinger → Slett konto. Sletting er umiddelbar og permanent.",
    s9p2: "Du kan også sende e-post til oss for manuell sletting:",
    s9p3: "Ved sletting fjernes all data permanent, inkludert:",
    s9list: ["Profil og preferanser", "Seerhistorikk, vurderinger og notater", "Egne lister og innhold", "Tilbakemeldinger og ekskluderinger", "Kontokoblinger", "Trakt.tv-token"],
    s9p4: "Sesjonsdata (Se Sammen og gruppeøkter) slettes automatisk uavhengig av konto, som beskrevet i punkt 3.",
    s10t: "11. Barn",
    s10p: "Logflix er ikke rettet mot barn under 13 år. Vi samler ikke bevisst inn opplysninger fra barn.",
    s11t: "12. Endringer",
    s11p: "Vi kan oppdatere denne personvernerklæringen ved behov. Dato for siste oppdatering vises øverst på siden.",
  },
  en: {
    back: "Back",
    title: "Privacy Policy – Logflix",
    updated: "Last updated: April 20, 2026",
    intro: "Logflix is built for film lovers who want better tracking and smarter recommendations. We collect as little data as possible and only use information necessary for the service to function.",
    s1t: "1. Account and login",
    s1p1: "Logflix uses Supabase Auth for authentication. You can log in with email and password, or via Google or Apple (OAuth).",
    s1p2: "When you create an account, we store:",
    s1list: ["Email address", "Encrypted password (bcrypt-hashed by Supabase)", "Display name (from OAuth provider or email)", "Timestamp and version of terms acceptance"],
    s1p3: "Login is handled via secure HTTP-only session cookies set by Supabase. We use no other tracking cookies.",
    s2t: "2. Data stored in your account",
    s2p1: "For Logflix to work, the following is stored in our database (Supabase PostgreSQL with Row Level Security):",
    s2list: ["Profile: display name, language, preferred streaming services, content filters (excluded genres and languages)", "Watch history: titles you have watched or rated, with ratings, notes and date", "Exclusions: titles you have removed from recommendations", "Recommendation feedback (liked / not for me)", "Custom lists and their contents", "Account links: connections to other users (requires consent from both parties, grants access to shared lists)", "Taste analysis: generated by AI based on your titles (no personal information is sent to AI)", "Trakt.tv OAuth token (only if you actively connect Trakt, stored server-side only)"],
    s2p2: "We use Row Level Security (RLS) so that only you have access to your own data. No other users can see your titles, lists or preferences unless you explicitly share via account links.",
    s3t: "3. Watch Together and group sessions",
    s3h1: "Watch Together (2 people)",
    s3p1: "When you use Watch Together, the following is stored on the server:",
    s3list1: ["Title deck (60 titles from TMDB)", "Swipe decisions (like / no / meh / superlike)", "Match result if any"],
    s3p2: "All session data is automatically deleted after 24 hours. Watch Together can be used without logging in. Guests are identified with a random UUID generated in the browser.",
    s3h2: "Group sessions (3+ people)",
    s3p3: "Group sessions store:",
    s3list2: ["Title pool, votes and finalists", "Participant names and streaming services"],
    s3p4: "All group session data is automatically deleted after 4 hours. Group sessions require login for all participants.",
    s4t: "4. Guest mode",
    s4p1: "Logflix can be used without an account. In guest mode:",
    s4list: ["All data is stored locally in your browser (localStorage)", "Guest actions (up to 100 titles with ratings) are stored on your device", "Watch Together guests are identified with a random UUID generated in the browser"],
    s4p2: "If you later create an account, your guest actions are migrated to your account and the local data is deleted.",
    s4p3: "No guest data is permanently stored on the server. Session data is automatically deleted as described in section 3.",
    s5t: "5. Local storage on your device",
    s5p1: "Logflix uses localStorage in the browser to store:",
    s5list: ["Session status and resume data for Watch Together", "Guest actions and guest UUID", "Display name for group sessions", "Content preferences (movie/series/both)", "Poster cache and title deck cache", "Login preferences (remember me)", "Your cookie consent choice (cookie_consent)"],
    s5p2: "This information is stored only on your device and is not sent to third parties. You can delete it by clearing your browser storage.",
    s6t: "6. Third-party services",
    s6p1: "Logflix uses the following external services:",
    s6h1: "TMDB (The Movie Database)",
    s6tmdb1: "Used for search, title metadata, poster images and streaming service information.",
    s6tmdb2: "Only search strings, genre/year filters and region code are sent. No personal information is shared.",
    s6h2: "Anthropic Claude (AI)",
    s6ai1: "Used for taste analysis and recommendation explanations. Data sent:",
    s6aiList: ["Title names, genres, years and your ratings"],
    s6ai2: "We do not send any personally identifiable information (PII) to the AI provider. No user ID, email address or name is included. OpenAI may be used as a fallback with identical data minimization.",
    s6h3: "Trakt.tv (optional)",
    s6trakt1: "If you connect your Trakt account:",
    s6traktList: ["OAuth token is stored on the server to import watch history", "You can disconnect at any time and the token is deleted", "No personal information is sent to Trakt beyond authentication"],
    s6h4: "Vercel (hosting)",
    s6vercel: "Logflix is hosted on Vercel. We read Vercel's x-vercel-ip-country header to determine language and streaming region. This value is not stored and is not used for tracking.",
    s7t: "7. What we do not do",
    s7p1: "Logflix:",
    s7list: [
      "Uses PostHog for anonymous product analytics — only if you have consented to analytics cookies",
      "Has no ads",
      "Does not sell data",
      "Does not send marketing emails",
      "Does not collect IP addresses (PostHog is configured with ip: false)",
      "Uses no tracking cookies beyond authentication and consent-based analytics",
      "Uses no error reporting services (no Sentry, Datadog, etc.)",
    ],
    s7p2: "Only authentication cookies from Supabase are used for login.",
    sct: "8. Cookies",
    sc_intro: "Logflix uses two categories of cookies and local storage:",
    sch1: "Necessary — no consent required",
    sclist1: [
      "sb-* (Supabase) – HTTP-only session cookies for authentication. Required for login.",
      "cookie_consent – stores your consent choice in localStorage.",
      "x-locale – stores language preference in localStorage.",
      "wt-guest-id – random UUID for Watch Together guests (localStorage).",
    ],
    sch2: "Analytics cookies — consent required",
    sclist2: [
      "PostHog (ph_*) – product analytics (page views, clicks, feature usage). Initialized only if you accept analytics cookies in the consent banner. IP addresses are not collected.",
    ],
    sc_p: "The first time you visit Logflix, a consent banner is shown. You can change your choice by clearing your browser's local storage, e.g. via browser Settings → Clear site data.",
    s8t: "9. Data export",
    s8p: "You can export your data as JSON via the built-in export function in Settings.",
    s9t: "10. Account deletion",
    s9p1: "You can delete your account directly in the app via Settings → Delete account. Deletion is immediate and permanent.",
    s9p2: "You can also contact us by email for manual deletion:",
    s9p3: "Upon deletion, all data is permanently removed, including:",
    s9list: ["Profile and preferences", "Watch history, ratings and notes", "Custom lists and contents", "Feedback and exclusions", "Account links", "Trakt.tv token"],
    s9p4: "Session data (Watch Together and group sessions) is automatically deleted regardless of account, as described in section 3.",
    s10t: "11. Children",
    s10p: "Logflix is not intended for children under 13. We do not knowingly collect information from children.",
    s11t: "12. Changes",
    s11p: "We may update this privacy policy as needed. The date of the last update is shown at the top of the page.",
  },
};

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-0.5 mb-3">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function PrivacyPage() {
  const locale = useLocale();
  const t = locale === "no" ? s.no : s.en;

  return (
    <div className="min-h-dvh bg-[#0b0f1a] text-white/80">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.back}
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
        <p className="text-white/30 text-sm mb-8">{t.updated}</p>

        <p className="mb-8 text-[15px] leading-relaxed">{t.intro}</p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s1t}</h2>
            <p className="mb-2">{t.s1p1}</p>
            <p className="mb-1">{t.s1p2}</p>
            <List items={t.s1list} />
            <p>{t.s1p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s2t}</h2>
            <p className="mb-1">{t.s2p1}</p>
            <List items={t.s2list} />
            <p>{t.s2p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s3t}</h2>
            <h3 className="font-medium text-white/90 mb-1.5">{t.s3h1}</h3>
            <p className="mb-1">{t.s3p1}</p>
            <List items={t.s3list1} />
            <p className="mb-4">{t.s3p2}</p>
            <h3 className="font-medium text-white/90 mb-1.5">{t.s3h2}</h3>
            <p className="mb-1">{t.s3p3}</p>
            <List items={t.s3list2} />
            <p>{t.s3p4}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s4t}</h2>
            <p className="mb-1">{t.s4p1}</p>
            <List items={t.s4list} />
            <p className="mb-2">{t.s4p2}</p>
            <p>{t.s4p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s5t}</h2>
            <p className="mb-1">{t.s5p1}</p>
            <List items={t.s5list} />
            <p>{t.s5p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s6t}</h2>
            <p className="mb-3">{t.s6p1}</p>
            <h3 className="font-medium text-white/90 mb-1">{t.s6h1}</h3>
            <p className="mb-1">{t.s6tmdb1}</p>
            <p className="mb-4">{t.s6tmdb2}</p>
            <h3 className="font-medium text-white/90 mb-1">{t.s6h2}</h3>
            <p className="mb-1">{t.s6ai1}</p>
            <List items={t.s6aiList} />
            <p className="mb-4">{t.s6ai2}</p>
            <h3 className="font-medium text-white/90 mb-1">{t.s6h3}</h3>
            <p className="mb-1">{t.s6trakt1}</p>
            <List items={t.s6traktList} />
            <h3 className="font-medium text-white/90 mb-1">{t.s6h4}</h3>
            <p>{t.s6vercel}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">{t.s7t}</h2>
            <p className="mb-1">{t.s7p1}</p>
            <List items={t.s7list} />
            <p>{t.s7p2}</p>
          </section>

          <section id="cookies">
            <h2 className="text-lg font-semibold text-white mb-3">{t.sct}</h2>
            <p className="mb-3">{t.sc_intro}</p>
            <h3 className="font-medium text-white/90 mb-1">{t.sch1}</h3>
            <List items={t.sclist1} />
            <h3 className="font-medium text-white/90 mb-1">{t.sch2}</h3>
            <List items={t.sclist2} />
            <p>{t.sc_p}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s8t}</h2>
            <p>{t.s8p}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s9t}</h2>
            <p className="mb-2">{t.s9p1}</p>
            <p className="mb-2">{t.s9p2}{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>.
            </p>
            <p className="mb-1">{t.s9p3}</p>
            <List items={t.s9list} />
            <p>{t.s9p4}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s10t}</h2>
            <p>{t.s10p}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s11t}</h2>
            <p>{t.s11p}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
