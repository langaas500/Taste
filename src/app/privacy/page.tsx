import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personvern (Privacy Policy) | Logflix",
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
        <p className="text-white/30 text-sm mb-8">Sist oppdatert: 15. februar 2025</p>

        <p className="mb-8 text-[15px] leading-relaxed">
          Logflix er laget for filmelskere som ønsker bedre oversikt og smartere anbefalinger.
          Vi samler inn så lite data som mulig, og bruker kun informasjon som er nødvendig for at tjenesten skal fungere.
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Hvilke opplysninger vi lagrer</h2>

            <h3 className="font-medium text-white/90 mb-1.5">Konto og innlogging</h3>
            <p className="mb-2">Logflix bruker Supabase Auth for innlogging med e-post og passord.</p>
            <p className="mb-1">Vi lagrer:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>E-postadresse</li>
              <li>Kryptert passord</li>
              <li>Økt-cookies (session cookies)</li>
            </ul>
            <p className="mb-4">Disse brukes kun for autentisering.</p>

            <h3 className="font-medium text-white/90 mb-1.5">Bruksdata i kontoen din</h3>
            <p className="mb-1">
              For at Logflix skal fungere lagres følgende i vår database (Supabase PostgreSQL med Row Level Security):
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Profildata</li>
              <li>Titler du har sett eller vurdert</li>
              <li>Titler du har ekskludert</li>
              <li>Tilbakemeldinger på anbefalinger</li>
              <li>Egne lister</li>
              <li>Eventuelle koblinger mellom kontoer</li>
              <li>Eventuelle Trakt-tokens (kun hvis du aktiverer Trakt-integrasjon)</li>
            </ul>
            <p className="mb-4">Vi bruker Row Level Security (RLS) slik at kun du får tilgang til dine egne data.</p>

            <h3 className="font-medium text-white/90 mb-1.5">Lokal lagring på din enhet</h3>
            <p className="mb-1">WT Beta (Watch Together Beta) bruker lokal lagring i nettleseren (localStorage):</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2 text-sm text-white/60">
              <li><code className="text-white/50">logflix_profile_v1</code></li>
              <li><code className="text-white/50">logflix_partner_v1</code></li>
              <li><code className="text-white/50">wt_posters_v1</code></li>
            </ul>
            <p>Dette lagres kun på din enhet og sendes ikke til våre servere.</p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Tredjepartstjenester</h2>
            <p className="mb-3">Logflix bruker følgende eksterne tjenester:</p>

            <h3 className="font-medium text-white/90 mb-1">TMDB (The Movie Database)</h3>
            <p className="mb-1">Brukes for:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Søk</li>
              <li>Tittelmetadata</li>
              <li>Plakatbilder</li>
              <li>Strømmetjenesteinformasjon</li>
            </ul>
            <p className="mb-4">Kun søkestrenger og tittel-ID-er sendes. Ingen personopplysninger deles.</p>

            <h3 className="font-medium text-white/90 mb-1">Trakt (valgfritt)</h3>
            <p className="mb-1">Hvis du kobler til Trakt-konto:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-4">
              <li>OAuth-token lagres for å importere seerhistorikk.</li>
              <li>Du kan når som helst koble fra.</li>
            </ul>

            <h3 className="font-medium text-white/90 mb-1">AI (Anthropic Claude)</h3>
            <p className="mb-1">Brukes for:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Smaksanalyse</li>
              <li>Anbefalingsforklaringer</li>
            </ul>
            <p className="mb-1">Data som sendes:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-2">
              <li>Tittelnavn</li>
              <li>Sjanger</li>
              <li>Årstall</li>
              <li>Vurderinger</li>
            </ul>
            <p>Vi sender ingen personidentifiserende informasjon (PII) til AI-leverandør.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Hva vi ikke gjør</h2>
            <p className="mb-1">Logflix:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Bruker ikke tredjeparts analyseverktøy</li>
              <li>Har ingen annonser</li>
              <li>Selger ikke data</li>
              <li>Sporer ikke IP-adresse eller enhetsinformasjon</li>
              <li>Bruker ikke tracking cookies</li>
            </ul>
            <p>Kun autentiseringscookies fra Supabase brukes for innlogging.</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Dataeksport</h2>
            <p>Du kan eksportere dine data som JSON via innebygd eksportfunksjon.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Sletting av konto</h2>
            <p className="mb-2">Det finnes foreløpig ikke selvbetjent sletting i appen.</p>
            <p>
              For å slette konto og alle tilhørende data, send e-post til:{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>.
              Vi sletter alle data permanent fra våre systemer.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Barn</h2>
            <p>
              Logflix er ikke rettet mot barn under 13 år.
              Vi samler ikke bevisst inn opplysninger fra barn.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Endringer</h2>
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
