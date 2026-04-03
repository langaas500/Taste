"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

const s = {
  no: {
    back: "Tilbake",
    title: "Brukervilkår – Logflix",
    updated: "Sist oppdatert: 1. mars 2026",
    intro1: "Ved å bruke Logflix godtar du disse vilkårene.",
    intro2: "Hvis du ikke aksepterer vilkårene, skal du ikke bruke tjenesten.",
    s1t: "1. Hva Logflix er",
    s1p1: "Logflix er en digital tjeneste for:",
    s1list: ["Film- og serieoversikt", "Smaksanalyse og AI-anbefalinger", "Personlige anbefalinger", "Se Sammen (Watch Together) — sveipebasert matching for to eller flere", "Gruppesesjoner for felles filmvalg", "Delte lister", "Valgfri kontokobling"],
    s1p2: "Logflix er ikke en strømmetjeneste og tilbyr ikke direkte tilgang til filmer eller serier.",
    s1p3: "Strømmeinformasjon og metadata leveres av tredjepart (f.eks. TMDB og Trakt) og kan inneholde feil eller endres uten varsel.",
    s2t: "2. Konto og sikkerhet",
    s2p1: "Du er ansvarlig for:",
    s2list1: ["Å holde innloggingsinformasjon sikker", "All aktivitet som skjer på din konto"],
    s2p2: "Logflix kan suspendere eller stenge kontoer ved:",
    s2list2: ["Misbruk", "Forsøk på å manipulere systemet", "Automatisert scraping", "Omgåelse av betalingsløsninger"],
    s3t: "3. Fremtidige betalte funksjoner",
    s3p1: "Logflix kan i fremtiden tilby betalte funksjoner eller abonnement.",
    s3list: ["Eksisterende brukere kan beholde funksjoner de allerede har fått tilgang til, med mindre annet er tydelig kommunisert.", "Nye brukere kan få tilgang til en annen funksjonsmodell.", "Eventuelle betalte funksjoner vil bli tydelig presentert før kjøp."],
    s4t: "4. Deling av innhold",
    s4p1: "Brukere kan velge å dele:",
    s4list: ["Lister", "Titler", "Lenker til Logflix"],
    s4p2: "Du er selv ansvarlig for hva du deler.",
    s4p3: "Logflix kan fjerne offentlig delt innhold som bryter med lov eller god praksis.",
    s5t: "5. Kontokobling (Watch Together)",
    s5list: ["Logflix kan tilby frivillig kobling mellom kontoer.", "Begge parter må samtykke.", "Koblingen kan når som helst fjernes av én av partene.", "Ingen privat informasjon deles utover det som er nødvendig for funksjonen."],
    s6t: "6. Immaterielle rettigheter",
    s6p1: "Logflix, inkludert design, logo, kode og struktur, tilhører tjenesteeier.",
    s6p2: "Filmmetadata, plakater og strømmeinformasjon leveres via tredjeparts API-er og tilhører respektive rettighetshavere.",
    s7t: "7. AI-funksjoner",
    s7p1: "Anbefalinger og smaksanalyse kan genereres ved bruk av kunstig intelligens. Disse er:",
    s7list: ["Veiledende", "Ikke garanti for kvalitet", "Ikke personlig rådgivning"],
    s8t: "8. Ansvarsbegrensning",
    s8p1: "Tjenesten leveres «som den er».",
    s8p2: "Logflix gir ingen garanti for:",
    s8list: ["Kontinuerlig tilgjengelighet", "Feilfri drift", "Nøyaktighet i tredjepartsdata"],
    s8p3: "Logflix er ikke ansvarlig for direkte eller indirekte tap som følge av bruk av tjenesten.",
    s9t: "9. Endringer og opphør",
    s9p1: "Logflix kan:",
    s9list: ["Endre funksjonalitet", "Introdusere nye prismodeller", "Avslutte tjenesten"],
    s9p2: "Brukere vil bli varslet ved vesentlige endringer.",
    s10t: "10. Lovvalg",
    s10p1: "Disse vilkårene reguleres av norsk lov.",
    s10p2: "Eventuelle tvister skal behandles i Norge.",
    s11t: "11. Tjenesteeier og kontakt",
    s11p1: "Logflix drives av Solutions by Langaas (enkeltpersonforetak), Norge.",
    s11contact: "Kontakt:",
    s11privacy: "Se også vår",
    s11privacyLink: "personvernerklæring",
  },
  en: {
    back: "Back",
    title: "Terms of Service – Logflix",
    updated: "Last updated: March 1, 2026",
    intro1: "By using Logflix you agree to these terms.",
    intro2: "If you do not accept the terms, you should not use the service.",
    s1t: "1. What Logflix is",
    s1p1: "Logflix is a digital service for:",
    s1list: ["Movie and TV show tracking", "Taste analysis and AI recommendations", "Personalized recommendations", "Watch Together — swipe-based matching for two or more", "Group sessions for collaborative movie selection", "Shared lists", "Optional account linking"],
    s1p2: "Logflix is not a streaming service and does not provide direct access to movies or series.",
    s1p3: "Streaming information and metadata is provided by third parties (e.g. TMDB and Trakt) and may contain errors or change without notice.",
    s2t: "2. Account and security",
    s2p1: "You are responsible for:",
    s2list1: ["Keeping your login information secure", "All activity that occurs on your account"],
    s2p2: "Logflix may suspend or close accounts for:",
    s2list2: ["Abuse", "Attempts to manipulate the system", "Automated scraping", "Circumvention of payment solutions"],
    s3t: "3. Future paid features",
    s3p1: "Logflix may in the future offer paid features or subscriptions.",
    s3list: ["Existing users may retain features they already have access to, unless otherwise clearly communicated.", "New users may have access to a different feature model.", "Any paid features will be clearly presented before purchase."],
    s4t: "4. Sharing content",
    s4p1: "Users may choose to share:",
    s4list: ["Lists", "Titles", "Links to Logflix"],
    s4p2: "You are responsible for what you share.",
    s4p3: "Logflix may remove publicly shared content that violates law or good practice.",
    s5t: "5. Account linking (Watch Together)",
    s5list: ["Logflix may offer voluntary linking between accounts.", "Both parties must consent.", "The link can be removed at any time by either party.", "No private information is shared beyond what is necessary for the feature."],
    s6t: "6. Intellectual property",
    s6p1: "Logflix, including design, logo, code and structure, belongs to the service owner.",
    s6p2: "Movie metadata, posters and streaming information are provided via third-party APIs and belong to their respective rights holders.",
    s7t: "7. AI features",
    s7p1: "Recommendations and taste analysis may be generated using artificial intelligence. These are:",
    s7list: ["Advisory", "Not a guarantee of quality", "Not personal advice"],
    s8t: "8. Limitation of liability",
    s8p1: "The service is provided \"as is\".",
    s8p2: "Logflix makes no guarantee of:",
    s8list: ["Continuous availability", "Error-free operation", "Accuracy of third-party data"],
    s8p3: "Logflix is not liable for direct or indirect losses resulting from the use of the service.",
    s9t: "9. Changes and termination",
    s9p1: "Logflix may:",
    s9list: ["Change functionality", "Introduce new pricing models", "Discontinue the service"],
    s9p2: "Users will be notified of significant changes.",
    s10t: "10. Governing law",
    s10p1: "These terms are governed by Norwegian law.",
    s10p2: "Any disputes shall be handled in Norway.",
    s11t: "11. Service owner and contact",
    s11p1: "Logflix is operated by Solutions by Langaas (sole proprietorship), Norway.",
    s11contact: "Contact:",
    s11privacy: "See also our",
    s11privacyLink: "privacy policy",
  },
};

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-0.5 mb-3">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function TermsPage() {
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

        <p className="mb-2 text-[15px] leading-relaxed">{t.intro1}</p>
        <p className="mb-8 text-[15px] leading-relaxed">{t.intro2}</p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s1t}</h2>
            <p className="mb-1">{t.s1p1}</p>
            <List items={t.s1list} />
            <p className="mb-2">{t.s1p2}</p>
            <p>{t.s1p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s2t}</h2>
            <p className="mb-1">{t.s2p1}</p>
            <List items={t.s2list1} />
            <p className="mb-1">{t.s2p2}</p>
            <List items={t.s2list2} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s3t}</h2>
            <p className="mb-2">{t.s3p1}</p>
            <List items={t.s3list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s4t}</h2>
            <p className="mb-1">{t.s4p1}</p>
            <List items={t.s4list} />
            <p className="mb-2">{t.s4p2}</p>
            <p>{t.s4p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s5t}</h2>
            <List items={t.s5list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s6t}</h2>
            <p className="mb-2">{t.s6p1}</p>
            <p>{t.s6p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s7t}</h2>
            <p className="mb-1">{t.s7p1}</p>
            <List items={t.s7list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s8t}</h2>
            <p className="mb-2">{t.s8p1}</p>
            <p className="mb-1">{t.s8p2}</p>
            <List items={t.s8list} />
            <p>{t.s8p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s9t}</h2>
            <p className="mb-1">{t.s9p1}</p>
            <List items={t.s9list} />
            <p>{t.s9p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s10t}</h2>
            <p className="mb-2">{t.s10p1}</p>
            <p>{t.s10p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s11t}</h2>
            <p className="mb-2">{t.s11p1}</p>
            <p className="mb-4">
              {t.s11contact}{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>
            </p>
            <p>
              {t.s11privacy}{" "}
              <Link href="/privacy" className="underline hover:text-white">{t.s11privacyLink}</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
