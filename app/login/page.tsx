"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "../layout/AuthLayout";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { Eye, EyeIcon, EyeOffIcon } from "lucide-react";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // navigate('/create-password');
  };

  return (
    <AuthLayout>
      <div className="">
        <h2 className="text-[32px] font-bold leading-none text-center mb-8">Login to Account</h2>

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

          <div>
            <label
              htmlFor="lastName"
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
                type="text"
                id="lastName"
                onChange={() => console.log("lastname")}
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button customClass="!w-full !h-[58px] mt-[16px] mb-2 !text-white">
            Proceed
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mb-2">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-purple-600 hover:underline font-medium"
          >
            Signup
          </Link>
        </p>
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

export default Login;
