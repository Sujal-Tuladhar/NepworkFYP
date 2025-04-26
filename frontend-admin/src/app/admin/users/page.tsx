"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  isSeller: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userStats, setUserStats] = useState({ sellers: 0, buyers: 0 });
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      const res = await axios.get<UsersResponse>(
        `http://localhost:7700/api/admin/users?page=${page}&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers(res.data.users);
      setTotalPages(Math.ceil(res.data.total / res.data.limit));

      // Calculate user stats
      const sellers = res.data.users.filter((user) => user.isSeller).length;
      const buyers = res.data.users.length - sellers;
      setUserStats({ sellers, buyers });
    } catch (err) {
      console.error("Error fetching users:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          Cookies.remove("accessToken");
          localStorage.removeItem("adminUser");
          router.push("/login");
        } else {
          setError("Failed to load users");
        }
      } else {
        setError("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:7700/api/admin/users/${userId}/status`,
        { isBanned },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status");
    }
  };

  const pieData = [
    { name: "Sellers", value: userStats.sellers },
    { name: "Buyers", value: userStats.buyers },
  ];

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
      <h1 className="text-2xl font-bold">Users Management</h1>

      {/* User Stats Pie Chart */}
      <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
        <h2 className="text-xl font-bold mb-4">User Distribution</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#0088FE] mr-2"></div>
              <span>Sellers: {userStats.sellers}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#00C49F] mr-2"></div>
              <span>Buyers: {userStats.buyers}</span>
            </div>
            <div className="pt-4">
              <p className="font-medium">
                Total Users: {userStats.sellers + userStats.buyers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and User List */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="w-full p-2 border-2 border-black rounded-lg pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      {user.isAdmin && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                      {user.isSeller && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Seller
                        </span>
                      )}
                      {user.isBanned && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleBanUser(user._id, !user.isBanned)}
                      className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${
                        user.isBanned
                          ? "border-green-500 bg-green-100 text-green-800 hover:bg-green-200"
                          : "border-red-500 bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
