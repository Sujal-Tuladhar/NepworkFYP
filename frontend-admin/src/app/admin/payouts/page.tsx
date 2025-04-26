"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Escrow {
  _id: string;
  orderId: {
    _id: string;
    price: number;
    title: string;
    sellerId: {
      username: string;
      email: string;
    };
    buyerId: {
      username: string;
      email: string;
    };
  };
  status: string;
  createdAt: string;
}

interface Payout {
  _id: string;
  orderId: {
    _id: string;
    price: number;
  };
  sellerId: {
    username: string;
    email: string;
  };
  buyerId: {
    username: string;
    email: string;
  };
  amount: number;
  status: string;
  releasedBy: {
    username: string;
    email: string;
  };
  releaseDate: string;
}

export default function Payouts() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const [escrowsRes, payoutsRes] = await Promise.all([
        axios.get("http://localhost:7700/api/escrow/waiting-for-release", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get("http://localhost:7700/api/escrow/payouts", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      setEscrows(escrowsRes.data);
      setPayouts(payoutsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Cookies.remove("accessToken");
        localStorage.removeItem("adminUser");
        router.push("/login");
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      await axios.post(
        `http://localhost:7700/api/escrow/release/${escrowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchData();
    } catch (err) {
      console.error("Error releasing escrow:", err);
      setError("Failed to release escrow");
    }
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
        <h1 className="text-2xl font-bold">Payout Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 border-2 rounded-lg ${
              activeTab === "pending"
                ? "border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                : "border-gray-300 bg-gray-100 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>Pending Releases</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 border-2 rounded-lg ${
              activeTab === "history"
                ? "border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]"
                : "border-gray-300 bg-gray-100 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5" />
              <span>Payout History</span>
            </div>
          </button>
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

      {activeTab === "pending" ? (
        <div className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {escrows.length > 0 ? (
              escrows.map((escrow) => (
                <li key={escrow._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Order #{escrow.orderId._id.slice(-6)}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Amount:</span> $
                          {escrow.orderId.price}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Seller:</span>{" "}
                          {escrow.orderId.sellerId.username} (
                          {escrow.orderId.sellerId.email})
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Buyer:</span>{" "}
                          {escrow.orderId.buyerId.username} (
                          {escrow.orderId.buyerId.email})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReleaseEscrow(escrow._id)}
                      className="px-4 py-2 bg-white border-2 border-black font-semibold hover:bg-green-300 transition-colors shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Release Escrow
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                No pending escrows to release
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {payouts.length > 0 ? (
              payouts.map((payout) => (
                <li key={payout._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Payout #{payout._id.slice(-6)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Amount:</span> $
                          {payout.amount}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Seller:</span>{" "}
                          {payout.sellerId.username} ({payout.sellerId.email})
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Buyer:</span>{" "}
                          {payout.buyerId.username} ({payout.buyerId.email})
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Released by:</span>{" "}
                          {payout.releasedBy.username} on{" "}
                          {new Date(payout.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                No payout history available
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
