import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import { validateCoupon } from "../services/coupon.service.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrderAmount, maxUses, expiresAt, isActive } = req.body;

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Coupon with code '${code.toUpperCase()}' already exists`);
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    maxUses: maxUses ? Number(maxUses) : null,
    expiresAt: new Date(expiresAt),
    isActive: isActive !== undefined ? isActive : true,
  });

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon,
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid coupon ID format");
  }

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({
      _id: { $ne: id },
      code: req.body.code.toUpperCase(),
    });
    if (existing) {
      throw new ApiError(409, `Coupon with code '${req.body.code.toUpperCase()}' already exists`);
    }
    coupon.code = req.body.code.toUpperCase();
  }

  const fields = ["type", "value", "minOrderAmount", "maxUses", "expiresAt", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      coupon[f] = req.body[f];
    }
  });

  await coupon.save();

  return res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid coupon ID format");
  }

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

export const validateCouponEndpoint = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || cartTotal === undefined) {
    throw new ApiError(400, "Both 'code' and 'cartTotal' are required");
  }

  const result = await validateCoupon(code, Number(cartTotal));

  return res.status(200).json({
    success: true,
    valid: true,
    code: result.coupon.code,
    discountAmount: result.discountAmount,
    type: result.coupon.type,
    value: result.coupon.value,
  });
});
