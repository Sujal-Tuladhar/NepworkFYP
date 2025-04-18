import mongoose from "mongoose";
const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    escrowId: {
      type: Schema.Types.ObjectId,
      ref: "Escrow",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    releasedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payout = mongoose.model("Payout", payoutSchema);
export default Payout; 