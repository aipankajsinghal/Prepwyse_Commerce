'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  chapter: {
    name: string;
    subject: {
      name: string;
    };
  };
  progress?: {
    reviewCount: number;
    nextReviewDate: string;
  };
}

export default function FlashcardReview({ chapterId }: { chapterId?: string }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [chapterId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const url = chapterId
        ? `/api/flashcards/review?chapterId=${chapterId}`
        : '/api/flashcards/review';
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        const allCards = [...result.dueForReview, ...result.newCards];
        setCards(allCards);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (reviewing || currentIndex >= cards.length) return;

    setReviewing(true);
    try {
      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: cards[currentIndex].id,
          quality,
        }),
      });

      if (response.ok) {
        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        } else {
          // All cards reviewed
          await fetchCards();
          setCurrentIndex(0);
          setIsFlipped(false);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          All caught up!
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          No flashcards due for review right now.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {currentCard.chapter.subject.name} • {currentCard.chapter.name}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <motion.div
        className="relative h-96 cursor-pointer"
        onClick={() => !reviewing && setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {isFlipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>
            <p className="absolute bottom-6 text-sm text-gray-400">
              {isFlipped ? 'Click to flip' : 'Click to see answer'}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Review buttons (only show when flipped) */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-4 gap-3"
        >
          <button
            onClick={() => handleReview(0)}
            disabled={reviewing}
            className="px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            Again
            <br />
            <span className="text-xs opacity-80">&lt;1 min</span>
          </button>
          <button
            onClick={() => handleReview(2)}
            disabled={reviewing}
            className="px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            Hard
            <br />
            <span className="text-xs opacity-80">&lt;6 min</span>
          </button>
          <button
            onClick={() => handleReview(4)}
            disabled={reviewing}
            className="px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            Good
            <br />
            <span className="text-xs opacity-80">&lt;10 min</span>
          </button>
          <button
            onClick={() => handleReview(5)}
            disabled={reviewing}
            className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            Easy
            <br />
            <span className="text-xs opacity-80">4 days</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
