"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  highlightPadding?: number;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const startOnboarding = useCallback((newSteps: OnboardingStep[]) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep, steps.length, completeOnboarding]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setHighlightedElement(null);
    // Store in localStorage that user skipped onboarding
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "skipped");
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setHighlightedElement(null);
    // Store in localStorage that user completed onboarding
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
    }
  }, []);

  // Update highlighted element when step changes
  useEffect(() => {
    if (isActive && steps[currentStep]?.targetSelector) {
      const element = document.querySelector(
        steps[currentStep].targetSelector!
      ) as HTMLElement;
      setHighlightedElement(element);

      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [isActive, currentStep, steps]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
      {isActive && steps.length > 0 && (
        <OnboardingOverlay
          step={steps[currentStep]}
          currentStep={currentStep}
          totalSteps={steps.length}
          highlightedElement={highlightedElement}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  );
}

interface OnboardingOverlayProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  highlightedElement: HTMLElement | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function OnboardingOverlay({
  step,
  currentStep,
  totalSteps,
  highlightedElement,
  onNext,
  onPrev,
  onSkip,
}: OnboardingOverlayProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (highlightedElement) {
      const rect = highlightedElement.getBoundingClientRect();
      const padding = step.highlightPadding || 8;

      // Calculate tooltip position based on placement
      let top = 0;
      let left = 0;

      switch (step.placement) {
        case "top":
          top = rect.top - 220; // Tooltip height + spacing
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 320; // Tooltip width + spacing
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
        default:
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
      }

      setTooltipPosition({ top, left });
    } else {
      // Center position for steps without target
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    }
  }, [highlightedElement, step.placement, step.highlightPadding]);

  return (
    <>
      {/* Backdrop with spotlight */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 pointer-events-none">
        {highlightedElement && (
          <div
            className="absolute border-4 border-primary-500 rounded-lg pointer-events-auto shadow-xl animate-pulse"
            style={{
              top: highlightedElement.getBoundingClientRect().top - (step.highlightPadding || 8),
              left: highlightedElement.getBoundingClientRect().left - (step.highlightPadding || 8),
              width: highlightedElement.getBoundingClientRect().width + (step.highlightPadding || 8) * 2,
              height: highlightedElement.getBoundingClientRect().height + (step.highlightPadding || 8) * 2,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 pointer-events-auto"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: step.placement === "center" ? "translate(-50%, -50%)" : 
                     step.placement === "left" || step.placement === "right" ? "translateY(-50%)" :
                     "translateX(-50%)",
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md animate-scale-in">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-6">{step.content}</p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Skip
              </button>
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
