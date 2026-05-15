"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";
import { authService } from "../../lib/api-services";

const inputCls =
  "w-full h-[48px] border border-[#B9C2CA] rounded-[10px] px-4 text-[#60666B] outline-none focus:border-purple-400 bg-white text-sm";

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
      <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[500px] mx-auto">
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

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if an account exists before sending the reset code
      const { available } = await authService.checkEmail(trimmed);
      if (available) {
        setError("No account found with this email address. Please check and try again.");
        return;
      }
      await authService.forgotPassword(trimmed);
      setCurrentStep(currentStep + 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send reset code. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-[32px] font-bold text-center leading-none">
        Forgot Password
      </h2>
      <p className="text-[16px] text-[#60666B] font-light text-center mb-8 mt-2">
        Enter your registered email address and we'll send you a 6-digit reset code.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgotEmail" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <input
            id="forgotEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className={inputCls}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-start gap-1">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button
          customClass="!w-full !h-[48px] mt-2 !text-white"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>
    </div>
  );
};

// ── Step Two: 6-digit OTP ─────────────────────────────────────────────────────

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
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      pasted.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((v) => !v);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResend = async () => {
    setResendMessage(null);
    setError(null);
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      setResendMessage("A new code has been sent to your email.");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to resend. Please try again.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = otp.join("");
    if (token.length < 6) {
      setError("Please enter all 6 digits of your reset code.");
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyResetToken(token);
      setResetToken(token);
      setCurrentStep(currentStep + 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid or expired reset code. Please try again.";
      setError(message);
      // Clear boxes so user can re-enter
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const allFilled = otp.every((d) => d !== "");

  return (
    <div>
      <h2 className="text-[32px] font-bold leading-none text-center">
        Enter Reset Code
      </h2>
      <p className="text-[16px] text-[#60666B] font-light mb-8 mt-2 text-center">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-gray-700">{email}</span>.
        Check your inbox.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* OTP boxes */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors ${
                digit
                  ? "border-purple-500 text-purple-700 bg-purple-50"
                  : "border-[#B9C2CA] text-gray-700"
              } focus:border-purple-400`}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center">
          {resendMessage && (
            <p className="text-green-600 text-sm mb-1">{resendMessage}</p>
          )}
          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-400">
              Resend code in {resendCooldown}s
            </p>
          ) : (
            <button
              type="button"
              className="text-sm text-purple-600 hover:underline disabled:opacity-50"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-start gap-1">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button
          customClass="!w-full !h-[48px] mt-2 !text-white"
          type="submit"
          disabled={!allFilled || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </div>
  );
};

// ── Step Three: New Password ──────────────────────────────────────────────────

const StepThree = ({ resetToken }: { resetToken: string }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
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
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-[32px] font-bold leading-none text-center mb-8">
        New Password
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
            New password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-2">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmNewPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={`${inputCls} pr-11 ${
                confirmPassword && password !== confirmPassword ? "border-red-400" : ""
              }`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirm((p) => !p)}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-start gap-1">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button
          customClass="!w-full !h-[48px] mt-2 !text-white"
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
