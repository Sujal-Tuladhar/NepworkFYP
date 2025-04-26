"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import upload from "@/app/utils/upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const ProjectDetails = () => {
  const { Id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [bids, setBids] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bidForm, setBidForm] = useState({
    amount: "",
    proposal: "",
    deliveryDays: "",
    attachments: [],
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("currentUser");
        const [projectResponse, bidsResponse] = await Promise.all([
          axios.get(
            `http://localhost:7700/api/project/getProject/single/${Id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`http://localhost:7700/api/bid/getProjectBids/${Id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProject(projectResponse.data);
        setBids(bidsResponse.data);

        // Calculate time remaining
        const now = new Date();
        const expiryDate = new Date(projectResponse.data.expiryDate);
        const remaining = expiryDate - now;
        setTimeRemaining(remaining);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    if (Id) {
      fetchProjectDetails();
    }
  }, [Id]);

  // Update time remaining every second
  useEffect(() => {
    if (timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1000);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map((file) => upload(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setBidForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validUrls],
      }));

      if (validUrls.length > 0) {
        toast.success("Files uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to submit a bid");
      return;
    }

    // Check if seller has already placed a bid
    const existingBid = bids.find((bid) => bid.bidderId._id === user._id);
    if (existingBid) {
      toast.error("You have already placed a bid on this project");
      return;
    }

    // Check if delivery days exceed expected duration
    if (Number(bidForm.deliveryDays) > project.expectedDurationDays) {
      toast.error(
        `Delivery days cannot exceed project's expected duration of ${project.expectedDurationDays} days`
      );
      return;
    }

    try {
      const token = localStorage.getItem("currentUser");
      const response = await axios.post(
        "http://localhost:7700/api/bid/submitBid",
        {
          projectId: Id,
          ...bidForm,
          amount: Number(bidForm.amount),
          deliveryDays: Number(bidForm.deliveryDays),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Bid submitted successfully!");
        setBids((prev) => [response.data, ...prev]);
        setBidForm({
          amount: "",
          proposal: "",
          deliveryDays: "",
          attachments: [],
        });
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to submit bid");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleBidSelect = (bid) => {
    if (user?._id === project?.clientId?._id) {
      setSelectedBid(bid);
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const token = localStorage.getItem("currentUser");

      // First update the bid status to accepted and project status to awarded
      const updateResponse = await axios.post(
        "http://localhost:7700/api/bid/updateBidStatus",
        {
          bidId: selectedBid._id,
          status: "accepted",
          projectId: Id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updateResponse.data.success) {
        throw new Error(
          updateResponse.data.message || "Failed to update bid status"
        );
      }

      // Then create the order
      const orderResponse = await axios.post(
        "http://localhost:7700/api/order/createProjectOrder",
        {
          projectId: Id,
          bidId: selectedBid._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (orderResponse.data.success) {
        // Update the bids list to reflect the selected bid
        setBids(
          bids.map((bid) =>
            bid._id === selectedBid._id
              ? { ...bid, status: "accepted" }
              : { ...bid, status: "rejected" }
          )
        );
        // Update project status
        setProject((prev) => ({ ...prev, status: "awarded" }));
        setIsConfirmDialogOpen(false);

        // Redirect to orders page
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to create order");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Project not found</p>
      </div>
    );
  }

  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const isExpired = timeRemaining <= 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {project.title}
              </h1>
              {isExpired ? (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  Expired
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {daysRemaining}d {hoursRemaining}h remaining
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Budget Range
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    Rs {project.budgetMin.toLocaleString()} - Rs{" "}
                    {project.budgetMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Expected Duration
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {project.expectedDurationDays} days
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Category
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {project.category}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

            {project.attachments && project.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  More Detail About The Project
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <p className="text-sm text-gray-600 truncate">
                        Attachment {index + 1}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buyer Details Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Buyer Information
            </h2>
            <div className="flex items-center space-x-4">
              <img
                src={project.clientId.profilePic}
                alt={project.clientId.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {project.clientId.username}
                </h3>
                <p className="text-gray-600">{project.clientId.country}</p>
                <p className="text-gray-600">{project.clientId.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bid Form and Existing Bids */}
        <div className="space-y-6">
          {/* Bid Submission Form */}
          {user?.isSeller && !isExpired && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Submit Your Bid
              </h2>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Bid Amount (Rs)
                  </label>
                  <input
                    type="number"
                    value={bidForm.amount}
                    onChange={(e) =>
                      setBidForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                    min={project.budgetMin}
                    max={project.budgetMax}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Time (Days)
                  </label>
                  <input
                    type="number"
                    value={bidForm.deliveryDays}
                    onChange={(e) =>
                      setBidForm((prev) => ({
                        ...prev,
                        deliveryDays: e.target.value,
                      }))
                    }
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Proposal
                  </label>
                  <textarea
                    value={bidForm.proposal}
                    onChange={(e) =>
                      setBidForm((prev) => ({
                        ...prev,
                        proposal: e.target.value,
                      }))
                    }
                    required
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="mt-1 block w-full"
                  />
                  {uploading && (
                    <p className="mt-1 text-sm text-gray-500">
                      Uploading files...
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {uploading ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
            </div>
          )}

          {/* Existing Bids Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Existing Bids
            </h2>
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid._id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 ${
                      bid.status === "selected"
                        ? "bg-green-50 border-green-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={bid.bidderId.profilePic}
                          alt={bid.bidderId.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">
                          {bid.bidderId.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold">
                          Rs {bid.amount.toLocaleString()}
                        </span>
                        {user?._id === project?.clientId?._id &&
                          project?.status === "open" &&
                          bid.status !== "selected" && (
                            <button
                              onClick={() => handleBidSelect(bid)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                              Select Bid
                            </button>
                          )}
                        {bid.status === "selected" && (
                          <span className="text-green-600 font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Delivery in {bid.deliveryDays} days
                    </p>
                    <p className="text-sm text-gray-700">{bid.proposal}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmation Dialog */}
          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Bid Selection</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700">
                  Are you sure you want to select this bid from{" "}
                  {selectedBid?.bidderId?.username}?
                </p>
                <p className="mt-2 text-gray-600">
                  Amount: Rs {selectedBid?.amount?.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Delivery Time: {selectedBid?.deliveryDays} days
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmOrder}>Confirm Selection</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment Dialog */}
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

export default ProjectDetails;
