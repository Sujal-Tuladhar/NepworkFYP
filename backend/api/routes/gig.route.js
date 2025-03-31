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
    const gig = await Gig.findById(req.params.gigID);
    if (!gig) {
      return next(createError(404, "Gig not found"));
    }
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
});

router.get("/getGigs/", validate, async (req, res, next) => {
  const gigs = await Gig.find();
  res.status(200).send(gigs);
});

export default router;
