"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import Review from "@/app/(client)/components/Review/Review";
import Reviews from "@/app/(client)/components/Reviews/Reviews";

const GigDetails = () => {
  const router = useRouter();
  const { id: gigID } = useParams();
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    shortDesc: "",
    description: "",
    price: "",
    delivery: "",
    revisions: "",
    category: "",
    features: [],
  });

  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        if (!gigID) {
          throw new Error("Missing gig ID");
        }

        const token = localStorage.getItem("currentUser");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch gig details
        const gigResponse = await fetch(
          `http://localhost:7700/api/gig/getGig/single/${gigID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!gigResponse.ok) {
          throw new Error("Failed to fetch gig details");
        }

        const gigData = await gigResponse.json();
        setGig(gigData);

        // Fetch reviews separately
        const reviewsResponse = await fetch(
          `http://localhost:7700/api/review/getReviews/${gigID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!reviewsResponse.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const reviewsData = await reviewsResponse.json();
        setGig((prevGig) => ({
          ...prevGig,
          reviews: reviewsData.data || [],
        }));
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGigDetails();
  }, [gigID, router]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (!gigID) {
        throw new Error("Missing gig ID");
      }

      const token = localStorage.getItem("currentUser");
      if (!token) {
        throw new Error("Please login to submit a review");
      }

      const response = await fetch(
        `http://localhost:7700/api/review/createReview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gigId: gigID,
            star: reviewData.star,
            desc: reviewData.desc,
          }),
        }
      );

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Failed to submit review");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      // Fetch updated reviews after successful submission
      const reviewsResponse = await fetch(
        `http://localhost:7700/api/review/getReviews/${gigID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!reviewsResponse.ok) {
        throw new Error("Failed to fetch updated reviews");
      }

      const reviewsData = await reviewsResponse.json();

      // Update the gig state with the new reviews
      setGig((prevGig) => ({
        ...prevGig,
        reviews: reviewsData.data || [],
        totalStars: (prevGig.totalStars || 0) + reviewData.star,
        starNumber: (prevGig.starNumber || 0) + 1,
      }));

      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? gig.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === gig.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleEdit = () => {
    setEditForm({
      title: gig.title,
      shortDesc: gig.shortDesc,
      description: gig.description,
      price: gig.price,
      delivery: gig.delivery,
      revisions: gig.revisions,
      category: gig.category,
      features: [...gig.features],
    });
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/gig/editGig/${gigID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gig");
      }

      const updatedGig = await response.json();
      setGig(updatedGig);
      setShowEditDialog(false);
      toast.success("Gig updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update gig");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/gig/deleteGig/${gigID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete gig");
      }

      toast.success("Gig deleted successfully!");
      router.push("/gigs");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete gig");
    }
  };

  const handleOrder = async () => {
    setOrderLoading(true);
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to place an order");
        return;
      }

      const response = await fetch(
        "http://localhost:7700/api/order/createOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gigId: gig._id,
            price: gig.price,
            paymentMethod: "khalti",
            isPaid: "pending",
          }),
        }
      );

      // First check if the response is OK
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse it as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Failed to create order");
        } catch {
          // If not JSON, use the text directly
          throw new Error(errorText || "Failed to create order");
        }
      }

      // If response is OK, parse as JSON
      const data = await response.json();

      toast.success("Order created successfully!");
      setShowOrderDialog(false);
      router.push("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  const gigAuthor = gig.userId || {};

  if (!gig) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Gig not found</h3>
          <p className="text-gray-600">
            The gig you're looking for doesn't exist or failed to load.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center text-sm">
            <Link href="/gigs" className="text-gray-500 hover:text-gray-700">
              Gig
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-700">{gig.category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Category */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-5 underline ">
                    {gig.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    {gigAuthor?.profilePic && (
                      <img
                        src={gigAuthor?.profilePic}
                        alt={gigAuthor?.username}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold mb-1">
                        {gigAuthor?.username}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span>
                          {gig.starNumber > 0
                            ? (gig.totalStars / gig.starNumber).toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {isLoggedIn && user?._id === gig.userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 hover:bg-green-300 rounded-md border-2 border-black
             shadow-[3px_3px_0_0_rgba(74,222,128)] hover:shadow-[3px_3px_0_0_rgba(34,197,94)]
             active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
             transition-all duration-150 font-medium text-gray-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 hover:bg-red-300 rounded-md border-2 border-black
                      shadow-[3px_3px_0_0_rgba(239,68,68)] hover:shadow-[3px_3px_0_0_rgba(220,38,38)]
                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                      transition-all duration-150 font-medium text-gray-900"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="relative mb-8 group">
              {/* Main image container with subtle border and shadow */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                {gig.images && gig.images.length > 0 ? (
                  <>
                    {/* Main image with smooth transition */}
                    <img
                      src={gig.images[currentImageIndex]}
                      alt={`${gig.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Navigation buttons (only show on hover when multiple images) */}
                    {gig.images.length > 1 && (
                      <>
                        {/* Previous button with modern chevron */}
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Next button with modern chevron */}
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center p-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-400 mt-2 block">
                        No images available
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modern dot indicators (only for multiple images) */}
              {gig.images && gig.images.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {gig.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "w-6 bg-black"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* About This Gig */}
            <div className="bg-white border-2 shadow-[0px_-4px_0px_0px_rgba(150,118,218,1),4px_0px_0px_0px_rgba(150,118,218,1)] border-black rounded-tr-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-8 border-b-2 border-black w-fit">
                About This Gig
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>

            {/* About The Seller */}
            <div
              className="bg-white  border-2 border-black shadow-[-4px_4px_0px_0px_rgba(150,118,218,1)]
 rounded-bl-2xl p-6 mb-8"
            >
              <h2 className="text-xl font-bold mb-8 border-b-2 border-black w-fit">
                About The Seller
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={gigAuthor?.profilePic || "/images/icons/NoAvatar.svg"}
                  alt={gigAuthor?.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{gigAuthor?.username}</h3>
                  <button className="text-sm text-gray-600 hover:underline">
                    About Me
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-600">From</p>
                  <p className="font-medium">{gigAuthor?.country || "USA"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {gigAuthor?.createdAt?.slice(0, 10)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Avg. Response Time</p>
                  <p className="font-medium">Static</p>
                </div>
                <div>
                  <p className="text-gray-600">Connect With Me</p>
                  <p className="font-medium">{gigAuthor?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Package Details */}
          <div className="lg:col-span-1">
            <div className="bg-white  p-6 border-2 border-black rounded-tl-2xl rounded-br-2xl sticky top-6 ">
              <h3 className="text-xl font-bold mb-4">{gig?.shortTitle}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">Rs {gig.price}</span>
                <span className="text-gray-600">
                  {gig.delivery} Days Delivery
                </span>
              </div>
              <p className="text-gray-700 mb-6">{gig.shortDesc}</p>
              <div className="space-y-3 mb-6">
                {gig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {user?.isSeller ? (
                <div className="text-center py-3 bg-gray-100 rounded-lg border-2 border-black mb-6">
                  <p className="text-gray-700">Sellers cannot place orders</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowOrderDialog(true)}
                  className="w-full py-3 border-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(150,118,218,1)] border-black font-medium"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews component */}
        <Reviews gigId={gigID} />
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Gig</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editForm.shortDesc}
                  onChange={(e) =>
                    setEditForm({ ...editForm, shortDesc: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg h-32"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery (days)
                  </label>
                  <input
                    type="number"
                    value={editForm.delivery}
                    onChange={(e) =>
                      setEditForm({ ...editForm, delivery: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Revisions
                  </label>
                  <input
                    type="number"
                    value={editForm.revisions}
                    onChange={(e) =>
                      setEditForm({ ...editForm, revisions: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Graphics & Design">Graphics & Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Writing & Translation">
                      Writing & Translation
                    </option>
                    <option value="Video & Animation">Video & Animation</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Programming & Tech">
                      Programming & Tech
                    </option>
                    <option value="Data">Data</option>
                    <option value="Business">Business</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Features
                </label>
                <div className="space-y-2">
                  {editForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editForm.features];
                          newFeatures[index] = e.target.value;
                          setEditForm({ ...editForm, features: newFeatures });
                        }}
                        className="flex-1 p-2 border-2 border-black rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = editForm.features.filter(
                            (_, i) => i !== index
                          );
                          setEditForm({ ...editForm, features: newFeatures });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        features: [...editForm.features, ""],
                      });
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Add Feature
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Gig</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gig? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Dialog */}
      {showOrderDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Order</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to place an order for this gig? You will be
              charged Rs {gig.price}.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowOrderDialog(false)}
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                disabled={orderLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={orderLoading}
              >
                {orderLoading ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
