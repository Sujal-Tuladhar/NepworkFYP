import express from "express";
import Bid from "../models/bid.model.js";
import Project from "../models/project.model.js";
import { validate } from "../middleware/validate.js";
import createError from "../utils/createError.js";

const router = express.Router();

// Submit a new bid
router.post("/submitBid", validate, async (req, res, next) => {
  try {
    // Only sellers can submit bids
    if (!req.user.isSeller) {
      return next(createError(403, "Only sellers can submit bids"));
    }

    const { projectId, amount, proposal, deliveryDays, attachments } = req.body;

    // Check if project exists and is open
    const project = await Project.findById(projectId);
    if (!project) {
      return next(createError(404, "Project not found"));
    }

    if (project.status !== "open") {
      return next(createError(400, "Project is not open for bidding"));
    }

    // Check if project has expired
    if (new Date(project.expiryDate) < new Date()) {
      return next(createError(400, "Project has expired"));
    }

    // Check if seller has already submitted a bid
    const existingBid = await Bid.findOne({
      projectId,
      bidderId: req.user._id,
      status: "pending",
    });

    if (existingBid) {
      return next(
        createError(400, "You have already submitted a bid for this project")
      );
    }

    // Create new bid
    const newBid = new Bid({
      projectId,
      bidderId: req.user._id,
      amount,
      proposal,
      deliveryDays,
      attachments: attachments || [],
      status: "pending",
    });

    const savedBid = await newBid.save();
    return res.status(201).json(savedBid);
  } catch (err) {
    console.error("Error in submitBid:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all bids for a project
router.get("/getProjectBids/:projectId", validate, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const bids = await Bid.find({ projectId })
      .populate("bidderId", "username profilePic country")
      .sort({ createdAt: -1 });

    return res.status(200).json(bids);
  } catch (err) {
    console.error("Error in getProjectBids:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Select a bid for a project
router.post("/selectBid/:bidId", validate, async (req, res, next) => {
  try {
    const { bidId } = req.params;

    // Find the bid
    const bid = await Bid.findById(bidId).populate("projectId");
    if (!bid) {
      return next(createError(404, "Bid not found"));
    }

    // Check if the user is the project owner
    if (bid.projectId.clientId.toString() !== req.user._id.toString()) {
      return next(createError(403, "Only project owner can select bids"));
    }

    // Check if project is still open
    if (bid.projectId.status !== "open") {
      return next(createError(400, "Project is not open for bid selection"));
    }

    // Check if project has expired
    if (new Date(bid.projectId.expiryDate) < new Date()) {
      return next(createError(400, "Project has expired"));
    }

    // Check if another bid has already been selected
    const existingSelectedBid = await Bid.findOne({
      projectId: bid.projectId._id,
      status: "selected",
    });

    if (existingSelectedBid) {
      return next(
        createError(400, "A bid has already been selected for this project")
      );
    }

    // Update the bid status to selected
    bid.status = "selected";
    await bid.save();

    // Update project status to in-progress
    await Project.findByIdAndUpdate(bid.projectId._id, {
      status: "in-progress",
    });

    return res.status(200).json(bid);
  } catch (err) {
    console.error("Error in selectBid:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update bid status and project status
router.post("/updateBidStatus", validate, async (req, res) => {
  try {
    const { bidId, status, projectId } = req.body;

    if (!bidId || !status || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Bid ID, status, and project ID are required",
      });
    }

    // Find the bid
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Verify that the user is the client of the project
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this bid",
      });
    }

    // Update bid status
    bid.status = status;
    await bid.save();

    // Update project status to awarded and set selected bid
    project.status = "awarded";
    project.selectedBidId = bidId;
    await project.save();

    // Reject all other bids for this project
    await Bid.updateMany(
      {
        projectId,
        _id: { $ne: bidId },
        status: "pending",
      },
      { status: "rejected" }
    );

    res.json({
      success: true,
      message: "Bid status updated successfully",
      bid,
      project,
    });
  } catch (error) {
    console.error("Error updating bid status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bid status",
      error: error.message,
    });
  }
});

export default router;
