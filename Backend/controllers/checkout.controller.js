import { processCheckout } from "../services/checkout.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const checkout = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { addressId, couponCode } = req.body;

  const result = await processCheckout(userId, { addressId, couponCode });

  return res.status(201).json({
    success: true,
    message: "Checkout successful. Order created in PENDING status.",
    order: result,
  });
});
