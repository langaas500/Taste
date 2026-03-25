import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Pariputki — Pidä elokuvailtoja yllä | Logflix",
  description:
    "Pidä pariputkenne voimassa. Matchatkaa elokuvaan joka viikko ja avatkaa palkintoja. Näe, kuinka johdonmukaisia olette elokuvaparina.",
  alternates: {
    canonical: `${BASE}/fi/couple-streak`,
    languages: {
      nb: `${BASE}/no/couple-streak`,
      sv: `${BASE}/se/couple-streak`,
      da: `${BASE}/dk/couple-streak`,
      fi: `${BASE}/fi/couple-streak`,
      en: `${BASE}/en/couple-streak`,
      "x-default": `${BASE}/en/couple-streak`,
    },
  },
  openGraph: {
    title: "Pariputki — Pidä elokuvailtoja yllä | Logflix",
    description:
      "Pidä pariputkenne voimassa. Matchatkaa elokuvaan joka viikko ja avatkaa palkintoja.",
    url: `${BASE}/fi/couple-streak`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Miten pariputki toimii?",
    answer:
      "Joka kerta kun sinä ja kumppanisi matchaatte elokuvaan tai sarjaan Katsotaan yhdessä -toiminnossa viikon sisällä, putkenne kasvaa yhdellä. Putkilaskuri nollautuu, jos kokonainen viikko menee ilman matchia. Se on suunniteltu helpoksi ylläpitää — yksi match viikossa riittää.",
  },
  {
    question: "Mitä palkintoja avataan?",
    answer:
      "4 viikon kohdalla avaat kuratoidun 'Klassikot'-opaskokoelman. 8 viikon kohdalla saat 'Piilotetut aarteet' — vähemmän tunnettuja nimikkeitä, jotka sopivat parinne makuun. 12 viikon kohdalla avaat 'Viikonloppuvalinta' — premium-tunnelmapohjaisen oppaan. Lisää palkintoja lisätään ajan myötä.",
  },
  {
    question: "Jäätyykö putkeni, jos peruutan premiumin?",
    answer:
      "Kyllä. Jos peruutat Logflix Premium -tilauksesi, putkesi jäätyy — sitä ei menetetä. Kun tilaat uudelleen, putkesi jatkuu täsmälleen siitä, mihin jäit. Edistymistä ei koskaan poisteta.",
  },
  {
    question: "Tarvitsevatko molemmat kumppanit Logflix-tilin?",
    answer:
      "Vain toinen kumppani tarvitsee Logflix-tilin putken seuraamiseen. Toinen voi liittyä Katsotaan yhdessä -sessioihin vieraana 6-kirjaimisella koodilla. Molemmilla tileillä saat kuitenkin pääsyn täyteen pariraporttiin ja makuyhteensopivuusominaisuuksiin.",
  },
];

