"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import newRequest from "@/app/utils/newRequest";

const ProfileCard = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await newRequest.get(`/user/${userId}`);
        setUser(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load user details");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={user.profilePic || "/default-profile.png"}
              alt={user.username}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Country</span>
            <span className="font-medium">{user.country}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Phone</span>
            <span className="font-medium">{user.phone}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Account Type</span>
            <span className="font-medium">
              {user.isSeller ? "Seller" : "Buyer"}
            </span>
          </div>

          {user.desc && (
            <div className="mt-4">
              <h3 className="text-gray-600 mb-2">About</h3>
              <p className="text-gray-700">{user.desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
