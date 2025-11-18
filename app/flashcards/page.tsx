import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import FlashcardReview from '@/components/flashcards/FlashcardReview';

export const metadata = {
  title: 'Flashcards - PrepWyse Commerce',
  description: 'Review flashcards with spaced repetition for better retention',
};

export default async function FlashcardsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎴 Flashcards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review flashcards using spaced repetition for better retention
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold">Total Cards</h3>
            </div>
            <p className="text-3xl font-bold">250</p>
            <p className="text-sm opacity-90">Across all subjects</p>
          </div>

          <div className="bg-orange-500 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <h3 className="font-semibold">Due Today</h3>
            </div>
            <p className="text-3xl font-bold">15</p>
            <p className="text-sm opacity-90">Ready for review</p>
          </div>

          <div className="bg-green-500 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-semibold">Mastered</h3>
            </div>
            <p className="text-3xl font-bold">180</p>
            <p className="text-sm opacity-90">Successfully learned</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📖 How Spaced Repetition Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">1️⃣</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Again</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review in &lt;1 minute
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">2️⃣</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Hard</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review in 6 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">3️⃣</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Good</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review in 10 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">4️⃣</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Easy</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review in 4 days
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Rate each card based on how well you remember it. The algorithm will schedule reviews at optimal intervals.
          </p>
        </div>

        {/* Flashcard Review Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <FlashcardReview />
        </div>

        {/* Tips */}
        <div className="mt-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            💡 Study Tips
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Review flashcards daily for best results</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Be honest with your ratings - it helps the algorithm</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Focus on understanding, not just memorization</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Take breaks between review sessions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
