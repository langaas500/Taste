import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Romantiske filmer på Netflix Norge 2026 | Beste romcom",
  description:
    "Oversikt over de beste romantiske filmene tilgjengelig på Netflix Norge. Fra romantiske komedier til gripende kjærlighetshistorier.",
};

export default function RomantiskeFilmerNetflixPage() {
  return (
    <SeoGuideLayout
      h1="Romantiske filmer på Netflix Norge"
      heroSubtitle="Finn de beste romantiske filmene og seriene tilgjengelig på Netflix. Fra hjertevarme komedier til tidløse kjærlighetshistorier."
    >
      <ContentSection title="Topp romantiske filmer akkurat nå">
        <RecommendationCard
          title="[Placeholder: Romantisk komedie på Netflix]"
          description="En sjarmerende og morsom historie om kjærlighet i moderne tid. Perfekt for en koselig kveld hjemme."
          streamingServices={["Netflix"]}
        />
        <RecommendationCard
          title="[Placeholder: Romantisk drama på Netflix]"
          description="En følelsesladet fortelling som utforsker kjærlighetens kompleksitet med fantastisk skuespill."
          streamingServices={["Netflix"]}
        />
        <RecommendationCard
          title="[Placeholder: Feel-good romantikk på Netflix]"
          description="Lett, morsom og hjertevarmt. Garantert å sette deg i godt humør og gi deg troen på kjærligheten."
          streamingServices={["Netflix"]}
        />
      </ContentSection>

      <MidPageCta
        title="Vil dere finne romantiske filmer dere begge vil se?"
        subtitle="Bruk Se Sammen til å matche filmsmaken deres og finne den perfekte romantiske filmen på minutter."
      />

      <ContentSection title="Ulike typer romantiske filmer">
        <div className="space-y-6">
          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Romantiske komedier (Rom-com)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              [Placeholder: Forklare hva som kjennetegner gode rom-coms og hvorfor de er populære på Netflix.]
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Lett og morsomt
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Happy ending
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Feelgood
              </span>
            </div>
          </article>

          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Romantiske dramaer
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              [Placeholder: Beskrive romantiske dramaer som utforsker dypere følelser og komplekse relasjoner.]
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Dyptgående
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Følelsesladet
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Realistisk
              </span>
            </div>
          </article>

          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Teenage romance
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              [Placeholder: Forklare ungdomsromantikk som fanger første kjærlighet og coming-of-age temaer.]
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Ungdommelig
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Nostalgisk
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Lett å like
              </span>
            </div>
          </article>
        </div>
      </ContentSection>

      <ContentSection title="Hva gjør en romantisk film god?">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Diskutere elementer som god kjemi mellom skuespillere, troverdige karakterer, engasjerende plot.]
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Forklare hvordan Netflix-algoritmen anbefaler romantiske filmer basert på seerhistorikk.]
          </p>
        </div>
      </ContentSection>

      <FaqSection
        items={[
          {
            question: "Hvilke romantiske filmer er best på Netflix Norge?",
            answer:
              "[Placeholder: Liste opp populære titler og hvorfor de er verdt å se.]",
          },
          {
            question: "Kommer det nye romantiske filmer på Netflix?",
            answer:
              "[Placeholder: Forklare at Netflix oppdaterer biblioteket regelmessig med nye romantiske titler.]",
          },
          {
            question: "Hvordan finner jeg romantiske filmer jeg vil like?",
            answer:
              "[Placeholder: Forklare Se Sammen og hvordan den hjelper med å finne filmer tilpasset din smak.]",
          },
          {
            question: "Er det romantiske serier på Netflix også?",
            answer:
              "[Placeholder: Bekrefte at Netflix har både filmer og serier i romantikk-sjangeren.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
