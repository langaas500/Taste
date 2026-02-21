import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Film å se med kjæresten | De beste romantiske filmene 2026",
  description:
    "Leter du etter gode filmer å se med kjæresten? Her er våre anbefalinger for romantiske filmer som passer perfekt til en koselig kveld.",
};

export default function FilmMedKjaerestenPage() {
  return (
    <SeoGuideLayout
      h1="Film å se med kjæresten"
      heroSubtitle="Finn den perfekte filmen for en koselig kveld med din bedre halvdel. Fra romantiske komedier til gripende dramaer."
    >
      <ContentSection title="Våre topp anbefalinger">
        <RecommendationCard
          title="[Placeholder: Romantisk komedie]"
          description="En herlig blanding av humor og hjerte. Perfekt for en avslappet kveld der dere vil le sammen og føle varmen."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Romantisk drama]"
          description="En vakker historie som utforsker kjærlighet og relasjonskompleksitet med fantastisk skuespill og cinematografi."
          streamingServices={["Disney+", "Viaplay"]}
        />
        <RecommendationCard
          title="[Placeholder: Klassisk romantikk]"
          description="Tidløs historie om kjærlighet som har rørt hjerter i generasjoner. En film dere kan se om og om igjen."
          streamingServices={["Netflix"]}
        />
      </ContentSection>

      <MidPageCta
        title="Vil dere finne filmer dere begge elsker?"
        subtitle="Med Se Sammen kan dere matche filmsmaken deres og finne den perfekte filmen på under 3 minutter."
      />

      <ContentSection title="Hvordan velge riktig film?">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Tips for å velge film sammen. Diskuter sjanger, stemning, lengde og hva dere begge liker.]
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Forklare hvordan Se Sammen kan hjelpe med å finne filmer dere begge vil like.]
          </p>
        </div>
      </ContentSection>

      <FaqSection
        items={[
          {
            question: "Hva er de beste romantiske filmene på Netflix Norge?",
            answer:
              "[Placeholder: Svar om populære romantiske filmer tilgjengelig på Netflix i Norge.]",
          },
          {
            question: "Hvordan finner vi en film vi begge liker?",
            answer:
              "[Placeholder: Forklare Se Sammen-funksjonen og hvordan den hjelper par med å matche filmsmak.]",
          },
          {
            question: "Hvor lang tid tar det å finne en god film?",
            answer:
              "[Placeholder: Forklare at med Se Sammen tar det under 3 minutter å finne en match.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
