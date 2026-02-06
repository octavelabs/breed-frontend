"use client";

import React, { useEffect, useRef, useState } from "react";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const steps = [
    <StepOne setCurrentStep={setCurrentStep} currentStep={currentStep} />,
    <StepTwo setCurrentStep={setCurrentStep} currentStep={currentStep}/>,
    <StepThree />
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
      <h2 className="text-[32px] font-bold text-center leading-none">Forgot Password</h2>
      <p className="text-[20px] text-[#60666B] font-[300] text-center mb-8 mt-2 leading-none">Enter your registered email address</p>

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
          type="button"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Proceed
        </Button>
      </form>

    </div>
  );
};

const StepTwo = (
    {
  setCurrentStep,
  currentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}
) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

    useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify OTP

  };


  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center">Enter OTP</h2>
      <p className="text-[20px] text-[#60666B] font-[300] mb-8 mt-2 text-center leading-none">We sent an otp to daniel@gmail.com. Please check your inbox and enter the code below.</p>

      <form className="flex flex-col gap-4">
       <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-none focus:border-transparent"
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-purple-600"
            >
              Resend OTP
            </button>
          </div>

          {/* Submit button */}
          <Button
          customClass="!w-full !h-[58px] mt-4 !text-white"
          type="button"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Proceed
        </Button>
      </form>
    </div>
  );
};


const StepThree = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center mb-8">Reset Password</h2>

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

export default ForgotPassword;
