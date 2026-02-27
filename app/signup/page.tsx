"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { Eye, EyeIcon, EyeOffIcon } from "lucide-react";
import StepProgress from "./components/StepProgress";
import { useRouter } from "next/navigation";

const CreateAccount: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // navigate('/create-password');
  };
  const exampleSteps = [
    {
      content: (
        <StepOne setCurrentStep={setCurrentStep} currentStep={currentStep} />
      ),
    },
    {
      content: (
        <StepTwo setCurrentStep={setCurrentStep} currentStep={currentStep} />
      ),
    },
    {
      content: <StepThree />,
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

const StepOne = ({
  setCurrentStep,
  currentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
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

      <form className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium  mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="firstName"
              onChange={() => console.log("firstname")}
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Submit button */}
        <Button
          customClass="!w-full !h-[58px] mt-4 !text-white"
          onClick={() => setCurrentStep(currentStep + 1)}
          type="button"
        >
          Proceed
        </Button>
      </form>
    </div>
  );
};

const StepTwo = ({
  setCurrentStep,
  currentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Provide Personal Information
      </h2>
      <form className="flex flex-col gap-4">
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
              onChange={() => console.log("firstname")}
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
              onChange={() => console.log("lastname")}
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
              onChange={() => console.log("firstname")}
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

        {/* Submit button */}
        <Button
          customClass="!w-full !h-[58px] mt-4 mb-2 !text-white"
          type="button"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Proceed
        </Button>
      </form>

      {/* Login link */}
    </div>
  );
};

const StepThree = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="rounded-[24px] bg-white p-4 lg:p-8 max-w-[90%]  sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Set Password
      </h2>

      <form className="flex flex-col gap-4">
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
              type="pasword"
              id="password"
              onChange={() => console.log("password")}
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
              type="pasword"
              id="confirmPassword"
              onChange={() => console.log("confirmPassword")}
              placeholder="Re enter password"
            />
          </div>
        </div>

        {/* Submit button */}
        <Link href='/onboard'>
        <Button customClass="!w-full !h-[58px] mt-4 !text-white">
          Create Account
        </Button>
        </Link>
      </form>
    </div>
  );
};

export default CreateAccount;
