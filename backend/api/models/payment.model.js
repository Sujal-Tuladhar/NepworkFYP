import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
    },
    pidx: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dataFromVerificationReq: {
      type: Object,
    },
    apiQueryFromUser: {
      type: Object,
    },
    paymentGateway: {
      type: String,
      enum: ["khalti", "stripe"],
      default: "khalti", // Khalti is set as the default payment gateway
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentConfirmation: {
      type: Boolean,
      default: false, // To track if the payment has been confirmed or processed
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
