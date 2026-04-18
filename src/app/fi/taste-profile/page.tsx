import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Makuprofiili — Löydä elokuvapersoona | Logflix",
  description:
    "Makuprofiilisi näyttää suosikkigenresi, ohjaajasi ja miten makusi vertautuu kumppanisi makuun. Perustuu katseluhistoriaasi.",
  alternates: {
    canonical: `${BASE}/fi/taste-profile`,
    languages: {
      nb: `${BASE}/no/taste-profile`,
      sv: `${BASE}/se/taste-profile`,
      da: `${BASE}/dk/taste-profile`,
      fi: `${BASE}/fi/taste-profile`,
      en: `${BASE}/en/taste-profile`,
      "x-default": `${BASE}/en/taste-profile`,
    },
  },
  openGraph: {
    title: "Makuprofiili — Löydä elokuvapersoona | Logflix",
    description:
      "Makuprofiilisi näyttää suosikkigenresi, ohjaajasi ja miten makusi vertautuu kumppanisi makuun.",
    url: `${BASE}/fi/taste-profile`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Miten makuprofiilini luodaan?",
    answer:
      "Makuprofiilisi rakentuu automaattisesti katseluhistoriasi perusteella — jokainen kirjaamasi, arvioimasi tai Katsotaan yhdessä -toiminnossa pyyhkäisemäsi elokuva ja sarja. Mitä enemmän kirjaat, sitä tarkempi profiilista tulee. Logflix käyttää tekoälyä analysoidakseen katselutottumustesi malleja ja tunnistaakseen suosikkigenresi, tempon, tunnelman ja jopa toistuvat ohjaajat tai näyttelijät.",
  },
  {
    question: "Voinko nähdä, miten makuni vertautuu kumppanini makuun?",
    answer:
      "Kyllä. Jos sinulla ja kumppanillasi on Logflix-tilit, makuprofiili sisältää makuyhteensopivuuspistemäärän. Se näyttää, missä mieltymyksenne menevät päällekkäin — yhteiset suosikkigenret, molemminpuoliset sokeat pisteet ja alueet, joilla erotatte toisistanne. Tämä on erityisen hyödyllistä elokuvailtojen suunnittelussa.",
  },
  {
    question: "Onko makuprofiili ilmainen?",
    answer:
      "Saat sumeana esikatselun makuprofiilistasi ilmaiseksi. Täysi profiili — mukaan lukien genrejaottelu, yhteensopivuuspistemäärä ja yksityiskohtainen tekoälyanalyysi — on saatavilla Logflix Premiumilla hintaan 29 NOK/kk. Kumppanisi saa premium-käyttöoikeuden ilmaiseksi.",
  },
  {
    question: "Kuinka usein makuprofiilini päivittyy?",
    answer:
      "Profiilisi päivittyy joka kerta, kun kirjaat uuden nimikkeen, arvioit jotain tai suoritat Katsotaan yhdessä -session loppuun. Tekoäly analysoi mallejasi uudelleen säännöllisesti pitääkseen näkemykset tuoreina ja tarkkoina.",
  },
];

export default function TasteProfilePage() {
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
              { "@type": "ListItem", position: 3, name: "Makuprofiili", item: "https://logflix.app/fi/taste-profile" },
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
            name: "Logflix Makuprofiili",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/fi/taste-profile`,
            featureList: [
              "Tekoälypohjainen makuanalyysi",
              "Genrejaottelu",
              "Parin yhteensopivuuspistemäärä",
              "Ohjaaja- ja näyttelijämieltymykset",
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
        h1="Elokuvamakuprofiilisi"
        heroSubtitle="Löydä elokuvapersoonasi. Näe suosikkigenresi, suosimasi tunnelma ja miten makusi vertautuu kumppanisi makuun."
        ctaText="Hanki Logflix Premium"
        trustLine="Tekoälypohjainen · Päivittyy automaattisesti · Kumppanivertailu mukana"
        relatedLinks={[
          { href: "/together", label: "Aloita Katsotaan yhdessä — ilmaiseksi" },
          { href: "/fi/watch-together", label: "Näin Katsotaan yhdessä toimii" },
          { href: "/fi/couple-streak", label: "Pariputki — jatka matchaamista" },
          { href: "/fi/wrapped", label: "Logflix Wrapped — elokuvavuotenne" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Mikä on makuprofiili?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Makuprofiilisi on tekoälyn luoma erittely elokuva- ja sarjamieltymyksistäsi.
            Se menee yksinkertaista suosikkilistaa pidemmälle — se kartoittaa genret, joita kohti
            gravitoit, suosimasi tunnelman ja tempon sekä ohjaajat ja näyttelijät, jotka
            toistuvasti esiintyvät katseluhistoriassasi.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Ajattele sitä persoonallisuustestinä, mutta elokuville. Kysymyksiin vastaamisen sijaan
            katsot vain sitä, mitä normaalisti katsot. Logflix tekee analyysin taustalla käyttäen
            jokaista kirjaamaasi nimikettä, jokaista Katsotaan yhdessä -pyyhkäisyä ja jokaista
            antamaasi arvosanaa.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Tuloksena on kolme osiota: &ldquo;Pidät&rdquo; (genret ja teemat, joista
            johdonmukaisesti nautit), &ldquo;Vältät&rdquo; (mallit, jotka tyypillisesti ohitat),
            ja &ldquo;Tempo &amp; Tunnelma&rdquo; (kallistutko nopeatempoisen toiminnan vai
            hitaasti etenevien henkilötutkielmien puoleen).
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Parin yhteensopivuus
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Jos kumppanisi käyttää myös Logflixiä, makuprofiili sisältää yhteensopivuusanalyysin.
            Näet, missä makunne menevät päällekkäin — yhteinen rakkaus trillereihin,
            molemminpuolinen kiinnostuksen puute romanttisiin komedioihin tai se yksi genre,
            josta olette täysin eri mieltä.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Tämä ei ole vain hauska tilasto. Yhteensopivuusdata syöttää suoraan Katsotaan yhdessä
            -toimintoon ja tekoälykuraattoriin, tehden suosituksista älykkäämpiä teille
            molemmille. Mitä enemmän katselette ja kirjaatte, sitä paremmin Logflix ymmärtää,
            mikä toimii juuri teidän paridynamiikallenne.
          </p>
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
            Löydä elokuvapersoonasi
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
            Näin se rakentuu
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Profiilisi alkaa rakentua heti, kun kirjaat ensimmäisen nimikkeesi. Tuo Netflix-
            historiasi tai Trakt.tv-kirjastosi käynnistääksesi sen sadoilla datapisteillä. Jokainen
            Katsotaan yhdessä -pyyhkäisy, jokainen arvosana ja jokainen katselulistalle
            lisääminen edistää tarkempaa kuvaa.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Logflix käyttää Claude-tekoälyä tunnistaakseen malleja, jotka menevät yksinkertaista
            genrelaskentaa pidemmälle. Se tarkastelee teemoja, ohjaajafilmografioita,
            julkaisukausia ja jopa sitä, kuinka nopeasti päätit nimikkeestä Katsotaan yhdessä
            -toiminnossa. Elokuva, jolle annoit supertykkäyksen 2 sekunnissa, kertoo jotain
            eri asiaa kuin se, jota epäröit 15 sekuntia.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
