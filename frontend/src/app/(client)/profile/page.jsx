"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function ProfilePage() {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    country: "",
    desc: "",
    profilePic: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("currentUser");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:7700/api/user/getUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
        setEditForm({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          country: data.country || "",
          desc: data.desc || "",
          profilePic: null,
        });
        setPreviewImage(data.profilePic || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, profilePic: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("currentUser");
      const formData = new FormData();

      // Append all form fields
      Object.keys(editForm).forEach((key) => {
        if (key === "profilePic" && editForm[key]) {
          formData.append("profilePic", editForm[key]);
        } else {
          formData.append(key, editForm[key]);
        }
      });

      const response = await fetch("http://localhost:7700/api/user/editUser", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const updatedUser = await response.json();

      // Update both the user state and preview image
      setUser(updatedUser);
      setPreviewImage(updatedUser.profilePic);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (e) => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        "http://localhost:7700/api/user/deleteUser",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setShowDeleteDialog(false);
      logout();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSellerToggle = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        "http://localhost:7700/api/user/sendSellerOTP",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setShowOTPInput(true);
      toast.success("OTP sent to your registered phone number");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOTPVerification = async () => {
    try {
      setIsVerifying(true);
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        "http://localhost:7700/api/user/verifySellerOTP",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const data = await response.json();
      setUser(data.user);
      setShowOTPInput(false);
      setOtp("");
      toast.success("Seller status updated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelOTPVerification = () => {
    setShowOTPInput(false);
    setOtp("");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
        <CardHeader className="flex flex-row items-center justify-between border-b-2 py-4 border-black">
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
          <div className="flex items-center gap-4">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button
                  className="border-2 border-black rounded-lg rounded-br-3xl hover:bg-blue-400 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] transition-all"
                  variant="outline"
                >
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold border-b-2 border-black pb-2">
                    Edit Profile
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-black">
                        <AvatarImage
                          src={
                            previewImage ||
                            user?.profilePic ||
                            "/images/icons/NoAvatar.svg"
                          }
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profilePic"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border-2 border-black cursor-pointer hover:bg-gray-100 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                      <input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Click to change profile picture
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      className="border-2 border-black"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      className="border-2 border-black"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      className="border-2 border-black"
                      value={editForm.country}
                      onChange={(e) =>
                        setEditForm({ ...editForm, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="desc"
                      className="border-2 border-black"
                      value={editForm.desc}
                      onChange={(e) =>
                        setEditForm({ ...editForm, desc: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full border-2 border-black hover:bg-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] transition-all"
                  >
                    Save Changes
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="border-2 border-black hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] transition-all"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold border-b-2 border-black pb-2">
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <Button
                    className="border-2 border-black hover:bg-gray-100 transition-all"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="border-2 border-black hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] transition-all"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex items-start space-x-6 mb-8">
            <Avatar className="h-24 w-24 border-2 border-black">
              <AvatarImage
                src={user?.profilePic || "/images/icons/NoAvatar.svg"}
                className="object-cover"
              />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">@{user?.username}</h2>
              <p className="text-gray-700 mb-4">
                {user?.desc || "No description provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Username", value: user?.username },
              { label: "Email", value: user?.email },
              { label: "Phone", value: user?.phone || "Not provided" },
              {
                label: "Account Type",
                value: user?.isSeller ? "Seller" : "Buyer",
                highlight: user?.isSeller,
              },
              { label: "Country", value: user?.country || "Not provided" },
              {
                label: "Created At",
                value: new Date(user?.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] transition-all duration-200"
              >
                <h3 className="text-sm font-medium text-gray-500 mb-1.5 tracking-wide">
                  {item.label}
                </h3>
                <p
                  className={`text-base ${
                    item.highlight
                      ? "text-green-600 font-medium"
                      : "text-gray-800"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Add seller verification section */}
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] mb-8 mt-5">
            <h2 className="text-2xl font-bold mb-4">Seller Verification</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border-2 border-black rounded-lg rounded-br-3xl p-2 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]">
                <Label htmlFor="seller-status" className="font-medium">
                  Seller Status
                </Label>
                <div className="relative group">
                  <Switch
                    id="seller-status"
                    checked={user?.isSeller}
                    onCheckedChange={
                      user?.isSeller ? undefined : handleSellerToggle
                    }
                    disabled={user?.isSeller}
                    className={`
                      border-2 border-black
                      data-[state=checked]:bg-gray-200
                      data-[state=unchecked]:bg-gray-200
                      [&>span]:border-2 [&>span]:border-black
                      ${user?.isSeller ? "cursor-not-allowed" : ""}
                    `}
                  />
                  {user?.isSeller && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-800">
                      You are already a Seller.
                    </div>
                  )}
                </div>
              </div>

              {showOTPInput && (
                <div className="flex items-center gap-2 border-2 border-black rounded-lg rounded-br-3xl p-2 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]">
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-32 border-2 border-black"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleOTPVerification}
                    disabled={isVerifying || otp.length !== 6}
                    className="p-2 border-2 border-black rounded-lg rounded-br-3xl hover:bg-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] transition-all"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={cancelOTPVerification}
                    className="p-2 border-2 border-black rounded-lg rounded-br-3xl hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
