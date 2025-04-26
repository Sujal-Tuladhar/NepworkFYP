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
      required: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
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
      default: "stripe",
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

// Add validation to ensure either gigId or projectId is present
paymentSchema.pre("save", function (next) {
  if (!this.gigId && !this.projectId) {
    const err = new Error("Either gigId or projectId is required.");
    next(err);
  } else {
    next();
  }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
