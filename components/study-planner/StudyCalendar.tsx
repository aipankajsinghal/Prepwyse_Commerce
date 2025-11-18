'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StudySession {
  id: string;
  title: string;
  description: string;
  type: string;
  scheduledDate: string;
  duration: number;
  completed: boolean;
  completedAt: string | null;
  notes: string | null;
}

export default function StudyCalendar({ planId }: { planId?: string }) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [planId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const url = planId
        ? `/api/study-planner/sessions?planId=${planId}`
        : '/api/study-planner/sessions';
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/study-planner/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          completed: true,
        }),
      });

      if (response.ok) {
        // Refresh sessions
        await fetchSessions();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const getSessionsByDate = () => {
    const grouped: { [key: string]: StudySession[] } = {};
    sessions.forEach((session) => {
      const date = new Date(session.scheduledDate).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-500';
      case 'quiz':
        return 'bg-purple-500';
      case 'flashcard':
        return 'bg-green-500';
      case 'revision':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'quiz':
        return '📝';
      case 'flashcard':
        return '🎴';
      case 'revision':
        return '📚';
      default:
        return '📖';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6 h-96" />
    );
  }

  const sessionsByDate = getSessionsByDate();
  const dates = Object.keys(sessionsByDate).sort();
  const upcomingSessions = sessions
    .filter((s) => !s.completed && new Date(s.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📅 Upcoming Sessions
        </h3>
        <div className="space-y-3">
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No upcoming sessions</p>
          ) : (
            upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(session.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          📅 {new Date(session.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>⏱️ {session.duration} min</span>
                        <span className={`px-2 py-1 rounded text-white ${getTypeColor(session.type)}`}>
                          {session.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.completed && (
                    <button
                      onClick={() => handleCompleteSession(session.id)}
                      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Calendar View */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📆 All Sessions
        </h3>
        <div className="space-y-4">
          {dates.map((date) => {
            const dateSessions = sessionsByDate[date];
            const completedCount = dateSessions.filter((s) => s.completed).length;

            return (
              <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                  onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                  className="bg-gray-50 dark:bg-gray-800 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dateSessions.length} session{dateSessions.length !== 1 ? 's' : ''} •{' '}
                      {completedCount} completed
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {selectedDate === date ? '▼' : '▶'}
                  </span>
                </div>

                {selectedDate === date && (
                  <div className="p-3 space-y-2">
                    {dateSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg ${
                          session.completed
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-white dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTypeIcon(session.type)}</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {session.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {session.duration} min
                              </p>
                            </div>
                          </div>
                          {session.completed ? (
                            <span className="text-green-500 font-semibold">✓ Done</span>
                          ) : (
                            <button
                              onClick={() => handleCompleteSession(session.id)}
                              className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
