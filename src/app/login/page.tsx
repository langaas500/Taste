"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { track } from "@/lib/posthog";
import { getLocale, type Locale } from "@/lib/i18n";

/* ── locale strings ──────────────────────────────────────── */
const strings = {
  no: {
    tabLogin: "Logg inn",
    tabSignup: "Opprett gratis konto",
    continueGoogle: "Fortsett med Google",
    or: "eller",
    emailLabel: "E-post",
    emailPlaceholder: "din@epost.no",
    passwordLabel: "Passord",
    passwordPlaceholderSignup: "Velg et passord",
    passwordPlaceholderLogin: "Ditt passord",
    minChars: "Minimum 6 tegn",
    rememberMe: "Husk meg",
    loggingIn: "Logger inn...",
    creatingAccount: "Oppretter konto...",
    termsText: "Ved å fortsette godtar du våre",
    terms: "vilkår",
    and: "og",
    privacy: "personvernerklæring",
    accountPerks: "Konto gir deg tilgang til:",
    browseFirst: "Bare se rundt først →",
    freeForever: "Gratis å bruke — alltid.",
    heroTogether: "Lagre",
    heroTogetherAccent: "matchene dine",
    heroDefault: "Din personlige",
    heroDefaultAccent: "film- og seriedagbok",
    heroSubTogether: "Opprett konto for å huske hva dere likte, og få bedre treff neste gang.",
    heroSubDefault: "Logg det du ser, oppdag nye favoritter med AI-anbefalinger, og aldri glem en god film igjen.",
    heroSubDefaultMobile: "Logg det du ser, få AI-anbefalinger, og aldri glem en god film igjen.",
    featureTogetherSave: "Lagre alle Se Sammen-matcher",
    featureTogetherSaveDesc: "Husker hva dere likte — og bruker det til å finne bedre treff neste gang.",
    featureTogetherRec: "Personlige anbefalinger basert på smaken din",
    featureTogetherRecDesc: "Jo mer du sveiper, jo bedre blir forslagene.",
    featureTogetherProfile: "Bygg smaksprofilen din over tid",
    featureTogetherProfileDesc: "Én profil for alle dine matcher og preferanser.",
    featureLog: "Logg alt du ser",
    featureLogDesc: "Hold oversikt over filmer og serier du har sett, vil se, eller er midt i.",
    featureAI: "Smarte anbefalinger",
    featureAIDesc: "AI som lærer smaken din og foreslår det du faktisk vil like.",
    featureRate: "Ranger og anmeld",
    featureRateDesc: "Gi poeng, skriv korte tanker, og se tilbake på hva du likte best.",
    featureShare: "Del med venner",
    featureShareDesc: "Se hva vennene dine ser, og finn noe nytt å se sammen.",
    mobileTogetherFeatures: ["Lagre alle Se Sammen-matcher", "Personlige anbefalinger basert på smaken din", "Bygg smaksprofilen din over tid"],
    mobileDefaultFeatures: ["Se-lister, rangeringer og dagbok", "AI-anbefalinger tilpasset din smak", "Finn noe å se sammen med venner"],
    accountPerksTogether: ["Lagre alle Se Sammen-matcher", "Personlige anbefalinger basert på smaken din", "Bygg smaksprofilen din over tid"],
    accountPerksDefault: ["Se-lister, rangeringer og personlig bibliotek", "AI-anbefalinger basert på din smak", "Del lister og se statistikk over det du har sett"],
    errInvalidLogin: "Feil e-post eller passord.",
    errNotConfirmed: "E-posten er ikke bekreftet ennå. Sjekk innboksen din.",
    errAlreadyRegistered: "Denne e-posten er allerede registrert. Prøv å logge inn.",
    errShortPassword: "Passordet må være minst 6 tegn.",
    errInvalidEmail: "Ugyldig e-postformat.",
    errNoPassword: "Du må oppgi et passord.",
    errRateLimit: "For mange forsøk. Vent litt og prøv igjen.",
    errSecurityLimit: "Av sikkerhetshensyn kan du bare be om dette en gang per minutt.",
  },
  en: {
    tabLogin: "Log in",
    tabSignup: "Create free account",
    continueGoogle: "Continue with Google",
    or: "or",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholderSignup: "Choose a password",
    passwordPlaceholderLogin: "Your password",
    minChars: "Minimum 6 characters",
    rememberMe: "Remember me",
    loggingIn: "Logging in...",
    creatingAccount: "Creating account...",
    termsText: "By continuing you agree to our",
    terms: "terms",
    and: "and",
    privacy: "privacy policy",
    accountPerks: "An account gives you access to:",
    browseFirst: "Just browse first →",
    freeForever: "Free to use — always.",
    heroTogether: "Save",
    heroTogetherAccent: "your matches",
    heroDefault: "Your personal",
    heroDefaultAccent: "movie & series diary",
    heroSubTogether: "Create an account to remember what you liked, and get better matches next time.",
    heroSubDefault: "Log what you watch, discover new favourites with AI recommendations, and never forget a great movie.",
    heroSubDefaultMobile: "Log what you watch, get AI recommendations, and never forget a great movie.",
    featureTogetherSave: "Save all Watch Together matches",
    featureTogetherSaveDesc: "Remembers what you liked — and uses it for better matches next time.",
    featureTogetherRec: "Personal recommendations based on your taste",
    featureTogetherRecDesc: "The more you swipe, the better the suggestions.",
    featureTogetherProfile: "Build your taste profile over time",
    featureTogetherProfileDesc: "One profile for all your matches and preferences.",
    featureLog: "Log everything you watch",
    featureLogDesc: "Keep track of movies and series you've seen, want to see, or are watching.",
    featureAI: "Smart recommendations",
    featureAIDesc: "AI that learns your taste and suggests what you'll actually enjoy.",
    featureRate: "Rate and review",
    featureRateDesc: "Give scores, write short thoughts, and look back at what you liked best.",
    featureShare: "Share with friends",
    featureShareDesc: "See what your friends are watching, and find something new to watch together.",
    mobileTogetherFeatures: ["Save all Watch Together matches", "Personal recommendations based on your taste", "Build your taste profile over time"],
    mobileDefaultFeatures: ["Watchlists, ratings and diary", "AI recommendations tailored to your taste", "Find something to watch together with friends"],
    accountPerksTogether: ["Save all Watch Together matches", "Personal recommendations based on your taste", "Build your taste profile over time"],
    accountPerksDefault: ["Watchlists, ratings and personal library", "AI recommendations based on your taste", "Share lists and view your watch stats"],
    errInvalidLogin: "Wrong email or password.",
    errNotConfirmed: "Email not confirmed yet. Check your inbox.",
    errAlreadyRegistered: "This email is already registered. Try logging in.",
    errShortPassword: "Password must be at least 6 characters.",
    errInvalidEmail: "Invalid email format.",
    errNoPassword: "You must enter a password.",
    errRateLimit: "Too many attempts. Wait a moment and try again.",
    errSecurityLimit: "For security, you can only request this once every 60 seconds.",
  },
  dk: {
    tabLogin: "Log ind",
    tabSignup: "Opret gratis konto",
    continueGoogle: "Fortsæt med Google",
    or: "eller",
    emailLabel: "E-mail",
    emailPlaceholder: "din@email.dk",
    passwordLabel: "Adgangskode",
    passwordPlaceholderSignup: "Vælg en adgangskode",
    passwordPlaceholderLogin: "Din adgangskode",
    minChars: "Minimum 6 tegn",
    rememberMe: "Husk mig",
    loggingIn: "Logger ind...",
    creatingAccount: "Opretter konto...",
    termsText: "Ved at fortsætte accepterer du vores",
    terms: "vilkår",
    and: "og",
    privacy: "privatlivspolitik",
    accountPerks: "En konto giver dig adgang til:",
    browseFirst: "Se dig omkring først →",
    freeForever: "Gratis at bruge — altid.",
    heroTogether: "Gem",
    heroTogetherAccent: "dine matches",
    heroDefault: "Din personlige",
    heroDefaultAccent: "film- og seriedagbog",
    heroSubTogether: "Opret konto for at huske hvad I kunne lide, og få bedre matches næste gang.",
    heroSubDefault: "Log hvad du ser, opdag nye favoritter med AI-anbefalinger, og glem aldrig en god film igen.",
    heroSubDefaultMobile: "Log hvad du ser, få AI-anbefalinger, og glem aldrig en god film igen.",
    featureTogetherSave: "Gem alle Se Sammen-matches",
    featureTogetherSaveDesc: "Husker hvad I kunne lide — og bruger det til bedre matches næste gang.",
    featureTogetherRec: "Personlige anbefalinger baseret på din smag",
    featureTogetherRecDesc: "Jo mere du swiper, jo bedre bliver forslagene.",
    featureTogetherProfile: "Byg din smagsprofil over tid",
    featureTogetherProfileDesc: "Én profil til alle dine matches og præferencer.",
    featureLog: "Log alt du ser",
    featureLogDesc: "Hold styr på film og serier du har set, vil se, eller er i gang med.",
    featureAI: "Smarte anbefalinger",
    featureAIDesc: "AI der lærer din smag og foreslår det du faktisk vil kunne lide.",
    featureRate: "Bedøm og anmeld",
    featureRateDesc: "Giv point, skriv korte tanker, og se tilbage på hvad du bedst kunne lide.",
    featureShare: "Del med venner",
    featureShareDesc: "Se hvad dine venner ser, og find noget nyt at se sammen.",
    mobileTogetherFeatures: ["Gem alle Se Sammen-matches", "Personlige anbefalinger baseret på din smag", "Byg din smagsprofil over tid"],
    mobileDefaultFeatures: ["Se-lister, bedømmelser og dagbog", "AI-anbefalinger tilpasset din smag", "Find noget at se sammen med venner"],
    accountPerksTogether: ["Gem alle Se Sammen-matches", "Personlige anbefalinger baseret på din smag", "Byg din smagsprofil over tid"],
    accountPerksDefault: ["Se-lister, bedømmelser og personligt bibliotek", "AI-anbefalinger baseret på din smag", "Del lister og se statistik over det du har set"],
    errInvalidLogin: "Forkert e-mail eller adgangskode.",
    errNotConfirmed: "E-mailen er ikke bekræftet endnu. Tjek din indbakke.",
    errAlreadyRegistered: "Denne e-mail er allerede registreret. Prøv at logge ind.",
    errShortPassword: "Adgangskoden skal være mindst 6 tegn.",
    errInvalidEmail: "Ugyldigt e-mailformat.",
    errNoPassword: "Du skal angive en adgangskode.",
    errRateLimit: "For mange forsøg. Vent lidt og prøv igen.",
    errSecurityLimit: "Af sikkerhedshensyn kan du kun anmode om dette en gang per minut.",
  },
  se: {
    tabLogin: "Logga in",
    tabSignup: "Skapa gratis konto",
    continueGoogle: "Fortsätt med Google",
    or: "eller",
    emailLabel: "E-post",
    emailPlaceholder: "din@epost.se",
    passwordLabel: "Lösenord",
    passwordPlaceholderSignup: "Välj ett lösenord",
    passwordPlaceholderLogin: "Ditt lösenord",
    minChars: "Minst 6 tecken",
    rememberMe: "Kom ihåg mig",
    loggingIn: "Loggar in...",
    creatingAccount: "Skapar konto...",
    termsText: "Genom att fortsätta godkänner du våra",
    terms: "villkor",
    and: "och",
    privacy: "integritetspolicy",
    accountPerks: "Ett konto ger dig tillgång till:",
    browseFirst: "Titta runt först →",
    freeForever: "Gratis att använda — alltid.",
    heroTogether: "Spara",
    heroTogetherAccent: "dina matchningar",
    heroDefault: "Din personliga",
    heroDefaultAccent: "film- och seriedagbok",
    heroSubTogether: "Skapa konto för att komma ihåg vad ni gillade och få bättre matchningar nästa gång.",
    heroSubDefault: "Logga det du ser, upptäck nya favoriter med AI-rekommendationer och glöm aldrig en bra film.",
    heroSubDefaultMobile: "Logga det du ser, få AI-rekommendationer och glöm aldrig en bra film.",
    featureTogetherSave: "Spara alla Se Tillsammans-matchningar",
    featureTogetherSaveDesc: "Kommer ihåg vad ni gillade — och använder det för bättre matchningar.",
    featureTogetherRec: "Personliga rekommendationer baserat på din smak",
    featureTogetherRecDesc: "Ju mer du svajpar, desto bättre blir förslagen.",
    featureTogetherProfile: "Bygg din smakprofil över tid",
    featureTogetherProfileDesc: "En profil för alla dina matchningar och preferenser.",
    featureLog: "Logga allt du ser",
    featureLogDesc: "Håll koll på filmer och serier du sett, vill se eller håller på med.",
    featureAI: "Smarta rekommendationer",
    featureAIDesc: "AI som lär sig din smak och föreslår det du faktiskt kommer gilla.",
    featureRate: "Betygsätt och recensera",
    featureRateDesc: "Ge poäng, skriv korta tankar och se tillbaka på vad du gillade mest.",
    featureShare: "Dela med vänner",
    featureShareDesc: "Se vad dina vänner tittar på och hitta något nytt att se tillsammans.",
    mobileTogetherFeatures: ["Spara alla Se Tillsammans-matchningar", "Personliga rekommendationer baserat på din smak", "Bygg din smakprofil över tid"],
    mobileDefaultFeatures: ["Se-listor, betyg och dagbok", "AI-rekommendationer anpassade efter din smak", "Hitta något att se tillsammans med vänner"],
    accountPerksTogether: ["Spara alla Se Tillsammans-matchningar", "Personliga rekommendationer baserat på din smak", "Bygg din smakprofil över tid"],
    accountPerksDefault: ["Se-listor, betyg och personligt bibliotek", "AI-rekommendationer baserat på din smak", "Dela listor och se statistik över det du sett"],
    errInvalidLogin: "Fel e-post eller lösenord.",
    errNotConfirmed: "E-posten är inte bekräftad ännu. Kolla din inkorg.",
    errAlreadyRegistered: "Denna e-post är redan registrerad. Prova att logga in.",
    errShortPassword: "Lösenordet måste vara minst 6 tecken.",
    errInvalidEmail: "Ogiltigt e-postformat.",
    errNoPassword: "Du måste ange ett lösenord.",
    errRateLimit: "För många försök. Vänta en stund och försök igen.",
    errSecurityLimit: "Av säkerhetsskäl kan du bara begära detta en gång per minut.",
  },
  fi: {
    tabLogin: "Kirjaudu",
    tabSignup: "Luo ilmainen tili",
    continueGoogle: "Jatka Googlella",
    or: "tai",
    emailLabel: "Sähköposti",
    emailPlaceholder: "sinun@sposti.fi",
    passwordLabel: "Salasana",
    passwordPlaceholderSignup: "Valitse salasana",
    passwordPlaceholderLogin: "Salasanasi",
    minChars: "Vähintään 6 merkkiä",
    rememberMe: "Muista minut",
    loggingIn: "Kirjaudutaan...",
    creatingAccount: "Luodaan tiliä...",
    termsText: "Jatkamalla hyväksyt",
    terms: "käyttöehdot",
    and: "ja",
    privacy: "tietosuojakäytännön",
    accountPerks: "Tili antaa sinulle pääsyn:",
    browseFirst: "Katsele ensin →",
    freeForever: "Ilmainen käyttää — aina.",
    heroTogether: "Tallenna",
    heroTogetherAccent: "matchisi",
    heroDefault: "Henkilökohtainen",
    heroDefaultAccent: "elokuva- ja sarjapäiväkirjasi",
    heroSubTogether: "Luo tili muistaaksesi mistä piditte ja saadaksesi parempia matcheja seuraavalla kerralla.",
    heroSubDefault: "Kirjaa katsomasi, löydä uusia suosikkeja AI-suosituksilla äläkä unohda hyvää elokuvaa.",
    heroSubDefaultMobile: "Kirjaa katsomasi, saa AI-suosituksia äläkä unohda hyvää elokuvaa.",
    featureTogetherSave: "Tallenna kaikki Katsotaan Yhdessä -matchit",
    featureTogetherSaveDesc: "Muistaa mistä piditte — ja käyttää sitä parempiin matcheihin.",
    featureTogetherRec: "Henkilökohtaiset suositukset makusi perusteella",
    featureTogetherRecDesc: "Mitä enemmän swaippaat, sitä parempia ehdotuksia saat.",
    featureTogetherProfile: "Rakenna makuprofiilisi ajan myötä",
    featureTogetherProfileDesc: "Yksi profiili kaikille matcheillesi ja mieltymyksillesi.",
    featureLog: "Kirjaa kaikki katsomasi",
    featureLogDesc: "Pidä kirjaa elokuvista ja sarjoista jotka olet nähnyt, haluat nähdä tai katsot parhaillaan.",
    featureAI: "Älykkäät suositukset",
    featureAIDesc: "Tekoäly joka oppii makusi ja ehdottaa sitä mistä oikeasti pidät.",
    featureRate: "Arvioi ja arvostele",
    featureRateDesc: "Anna pisteitä, kirjoita lyhyitä ajatuksia ja katso mitä pidit eniten.",
    featureShare: "Jaa ystävien kanssa",
    featureShareDesc: "Katso mitä ystäväsi katsovat ja löydä jotain uutta katsottavaa yhdessä.",
    mobileTogetherFeatures: ["Tallenna kaikki Katsotaan Yhdessä -matchit", "Henkilökohtaiset suositukset makusi perusteella", "Rakenna makuprofiilisi ajan myötä"],
    mobileDefaultFeatures: ["Katselulistat, arviot ja päiväkirja", "AI-suositukset makuusi sopiviksi", "Löydä jotain katsottavaa yhdessä ystävien kanssa"],
    accountPerksTogether: ["Tallenna kaikki Katsotaan Yhdessä -matchit", "Henkilökohtaiset suositukset makusi perusteella", "Rakenna makuprofiilisi ajan myötä"],
    accountPerksDefault: ["Katselulistat, arviot ja henkilökohtainen kirjasto", "AI-suositukset makusi perusteella", "Jaa listoja ja katso katselutilastojasi"],
    errInvalidLogin: "Väärä sähköposti tai salasana.",
    errNotConfirmed: "Sähköpostia ei ole vahvistettu. Tarkista saapuneet.",
    errAlreadyRegistered: "Tämä sähköposti on jo rekisteröity. Kokeile kirjautua.",
    errShortPassword: "Salasanan on oltava vähintään 6 merkkiä.",
    errInvalidEmail: "Virheellinen sähköpostimuoto.",
    errNoPassword: "Sinun on annettava salasana.",
    errRateLimit: "Liian monta yritystä. Odota hetki ja yritä uudelleen.",
    errSecurityLimit: "Turvallisuussyistä voit pyytää tämän vain kerran minuutissa.",
  },
} as const;

