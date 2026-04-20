"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

const s = {
  no: {
    back: "Tilbake",
    title: "Brukervilkår – Logflix",
    updated: "Sist oppdatert: 20. april 2026",
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
    s2list2: ["Misbruk", "Forsøk på å manipulere systemet", "Automatisert scraping"],
    s3t: "3. Gratistjeneste",
    s3p1: "Logflix er i sin nåværende form tilgjengelig gratis for alle brukere – uten abonnement eller skjulte kostnader.",
    s3p2: "Logflix forbeholder seg retten til å introdusere betalte tilleggsfunksjoner i fremtiden. Eksisterende brukere vil varsles i god tid, og eventuelle betalte funksjoner vil presenteres tydelig før kjøp.",
    s4t: "4. Akseptabel bruk",
    s4p1: "Du forplikter deg til ikke å:",
    s4list: ["Bruke tjenesten til ulovlige formål", "Forsøke å hente ut data automatisk (scraping)", "Omgå eller angripe tjenestens tekniske infrastruktur", "Utgi deg for å være en annen bruker", "Dele innhold som er ulovlig, støtende eller krenkende"],
    s5t: "5. Deling av innhold",
    s5p1: "Brukere kan velge å dele:",
    s5list: ["Lister", "Titler", "Lenker til Logflix"],
    s5p2: "Du er selv ansvarlig for hva du deler.",
    s5p3: "Logflix kan fjerne offentlig delt innhold som bryter med lov eller god praksis.",
    s6t: "6. Kontokobling (Se Sammen / Watch Together)",
    s6list: ["Logflix kan tilby frivillig kobling mellom kontoer.", "Begge parter må samtykke.", "Koblingen kan når som helst fjernes av én av partene.", "Ingen privat informasjon deles utover det som er nødvendig for funksjonen."],
    s7t: "7. AI-funksjoner",
    s7p1: "Anbefalinger og smaksanalyse kan genereres ved bruk av kunstig intelligens. Disse er:",
    s7list: ["Veiledende", "Ikke garanti for kvalitet", "Ikke personlig rådgivning"],
    s8t: "8. Informasjonskapsler og personvern",
    s8p: "Logflix bruker nødvendige cookies for autentisering og valgfrie analysecookies (PostHog) etter ditt samtykke. Du velger selv hva du godtar første gang du besøker tjenesten. Se vår",
    s8link: "personvernerklæring",
    s8p2: "for fullstendig informasjon om databehandling og cookies.",
    s9t: "9. Immaterielle rettigheter",
    s9p1: "Logflix, inkludert design, logo, kode og struktur, tilhører tjenesteeier.",
    s9p2: "Filmmetadata, plakater og strømmeinformasjon leveres via tredjeparts API-er og tilhører respektive rettighetshavere.",
    s10t: "10. Ansvarsbegrensning",
    s10p1: "Tjenesten leveres «som den er».",
    s10p2: "Logflix gir ingen garanti for:",
    s10list: ["Kontinuerlig tilgjengelighet", "Feilfri drift", "Nøyaktighet i tredjepartsdata"],
    s10p3: "Logflix er ikke ansvarlig for direkte eller indirekte tap som følge av bruk av tjenesten.",
    s11t: "11. Endringer og opphør",
    s11p1: "Logflix kan:",
    s11list: ["Endre funksjonalitet", "Introdusere nye prismodeller", "Avslutte tjenesten"],
    s11p2: "Brukere vil bli varslet ved vesentlige endringer.",
    s12t: "12. Lovvalg",
    s12p1: "Disse vilkårene reguleres av norsk lov.",
    s12p2: "Eventuelle tvister skal behandles i Norge.",
    s13t: "13. Tjenesteeier og kontakt",
    s13p1: "Logflix drives av Solutions by Langaas (enkeltpersonforetak), Norge.",
    s13contact: "Kontakt:",
    s13privacy: "Se også vår",
    s13privacyLink: "personvernerklæring",
  },
  en: {
    back: "Back",
    title: "Terms of Service – Logflix",
    updated: "Last updated: April 20, 2026",
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
    s2list2: ["Abuse", "Attempts to manipulate the system", "Automated scraping"],
    s3t: "3. Free service",
    s3p1: "Logflix is currently available free of charge to all users — no subscription or hidden costs.",
    s3p2: "Logflix reserves the right to introduce optional paid features in the future. Existing users will be notified in advance, and any paid features will be clearly presented before purchase.",
    s4t: "4. Acceptable use",
    s4p1: "You agree not to:",
    s4list: ["Use the service for illegal purposes", "Attempt to extract data automatically (scraping)", "Circumvent or attack the service's technical infrastructure", "Impersonate another user", "Share content that is illegal, offensive or infringing"],
    s5t: "5. Sharing content",
    s5p1: "Users may choose to share:",
    s5list: ["Lists", "Titles", "Links to Logflix"],
    s5p2: "You are responsible for what you share.",
    s5p3: "Logflix may remove publicly shared content that violates law or good practice.",
    s6t: "6. Account linking (Watch Together)",
    s6list: ["Logflix may offer voluntary linking between accounts.", "Both parties must consent.", "The link can be removed at any time by either party.", "No private information is shared beyond what is necessary for the feature."],
    s7t: "7. AI features",
    s7p1: "Recommendations and taste analysis may be generated using artificial intelligence. These are:",
    s7list: ["Advisory", "Not a guarantee of quality", "Not personal advice"],
    s8t: "8. Cookies and privacy",
    s8p: "Logflix uses necessary cookies for authentication and optional analytics cookies (PostHog) based on your consent. You choose what you accept the first time you visit the service. See our",
    s8link: "privacy policy",
    s8p2: "for full information on data processing and cookies.",
    s9t: "9. Intellectual property",
    s9p1: "Logflix, including design, logo, code and structure, belongs to the service owner.",
    s9p2: "Movie metadata, posters and streaming information are provided via third-party APIs and belong to their respective rights holders.",
    s10t: "10. Limitation of liability",
    s10p1: "The service is provided \"as is\".",
    s10p2: "Logflix makes no guarantee of:",
    s10list: ["Continuous availability", "Error-free operation", "Accuracy of third-party data"],
    s10p3: "Logflix is not liable for direct or indirect losses resulting from the use of the service.",
    s11t: "11. Changes and termination",
    s11p1: "Logflix may:",
    s11list: ["Change functionality", "Introduce new pricing models", "Discontinue the service"],
    s11p2: "Users will be notified of significant changes.",
    s12t: "12. Governing law",
    s12p1: "These terms are governed by Norwegian law.",
    s12p2: "Any disputes shall be handled in Norway.",
    s13t: "13. Service owner and contact",
    s13p1: "Logflix is operated by Solutions by Langaas (sole proprietorship), Norway.",
    s13contact: "Contact:",
    s13privacy: "See also our",
    s13privacyLink: "privacy policy",
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
            <p>{t.s3p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s4t}</h2>
            <p className="mb-1">{t.s4p1}</p>
            <List items={t.s4list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s5t}</h2>
            <p className="mb-1">{t.s5p1}</p>
            <List items={t.s5list} />
            <p className="mb-2">{t.s5p2}</p>
            <p>{t.s5p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s6t}</h2>
            <List items={t.s6list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s7t}</h2>
            <p className="mb-1">{t.s7p1}</p>
            <List items={t.s7list} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s8t}</h2>
            <p>
              {t.s8p}{" "}
              <Link href="/privacy" className="underline hover:text-white">{t.s8link}</Link>{" "}
              {t.s8p2}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s9t}</h2>
            <p className="mb-2">{t.s9p1}</p>
            <p>{t.s9p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s10t}</h2>
            <p className="mb-2">{t.s10p1}</p>
            <p className="mb-1">{t.s10p2}</p>
            <List items={t.s10list} />
            <p>{t.s10p3}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s11t}</h2>
            <p className="mb-1">{t.s11p1}</p>
            <List items={t.s11list} />
            <p>{t.s11p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s12t}</h2>
            <p className="mb-2">{t.s12p1}</p>
            <p>{t.s12p2}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t.s13t}</h2>
            <p className="mb-2">{t.s13p1}</p>
            <p className="mb-4">
              {t.s13contact}{" "}
              <a href="mailto:contact@logflix.app" className="underline hover:text-white">contact@logflix.app</a>
            </p>
            <p>
              {t.s13privacy}{" "}
              <Link href="/privacy" className="underline hover:text-white">{t.s13privacyLink}</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
