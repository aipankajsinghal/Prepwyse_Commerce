"use client";

import { useEffect, useState } from "react";
import { Cookie, X, Check, Settings } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (error) {
        console.error("Failed to parse cookie consent:", error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem("cookie-consent", JSON.stringify(essentialOnly));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-200 overflow-hidden">
            {!showSettings ? (
              // Main Banner
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                    <Cookie className="h-6 w-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      We Value Your Privacy
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      We use cookies to enhance your experience, analyze site traffic, and personalize content. You can choose which cookies to accept.{" "}
                      <Link href="/privacy#cookies" className="text-primary-600 hover:underline font-medium">
                        Learn more
                      </Link>
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleAcceptAll}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                      >
                        <Check className="h-4 w-4" />
                        Accept All
                      </button>
                      
                      <button
                        onClick={handleRejectNonEssential}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                      >
                        Reject Non-Essential
                      </button>
                      
                      <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:border-gray-400 transition"
                      >
                        <Settings className="h-4 w-4" />
                        Customize
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRejectNonEssential}
                    className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Essential Cookies */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 cursor-not-allowed opacity-50"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Essential Cookies <span className="text-xs text-gray-600">(Required)</span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Necessary for the platform to function. These include authentication, security, and session management. Cannot be disabled.
                      </p>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Functional Cookies <span className="text-xs text-gray-600">(Optional)</span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Remember your preferences like theme, language, and settings for a better experience.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Analytics Cookies <span className="text-xs text-gray-600">(Optional)</span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how you use the platform so we can improve features and performance. Data is anonymized.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
