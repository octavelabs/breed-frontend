"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { Eye, EyeIcon, EyeOffIcon } from "lucide-react";

const CreateAccount: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const steps = [
    <StepOne setCurrentStep={setCurrentStep} currentStep={currentStep} />,
    <StepTwo />,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // navigate('/create-password');
  };

  return <AuthLayout>{steps[currentStep]}</AuthLayout>;
};

const StepOne = ({
  setCurrentStep,
  currentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center mb-8">Create an Account</h2>

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
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-purple-600 hover:underline font-medium"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

const StepTwo = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center mb-8">Create Password</h2>

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
        <Button customClass="!w-full !h-[58px] mt-4 !text-white">
          Create Account
        </Button>
      </form>
    </div>
  );
};

export default CreateAccount;
