"use client";
import Link from "next/link";
import React, { useState } from "react";
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

  const router = useRouter();
  const countries = [
    "United States",
    "Canada",
    "Morocco",
    "Nepal",
    "Netherlands",
    "New Zealand",
  ];

  const validateForm = () => {
    if (!user.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    if (!user.email.includes("@")) {
      toast.error("Invalid email format");
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
    }
  };

  return (
    <div>
      <div className="p-3 flex items-center justify-center  overflow-y-hidden mt-3">
        <Toaster richColors position="top-right" />
        <div className="max-w-[50rem] p-2 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center ">
              <h1 className="text-xl underline font-semibold">
                Create a New Account
              </h1>

              <h2 className="text-2xl p-2 font-bold border-b-2 border-l-2 text-gray-800">
                Register
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Left  */}
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
                  <label htmlFor="name">E-Mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="name">Profile Picture</label>
                  <input
                    type="file"
                    className="border-2 p-1 mt-1 rounded-br-3xl w-full"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
              </div>
              {/* Right  */}
              <div className="md:w-1/2 p-4 mt-1">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Country</label>
                  <select
                    name="country"
                    className="w-full p-2  border-2 "
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
                  <label htmlFor="name">Phone No</label>
                  <input
                    type="phone"
                    name="text"
                    placeholder="+977-98XXXXXXXX"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="border-2 p-1"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">User Description</label>
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
            <button className="px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Register
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
