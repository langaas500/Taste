import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Hva skal vi se i kveld? | Finn filmer og serier raskt 2026",
  description:
    "Sliter dere med å bestemme hva dere skal se i kveld? Bruk våre anbefalinger og verktøy for å finne den perfekte filmen eller serien på minutter.",
};

export default function HvaSkalViSePage() {
  return (
    <SeoGuideLayout
      h1="Hva skal vi se i kveld?"
      heroSubtitle="Slutt å bruke timer på å velge. Finn filmer og serier som passer for alle på rekordtid."
    >
      <ContentSection title="Populære valg akkurat nå">
        <RecommendationCard
          title="[Placeholder: Populær serie denne uken]"
          description="Alle snakker om denne serien. Perfekt blanding av drama, humor og spenning som engasjerer fra første episode."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Ny blockbuster-film]"
          description="Storslått underholdning med spektakulær handling og visuelt imponerende scener. Garantert å holde alle engasjert."
          streamingServices={["Disney+", "Apple TV+"]}
        />
        <RecommendationCard
          title="[Placeholder: Familie-vennlig alternativ]"
          description="Noe alle i familien kan nyte sammen. Morsomt, hjertevarmt og med universell appell."
          streamingServices={["Netflix", "Viaplay"]}
        />
      </ContentSection>

      <MidPageCta
        title="Slutt å kaste bort tid på å velge"
        subtitle="Se Sammen lar dere swipe gjennom alternativer og matcher det dere begge vil se på minutter."
      />

      <ContentSection title="Ulike stemninger for ulike kvelder">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Avslappende kvelder
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Anbefalinger for lett underholdning, komedier og feel-good innhold.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Spennende kvelder
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Thrillere, action og spenningsserier som holder dere på kanten av stolen.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Dype diskusjoner
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Drama og dokumentarer som gir mye å snakke om etterpå.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Romantiske kvelder
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Romantiske filmer og serier perfekt for datekveld.]
            </p>
          </div>
        </div>
      </ContentSection>

      <FaqSection
        items={[
          {
            question: "Hvorfor bruker vi så lang tid på å velge?",
            answer:
              "[Placeholder: Forklare beslutningsparalyse og hvordan for mange valg gjør det vanskelig å velge.]",
          },
          {
            question: "Hvordan kan Se Sammen hjelpe oss?",
            answer:
              "[Placeholder: Forklare hvordan Se Sammen reduserer valgene til det dere faktisk vil se.]",
          },
          {
            question: "Fungerer det hvis vi liker ulike sjangre?",
            answer:
              "[Placeholder: Forklare at Se Sammen finner overlappende smak selv når preferansene er forskjellige.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
