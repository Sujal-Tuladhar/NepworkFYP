import express from "express";
import { verifyAdmin } from "../middleware/validate.js";
import User from "../models/user.model.js";
import Gig from "../models/gig.model.js";
import Order from "../models/order.model.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalGigs,
      totalOrders,
      totalRevenue,
      recentUsers,
      recentOrders
    ] = await Promise.all([
      User.countDocuments(),
      Gig.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("buyerId", "username email")
    ]);

    res.status(200).json({
      totalUsers,
      totalGigs,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentUsers,
      recentOrders
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users with pagination
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      users,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all gigs with pagination
router.get("/gigs", verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const [gigs, total] = await Promise.all([
      Gig.find(query)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Gig.countDocuments(query)
    ]);

    res.status(200).json({
      gigs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error("Error fetching gigs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all orders with pagination
router.get("/orders", verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("buyerId", "username email")
        .populate("gigId", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      orders,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user status (ban/unban)
router.put("/users/:userId/status", verifyAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned },
      { new: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update gig status (approve/reject)
router.put("/gigs/:gigId/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const gig = await Gig.findByIdAndUpdate(
      req.params.gigId,
      { status },
      { new: true }
    ).populate("userId", "username email");
    res.status(200).json(gig);
  } catch (err) {
    console.error("Error updating gig status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
