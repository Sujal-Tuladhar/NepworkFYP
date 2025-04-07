import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    gigId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId, // Changed from String to ObjectId
      ref: "User", // Reference to User model
      required: true,
    },
    star: {
      type: Number, // Changed from String to Number
      required: true,
      enum: [1, 2, 3, 4, 5],
    },
    desc: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Review = mongoose.model("Review", reviewSchema);
export default Review;
