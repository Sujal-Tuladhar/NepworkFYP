import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budgetMin: Number,
    budgetMax: Number,
    category: String,
    attachments: [String], // optional file URLs
    status: {
      type: String,
      enum: ["open", "awarded", "inProgress", "completed", "cancelled"],
      default: "open",
    },
    selectedBidId: { type: Schema.Types.ObjectId, ref: "Bid" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);