'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  points: number;
  name: string;
  grade: string | null;
  level: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank: number | null;
}

export default function LeaderboardWidget() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/leaderboard?period=${period}&limit=10`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6 h-96" />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🏆 Leaderboard
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      <div className="space-y-2">
        {data?.entries.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.isCurrentUser
                ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold w-12">
                {getRankEmoji(entry.rank)}
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </p>
                {entry.grade && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.grade} • Level {entry.level}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {entry.points.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
            </div>
          </motion.div>
        ))}
      </div>

      {data?.userRank && data.userRank > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Your rank: <span className="font-bold">#{data.userRank}</span>
          </p>
        </div>
      )}
    </div>
  );
}
