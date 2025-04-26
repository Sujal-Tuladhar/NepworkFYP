import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import WorkStatusButton from "@/components/WorkStatusButton";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const BidOrders = ({ orders, isSeller, onStatusUpdate }) => {
  const router = useRouter();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleMessageClick = async (order) => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to send messages");
        return;
      }

      // Get the other user's ID (seller or buyer)
      const otherUserId = isSeller ? order.buyerId?._id : order.sellerId?._id;

      if (!otherUserId) {
        toast.error("User not found");
        return;
      }

      // Check if chat exists or create new chat
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/accessChat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: otherUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to access chat");
      }

      // Redirect to chat page with the chat ID
      router.push(`/chat/${data._id}`);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error(error.message || "Failed to access chat");
    }
  };

  const handlePay = (order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = (paymentId) => {
    setShowPaymentDialog(false);
    router.push(`/payment-success?payment_id=${paymentId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-black">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSeller ? "Buyer" : "Seller"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escrow Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {order.projectId?.title || "Project Title"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">Rs {order.price}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          isSeller
                            ? order.buyerId?.profilePic ||
                              "/images/icons/NoAvatar.svg"
                            : order.sellerId?.profilePic ||
                              "/images/icons/NoAvatar.svg"
                        }
                        alt={
                          isSeller
                            ? order.buyerId?.username || "Buyer"
                            : order.sellerId?.username || "Seller"
                        }
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {isSeller
                          ? order.buyerId?.username || "Buyer"
                          : order.sellerId?.username || "Seller"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.isPaid === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.isPaid === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.isPaid === "completed"
                      ? "Paid"
                      : order.isPaid === "pending"
                        ? "Pending"
                        : "Unpaid"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {order.escrowId ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.escrowId.status === "holding"
                          ? "bg-blue-100 text-blue-800"
                          : order.escrowId.status === "waitingToRelease"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.escrowId.status === "released"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.escrowId.status}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Escrow
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    {!isSeller && order.isPaid === "pending" && (
                      <Button
                        onClick={() => handlePay(order)}
                        className="w-full"
                      >
                        Pay Now
                      </Button>
                    )}
                    {order.isPaid === "completed" && (
                      <WorkStatusButton
                        order={order}
                        isSeller={isSeller}
                        onStatusUpdate={onStatusUpdate}
                        disabled={!isSeller && !order.sellerWorkStatus}
                        disabledMessage={
                          !isSeller && !order.sellerWorkStatus
                            ? "Seller must complete work first"
                            : ""
                        }
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleMessageClick(order)}
                    className="w-fit border-2 border-black text-white rounded-full p-3 hover:bg-teal-400"
                  >
                    <Image
                      src="/images/Navbar/Chat.svg"
                      width={24}
                      height={24}
                      alt="chat"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && selectedOrder && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                order={selectedOrder}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BidOrders;
