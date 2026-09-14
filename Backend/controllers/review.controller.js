import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Number(stats[0].avgRating.toFixed(1)),
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      avgRating: 0,
      reviewCount: 0,
    });
  }
};

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { orderId, rating, comment } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid product or order ID format");
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Referenced order not found");
  }

  // 1. Verify purchaser ownership
  if (order.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You can only review products from your own orders");
  }

  // 2. Verify order delivery status
  if (!["DELIVERED", "COMPLETED"].includes(order.status)) {
    throw new ApiError(
      400,
      `Cannot review product. Order status is '${order.status}'. Only delivered orders can be reviewed.`
    );
  }

  // 3. Verify order actually contained this product
  const purchasedItem = order.items.find(
    (item) => item.product.toString() === productId
  );
  if (!purchasedItem) {
    throw new ApiError(400, "This product was not part of the specified order");
  }

  // 4. Verify no duplicate review already submitted
  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
    order: orderId,
  });
  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product for this order");
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    order: orderId,
    rating: numericRating,
    comment: comment ? comment.trim() : "",
  });

  // Recompute denormalized stats
  await updateProductRatingStats(productId);

  return res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    review,
  });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "fullname profile.avatarUrl")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Only review author or Admin can delete
  if (role !== "Admin" && review.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You cannot delete another user's review");
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  // Recompute denormalized stats
  await updateProductRatingStats(productId);

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
