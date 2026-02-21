import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movies for Date Night | Best Romantic Movies 2026",
  description:
    "Planning a date night? Here are the best movies perfect for a romantic evening at home with your partner.",
};

export default function MoviesForDateNightPage() {
  return (
    <SeoGuideLayout
      h1="Movies for Date Night"
      heroSubtitle="Find the perfect movie for a romantic evening at home. From heartwarming comedies to passionate dramas."
      ctaText="Start Watch Together"
      trustLine="Free · Under 3 minutes · No registration required"
    >
      <ContentSection title="Perfect for Date Night">
        <RecommendationCard
          title="[Placeholder: Romantic Comedy]"
          description="Charming and witty romance that sets the perfect mood. Light-hearted fun with genuine emotional moments."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Passionate Drama]"
          description="Intense and moving love story that sparks conversation. Beautiful cinematography and powerful performances."
          streamingServices={["Disney+", "Hulu"]}
        />
        <RecommendationCard
          title="[Placeholder: Feel-Good Romance]"
          description="Uplifting and sweet story that leaves you feeling warm inside. Perfect for a cozy night together."
          streamingServices={["Netflix", "Apple TV+"]}
        />
      </ContentSection>

      <MidPageCta
        title="Want to find the perfect date night movie?"
        subtitle="With Watch Together, you can match your tastes and discover romantic movies you'll both love in minutes."
        ctaText="Start Watch Together"
      />

      <ContentSection title="Creating the Perfect Movie Date Night">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Set the Mood
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Tips for creating a romantic atmosphere – lighting, snacks, comfort.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Choose Together
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Explain the importance of both partners having input in the movie selection.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Pick the Right Length
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Consider timing – not too long for a weeknight, substantial enough for a special evening.]
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Best Genres for Date Night">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rom-Com</h3>
            <p className="text-sm text-gray-700">
              Light, funny, and heartwarming – classic date night choice
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Romance Drama</h3>
            <p className="text-sm text-gray-700">
              Deep emotional connection and beautiful storytelling
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Action Romance</h3>
            <p className="text-sm text-gray-700">
              Adventure and romance combined for exciting viewing
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Classic Romance</h3>
            <p className="text-sm text-gray-700">
              Timeless love stories that never get old
            </p>
          </div>
        </div>
      </ContentSection>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What makes a good date night movie?",
            answer:
              "[Placeholder: Discuss chemistry, pacing, and emotional engagement that works for couples.]",
          },
          {
            question: "Should we watch a new release or a classic?",
            answer:
              "[Placeholder: Pros and cons of new movies vs. beloved classics for date night.]",
          },
          {
            question: "How do we avoid picking a boring movie?",
            answer:
              "[Placeholder: Explain how Watch Together helps filter for engaging, mutually appealing content.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
