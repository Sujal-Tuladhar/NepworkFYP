import express from "express";
import { validate } from "../middleware/validate.js";
import Review from "../models/review.model.js";
import createError from "../utils/createError.js";
import Gig from "../models/gig.model.js";

const router = express.Router();

router.post("/createReview", validate, async (req, res, next) => {
  try {
    const { gigId, star, desc } = req.body;

    if (!gigId || !star || !desc) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: gigId, star, or desc",
      });
    }

    if (req.user.isSeller) {
      return res.status(403).json({
        success: false,
        message: "Sellers are not allowed to review",
      });
    }

    // Check if the user already left a review
    const existingReview = await Review.findOne({
      gigId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(403).json({
        success: false,
        message: "You have already submitted a review",
      });
    }

    // Create new review
    const newReview = new Review({
      userId: req.user._id,
      gigId,
      star,
      desc,
    });

    const savedReview = await newReview.save();

    // Update gig's totalStars and starNumber
    await Gig.findByIdAndUpdate(gigId, {
      $inc: { totalStars: star, starNumber: 1 },
    });

    res.status(201).json({
      success: true,
      data: savedReview,
    });
  } catch (err) {
    console.error("Review creation error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/getReviews/:gigId", validate, async (req, res, next) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId })
      .populate({
        path: "userId",
        select: "username profilePic country", // Only these fields
        model: "User", // Explicit model reference
      })
      .lean(); // Convert to plain JS objects

    console.log("Fetched reviews:", reviews);
    res.status(200).json({ data: reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return next(createError(500, "Internal Server Error"));
  }
});

router.delete("/deleteReview/:reviewId", validate, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    // Note: Changed from req.userId to req.user._id to match your auth structure
    if (review.userId.toString() !== req.user._id.toString()) {
      return next(createError(403, "You can only delete your own reviews"));
    }

    // First, update the gig's star ratings before deleting
    await Gig.findByIdAndUpdate(review.gigId, {
      $inc: { totalStars: -review.star, starNumber: -1 },
    });

    // Then delete the review
    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    return next(createError(500, "Internal Server Error"));
  }
});
export default router;
