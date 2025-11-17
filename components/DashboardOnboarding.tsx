"use client";

import { useEffect } from "react";
import { useOnboarding, OnboardingStep } from "./OnboardingProvider";

const dashboardOnboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to PrepWyse Commerce! 🎉",
    content: "Let's take a quick tour to help you get started with your exam preparation journey. You can skip this anytime.",
    placement: "center",
  },
  {
    id: "subjects",
    title: "Your Subjects",
    content: "Browse and select subjects you want to study. We cover Business Studies, Accountancy, and Economics.",
    targetSelector: '[data-onboarding="subjects-section"]',
    placement: "bottom",
    highlightPadding: 12,
  },
  {
    id: "create-quiz",
    title: "Create Practice Quiz",
    content: "Click here to create a custom quiz. You can select chapters, difficulty level, and even use AI to generate adaptive questions!",
    targetSelector: '[data-onboarding="create-quiz-btn"]',
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "mock-tests",
    title: "Mock Tests",
    content: "Practice with full-length mock tests that simulate the actual exam experience with timing and scoring.",
    targetSelector: '[data-onboarding="mock-tests-btn"]',
    placement: "bottom",
    highlightPadding: 8,
  },
  {
    id: "progress",
    title: "Track Your Progress",
    content: "Monitor your performance with detailed analytics. See your strengths, weaknesses, and improvement over time.",
    targetSelector: '[data-onboarding="progress-section"]',
    placement: "top",
    highlightPadding: 12,
  },
  {
    id: "profile",
    title: "Your Profile",
    content: "Access your profile to update preferences, view achievements, and manage your account settings.",
    targetSelector: '[data-onboarding="profile-link"]',
    placement: "left",
    highlightPadding: 8,
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    content: "You're ready to start your preparation journey. Remember, consistent practice is the key to success. Good luck!",
    placement: "center",
  },
];

export function DashboardOnboarding() {
  const { startOnboarding } = useOnboarding();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    
    if (!hasCompletedOnboarding) {
      // Wait a bit for the page to render before starting
      const timer = setTimeout(() => {
        startOnboarding(dashboardOnboardingSteps);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [startOnboarding]);

  return null; // This component doesn't render anything itself
}
