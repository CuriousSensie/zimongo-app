"use client";

import publicApi from "@/lib/publicApi";
import { Button, Input, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiMail } from "react-icons/fi";
import axios from "axios";
import { getSession } from "next-auth/react";
import FullTextLogo from "@/components/Logos/FullTextLogo";
import { extractSubdomain } from "@/utils/subdomain";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const subdomain = extractSubdomain(window.location.hostname);

  // Handle OTP input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      setError(""); // Clear error on new input
    }
  };

  // Pre-fill email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Email not found. Please sign up again.");
    }
  }, []);

  // Verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const {
        data: { ip },
      } = await axios.get("/api/internal/getIp");
      const res = await publicApi.verifyOTP({
        email,
        otp: parseInt(otp, 10),
        ip,
      });
      if (res.status === 200) {
        toast.success("Email verified successfully!");
        const session = (await getSession()) as any;
        if (!session?.user?.me?.isAdmin) {
          router.push("/");
        } else {
          if (subdomain) {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      const message =
        (err as any).response?.data?.message || "Verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      setError("Email not available");
      return;
    }

    setResendLoading(true);
    setError("");
    try {
      await publicApi.resendOTP({ email });
      toast.success("OTP resent successfully!");
    } catch (err) {
      const message = (err as any).response?.data?.message || "Resend failed";
      setError(message);
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-betweem">
      <header
        id="header"
        className="flex h-[8vh] items-center justify-between border-b border-neutral-500 px-4 py-2 sm:px-10 bg-zimongo-header-base"
      >
        <FullTextLogo />
      </header>
      <div className="m-auto w-full max-w-md rounded-lg bg-zimongo-bg shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="bg-blue-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <FiMail className="text-blue-500 h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-neutral-900">
              Verify Your Email
            </h2>
            <p className="text-sm text-neutral-600">
              We sent a verification code to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Enter 6-digit Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={handleChange}
                placeholder="••••••"
                maxLength={6}
                className="text-center text-xl tracking-[0.5em]"
                size="lg"
              />
              {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
            </div>

            <div className="space-y-4">
              <Button
                className={`w-full ${otp.length !== 6 ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"} bg-zimongo-primary  `}
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                size="lg"
              >
                {loading ? <Spinner size="sm" /> : "Verify Email"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  Didn&apos;t receive the code?{" "}
                  <Button
                    variant="subtle"
                    colorScheme="blue"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-medium"
                    size="sm"
                  >
                    {resendLoading ? <Spinner size="xs" /> : "Resend"}
                  </Button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
