"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { EyeIcon, EyeOffIcon, Check, X } from "lucide-react";
import StepProgress from "./components/StepProgress";
import { authService } from "../../lib/api-services";

// ── Country data ──────────────────────────────────────────────────────────────

const COUNTRIES = [
  { name: "Nigeria", iso: "NG", dialCode: "+234" },
  { name: "Ghana", iso: "GH", dialCode: "+233" },
  { name: "Kenya", iso: "KE", dialCode: "+254" },
  { name: "South Africa", iso: "ZA", dialCode: "+27" },
  { name: "Uganda", iso: "UG", dialCode: "+256" },
  { name: "Tanzania", iso: "TZ", dialCode: "+255" },
  { name: "Ethiopia", iso: "ET", dialCode: "+251" },
  { name: "Rwanda", iso: "RW", dialCode: "+250" },
  { name: "Cameroon", iso: "CM", dialCode: "+237" },
  { name: "Senegal", iso: "SN", dialCode: "+221" },
  { name: "Côte d'Ivoire", iso: "CI", dialCode: "+225" },
  { name: "United States", iso: "US", dialCode: "+1" },
  { name: "Canada", iso: "CA", dialCode: "+1" },
  { name: "United Kingdom", iso: "GB", dialCode: "+44" },
  { name: "Australia", iso: "AU", dialCode: "+61" },
  { name: "Germany", iso: "DE", dialCode: "+49" },
  { name: "France", iso: "FR", dialCode: "+33" },
  { name: "Netherlands", iso: "NL", dialCode: "+31" },
  { name: "Italy", iso: "IT", dialCode: "+39" },
  { name: "Spain", iso: "ES", dialCode: "+34" },
  { name: "India", iso: "IN", dialCode: "+91" },
  { name: "Brazil", iso: "BR", dialCode: "+55" },
  { name: "Jamaica", iso: "JM", dialCode: "+1-876" },
  { name: "Trinidad and Tobago", iso: "TT", dialCode: "+1-868" },
  { name: "Barbados", iso: "BB", dialCode: "+1-246" },
  { name: "Other", iso: "XX", dialCode: "+" },
];

