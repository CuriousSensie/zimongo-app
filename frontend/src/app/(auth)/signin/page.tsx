"use client";
import React, { useState } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { userSignInSchema } from "@/schema/auth.schema";
import axios from "axios";
import { ErrorLabel } from "@/components/ErrorLabel/ErrorLabel";
import Image from "next/image";
import { HiLockClosed, HiOutlineMail } from "react-icons/hi";
import { FaCircleExclamation } from "react-icons/fa6";
import FullTextLogo from "@/components/Logos/FullTextLogo";
import { isSubdomain } from "@/utils/subdomain";
import { toast } from "sonner";

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
  const isASubdomain = isSubdomain(window.location.hostname);

  const validateForm = () => {
    try {
      userSignInSchema.parse({
        email: email || undefined,
        signinPassword: password || undefined,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { email?: string; signinPassword?: string } = {};
        err.issues.forEach((issue) => {
          newErrors[issue.path[0] as keyof typeof newErrors] = issue.message;
        });
        setErrors(newErrors);
        throw new Error("form invalid");
      }
    }
  };

  const handleSubmit = async () => {
    if (loginAttempt >= 4) {
      setError(
        "Too many failed attempts. Please wait 2 minutes before retrying."
      );
      setTimeout(
        () => {
          setLoginAttempt(0);
          setError(null);
        },
        2 * 60 * 1000
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      validateForm();

      const { data: { ip } = {} } = await axios
        .get("/api/internal/getIp")
        .catch(() => ({ data: { ip: undefined } }));

      const response = await signIn("userSignIn", {
        email,
        password,
        redirect: false,
        ip,
        isRemember,
      });

      // debug
      console.log("signIn response:", response);

      if (response?.error) {
        setLoginAttempt((prev) => prev + 1);

        // Normalize message
        const raw = (response.error || "").toString().toLowerCase();
        let displayMsg = "Invalid email or password.";

        if (raw.includes("blocked"))
          displayMsg = "Your account is blocked. Please contact support.";
        else if (raw.includes("email") && raw.includes("verify"))
          displayMsg = "Please verify your email before logging in.";
        else if (
          raw.includes("unverified") ||
          raw.includes("email_not_verified")
        )
          displayMsg = "Please verify your email before logging in.";
        else if (raw.includes("deactivated"))
          displayMsg = "Your account was deactivated. Contact support.";
        else if (raw.includes("network") || raw.includes("reach"))
          displayMsg = "Network error. Please try again later.";
        else if (raw.startsWith("http_"))
          displayMsg = "Server error occurred. Please try again.";

        setError(displayMsg);
        toast.error(displayMsg, {
          duration: 3000,
          richColors: true,
          position: "bottom-center",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return;
      }

      // On success, response.ok should be true (or no response.error)
      if (response?.ok || response?.status === 200) {
        toast.success("Sign in success", {
          duration: 3000,
          richColors: true,
          position: "bottom-center",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
        setLoginAttempt(0);

        const session = (await getSession()) as any;

        // If 2FA required, redirect to verify
        if (session?.user?.is2FA) {
          localStorage.setItem("email", session.user.me?.email ?? email);
          router.replace("/verify");
          return;
        }

        // Redirect based on role/subdomain
        if (session?.user?.me?.isAdmin) {
          router.replace("/"); // admin dashboard
        } else {
          if (isASubdomain) router.replace(`/`);
          else router.replace("/");
        }
        return;
      }

      // Fallback generic error
      setError("Login failed. Please try again.");
      setLoginAttempt((prev) => prev + 1);
      toast.error("Login failed. Please try again.", {
        duration: 3000,
        richColors: true,
        position: "bottom-center",
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    } catch (err: any) {
      console.error("Sign in error (client):", err);
      setError(err?.message || "Something went wrong. Please try again.");
      toast.error(err?.message || "Something went wrong. Please try again.", {
        duration: 3000,
        richColors: true,
        position: "bottom-center",
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
      setLoginAttempt((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col justify-between font-inter">
      <header className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 py-2 sm:px-10 bg-zimongo-header-base">
        <FullTextLogo />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center bg-zimongo-bg">
        <h1 className="mt-4 flex gap-2 items-center px-4 py-2 text-center text-2xl font-bold sm:mb-3">
          Welcome to{" "}
          <span className="text-4xl text-zimongo-primary">Zimongo</span>
        </h1>
        {isASubdomain && (
          <p className="text-sm text-zimongo-primary mb-3">
            Signin to access your dashboard.
          </p>
        )}

        <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg sm:px-6 sm:py-5.5">
          <h2 className="text-gray-800 mb-2 text-center text-xl font-bold sm:mb-3 sm:text-2xl">
            Login
          </h2>

          {error && (
            <div className="mb-3.5 flex items-center gap-x-2 rounded-md border border-gray-400 bg-gray-50 p-3 text-gray-700 sm:p-4">
              <FaCircleExclamation className="w-6 sm:w-8" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onKeyDown={handleKeyDown}>
            {/* Email */}
            <div>
              <label className="text-gray-700 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm">
                Email Address <span className="text-red">*</span>
              </label>
              <div className="relative mb-2.5">
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() =>
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                  className="border-gray-300 text-gray-700 w-full rounded-md border px-9 py-2.5 text-xs focus:border-black focus:outline-none sm:text-sm"
                />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <ErrorLabel error={errors.email} />}
            </div>

            {/* Password */}
            <div className="my-2.5">
              <label className="text-gray-700 mb-1 block text-xs font-medium sm:mb-2 sm:text-sm">
                Password <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() =>
                    setErrors((prev) => ({
                      ...prev,
                      signinPassword: undefined,
                    }))
                  }
                  className="border-gray-300 text-gray-700 w-full rounded-md border px-9 py-2.5 text-xs focus:border-black focus:outline-none sm:text-sm"
                />
                <HiLockClosed
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={18}
                />
                <div
                  className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <AiFillEye size={18} />
                  ) : (
                    <AiFillEyeInvisible size={18} />
                  )}
                </div>
              </div>
              {errors.signinPassword && (
                <ErrorLabel error={errors.signinPassword} />
              )}
            </div>

            <div className="my-6 flex flex-wrap items-center justify-between gap-y-2 sm:flex-nowrap">
              <label className="text-gray-600 flex items-center text-xs sm:text-sm">
                <input
                  type="checkbox"
                  className="border-gray-300 mr-2 h-3 w-3 rounded sm:h-4 sm:w-4"
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
              disabled={!email || !password}
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
