import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "What Should We Watch Tonight? | Find Movies & Shows Fast 2026",
  description:
    "Struggling to decide what to watch tonight? Use our recommendations and tools to find the perfect movie or show in minutes.",
};

export default function WhatToWatchPage() {
  return (
    <SeoGuideLayout
      h1="What Should We Watch Tonight?"
      heroSubtitle="Stop spending hours deciding. Find movies and shows everyone will enjoy in record time."
      ctaText="Start Watch Together"
      trustLine="Free · Under 3 minutes · No registration required"
    >
      <ContentSection title="Popular Choices Right Now">
        <RecommendationCard
          title="[Placeholder: Popular Series This Week]"
          description="Everyone's talking about this series. Perfect blend of drama, humor, and suspense that hooks you from the first episode."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: New Blockbuster Movie]"
          description="Epic entertainment with spectacular action and visually stunning scenes. Guaranteed to keep everyone engaged."
          streamingServices={["Disney+", "Apple TV+"]}
        />
        <RecommendationCard
          title="[Placeholder: Family-Friendly Option]"
          description="Something the whole family can enjoy together. Fun, heartwarming, and universally appealing."
          streamingServices={["Netflix", "Hulu"]}
        />
      </ContentSection>

      <MidPageCta
        title="Stop Wasting Time Choosing"
        subtitle="Watch Together lets you swipe through options and matches what you both want to watch in minutes."
        ctaText="Start Watch Together"
      />

      <ContentSection title="Different Moods for Different Nights">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Relaxing Evenings
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Recommendations for light entertainment, comedies, and feel-good content.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Exciting Nights
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Thrillers, action, and suspense series that keep you on the edge of your seat.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Deep Discussions
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Drama and documentaries that give you lots to talk about afterward.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Romantic Evenings
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Romantic movies and series perfect for date night.]
            </p>
          </div>
        </div>
      </ContentSection>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "Why do we spend so long choosing?",
            answer:
              "[Placeholder: Explain decision paralysis and how too many choices make it hard to decide.]",
          },
          {
            question: "How can Watch Together help us?",
            answer:
              "[Placeholder: Explain how Watch Together narrows down choices to what you actually want to watch.]",
          },
          {
            question: "Does it work if we like different genres?",
            answer:
              "[Placeholder: Explain that Watch Together finds overlapping taste even when preferences differ.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
