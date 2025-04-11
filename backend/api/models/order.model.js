import mongoose from "mongoose";
const { Schema } = mongoose;
const orderSchema = new Schema(
  {
    gigId: { type: Schema.Types.ObjectId, ref: "Gig", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    escrowId: { type: Schema.Types.ObjectId, ref: "Escrow", required: false },
    price: { type: Number, required: true },
    workStatus: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["khalti"], required: true },
    isPaid: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
