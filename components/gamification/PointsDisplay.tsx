'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PointsData {
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  nextLevelPoints: number;
  progressToNextLevel: number;
}

export default function PointsDisplay() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/gamification/points');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6 h-32" />
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Level {data.level}</h3>
          <p className="text-2xl font-bold">{data.points.toLocaleString()} Points</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-4xl"
        >
          🎖️
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {data.level + 1}</span>
          <span>{Math.round(data.progressToNextLevel)}%</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.progressToNextLevel}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-white rounded-full h-2"
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm opacity-90">Current Streak</p>
            <p className="text-lg font-bold">{data.currentStreak} days</p>
          </div>
        </div>
        {data.longestStreak > data.currentStreak && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm opacity-90">Best Streak</p>
              <p className="text-lg font-bold">{data.longestStreak} days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
