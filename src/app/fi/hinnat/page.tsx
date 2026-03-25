import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Hinnat — Ilmainen ikuisesti + Premium pareille | Logflix",
  description:
    "Logflix on ilmainen ikuisesti. Päivitä Logflix Par -tilaukseen: Tonight's Pick, rajaton AI Curator, Pariraportti ja paljon muuta. 2,90 €/kk.",
  alternates: {
    canonical: "https://logflix.app/fi/hinnat",
    languages: {
      nb: "https://logflix.app/no/priser",
      sv: "https://logflix.app/se/priser",
      da: "https://logflix.app/dk/priser",
      fi: "https://logflix.app/fi/hinnat",
      en: "https://logflix.app/en/pricing",
      "x-default": "https://logflix.app/en/pricing",
    },
  },
};

const faqItems = [
  {
    question: "Onko Watch Together ilmainen?",
    answer: "Kyllä, täysin ilmainen — ikuisesti. Watch Together toimii ilman tiliä, ilman sovelluksen latausta ja ilman rajoituksia. Voit käyttää sitä niin monta kertaa kuin haluat kenen kanssa tahansa.",
  },
  {
    question: "Mitä Logflix Par premium sisältää?",
    answer: "Logflix Par sisältää Tonight's Pick (henkilökohtainen AI-suositus joka ilta), rajattoman AI Curator -chatin, täyden Pariraportin makuanalyysilla, täydellisen Makuprofiilin, pariputken ja prioriteettiuen. Kaikki muu — Watch Together, Kirjasto, Haku, Tuonti — pysyy ilmaisena.",
  },
  {
    question: "Pitääkö kumppanini maksaa?",
    answer: "Ei. Kun tilaat Logflix Par -tilauksen, kumppanisi saa täyden premium-käyttöoikeuden ilmaiseksi. Yksi tilaus kattaa teidät molemmat.",
  },
  {
    question: "Voinko peruuttaa milloin tahansa?",
    answer: "Kyllä. Peruuta milloin tahansa profiiliasetuksistasi. Ei sopimuksia, ei peruutusmaksuja, ei sitoutumisaikoja. Premium-ominaisuudet pysyvät aktiivisina laskutusjakson loppuun asti.",
  },
];

const freeTier = [
  { feature: "Watch Together", desc: "Rajattomat istunnot, 2 henkilöä" },
  { feature: "Kirjasto & Watchlist", desc: "Seuraa kaikkea katsomaasi" },
  { feature: "Haku & Löydä", desc: "800 000+ nimikettä" },
  { feature: "Netflix & Trakt -tuonti", desc: "Massamaahanto katseluhistoria" },
  { feature: "Kuukausiraportti", desc: "Jaettava kuukausittainen yhteenveto" },
  { feature: "Suoratoistoinfo", desc: "Katso missä voit katsoa, maittain" },
  { feature: "Ystävät & Sosiaalinen", desc: "Aktiviteettivirta, vertaile makua" },
];

const premiumTier = [
  { feature: "Tonight's Pick", desc: "AI-pohjainen päivittäinen suositus" },
  { feature: "Rajaton Curator", desc: "Chat-pohjainen AI-elokuvaneuvoja" },
  { feature: "Pariraportti", desc: "Makuanalyysi sinulle ja kumppanillesi" },
  { feature: "Täysi Makuprofiili", desc: "Syvä AI-analyysi mieltymyksistäsi" },
  { feature: "Pariputki", desc: "Viikoittainen putki palkinnoilla" },
  { feature: "Kumppani saa ilmaiseksi", desc: "Yksi tilaus, kaksi henkilöä" },
  { feature: "Kaikki Ilmaisessa", desc: "Kaikki ilmaiset ominaisuudet mukana" },
];

