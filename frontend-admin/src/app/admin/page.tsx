"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  UsersIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  price: number;
  createdAt: string;
  buyerId: {
    username: string;
    email: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalGigs: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: User[];
  recentOrders: Order[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get("accessToken");
        const adminUser = localStorage.getItem("adminUser");

        if (!accessToken || !adminUser) {
          setError("Please log in to access the dashboard");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:7700/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else {
            setError("Failed to load dashboard data. Please try again later.");
          }
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 text-black">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Gigs Card */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Gigs</h3>
              <p className="text-2xl font-bold">{stats?.totalGigs || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
              <ShoppingCartIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Orders
              </h3>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
       
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <h3 className="text-xl font-bold mb-4">Recent Users</h3>
          <ul className="space-y-4">
            {stats?.recentUsers?.map((user) => (
              <li
                key={user._id}
                className="p-4 border-2 border-black rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{user.username}</div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isAdmin
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-gray-600">{user.email}</div>
                  <div className="text-gray-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
          <ul className="space-y-4">
            {stats?.recentOrders?.map((order) => (
              <li
                key={order._id}
                className="p-4 border-2 border-black rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    Order #{order._id.slice(-6)}
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ${order.price}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-gray-600">{order.buyerId.username}</div>
                  <div className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
