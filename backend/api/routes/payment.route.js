import express from "express";
const router = express.Router();
import { validate } from "../middleware/validate.js";
import {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
} from "../utils/khalti.js";
import {
  createStripePaymentIntent,
  handleStripeWebhook,
} from "../utils/stripe.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Gig from "../models/gig.model.js";
import Stripe from "stripe";
import Escrow from "../models/escrow.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// Complete Khalti payment
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

    // Create escrow record
    const escrow = await Escrow.create({
      orderId: payment.orderId,
      amount: payment.amount,
      status: "holding",
    });

    // Update order with escrow ID and payment status
    await Order.findByIdAndUpdate(payment.orderId, {
      isPaid: "completed",
      escrowId: escrow._id,
      orderStatus: "pending",
    });

    // Redirect to frontend success page
    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?pidx=${pidx}&transaction_id=${transaction_id}`
    );
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
});

// Verify Khalti payment
router.post("/verify-khalti", validate, async (req, res) => {
  try {
    const { pidx, transactionId } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    // Find the payment record
    const payment = await Payment.findOne({ pidx });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is already confirmed, return success
    if (payment.status === "success" && payment.paymentConfirmation) {
      return res.json({
        success: true,
        status: "success",
        payment,
      });
    }

    // Verify with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    if (paymentInfo?.status === "Completed") {
      // Update payment record
      await Payment.findByIdAndUpdate(payment._id, {
        status: "success",
        transactionId: transactionId,
        dataFromVerificationReq: paymentInfo,
        paymentConfirmation: true,
      });

      // Update order status
      await Order.findByIdAndUpdate(payment.orderId, {
        isPaid: "completed",
      });

      return res.json({
        success: true,
        status: "success",
        payment: {
          ...payment.toObject(),
          status: "success",
          paymentConfirmation: true,
        },
      });
    }

    return res.json({
      success: true,
      status: "pending",
      payment,
      message: "Payment is still processing",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
});

// Initialize Stripe payment
router.post("/initialize-stripe", validate, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

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
      paymentGateway: "stripe",
      status: "pending",
    });

    try {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.price * 100), // Convert to cents
        currency: "usd",
        metadata: {
          paymentId: payment._id.toString(),
          orderId: order._id.toString(),
        },
      });

      // Update payment with payment intent ID
      await Payment.findByIdAndUpdate(payment._id, {
        transactionId: paymentIntent.id,
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        payment,
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      // Update payment status to failed
      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
      });

      throw stripeError;
    }
  } catch (error) {
    console.error("Error initializing Stripe payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
});

// Verify Stripe payment
router.post("/verify-stripe", validate, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the payment record by transactionId
    const payment = await Payment.findOne({ transactionId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Handle different payment intent statuses
    switch (paymentIntent.status) {
      case "succeeded":
        // Update payment status
        await Payment.findByIdAndUpdate(payment._id, {
          status: "success",
          paymentConfirmation: true,
        });

        // Create escrow record
        const escrow = await Escrow.create({
          orderId: payment.orderId,
          amount: payment.amount,
          status: "holding",
        });

        // Update order status with escrow ID
        await Order.findByIdAndUpdate(payment.orderId, {
          isPaid: "completed",
          escrowId: escrow._id,
          orderStatus: "pending",
        });

        return res.json({
          success: true,
          status: "succeeded",
          payment: {
            ...payment.toObject(),
            status: "success",
            paymentConfirmation: true,
          },
        });

      case "processing":
        return res.json({
          success: true,
          status: "pending",
          payment,
          message: "Payment is still processing",
        });

      case "requires_payment_method":
      case "canceled":
        await Payment.findByIdAndUpdate(payment._id, {
          status: "failed",
        });

        return res.json({
          success: true,
          status: "failed",
          payment: {
            ...payment.toObject(),
            status: "failed",
          },
          message: "Payment failed or was canceled",
        });

      default:
        return res.json({
          success: true,
          status: "pending",
          payment,
          message: "Payment status unknown",
        });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
});

// Verify payment status
router.get("/verify/:paymentId", validate, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    // Find the payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is already confirmed, return success
    if (payment.status === "success" && payment.paymentConfirmation) {
      return res.json({
        success: true,
        status: "succeeded",
        payment,
      });
    }

    // For Stripe payments, verify with Stripe
    if (payment.paymentGateway === "stripe") {
      try {
        // Get the payment intent ID from the payment record
        const paymentIntentId = payment.transactionId;
        if (!paymentIntentId) {
          return res.json({
            success: true,
            status: "pending",
            payment,
            message: "Payment intent not found, waiting for webhook",
          });
        }

        // Retrieve the payment intent from Stripe
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);

        // Handle different payment intent statuses
        switch (paymentIntent.status) {
          case "succeeded":
            // Update payment status
            await Payment.findByIdAndUpdate(paymentId, {
              status: "success",
              paymentConfirmation: true,
            });

            // Create escrow record
            const escrow = await Escrow.create({
              orderId: payment.orderId,
              amount: payment.amount,
              status: "holding",
            });

            // Update order status with escrow ID
            await Order.findByIdAndUpdate(payment.orderId, {
              isPaid: "completed",
              escrowId: escrow._id,
              orderStatus: "pending",
            });

            return res.json({
              success: true,
              status: "succeeded",
              payment: {
                ...payment.toObject(),
                status: "success",
                paymentConfirmation: true,
              },
            });

          case "processing":
            return res.json({
              success: true,
              status: "pending",
              payment,
              message: "Payment is still processing",
            });

          case "requires_payment_method":
          case "canceled":
            return res.json({
              success: true,
              status: "failed",
              payment,
              message: "Payment failed or was canceled",
            });

          default:
            return res.json({
              success: true,
              status: "pending",
              payment,
              message: "Payment status unknown",
            });
        }
      } catch (stripeError) {
        console.error("Stripe verification error:", stripeError);
        // If there's a Stripe error, return the current payment status
        return res.json({
          success: true,
          status: payment.status,
          payment,
          message: "Error verifying with Stripe, using current status",
        });
      }
    }

    // For other payment gateways, return current status
    return res.json({
      success: true,
      status: payment.status,
      payment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
});

export default router;
