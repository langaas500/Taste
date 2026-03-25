import type { Metadata } from "next";
import SeoGuideLayout, { FaqSection } from "@/components/SeoGuideLayout";

const BASE = "https://logflix.app";

export const metadata: Metadata = {
  title: "Smagsprofil — Opdag din filmpersonlighed | Logflix",
  description:
    "Din smagsprofil viser dine favoritgenrer, instruktører og hvordan din smag sammenlignes med din partners. Baseret på din seerhistorik.",
  alternates: {
    canonical: `${BASE}/dk/taste-profile`,
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
    title: "Smagsprofil — Opdag din filmpersonlighed | Logflix",
    description:
      "Din smagsprofil viser dine favoritgenrer, instruktører og hvordan din smag sammenlignes med din partners.",
    url: `${BASE}/dk/taste-profile`,
    type: "article",
  },
};

const faqItems = [
  {
    question: "Hvordan genereres min smagsprofil?",
    answer:
      "Din smagsprofil bygges automatisk ud fra din seerhistorik — hver film og serie du logger, bedømmer eller swiper på i Se Sammen. Jo mere du logger, jo mere præcis bliver den. Logflix bruger AI til at analysere mønstre i dine seervaner og identificerer dine foretrukne genrer, tempo, tone og endda tilbagevendende instruktører eller skuespillere.",
  },
  {
    question: "Kan jeg se, hvordan min smag sammenlignes med min partners?",
    answer:
      "Ja. Hvis både du og din partner har Logflix-konti, inkluderer smagsprofilen en smagskompatibilitetsscore. Den viser, hvor jeres præferencer overlapper — fælles favoritgenrer, gensidige blinde punkter og områder, hvor I adskiller jer. Det er især nyttigt til at planlægge filmaftener sammen.",
  },
  {
    question: "Er smagsprofilen gratis?",
    answer:
      "Du får en sløret forhåndsvisning af din smagsprofil gratis. Den fulde profil — inklusive genreopdeling, kompatibilitetsscore og detaljeret AI-analyse — er tilgængelig med Logflix Premium til 29 NOK/måned. Din partner får premium-adgang gratis.",
  },
  {
    question: "Hvor ofte opdateres min smagsprofil?",
    answer:
      "Din profil opdateres, hver gang du logger en ny titel, bedømmer noget eller gennemfører en Se Sammen-session. AI'en genanalyserer dine mønstre regelmæssigt for at holde indsigterne friske og præcise.",
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
              { "@type": "ListItem", position: 2, name: "Se Sammen", item: "https://logflix.app/dk/watch-together" },
              { "@type": "ListItem", position: 3, name: "Smagsprofil", item: "https://logflix.app/dk/taste-profile" },
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
            name: "Logflix Smagsprofil",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "Web",
            url: `${BASE}/dk/taste-profile`,
            featureList: [
              "AI-smagsanalyse",
              "Genreopdeling",
              "Par-kompatibilitetsscore",
              "Instruktør- og skuespillerpræferencer",
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
        h1="Din filmsmagsprofil"
        heroSubtitle="Opdag din filmpersonlighed. Se dine favoritgenrer, foretrukne tone og hvordan din smag sammenlignes med din partners."
        ctaText="Få Logflix Premium"
        trustLine="AI-drevet · Opdateres automatisk · Partnersammenligning inkluderet"
        relatedLinks={[
          { href: "/together", label: "Start Se Sammen — gratis" },
          { href: "/dk/watch-together", label: "Sådan fungerer Se Sammen" },
          { href: "/dk/couple-streak", label: "Par-streak — bliv ved med at matche" },
          { href: "/dk/wrapped", label: "Logflix Wrapped — jeres filmår" },
        ]}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Hvad er en smagsprofil?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Din smagsprofil er en AI-genereret opdeling af dine film- og seriepræferencer.
            Den går ud over en simpel favoritliste — den kortlægger de genrer, du tiltrækkes af,
            den tone og det tempo, du foretrækker, og de instruktører og skuespillere, der
            gentagne gange dukker op i din seerhistorik.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Tænk på det som en personlighedstest, men for film. I stedet for at svare på spørgsmål,
            ser du bare det, du normalt ser. Logflix foretager analysen i baggrunden ved hjælp af
            hver titel, du logger, hvert swipe i Se Sammen og hver bedømmelse, du giver.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Resultatet er tre sektioner: &ldquo;Du kan lide&rdquo; (genrer og temaer, du
            konsekvent nyder), &ldquo;Du undgår&rdquo; (mønstre, du typisk springer over), og
            &ldquo;Tempo &amp; Tone&rdquo; (om du hælder mod hurtig action eller
            langsomme karakterstudier).
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Par-kompatibilitet
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Hvis din partner også bruger Logflix, inkluderer smagsprofilen en kompatibilitetsanalyse.
            Du&rsquo;ll se, hvor jeres smag overlapper — fælles kærlighed til thrillere,
            gensidig uinteresse i rom-coms, eller den ene genre, hvor I er helt uenige.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Det er ikke bare en sjov statistik. Kompatibilitetsdataene føder direkte ind i Se Sammen
            og AI-kuratoren, hvilket gør anbefalingerne smartere for jer begge. Jo mere I
            ser og logger, jo bedre forstår Logflix, hvad der fungerer for jeres specifikke
            pardynamik.
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
            Opdag din filmpersonlighed
          </p>
          <a
            href="/premium"
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
            Få Logflix Premium
          </a>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
            29 NOK/måned · Din partner får det gratis
          </p>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
            Sådan bygges den
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
            Din profil begynder at bygge sig op i det øjeblik, du logger din første titel. Importér
            din Netflix-historik eller dit Trakt.tv-bibliotek for at kickstarte den med hundredvis
            af datapunkter. Hvert Se Sammen-swipe, hver bedømmelse og hver tilføjelse til din
            watchlist bidrager til et mere præcist billede.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Logflix bruger Claude AI til at identificere mønstre, der går ud over simpel
            genretælling. Den kigger på temaer, instruktørfilmografier, udgivelsesperioder og
            endda, hvor hurtigt du besluttede dig for en titel i Se Sammen. En film, du
            super-likede på 2 sekunder, siger noget andet end en, du tøvede med i 15.
          </p>
        </section>

        <FaqSection items={faqItems} />
      </SeoGuideLayout>
    </>
  );
}
