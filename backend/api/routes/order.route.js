import express, { Router } from "express";
import Order from "../models/order.model.js";
import { validate } from "../middleware/validate.js";
import Gig from "../models/gig.model.js";
import Payment from "../models/payment.model.js";
import Escrow from "../models/escrow.model.js";
import Project from "../models/project.model.js";
import Bid from "../models/bid.model.js";

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

router.get("/getOrder", validate, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ sellerId: req.user._id }, { buyerId: req.user._id }],
    })
      .populate("gigId")
      .populate("sellerId", "username profilePic")
      .populate("buyerId", "username profilePic")
      .populate({
        path: "escrowId",
        select: "status sellerConfirmed buyerConfirmed adminApproved",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

/* GET /api/order/getBidOrders - Get all project orders */
router.get("/getBidOrders", validate, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ sellerId: req.user._id }, { buyerId: req.user._id }],
      projectId: { $exists: true }, // Only get orders with projectId
    })
      .populate("projectId", "title description")
      .populate("sellerId", "username profilePic")
      .populate("buyerId", "username profilePic")
      .populate({
        path: "escrowId",
        select: "status sellerConfirmed buyerConfirmed adminApproved",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching project orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project orders",
      error: error.message,
    });
  }
});

/* POST /api/order/createProjectOrder - Create order for a project */
router.post("/createProjectOrder", validate, async (req, res, next) => {
  try {
    const { projectId, bidId } = req.body;

    // Find the project and bid
    const project = await Project.findById(projectId);
    const bid = await Bid.findById(bidId);

    if (!project || !bid) {
      return res.status(404).json({
        success: false,
        message: "Project or bid not found",
      });
    }

    // Check if user is the project owner
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can create orders",
      });
    }

    // Create order for the project first
    const order = new Order({
      projectId: projectId,
      buyerId: project.clientId,
      sellerId: bid.bidderId,
      price: bid.amount,
      workStatus: false,
      paymentMethod: "stripe",
      isPaid: "pending",
    });

    await order.save();

    // Create escrow for the order
    const escrow = new Escrow({
      orderId: order._id,
      amount: bid.amount,
      status: "holding",
      sellerConfirmed: false,
      buyerConfirmed: false,
      adminApproved: false,
    });
    await escrow.save();

    // Update order with escrow ID
    order.escrowId = escrow._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Project order created successfully",
      data: order,
    });
  } catch (err) {
    console.error("Project order creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create project order",
    });
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

    // Delete associated escrow if it exists
    if (order.escrowId) {
      await Escrow.findByIdAndDelete(order.escrowId);
    }

    // Delete associated payments first
    await Payment.deleteMany({ orderId: orderId });

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: "Order and associated records deleted successfully",
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
