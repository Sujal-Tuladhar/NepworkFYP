import express from "express";
const router = express.Router();
import { validate } from "../middleware/validate.js";
import {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
} from "../utils/khalti.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Gig from "../models/gig.model.js";

// Initialize Khalti payment
router.post("/initialize-khalti", validate, async (req, res) => {
  try {
    const { orderId, website_url } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify that the user is the buyer of the order
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order",
      });
    }

    // Find the gig
    const gig = await Gig.findById(order.gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Create a payment record
    const payment = await Payment.create({
      orderId: order._id,
      gigId: order.gigId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: order.price,
      paymentGateway: "khalti",
      status: "pending",
    });

    // Initialize Khalti payment
    const paymentInitiate = await initializeKhaltiPayment({
      amount: order.price * 100, // amount should be in paisa (Rs * 100)
      purchase_order_id: payment._id.toString(), // use payment ID as purchase_order_id
      purchase_order_name: gig.title,
      return_url: `${process.env.BACKEND_URI}payment/complete-khalti-payment`,
      // it can be even managed from frontend
      website_url,
    });

    // Update payment with pidx
    await Payment.findByIdAndUpdate(payment._id, {
      pidx: paymentInitiate.pidx,
      apiQueryFromUser: req.body,
    });

    res.json({
      success: true,
      payment,
      paymentInitiate,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
});

// it is our `return url` where we verify the payment done by user
router.get("/complete-khalti-payment", async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query;

  try {
    // Verify the payment with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete information",
        paymentInfo,
      });
    }

    // Find the payment by pidx
    const payment = await Payment.findOne({ pidx });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Update payment record
    await Payment.findByIdAndUpdate(payment._id, {
      status: "success",
      transactionId: transaction_id,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentConfirmation: true,
    });

    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, {
      isPaid: "completed",
    });

    // Send success response
    res.json({
      success: true,
      message: "Payment Successful",
      payment,
    });
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
});

export default router;
