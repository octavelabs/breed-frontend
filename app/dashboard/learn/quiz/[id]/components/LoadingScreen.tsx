"use client"

import { useEffect } from "react";

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen:React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
      useEffect(() => {
        const timer = setTimeout(() => {
          onLoadComplete();
        }, 3000);
        return () => clearTimeout(timer);
      }, []);

      return (
        <div className="min-h-screen bg-[#330750] flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            {/* Angel Character */}
            <div className="mb-8 float-animation h-[300px] w-[300px]">
                <img src='/quizLoader.png' className="w-full h-full"/>
            </div>

            {/* Loading Text */}
            <div className="text-white space-y-4 text-center">
              <h2 className="text-[20px] lg:text-[24px] leading-tight font-semibold">Loading...</h2>
              <p className="text-[20px] lg:text-[24px] leading-tight font-medium mx-auto">
                Hey there! Don't worry, spiritual<br />
                growth doesn't happen by accident.
              </p>
              <p className="text-[20px] lg:text-[24px] leading-tight font-medium mx-auto">
                Let's walk through this together and<br />
                grow deeper in the Word step by step!
              </p>
            </div>

            {/* Loading Spinner */}
            <div className="mt-8">
              <div className="w-10 h-10 border-4 border-purple-300 border-t-white rounded-full spin-slow mx-auto animate-spin"></div>
            </div>
          </div>
        </div>
      );
    };


    export default LoadingScreen;