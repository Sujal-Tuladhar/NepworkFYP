"use client";
import Link from "next/link";
import React from "react";

const RegisterPage = () => {
  return (
    <div>
      <div className="p-15 flex items-center justify-center bg-gray-100 overflow-y-hidden">
        <div className="w-full max-w-[50rem] p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
          <form>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Left  */}
              <div className="md:w-1/2 px-1 py-5  ">
                <h1 className="text-xl underline font-semibold mb-4">
                  Create a New Account
                </h1>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="border-2 p-1"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">E-Mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="E-Mail"
                    className="border-2 p-1"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border-2 p-1"
                  />
                </div>
                <div className=" mt-3">
                  <label htmlFor="name">Profile Picture</label>
                  <input
                    type="file"
                    className=" border-2 p-1 mt-1 rounded-br-3xl w-full"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
              </div>
              {/* Right  */}
              <div className="md:w-1/2 p-4 mt-12">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Country</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="border-2 p-1"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">Phone No</label>
                  <input
                    type="phone"
                    name="text"
                    placeholder="+977-98XXXXXXXX"
                    className="border-2 p-1"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="border-2 p-1"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <label htmlFor="name">User Description</label>
                  <textarea
                    placeholder="A short description of yourself"
                    name="desc"
                    cols="5"
                    rows="7"
                    className="border-2 p-1 text-black h-20 "
                  />
                </div>
              </div>
            </div>
            <button className=" px-12 py-1.5 bg-blue-200  border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  ">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
