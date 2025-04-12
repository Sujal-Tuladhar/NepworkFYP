import express, { Router } from "express";
import Order from "../models/order.model.js";
import { validate } from "../middleware/validate.js";
import Gig from "../models/gig.model.js";
import Payment from "../models/payment.model.js";

const router = express.Router();

router.post("/createOrder", validate, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    const newOrder = new Order({
      gigId: gig._id,
      buyerId: req.user._id,
      sellerId: gig.userId,
      escrowId: null,
      price: req.body.price, // Use the price from request body
      workStatus: false,
      paymentMethod: req.body.paymentMethod || "khalti", // Add payment method
      isPaid: req.body.isPaid || "pending", // Should be string
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create order",
    });
  }
});
router.get("/getOrder", validate, async (req, res, next) => {
  try {
    let query = {};

    // If user is a seller, show orders where they are the seller
    if (req.isSeller) {
      query = { sellerId: req.user._id };
    } else {
      // If user is a buyer, show orders where they are the buyer
      query = { buyerId: req.user._id };
    }

    // Find orders based on the query
    const orders = await Order.find(query)
      .populate("gigId", "title shortDesc")
      .populate("buyerId", "username profilePic")
      .populate("sellerId", "username profilePic")
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    next(err);
  }
});

// Delete order endpoint
router.delete("/deleteOrder/:orderId", validate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    // Find the order first to check ownership
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the user is the buyer of the order
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this order",
      });
    }

    // Delete associated payments first
    await Payment.deleteMany({ orderId: orderId });

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: "Order and associated payments deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Update work status endpoint
router.put("/updateWorkStatus/:orderId", validate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { workStatus } = req.body;

    // Find the order first to check ownership
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the user is the seller of the order
    if (order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    // Update the work status
    order.workStatus = workStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Work status updated successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
