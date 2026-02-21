import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "Movies to Watch with Friends | Best Group Movies 2026",
  description:
    "Planning a movie night with friends? Here are the best movies perfect for a social evening with your crew.",
};

export default function MoviesWithFriendsPage() {
  return (
    <SeoGuideLayout
      h1="Movies to Watch with Friends"
      heroSubtitle="Find movies that keep the whole group entertained. From comedies to action – perfect for social nights."
      ctaText="Start Watch Together"
      trustLine="Free · Under 3 minutes · No registration required"
    >
      <ContentSection title="Perfect for Group Entertainment">
        <RecommendationCard
          title="[Placeholder: Action Comedy]"
          description="Explosive action combined with great humor. Guaranteed to make everyone laugh and stay engaged throughout."
          streamingServices={["Netflix", "HBO Max"]}
        />
        <RecommendationCard
          title="[Placeholder: Ensemble Comedy]"
          description="Large cast and rapid-fire dialogue that gets the whole room laughing. Perfect for a light and fun evening."
          streamingServices={["Disney+", "Hulu"]}
        />
        <RecommendationCard
          title="[Placeholder: Thriller with Twists]"
          description="Keep everyone on the edge of their seats with unexpected turns. You'll be discussing the plot long after credits roll."
          streamingServices={["Netflix", "Apple TV+"]}
        />
      </ContentSection>

      <MidPageCta
        title="Want to find a movie everyone likes?"
        subtitle="With Watch Together, your whole group can swipe through options and find movies you'll actually want to watch together."
        ctaText="Start Watch Together"
      />

      <ContentSection title="Tips for Successful Movie Night">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Choose the Right Genre for the Group
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Explain how to pick movies based on group mood and preferences.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Avoid Overly Long or Complex Movies
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Tips on choosing movies with appropriate length and complexity for social settings.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Have Backup Options Ready
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Explain why it's smart to have several alternatives ready before friends arrive.]
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Genres That Work Best">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Comedy</h3>
            <p className="text-sm text-gray-700">
              Light, fun, and perfect for group laughter
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Action</h3>
            <p className="text-sm text-gray-700">
              Spectacular entertainment that keeps everyone awake
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thriller</h3>
            <p className="text-sm text-gray-700">
              Suspense and mysteries you can discuss together
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sci-Fi</h3>
            <p className="text-sm text-gray-700">
              Visually impressive and thought-provoking
            </p>
          </div>
        </div>
      </ContentSection>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What are the best movies for a large group of friends?",
            answer:
              "[Placeholder: Explain what makes a movie good for groups – humor, action, easy to follow.]",
          },
          {
            question: "How do we avoid spending too long choosing?",
            answer:
              "[Placeholder: Explain Watch Together feature where everyone can swipe and find matches quickly.]",
          },
          {
            question: "Should we choose a movie or a show?",
            answer:
              "[Placeholder: Discuss pros and cons of movies vs. shows for social gatherings.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
