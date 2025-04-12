import mongoose from "mongoose";
const { Schema } = mongoose;
const escrowSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Not_Initiated", "holding", "released", "refunded"],
      default: "Not_Initiated",
    },
  },
  { timestamps: true }
);
const Escrow = mongoose.model("Escrow", escrowSchema);
export default Escrow;
