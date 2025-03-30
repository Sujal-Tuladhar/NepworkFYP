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
  });

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
        });
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch("http://localhost:7700/api/user/editUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
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

  const toggleSellerStatus = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch("http://localhost:7700/api/user/editUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...user,
          isSeller: !user.isSeller,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update seller status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(
        `Seller status ${updatedUser.isSeller ? "enabled" : "disabled"}`
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please log in to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-18 w-18 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="underline text-3xl">Profile</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-2 rounded-sm  p-1.5 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]">
              <Label htmlFor="seller-status">Seller Status</Label>
              <Switch
                id="seller-status"
                checked={user?.isSeller}
                onCheckedChange={toggleSellerStatus}
                className="
                    border-2 border-black
                    data-[state=checked]:bg-gray-200
                    data-[state=unchecked]:bg-gray-200
                    [&>span]:border-2 [&>span]:border-black
                "
              />
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button
                  className="border-2 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]"
                  variant="outline"
                >
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) =>
                        setEditForm({ ...editForm, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      value={editForm.desc}
                      onChange={(e) =>
                        setEditForm({ ...editForm, desc: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="text-black bg-white border-2 shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)]"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <Button
                    className="text-black border-2"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="text-black border-2"
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
        <CardContent>
          <div className="flex items-start space-x-6 mb-8">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user?.profilePic || "/images/icons/NoAvatar.svg"}
                className="object-cover"
              />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 ">@{user?.username}</h2>
              <p className="text-gray-700 mb-4">
                {user?.desc || "No description provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,0.5)] transition-all duration-200"
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
        </CardContent>
      </Card>
    </div>
  );
}
