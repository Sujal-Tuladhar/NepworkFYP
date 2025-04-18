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
    <div>
      <div className="p-3 flex items-center justify-center overflow-y-hidden mt-3">
        <Toaster richColors position="top-right" />
        <div className="max-w-[50rem] p-2 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
              <h1 className="text-xl underline font-semibold">
                Create a New Account
              </h1>
              <h2 className="text-2xl p-2 font-bold border-b-2 border-l-2 text-gray-800">
                Register
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Left */}
              <div className="md:w-1/2 px-1 py-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="email">E-Mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="E-Mail"
                      className="border-2 p-1 w-full"
                      value={user.email}
                      onChange={handleEmailChange}
                      disabled={otpSent}
                    />
                    {emailValid && !otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        {sendingOtp ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        ) : (
                          <div className="border-2 border-gray-400 rounded-full p-0.5 cursor-pointer bg-gray-400">
                            <svg
                              className="h-5 w-5 text-black"
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
                      </button>
                    )}
                  </div>
                </div>
                {otpSent && (
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="">
                      <label htmlFor="otp">OTP</label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        className="border-2 p-1 w-full"
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
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          {verifyingOtp ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                          ) : (
                            <div className="border-2 border-gray-400 rounded-full p-0.5 cursor-pointer bg-gray-400">
                              <svg
                                className="h-5 w-5 text-black"
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
                        </button>
                      )}
                      {otpVerified && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <svg
                            className="h-5 w-5 text-green-500"
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
                      <p className="text-sm text-gray-500">
                        Resend OTP in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="text-sm border-2 w-fit px-3  border-black rounded-tr-2xl shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
              </div>
              {/* Right */}
              <div className="md:w-1/2 p-4 mt-1">
                <div className="flex flex-col gap-2">
                  <label htmlFor="country">Country</label>
                  <select
                    name="country"
                    className="w-full p-2 border-2"
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
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="phone">Phone No</label>
                  <input
                    type="phone"
                    name="phone"
                    placeholder="+977-98XXXXXXXX"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="profilePic">Profile Picture</label>
                  <input
                    type="file"
                    className="border-2 p-1 mt-1 rounded-br-3xl w-full"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="desc">User Description</label>
                  <textarea
                    placeholder="A short description of yourself"
                    name="desc"
                    cols="5"
                    rows="7"
                    className="border-2 p-1 text-black h-20"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className={`px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                loading || !otpVerified ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <hr className="border-t-4 border-black mt-5" />
          <p className="text-center mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
