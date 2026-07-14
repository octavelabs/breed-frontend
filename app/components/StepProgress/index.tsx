"use client"

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface StepProgressProps {
   steps: Array<{
    title?: string;
    subtitle?: string;
    content: React.ReactNode;
  }>;
  onComplete: () => void;
  primaryColor?: string;
  showStepCounter?: boolean;
  nextButtonText?: string | ((stepIndex: number) => string);
  previousButtonText?: string;
  completeButtonText?: string;
  handleNextClick?: (stepIndex: number) => Promise<boolean | void> | boolean | void;
  initialStep?: number;
  onClose?: () => void;
}

const StepProgress:React.FC<StepProgressProps> = ({
  steps = [],
  onComplete,
  primaryColor = '#7c3aed',
  showStepCounter = true,
  nextButtonText = 'Proceed',
  previousButtonText = 'Previous',
  completeButtonText,
  handleNextClick,
  initialStep = 0,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [nextPending, setNextPending] = useState(false);
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const router = useRouter();

  const handleNext = async () => {
    if (nextPending) return;
    if (handleNextClick) {
      setNextPending(true);
      try {
        const result = await handleNextClick(currentStep);
        if (result === false) return; // caller intercepted (e.g. routing to quiz)
      } finally {
        setNextPending(false);
      }
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep] || {};
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-120px)]">
      {/* Sticky header — progress bar + step counter */}
      <div className="sticky top-0 bg-white z-10 pb-3 pt-1">
        <div className="flex items-center justify-between gap-4">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            onClick={() => onClose ? onClose() : router.back()}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%`, backgroundColor: primaryColor }}
            />
          </div>

          {showStepCounter && (
            <div className="text-sm text-[#60666B] font-medium whitespace-nowrap border bg-white border-[#D2D9DF] rounded-full px-3 py-1 shrink-0">
              {currentStep + 1} of {totalSteps}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 pb-6">
        {currentStepData?.subtitle && (
          <p className="text-sm lg:text-base text-[#60666B] mb-1">
            {currentStepData.subtitle}
          </p>
        )}

        {currentStepData.title && (
          <h1 className="text-[24px] lg:text-[32px] font-bold mb-6">
            {currentStepData.title}
          </h1>
        )}

        <div className="mb-4">
          {currentStepData.content}
        </div>
      </div>

      {/* Sticky nav buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 pb-4 flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`px-6 py-3 rounded-full font-medium transition-all cursor-pointer ${
            isFirstStep
              ? 'invisible pointer-events-none'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {previousButtonText}
        </button>

        <button
          onClick={handleNext}
          disabled={nextPending}
          className="cursor-pointer px-8 py-3 rounded-full font-medium text-white transition-all hover:opacity-90 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] disabled:opacity-60 ml-auto"
        >
          {nextPending ? (
            <span className="inline-block w-4 h-4 rounded-full border-t-2 border-white animate-spin" />
          ) : (
            isLastStep
              ? completeButtonText
              : (typeof nextButtonText === 'function' ? nextButtonText(currentStep) : (nextButtonText ?? 'Proceed'))
          )}
        </button>
      </div>
    </div>
  );
};

export default StepProgress