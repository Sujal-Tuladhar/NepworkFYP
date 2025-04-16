import React, { useState } from "react";
import { toast } from "sonner";

const WorkStatusButton = ({ order, isSeller, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const currentStatus = isSeller
    ? order.sellerWorkStatus
    : order.buyerWorkStatus;

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      const endpoint = isSeller
        ? `/escrow/update-seller-status/${order._id}`
        : `/escrow/update-buyer-status/${order._id}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            [isSeller ? "sellerWorkStatus" : "buyerWorkStatus"]: !currentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      toast.success("Status updated successfully");
      if (isSeller && !currentStatus) {
        toast.info("Work marked as complete. Waiting for buyer confirmation.");
      }
      onStatusUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStatusUpdate}
      disabled={loading}
      className={`px-4 py-2 rounded ${
        currentStatus
          ? "bg-green-500 hover:bg-green-600"
          : "bg-yellow-500 hover:bg-yellow-600"
      } text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading
        ? "Updating..."
        : currentStatus
          ? "Mark as Incomplete"
          : "Mark as Complete"}
    </button>
  );
};

export default WorkStatusButton;
