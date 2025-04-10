"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem("currentUser");
        if (!token) return;

        const response = await fetch("http://localhost:7700/api/user/getUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap justify-between items-center px-7 py-4 md:px-14 border-b-2">
      <div className="logo text-[20px] md:text-[25px] font-bold border-t-[2px] border-l-[2px] border-r-[5px] border-b-[5px] border-black rounded-tr-3xl p-1">
        <Link href="/">
          <span>NepWork</span>
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {!isLoggedIn ? (
          <>
            <Link
              href="/register"
              className="btn px-4 py-2 md:px-6 md:py-3 font-semibold bg-white text-black border-t-[2px] border-l-[2px] border-r-[4px] border-b-[4px] border-black rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="btn px-4 py-2 md:px-6 md:py-3 font-semibold bg-white text-black border-t-[2px] border-l-[2px] border-r-[4px] border-b-[4px] border-black rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
          </>
        ) : (
          <div className="relative mr-14" ref={dropdownRef}>
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                <img
                  src={user?.profilePic || "/images/icons/NoAvatar.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-lg">{user?.username}</span>
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] py-1 z-50 overflow-hidden">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/gigs"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                  onClick={() => setShowDropdown(false)}
                >
                  All Gig
                </Link>

                {user?.isSeller && (
                  <div>
                    <Link
                      href="/addGig"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                      onClick={() => setShowDropdown(false)}
                    >
                      Create Gig
                    </Link>
                  </div>
                )}
                <Link
                  href="/messages"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                  onClick={() => setShowDropdown(false)}
                >
                  Messages
                </Link>

                <Link
                  href="/orders"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 border-b-2"
                  onClick={() => setShowDropdown(false)}
                >
                  Orders
                </Link>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 rounded-br-3xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
