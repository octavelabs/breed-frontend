"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const verified = searchParams.get("verified");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrUsername.trim()) {
      setError("Please enter your email address or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(emailOrUsername.trim(), password, rememberMe);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      // Map backend messages to user-friendly copy
      if (raw.toLowerCase().includes("no account found")) {
        setError("No account found with that email or username. Please check and try again.");
      } else if (raw.toLowerCase().includes("incorrect password")) {
        setError("Incorrect password. Please try again or reset your password.");
      } else if (raw.toLowerCase().includes("verify your email")) {
        setError("Please verify your email address before logging in. Check your inbox.");
      } else if (raw.toLowerCase().includes("suspended")) {
        setError("Your account has been suspended. Please contact support.");
      } else if (raw.toLowerCase().includes("deactivated")) {
        setError("Your account has been deactivated. Please contact support.");
      } else if (raw.toLowerCase().includes("social login") || raw.toLowerCase().includes("google")) {
        setError("This account was created with Google. Please sign in with Google.");
      } else {
        setError(raw || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout custom={false}>
      <div className="bg-white p-4 lg:p-8 rounded-[24px] max-w-[500px] mx-auto">
        <div className="w-[52px] h-[52px] rounded-full bg-[#FBF6FF] mb-4 flex justify-center items-center mx-auto">
          <img
            src="./heroImage2.svg"
            alt="bird"
            className="w-[36px] h-[36px]"
          />
        </div>
        <h2 className="text-[24px] lg:text-[32px] font-bold leading-none text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-purple-600 hover:underline font-medium"
          >
            Signup
          </Link>
        </p>

        {registered && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">
              Account created! Check your email to verify your account before logging in.
            </p>
          </div>
        )}

        {reset && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">
              Password reset successful! You can now log in with your new password.
            </p>
          </div>
        )}

        {verified && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">
              ✓ Email verified successfully! You can now log in.
            </p>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="emailOrUsername"
              className="block text-sm font-medium  mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <Input
                variant="outlined"
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium  mb-2"
            >
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          {/* Submit button */}
          <Button
            customClass="!w-full !h-[58px] mt-[16px] mb-2 !text-white"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Proceed"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="text-purple-600 hover:underline font-medium"
          >
            Click Here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

const Login: React.FC = () => (
  <Suspense fallback={<div className="min-h-screen bg-[#FBF6FF]" />}>
    <LoginForm />
  </Suspense>
);

export default Login;
