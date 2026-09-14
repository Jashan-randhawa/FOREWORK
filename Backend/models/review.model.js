import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for a review"],
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required for a review"],
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required to verify purchase"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating between 1 and 5 is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per purchase
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
export default Review;
