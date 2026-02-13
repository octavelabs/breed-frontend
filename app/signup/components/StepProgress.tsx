"use client"

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface StepProgressProps {
    steps: Array<{
        title?: string;
        subtitle?: string;
        content: React.ReactNode;
    }>;
    primaryColor?: string;
    currentStep: number;
    setCurrentStep: (val: number) => void
}

const StepProgress: React.FC<StepProgressProps> = ({
    steps = [],
    primaryColor = '#7c3aed',
    currentStep,
    setCurrentStep
}) => {
    const totalSteps = steps.length;
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    const router = useRouter();



    const currentStepData = steps[currentStep] || {};


    return (

        <div className="overflow-hidden">
            {/* Header with Progress Bar */}
            <div className="">
                <div className='bg-white flex h-[100px] px-8 items-center'>
                    <button
                        onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-7 h-7 text-[#60666B]" />
                    </button>
                    <div className='w-[90%] flex justify-center'>
                        <img src="/logo3.png" alt="logo" className="h-[22px] w-auto" />
                    </div>

                </div>
                <div className="flex items-center justify-between mb-4 gap-11">
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: primaryColor
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-[200px] py-12 pt-30 max-h-[calc(100vh-102px)] overflow-auto">
                {currentStepData.content}
            </div>
        </div>

    );
};

export default StepProgress