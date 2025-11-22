"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X, User } from "lucide-react";

export function FirstLoginProfilePrompt() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Check if user has completed profile
    const hasCompletedProfile = localStorage.getItem("profile_completed");
    const hasGrade = user.publicMetadata?.grade;
    
    // Show prompt if user hasn't completed profile and hasn't dismissed it
    if (!hasCompletedProfile && !hasGrade) {
      // Small delay to let the page render
      setTimeout(() => setShowPrompt(true), 1000);
    }
  }, [user, isLoaded]);

  const handleComplete = () => {
    router.push("/profile");
  };

  const handleDismiss = () => {
    localStorage.setItem("profile_completed", "dismissed");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 bg-accent-1/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-accent-1" />
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Welcome to PrepWyse Commerce! 🎉
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 font-body mb-6">
            To personalize your learning experience, please take a moment to complete your profile. 
            Tell us about your grade level and learning goals.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleComplete}
              className="flex-1 px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-1-dark transition font-medium font-display"
            >
              Complete Profile
            </button>
            <button
              onClick={handleDismiss}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium font-display"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
