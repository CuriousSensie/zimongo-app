"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Button, Spinner } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { userSignUpSchema } from "@/schema/auth.schema";
import { z } from "zod";
import axios from "axios";
import Image from "next/image";
import {
  FaCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaUser,
} from "react-icons/fa6";
import { HiLockClosed, HiOutlineMail } from "react-icons/hi";

const PASSWORD_STRENGTH = {
  WEAK: "Weak",
  MEDIUM: "Medium",
  STRONG: "Strong",
  EMPTY: "",
} as const;
type PasswordStrengthType =
  (typeof PASSWORD_STRENGTH)[keyof typeof PASSWORD_STRENGTH];

const SignUp: React.FC = () => {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrengthType>(PASSWORD_STRENGTH.EMPTY);
  const [passwordChecks, setPasswordChecks] = useState({
    hasLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handleEyePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEyeConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validateForm = () => {
    try {
      const formdata = {
        email,
        password,
        name,
        retypePassword,
      };
      userSignUpSchema.parse(formdata);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { name?: string; email?: string; password?: string } =
          {};
        err.issues.forEach((error) => {
          newErrors[error.path[0] as keyof typeof newErrors] = error.message;
        });
        setErrors(newErrors);
        console.log("Validation errors:", newErrors);
      }
    }
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleRetypePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRetypePassword(e.target.value);
  };

  const checkPasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}_|<>]/.test(password);
    setPasswordChecks({
      hasLength,
      hasNumber,
      hasSpecial,
    });

    if (hasLength && hasNumber && hasSpecial) {
      setPasswordStrength(PASSWORD_STRENGTH.STRONG);
    } else if (hasLength && (hasNumber || hasSpecial)) {
      setPasswordStrength(PASSWORD_STRENGTH.MEDIUM);
    } else {
      setPasswordStrength(PASSWORD_STRENGTH.WEAK);
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    validateForm();
    setError(null);
    if (passwordStrength !== PASSWORD_STRENGTH.STRONG) {
      setError("Password must be strong. Please follow the guidelines.");
      return;
    }
    if (password !== retypePassword) {
      setError("Passwords do not match. Please confirm your new password.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { ip },
      } = await axios.get("/api/internal/getIp");
      const response = await signIn("signUp", {
        name,
        email,
        password,
        redirect: false,
        ip,
      });
      if (response?.status === 200) {
        localStorage.setItem("email", email);
        router.replace("/verify");
      } else if (response?.error?.includes("403")) {
        setError(
          "Your email is not registered with the company. Please contact your company administrator.",
        );
      } else if (response?.status === 401) {
        setError(
          "User already exists. Please sign in or contact support.",
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setError(null);
    if (
      password.length > 0 &&
      retypePassword.length > 0 &&
      password !== retypePassword
    ) {
      setError("Passwords do not match. Please confirm your new password.");
    }
  }, [password, retypePassword]);
  const isButtonDisabled =
    !email ||
    !password ||
    !retypePassword ||
    !name ||
    passwordStrength !== PASSWORD_STRENGTH.STRONG ||
    Object.keys(errors).length > 0 ||
    loading;
  return (
    <div className="flex min-h-screen flex-col justify-between font-inter">
      {/* Header */}
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-200 px-4 py-2 sm:px-10 bg-zimongo-header-base"
      >
        <div className=" text-white bg-zimongo-primary p-3 rounded-xl">
          ZIMONGO
        </div>
      </header>

      {/* Main Content */}
      <div className="my-4 flex flex-1 flex-col items-center justify-center">
        <h1 className="mt-4 flex gap-2 items-center px-4 py-2 text-center text-2xl font-bold sm:mb-3 ">
          Welcome to <span className="text-4xl text-zimongo-primary">Zimongo</span>
        </h1>
        <div className="w-full max-w-md rounded-lg px-6 py-4 bg-white shadow-lg">
          <h2 className="text-gray-800 mb-2 text-center text-2xl font-bold sm:text-2xl">
            Sign Up
          </h2>
          <form>
            {error && (
              <div className="mb-3 flex min-h-7 flex-nowrap items-center justify-center gap-x-2 rounded-md border border-[#374151] bg-[#F3F4F6] p-2.5 text-[#374151] sm:p-3">
                <i className="flex-shrink-0">
                  <FaCircleExclamation />
                </i>
                <p className="text-sm font-normal">{error}</p>
              </div>
            )}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={handleName}
                  placeholder="Enter your full name"
                  className="border-gray-300 text-gray-700 focus:border-blue-500 w-full rounded-md border px-9 py-2.5 text-sm focus:outline-none"
                />
                <FaUser
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[#6B7280]"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red">{errors.name}</p>
              )}
            </div>
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmail}
                  placeholder="Enter your email"
                  className="border-gray-300 text-gray-700 focus:border-blue-500 w-full rounded-md border px-9 py-2.5 text-sm focus:outline-none"
                />
                <HiOutlineMail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[#6B7280]"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 mt-1 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePassword}
                  placeholder="Enter your password"
                  className="border-gray-300 text-gray-700 focus:border-blue-500 w-full rounded-md border px-9 py-2.5 text-sm focus:outline-none"
                />
                <div
                  className="text-gray-500 absolute right-3 top-3 cursor-pointer"
                  onClick={handleEyePassword}
                >
                  {showPassword ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </div>
                <HiLockClosed
                  className="absolute left-3 top-[30%] text-[#6B7280]"
                  size={20}
                />
              </div>
              {password.length > 0 && (
                <div className="mb-3.5">
                  <div>
                    <div className="flex items-center">
                      <div className="h-1 w-[90%] rounded bg-[#E5E7EB]">
                        <div
                          className={`h-1 rounded transition-colors ${passwordStrength === PASSWORD_STRENGTH.WEAK ? "w-[33%] bg-red" : passwordStrength === PASSWORD_STRENGTH.MEDIUM ? "w-[66%] bg-yellow" : "bg-green"}`}
                        ></div>
                      </div>
                      <span className="text-gray-600 ml-2 text-sm font-normal">
                        {passwordStrength}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="flex items-center gap-1 text-sm font-normal">
                      <span>
                        {passwordChecks.hasLength ? (
                          <FaCheck color="green" />
                        ) : (
                          <FaCheck color="grey" />
                        )}
                      </span>
                      At least 8 characters
                    </p>
                    <p className="flex items-center gap-1 text-sm font-normal">
                      <span>
                        {passwordChecks.hasNumber ? (
                          <FaCheck color="green" />
                        ) : (
                          <FaCheck color="grey" />
                        )}
                      </span>
                      Include numbers
                    </p>
                    <p className="flex items-center gap-1 text-sm font-normal">
                      <span>
                        {passwordChecks.hasSpecial ? (
                          <FaCheck color="green" />
                        ) : (
                          <FaCheck color="grey" />
                        )}
                      </span>
                      Include special characters
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Re-type Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={retypePassword}
                  onChange={handleRetypePassword}
                  placeholder="Re-enter your password"
                  className="border-gray-300 text-gray-700 focus:border-blue-500 w-full rounded-md border px-9 py-2.5 text-sm focus:outline-none"
                />
                <div
                  className="text-gray-500 absolute right-3 top-3 cursor-pointer"
                  onClick={handleEyeConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </div>
                <HiLockClosed
                  className="absolute left-3 top-[30%] text-[#6B7280]"
                  size={20}
                />
              </div>
            </div>
            <Button
              className="w-full"
              style={{ backgroundColor: "#0A0E1A", color: "#FFFFFF" }}
              _hover={{ backgroundColor: "#1A1F2A" }}
              onClick={handleSubmit}
              loading={loading}
              disabled={isButtonDisabled}
            >
              {loading ? <Spinner /> : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p>
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-custom-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
