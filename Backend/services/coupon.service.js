import Coupon from "../models/coupon.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Validates a coupon code against the cart total and returns discount amount.
 */
export const validateCoupon = async (code, cartTotal) => {
  if (!code || typeof code !== "string") {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "Coupon is currently inactive");
  }

  if (new Date() > new Date(coupon.expiresAt)) {
    throw new ApiError(400, "Coupon code has expired");
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, "Coupon usage limit has been reached");
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Order amount (${cartTotal}) does not meet the minimum requirement of ${coupon.minOrderAmount}`
    );
  }

  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.round((cartTotal * coupon.value) / 100);
  } else if (coupon.type === "fixed") {
    discountAmount = Math.min(coupon.value, cartTotal);
  }

  return {
    valid: true,
    coupon,
    discountAmount,
  };
};

export default {
  validateCoupon,
};
