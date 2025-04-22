import mongoose from "mongoose";
const { Schema } = mongoose;

const bidSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    proposal: { type: String, required: true }, // cover‑letter text
    deliveryDays: { type: Number, required: true }, // promised lead time
    attachments: [String], // optional files
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn", "expired"],
      default: "pending",
    },
    validUntil: {
      type: Date,
      default: () => Date.now() + 30 * 24 * 3600 * 1000,
    },
    selectedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate active bids from the same freelancer on one project
bidSchema.index({ projectId: 1, bidderId: 1 }, { unique: true });

export default mongoose.model("Bid", bidSchema);
