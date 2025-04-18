import express from "express";
import { validate, verifyAdmin } from "../middleware/validate.js";
import Escrow from "../models/escrow.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Payout from "../models/payout.model.js";

const router = express.Router();

// Update seller work status
// Update seller work status (Modified)
router.put("/update-seller-status/:orderId", validate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sellerWorkStatus } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure that payment is completed before updating work status
    if (order.isPaid !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not completed. Please complete payment before updating work status.",
      });
    }

    // Verify that the user is the seller
    if (order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    // Update order work status
    await Order.findByIdAndUpdate(orderId, {
      sellerWorkStatus,
      orderStatus: sellerWorkStatus ? "inProgress" : "pending",
    });

    // Find the existing escrow record
    const escrow = await Escrow.findOne({ orderId });
    if (!escrow) {
      return res.status(400).json({
        success: false,
        message: "Escrow record not found for this order",
      });
    }

    // Update escrow status based on both parties' confirmation
    if (sellerWorkStatus && order.buyerWorkStatus) {
      await Escrow.findByIdAndUpdate(escrow._id, {
        status: "waitingToRelease",
        sellerConfirmed: true,
        buyerConfirmed: true,
      });
    } else if (sellerWorkStatus) {
      await Escrow.findByIdAndUpdate(escrow._id, {
        sellerConfirmed: true,
      });
    }

    res.json({
      success: true,
      message: "Seller work status updated successfully",
    });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update seller status",
      error: error.message,
    });
  }
});

// Update buyer work status
router.put("/update-buyer-status/:orderId", validate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { buyerWorkStatus } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify that the user is the buyer
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      buyerWorkStatus,
      orderStatus: buyerWorkStatus ? "inProgress" : "pending",
    });

    // Find the existing escrow record
    const escrow = await Escrow.findOne({ orderId });
    if (!escrow) {
      return res.status(400).json({
        success: false,
        message: "Escrow record not found for this order",
      });
    }

    // Update escrow status based on both parties' confirmation
    if (buyerWorkStatus && order.sellerWorkStatus) {
      await Escrow.findByIdAndUpdate(escrow._id, {
        status: "waitingToRelease",
        sellerConfirmed: true,
        buyerConfirmed: true,
      });
    } else if (buyerWorkStatus) {
      await Escrow.findByIdAndUpdate(escrow._id, {
        buyerConfirmed: true,
      });
    }

    res.json({
      success: true,
      message: "Buyer work status updated successfully",
    });
  } catch (error) {
    console.error("Error updating buyer status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update buyer status",
      error: error.message,
    });
  }
});

// Admin release escrow
router.post("/release/:escrowId", verifyAdmin, async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Find the escrow and populate necessary fields
    const escrow = await Escrow.findById(escrowId)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'sellerId', select: 'username email' },
          { path: 'buyerId', select: 'username email' }
        ]
      });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    if (escrow.status !== "waitingToRelease") {
      return res.status(400).json({
        success: false,
        message: "Escrow is not in waitingToRelease state",
      });
    }

    // Update escrow status and add release information
    const updatedEscrow = await Escrow.findByIdAndUpdate(
      escrowId,
      {
        status: "released",
        releasedAt: new Date(),
        releasedBy: req.userId
      },
      { new: true }
    );

    // Update order status
    await Order.findByIdAndUpdate(escrow.orderId._id, {
      orderStatus: "completed"
    });

    res.json({
      success: true,
      message: "Escrow released successfully",
      escrow: updatedEscrow
    });
  } catch (error) {
    console.error("Error releasing escrow:", error);
    res.status(500).json({
      success: false,
      message: "Failed to release escrow",
      error: error.message,
    });
  }
});

// Get all escrow orders waiting for release
router.get("/waiting-for-release", verifyAdmin, async (req, res) => {
  try {
    const escrows = await Escrow.find({ status: "waitingToRelease" })
      .populate({
        path: "orderId",
        populate: [
          {
            path: "sellerId",
            select: "username email profilePic"
          },
          {
            path: "buyerId",
            select: "username email profilePic"
          },
          {
            path: "gigId",
            select: "title price"
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json(escrows);
  } catch (err) {
    console.error("Error fetching escrows:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get payout history
router.get("/payouts", verifyAdmin, async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate("orderId")
      .populate("sellerId", "username email")
      .populate("buyerId", "username email")
      .populate("releasedBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(payouts);
  } catch (err) {
    console.error("Error fetching payouts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get escrow records waiting for release
router.get("/waiting-for-release", verifyAdmin, async (req, res) => {
  try {
    // Find escrow records with status "waitingToRelease"
    const escrowRecords = await Escrow.find({ status: "waitingToRelease" })
      .populate({
        path: "orderId",
        select: "gigId buyerId sellerId price",
        populate: [
          {
            path: "gigId",
            select: "title",
          },
          {
            path: "buyerId",
            select: "username profilePic",
          },
          {
            path: "sellerId",
            select: "username profilePic",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: escrowRecords,
    });
  } catch (error) {
    console.error("Error fetching escrow records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch escrow records",
      error: error.message,
    });
  }
});

export default router;