export default function HinnatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Logflix", item: "https://logflix.app" },
              { "@type": "ListItem", position: 2, name: "Hinnat", item: "https://logflix.app/fi/hinnat" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            datePublished: "2026-03-25",
            dateModified: "2026-03-25",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Logflix Par",
            description: "Premium-tilaus pareille — Tonight's Pick, rajaton AI Curator, Pariraportti, Makuprofiili ja paljon muuta. Kumppanisi saa sen ilmaiseksi.",
            brand: { "@type": "Brand", name: "Logflix" },
            offers: {
              "@type": "Offer",
              price: "2.90",
              priceCurrency: "EUR",
              priceValidUntil: "2027-12-31",
              availability: "https://schema.org/InStock",
              url: "https://logflix.app/premium",
            },
          }),
        }}
      />
      <div style={{ background: "#0a0a0f", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <header style={{ display: "flex", justifyContent: "center", padding: "16px 24px" }}>
            <Link href="/">
              <Image src="/logo.png" alt="Logflix" width={90} height={28} className="object-contain" style={{ height: 28, width: "auto" }} priority />
            </Link>
          </header>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 0", textAlign: "center" }}>
            <h1 style={{ color: "#ffffff", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, fontSize: "clamp(2rem, 6vw, 3rem)" }}>
              Selkeät, läpinäkyvät hinnat
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5, maxWidth: 380, margin: "0 auto 40px" }}>
              Logflix on ilmainen ikuisesti. Premium avaa AI-pohjaiset ominaisuudet pareille.
            </p>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: "24px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em" }}>ILMAINEN</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>0 &euro;</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>ikuisesti</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {freeTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/together" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", textDecoration: "none" }}>
                  Aloita
                </Link>
              </div>

              <div style={{ background: "rgba(255,42,42,0.06)", border: "1.5px solid rgba(255,42,42,0.3)", borderRadius: 16, padding: "24px 18px", position: "relative" }}>
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#E50914", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>SUOSITTU</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C842", marginBottom: 4, letterSpacing: "0.04em" }}>LOGFLIX PAR</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>2,90 &euro;</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>/kk</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {premiumTier.map((item) => (
                    <div key={item.feature}>
                      <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>{item.feature}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <Link href="/premium" className="button" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, textDecoration: "none" }}>
                  Päivitä nyt
                </Link>
              </div>
            </div>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Mikä pysyy ilmaisena — aina
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Watch Together on Logflixin ydin ja pysyy aina ilmaisena. Tiliä ei tarvita, istunnoille ei ole
                rajoituksia, piilotettuja maksumuureja ei ole. Sama koskee kirjastoasi, watchlistiä, hakua ja
                tuontityökaluja. Premium on pareille, jotka haluavat AI-pohjaisia suosituksia ja syvempää
                makuanalyysiä — ei porttina jo käyttämiisi ominaisuuksiin.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Miksi Logflix Par?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Logflix Par on suunniteltu pareille, jotka katsovat yhdessä säännöllisesti. Tonight&apos;s Pick antaa
                sinulle henkilökohtaisen AI-suosituksen joka ilta molempien makuprofiilien perusteella. AI Curator
                on chat-pohjainen elokuvaneuvoja, joka tietää mitä olet katsonut ja mistä pidät. Pariraportti
                näyttää miten makunne kohtaavat ja missä eroatte — täydellinen &quot;sinä valitset aina&quot; -väittelyn
                ratkaisemiseen.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                Parasta: kumppanisi saa täyden premium-käyttöoikeuden mukana — yksi tilaus kattaa molemmat.
                Hintaan 2,90 &euro;/kk se on halvempaa kuin puolikas kahvi.
              </p>
            </section>

            <FaqSection
              title="Usein kysytyt kysymykset"
              items={faqItems}
            />

            <nav style={{ marginBottom: 48 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Katso myös
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/together", label: "Avaa Watch Together" },
                  { href: "/en/watch-together", label: "Watch Together — miten se toimii" },
                  { href: "/en/solo-to-duo", label: "Solo to Duo — aloita yksin, kutsu myöhemmin" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, display: "block" }}>
                    {link.label} &rarr;
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>
                Valmis löytämään jotain katsottavaa?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Aloita Watch Togetherilla — ilmainen, tiliä ei tarvita.
              </p>
              <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block", textDecoration: "none" }}>
                Kokeile Watch Together — ilmainen
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
