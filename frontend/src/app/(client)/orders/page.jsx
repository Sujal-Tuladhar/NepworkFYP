"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";
import WorkStatusButton from "@/components/WorkStatusButton";
import Image from "next/image";
import BidOrders from "./components/BidOrders";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const OrdersPage = () => {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [bidOrders, setBidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    // Only redirect if auth is loaded and user is not logged in
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Fetch orders if user is logged in
      if (isLoggedIn) {
        fetchOrders();
      }
    }
  }, [isLoggedIn, user, router, authLoading]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.gigId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const [gigOrdersResponse, bidOrdersResponse] = await Promise.all([
        fetch("http://localhost:7700/api/order/getOrder", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:7700/api/order/getBidOrders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!gigOrdersResponse.ok || !bidOrdersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }

      const gigOrdersData = await gigOrdersResponse.json();
      const bidOrdersData = await bidOrdersResponse.json();

      // Filter orders based on their type
      const gigOrders = (gigOrdersData.data || []).filter(
        (order) => order.gigId
      );
      const projectOrders = (bidOrdersData.data || []).filter(
        (order) => order.projectId
      );

      setOrders(gigOrders);
      setBidOrders(projectOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("currentUser");

      const response = await fetch(
        `http://localhost:7700/api/order/deleteOrder/${selectedOrder._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      setShowDeleteDialog(false);
      setSelectedOrder(null);

      // Update the orders list by filtering out the deleted order
      setOrders(orders.filter((order) => order._id !== selectedOrder._id));
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.message || "Failed to delete order");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusUpdate = () => {
    fetchOrders(); // Refresh orders after status update
  };

  const handleStripePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
    // Redirect to payment success page with the payment intent ID
    router.push(`/payment-success?payment_intent=${paymentIntentId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  const handleMessageClick = async (order) => {
    try {
      setMessageLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to send messages");
        return;
      }

      // Get the other user's ID (seller or buyer)
      const otherUserId = user?.isSeller
        ? order.buyerId?._id
        : order.sellerId?._id;

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
      router.push(`/message`);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error(error.message || "Failed to access chat");
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 border-b-2 border-black pb-4">
        {user?.isSeller ? "Orders Received" : "My Orders"}
      </h1>

      {/* Gig Orders Section */}
      <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Gig Orders</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by gig title..."
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
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,0.5)]">
            <h2 className="text-xl font-semibold mb-2">
              {user?.isSeller
                ? "No gig orders received yet"
                : "No gig orders placed yet"}
            </h2>
            <p className="text-gray-600 mb-4">
              {user?.isSeller
                ? "You haven't received any gig orders yet."
                : "You haven't placed any gig orders yet."}
            </p>
            {!user?.isSeller && (
              <Link
                href="/gigs"
                className="mt-4 inline-block px-6 py-3 border-2 border-black rounded-lg rounded-br-3xl hover:bg-blue-400 shadow-[4px_4px_0px_0px_rgba(65,105,225,1)] hover:shadow-[6px_6px_0px_0px_rgba(65,105,225,1)] transition-all"
              >
                Browse Gigs
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Gig
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    {user?.isSeller ? "Buyer" : "Seller"}
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.gigId?.title || "Gig Title"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        Rs {order.price}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10">
                          <Image
                            src={
                              user?.isSeller
                                ? order.buyerId?.profilePic ||
                                  "/images/icons/NoAvatar.svg"
                                : order.sellerId?.profilePic ||
                                  "/images/icons/NoAvatar.svg"
                            }
                            alt={
                              user?.isSeller
                                ? order.buyerId?.username || "Buyer"
                                : order.sellerId?.username || "Seller"
                            }
                            fill
                            className="rounded-full object-cover border-2 border-black"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user?.isSeller
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
                      {!user?.isSeller && order.isPaid !== "completed" && (
                        <button
                          onClick={() => handleStripePayment(order)}
                          disabled={paymentLoading}
                          className={`w-full px-3 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] text-sm ${
                            paymentLoading
                              ? "bg-gray-300 cursor-not-allowed"
                              : "hover:bg-green-400"
                          } transition-all`}
                        >
                          {paymentLoading ? "Processing..." : "Pay with Stripe"}
                        </button>
                      )}
                      {order.isPaid === "completed" && (
                        <WorkStatusButton
                          order={order}
                          isSeller={user?.isSeller}
                          onStatusUpdate={handleStatusUpdate}
                          disabled={!user?.isSeller && !order.sellerWorkStatus}
                          disabledMessage={
                            !user?.isSeller && !order.sellerWorkStatus
                              ? "Seller must complete work first"
                              : ""
                          }
                        />
                      )}
                      {!user?.isSeller && order.isPaid !== "completed" && (
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(255,99,132,1)] hover:bg-red-300 text-sm transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleMessageClick(order)}
                        disabled={messageLoading}
                        className="p-2 border-2 border-black rounded-full hover:bg-teal-400 shadow-[4px_4px_0px_0px_rgba(0,128,128,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(0,128,128,1)] transition-all"
                      >
                        {messageLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                          <Image
                            src="/images/Navbar/Chat.svg"
                            width={20}
                            height={20}
                            alt="chat"
                          />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bid Orders Section */}
      <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
        <h2 className="text-2xl font-semibold mb-6">Project Orders</h2>
        {bidOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,0.5)]">
            <h2 className="text-xl font-semibold mb-2">
              {user?.isSeller
                ? "No project orders received yet"
                : "No project orders placed yet"}
            </h2>
            <p className="text-gray-600 mb-4">
              {user?.isSeller
                ? "You haven't received any project orders yet."
                : "You haven't placed any project orders yet."}
            </p>
            {!user?.isSeller && (
              <Link
                href="/allBidPost"
                className="mt-4 inline-block px-6 py-3 border-2 border-black rounded-lg rounded-br-3xl hover:bg-blue-400 shadow-[4px_4px_0px_0px_rgba(65,105,225,1)] hover:shadow-[6px_6px_0px_0px_rgba(65,105,225,1)] transition-all"
              >
                Browse Projects
              </Link>
            )}
          </div>
        ) : (
          <BidOrders
            orders={bidOrders}
            isSeller={user?.isSeller}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Order</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border-2 border-black rounded-lg rounded-br-3xl hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border-2 border-black bg-red-500 text-white rounded-lg rounded-br-3xl hover:bg-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(255,99,132,1)]"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDialog && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                order={selectedOrder}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
