import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movie to Watch with Your Girlfriend | Best Romantic Movies 2026",
  description:
    "Looking for the perfect movie to watch with your girlfriend? Here are our top recommendations for romantic movies perfect for a cozy night together.",
};

export default function MovieWithGirlfriendPage() {
  return (
    <SeoGuideLayout
      h1="Movie to Watch with Your Girlfriend"
      heroSubtitle="Find the perfect movie for a cozy night with your significant other. From romantic comedies to heartfelt dramas."
      ctaText="Start Watch Together"
      trustLine="Free · Under 3 minutes · No registration required"
    >
      <ContentSection title="Our Top Recommendations">
        <RecommendationCard
          title="[Placeholder: Romantic Comedy]"
          description="A delightful blend of humor and heart. Perfect for a relaxed evening where you can laugh together and feel the warmth."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Romantic Drama]"
          description="A beautiful story exploring love and relationship complexity with fantastic acting and cinematography."
          streamingServices={["Disney+", "Hulu"]}
        />
        <RecommendationCard
          title="[Placeholder: Classic Romance]"
          description="Timeless love story that has touched hearts for generations. A movie you can watch over and over."
          streamingServices={["Netflix"]}
        />
      </ContentSection>

      <MidPageCta
        title="Want to find movies you both love?"
        subtitle="With Watch Together, you can match your movie tastes and find the perfect film in under 3 minutes."
        ctaText="Start Watch Together"
      />

      <ContentSection title="How to Choose the Right Movie?">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Tips for choosing movies together. Discuss genre, mood, length, and what you both enjoy.]
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Explain how Watch Together can help find movies you'll both like.]
          </p>
        </div>
      </ContentSection>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What are the best romantic movies on Netflix?",
            answer:
              "[Placeholder: Answer about popular romantic movies available on Netflix.]",
          },
          {
            question: "How do we find a movie we both like?",
            answer:
              "[Placeholder: Explain Watch Together feature and how it helps couples match movie taste.]",
          },
          {
            question: "How long does it take to find a good movie?",
            answer:
              "[Placeholder: Explain that with Watch Together it takes under 3 minutes to find a match.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
