import express from "express";
import Gig from "../models/gig.model.js";
import { validate } from "../middleware/validate.js";
import createError from "../utils/createError.js";

const router = express.Router();

router.post("/createGig", validate, async (req, res, next) => {
  if (req.user.isSeller === false) {
    return next(createError(403, "You are not a seller"));
  }

  const newGig = new Gig({
    userId: req.user._id,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    console.error("Error in createGig:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/deleteGig/:gigId", validate, async (req, res) => {
  try {
    const { gigId } = req.params; // Get gigId from URL params

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if the logged-in user owns the gig
    if (gig.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own gigs" });
    }

    await Gig.findByIdAndDelete(gigId);
    res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGig:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getGig/single/:gigID", validate, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigID).populate("userId");
    if (!gig) {
      return next(createError(404, "Gig not found"));
    }
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
});

router.get("/getGigs", validate, async (req, res, next) => {
  try {
    const {
      minPrice,
      maxPrice,
      sortBy,
      category,
      page = 1,
      limit = 12,
      search = "",
    } = req.query;

    // Build query
    const query = {};

    // Title search
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "popular":
        sort = { starNumber: -1 };
        break;
      case "bestSelling":
        sort = { totalStars: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with filters, sort, and pagination
    const gigs = await Gig.find(query)
      .populate(
        "userId",
        "username email profilePic country phone desc isSeller"
      )
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Gig.countDocuments(query);

    res.status(200).json({
      gigs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/editGig/:gigId", validate, async (req, res) => {
  try {
    const { gigId } = req.params;
    const updateData = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if the logged-in user owns the gig
    if (gig.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own gigs" });
    }

    // Update the gig with new data
    const updatedGig = await Gig.findByIdAndUpdate(
      gigId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedGig);
  } catch (error) {
    console.error("Error in editGig:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
