"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import StepProgress from "./components/StepProgress";
import { authService } from "../../lib/api-services";

// ── Shared step data types ────────────────────────────────────────────────────

interface StepData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  username: string;
}

// ── Root component ────────────────────────────────────────────────────────────

const CreateAccount: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepData, setStepData] = useState<StepData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const updateStepData = (partial: Partial<StepData>) => {
    setStepData((prev) => ({ ...prev, ...partial }));
  };

  const exampleSteps = [
    {
      content: (
        <StepOne
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: (
        <StepTwo
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: (
        <StepThree
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: (
        <StepFour
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
  ];

  return (
    <AuthLayout custom={true}>
      <StepProgress
        steps={exampleSteps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </AuthLayout>
  );
};

// ── Step One: Email ───────────────────────────────────────────────────────────

const StepOne = ({
  setCurrentStep,
  currentStep,
  stepData,
  updateStepData,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepData: StepData;
  updateStepData: (partial: Partial<StepData>) => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (!stepData.email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <div className="w-[52px] h-[52px] rounded-full bg-[#FBF6FF] mb-4 flex justify-center items-center mx-auto">
        <img
          src="./heroImage2.svg"
          alt="bird"
          className="w-[36px]  h-[36px]  "
        />
      </div>
      <h2 className="text-[24px] font-semibold leading-none text-center mb-2">
        Create an Account
      </h2>
      <p className="text-center text-sm text-gray-600 mb-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-purple-600 hover:underline font-medium"
        >
          Login
        </Link>
      </p>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium  mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="email"
              value={stepData.email}
              onChange={(e) => updateStepData({ email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Submit button */}
        <Button
          customClass="!w-full !h-[58px] mt-4 !text-white"
          type="submit"
        >
          Proceed
        </Button>
      </form>
    </div>
  );
};

// ── Step Two: Personal Info ───────────────────────────────────────────────────

const StepTwo = ({
  setCurrentStep,
  currentStep,
  stepData,
  updateStepData,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepData: StepData;
  updateStepData: (partial: Partial<StepData>) => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (!stepData.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!stepData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Provide Personal Information
      </h2>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        {/* First name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium  mb-2"
          >
            First name
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="firstName"
              value={stepData.firstName}
              onChange={(e) => updateStepData({ firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium  mb-2">
            Last name
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="lastName"
              value={stepData.lastName}
              onChange={(e) => updateStepData({ lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
        </div>

        {/* Phone number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium  mb-2">
            Phone no
          </label>
          <div className="flex gap-2">
            <div className="w-20 px-4 py-3 flex items-center border border-[#60666B] rounded-lg bg-white text-[#60666B]">
              +234
            </div>
            <Input
              variant="outlined"
              type="tel"
              id="phone"
              value={stepData.phone}
              onChange={(e) => updateStepData({ phone: e.target.value })}
              placeholder="Enter Phone no"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium  mb-2">
            Location
          </label>
          <Dropdown
            value={""}
            objectOptions={[{ name: "Nigeria" }]}
            keySelector="name"
            onChange={(item) => console.log(item.name)}
            className="!h-[48px] focus:ring-2 focus:ring-blue-500 outline-none bg-white z-20 "
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Submit button */}
        <Button
          customClass="!w-full !h-[58px] mt-4 mb-2 !text-white"
          type="submit"
        >
          Proceed
        </Button>
      </form>
    </div>
  );
};

// ── Step Three: Password ──────────────────────────────────────────────────────

const StepThree = ({
  setCurrentStep,
  currentStep,
  stepData,
  updateStepData,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepData: StepData;
  updateStepData: (partial: Partial<StepData>) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (!stepData.password) {
      setError("Password is required.");
      return;
    }
    if (stepData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (stepData.password !== stepData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="rounded-[24px] bg-white p-4 lg:p-8 max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Set Password
      </h2>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <div>
          <label htmlFor="password" className="block text-sm font-medium  mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              icon={
                <div
                  className="absolute inset-y-0 right-[15px] flex items-center pl-2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <span className="text-gray-500 sm:text-sm">
                    {showPassword ? (
                      <EyeOffIcon className="scale-[0.7] lg:scale-75" />
                    ) : (
                      <EyeIcon className="scale-[0.7] lg:scale-75" />
                    )}
                  </span>
                </div>
              }
              variant="outlined"
              type={showPassword ? "text" : "password"}
              id="password"
              value={stepData.password}
              onChange={(e) => updateStepData({ password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium  mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Input
              icon={
                <div
                  className="absolute inset-y-0 right-[15px] flex items-center pl-2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <span className="text-gray-500 sm:text-sm">
                    {showPassword ? (
                      <EyeOffIcon className="scale-[0.7] lg:scale-75" />
                    ) : (
                      <EyeIcon className="scale-[0.7] lg:scale-75" />
                    )}
                  </span>
                </div>
              }
              variant="outlined"
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={stepData.confirmPassword}
              onChange={(e) =>
                updateStepData({ confirmPassword: e.target.value })
              }
              placeholder="Re enter password"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button
          customClass="!w-full !h-[58px] mt-4 mb-2 !text-white"
          type="submit"
        >
          Proceed
        </Button>
      </form>
    </div>
  );
};

// ── Step Four: Username + Final Submit ────────────────────────────────────────

const StepFour = ({
  stepData,
  updateStepData,
}: {
  stepData: StepData;
  updateStepData: (partial: Partial<StepData>) => void;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stepData.username.trim()) {
      setError("Username is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register({
        email: stepData.email,
        password: stepData.password,
        confirmPassword: stepData.confirmPassword,
        firstName: stepData.firstName,
        lastName: stepData.lastName,
        username: stepData.username,
        phone: stepData.phone || undefined,
        role: "BELIEVER",
      });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[24px] bg-white p-4 lg:p-8 max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Set Username
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium  mb-2">
            Username
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="username"
              value={stepData.username}
              onChange={(e) => updateStepData({ username: e.target.value })}
              placeholder="Enter username"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Submit button */}
        <Button
          customClass="!w-full !h-[58px] mt-4 !text-white"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};

export default CreateAccount;
