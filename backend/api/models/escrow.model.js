import mongoose from "mongoose";
const { Schema } = mongoose;

const escrowSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "holding", "waitingToRelease", "released", "refunded"],
      default: "pending", // will be updated to "holding" after payment succeeds
    },
    sellerConfirmed: { type: Boolean, default: false },
    buyerConfirmed: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Escrow = mongoose.model("Escrow", escrowSchema);
export default Escrow;
