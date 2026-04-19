import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Logflix Wrapped — Årets filmer som par | Logflix",
  description:
    "Se alt dere har sett sammen dette året. Toppsjangre, mest matchede filmer, kompatibilitetsscore og mer. Del din par-Wrapped.",
  alternates: {
    canonical: `${BASE}/no/wrapped`,
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
    title: "Logflix Wrapped — Årets filmer som par | Logflix",
    description:
      "Se alt dere har sett sammen dette året. Toppsjangre, mest matchede filmer, kompatibilitetsscore og mer.",
    url: `${BASE}/no/wrapped`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Når er Logflix Wrapped tilgjengelig?",
    answer:
      "Logflix genererer en månedlig Wrapped-rapport ved slutten av hver måned, og en full årlig Wrapped i desember. Månedlige rapporter er tilgjengelige så snart måneden er over. Den årlige Wrapped dekker januar til desember og inkluderer parets fulle seerreise.",
  },
  {
    question: "Kan jeg dele min Wrapped?",
    answer:
      "Ja. Hver Wrapped-rapport kan deles som et bilde — likt Spotify Wrapped. Du kan poste det på Instagram Stories, sende det i en gruppechat eller lagre det til kamerarullen. Bildet viser toppstatistikken din uten å avsløre privat seerdata.",
  },
  {
    question: "Trenger begge partnere konto for par-Wrapped?",
    answer:
      "De parspesifikke statistikkene (kompatibilitetsscore, felles favoritter, sjangeroverlapp) krever at begge partnere har Logflix-kontoer. Individuell Wrapped fungerer med en enkelt konto. Gjestesveip i Se Sammen spores, men knyttes til økten, ikke en profil.",
  },
  {
    question: "Er Wrapped gratis?",
    answer:
      "Månedlig Wrapped er tilgjengelig for alle brukere med en gratis konto. Den fullstendige årlige Wrapped med parspesifikke innsikter, detaljert AI-analyse og delbare historiekort er en premiumfunksjon inkludert med Logflix Premium til 29 kr/mnd.",
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
              { "@type": "ListItem", position: 2, name: "Se Sammen", item: "https://logflix.app/together" },
              { "@type": "ListItem", position: 3, name: "Wrapped", item: "https://logflix.app/no/wrapped" },
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
            url: `${BASE}/no/wrapped`,
            featureList: [
              "Månedlige seerrapporter",
              "Årlig par-Wrapped",
              "Delbare historiekort",
              "Smakskompatibilitetsscore",
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
        h1="Logflix Wrapped — Filmåret deres som par"
        heroSubtitle="Alt dere har sett sammen i én vakker rapport. Toppsjangre, mest matchede filmer, kompatibilitetsscore og delbare kort."
        ctaText="Prøv Logflix Premium"
        trustLine="Månedlige + årlige rapporter · Delbare som bilder · Parstatistikk inkludert"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen — gratis" },
          { href: "/no/taste-profile", label: "Din smaksprofil" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hva er Logflix Wrapped?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Logflix Wrapped er seeråret ditt i tilbakeblikk. Den tar alt du og partneren din
            har sett — hver film logget, hver serie fullført, hver Se Sammen-match — og
            gjør det om til en visuell rapport du kan bla gjennom og dele.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tenk Spotify Wrapped, men for filmer. Du ser toppsjangre, filmene dere matchet
            raskest på, mest sette regissører og en smakskompatibilitetsscore som viser hvor
            samstemte preferansene deres egentlig er.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Månedlig Wrapped kommer ved slutten av hver måned med et kjapt sammendrag. Den
            fullstendige årlige Wrapped kommer i desember med dypere innsikter, AI-generert
            kommentar og delbare historiekort designet for Instagram og gruppechatter.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hva inneholder Wrapped
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                icon: "\uD83C\uDFAC",
                title: "Totale titler",
                desc: "Hvor mange filmer og serier dere har sett denne måneden eller dette året. Fordelt på type, sentiment og sjanger.",
              },
              {
                icon: "\uD83C\uDFC6",
                title: "Toppmatcher",
                desc: "Filmene dere begge likte raskest i Se Sammen. De raskeste felles beslutningene deres.",
              },
              {
                icon: "\uD83D\uDC91",
                title: "Kompatibilitet",
                desc: "Smakskompatibilitetsscore — sjangeroverlapp, felles favoritter og der dere skiller lag.",
              },
              {
                icon: "\uD83D\uDCCA",
                title: "Sjangerkart",
                desc: "En visuell oversikt over hvilke sjangre som dominerte seingen deres. Se trender over måneder.",
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
            Start å spore filmåret ditt
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
            Prøv Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 kr/mnd · Partneren din får det gratis
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Del din Wrapped
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Hver Wrapped-rapport genererer delbare historiekort — designet for Instagram Stories,
            WhatsApp og gruppechatter. Kortene viser hovedstatistikken din (totale titler,
            toppsjanger, kompatibilitetsscore) i et visuelt slående format uten å avsløre
            hele seerhistorikken.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Deling er valgfritt, men det er en morsom måte å sammenligne filmvaner med venner.
            Par oppdager ofte at de ser langt mer — eller langt mindre — enn de trodde. Wrapped-
            formatet gjør det enkelt å feire et år med filmkvelder sammen.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
