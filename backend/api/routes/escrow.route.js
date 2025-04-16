import express from "express";
import { validate } from "../middleware/validate.js";
import Escrow from "../models/escrow.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

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
router.put("/release/:escrowId", validate, async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Verify that the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admin can release escrow",
      });
    }

    // Find and update escrow
    const escrow = await Escrow.findById(escrowId);
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

    // Update escrow status
    await Escrow.findByIdAndUpdate(escrowId, {
      status: "released",
      adminApproved: true,
    });

    // Update order status
    await Order.findOneAndUpdate({ escrowId }, { orderStatus: "completed" });

    res.json({
      success: true,
      message: "Escrow released successfully",
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

export default router;
