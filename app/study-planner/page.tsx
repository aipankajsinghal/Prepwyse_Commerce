import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import StudyCalendar from '@/components/study-planner/StudyCalendar';

// Force dynamic rendering so Clerk keys are only required at runtime
export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Study Planner - PrepWyse Commerce',
  description: 'Plan your study sessions with AI-powered scheduling',
};

export default async function StudyPlannerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary dark:text-white mb-2">
            📅 Study Planner
          </h1>
          <p className="font-body text-text-secondary dark:text-gray-400">
            Organize your study sessions with AI-powered scheduling
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold">Total Sessions</h3>
            </div>
            <p className="text-3xl font-bold">45</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-semibold">Completed</h3>
            </div>
            <p className="text-3xl font-bold">28</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <h3 className="font-semibold">Upcoming</h3>
            </div>
            <p className="text-3xl font-bold">17</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <h3 className="font-semibold">Hours Studied</h3>
            </div>
            <p className="text-3xl font-bold">42</p>
          </div>
        </div>

        {/* Create Plan Button */}
        <div className="mb-8 flex justify-end">
          <button className="px-6 py-3 bg-accent-2-500 hover:bg-accent-2-600 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2">
            <span>➕</span>
            <span>Create New Study Plan</span>
          </button>
        </div>

        {/* Study Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <StudyCalendar />
        </div>

        {/* Study Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🎯</span>
              <span>How to Use Study Planner</span>
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">1.</span>
                <span>Create a study plan with your exam date and target score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">2.</span>
                <span>AI will generate optimized study sessions based on your weak areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">3.</span>
                <span>Follow the schedule and mark sessions as complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">4.</span>
                <span>Earn points and track your progress</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Study Best Practices</span>
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Study at the same time each day to build a habit</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Take 5-10 minute breaks every hour</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Review previous topics before starting new ones</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Use active recall and practice questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Get enough sleep for better retention</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg p-6 text-white text-center">
          <p className="text-2xl font-bold mb-2">
            &quot;Success is the sum of small efforts repeated day in and day out.&quot;
          </p>
          <p className="text-lg opacity-90">- Robert Collier</p>
        </div>
      </div>
    </div>
  );
}
