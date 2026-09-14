import Category from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("parentCategory", "name slug")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID format");
  }

  const category = await Category.findById(id).populate("parentCategory", "name slug");
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json({
    success: true,
    category,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory, imageUrl } = req.body;

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  if (existing) {
    throw new ApiError(409, `Category with name '${name}' already exists`);
  }

  if (parentCategory) {
    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      throw new ApiError(404, "Parent category not found");
    }
  }

  const category = await Category.create({
    name,
    parentCategory: parentCategory || null,
    imageUrl: imageUrl || "",
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, parentCategory, imageUrl } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID format");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const duplicate = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (duplicate) {
      throw new ApiError(409, `Category with name '${name}' already exists`);
    }
    category.name = name;
  }

  if (parentCategory !== undefined) {
    if (parentCategory === id) {
      throw new ApiError(400, "A category cannot be its own parent");
    }
    if (parentCategory) {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        throw new ApiError(404, "Parent category not found");
      }
    }
    category.parentCategory = parentCategory || null;
  }

  if (imageUrl !== undefined) {
    category.imageUrl = imageUrl;
  }

  await category.save();

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID format");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if child categories exist
  const childCategory = await Category.findOne({ parentCategory: id });
  if (childCategory) {
    throw new ApiError(409, "Cannot delete category that has subcategories attached");
  }

  // Check if products reference this category
  if (mongoose.models.Product) {
    const productCount = await mongoose.models.Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw new ApiError(409, `Cannot delete category: ${productCount} products are assigned to it`);
    }
  }

  await Category.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
