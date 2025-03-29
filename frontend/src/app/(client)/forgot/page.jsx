"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: email input, 2: OTP input
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "http://localhost:7700/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:7700/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // If OTP is verified, redirect to reset password page
      router.push(`/reset-password?email=${email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-35 bg-gray-100 min-h-screen">
      <div className="w-full max-w-[30rem] p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
        <div className="flex justify-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-l-2 border-black pl-3 pr-1">
            Forgot Password
          </h2>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmitEmail}>
            <div className="flex flex-col gap-2 mt-3">
              <label htmlFor="email">Enter your email</label>
              <input
                type="email"
                name="email"
                placeholder="Your registered email"
                className="border-2 p-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleSubmitOtp}>
            <div className="flex flex-col gap-2 mt-3">
              <label htmlFor="otp">Enter OTP sent to {email}</label>
              <input
                type="text"
                name="otp"
                placeholder="6-digit OTP"
                className="border-2 p-1"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="text-sm mt-2">
              Didn't receive OTP?{" "}
              <button
                type="button"
                className="text-blue-500 underline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Resend
              </button>
            </p>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </form>
        )}

        <div className="mt-4">
          <hr className="border-t-4 border-black mt-5" />
          <div className="flex justify-between items-center mt-2">
            <p className="text-base">
              Remember your password?{" "}
              <Link href="/login" className="text-blue-500 underline">
                Login
              </Link>
            </p>
            <Link
              href="/register"
              className="text-base text-blue-500 hover:underline focus:outline-none"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
