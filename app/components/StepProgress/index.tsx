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
  nextButtonText?: string;
  previousButtonText?: string;
  completeButtonText?: string;
  handleNextClick?: () => void;
}

const StepProgress:React.FC<StepProgressProps> = ({ 
  steps = [], 
  onComplete,
  primaryColor = '#7c3aed',
  showStepCounter = true,
  nextButtonText = 'Proceed',
  previousButtonText = 'Previous',
  completeButtonText,
  handleNextClick
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      if (handleNextClick) {
        handleNextClick();
      }
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
  
      <div className="overflow-hidden">
        {/* Header with Progress Bar */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-4 gap-11">
            {/* Close button */}
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => router.back()}
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: primaryColor 
              }}
            />
          </div>

            {/* Step counter */}
            {showStepCounter && (
              <div className="text-sm text-[#60666B] font-medium whitespace-nowrap border bg-white border-[#D2D9DF] rounded-full px-3 py-1">
                {currentStep + 1} of {totalSteps}
              </div>
            )}
          </div>

          {/* Progress bar */}
          
        </div>

        {/* Content Area */}
        <div className=" pb-6">
          {/* Subtitle (if exists) */}
          {currentStepData?.subtitle && (
            <p className="text-base lg:text-[20px] mb- text-[#60666B]">
              {currentStepData?.subtitle}
            </p>
          )}

          {/* Title */}
          {currentStepData.title && (
            <h1 className="text-[24px] lg:text-[32px] font-bold  mb-7">
              {currentStepData.title}
            </h1>
          )}

          {/* Main content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`px-8 py-3 rounded-full font-medium transition-all cursor-pointer ${
                isFirstStep 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              } ${currentStep > 0 ? 'visible' : 'invisible'}`}
            >
              {previousButtonText}
            </button>

            <button
              onClick={handleNext}
              className="cursor-pointer px-8 py-3 rounded-full font-medium text-white transition-all hover:opacity-90 bg-gradient-to-b from-[#A967F1] to-[#5B26B1]"
            >
              {isLastStep ? completeButtonText : nextButtonText}
            </button>
          </div>
        </div>
      </div>

  );
};

export default StepProgress