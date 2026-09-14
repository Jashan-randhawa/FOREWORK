import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Inventory from "../models/inventory.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../utils/cloud.js";
import getDataUri from "../utils/datauri.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort = "latest",
  } = req.query;

  const query = { isActive: true };

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = category;
  }

  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  let sortOptions = { createdAt: -1 };
  if (sort === "price_asc") sortOptions = { price: 1 };
  if (sort === "price_desc") sortOptions = { price: -1 };
  if (sort === "rating") sortOptions = { avgRating: -1, reviewCount: -1 };

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.max(1, Math.min(100, Number(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit),
    Product.countDocuments(query),
  ]);

  const pages = Math.ceil(total / parsedLimit) || 1;

  return res.status(200).json({
    success: true,
    items,
    total,
    page: parsedPage,
    pages,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const inventory = await Inventory.findOne({ product: product._id });
  const availableStock = inventory ? Math.max(0, inventory.stock - inventory.reserved) : 0;

  return res.status(200).json({
    success: true,
    product,
    inStock: availableStock > 0,
    availableStock,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, attributes } = req.body;
  let images = req.body.images || [];

  // If files were uploaded via multipart form
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "forework/products",
      });
      images.push(cloudResponse.secure_url);
    }
  }

  if (typeof images === "string") {
    images = [images];
  }

  if (!images || images.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new ApiError(404, "Referenced category not found");
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    images,
    brand: brand || "",
    attributes: attributes || {},
    createdBy: req.userId,
    isActive: true,
  });

  // Ensure inventory record exists
  await Inventory.findOneAndUpdate(
    { product: product._id },
    { $setOnInsert: { product: product._id, stock: 0, reserved: 0, lowStockThreshold: 5 } },
    { upsert: true, new: true }
  );

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const allowedUpdates = [
    "name",
    "description",
    "price",
    "category",
    "brand",
    "attributes",
    "isActive",
  ];

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      product[key] = req.body[key];
    }
  }

  if (req.body.category) {
    const categoryDoc = await Category.findById(req.body.category);
    if (!categoryDoc) {
      throw new ApiError(404, "Referenced category not found");
    }
  }

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Soft delete per blueprint requirements to preserve order history
  product.isActive = false;
  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product deactivated successfully",
  });
});
