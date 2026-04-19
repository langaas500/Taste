import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Logflix Wrapped — Vuoden elokuvat parina | Logflix",
  description:
    "Näe kaikki, mitä katsoitte yhdessä tänä vuonna. Suosikkigenret, eniten matchatut elokuvat, yhteensopivuuspistemäärä ja paljon muuta. Jaa pari-Wrappedisi.",
  alternates: {
    canonical: `${BASE}/fi/wrapped`,
    languages: {
      nb: `${BASE}/no/wrapped`,
      sv: `${BASE}/se/wrapped`,
      da: `${BASE}/dk/wrapped`,
      fi: `${BASE}/fi/wrapped`,
      en: `${BASE}/en/wrapped`,
      "x-default": `${BASE}/en/wrapped`,
    },
  },
  openGraph: {
    title: "Logflix Wrapped — Vuoden elokuvat parina | Logflix",
    description:
      "Näe kaikki, mitä katsoitte yhdessä tänä vuonna. Suosikkigenret, eniten matchatut elokuvat, yhteensopivuuspistemäärä ja paljon muuta.",
    url: `${BASE}/fi/wrapped`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Milloin Logflix Wrapped on saatavilla?",
    answer:
      "Logflix luo kuukausittaisen Wrapped-raportin jokaisen kuukauden lopussa ja täyden vuosittaisen Wrappedin joulukuussa. Kuukausiraportit ovat saatavilla heti kuukauden päätyttyä. Vuosittainen Wrapped kattaa tammikuusta joulukuuhun ja sisältää parinne täyden katselumatkan.",
  },
  {
    question: "Voinko jakaa Wrappedini?",
    answer:
      "Kyllä. Jokainen Wrapped-raportti voidaan jakaa jaettavana kuvana — kuten Spotify Wrapped. Voit julkaista sen Instagram Storiesissa, lähettää sen ryhmäkeskusteluun tai tallentaa sen kamerarullaasi. Kuva sisältää tärkeimmät tilastosi paljastamatta yksityisiä katselutietoja.",
  },
  {
    question: "Tarvitsevatko molemmat kumppanit tilit pari-Wrappedia varten?",
    answer:
      "Parikohtaiset tilastot (yhteensopivuuspistemäärä, yhteiset suosikit, genrepäällekkäisyys) vaativat, että molemmilla kumppaneilla on Logflix-tilit. Yksilöllinen Wrapped toimii yhdellä tilillä. Vieraspyyhkäisyt Katsotaan yhdessä -toiminnossa seurataan, mutta ne liitetään sessioon, ei profiiliin.",
  },
  {
    question: "Onko Wrapped ilmainen?",
    answer:
      "Kuukausittainen Wrapped on saatavilla kaikille käyttäjille ilmaisella tilillä. Täysi vuosittainen Wrapped parikohtaisilla näkemyksillä, yksityiskohtaisella tekoälyanalyysillä ja jaettavilla tarina-korteilla on premium-ominaisuus, joka sisältyy Logflix Premiumiin hintaan 29 NOK/kk.",
  },
];

export default function WrappedPage() {
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
              { "@type": "ListItem", position: 3, name: "Wrapped", item: "https://logflix.app/fi/wrapped" },
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
            name: "Logflix Wrapped",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/fi/wrapped`,
            featureList: [
              "Kuukausittaiset katseluraportit",
              "Vuosittainen pari-Wrapped",
              "Jaettavat tarina-kortit",
              "Makuyhteensopivuuspistemäärä",
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
        h1="Logflix Wrapped — Elokuvavuotenne parina"
        heroSubtitle="Kaikki, mitä katsoitte yhdessä, yhdessä kauniissa raportissa. Suosikkigenret, eniten matchatut elokuvat, yhteensopivuuspistemäärä ja jaettavat tarina-kortit."
        ctaText="Hanki Logflix Premium"
        trustLine="Kuukausittaiset + vuosittaiset raportit · Jaettavissa kuvina · Paritilastot mukana"
        relatedLinks={[
          { href: "/together", label: "Aloita Katsotaan yhdessä — ilmaiseksi" },
          { href: "/fi/watch-together", label: "Näin Katsotaan yhdessä toimii" },
          { href: "/fi/taste-profile", label: "Makuprofiilisi" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Mikä on Logflix Wrapped?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Logflix Wrapped on katseluvuotenne katsauksessa. Se ottaa kaiken, mitä sinä ja
            kumppanisi katsoitte — jokaisen kirjatun elokuvan, jokaisen loppuun katsotun sarjan,
            jokaisen Katsotaan yhdessä -matchin — ja muuttaa sen visuaaliseksi raportiksi,
            jota voitte selata ja jakaa.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Ajattele Spotify Wrappedia, mutta elokuville. Näette suosikkigenrenne, elokuvat,
            joihin matchasitte nopeimmin, eniten katsotut ohjaajanne ja makuyhteensopivuus-
            pistemäärän, joka näyttää, kuinka hyvin mieltymyksenne todella kohtaavat.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Kuukausittainen Wrapped julkaistaan jokaisen kuukauden lopussa pikayhteenvedolla.
            Täysi vuosittainen Wrapped saapuu joulukuussa syvemmillä näkemyksillä,
            tekoälyn tuottamilla kommenteilla ja jaettavilla tarina-korteilla, jotka on
            suunniteltu Instagramiin ja ryhmäkeskusteluihin.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Mitä Wrappedisi sisältää
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "🎬",
                title: "Nimikkeet yhteensä",
                desc: "Kuinka monta elokuvaa ja sarjaa katsoitte tässä kuussa tai vuonna. Jaoteltuna tyypin, sentimentin ja genren mukaan.",
              },
              {
                icon: "🏆",
                title: "Parhaat matchit",
                desc: "Elokuvat, joista sinä ja kumppanisi tykkäsitte nopeimmin Katsotaan yhdessä -toiminnossa. Nopeimmat yhteiset päätöksenne.",
              },
              {
                icon: "💑",
                title: "Yhteensopivuus",
                desc: "Makuyhteensopivuuspistemääränne — genrepäällekkäisyys, yhteiset suosikit ja missä erotatte.",
              },
              {
                icon: "📊",
                title: "Genrekartta",
                desc: "Visuaalinen erittely siitä, mitkä genret hallitsivat katseluanne. Näe trendit kuukausien yli.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 14px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>
                  {desc}
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
            Aloita elokuvavuotenne seuraaminen
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
            Hanki Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 NOK/kk · Kumppanisi saa sen ilmaiseksi
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Jaa Wrappedisi
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Jokainen Wrapped-raportti luo jaettavia tarina-kortteja — suunniteltu Instagram
            Storiesiin, WhatsAppiin ja ryhmäkeskusteluihin. Kortit näyttävät tärkeimmät
            tilastonne (nimikkeet yhteensä, suosikkigenre, yhteensopivuuspistemäärä) visuaalisesti
            näyttävässä muodossa paljastamatta täyttä katseluhistoriaanne.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Jakaminen on vapaaehtoista, mutta se on hauska tapa vertailla elokuvatottumuksia
            ystävien kanssa. Parit huomaavat usein katsovansa paljon enemmän — tai paljon
            vähemmän — kuin luulivat. Wrapped-muoto tekee helpoksi juhlia vuoden elokuvailtoja
            yhdessä.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
