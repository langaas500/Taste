import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personvern (Privacy Policy) | Logflix",
  description:
    "Les hvordan Logflix håndterer persondata, informasjonskapsler og dine rettigheter som bruker.",
  alternates: {
    canonical: "https://logflix.app/privacy",
  },
};

export default function PrivacyPage() {
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
          Tilbake
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">Personvern &ndash; Logflix</h1>
        <p className="text-white/30 text-sm mb-8">Sist oppdatert: 1. mars 2026</p>

        <p className="mb-8 text-[15px] leading-relaxed">
          Logflix er laget for filmelskere som vil ha bedre oversikt og smartere anbefalinger.
          Vi samler inn så lite data som mulig, og bruker kun informasjon som er nødvendig for at tjenesten skal fungere.
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Konto og innlogging</h2>

            <p className="mb-2">
              Logflix bruker Supabase Auth for autentisering. Du kan logge inn med e-post og passord,
              eller via Google eller Apple (OAuth).
            </p>
            <p className="mb-1">Ved opprettelse av konto lagrer vi:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>E-postadresse</li>
              <li>Kryptert passord (bcrypt-hashet av Supabase)</li>
              <li>Visningsnavn (fra OAuth-leverandør eller e-post)</li>
              <li>Tidspunkt og versjon for godkjenning av brukervilkår</li>
            </ul>
            <p className="mb-2">
              Innlogging håndteres via sikre HTTP-only session-cookies satt av Supabase.
              Vi bruker ingen andre cookies.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Data lagret i kontoen din</h2>

            <p className="mb-1">
              For at Logflix skal fungere lagres følgende i vår database (Supabase PostgreSQL med Row Level Security):
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Profil: visningsnavn, språk, foretrukne strømmetjenester, innholdsfiltre (ekskluderte sjangre og språk)</li>
              <li>Seerhistorikk: titler du har sett eller vurdert, med vurdering, notater og dato</li>
              <li>Ekskluderinger: titler du har fjernet fra anbefalinger</li>
              <li>Tilbakemeldinger på anbefalinger (liker / ikke for meg)</li>
              <li>Egne lister og innholdet i dem</li>
              <li>Kontokoblinger: forbindelser til andre brukere (krever samtykke fra begge parter, gir tilgang til delte lister)</li>
              <li>Smaksanalyse: generert av AI basert på dine titler (ingen personopplysninger sendes til AI)</li>
              <li>Trakt.tv OAuth-token (kun dersom du aktivt kobler til Trakt, lagres kun på server)</li>
            </ul>
            <p>
              Vi bruker Row Level Security (RLS) slik at kun du har tilgang til dine egne data.
              Ingen andre brukere kan se dine titler, lister eller preferanser med mindre du eksplisitt deler via kontokoblinger.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Se Sammen og gruppeøkter</h2>

            <h3 className="font-medium text-white/90 mb-1.5">Se Sammen (2 personer)</h3>
            <p className="mb-1">Når du bruker Se Sammen lagres følgende på serveren:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Titteldekk (60 titler fra TMDB)</li>
              <li>Sveipebeslutninger (liker / nei / meh / superliker)</li>
              <li>Eventuelt matchresultat</li>
            </ul>
            <p className="mb-4">
              All sesjonsdata slettes automatisk etter <strong className="text-white/90">24 timer</strong>.
              Se Sammen kan brukes uten innlogging. Gjester identifiseres med en tilfeldig UUID generert i nettleseren.
            </p>

            <h3 className="font-medium text-white/90 mb-1.5">Gruppeøkter (3+ personer)</h3>
            <p className="mb-1">Gruppeøkter lagrer:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Tittelpool, stemmer og finalister</li>
              <li>Deltakernavn og strømmetjenester</li>
            </ul>
            <p>
              All data for gruppeøkter slettes automatisk etter <strong className="text-white/90">4 timer</strong>.
              Gruppeøkter krever innlogging for alle deltakere.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Gjeste&shy;modus</h2>
            <p className="mb-1">Logflix kan brukes uten konto. I gjestemodus:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>All data lagres kun lokalt i nettleseren din (localStorage)</li>
              <li>Gjestehandlinger (opptil 100 titler med vurderinger) lagres på din enhet</li>
              <li>Se Sammen-gjester identifiseres med en tilfeldig UUID generert i nettleseren</li>
            </ul>
            <p className="mb-2">
              Hvis du senere oppretter en konto, migreres gjestehandlingene dine til kontoen din, og de lokale dataene slettes.
            </p>
            <p>
              Ingen gjestedata lagres permanent på serveren. Sesjonsdata slettes automatisk som beskrevet i punkt 3.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Lokal lagring på din enhet</h2>
            <p className="mb-1">
              Logflix bruker localStorage i nettleseren for å lagre:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Sesjonsstatus og gjenopptakingsdata for Se Sammen</li>
              <li>Gjestehandlinger og gjeste-UUID</li>
              <li>Visningsnavn for gruppeøkter</li>
              <li>Innholdspreferanser (film/serie/begge)</li>
              <li>Poster-cache og titteldekk-cache</li>
              <li>Innloggingspreferanser (husk meg)</li>
            </ul>
            <p>
              Denne informasjonen lagres kun på din enhet og sendes ikke til tredjeparter.
              Du kan slette den ved å tømme nettleserens lagring.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Tredjepartstjenester</h2>
            <p className="mb-3">Logflix bruker følgende eksterne tjenester:</p>

            <h3 className="font-medium text-white/90 mb-1">TMDB (The Movie Database)</h3>
            <p className="mb-1">Brukes for søk, tittelmetadata, plakatbilder og strømmetjeneste&shy;informasjon.</p>
            <p className="mb-4">Kun søkestrenger, sjanger-/årstallfiltre og regionkode sendes. Ingen personopplysninger deles.</p>

            <h3 className="font-medium text-white/90 mb-1">Anthropic Claude (AI)</h3>
            <p className="mb-1">Brukes for smaksanalyse og anbefalingsforklaringer. Data som sendes:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Tittelnavn, sjanger, årstall og dine vurderinger</li>
            </ul>
            <p className="mb-4">
              Vi sender ingen personidentifiserende informasjon (PII) til AI-leverandør.
              Ingen bruker-ID, e-postadresse eller navn inkluderes.
              OpenAI kan brukes som fallback med identisk dataminimering.
            </p>

            <h3 className="font-medium text-white/90 mb-1">Trakt.tv (valgfritt)</h3>
            <p className="mb-1">Hvis du kobler til Trakt-kontoen din:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-4">
              <li>OAuth-token lagres på serveren for å importere seerhistorikk</li>
              <li>Du kan når som helst koble fra, og tokenet slettes</li>
              <li>Ingen personopplysninger sendes til Trakt utover autentisering</li>
            </ul>

            <h3 className="font-medium text-white/90 mb-1">Vercel (hosting)</h3>
            <p>
              Logflix hostes på Vercel. Vi leser Vercels <code className="text-white/50">x-vercel-ip-country</code>-header
              for å bestemme språk (norsk eller engelsk) og strømmeregion.
              Denne verdien lagres ikke og brukes ikke til sporing.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Hva vi ikke gjør</h2>
            <p className="mb-1">Logflix:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Bruker ingen analyseverktøy (ingen Google Analytics, PostHog, Mixpanel e.l.)</li>
              <li>Har ingen annonser</li>
              <li>Selger ikke data</li>
              <li>Sender ingen markedsførings-e-post</li>
              <li>Sporer ikke IP-adresser eller enhetsinformasjon</li>
              <li>Bruker ingen tracking cookies</li>
              <li>Bruker ingen feilrapporteringstjenester (ingen Sentry, Datadog e.l.)</li>
            </ul>
            <p>Kun autentiseringscookies fra Supabase brukes for innlogging.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Dataeksport</h2>
            <p>Du kan eksportere dine data som JSON via innebygd eksportfunksjon.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Sletting av konto</h2>
            <p className="mb-2">Det finnes foreløpig ikke selvbetjent sletting i appen.</p>
            <p className="mb-2">
              For å slette konto og alle tilhørende data, send e-post til:{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>.
            </p>
            <p className="mb-1">Ved sletting fjernes all data permanent, inkludert:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Profil og preferanser</li>
              <li>Seerhistorikk, vurderinger og notater</li>
              <li>Egne lister og innhold</li>
              <li>Tilbakemeldinger og ekskluderinger</li>
              <li>Kontokoblinger</li>
              <li>Trakt.tv-token</li>
            </ul>
            <p>Sesjonsdata (Se Sammen og gruppeøkter) slettes automatisk uavhengig av konto, som beskrevet i punkt 3.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Barn</h2>
            <p>
              Logflix er ikke rettet mot barn under 13 år.
              Vi samler ikke bevisst inn opplysninger fra barn.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">11. Endringer</h2>
            <p>
              Vi kan oppdatere denne personvernerklæringen ved behov.
              Dato for siste oppdatering vises øverst på siden.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