export default function CoupleStreakPage() {
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
              { "@type": "ListItem", position: 2, name: "Katsotaan yhdessä", item: "https://logflix.app/fi/watch-together" },
              { "@type": "ListItem", position: 3, name: "Pariputki", item: "https://logflix.app/fi/couple-streak" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Logflix Pariputki",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/fi/couple-streak`,
            featureList: [
              "Viikoittainen match-putken seuranta",
              "Pelillistetyt palkinnot",
              "Kuratoidut opasavaukset",
              "Jäädytetty putki tauolla",
            ],
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "NOK",
              description: "Logflix Premium",
            },
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
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      <SeoGuideLayout
        locale="no"
        h1="Pariputki — Pidä elokuvailtoja yllä"
        heroSubtitle="Matchatkaa elokuvaan joka viikko. Rakentakaa putkenne. Avatkaa eksklusiivisia palkintoja."
        ctaText="Aloita Katsotaan yhdessä — ilmaiseksi"
        trustLine="Yksi match viikossa · Palkinnot 4, 8 ja 12 viikon kohdalla · Putki jäätyy tauolla"
        relatedLinks={[
          { href: "/together", label: "Aloita Katsotaan yhdessä nyt" },
          { href: "/fi/watch-together", label: "Näin Katsotaan yhdessä toimii" },
          { href: "/fi/taste-profile", label: "Makuprofiilisi" },
          { href: "/fi/wrapped", label: "Logflix Wrapped — elokuvavuotenne" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Mikä on pariputki?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Pariputki seuraa, kuinka monta peräkkäistä viikkoa sinä ja kumppanisi olette
            matchanneet elokuvaan tai sarjaan Katsotaan yhdessä -toiminnossa. Yksi match viikossa
            riittää pitämään putken voimassa. Ohita viikko, ja se nollautuu.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Se kuulostaa yksinkertaiselta — ja sitä se onkin. Mutta yksinkertaisuus on
            tarkoituksellista. Putki antaa teille pienen, toistuvan syyn istua alas yhdessä ja
            valita jotain katsottavaa. Ei painetta ahmimiseen, ei sitoumusta yhtä nimikettä
            viikossa enempää.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Putkenne näkyy Katsotaan yhdessä -aloitusnäytöllä. Kun se on vaarassa
            (alle päivä jäljellä viikosta), näette varoituksen. Se on lempeä muistutus,
            ei ilmoituspommitus.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Palkinnot, joilla on merkitystä
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                weeks: "4",
                title: "Klassikot",
                desc: "Kuratoitu opas must-see-klassikoista, jotka sopivat parinne makuun. Ei mitä tahansa klassikoita — ne, joista todennäköisimmin nautitte katseluhistorianne perusteella.",
              },
              {
                weeks: "8",
                title: "Piilotetut aarteet",
                desc: "Vähemmän tunnettuja nimikkeitä korkeilla arvosanoilla, jotka sopivat yhteisiin mieltymyksiinne. Sellaisia elokuvia, joita ette koskaan löytäisi Netflixiä selaamalla, mutta joista molemmat rakastutte.",
              },
              {
                weeks: "12",
                title: "Viikonloppuvalinta",
                desc: "Premium-tunnelmapohjainen opaskokoelma. Ajattele 'Täydellinen sateiselle sunnuntaille' tai 'Treffi-illan klassikot' — personoitu parinne ainutlaatuiselle makuprofiilille.",
              },
            ].map(({ weeks, title, desc }) => (
              <div
                key={weeks}
                style={{
                  display: "flex",
                  gap: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,42,42,0.12)",
                    color: "#ff2a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {weeks}vk
                </span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            padding: "24px 20px",
            marginBottom: 40,
            background: "rgba(255,42,42,0.04)",
            border: "1px solid rgba(255,42,42,0.15)",
            borderRadius: 14,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Aloita putkenne rakentaminen tänä iltana
          </p>
          <a
            href="/together"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#ff2a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Aloita Katsotaan yhdessä — ilmaiseksi
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            Tiliä ei tarvita pelaamiseen · Putken seuranta vaatii ilmaisen tilin
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Miksi pelillistää elokuvailta?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Useimmat parit ajautuvat kaavaan: purkaus elokuvailtoja, sitten viikkoja tyhjää.
            Putkimekanismi luo kevyen sitoumuksen, joka pitää tavan käynnissä ilman, että
            siitä tulee velvollisuus. Yksi match viikossa on tarpeeksi vaivaton ylläpidettäväksi
            jopa kiireisinä aikoina.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Palkinnot on suunniteltu ruokkimaan kokemusta takaisin. Kuratoidun oppaan avaaminen
            antaa teille uusia nimikkeitä tutkittavaksi yhdessä, mikä puolestaan tekee seuraavasta
            Katsotaan yhdessä -sessiosta mielenkiintoisemman. Se on positiivinen kierre: katsokaa
            yhdessä, avatkaa sisältöä, löytäkää lisää, katsokaa yhdessä uudelleen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
