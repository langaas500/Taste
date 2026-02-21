import type { Metadata } from "next";
import SeoGuideLayout, {
  ContentSection,
  RecommendationCard,
  MidPageCta,
  FaqSection,
} from "@/components/SeoGuideLayout";

export const metadata: Metadata = {
  title: "TV Shows to Watch Together 2026 | Best Series for Couples & Friends",
  description:
    "Looking for great TV shows to watch together? Find the best series perfect for binge-watching with your partner, friends, or family.",
};

export default function TvShowsTogetherPage() {
  return (
    <SeoGuideLayout
      h1="TV Shows to Watch Together"
      heroSubtitle="Find series that keep everyone engaged episode after episode. Perfect for binge-watching nights together."
      ctaText="Start Watch Together"
      trustLine="Free · Under 3 minutes · No registration required"
    >
      <ContentSection title="Popular Series to Watch Together">
        <RecommendationCard
          title="[Placeholder: Drama Everyone's Talking About]"
          description="Complex plot, compelling characters, and twists that keep you on the edge of your seat. Perfect for deep discussions."
          streamingServices={["HBO Max", "Netflix"]}
        />
        <RecommendationCard
          title="[Placeholder: Feel-Good Comedy]"
          description="Light, funny, and heartwarming. A series you can relax to without thinking too much, but still engaging."
          streamingServices={["Netflix", "Disney+"]}
        />
        <RecommendationCard
          title="[Placeholder: Gripping Thriller]"
          description="Mystery and suspense that makes you want to watch just one more episode. Hard to stop once you start."
          streamingServices={["Hulu", "Apple TV+"]}
        />
      </ContentSection>

      <MidPageCta
        title="Struggling to find a series to start?"
        subtitle="With Watch Together, you can swipe through series and find something you'll actually want to binge together."
        ctaText="Start Watch Together"
      />

      <ContentSection title="Why TV Shows Are Perfect to Watch Together">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Shared Experience Over Time
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Explain how series create shared references and something to look forward to together.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No Decision Every Night
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Describe the advantage of having a series going – you always know what to watch.]
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Character Development and Depth
            </h3>
            <p className="text-gray-700 leading-relaxed">
              [Placeholder: Explain how series give more time to develop characters and stories than movies.]
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Genres That Work Best">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drama</h3>
            <p className="text-sm text-gray-700">
              Complex stories and characters that give you lots to discuss
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Comedy</h3>
            <p className="text-sm text-gray-700">
              Light and fun – perfect for relaxing evenings
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thriller</h3>
            <p className="text-sm text-gray-700">
              Suspense and mysteries that keep you engaged
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sci-Fi</h3>
            <p className="text-sm text-gray-700">
              Imaginative worlds and thought-provoking concepts
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">True Crime</h3>
            <p className="text-sm text-gray-700">
              Real stories that fascinate and engage
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fantasy</h3>
            <p className="text-sm text-gray-700">
              Epic adventures in magical worlds
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Tips for Choosing the Right Series">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Advice on choosing series based on length, complexity, and shared interests.]
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            [Placeholder: Explain the advantage of using Watch Together to find series you'll both like.]
          </p>
        </div>
      </ContentSection>

      <FaqSection
        title="Frequently Asked Questions"
        items={[
          {
            question: "What are the best shows to watch together right now?",
            answer:
              "[Placeholder: Overview of popular series across streaming services.]",
          },
          {
            question: "How do we avoid watching different episodes?",
            answer:
              "[Placeholder: Tips on making a 'don't watch without me' agreement and using streaming profiles.]",
          },
          {
            question: "How many episodes should we watch at once?",
            answer:
              "[Placeholder: Discuss binge strategies and benefits of not watching too many episodes at once.]",
          },
          {
            question: "What if we don't like the same shows?",
            answer:
              "[Placeholder: Explain how Watch Together helps find overlapping taste.]",
          },
        ]}
      />
    </SeoGuideLayout>
  );
}
