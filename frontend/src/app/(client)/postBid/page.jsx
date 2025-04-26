"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import upload from "@/app/utils/upload";

const PostBid = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    category: "",
    expectedDurationDays: "",
    attachments: [],
    expiryDays: "7", // Default to 7 days
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("currentUser");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:7700/api/user/getUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (data.isSeller) {
          toast.error(
            "Sellers cannot post projects. Please use a buyer account."
          );
          router.push("/allBidPost");
          return;
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      toast.error("Please login to post a bid");
      router.push("/login");
    }
  }, [loading, isLoggedIn, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map((file) => upload(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      // Filter out any null values from failed uploads
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validUrls],
      }));

      if (validUrls.length > 0) {
        toast.success("Files uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to post a bid");
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("currentUser");
      const response = await axios.post(
        "http://localhost:7700/api/project/createProject",
        {
          ...formData,
          budgetMin: Number(formData.budgetMin),
          budgetMax: Number(formData.budgetMax),
          expectedDurationDays: Number(formData.expectedDurationDays),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast.success("Project created successfully!");
        router.push("/allBidPost");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to create project");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Toaster richColors position="top-right" />

      <div className="max-w-2xl mx-auto bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create New Project
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 border-black rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-2 border-2 border-black rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Budget
              </label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                required
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum Budget
              </label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                required
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expected Duration (Days)
            </label>
            <input
              type="number"
              name="expectedDurationDays"
              value={formData.expectedDurationDays}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 border-black rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 border-black rounded-lg"
            >
              <option value="">Select a category</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Bid Expiry Duration (Days)
            </label>
            <select
              name="expiryDays"
              value={formData.expiryDays}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 border-black rounded-lg"
            >
              <option value="1">1 Day</option>
              <option value="2">2 Days</option>
              <option value="3">3 Days</option>
              <option value="4">4 Days</option>
              <option value="5">5 Days</option>
              <option value="6">6 Days</option>
              <option value="7">7 Days</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              After this period, your bid will automatically expire if no offer
              is selected
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Add File With More Information about the Project:
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*"
              />
              <label
                htmlFor="file-upload"
                className="flex-1 p-2 border-2 border-black rounded-lg cursor-pointer text-center hover:bg-gray-50"
              >
                {uploading ? "Uploading..." : "Choose Files"}
              </label>
            </div>
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Uploaded files:</p>
                <ul className="space-y-1">
                  {formData.attachments.map((url, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 border-2 border-black rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        File {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 border-2 border-black font-semibold hover:bg-blue-300 transition-colors shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostBid;
