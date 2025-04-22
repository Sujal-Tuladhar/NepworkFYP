import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    category: { type: String, required: true },
    expectedDurationDays: { type: Number, required: true },
    attachments: [String], // optional file URLs
    status: {
      type: String,
      enum: ["open", "awarded", "inProgress", "completed", "cancelled"],
      default: "open",
    },
    selectedBidId: { type: Schema.Types.ObjectId, ref: "Bid" },
    expiryDate: { type: Date, required: true }, // New field for bid expiry
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
