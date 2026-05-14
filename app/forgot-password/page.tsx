"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { authService } from "../../lib/api-services";

const ForgotPassword: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");

  const steps = [
    <StepOne
      key="step1"
      setCurrentStep={setCurrentStep}
      currentStep={currentStep}
      email={email}
      setEmail={setEmail}
    />,
    <StepTwo
      key="step2"
      setCurrentStep={setCurrentStep}
      currentStep={currentStep}
      email={email}
      setResetToken={setResetToken}
    />,
    <StepThree key="step3" resetToken={resetToken} />,
  ];

  return (
    <AuthLayout>
      <div className="bg-white p-4 p-8 rounded-[24px] max-w-[500px] mx-auto">
        {steps[currentStep]}
      </div>
    </AuthLayout>
  );
};

// ── Step One: Enter Email ─────────────────────────────────────────────────────

const StepOne = ({
  setCurrentStep,
  currentStep,
  email,
  setEmail,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  email: string;
  setEmail: (val: string) => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setCurrentStep(currentStep + 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <h2 className="text-[32px] font-bold text-center leading-none">
        Forgot Password
      </h2>
      <p className="text-[20px] text-[#60666B] font-[300] text-center mb-8 mt-2 leading-none">
        Enter your registered email address
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="forgotEmail"
            className="block text-sm font-medium  mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Input
              variant="outlined"
              type="text"
              id="forgotEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
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
          {isSubmitting ? "Sending..." : "Proceed"}
        </Button>
      </form>
    </div>
  );
};

// ── Step Two: OTP / Token Entry ───────────────────────────────────────────────

const StepTwo = ({
  setCurrentStep,
  currentStep,
  email,
  setResetToken,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  email: string;
  setResetToken: (token: string) => void;
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [fallbackToken, setFallbackToken] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setResendMessage(null);
    setError(null);
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      setResendMessage("A new reset token has been sent.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to resend. Please try again.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Prefer the fallback text input if filled, otherwise use OTP boxes
    const token = fallbackToken.trim() || otp.join("");
    if (!token) {
      setError("Please enter your reset token.");
      return;
    }
    setResetToken(token);
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center">
        Enter OTP
      </h2>
      <p className="text-[20px] text-[#60666B] font-[300] mb-8 mt-2 text-center leading-none">
        We sent an otp to {email || "your email"}. Please check your inbox and enter
        the code below.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-none focus:border-transparent"
            />
          ))}
        </div>

        {/* Dev-mode fallback for full hex token */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 text-center mb-1">
            In development mode, check the server console for your reset token and paste it below.
          </p>
          <Input
            variant="outlined"
            type="text"
            id="fallbackToken"
            value={fallbackToken}
            onChange={(e) => setFallbackToken(e.target.value)}
            placeholder="Paste full reset token here (dev mode)"
          />
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-purple-600"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
          {resendMessage && (
            <p className="text-green-600 text-xs mt-1">{resendMessage}</p>
          )}
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

// ── Step Three: Reset Password ────────────────────────────────────────────────

const StepThree = ({ resetToken }: { resetToken: string }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token: resetToken, password, confirmPassword });
      router.push("/login?reset=true");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <h2 className="text-[32px] font-bold leading-none text-center mb-8">
        Reset Password
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium  mb-2">
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
              id="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="confirmNewPassword"
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
              id="confirmNewPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re enter password"
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
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
