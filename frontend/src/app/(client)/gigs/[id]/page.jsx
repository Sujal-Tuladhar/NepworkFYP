"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

const GigDetails = ({ params }) => {
  const router = useRouter();
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
        // Properly handle the params Promise
        const { id: gigID } = await Promise.resolve(params);

        if (!gigID) {
          throw new Error("Missing gig ID");
        }

        const token = localStorage.getItem("currentUser");
        if (!token) {
          router.push("/login");
          return;
        }

        // Match the backend route exactly
        const response = await fetch(
          `http://localhost:7700/api/gig/getGig/single/${gigID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            response.status === 404
              ? errorData.message || "Gig not found"
              : errorData.message || "Failed to fetch gig details"
          );
        }

        const data = await response.json();
        setGig(data);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message);
        setGig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGigDetails();
  }, [params, router]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id: gigID } = await Promise.resolve(params);

      if (!gigID) {
        throw new Error("Missing gig ID");
      }

      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/gig/review/${gigID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newReview),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit review");
      }

      const data = await response.json();
      setReviews(data.reviews);
      setNewReview({ rating: 5, comment: "" });
      setIsReviewing(false);
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
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
      const { id: gigID } = await Promise.resolve(params);
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
      const { id: gigID } = await Promise.resolve(params);
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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

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
                  <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
                  <div className="flex items-center gap-4">
                    {gig.user?.profilePic && (
                      <img
                        src={gig.user.profilePic}
                        alt={gig.user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h2 className="font-semibold">{gig.user?.username}</h2>
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
            <div className="relative mb-8">
              {gig.images && gig.images.length > 0 ? (
                <>
                  <img
                    src={gig.images[currentImageIndex]}
                    alt={`${gig.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                  {gig.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {gig.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
            </div>

            {/* About This Gig */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">About This Gig</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>

            {/* About The Seller */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">About The Seller</h2>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={gig.user?.profilePic || "/images/icons/NoAvatar.svg"}
                  alt={gig.user?.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{gig.user?.username}</h3>
                  <button className="text-sm text-gray-600 hover:underline">
                    About Me
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">From</p>
                  <p className="font-medium">{gig.user?.country || "USA"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium">Static</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg. Response Time</p>
                  <p className="font-medium">Static</p>
                </div>
                <div>
                  <p className="text-gray-600">Languages</p>
                  <p className="font-medium">Static</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Package Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Static</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">${gig.price}</span>
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
              <button
                onClick={() => toast.info("Order functionality coming soon!")}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reviews</h2>
              {isLoggedIn && user && user._id !== gig.userId && (
                <button
                  onClick={() => setIsReviewing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {isReviewing && (
              <form
                onSubmit={handleReviewSubmit}
                className="mb-8 p-4 border-2 border-gray-200 rounded-lg"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setNewReview({ ...newReview, rating: star })
                        }
                        className={`text-2xl ${
                          star <= newReview.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Comment
                  </label>
                  <textarea
                    required
                    className="w-full p-2 border-2 border-black rounded-lg h-32"
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsReviewing(false)}
                    className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`${
                            i < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No reviews yet. Be the first to review this gig!
                </p>
              )}
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default GigDetails;
