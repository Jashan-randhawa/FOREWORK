import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { checkAvailability } from "../services/inventory.service.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.userId;

  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price images isActive slug"
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Calculate cart subtotal based on current product prices
  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price || item.priceSnapshot;
    return acc + price * item.quantity;
  }, 0);

  return res.status(200).json({
    success: true,
    cart,
    subtotal,
  });
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found or is no longer active");
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  const existingQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
  const totalDesiredQty = existingQty + Number(quantity);

  // Soft stock check
  const { available, availableUnits } = await checkAvailability(productId, totalDesiredQty);
  if (!available) {
    throw new ApiError(
      400,
      `Cannot add ${quantity} item(s). Only ${availableUnits} available in stock.`
    );
  }

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = totalDesiredQty;
    cart.items[existingItemIndex].priceSnapshot = product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      priceSnapshot: product.price,
    });
  }

  await cart.save();
  await cart.populate("items.product", "name price images isActive slug");

  return res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product is not in the cart");
  }

  const targetQty = Number(quantity);

  if (targetQty <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const { available, availableUnits } = await checkAvailability(productId, targetQty);
    if (!available) {
      throw new ApiError(
        400,
        `Cannot update quantity to ${targetQty}. Only ${availableUnits} available in stock.`
      );
    }
    cart.items[itemIndex].quantity = targetQty;
  }

  await cart.save();
  await cart.populate("items.product", "name price images isActive slug");

  return res.status(200).json({
    success: true,
    message: "Cart item updated",
    cart,
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const originalLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  if (cart.items.length === originalLength) {
    throw new ApiError(404, "Product was not found in cart");
  }

  await cart.save();
  await cart.populate("items.product", "name price images isActive slug");

  return res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.userId;

  let cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});
