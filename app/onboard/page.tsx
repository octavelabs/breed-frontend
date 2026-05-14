"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "../layout/AuthLayout";
import { userService } from "../../lib/api-services";
import { useAuth } from "../../context/AuthContext";

// ── Shared onboarding state types ─────────────────────────────────────────────

interface OnboardData {
  bibleReadingFrequency: string;
  prayerFrequency: string;
  isChurchMember: string; // "yes" | "no" — converted to bool on submit
  discipleshipExperience: string;
  interests: string[];
}

const Onboarding: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onboardData, setOnboardData] = useState<OnboardData>({
    bibleReadingFrequency: "",
    prayerFrequency: "",
    isChurchMember: "",
    discipleshipExperience: "",
    interests: [],
  });

  const updateOnboardData = (partial: Partial<OnboardData>) => {
    setOnboardData((prev) => ({ ...prev, ...partial }));
  };

  const handleFinish = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await userService.updateProfile({
        bibleReadingFrequency: onboardData.bibleReadingFrequency || undefined,
        prayerFrequency: onboardData.prayerFrequency || undefined,
        isChurchMember: onboardData.isChurchMember
          ? onboardData.isChurchMember === "yes"
          : undefined,
        discipleshipExperience:
          onboardData.discipleshipExperience || undefined,
        interests:
          onboardData.interests.length > 0 ? onboardData.interests : undefined,
      });

      if (user?.role === "PREACHER") {
        router.push("/dashboard/preacher/dashboard");
      } else {
        router.push("/dashboard/home");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save preferences. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    if (currentStep === 0) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const options = [
    <StepOne
      key="step1"
      onboardData={onboardData}
      updateOnboardData={updateOnboardData}
    />,
    <StepTwo
      key="step2"
      onboardData={onboardData}
      updateOnboardData={updateOnboardData}
    />,
  ];

  return (
    <AuthLayout custom={false}>
      <div className="w-full px-4 bg-[#F8F9FC]  pt-[21px] relative">
        <div
          className={`flex ${currentStep === 0 ? "justify-between" : "justify-start"} mb-[22px] cursor-pointer`}
        >
          <ArrowLeft
            stroke="#60666B"
            onClick={() =>
              currentStep === 0 ? router.back() : setCurrentStep(currentStep - 1)
            }
          />
          {currentStep === 0 && (
            <p
              className="text-[#60666B] font-semibold"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Skip
            </p>
          )}
        </div>
        {options[currentStep]}

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <Button
          customClass="!w-full !h-[58px] mt-[20px] mb-2 !text-white"
          onClick={handleButtonClick}
          disabled={isSubmitting}
        >
          {currentStep === 0
            ? "Proceed"
            : isSubmitting
              ? "Saving..."
              : "Let's Get Started"}
        </Button>
      </div>
    </AuthLayout>
  );
};

// ── Step One: Spiritual habits ────────────────────────────────────────────────

const StepOne = ({
  onboardData,
  updateOnboardData,
}: {
  onboardData: OnboardData;
  updateOnboardData: (partial: Partial<OnboardData>) => void;
}) => {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-[20px]">Start Your Journey with Purpose</p>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm mb-[6px]">How often do you read your Bible</p>
          <Dropdown
            value={onboardData.bibleReadingFrequency}
            options={["daily", "weekly"]}
            keySelector="interval"
            onChange={(item) =>
              updateOnboardData({ bibleReadingFrequency: item as string })
            }
            className="!h-[48px] "
          />
        </div>
        <div>
          <p className="text-sm mb-[6px]">
            How often do you spend time in prayer?
          </p>
          <Dropdown
            value={onboardData.prayerFrequency}
            options={["daily", "weekly"]}
            keySelector="interval"
            onChange={(item) =>
              updateOnboardData({ prayerFrequency: item as string })
            }
            className="!h-[48px] "
          />
        </div>
        <div>
          <p className="text-sm mb-[6px]">
            Do you currently belong to a fellowship or church?
          </p>
          <Dropdown
            value={onboardData.isChurchMember}
            options={["yes", "no"]}
            keySelector="interval"
            onChange={(item) =>
              updateOnboardData({ isChurchMember: item as string })
            }
            className="!h-[48px] "
          />
        </div>
        <div>
          <p className="text-sm mb-[6px]">
            Have you ever been personally discipled or mentored in faith?
          </p>
          <Dropdown
            value={onboardData.discipleshipExperience}
            options={["yes", "no"]}
            keySelector="interval"
            onChange={(item) =>
              updateOnboardData({ discipleshipExperience: item as string })
            }
            className="!h-[48px] "
          />
        </div>
      </div>
    </div>
  );
};

// ── Step Two: Interests ───────────────────────────────────────────────────────

const StepTwo = ({
  onboardData,
  updateOnboardData,
}: {
  onboardData: OnboardData;
  updateOnboardData: (partial: Partial<OnboardData>) => void;
}) => {
  const interests = [
    "Healing",
    "Salvation",
    "Obedience",
    "Prayer",
    "Faith",
    "Worship",
    "Evangelism",
    "Wisdom",
    "Purpose",
    "Holiness",
    "Patience",
    "Joy",
  ];

  const toggleInterest = (interest: string) => {
    const current = onboardData.interests;
    if (current.includes(interest)) {
      updateOnboardData({ interests: current.filter((i) => i !== interest) });
    } else {
      updateOnboardData({ interests: [...current, interest] });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-[20px]">Select Learning Interest</p>
      <div className="grid grid-cols-3 gap-8">
        {interests.map((interest, index) => (
          <div
            key={index}
            className={`flex items-center justify-center rounded-full h-[100px] w-[100px]  cursor-pointer ${onboardData.interests.includes(interest) ? "bg-[#5B26B1] text-white" : "bg-[#D2D9DF] text-[#000000]"}`}
            onClick={() => toggleInterest(interest)}
          >
            <p className="text-sm">{interest}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