function getFlag(iso: string): string {
  if (iso === "XX") return "🌐";
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// ── Shared input style ────────────────────────────────────────────────────────

const inputCls =
  "w-full h-[48px] border border-[#B9C2CA] rounded-[10px] px-4 text-[#60666B] outline-none focus:border-purple-400 bg-white text-sm";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepData {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  dialCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  username: string;
}

// ── Root component ────────────────────────────────────────────────────────────

const CreateAccount: React.FC = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepData, setStepData] = useState<StepData>({
    email: "",
    firstName: "",
    lastName: "",
    country: "Nigeria",
    dialCode: "+234",
    phone: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const updateStepData = (partial: Partial<StepData>) =>
    setStepData((prev) => ({ ...prev, ...partial }));

  const steps = [
    {
      content: (
        <StepOne
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: (
        <StepTwo
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: (
        <StepThree
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      ),
    },
    {
      content: <StepFour stepData={stepData} updateStepData={updateStepData} redirect={redirect} />,
    },
  ];

  return (
    <AuthLayout custom={true}>
      <StepProgress
        steps={steps}
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
  const [isChecking, setIsChecking] = useState(false);

  const handleNext = async () => {
    setError(null);
    const email = stepData.email.trim();

    if (!email) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsChecking(true);
    try {
      const result = await authService.checkEmail(email);
      if (!result.available) {
        setError(
          "An account with this email already exists. Please log in or use a different email."
        );
        return;
      }
      setCurrentStep(currentStep + 1);
    } catch {
      // If check-email call fails, allow proceeding — duplicate will be caught on final submit
      setCurrentStep(currentStep + 1);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%] sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <div className="w-[52px] h-[52px] rounded-full bg-[#FBF6FF] mb-4 flex justify-center items-center mx-auto">
        <img src="./heroImage2.svg" alt="bird" className="w-[36px] h-[36px]" />
      </div>
      <h2 className="text-[24px] font-semibold leading-none text-center mb-2">
        Create an Account
      </h2>
      <p className="text-center text-sm text-gray-600 mb-8">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-600 hover:underline font-medium">
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
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={stepData.email}
            onChange={(e) => updateStepData({ email: e.target.value })}
            placeholder="Enter email address"
            className={inputCls}
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
          loading={isChecking}
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

  const selectedCountry =
    COUNTRIES.find((c) => c.name === stepData.country) ?? COUNTRIES[0];

  const handleCountryChange = (item: { name: string }) => {
    const country = COUNTRIES.find((c) => c.name === item.name) ?? COUNTRIES[0];
    updateStepData({ country: country.name, dialCode: country.dialCode });
  };

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
    if (!stepData.country) {
      setError("Please select your location.");
      return;
    }
    // Phone is optional but if provided, validate it has digits
    if (stepData.phone && !/^\d+$/.test(stepData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number (digits only).");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%] sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-8">
        Personal Information
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
          <label htmlFor="firstName" className="block text-sm font-medium mb-2">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={stepData.firstName}
            onChange={(e) => updateStepData({ firstName: e.target.value })}
            placeholder="Enter first name"
            className={inputCls}
          />
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-2">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={stepData.lastName}
            onChange={(e) => updateStepData({ lastName: e.target.value })}
            placeholder="Enter last name"
            className={inputCls}
          />
        </div>

        {/* Location — must come BEFORE phone */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-2">
            Location
          </label>
          <Dropdown
            value={stepData.country}
            objectOptions={COUNTRIES.map((c) => ({ name: c.name }))}
            keySelector="name"
            onChange={handleCountryChange}
            className="!h-[48px] border border-[#B9C2CA] rounded-[10px] outline-none bg-white z-20"
          />
        </div>

        {/* Phone number — after location so flag/code is set */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            {/* Country flag + dial code prefix */}
            <div className="flex items-center gap-1.5 h-[48px] px-3 border border-[#B9C2CA] rounded-[10px] bg-white shrink-0 text-sm text-[#60666B] select-none">
              <span className="text-lg leading-none">{getFlag(selectedCountry.iso)}</span>
              <span>{selectedCountry.dialCode}</span>
            </div>
            <input
              id="phone"
              type="tel"
              value={stepData.phone}
              onChange={(e) =>
                updateStepData({ phone: e.target.value.replace(/\D/g, "") })
              }
              placeholder="8012345678"
              className={`${inputCls} flex-1`}
              maxLength={15}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Enter your number without the leading zero
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-start gap-1">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button customClass="!w-full !h-[48px] mt-2 !text-white" type="submit">
          Proceed
        </Button>
      </form>
    </div>
  );
};

// ── Step Three: Password ──────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(stepData.password));

  const handleNext = () => {
    setError(null);
    if (!stepData.password) {
      setError("Password is required.");
      return;
    }
    if (!allRulesPassed) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (stepData.password !== stepData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%] sm:max-w-[70%] xl:max-w-[500px] mx-auto">
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
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={stepData.password}
              onChange={(e) => updateStepData({ password: e.target.value })}
              placeholder="Enter password"
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

          {/* Live password rules */}
          {stepData.password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(stepData.password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      passed ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {passed ? <Check size={12} /> : <X size={12} />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={stepData.confirmPassword}
              onChange={(e) => updateStepData({ confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className={`${inputCls} pr-11 ${
                stepData.confirmPassword && stepData.password !== stepData.confirmPassword
                  ? "border-red-400"
                  : stepData.confirmPassword && stepData.password === stepData.confirmPassword
                  ? "border-green-400"
                  : ""
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
          {stepData.confirmPassword && stepData.password !== stepData.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {stepData.confirmPassword && stepData.password === stepData.confirmPassword && (
            <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
              <Check size={12} /> Passwords match
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-start gap-1">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button customClass="!w-full !h-[48px] mt-2 !text-white" type="submit">
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
  redirect,
}: {
  stepData: StepData;
  updateStepData: (partial: Partial<StepData>) => void;
  redirect?: string;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build E.164 phone number
  const buildPhone = (): string | undefined => {
    if (!stepData.phone) return undefined;
    const digits = stepData.phone.replace(/\D/g, "").replace(/^0+/, "");
    if (!digits) return undefined;
    return `${stepData.dialCode}${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stepData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(stepData.username)) {
      setError("Username must be 3–30 characters: letters, numbers, and underscores only.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register({
        email: stepData.email.toLowerCase().trim(),
        password: stepData.password,
        confirmPassword: stepData.confirmPassword,
        firstName: stepData.firstName.trim(),
        lastName: stepData.lastName.trim(),
        username: stepData.username.trim(),
        phone: buildPhone(),
        role: "BELIEVER",
      });
      const loginUrl = redirect
        ? `/login?registered=true&redirect=${encodeURIComponent(redirect)}`
        : `/login?registered=true`;
      router.push(loginUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[90%] sm:max-w-[70%] xl:max-w-[500px] mx-auto">
      <h2 className="text-[24px] font-semibold leading-none text-center mb-2">
        Set Username
      </h2>
      <p className="text-center text-sm text-gray-500 mb-8">
        This is how other members will see you
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm select-none">
              @
            </span>
            <input
              id="username"
              type="text"
              value={stepData.username}
              onChange={(e) =>
                updateStepData({
                  username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                })
              }
              placeholder="your_username"
              className={`${inputCls} pl-7`}
              maxLength={30}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Letters, numbers, and underscores only
          </p>
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
          loading={isSubmitting}
        >
          Create Account
        </Button>
      </form>
    </div>
  );
};

const SignupPage = () => (
  <Suspense fallback={<div className="min-h-screen bg-[#FBF6FF]" />}>
    <CreateAccount />
  </Suspense>
);

export default SignupPage;
