import React, { useState, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.projectId?.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  // Filter out any non-project orders
  const projectOrders = filteredOrders.filter((order) => order.projectId);

  const handleMessageClick = async (order) => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to send messages");
        return;
      }

      const otherUserId = isSeller ? order.buyerId?._id : order.sellerId?._id;

      if (!otherUserId) {
        toast.error("User not found");
        return;
      }

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

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      // Update order payment status and create escrow
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/updatePaymentStatus/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId,
            status: "completed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment status");
      }

      // Create escrow after successful payment
      const escrowResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/escrow/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: selectedOrder._id,
            amount: selectedOrder.price,
            status: "holding",
          }),
        }
      );

      const escrowData = await escrowResponse.json();

      if (!escrowResponse.ok) {
        throw new Error(escrowData.message || "Failed to create escrow");
      }

      setShowPaymentDialog(false);
      setSelectedOrder(null);
      router.push(`/payment-success?payment_id=${paymentId}`);
      onStatusUpdate(); // Refresh orders to show updated status
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  return (
    <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Project Orders</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-black rounded-lg rounded-br-3xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Project
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                {isSeller ? "Buyer" : "Seller"}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Payment Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Escrow Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projectOrders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {order.projectId?.title || "Project Title"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">Rs {order.price}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                      <Image
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
                        fill
                        className="rounded-full object-cover border-2 border-black"
                      />
                    </div>
                    <div>
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
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 ${
                      order.isPaid === "completed"
                        ? "bg-green-100 text-green-800 border-green-800"
                        : order.isPaid === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-800"
                          : "bg-red-100 text-red-800 border-red-800"
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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 ${
                        order.escrowId.status === "holding"
                          ? "bg-blue-100 text-blue-800 border-blue-800"
                          : order.escrowId.status === "waitingToRelease"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-800"
                            : order.escrowId.status === "released"
                              ? "bg-green-100 text-green-800 border-green-800"
                              : "bg-gray-100 text-gray-800 border-gray-800"
                      }`}
                    >
                      {order.escrowId.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border-2 border-gray-800">
                      No Escrow
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 space-y-2 min-w-[180px]">
                  {!isSeller && order.isPaid === "pending" && (
                    <Button
                      onClick={() => handlePay(order)}
                      className="w-full border-2 border-black bg-transparent text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] hover:bg-green-400 transition-all"
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
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleMessageClick(order)}
                    className="p-2 border-2 border-black rounded-full hover:bg-teal-400 shadow-[4px_4px_0px_0px_rgba(0,128,128,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(0,128,128,1)] transition-all"
                  >
                    <Image
                      src="/images/Navbar/Chat.svg"
                      width={20}
                      height={20}
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
          <DialogContent className="bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Complete Payment
              </DialogTitle>
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
