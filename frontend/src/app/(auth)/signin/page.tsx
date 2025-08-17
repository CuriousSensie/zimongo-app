"use client";
import React, { useState } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { userSignInSchema } from "@/schema/auth.schema";
import axios from "axios";
import { ErrorLabel } from "@/components/ErrorLabel/ErrorLabel";
import Image from "next/image";
import { HiLockClosed, HiOutlineMail } from "react-icons/hi";
import { FaCircleExclamation, FaCircleInfo } from "react-icons/fa6";
import FullTextLogo from "@/components/Logos/FullTextLogo";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    signinPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [isRemember, setIsRemember] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const validateForm = () => {
    try {
      let formData = {
        email: email ? email : undefined,
        signinPassword: password ? password : undefined,
      };
      userSignInSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; signinPassword?: string } = {};
        error.issues.forEach((error) => {
          newErrors[error.path[0] as keyof typeof newErrors] = error.message;
        });
        setErrors(newErrors);
        throw new Error("form invalid");
      }
    }
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    if (loginAttempt >= 4) {
      setError(
        "Too many failed attempts. Please wait 2 minutes before trying again or reset your password",
      );
      setTimeout(
        () => {
          setLoginAttempt(0);
          setError(null);
        },
        2 * 60 * 1000,
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      validateForm();
      const {
        data: { ip },
      } = await axios.get("/api/internal/getIp");
      const response = await signIn("userSignIn", {
        email,
        password,
        redirect: false,
        ip,
        isRemember,
      });
     
      if(response?.status === 401){
        toast({
          title: "Invalid credentials",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      if (response?.error) {
        setLoginAttempt((prev) => prev + 1);
      }
      if (response?.status === 200) {
        toast({
          title: "Sign in success",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setError(null);
        setLoginAttempt(0);
        const session = (await getSession()) as any;
        if (session?.user?.is2FA) {
          localStorage.setItem("email", session?.user?.me.email as string);
          router.replace(`/verify`);
        } else {
          if (session?.user?.me?.isAdmin) {
            router.replace("/"); // admin redirect
          } else {
            router.replace("/"); // user redirect
          }
        }
      } else if (response?.error?.includes("403")) {
        setError("User is inactive Please contact your admin.");
        return;
      } else {
        setError(
          "Password or email do not match. Please re-check your email or password",
        );
      }
    } catch (error) {
      console.log("sign in error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEye = () => {
    setShowPassword((prev) => !prev);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between font-inter">
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 py-2 sm:px-10 bg-zimongo-header-base"
      >
        <FullTextLogo />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center bg-zimongo-bg">
        <h1 className="mt-4 flex gap-2 items-center px-4 py-2 text-center text-2xl font-bold sm:mb-3 ">
          Welcome to <span className="text-4xl text-zimongo-primary">Zimongo</span>
        </h1>
        <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg sm:px-6 sm:py-5.5">
          <h2 className="text-gray-800 mb-2 text-center text-xl font-bold sm:mb-3 sm:text-2xl">
            Login
          </h2>
          {error && (
            <div className="mb-3.5 flex min-h-8 flex-nowrap items-center justify-center gap-x-2 rounded-md border border-[#374151] bg-[#F3F4F6] p-3 text-[#374151] sm:p-4 md:min-h-10">
              <FaCircleExclamation className="w-6 sm:w-8" />
              <p className="text-sm font-normal">{error}</p>
            </div>
          )}

          <form onKeyDown={handleKeyDown}>
            <div>
              <label className="text-gray-700 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm">
                Email Address <span className="text-red">*</span>
              </label>
              <div className="relative mb-2.5">
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={handleEmail}
                  className="border-gray-300 text-gray-700 w-full rounded-md border px-9 py-2.5 text-xs focus:border-black focus:outline-none  sm:text-sm"
                  onFocus={() => setErrors({ ...errors, email: undefined })}
                />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 transform" />
              </div>
            </div>
            {errors.email && <ErrorLabel error={errors.email} />}

            <div className="my-2.5">
              <label className="text-gray-700 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm">
                Password <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePassword}
                  className="border-gray-300 text-gray-700 w-full rounded-md border px-9 py-2.5 text-xs focus:border-black focus:outline-none sm:text-sm"
                  onFocus={() =>
                    setErrors({ ...errors, signinPassword: undefined })
                  }
                />
                <HiLockClosed
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform"
                  size={18}
                />
                <div
                  className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
                  onClick={handleEye}
                >
                  {showPassword ? (
                    <AiFillEye size={18} />
                  ) : (
                    <AiFillEyeInvisible size={18} />
                  )}
                </div>
              </div>
            </div>
            {errors.signinPassword && (
              <ErrorLabel error={errors.signinPassword} />
            )}
            <div className="my-6 flex flex-wrap items-center justify-between gap-y-2 sm:flex-nowrap">
              <label className="text-gray-600 flex items-center text-xs sm:text-sm">
                <input
                  type="checkbox"
                  className="border-gray-300 text-blue-500 focus:ring-blue-400 mr-2 h-3 w-3 rounded sm:h-4 sm:w-4"
                  checked={isRemember}
                  onChange={(e) => setIsRemember(e.target.checked)}
                />
                Remember me
              </label>
              <Link
                href="/reset-password"
                className="text-blue-500 text-xs hover:underline sm:text-sm"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              name="submit"
              className="w-full py-2 text-sm text-white sm:py-3 bg-zimongo-primary"
              onClick={handleSubmit}
              disabled={(!email || !password) && true}
              loading={loading}
            >
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-custom-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
