import Stripe from "stripe";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (orderId, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: orderId.toString(),
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

export const handleStripeWebhook = async (event) => {
  try {
    console.log(event.type);
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Update payment record
        await Payment.findOneAndUpdate(
          { orderId },
          {
            status: "success",
            transactionId: paymentIntent.id,
            paymentConfirmation: true,
          }
        );

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          isPaid: "completed",
        });
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        const failedOrderId = failedPaymentIntent.metadata.orderId;

        await Payment.findOneAndUpdate(
          { orderId: failedOrderId },
          {
            status: "failed",
            transactionId: failedPaymentIntent.id,
          }
        );
        break;
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
};
