import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Serie å se sammen 2026 | Beste serier for par og venner",
  description:
    "Leter du etter gode serier å se sammen? Finn de beste seriene som passer perfekt for å binge med kjæresten, venner eller familien.",
};

export default function SerieASeSammenPage() {
  return (
    <SeoGuideLayout
      h1="Serie å se sammen"
      heroSubtitle="Finn serier som holder alle engasjert episode etter episode. Perfekt for binge-kvelder sammen."
    >
      <ContentSection title="Populære serier å se sammen">
        <RecommendationCard
          title="[Placeholder: Dramaserien alle snakker om]"
          description="Komplekst plot, fengende karakterer og twists som holder dere på kanten av stolen. Perfekt for dype diskusjoner."
          streamingServices={["HBO Max", "Netflix"]}
        />
        <RecommendationCard
          title="[Placeholder: Feel-good komedie]"
          description="Lett, morsom og hjertevarmt. En serie dere kan slappe av til uten å tenke for mye, men som likevel engasjerer."
          streamingServices={["Netflix", "Disney+"]}
        />
        <RecommendationCard
          title="[Placeholder: Spennende thriller]"
          description="Mysterie og spenning som får dere til å se bare én episode til. Vanskelig å slutte når det først har startet."
          streamingServices={["Viaplay", "Apple TV+"]}
        />
      </ContentSection>

      <MidPageCta
        title="Sliter dere med å finne en serie å starte på?"
        subtitle="Med Se Sammen kan dere swipe gjennom serier og finne noe dere faktisk vil binge sammen."
      />

      <ContentSection title="Hvorfor serier er perfekt å se sammen">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Delt opplevelse over tid
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Forklare hvordan serier skaper felles referanser og noe å se frem til sammen.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Ingen beslutning hver kveld
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Beskrive fordelen med å ha en serie på gang – dere vet alltid hva dere skal se.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Karakterutvikling og dybde
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Forklare hvordan serier gir mer tid til å utvikle karakterer og historier enn filmer.]
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Sjangre som fungerer best">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drama</h3>
            <p className="text-sm text-gray-700">
              Komplekse historier og karakterer som gir mye å diskutere
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Komedie</h3>
            <p className="text-sm text-gray-700">
              Lett og morsomt – perfekt for avslappende kvelder
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thriller</h3>
            <p className="text-sm text-gray-700">
              Spenning og mysterier som holder dere engasjert
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sci-Fi</h3>
            <p className="text-sm text-gray-700">
              Fantasifulle verdener og tankevekkende konsepter
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">True Crime</h3>
            <p className="text-sm text-gray-700">
              Virkelige historier som fascinerer og engasjerer
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fantasy</h3>
            <p className="text-sm text-gray-700">
              Episke eventyr i magiske verdener
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Tips for å velge riktig serie">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Råd om å velge serie basert på lengde, kompleksitet og felles interesser.]
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Forklare fordelen med å bruke Se Sammen for å finne serier dere begge vil like.]
          </p>
        </div>
      </ContentSection>

      <FaqSection
        items={[
          {
            question: "Hva er de beste seriene å se sammen akkurat nå?",
            answer:
              "[Placeholder: Oversikt over populære serier på tvers av strømmetjenester i Norge.]",
          },
          {
            question: "Hvordan unngår vi å se forskjellige episoder?",
            answer:
              "[Placeholder: Tips om å lage en 'ikke se uten meg'-avtale og bruke strømmetjenestenes profiler.]",
          },
          {
            question: "Hvor mange episoder bør vi se om gangen?",
            answer:
              "[Placeholder: Diskutere binge-strategier og fordeler med å ikke se for mange episoder på én gang.]",
          },
          {
            question: "Hva gjør vi hvis vi ikke liker samme serier?",
            answer:
              "[Placeholder: Forklare hvordan Se Sammen hjelper med å finne overlappende smak.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
