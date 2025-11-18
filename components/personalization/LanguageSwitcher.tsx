'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/personalization');
      if (response.ok) {
        const result = await response.json();
        setLanguage(result.preferredLanguage);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/personalization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage: newLanguage }),
      });

      if (response.ok) {
        setLanguage(newLanguage);
        // Refresh the page to apply new language
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        disabled={loading}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        } disabled:opacity-50`}
      >
        🇬🇧 English
      </button>
      <button
        onClick={() => handleLanguageChange('hi')}
        disabled={loading}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          language === 'hi'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        } disabled:opacity-50`}
      >
        🇮🇳 हिंदी
      </button>
    </div>
  );
}
