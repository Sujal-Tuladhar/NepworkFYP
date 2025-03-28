"use client";
import React from "react";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center p-35 bg-gray-100 overflow-hidden">
      <div className="w-full max-w-[30rem] p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
        <div className="flex justify-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-l-2 border-black pl-3 pr-1">
            Login
          </h2>
        </div>
        <form>
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="name">E-Mail</label>
            <input
              type="email"
              name="email"
              placeholder="E-Mail"
              className="border-2 p-1"
            />
          </div>
          <div className="flex flex-col gap-2 mt-3 mb-6">
            <label htmlFor="name">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border-2 p-1"
            />
          </div>

          <button className="px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Login
          </button>
        </form>
        <div className="mt-4">
          <hr className="border-t-4 border-black mt-5" />
          <div className="flex justify-between items-center mt-2">
            <p className="text-base">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 underline">
                Login
              </Link>
            </p>
            <button
              className="text-base text-blue-500 hover:underline focus:outline-none"
              onClick={() => alert("Redirect to forgot password page")}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
