import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import LeaderboardWidget from '@/components/gamification/LeaderboardWidget';

export const metadata = {
  title: 'Gamification - PrepWyse Commerce',
  description: 'Track your points, achievements, and compete on the leaderboard',
};

export default async function GamificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary dark:text-white mb-2">
            🎮 Gamification Dashboard
          </h1>
          <p className="font-body text-text-secondary dark:text-gray-400">
            Track your progress, earn achievements, and compete with others!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points and Level */}
          <div className="lg:col-span-2">
            <PointsDisplay />
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <LeaderboardWidget />
          </div>

          {/* Achievements Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Recent Achievements
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                <span className="text-3xl">🥇</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    First Quiz Complete
                  </p>
                  <p className="text-sm font-body text-text-secondary dark:text-gray-400">
                    Completed your first quiz!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    3-Day Streak
                  </p>
                  <p className="text-sm font-body text-text-secondary dark:text-gray-400">
                    Maintained a 3-day learning streak!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Level 2 Reached
                  </p>
                  <p className="text-sm font-body text-text-secondary dark:text-gray-400">
                    Leveled up to Level 2!
                  </p>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-accent-2-500 hover:bg-accent-2-600 text-white font-semibold rounded-lg transition-colors">
              View All Achievements
            </button>
          </div>

          {/* Daily Challenge */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">⚡ Daily Challenge</h2>
            <div className="mb-4">
              <p className="font-semibold mb-2">Complete 3 Quizzes Today</p>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: '33%' }} />
              </div>
              <p className="text-sm opacity-90 mt-1">1 of 3 completed</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/30">
              <div>
                <p className="text-sm opacity-90">Reward</p>
                <p className="font-bold">+100 Points 🎁</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Time Left</p>
                <p className="font-bold">8h 32m ⏰</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Keep Going! 💪</h3>
          <p className="text-lg opacity-90">
            You&apos;re doing great! Complete more quizzes to earn points and climb the leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
}
