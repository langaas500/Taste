import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brukervilkår | Logflix",
  description:
    "Les brukervilkårene for Logflix — hva du godtar ved bruk av tjenesten.",
  alternates: {
    canonical: "https://logflix.app/terms",
  },
};

export default function TermsPage() {
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

        <h1 className="text-2xl font-bold text-white mb-1">Brukervilkår &ndash; Logflix</h1>
        <p className="text-white/30 text-sm mb-8">Sist oppdatert: 1. mars 2026</p>

        <p className="mb-2 text-[15px] leading-relaxed">
          Ved å bruke Logflix godtar du disse vilkårene.
        </p>
        <p className="mb-8 text-[15px] leading-relaxed">
          Hvis du ikke aksepterer vilkårene, skal du ikke bruke tjenesten.
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Hva Logflix er</h2>
            <p className="mb-1">Logflix er en digital tjeneste for:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Film- og serieoversikt</li>
              <li>Smaksanalyse og AI-anbefalinger</li>
              <li>Personlige anbefalinger</li>
              <li>Se Sammen (Watch Together) — sveipebasert matching for to eller flere</li>
              <li>Gruppesesjoner for felles filmvalg</li>
              <li>Delte lister</li>
              <li>Valgfri kontokobling</li>
            </ul>
            <p className="mb-2">
              Logflix er ikke en strømmetjeneste og tilbyr ikke direkte tilgang til filmer eller serier.
            </p>
            <p>
              Strømmeinformasjon og metadata leveres av tredjepart (f.eks. TMDB og Trakt) og kan
              inneholde feil eller endres uten varsel.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Konto og sikkerhet</h2>
            <p className="mb-1">Du er ansvarlig for:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Å holde innloggingsinformasjon sikker</li>
              <li>All aktivitet som skjer på din konto</li>
            </ul>
            <p className="mb-1">Logflix kan suspendere eller stenge kontoer ved:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Misbruk</li>
              <li>Forsøk på å manipulere systemet</li>
              <li>Automatisert scraping</li>
              <li>Omgåelse av betalingsløsninger</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Fremtidige betalte funksjoner</h2>
            <p className="mb-2">Logflix kan i fremtiden tilby betalte funksjoner eller abonnement.</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Eksisterende brukere kan beholde funksjoner de allerede har fått tilgang til, med mindre annet er tydelig kommunisert.</li>
              <li>Nye brukere kan få tilgang til en annen funksjonsmodell.</li>
              <li>Eventuelle betalte funksjoner vil bli tydelig presentert før kjøp.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Deling av innhold</h2>
            <p className="mb-1">Brukere kan velge å dele:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Lister</li>
              <li>Titler</li>
              <li>Lenker til Logflix</li>
            </ul>
            <p className="mb-2">Du er selv ansvarlig for hva du deler.</p>
            <p>Logflix kan fjerne offentlig delt innhold som bryter med lov eller god praksis.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Kontokobling (Watch Together)</h2>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Logflix kan tilby frivillig kobling mellom kontoer.</li>
              <li>Begge parter må samtykke.</li>
              <li>Koblingen kan når som helst fjernes av én av partene.</li>
              <li>Ingen privat informasjon deles utover det som er nødvendig for funksjonen.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Immaterielle rettigheter</h2>
            <p className="mb-2">
              Logflix, inkludert design, logo, kode og struktur, tilhører tjenesteeier.
            </p>
            <p>
              Filmmetadata, plakater og strømmeinformasjon leveres via tredjeparts API-er og tilhører
              respektive rettighetshavere.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. AI-funksjoner</h2>
            <p className="mb-1">Anbefalinger og smaksanalyse kan genereres ved bruk av kunstig intelligens. Disse er:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Veiledende</li>
              <li>Ikke garanti for kvalitet</li>
              <li>Ikke personlig rådgivning</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Ansvarsbegrensning</h2>
            <p className="mb-2">Tjenesten leveres &laquo;som den er&raquo;.</p>
            <p className="mb-1">Logflix gir ingen garanti for:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Kontinuerlig tilgjengelighet</li>
              <li>Feilfri drift</li>
              <li>Nøyaktighet i tredjepartsdata</li>
            </ul>
            <p>Logflix er ikke ansvarlig for direkte eller indirekte tap som følge av bruk av tjenesten.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Endringer og opphør</h2>
            <p className="mb-1">Logflix kan:</p>
            <ul className="list-disc pl-5 space-y-0.5 mb-3">
              <li>Endre funksjonalitet</li>
              <li>Introdusere nye prismodeller</li>
              <li>Avslutte tjenesten</li>
            </ul>
            <p>Brukere vil bli varslet ved vesentlige endringer.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Lovvalg</h2>
            <p className="mb-2">Disse vilkårene reguleres av norsk lov.</p>
            <p>Eventuelle tvister skal behandles i Norge.</p>
          </section>

          {/* 11 — Tjenesteeier + kontakt */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">11. Tjenesteeier og kontakt</h2>
            <p className="mb-2">
              Logflix drives av Solutions by Langaas (enkeltpersonforetak), Norge.
            </p>
            <p className="mb-4">
              Kontakt:{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>
            </p>
            <p>
              Se også vår{" "}
              <Link href="/privacy" className="underline hover:text-white">personvernerklæring</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
