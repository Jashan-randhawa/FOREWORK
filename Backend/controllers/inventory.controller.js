import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import { adjustStock } from "../services/inventory.service.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  let inventory = await Inventory.findOne({ product: productId }).populate("product", "name price");
  if (!inventory) {
    // If no inventory record exists yet, initialize one
    inventory = await Inventory.create({
      product: productId,
      stock: 0,
      reserved: 0,
      lowStockThreshold: 5,
    });
  }

  return res.status(200).json({
    success: true,
    inventory: {
      id: inventory._id,
      product: inventory.product,
      stock: inventory.stock,
      reserved: inventory.reserved,
      available: inventory.available,
      lowStockThreshold: inventory.lowStockThreshold,
    },
  });
});

export const updateInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  if (stock === undefined || typeof stock !== "number" || stock < 0) {
    throw new ApiError(400, "Valid non-negative stock number is required");
  }

  const updatedInventory = await adjustStock(productId, stock);

  return res.status(200).json({
    success: true,
    message: "Inventory updated successfully",
    inventory: {
      id: updatedInventory._id,
      product: updatedInventory.product,
      stock: updatedInventory.stock,
      reserved: updatedInventory.reserved,
      available: updatedInventory.available,
      lowStockThreshold: updatedInventory.lowStockThreshold,
    },
  });
});
