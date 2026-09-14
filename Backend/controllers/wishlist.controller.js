import mongoose from "mongoose";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.userId;

  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    "products",
    "name price images slug isActive avgRating"
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return res.status(200).json({
    success: true,
    wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Idempotent addition with $addToSet
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  ).populate("products", "name price images slug isActive avgRating");

  return res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate("products", "name price images slug isActive avgRating");

  return res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    wishlist,
  });
});
