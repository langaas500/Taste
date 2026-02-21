import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Film for filmkveld med venner | Beste gruppefilmer 2026",
  description:
    "Planlegger filmkveld med venner? Her er de beste filmene som passer perfekt for en sosial kveld med vennegjeng.",
};

export default function FilmkveldMedVennerPage() {
  return (
    <SeoGuideLayout
      h1="Film for filmkveld med venner"
      heroSubtitle="Finn filmer som holder hele gjengen underholdt. Fra komedier til action – perfekt for sosiale kvelder."
    >
      <ContentSection title="Perfekt for gruppeunderholdning">
        <RecommendationCard
          title="[Placeholder: Action-komedie]"
          description="Eksplosiv action kombinert med godt humør. Garantert å få alle til å le og holde alle engasjert gjennom hele filmen."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Ensemble-komedie]"
          description="Stort persongalleri og tette dialoger som får hele rommet til å le. Perfekt for en lett og morsom kveld."
          streamingServices={["Disney+", "Viaplay"]}
        />
        <RecommendationCard
          title="[Placeholder: Thriller med twists]"
          description="Hold alle på kanten av stolen med uventede vendinger. Dere vil diskutere plottet lenge etter rulleteksten."
          streamingServices={["Netflix", "Apple TV+"]}
        />
      </ContentSection>

      <MidPageCta
        title="Vil dere finne en film alle liker?"
        subtitle="Med Se Sammen kan hele gruppen swipe gjennom alternativer og finne filmer dere faktisk vil se sammen."
      />

      <ContentSection title="Tips for vellykket filmkveld">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Velg riktig sjanger for gruppen
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Forklare hvordan man velger film basert på gruppens stemning og preferanser.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Unngå for lange eller krevende filmer
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Tips om å velge filmer med riktig lengde og kompleksitet for sosiale settinger.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Ha backup-alternativer klare
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Forklare hvorfor det er smart å ha flere alternativer klare før vennene kommer.]
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Sjangre som fungerer best">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Komedier</h3>
            <p className="text-sm text-gray-700">
              Lett, morsomt og perfekt for gruppelatteren
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Action</h3>
            <p className="text-sm text-gray-700">
              Spektakulær underholdning som holder alle våkne
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thriller</h3>
            <p className="text-sm text-gray-700">
              Spenning og mysterier dere kan diskutere sammen
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sci-Fi</h3>
            <p className="text-sm text-gray-700">
              Visuelt imponerende og tankevekkende
            </p>
          </div>
        </div>
      </ContentSection>

      <FaqSection
        items={[
          {
            question: "Hva er de beste filmene for en stor vennegjeng?",
            answer:
              "[Placeholder: Forklare hva som gjør en film god for grupper – humor, action, lett å følge med.]",
          },
          {
            question: "Hvordan unngår vi å bruke lang tid på å velge?",
            answer:
              "[Placeholder: Forklare Se Sammen-funksjonen der alle kan swipe og finne matches raskt.]",
          },
          {
            question: "Bør vi velge film eller serie?",
            answer:
              "[Placeholder: Diskutere fordeler og ulemper med film vs. serie for sosiale kvelder.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
