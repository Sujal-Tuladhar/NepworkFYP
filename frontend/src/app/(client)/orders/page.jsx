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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const OrdersPage = () => {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const response = await fetch("http://localhost:7700/api/order/getOrder", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.data || []);
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

  const handleKhaltiPayment = async (order) => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to make payment");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/initialize-khalti`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order._id,
            website_url: window.location.origin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      // Redirect to Khalti payment page
      window.location.href = data.paymentInitiate.payment_url;
    } catch (error) {
      console.error("Error initializing Khalti payment:", error);
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId) => {
    setShowPaymentDialog(false);
    router.push(`/payment-success?payment_id=${paymentId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  // Show loading state while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Don't render anything if not logged in
  // The useEffect will handle the redirect
  if (!isLoggedIn) {
    return null;
  }

  // Table view for both sellers and buyers
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {user?.isSeller ? "Orders Received" : "My Orders"}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            {user?.isSeller ? "No orders received yet" : "No orders placed yet"}
          </h2>
          <p className="text-gray-600 mb-4">
            {user?.isSeller
              ? "You haven't received any orders yet."
              : "You haven't placed any orders yet."}
          </p>
          {!user?.isSeller && (
            <Link
              href="/gigs"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Gigs
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-black">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gig
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {user?.isSeller ? "Buyer" : "Seller"}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Escrow Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Work Status
                  </th>
                  {!user?.isSeller && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.gigId?.title || "Gig Title"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.gigId?.shortDesc || "Short Description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Rs {order.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
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
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.isSeller
                              ? order.buyerId?.username || "Buyer"
                              : order.sellerId?.username || "Seller"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
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

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Seller:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.sellerWorkStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.sellerWorkStatus
                              ? "Completed"
                              : "In Progress"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Buyer:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.buyerWorkStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.buyerWorkStatus
                              ? "Completed"
                              : "In Progress"}
                          </span>
                        </div>
                      </div>
                    </td>
                    {!user?.isSeller && order.isPaid !== "completed" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStripePayment(order)}
                            disabled={paymentLoading}
                            className={`px-4 py-2 rounded ${
                              paymentLoading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                          >
                            {paymentLoading
                              ? "Processing..."
                              : "Pay with Stripe"}
                          </button>
                          <button
                            onClick={() => handleKhaltiPayment(order)}
                            disabled={paymentLoading}
                            className={`px-4 py-2 rounded ${
                              paymentLoading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white`}
                          >
                            {paymentLoading
                              ? "Processing..."
                              : "Pay with Khalti"}
                          </button>
                        </div>
                      </td>
                    )}
                    {order.isPaid === "completed" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <WorkStatusButton
                          order={order}
                          isSeller={user?.isSeller}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      </td>
                    )}

                    {!user?.isSeller && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
