"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  price: number;
  status: string;
  createdAt: string;
  buyerId: {
    username: string;
    email: string;
  };
  gigId: {
    title: string;
    price: number;
  };
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  statusDistribution: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchOrders = useCallback(
    async (page: number = 1, searchQuery: string = "") => {
      try {
        const adminUserStr = localStorage.getItem("adminUser");
        if (!adminUserStr) {
          router.push("/login");
          return;
        }

        const adminUser = JSON.parse(adminUserStr);
        if (!adminUser.accessToken) {
          router.push("/login");
          return;
        }

        const [ordersRes, statsRes] = await Promise.all([
          axios.get(
            `http://localhost:7700/api/admin/orders?page=${page}&search=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${adminUser.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          ),
          axios.get(`http://localhost:7700/api/admin/stats`, {
            headers: {
              Authorization: `Bearer ${adminUser.accessToken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        const data: OrdersResponse = ordersRes.data;
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setStats({
          totalOrders: statsRes.data.totalOrders,
          totalRevenue: statsRes.data.totalRevenue,
          statusDistribution: [
            {
              status: "completed",
              count:
                statsRes.data.totalOrders -
                statsRes.data.recentOrders.filter(
                  (o: Order) => o.status !== "completed"
                ).length,
            },
            {
              status: "pending",
              count: statsRes.data.recentOrders.filter(
                (o: Order) => o.status === "pending"
              ).length,
            },
            {
              status: "cancelled",
              count: statsRes.data.recentOrders.filter(
                (o: Order) => o.status === "cancelled"
              ).length,
            },
          ],
          monthlyRevenue: Array(6)
            .fill(0)
            .map((_, i) => ({
              month: new Date(
                new Date().setMonth(new Date().getMonth() - i)
              ).toLocaleString("default", { month: "short" }),
              revenue: Math.floor(Math.random() * 10000) + 1000, // Mock data - replace with actual from backend
            }))
            .reverse(),
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("adminUser");
          router.push("/login");
        } else {
          setError("Failed to load orders");
        }
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchOrders(1, e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search orders..."
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
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats and Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Stats */}
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black rounded-lg">
                <h3 className="text-sm font-medium">Total Orders</h3>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}

          {/* Monthly Revenue Bar Chart */}
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order._id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      Order #{order._id.slice(-6)}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.buyerId.username} ({order.buyerId.email})
                  </p>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    ${order.price}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {order?.gigId?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
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
              onClick={() => fetchOrders(currentPage - 1, search)}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => fetchOrders(currentPage + 1, search)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
