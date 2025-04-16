"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const EscrowAdminPage = () => {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn || !user?.isAdmin) {
        router.push("/login");
        return;
      }
      fetchEscrows();
    }
  }, [isLoggedIn, user, router, authLoading]);

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/escrow/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch escrows");
      }

      const data = await response.json();
      setEscrows(data.data || []);
    } catch (error) {
      console.error("Error fetching escrows:", error);
      toast.error("Failed to load escrows");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (escrowId) => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/escrow/release/${escrowId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to release escrow");
      }

      toast.success("Escrow released successfully");
      fetchEscrows(); // Refresh escrows list
    } catch (error) {
      console.error("Error releasing escrow:", error);
      toast.error(error.message || "Failed to release escrow");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Escrow Management</h1>

      {escrows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">No escrows to manage</h2>
          <p className="text-gray-600">
            There are currently no escrows waiting for release.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-black">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Confirmed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Confirmed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {escrows.map((escrow) => (
                  <tr key={escrow._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {escrow.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rs {escrow.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          escrow.status === "waitingToRelease"
                            ? "bg-yellow-100 text-yellow-800"
                            : escrow.status === "released"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {escrow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          escrow.sellerConfirmed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {escrow.sellerConfirmed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          escrow.buyerConfirmed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {escrow.buyerConfirmed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {escrow.status === "waitingToRelease" &&
                        escrow.sellerConfirmed &&
                        escrow.buyerConfirmed && (
                          <button
                            onClick={() => handleReleaseEscrow(escrow._id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Release Escrow
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowAdminPage;