/* ── Error translations (maps Supabase error → locale string key) ── */
const ERROR_KEY_MAP: Record<string, keyof typeof strings.en> = {
  "Invalid login credentials": "errInvalidLogin",
  "Email not confirmed": "errNotConfirmed",
  "User already registered": "errAlreadyRegistered",
  "Password should be at least 6 characters": "errShortPassword",
  "Unable to validate email address: invalid format": "errInvalidEmail",
  "Signup requires a valid password": "errNoPassword",
  "Email rate limit exceeded": "errRateLimit",
  "For security purposes, you can only request this once every 60 seconds": "errSecurityLimit",
};

function translateError(msg: string, s: Record<string, string | readonly string[]>): string {
  const key = ERROR_KEY_MAP[msg];
  return key ? s[key] as string : msg;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const isTogether = searchParams.get("from") === "together";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "login" ? "login" : "signup"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    fetch("/api/together/ribbon")
      .then((r) => r.json())
      .then((data) => { if (data.region) setLocale(getLocale(data.region as string)); })
      .catch(() => {});
  }, []);

  const s = strings[locale] ?? strings.en;

  // Auto-redirect if "remember me" was set and session is still active
  useEffect(() => {
    const saved = localStorage.getItem("logflix_remember_me") === "1";
    if (saved) {
      setRememberMe(true);
      createSupabaseBrowser().auth.getSession().then(({ data }) => {
        if (data.session) window.location.href = "/home";
      });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowser();

    if (mode === "signup") {
      track("signup_started");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback${isTogether ? "?from=together" : ""}`,
          data: {
            terms_accepted_at: new Date().toISOString(),
            terms_version: "2025-02-15",
          },
        },
      });
      if (error) {
        setError(translateError(error.message, s));
      } else {
        track("signup_submitted");
        if (rememberMe) localStorage.setItem("logflix_remember_me", "1");
        else localStorage.removeItem("logflix_remember_me");
        window.location.href = isTogether ? "/onboarding?from=together" : "/onboarding";
        setLoading(false);
        return;
      }
    } else {
      const { error, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message, s));
      } else {
        const hasGuestData =
          typeof window !== "undefined" &&
          (localStorage.getItem("logflix_guest_actions") ||
            localStorage.getItem("logflix_guest_wt_used"));

        // Check if user has any titles — send new users to onboarding
        if (signInData.user) {
          const { count } = await supabase
            .from("user_titles")
            .select("*", { count: "exact", head: true })
            .eq("user_id", signInData.user.id);

          if (count === 0) {
            if (rememberMe) localStorage.setItem("logflix_remember_me", "1");
            else localStorage.removeItem("logflix_remember_me");
            window.location.href = isTogether ? "/onboarding?from=together" : "/onboarding";
            setLoading(false);
            return;
          }
        }

        if (rememberMe) localStorage.setItem("logflix_remember_me", "1");
        else localStorage.removeItem("logflix_remember_me");
        window.location.href = isTogether ? "/together" : (hasGuestData ? "/home?migrated=guest" : "/home");
      }
    }
    setLoading(false);
  }


  const features = isTogether ? [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: s.featureTogetherSave,
      desc: s.featureTogetherSaveDesc,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: s.featureTogetherRec,
      desc: s.featureTogetherRecDesc,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: s.featureTogetherProfile,
      desc: s.featureTogetherProfileDesc,
    },
  ] : [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      ),
      title: s.featureLog,
      desc: s.featureLogDesc,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z" />
          <path d="M9 6.5a2.5 2.5 0 0 1 5 0" />
          <circle cx="12" cy="6" r="1" fill="currentColor" />
        </svg>
      ),
      title: s.featureAI,
      desc: s.featureAIDesc,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: s.featureRate,
      desc: s.featureRateDesc,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: s.featureShare,
      desc: s.featureShareDesc,
    },
  ];

  return (
    <div className="min-h-dvh flex relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255, 42, 42, 0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 60%, rgba(255, 160, 40, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Left side — Hero (hidden on mobile, shown as top section on tablet) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-center px-12 xl:px-20 relative z-10">
        <div className="max-w-lg">
          <Image
            src="/logo.png"
            alt="Logflix"
            width={140}
            height={44}
            className="object-contain mb-8"
            style={{ height: "auto" }}
            priority
          />

          <h1 className="text-4xl xl:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            {isTogether ? (
              <>{s.heroTogether} <span className="text-[var(--accent)]">{s.heroTogetherAccent}</span></>
            ) : (
              <>{s.heroDefault}<br /><span className="text-[var(--accent)]">{s.heroDefaultAccent}</span></>
            )}
          </h1>

          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-10 max-w-md">
            {isTogether ? s.heroSubTogether : s.heroSubDefault}
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <div className="flex -space-x-2">
              {["🎬", "🍿", "⭐"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <span>{s.freeForever}</span>
          </div>
        </div>
      </div>

      {/* Right side — Auth */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-8 relative z-10">
        {/* Mobile-only hero (compact) */}
        <div className="lg:hidden text-center mb-8 max-w-sm">
          <Image
            src="/logo.png"
            alt="Logflix"
            width={130}
            height={41}
            className="object-contain mx-auto mb-5"
            style={{ height: "auto" }}
            priority
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {isTogether
              ? <>{s.heroTogether} <span className="text-[var(--accent)]">{s.heroTogetherAccent}</span></>
              : <>{s.heroDefault} <span className="text-[var(--accent)]">{s.heroDefaultAccent}</span></>}
          </h1>
          <p className="text-[var(--text-tertiary)] text-sm leading-relaxed mb-4">
            {isTogether ? s.heroSubTogether : s.heroSubDefaultMobile}
          </p>

          {/* Mobile feature list (more compelling than pills) */}
          <div className="text-left space-y-2.5 max-w-xs mx-auto">
            {(isTogether ? s.mobileTogetherFeatures : s.mobileDefaultFeatures).map((label, i) => ({
              label, icon: isTogether ? ["🎯", "✨", "📈"][i] : ["📋", "✨", "👥"][i],
            })).map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-sm">
          <div className="glass-strong rounded-[var(--radius-xl)] p-6">
              {/* Tabs */}
              <div className="flex mb-6 bg-[var(--bg-surface)] rounded-[var(--radius-md)] p-1">
                {(["signup", "login"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-md)-2px)] transition-all duration-200 ${
                      mode === m
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {m === "login" ? s.tabLogin : s.tabSignup}
                  </button>
                ))}
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={async () => {
                  track("google_oauth_clicked");
                  const supabase = createSupabaseBrowser();
                  const from = searchParams.get("from");
                  const callbackUrl = `${window.location.origin}/api/auth/callback${from ? `?from=${from}` : ""}`;
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: callbackUrl },
                  });
                }}
                className="btn-press w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 mb-5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {s.continueGoogle}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-tertiary)]">{s.or}</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
                    {s.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder-[var(--text-tertiary)] input-glow transition-all duration-200 focus:outline-none"
                    placeholder={s.emailPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
                    {s.passwordLabel}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder-[var(--text-tertiary)] input-glow transition-all duration-200 focus:outline-none"
                    placeholder={mode === "signup" ? s.passwordPlaceholderSignup : s.passwordPlaceholderLogin}
                  />
                  {mode === "signup" && (
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">{s.minChars}</p>
                  )}
                </div>

                {mode === "login" && (
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-(--border) bg-(--bg-surface) accent-(--accent) cursor-pointer"
                    />
                    <span className="text-xs text-(--text-secondary)">{s.rememberMe}</span>
                  </label>
                )}


                {error && (
                  <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[rgba(248,113,113,0.1)]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-press w-full py-2.5 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "login" ? s.loggingIn : s.creatingAccount}
                    </span>
                  ) : mode === "login" ? (
                    s.tabLogin
                  ) : (
                    s.tabSignup
                  )}
                </button>

                {mode === "signup" && (
                  <p className="text-xs text-[var(--text-tertiary)] text-center mt-3 opacity-50">
                    {s.termsText}{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-[var(--text-secondary)] transition-colors">{s.terms}</Link>
                    {" "}{s.and}{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-[var(--text-secondary)] transition-colors">{s.privacy}</Link>.
                  </p>
                )}
              </form>

              {/* Why account — shown only on signup tab */}
              {mode === "signup" && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-2">{s.accountPerks}</p>
                  <ul className="text-[11px] text-[var(--text-tertiary)] space-y-1">
                    {(isTogether ? s.accountPerksTogether : s.accountPerksDefault).map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          {/* Guest mode */}
          <div className="text-center mt-5">
            <Link
              href="/search"
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {s.browseFirst}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
