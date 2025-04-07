"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Review from "../Review/Review";
import { useAuth } from "@/app/context/AuthContext";

const Reviews = ({ gigId }) => {
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    star: 5,
    desc: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [gigId]);

  // Calculate if current user has already reviewed
  const hasReviewed =
    isLoggedIn &&
    reviews.some(
      (review) =>
        (review.userId._id
          ? review.userId._id.toString()
          : review.userId.toString()) === user?._id
    );

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const response = await fetch(
        `http://localhost:7700/api/review/getReviews/${gigId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!isLoggedIn) {
        toast.error("Please login to submit a review");
        return;
      }

      if (user.isSeller) {
        toast.error("Sellers cannot submit reviews");
        return;
      }

      // Check if user already reviewed (using the same logic as above)
      if (hasReviewed) {
        toast.error("You've already reviewed this gig", {
          description: "Each user can only submit one review per gig",
          action: {
            label: "OK",
            onClick: () => {},
          },
        });
        return;
      }

      if (!newReview.desc.trim()) {
        toast.error("Please write a review before submitting");
        return;
      }

      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/review/createReview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gigId,
            star: newReview.star,
            desc: newReview.desc,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      await fetchReviews();
      setNewReview({ star: 5, desc: "" });
      toast.success("Review submitted successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message, {
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/review/deleteReview/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews(reviews.filter((review) => review._id !== reviewId));
      toast.success("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white p-6 border-2 border-black rounded-tr-4xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]  ">
        <h2 className=" w-fit p-2 rounded-bl-3xl shadow-[0px_4px_0px_0px_rgba(129,197,255,1)] text-2xl font-bold mb-6 underline border-2 border-black">
          Reviews
        </h2>

        {loading ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Review
                key={review._id}
                review={review}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-black py-4">
            No reviews yet. Be the first to review this gig!
          </p>
        )}

        {/* Show review form only if user is logged in, not a seller, and hasn't reviewed */}
        {isLoggedIn && user && !user.isSeller && !hasReviewed && (
          <div
            className="mt-8 p-4  border-black border-2 rounded-tl-3xl shadow-[-4px_-4px_0px_0px_rgba(129,197,255,1)]
"
          >
            <h3 className="text-xl font-semibold mb-4">Add a review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={newReview.star}
                  onChange={(e) =>
                    setNewReview({ ...newReview, star: Number(e.target.value) })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg"
                  disabled={submitting}
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comment
                </label>
                <textarea
                  required
                  className="w-full p-2 border-2 border-black rounded-lg h-32"
                  value={newReview.desc}
                  onChange={(e) =>
                    setNewReview({ ...newReview, desc: e.target.value })
                  }
                  placeholder="Write your opinion"
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)] "
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Show message if user has already reviewed */}
        {isLoggedIn && user && !user.isSeller && hasReviewed && (
          <div
            className="mt-4 p-4 bg-blue-100 text-blue-900 rounded-br-2xl border-2  border-black
         shadow-[0_2px_8px_rgba(59,130,246,0.15)]"
          >
            You've already submitted a review for this gig.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
