"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import newRequest from "@/app/utils/newRequest.js";
import upload from "@/app/utils/upload.js";

const RegisterPage = () => {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    img: "",
    country: "",
    isSeller: false,
    desc: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const router = useRouter();
  const countries = [
    "United States",
    "Canada",
    "Morocco",
    "Nepal",
    "Netherlands",
    "New Zealand",
  ];

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUser((prev) => ({ ...prev, email }));
    setEmailValid(validateEmail(email));
  };

  const handleSendOtp = async () => {
    if (!emailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await newRequest.post("auth/send-registration-otp", {
        email: user.email,
      });
      toast.success("OTP sent successfully");
      setOtpSent(true);
      setResendTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await newRequest.post("auth/verify-registration-otp", {
        email: user.email,
        otp,
      });
      toast.success("OTP verified successfully");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validateForm = () => {
    if (!user.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    if (!emailValid) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!otpVerified) {
      toast.error("Please verify your email with OTP");
      return false;
    }

    if (!user.password) {
      toast.error("Password is required");
      return false;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(user.password)) {
      toast.error(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return false;
    }

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const url = file ? await upload(file) : "";
      console.log("Uploaded URL:", url);

      await newRequest.post("auth/register", {
        ...user,
        profilePic: url,
      });
      toast.success("Registration successful! Redirecting to login");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <Toaster richColors position="top-right" />
        <div className="w-full max-w-4xl bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Create a New Account</h1>
              <h2 className="text-2xl font-bold p-2 border-b-2 border-l-2 border-black">
                Register
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">E-Mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="E-Mail"
                      className="w-full p-2 border-2 border-black rounded-lg pr-10"
                      value={user.email}
                      onChange={handleEmailChange}
                      disabled={otpSent}
                    />
                    {emailValid && !otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 p-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        {sendingOtp ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <label className="font-medium">OTP</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        className="w-full p-2 border-2 border-black rounded-lg pr-10"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        disabled={otpVerified}
                      />
                      {otp.length === 6 && !otpVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 p-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                        >
                          {verifyingOtp ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <svg
                              className="h-5 w-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                      {otpVerified && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 p-1 rounded-lg border-2 border-black">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-600">
                        Resend OTP in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="text-sm px-3 py-1 border-2 border-black rounded-lg rounded-br-3xl bg-blue-200 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(129,197,255,1)] transition-shadow"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Country</label>
                  <select
                    name="country"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                    value={user.country}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Phone No</label>
                  <input
                    type="phone"
                    name="phone"
                    placeholder="+977-98XXXXXXXX"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Profile Picture</label>
                  <input
                    type="file"
                    className="w-full p-2 border-2 border-black rounded-lg rounded-br-3xl file:mr-4 file:py-1 file:px-4 file:border-2 file:border-black file:rounded-lg file:bg-white file:text-black file:cursor-pointer hover:file:bg-gray-100"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium">User Description</label>
                  <textarea
                    placeholder="A short description of yourself"
                    name="desc"
                    rows="4"
                    className="w-full p-2 border-2 border-black rounded-lg"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={loading || !otpVerified}
                className={`px-8 py-2 text-lg font-bold border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(129,197,255,1)] transition-all ${
                  loading || !otpVerified
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-200 hover:bg-blue-300"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-black">
            <p className="text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
