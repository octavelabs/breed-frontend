"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { ArrowLeft, ArrowRight, Eye, EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const Onboarding: React.FC = () => {
  const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
  const options = [<StepOne />, 
  <StepTwo />]

  return (
      <div className="w-full px-4 bg-[#F8F9FC] overflow-auto h-screen pt-[21px] relative">
        <div className={`flex ${currentStep === 0 ? "justify-between" : "justify-start"} mb-[22px]`}>
          <ArrowLeft stroke='#60666B'onClick={() => currentStep === 0 ? router.back() : setCurrentStep(currentStep - 1)}/>
          {currentStep === 0 && <p className="text-[#60666B] font-semibold" onClick={() => setCurrentStep(currentStep + 1)}>Skip</p>}
        </div>
           {options[currentStep]}
        <Button customClass="!text-white !absolute bottom-[21px] left-0 right-0 mx-4 !h-[58px]" onClick={() => currentStep === 0 ? setCurrentStep(currentStep + 1) : router.push('/dashboard/home')}>
          {currentStep === 0 ? 'Proceed' : "Let's Get Started"}
          </Button>
      </div>
  );
};

const StepOne = () => {
  return (
      <div className="flex flex-col gap-8">
          <p className="font-bold text-[20px]">Start Your Journey with Purpose</p>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm mb-[6px]">How often do you read your Bible</p>
              <Dropdown
                value=""
                options={['daily', 'weekly']}
                keySelector="interval"
                onChange={(item) => console.log(item)}
                className="!h-[48px] "
              />
            </div>
             <div>
              <p className="text-sm mb-[6px]">How often do you spend time in prayer?</p>
              <Dropdown
                value=""
                options={['daily', 'weekly']}
                keySelector="interval"
                onChange={(item) => console.log(item)}
                className="!h-[48px] "
              />
            </div>
             <div>
              <p className="text-sm mb-[6px]">Do you currently belong to a fellowship or church?</p>
              <Dropdown
                value=""
                options={['yes', 'no']}
                keySelector="interval"
                onChange={(item) => console.log(item)}
                className="!h-[48px] "
              />
            </div>
             <div>
              <p className="text-sm mb-[6px]">Have you ever been personally discipled or mentored 
in faith?</p>
              <Dropdown
                value=""
                options={['yes', 'no']}
                keySelector="interval"
                onChange={(item) => console.log(item)}
                className="!h-[48px] "
              />
            </div>
          </div>
        </div>

  )
}

const StepTwo = () => {
  const [selectedInterest, setSelectedInterest] = useState<string[]>([]);

  const interests = ['Healing', 'Salvation', 'Obedience', 'Prayer', 'Faith', 'Worship', 'Evangelism', 'Wisdom', 'Purpose', 'Holiness', 'Patience', 'Joy']
  return (
      <div className="flex flex-col gap-8">
          <p className="font-bold text-[20px]">Select Learning Interest</p>
          <div className="grid grid-cols-3 gap-8">
            {interests.map((interest, index) => (
              <div
                key={index}
                className={`flex items-center justify-center rounded-full h-[100px] w-[100px]  cursor-pointer ${selectedInterest.includes(interest) ? 'bg-[#5B26B1] text-white' : 'bg-[#D2D9DF] text-[#000000]'}`}
                onClick={() => {
                  if (selectedInterest.includes(interest)) {
                    setSelectedInterest(selectedInterest.filter(item => item !== interest));
                  } else {
                    setSelectedInterest([...selectedInterest, interest]);
                  }
                }}
              >
                <p className="text-sm">{interest}</p>
              </div>
            ))}
          </div>
        </div>

  )
}
export default Onboarding;
